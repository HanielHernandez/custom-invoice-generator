<script setup lang="ts">
import { Button } from '@/components/ui/button'
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle
} from '@/components/ui/card'
import LoadingSpinner from '@/components/ui/LoadingSpinner.vue'
import { usePlansStore } from '@/stores/plansStore'
import type { Plan, PlanInterval } from '@/types/plan'
import { CheckIcon } from 'lucide-vue-next'
import { storeToRefs } from 'pinia'
import { computed, onMounted, ref } from 'vue'
import { RouterLink } from 'vue-router'

const plansStore = usePlansStore()
const { items: plans, loading: plansLoading } = storeToRefs(plansStore)
const selectedInterval = ref<PlanInterval>('monthly')

const pricingPlans = computed(() =>
    plans.value
        .filter((plan) => plan.interval === selectedInterval.value)
        .sort((a, b) => {
            if (a.isFree !== b.isFree) return a.isFree ? -1 : 1
            return (a.price ?? 0) - (b.price ?? 0)
        })
)

const formatPrice = (plan: Plan) => {
    if (plan.isFree) return '$0'
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        maximumFractionDigits: 0
    }).format(plan.price ?? 0)
}

const formatFeatureName = (id: string) =>
    id.replace(/[-_]+/g, ' ').replace(/\b\w/g, (letter) => letter.toUpperCase())

onMounted(() => {
    void plansStore.fetch()
})
</script>

<template>
    <section id="pricing" class="bg-secondary/60 py-20">
        <div class="mx-auto w-full max-w-6xl px-5">
            <p class="mb-2 text-sm font-semibold uppercase tracking-[0.14em] text-primary">
                Pricing
            </p>
            <h2 class="max-w-[18ch] text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
                Simple plans for every stage
            </h2>
            <p class="mt-3 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
                Pick the cadence that fits your cash flow. Upgrade anytime as your volume grows.
            </p>

            <div
                class="mt-8 inline-grid grid-cols-2 gap-1 rounded-lg border border-border bg-background p-1"
                aria-label="Billing interval"
            >
                <Button
                    size="sm"
                    :variant="selectedInterval === 'monthly' ? 'default' : 'ghost'"
                    @click="selectedInterval = 'monthly'"
                >
                    Monthly
                </Button>
                <Button
                    size="sm"
                    :variant="selectedInterval === 'annually' ? 'default' : 'ghost'"
                    @click="selectedInterval = 'annually'"
                >
                    Annually
                </Button>
            </div>

            <div v-if="plansLoading" class="mt-10 flex justify-center py-12">
                <LoadingSpinner />
            </div>

            <p
                v-else-if="pricingPlans.length === 0"
                class="mt-10 py-10 text-center text-muted-foreground"
            >
                Plans will appear here shortly. You can still create an account and get started.
            </p>

            <div v-else class="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                <Card
                    v-for="plan in pricingPlans"
                    :key="plan.id"
                    :class="[
                        'flex h-full flex-col',
                        !plan.isFree ? 'border-primary/30 shadow-md' : ''
                    ]"
                >
                    <CardHeader>
                        <CardTitle>{{ plan.name }}</CardTitle>
                        <CardDescription>
                            {{ plan.description || 'A plan designed for growing businesses.' }}
                        </CardDescription>
                        <p class="pt-2 text-4xl font-bold tracking-tight text-foreground">
                            {{ formatPrice(plan) }}
                            <span
                                v-if="!plan.isFree"
                                class="text-sm font-medium text-muted-foreground"
                            >
                                /{{ plan.interval === 'annually' ? 'year' : 'month' }}
                            </span>
                        </p>
                    </CardHeader>

                    <CardContent class="flex-1">
                        <ul class="space-y-3">
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
                    </CardContent>

                    <CardFooter>
                        <Button as-child class="w-full">
                            <RouterLink to="/auth/signup">
                                {{ plan.isFree ? 'Get started' : `Choose ${plan.name}` }}
                            </RouterLink>
                        </Button>
                    </CardFooter>
                </Card>
            </div>
        </div>
    </section>
</template>
