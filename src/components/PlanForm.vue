<script setup lang="ts">
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '@/components/ui/select'
import { usePlansStore } from '@/stores/plansStore'
import type { Plan, PlanFeature, PlanInterval } from '@/types/plan'
import { AlertCircle, PlusIcon, TrashIcon } from 'lucide-vue-next'
import { computed, ref } from 'vue'

const props = defineProps<{
    plan?: Plan | null
}>()

const emit = defineEmits<{
    (e: 'onSave'): void
    (e: 'onCancel'): void
}>()

const plansStore = usePlansStore()
const error = ref<string | null>(null)
const saving = ref(false)
const isEditing = computed(() => Boolean(props.plan?.id))

const id = ref(props.plan?.id ?? '')
const name = ref(props.plan?.name ?? '')
const description = ref(props.plan?.description ?? '')
const interval = ref<PlanInterval>(props.plan?.interval ?? 'monthly')
const isFree = ref(Boolean(props.plan?.isFree))
const stripePriceId = ref(props.plan?.stripePriceId ?? '')
const price = ref<number | string>(props.plan?.price ?? 0)
const features = ref<PlanFeature[]>(
    (props.plan?.features ?? []).map((feature) => ({
        id: feature.id,
        value: feature.value
    }))
)

const onIntervalChange = (value: unknown) => {
    if (value === 'monthly' || value === 'annually') {
        interval.value = value
    }
}

const onFreeChange = (checked: boolean | 'indeterminate') => {
    isFree.value = checked === true
    if (isFree.value) {
        stripePriceId.value = ''
        price.value = 0
    }
}

const addFeature = () => {
    features.value = [...features.value, { id: '', value: 0 }]
}

const removeFeature = (index: number) => {
    features.value = features.value.filter((_, i) => i !== index)
}

const updateFeatureId = (index: number, value: string | number) => {
    features.value = features.value.map((feature, i) =>
        i === index ? { ...feature, id: String(value) } : feature
    )
}

const updateFeatureValue = (index: number, value: string | number) => {
    const parsed = Number(value)
    features.value = features.value.map((feature, i) =>
        i === index ? { ...feature, value: Number.isNaN(parsed) ? 0 : Math.trunc(parsed) } : feature
    )
}

const validate = () => {
    const planId = id.value.trim()
    if (!planId) return 'Id is required'
    if (!/^[a-z0-9_-]+$/i.test(planId)) {
        return 'Id can only use letters, numbers, hyphens, or underscores'
    }
    if (!name.value.trim()) return 'Name is required'
    if (interval.value !== 'monthly' && interval.value !== 'annually') {
        return 'Select monthly or annually'
    }

    if (!isFree.value) {
        if (!stripePriceId.value.trim()) return 'Stripe price id is required'
        const parsedPrice = Number(price.value)
        if (Number.isNaN(parsedPrice) || parsedPrice < 0) {
            return 'Price must be 0 or greater'
        }
    }

    for (const [index, feature] of features.value.entries()) {
        if (!feature.id.trim()) return `Feature #${index + 1} needs an id`
        if (!Number.isInteger(feature.value)) {
            return `Feature #${index + 1} value must be an integer`
        }
    }

    return null
}

const onSubmit = async () => {
    error.value = null
    const validationError = validate()
    if (validationError) {
        error.value = validationError
        return
    }

    saving.value = true
    try {
        const payload = {
            name: name.value.trim(),
            description: description.value.trim(),
            interval: interval.value,
            isFree: isFree.value,
            features: features.value.map((feature) => ({
                id: feature.id.trim(),
                value: feature.value
            })),
            ...(isFree.value
                ? {}
                : {
                      stripePriceId: stripePriceId.value.trim(),
                      price: Number(price.value)
                  })
        }

        if (isEditing.value && props.plan?.id) {
            await plansStore.update(props.plan.id, payload)
        } else {
            await plansStore.create({
                id: id.value.trim(),
                ...payload
            })
        }
        emit('onSave')
    } catch (e) {
        console.error(e)
        error.value = e instanceof Error ? e.message : String(e)
    } finally {
        saving.value = false
    }
}
</script>

<template>
    <form class="flex flex-col gap-4" @submit.prevent="onSubmit">
        <Alert v-if="error" variant="destructive">
            <AlertCircle class="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>
                {{ error }}
            </AlertDescription>
        </Alert>

        <div class="grid gap-2">
            <Label for="plan-id">Id</Label>
            <Input
                id="plan-id"
                v-model="id"
                type="text"
                placeholder="monthly"
                :disabled="isEditing"
            />
        </div>

        <div class="grid gap-2">
            <Label for="plan-name">Name</Label>
            <Input id="plan-name" v-model="name" type="text" placeholder="Monthly Plan" />
        </div>

        <div class="grid gap-2">
            <Label for="plan-description">Description</Label>
            <Textarea
                id="plan-description"
                v-model="description"
                placeholder="Describe who this plan is for and what it includes"
            />
        </div>

        <div class="grid gap-2">
            <Label>Billing interval</Label>
            <Select :model-value="interval" @update:model-value="onIntervalChange">
                <SelectTrigger class="w-full">
                    <SelectValue placeholder="Select monthly or annually" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="annually">Annually</SelectItem>
                </SelectContent>
            </Select>
        </div>

        <div class="flex flex-row items-center justify-between gap-3 rounded-md border p-3">
            <div class="space-y-0.5">
                <Label>Free plan</Label>
                <p class="text-sm text-muted-foreground">
                    Hide and skip Stripe price fields for this plan
                </p>
            </div>
            <Checkbox :model-value="isFree" @update:model-value="onFreeChange" />
        </div>

        <template v-if="!isFree">
            <div class="grid gap-2">
                <Label for="plan-stripe-price-id">Stripe price id</Label>
                <Input
                    id="plan-stripe-price-id"
                    v-model="stripePriceId"
                    type="text"
                    placeholder="price_..."
                />
            </div>

            <div class="grid gap-2">
                <Label for="plan-price">Price</Label>
                <Input
                    id="plan-price"
                    v-model="price"
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="9.99"
                />
            </div>
        </template>

        <div class="flex flex-col gap-3">
            <div class="flex items-center justify-between">
                <Label>Features</Label>
                <Button type="button" variant="outline" size="sm" @click="addFeature">
                    <PlusIcon class="h-4 w-4" />
                    Add feature
                </Button>
            </div>

            <p v-if="features.length === 0" class="text-sm text-muted-foreground">
                No features yet. Add feature ids with integer values.
            </p>

            <div
                v-for="(feature, index) in features"
                :key="index"
                class="grid grid-cols-[1fr_120px_auto] items-start gap-2"
            >
                <Input
                    type="text"
                    placeholder="feature_id"
                    :model-value="feature.id"
                    @update:model-value="(val) => updateFeatureId(index, val)"
                />
                <Input
                    type="number"
                    step="1"
                    placeholder="0"
                    :model-value="feature.value"
                    @update:model-value="(val) => updateFeatureValue(index, val)"
                />
                <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    class="text-destructive hover:text-destructive"
                    @click="removeFeature(index)"
                >
                    <TrashIcon class="h-4 w-4" />
                    <span class="sr-only">Remove feature</span>
                </Button>
            </div>
        </div>

        <div class="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button
                type="button"
                class="min-w-24"
                :class="{ 'animate-pulse': saving }"
                :disabled="saving"
                @click="onSubmit"
            >
                <template v-if="saving">
                    {{ isEditing ? 'Updating...' : 'Saving...' }}
                </template>
                <template v-else>
                    {{ isEditing ? 'Update' : 'Save' }}
                </template>
            </Button>
            <Button type="button" variant="outline" :disabled="saving" @click="emit('onCancel')">
                Cancel
            </Button>
        </div>
    </form>
</template>
