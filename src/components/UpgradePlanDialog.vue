<script setup lang="ts">
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle
} from '@/components/ui/dialog'
import LoadingSpinner from '@/components/ui/LoadingSpinner.vue'
import { config } from '@/config'
import { auth } from '@/lib/firebase'
import { usePlansStore } from '@/stores/plansStore'
import { useProfileStore } from '@/stores/profileStore'
import type { Plan, PlanInterval } from '@/types/plan'
import { CheckIcon } from 'lucide-vue-next'
import { storeToRefs } from 'pinia'
import { computed, ref, watch } from 'vue'
import { useRouter } from 'vue-router'

const props = defineProps<{
    open: boolean
    currentPlanId: string
}>()

const emit = defineEmits<{
    (event: 'update:open', open: boolean): void
    (event: 'upgraded', planId: string): void
}>()

const router = useRouter()
const plansStore = usePlansStore()
const profileStore = useProfileStore()
const { items: plans, loading: plansLoading, error: plansError } = storeToRefs(plansStore)
const { profile } = storeToRefs(profileStore)

const selectedInterval = ref<PlanInterval>('monthly')
const checkoutPlanId = ref<string | null>(null)
const checkoutError = ref<string | null>(null)

const getFunctionsUrl = (path: string) => {
    if (!config.firebase.functionsUrl) {
        throw new Error('VITE_FIREBASE_FUNCTIONS_URL is not configured.')
    }
    return `${config.firebase.functionsUrl}/${path}`
}

const currentPlan = computed(
    () => plans.value.find((plan) => plan.id === props.currentPlanId) ?? null
)
const hasPaidSubscription = computed(
    () => Boolean(currentPlan.value && !currentPlan.value.isFree)
)

const filteredPlans = computed(() =>
    plans.value.filter((plan) => plan.interval === selectedInterval.value)
)

const formatPrice = (plan: Plan) => {
    if (plan.isFree) return 'Free'

    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
    }).format(plan.price ?? 0)
}

const formatFeatureName = (id: string) =>
    id.replace(/[-_]+/g, ' ').replace(/\b\w/g, (letter) => letter.toUpperCase())

const requireSignedInUser = async () => {
    const user = auth.currentUser
    if (!user) throw new Error('You must be signed in to upgrade your plan.')

    if (!profile.value) {
        await profileStore.fetchProfile()
    }
    if (!profile.value) throw new Error('Your user profile could not be loaded.')

    return user
}

const startCheckout = async (plan: Plan, idToken: string) => {
    if (!config.siteUrl) {
        throw new Error('VITE_SITE_URL is not configured.')
    }

    const response = await fetch(getFunctionsUrl('createStripeCheckoutSession'), {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${idToken}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            planId: plan.id,
            userProfile: profile.value,
            successUrl: `${config.siteUrl}/dashboard/billing?checkout=success`,
            failureUrl: `${config.siteUrl}/dashboard/billing?checkout=cancelled`
        })
    })

    const result = (await response.json()) as { url?: unknown; error?: unknown }
    if (!response.ok) {
        throw new Error(
            typeof result.error === 'string'
                ? result.error
                : 'Unable to create a checkout session.'
        )
    }
    if (typeof result.url !== 'string' || !result.url) {
        throw new Error('The checkout session did not return a redirect URL.')
    }

    window.location.assign(result.url)
}

const changeSubscription = async (plan: Plan, idToken: string) => {
    const response = await fetch(getFunctionsUrl('changeStripeSubscriptionPlan'), {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${idToken}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ planId: plan.id })
    })

    const result = (await response.json()) as { success?: unknown; planId?: unknown; error?: unknown }
    if (!response.ok) {
        throw new Error(
            typeof result.error === 'string'
                ? result.error
                : 'Unable to change your subscription plan.'
        )
    }

    await profileStore.fetchProfile(true)
    emit('update:open', false)
    await router.replace({ name: 'billing', query: { checkout: 'success' } })
    emit('upgraded', plan.id)
}

const startUpgrade = async (plan: Plan) => {
    if (plan.isFree || plan.id === props.currentPlanId) return

    checkoutError.value = null
    checkoutPlanId.value = plan.id

    try {
        const user = await requireSignedInUser()
        const idToken = await user.getIdToken()

        if (hasPaidSubscription.value) {
            await changeSubscription(plan, idToken)
        } else {
            await startCheckout(plan, idToken)
        }
    } catch (error) {
        checkoutError.value = error instanceof Error ? error.message : String(error)
    } finally {
        checkoutPlanId.value = null
    }
}

watch(
    () => props.open,
    async (open) => {
        if (!open) return

        checkoutError.value = null
        const openCurrentPlan = plans.value.find((plan) => plan.id === props.currentPlanId)
        selectedInterval.value = openCurrentPlan?.interval ?? 'monthly'
        await plansStore.fetch()

        const loadedCurrentPlan = plans.value.find((plan) => plan.id === props.currentPlanId)
        selectedInterval.value = loadedCurrentPlan?.interval ?? selectedInterval.value
    }
)
</script>

<template>
    <Dialog :open="open" @update:open="emit('update:open', $event)">
        <DialogContent
            class="max-h-[calc(100dvh-2rem)] overflow-y-auto p-4 sm:max-w-6xl sm:p-6"
        >
            <DialogHeader>
                <DialogTitle>Choose a plan</DialogTitle>
                <DialogDescription>
                    Compare available plans and select the billing interval that works for you.
                </DialogDescription>
            </DialogHeader>

            <div
                class="mx-auto grid w-full max-w-sm grid-cols-2 rounded-lg bg-muted p-1"
                aria-label="Billing interval"
            >
                <Button
                    size="sm"
                    :variant="selectedInterval === 'monthly' ? 'default' : 'ghost'"
                    :aria-pressed="selectedInterval === 'monthly'"
                    @click="selectedInterval = 'monthly'"
                >
                    Monthly
                </Button>
                <Button
                    size="sm"
                    :variant="selectedInterval === 'annually' ? 'default' : 'ghost'"
                    :aria-pressed="selectedInterval === 'annually'"
                    @click="selectedInterval = 'annually'"
                >
                    Annually
                </Button>
            </div>

            <p
                v-if="checkoutError"
                class="rounded-md bg-destructive/10 px-4 py-3 text-sm text-destructive"
            >
                {{ checkoutError }}
            </p>

            <div v-if="plansLoading" class="flex min-h-64 items-center justify-center">
                <LoadingSpinner />
            </div>

            <p v-else-if="plansError" class="py-10 text-center text-sm text-destructive">
                {{ plansError }}
            </p>

            <p
                v-else-if="filteredPlans.length === 0"
                class="py-10 text-center text-sm text-muted-foreground"
            >
                No {{ selectedInterval }} plans are available.
            </p>

            <div v-else class="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                <Card
                    v-for="plan in filteredPlans"
                    :key="plan.id"
                    :class="[
                        'relative flex h-full flex-col',
                        plan.id === currentPlanId ? 'border-primary ring-1 ring-primary' : ''
                    ]"
                >
                    <span
                        v-if="plan.id === currentPlanId"
                        class="absolute right-4 top-4 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary"
                    >
                        Current
                    </span>

                    <CardHeader class="pr-24">
                        <CardTitle>{{ plan.name }}</CardTitle>
                        <CardDescription>
                            {{ plan.description || 'A plan designed to fit your business.' }}
                        </CardDescription>
                    </CardHeader>

                    <CardContent class="flex flex-1 flex-col gap-5 pb-6">
                        <div>
                            <span class="text-3xl font-semibold">{{ formatPrice(plan) }}</span>
                            <span v-if="!plan.isFree" class="text-sm text-muted-foreground">
                                /{{ plan.interval === 'annually' ? 'year' : 'month' }}
                            </span>
                        </div>

                        <ul class="flex-1 space-y-3">
                            <li
                                v-for="feature in plan.features"
                                :key="feature.id"
                                class="flex items-center gap-2 text-sm"
                            >
                                <CheckIcon class="size-4 shrink-0 text-primary" />
                                <span class="flex-1">{{ formatFeatureName(feature.id) }}</span>
                                <span class="font-medium tabular-nums">{{ feature.value }}</span>
                            </li>
                        </ul>

                        <Button
                            :class="[
                                'w-full text-white',
                                checkoutPlanId === plan.id ? 'animate-pulse' : ''
                            ]"
                            :disabled="
                                plan.id === currentPlanId ||
                                plan.isFree ||
                                checkoutPlanId !== null
                            "
                            @click="startUpgrade(plan)"
                        >
                            <LoadingSpinner v-if="checkoutPlanId === plan.id" />
                            <template v-if="checkoutPlanId === plan.id">Upgrading...</template>
                            <template v-else-if="plan.id === currentPlanId">Current plan</template>
                            <template v-else-if="plan.isFree">Free plan</template>
                            <template v-else>Upgrade to {{ plan.name }}</template>
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </DialogContent>
    </Dialog>
</template>
