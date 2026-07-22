import { onRequest } from 'firebase-functions/v2/https'
import { onDocumentCreated } from 'firebase-functions/v2/firestore'
import { initializeApp, getApps } from 'firebase-admin/app'
import { getAuth } from 'firebase-admin/auth'
import { getFirestore } from 'firebase-admin/firestore'

// Initialize Firebase Admin if not already initialized
if (!getApps().length) {
    initializeApp()
}

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
