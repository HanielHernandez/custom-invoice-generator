import { onRequest } from 'firebase-functions/v2/https'
import { onDocumentCreated } from 'firebase-functions/v2/firestore'
import { defineSecret, defineString } from 'firebase-functions/params'
import { initializeApp, getApps } from 'firebase-admin/app'
import { getAuth, type DecodedIdToken } from 'firebase-admin/auth'
import { getFirestore, type Transaction } from 'firebase-admin/firestore'
import Stripe from 'stripe'

// Initialize Firebase Admin if not already initialized
if (!getApps().length) {
    initializeApp()
}

const stripeApiKey = defineSecret('STRIPE_API_KEY')
const stripeWebhookSecret = defineSecret('STRIPE_WEBHOOK_SECRET')
const appUrl = defineString('APP_URL')

type UserUsage = {
    featureId: string
    used: number
    limit: number
}

const buildUsage = (features: unknown): UserUsage[] => {
    if (!Array.isArray(features)) return []

    const usage: UserUsage[] = []
    for (const feature of features) {
        if (!feature || typeof feature !== 'object') continue

        const { id, value } = feature as { id?: unknown; value?: unknown }
        const featureId = typeof id === 'string' ? id.trim() : ''
        const limit = Number(value)

        if (featureId && Number.isInteger(limit)) {
            usage.push({ featureId, used: 0, limit })
        }
    }
    return usage
}

const updateUsageLimits = (features: unknown, currentUsage: unknown): UserUsage[] => {
    const planUsage = buildUsage(features)
    const existingUsage = Array.isArray(currentUsage)
        ? (currentUsage as UserUsage[])
        : []
    const limitsByFeature = new Map(
        planUsage.map((usage) => [usage.featureId, usage.limit])
    )

    const updatedUsage = existingUsage.map((usage) => ({
        ...usage,
        limit: limitsByFeature.get(usage.featureId) ?? usage.limit
    }))
    const existingFeatureIds = new Set(
        existingUsage.map((usage) => usage.featureId)
    )

    for (const usage of planUsage) {
        if (!existingFeatureIds.has(usage.featureId)) {
            updatedUsage.push(usage)
        }
    }

    return updatedUsage
}

const stripeResourceId = (resource: string | { id: string } | null) =>
    typeof resource === 'string' ? resource : resource?.id ?? null

const updateProfilePlan = async (
    transaction: Transaction,
    uid: string,
    planId: string
) => {
    const db = getFirestore()
    const planRef = db.collection('plans').doc(planId)
    const profileRef = db.collection('profiles').doc(uid)
    const [planSnap, profileSnap] = await Promise.all([
        transaction.get(planRef),
        transaction.get(profileRef)
    ])

    if (!planSnap.exists) throw new Error(`Plan ${planId} was not found.`)
    if (!profileSnap.exists) throw new Error(`Profile ${uid} was not found.`)

    transaction.update(profileRef, {
        planId: planSnap.id,
        usage: updateUsageLimits(
            planSnap.data()?.features,
            profileSnap.data()?.usage
        ),
        updatedAt: Date.now()
    })
}

const processStripeEventOnce = async (
    event: Stripe.Event,
    handler: (transaction: Transaction) => Promise<void>
) => {
    const db = getFirestore()
    const eventRef = db.collection('_stripeEvents').doc(event.id)

    await db.runTransaction(async (transaction) => {
        const eventSnap = await transaction.get(eventRef)
        if (eventSnap.exists) return

        await handler(transaction)
        transaction.create(eventRef, {
            type: event.type,
            createdAt: Date.now()
        })
    })
}

const resolveStripeCustomerUid = async (
    transaction: Transaction,
    customer: string | Stripe.Customer | Stripe.DeletedCustomer | null
) => {
    const customerId = stripeResourceId(customer)
    if (!customerId) return null

    const customerSnap = await transaction.get(
        getFirestore().collection('stripe_customers').doc(customerId)
    )
    const uid = customerSnap.data()?.uid
    return typeof uid === 'string' && uid ? uid : null
}

const handleCheckoutCompleted = async (
    event: Stripe.Event,
    session: Stripe.Checkout.Session
) => {
    const uid = session.metadata?.uid
    const planId = session.metadata?.planId
    if (!uid || !planId) {
        throw new Error(`Checkout session ${session.id} is missing uid or planId metadata.`)
    }

    await processStripeEventOnce(event, async (transaction) => {
        await updateProfilePlan(transaction, uid, planId)

        const db = getFirestore()
        const customerId = stripeResourceId(session.customer)
        const subscriptionId = stripeResourceId(session.subscription)

        if (customerId) {
            transaction.set(db.collection('stripe_customers').doc(customerId), {
                uid,
                updatedAt: Date.now()
            })
        }

        if (subscriptionId) {
            transaction.set(db.collection('stripe_subscriptions').doc(subscriptionId), {
                uid,
                planId,
                customerId,
                status: 'active',
                updatedAt: Date.now()
            })
        }
    })
}

const handleSubscriptionInvoice = async (
    event: Stripe.Event,
    invoice: Stripe.Invoice,
    status: 'paid' | 'payment_failed'
) => {
    await processStripeEventOnce(event, async (transaction) => {
        const subscriptionDetails = invoice.parent?.subscription_details
        const uid =
            invoice.metadata?.uid ??
            subscriptionDetails?.metadata?.uid ??
            (await resolveStripeCustomerUid(transaction, invoice.customer))

        if (!uid) {
            throw new Error(`Unable to resolve a profile for Stripe invoice ${invoice.id}.`)
        }

        transaction.set(
            getFirestore().collection('subscription_invoices').doc(invoice.id),
            {
                uid,
                stripeInvoiceId: invoice.id,
                customerId: stripeResourceId(invoice.customer),
                subscriptionId: stripeResourceId(subscriptionDetails?.subscription ?? null),
                status,
                amountDue: invoice.amount_due,
                amountPaid: invoice.amount_paid,
                currency: invoice.currency,
                hostedInvoiceUrl: invoice.hosted_invoice_url,
                invoicePdf: invoice.invoice_pdf,
                invoiceCreatedAt: invoice.created * 1000,
                updatedAt: Date.now()
            },
            { merge: true }
        )
    })
}

const handleSubscriptionDeleted = async (
    event: Stripe.Event,
    subscription: Stripe.Subscription
) => {
    await processStripeEventOnce(event, async (transaction) => {
        const uid =
            subscription.metadata.uid ??
            (await resolveStripeCustomerUid(transaction, subscription.customer))

        if (!uid) {
            throw new Error(`Unable to resolve a profile for subscription ${subscription.id}.`)
        }

        await updateProfilePlan(transaction, uid, 'free')
        transaction.set(
            getFirestore().collection('stripe_subscriptions').doc(subscription.id),
            {
                uid,
                status: 'deleted',
                deletedAt: Date.now()
            },
            { merge: true }
        )
    })
}

type UsageSource = {
    uid?: unknown
    companyId?: unknown
    company?: {
        id?: unknown
        uuid?: unknown
    }
}

const resolveProfileUid = async (data: UsageSource) => {
    const db = getFirestore()
    const companyId =
        typeof data.companyId === 'string'
            ? data.companyId
            : typeof data.company?.id === 'string'
              ? data.company.id
              : ''

    if (companyId) {
        const companySnap = await db.collection('companies').doc(companyId).get()
        const companyUid = companySnap.data()?.uuid
        if (typeof companyUid === 'string' && companyUid) return companyUid
    }

    const documentUid =
        typeof data.uid === 'string'
            ? data.uid
            : typeof data.company?.uuid === 'string'
              ? data.company.uuid
              : ''

    if (!documentUid) return null

    const companySnap = await db
        .collection('companies')
        .where('uuid', '==', documentUid)
        .limit(1)
        .get()

    if (!companySnap.empty) {
        const companyUid = companySnap.docs[0].data().uuid
        if (typeof companyUid === 'string' && companyUid) return companyUid
    }

    return documentUid
}

const incrementFeatureUsage = async (
    data: UsageSource,
    featureId: 'invoices' | 'clients',
    eventId: string
) => {
    const uid = await resolveProfileUid(data)
    if (!uid) {
        console.warn(`Unable to resolve a profile uid for ${featureId} usage event ${eventId}`)
        return
    }

    const db = getFirestore()
    const profileRef = db.collection('profiles').doc(uid)
    const eventRef = db.collection('_usageEvents').doc(eventId.replace(/\//g, '_'))

    await db.runTransaction(async (transaction) => {
        const eventSnap = await transaction.get(eventRef)
        if (eventSnap.exists) return

        const profileSnap = await transaction.get(profileRef)
        if (!profileSnap.exists) {
            console.warn(`Profile ${uid} was not found for ${featureId} usage event ${eventId}`)
            return
        }

        const rawUsage = profileSnap.data()?.usage
        const usage = Array.isArray(rawUsage) ? (rawUsage as UserUsage[]) : []
        const featureExists = usage.some((item) => item.featureId === featureId)

        if (!featureExists) {
            console.warn(`Profile ${uid} does not contain the ${featureId} usage feature`)
            return
        }

        const updatedUsage = usage.map((item) =>
            item.featureId === featureId
                ? { ...item, used: Math.max(0, Number(item.used) || 0) + 1 }
                : item
        )

        transaction.update(profileRef, { usage: updatedUsage })
        transaction.create(eventRef, {
            uid,
            featureId,
            sourceEventId: eventId,
            createdAt: Date.now()
        })
    })
}

export const trackInvoiceUsage = onDocumentCreated('invoices/{invoiceId}', async (event) => {
    const invoiceSnap = event.data
    if (!invoiceSnap) return

    await incrementFeatureUsage(invoiceSnap.data() as UsageSource, 'invoices', event.id)
})

export const trackClientUsage = onDocumentCreated('clients/{clientId}', async (event) => {
    const clientSnap = event.data
    if (!clientSnap) return

    await incrementFeatureUsage(clientSnap.data() as UsageSource, 'clients', event.id)
})

export const createStripeCheckoutSession = onRequest(
    { cors: true, secrets: [stripeApiKey] },
    async (req, res) => {
        if (req.method !== 'POST') {
            res.status(405).send('Method Not Allowed')
            return
        }

        const authorization = req.headers.authorization
        if (!authorization?.startsWith('Bearer ')) {
            res.status(401).json({ error: 'Missing Firebase ID token.' })
            return
        }

        let decodedToken: DecodedIdToken
        try {
            decodedToken = await getAuth().verifyIdToken(authorization.slice(7))
        } catch (error) {
            console.error('Invalid Firebase ID token:', error)
            res.status(401).json({ error: 'Invalid Firebase ID token.' })
            return
        }

        const { planId, userProfile } = req.body as {
            planId?: unknown
            userProfile?: { uid?: unknown; email?: unknown }
        }

        if (typeof planId !== 'string' || !planId.trim()) {
            res.status(400).json({ error: 'A valid planId is required.' })
            return
        }

        if (
            !userProfile ||
            typeof userProfile.uid !== 'string' ||
            userProfile.uid !== decodedToken.uid
        ) {
            res.status(403).json({ error: 'The submitted profile does not match the current user.' })
            return
        }

        try {
            const db = getFirestore()
            const [planSnap, profileSnap] = await Promise.all([
                db.collection('plans').doc(planId.trim()).get(),
                db.collection('profiles').doc(decodedToken.uid).get()
            ])

            if (!planSnap.exists) {
                res.status(404).json({ error: 'Plan not found.' })
                return
            }

            if (!profileSnap.exists) {
                res.status(404).json({ error: 'User profile not found.' })
                return
            }

            const plan = planSnap.data()
            const profile = profileSnap.data()
            const stripePriceId = plan?.stripePriceId
            const customerEmail = profile?.email ?? decodedToken.email

            if (plan?.isFree || typeof stripePriceId !== 'string' || !stripePriceId) {
                res.status(400).json({ error: 'This plan cannot be purchased.' })
                return
            }

            if (typeof customerEmail !== 'string' || !customerEmail) {
                res.status(400).json({ error: 'The user profile does not have an email address.' })
                return
            }

            const checkoutAppUrl = appUrl.value().replace(/\/+$/, '')
            if (!checkoutAppUrl) {
                console.error('APP_URL is not configured.')
                res.status(500).json({ error: 'Checkout is not configured.' })
                return
            }

            const stripe = new Stripe(stripeApiKey.value())
            const session = await stripe.checkout.sessions.create({
                mode: 'subscription',
                customer_email: customerEmail,
                line_items: [
                    {
                        price: stripePriceId,
                        quantity: 1
                    }
                ],
                success_url: `${checkoutAppUrl}/dashboard/billing?checkout=success`,
                cancel_url: `${checkoutAppUrl}/dashboard/billing?checkout=cancelled`,
                metadata: {
                    uid: decodedToken.uid,
                    planId: planSnap.id
                },
                subscription_data: {
                    metadata: {
                        uid: decodedToken.uid,
                        planId: planSnap.id
                    }
                }
            })

            if (!session.url) {
                throw new Error(`Stripe session ${session.id} did not return a checkout URL.`)
            }

            res.status(201).json({ url: session.url })
        } catch (error) {
            console.error('Error creating Stripe Checkout session:', error)
            res.status(500).json({ error: 'Unable to create checkout session.' })
        }
    }
)

export const stripeWebhook = onRequest(
    { cors: false, secrets: [stripeApiKey, stripeWebhookSecret] },
    async (req, res) => {
        if (req.method !== 'POST') {
            res.status(405).send('Method Not Allowed')
            return
        }

        const signature = req.headers['stripe-signature']
        if (typeof signature !== 'string') {
            res.status(400).send('Missing Stripe signature.')
            return
        }

        let event: Stripe.Event
        try {
            const stripe = new Stripe(stripeApiKey.value())
            event = stripe.webhooks.constructEvent(
                req.rawBody,
                signature,
                stripeWebhookSecret.value()
            )
        } catch (error) {
            console.error('Stripe webhook signature verification failed:', error)
            res.status(400).send('Invalid Stripe signature.')
            return
        }

        try {
            switch (event.type) {
                case 'checkout.session.completed':
                    await handleCheckoutCompleted(event, event.data.object)
                    break
                case 'invoice.paid':
                    await handleSubscriptionInvoice(event, event.data.object, 'paid')
                    break
                case 'invoice.payment_failed':
                    await handleSubscriptionInvoice(event, event.data.object, 'payment_failed')
                    break
                case 'customer.subscription.deleted':
                    await handleSubscriptionDeleted(event, event.data.object)
                    break
                default:
                    console.log(`Unhandled Stripe event type: ${event.type}`)
            }

            res.status(200).json({ received: true })
        } catch (error) {
            console.error(`Failed to process Stripe event ${event.id}:`, error)
            res.status(500).json({ error: 'Unable to process Stripe webhook.' })
        }
    }
)

// HTTP Function (v2)
export const createAdminUser = onRequest(async (req, res) => {
    const auth = getAuth()

    // Only allow POST
    if (req.method !== 'POST') {
        res.status(405).send('Method Not Allowed')
        return
    }

    const { email, password, authToken } = req.body

    if (!email || !password) {
        res.status(400).send('Missing email or password')
        return
    }

    // Optional: Admin secret check
    const ADMIN_SECRET = process.env.ADMIN_SECRET
    if (ADMIN_SECRET && authToken !== ADMIN_SECRET) {
        res.status(403).send('Forbidden: Invalid admin secret')
        return
    }

    try {
        // 🔒 Check if an admin user already exists
        let adminExists = false
        let nextPageToken: string | undefined

        do {
            const result = await auth.listUsers(1000, nextPageToken)
            adminExists = result.users.some((user) => user.customClaims?.role === 'admin')
            nextPageToken = result.pageToken
        } while (!adminExists && nextPageToken)

        if (adminExists) {
            res.status(409).json({ error: 'An admin user already exists.' })
            return
        }

        // ✅ Create user
        const user = await auth.createUser({ email, password })

        // ✅ Set admin claim
        await auth.setCustomUserClaims(user.uid, { role: 'admin' })

        res.status(201).json({
            message: `✅ Admin user created: ${user.uid}`,
            uid: user.uid
        })
    } catch (err: unknown) {
        console.error('❌ Error:', err)
        const message = err instanceof Error ? err.message : String(err)
        res.status(500).json({ error: message })
    }
})

export const createCustomerUser = onRequest(async (req, res) => {
    const auth = getAuth()

    // Only allow POST
    if (req.method !== 'POST') {
        res.status(405).send('Method Not Allowed')
        return
    }

    const { email, password, authToken, name, phoneNumber } = req.body

    if (!email || !password) {
        res.status(400).send('Missing email or password')
        return
    }

    // Optional: Admin secret check
    const ADMIN_SECRET = process.env.ADMIN_SECRET
    if (ADMIN_SECRET && authToken !== ADMIN_SECRET) {
        res.status(403).send('Forbidden: Invalid admin secret')
        return
    }

    try {
        // 🔒 Check if an admin user already exists
        let userExists = false
        let nextPageToken: string | undefined

        do {
            const result = await auth.listUsers(1000, nextPageToken)
            userExists = result.users.some((user) => user.email === email)
            nextPageToken = result.pageToken
        } while (!userExists && nextPageToken)

        if (userExists) {
            res.status(409).json({ error: 'A user with that email already exists.' })
            return
        }

        // ✅ Create user
        const user = await auth.createUser({
            email,
            password,
            displayName: name || undefined,
            phoneNumber: phoneNumber || undefined
        })

        // ✅ Editor role for customer accounts
        await auth.setCustomUserClaims(user.uid, { role: 'editor' })

        const db = getFirestore()
        const freePlanSnap = await db.collection('plans').doc('free').get()
        if (!freePlanSnap.exists) {
            res.status(500).json({ error: 'Free plan not found in plans collection.' })
            return
        }
        const planId = freePlanSnap.id
        const usage = buildUsage(freePlanSnap.data()?.features)

        const displayName = name || email.split('@')[0]
        const photoUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}`

        await db
            .collection('profiles')
            .doc(user.uid)
            .set({
                uid: user.uid,
                name: displayName,
                email,
                phoneNumber: phoneNumber || null,
                photoUrl,
                role: 'editor',
                planId,
                usage,
                flags: {
                    onboardingComplete: false
                },
                createdAt: Date.now(),
                veifiedAt: ''
            })

        res.status(201).json({
            message: `✅ Editor user created: ${user.uid}`,
            uid: user.uid,
            role: 'editor'
        })
    } catch (err: unknown) {
        console.error('❌ Error:', err)
        const message = err instanceof Error ? err.message : String(err)
        res.status(500).json({ error: message })
    }
})
