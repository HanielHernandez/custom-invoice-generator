<script setup lang="ts">
import AtText from '@/components/atoms/AtText.vue'
import SubscriptionInvoices from '@/components/SubscriptionInvoices.vue'
import UpgradePlanDialog from '@/components/UpgradePlanDialog.vue'
import Button from '@/components/ui/button/Button.vue'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import LoadingSpinner from '@/components/ui/LoadingSpinner.vue'
import { usePlansStore } from '@/stores/plansStore'
import { useProfileStore } from '@/stores/profileStore'
import type { Plan } from '@/types/plan'
import { CircleCheckBigIcon } from 'lucide-vue-next'
import { storeToRefs } from 'pinia'
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const profileStore = useProfileStore()
const plansStore = usePlansStore()
const route = useRoute()
const router = useRouter()
const { profile } = storeToRefs(profileStore)

const currentPlan = ref<Plan | null>(null)
const loading = ref(true)
const error = ref<string | null>(null)
const upgradeDialogOpen = ref(false)

const planId = computed(() => profile.value?.planId?.trim() ?? '')
const checkoutSucceeded = computed(() => route.query.checkout === 'success')

const formatPrice = (plan: Plan) => {
    if (plan.isFree) return 'Free'

    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
    }).format(plan.price ?? 0)
}

const formatFeatureName = (id: string) =>
    id.replace(/[-_]+/g, ' ').replace(/\b\w/g, (letter) => letter.toUpperCase())

const usage = computed(() => profile.value?.usage ?? [])

const usagePercentage = (used: number, limit: number) => {
    if (limit <= 0) return 0
    return Math.min(100, Math.max(0, (used / limit) * 100))
}

const openUpgradeDialog = () => {
    upgradeDialogOpen.value = true
}

const showBillingDetails = () => {
    router.replace({ name: 'billing' })
}

const loadBilling = async () => {
    loading.value = true
    error.value = null

    try {
        await profileStore.fetchProfile(true)

        if (planId.value) {
            currentPlan.value = await plansStore.fetchById(planId.value)
            if (!currentPlan.value) {
                error.value = `The plan "${planId.value}" could not be found.`
            }
        } else {
            currentPlan.value = null
        }
    } catch (e) {
        console.error('Error loading billing plan:', e)
        error.value = e instanceof Error ? e.message : 'Unable to load your current plan.'
    } finally {
        loading.value = false
    }
}

onMounted(loadBilling)

const currentPlanPrice = computed(() => {
    if (!currentPlan.value) return '$0.00'
    return planId.value === 'free' ? '$0.00' : formatPrice(currentPlan.value)
})
</script>

<template>
    <div class="flex max-w-5xl flex-col gap-6 mx-auto">
        <div>
            <AtText variant="h2">Plans &amp; Billing</AtText>
            <AtText variant="p">Review your current subscription and included features.</AtText>
        </div>

        <Card v-if="checkoutSucceeded" class="border-green-200 bg-green-50">
            <CardContent class="flex flex-col items-center gap-5 py-12 text-center">
                <span
                    class="flex size-16 items-center justify-center rounded-full bg-green-100 text-green-700"
                >
                    <CircleCheckBigIcon class="size-9" />
                </span>
                <div class="max-w-xl space-y-2">
                    <CardTitle class="text-2xl">Congratulations!</CardTitle>
                    <CardDescription class="text-base text-green-900/70">
                        Your subscription has been upgraded successfully. Your new plan and usage
                        limits may take a few minutes to appear while we finish processing your
                        payment.
                    </CardDescription>
                </div>
                <Button @click="showBillingDetails">View billing details</Button>
            </CardContent>
        </Card>

        <Card v-else-if="loading">
            <CardContent class="flex min-h-48 items-center justify-center">
                <LoadingSpinner />
            </CardContent>
        </Card>

        <Card v-else-if="error">
            <CardHeader>
                <CardTitle>Plan unavailable</CardTitle>
                <CardDescription>{{ error }}</CardDescription>
            </CardHeader>
        </Card>

        <Card v-else-if="!planId">
            <CardHeader>
                <CardTitle>No plan assigned</CardTitle>
                <CardDescription>
                    Your account does not have a subscription plan yet. Contact an administrator for
                    help.
                </CardDescription>
            </CardHeader>
        </Card>

        <div v-else-if="currentPlan" class="flex flex-col gap-4">
            <Card>
                <CardContent
                    class="flex w-full flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
                >
                    <div class="space-y-1">
                        <CardTitle>{{ currentPlan.name }}</CardTitle>
                        <CardDescription>
                            {{
                                currentPlan.description ||
                                'Your current subscription plan.'
                            }}
                        </CardDescription>
                        <p class="font-medium">{{ currentPlanPrice }}</p>
                    </div>
                    <Button @click="openUpgradeDialog">Upgrade Plan</Button>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Features</CardTitle>
                    <CardDescription
                        >Track how much of each plan feature you have used.</CardDescription
                    >
                </CardHeader>
                <CardContent class="pb-6">
                    <div
                        v-if="usage.length > 0"
                        class="overflow-hidden rounded-md border bg-background"
                    >
                        <div
                            class="grid grid-cols-[minmax(0,1fr)_minmax(8rem,2fr)_auto] items-center gap-4 border-b bg-muted/60 px-4 py-3 text-xs font-medium uppercase tracking-wide text-muted-foreground"
                        >
                            <span>Feature</span>
                            <span>Usage</span>
                            <span class="text-right">Used / Limit</span>
                        </div>

                        <div
                            v-for="feature in usage"
                            :key="feature.featureId"
                            class="grid grid-cols-[minmax(0,1fr)_minmax(8rem,2fr)_auto] items-center gap-4 border-b px-4 py-4 last:border-b-0"
                        >
                            <span class="truncate text-sm font-medium">
                                {{ formatFeatureName(feature.featureId) }}
                            </span>

                            <div
                                class="h-2 w-full overflow-hidden rounded-full bg-muted"
                                role="progressbar"
                                :aria-label="`${formatFeatureName(feature.featureId)} usage`"
                                :aria-valuemin="0"
                                :aria-valuemax="feature.limit"
                                :aria-valuenow="feature.used"
                            >
                                <div
                                    class="h-full rounded-full bg-primary transition-[width]"
                                    :style="{
                                        width: `${usagePercentage(feature.used, feature.limit)}%`
                                    }"
                                />
                            </div>

                            <span class="min-w-20 text-right text-sm tabular-nums">
                                <strong>{{ feature.used }}</strong>
                                <span class="text-muted-foreground"> / {{ feature.limit }}</span>
                            </span>
                        </div>
                    </div>

                    <p v-else class="py-6 text-center text-sm text-muted-foreground">
                        No usage data is available for this plan.
                    </p>
                </CardContent>
            </Card>

            <SubscriptionInvoices />
        </div>

        <UpgradePlanDialog
            v-model:open="upgradeDialogOpen"
            :current-plan-id="planId"
            @upgraded="loadBilling"
        />
    </div>
</template>
