<script setup lang="ts">
import AtText from '@/components/atoms/AtText.vue'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle
} from '@/components/ui/card'
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import ImageDropzone from '@/components/ui/ImageDropzone.vue'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import TagInput from '@/components/ui/TagInput.vue'
import Textarea from '@/components/ui/textarea/Textarea.vue'
import { auth, db, storage } from '@/lib/firebase'
import { useCompanyStore } from '@/stores/companyStore'
import { useProfileStore } from '@/stores/profileStore'
import { toTypedSchema } from '@vee-validate/zod'
import { addDoc, collection, doc, updateDoc } from 'firebase/firestore'
import { getDownloadURL, ref as storageRef, uploadBytes } from 'firebase/storage'
import { AlertCircle, ArrowLeft, ArrowRight, Check, PartyPopper } from 'lucide-vue-next'
import { storeToRefs } from 'pinia'
import { useForm } from 'vee-validate'
import { computed, onMounted, ref } from 'vue'
import { z } from 'zod'

type FinishPhase = 'form' | 'saving' | 'success'

const emit = defineEmits<{
    (e: 'completed'): void
}>()

const steps = [
    {
        id: 'basics',
        title: 'Company basics',
        description: 'Tell us about your business',
        fields: ['name', 'phoneNumber', 'email', 'zipcode'] as const
    },
    {
        id: 'address',
        title: 'Address',
        description: 'Where is your company located?',
        fields: ['address'] as const
    },
    {
        id: 'branding',
        title: 'Branding',
        description: 'Add your logo and signature',
        fields: ['logoUrl', 'signature'] as const
    },
    {
        id: 'terms',
        title: 'Terms & services',
        description: 'Set your default terms and services',
        fields: ['terms', 'tags'] as const
    },
    {
        id: 'review',
        title: 'Review',
        description: 'Confirm everything looks correct',
        fields: [] as const
    }
] as const

const CompanySchema = z.object({
    name: z.string().min(1, 'Company name is required'),
    phoneNumber: z.string().min(1, 'Phone number is required'),
    zipcode: z.string().min(1, 'Zip code is required'),
    address: z.string().min(1, 'Address is required'),
    logoUrl: z.string(),
    signature: z.string().min(1, 'Signature is required'),
    terms: z.string().min(1, 'Terms are required'),
    tags: z.array(z.string()),
    email: z.string()
})

const { handleSubmit, resetForm, validateField, setFieldTouched, values } = useForm({
    validationSchema: toTypedSchema(CompanySchema),
    initialValues: {
        name: '',
        phoneNumber: '',
        zipcode: '',
        email: '',
        address: '',
        logoUrl: '',
        signature: '',
        terms: '',
        tags: [] as string[]
    },
    validateOnMount: false
})

const companyStore = useCompanyStore()
const profileStore = useProfileStore()
const { company } = storeToRefs(companyStore)

const currentStep = ref(0)
const loading = ref(false)
const finishPhase = ref<FinishPhase>('form')
const error = ref<string | null>(null)
const logoFile = ref<File | null>(null)
const logoPreview = ref('')

const user = computed(() => auth.currentUser)
const isReviewStep = computed(() => steps[currentStep.value]?.id === 'review')
const isLastStep = computed(() => currentStep.value === steps.length - 1)
const step = computed(() => steps[currentStep.value])
const isFinishing = computed(() => finishPhase.value !== 'form')

onMounted(async () => {
    await companyStore.fetchCompany()

    const nextValues = {
        name: company.value?.name ?? '',
        phoneNumber: company.value?.phoneNumber ?? '',
        zipcode: company.value?.zipcode ?? '',
        email: company.value?.email ?? user.value?.email ?? '',
        address: company.value?.address ?? '',
        logoUrl: company.value?.logoUrl ?? '',
        signature: company.value?.signature ?? '',
        terms: company.value?.terms ?? '',
        tags: company.value?.tags ?? []
    }

    resetForm({
        values: nextValues,
        touched: {},
        errors: {}
    })

    logoPreview.value = company.value?.logoUrl ?? ''
})

const onLogoSelected = (file: File | null) => {
    logoFile.value = file
    if (!file) {
        logoPreview.value = company.value?.logoUrl ?? ''
        return
    }
    logoPreview.value = URL.createObjectURL(file)
}

const goToStep = (index: number) => {
    if (index <= currentStep.value) {
        error.value = null
        currentStep.value = index
    }
}

const goNext = async () => {
    error.value = null

    if (!isReviewStep.value) {
        const fields = step.value.fields
        if (fields.length) {
            await Promise.all(fields.map((field) => setFieldTouched(field, true)))
            const results = await Promise.all(fields.map((field) => validateField(field)))
            const hasError = results.some((result) => !result.valid)
            if (hasError) return
        }
    }

    if (isLastStep.value) {
        await submitOnboarding()
        return
    }

    currentStep.value += 1
}

const goBack = () => {
    error.value = null
    if (currentStep.value > 0) {
        currentStep.value -= 1
    }
}

const submitOnboarding = handleSubmit(async (formValues) => {
    loading.value = true
    finishPhase.value = 'saving'
    error.value = null

    try {
        let logoUrl = company.value?.logoUrl || formValues.logoUrl || ''

        if (logoFile.value) {
            const fileRef = storageRef(storage, `logos/${Date.now()}_${logoFile.value.name}`)
            await uploadBytes(fileRef, logoFile.value)
            logoUrl = await getDownloadURL(fileRef)
        }

        const payload = {
            ...formValues,
            logoUrl,
            uuid: user.value?.uid || '',
            createdAt: company.value?.id ? undefined : Date.now(),
            updatedAt: Date.now()
        }

        const cleanPayload = Object.fromEntries(
            Object.entries(payload).filter(([, value]) => value !== undefined)
        )

        if (company.value?.id) {
            await updateDoc(doc(db, 'companies', company.value.id), cleanPayload)
        } else {
            await addDoc(collection(db, 'companies'), {
                ...cleanPayload,
                createdAt: Date.now()
            })
        }

        await companyStore.fetchCompany()
        await profileStore.markOnboardingComplete()
        finishPhase.value = 'success'
    } catch (e) {
        console.error(e)
        finishPhase.value = 'form'
        error.value = e instanceof Error ? e.message : 'Failed to complete onboarding'
    } finally {
        loading.value = false
    }
})

const goToDashboard = () => {
    emit('completed')
}
</script>

<template>
    <div class="flex h-dvh flex-col items-center justify-center p-3 sm:p-4">
        <Card
            class="flex h-full max-h-full w-full max-w-6xl flex-col gap-0 overflow-hidden py-0 md:h-auto md:min-h-[640px] md:max-h-[min(720px,calc(100dvh-2rem))]"
        >
            <div
                class="grid min-h-0 flex-1 grid-rows-[auto_1fr] md:grid-cols-[280px_1fr] md:grid-rows-1"
            >
                <aside
                    class="shrink-0 border-b bg-muted/40 p-4 md:border-b-0 md:border-r md:p-6"
                >
                    <div class="mb-3 md:mb-8">
                        <AtText variant="h2">Welcome</AtText>
                        <p class="mt-1 hidden text-sm text-muted-foreground md:mt-2 md:block">
                            Let’s set up your company so you can start creating invoices.
                        </p>
                    </div>

                    <!-- Mobile: compact step indicators -->
                    <ol class="flex items-center justify-between gap-1 md:hidden">
                        <li v-for="(item, index) in steps" :key="`m-${item.id}`">
                            <button
                                type="button"
                                class="flex flex-col items-center gap-1"
                                :disabled="index > currentStep || isFinishing"
                                @click="goToStep(index)"
                            >
                                <span
                                    class="flex h-8 w-8 items-center justify-center rounded-full border text-xs font-medium"
                                    :class="
                                        index < currentStep
                                            ? 'border-primary bg-primary text-primary-foreground'
                                            : index === currentStep
                                              ? 'border-primary bg-background text-foreground'
                                              : 'border-border bg-background text-muted-foreground'
                                    "
                                >
                                    <Check v-if="index < currentStep" class="h-4 w-4" />
                                    <template v-else>{{ index + 1 }}</template>
                                </span>
                            </button>
                        </li>
                    </ol>

                    <!-- Desktop: full step list -->
                    <ol class="hidden flex-col gap-4 md:flex">
                        <li v-for="(item, index) in steps" :key="item.id">
                            <button
                                type="button"
                                class="flex w-full items-start gap-3 rounded-md text-left transition-colors"
                                :class="
                                    index === currentStep
                                        ? 'text-foreground'
                                        : index < currentStep
                                          ? 'text-primary'
                                          : 'text-muted-foreground'
                                "
                                :disabled="index > currentStep || isFinishing"
                                @click="goToStep(index)"
                            >
                                <span
                                    class="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border text-xs font-medium"
                                    :class="
                                        index < currentStep
                                            ? 'border-primary bg-primary text-primary-foreground'
                                            : index === currentStep
                                              ? 'border-primary bg-background'
                                              : 'border-border bg-background'
                                    "
                                >
                                    <Check v-if="index < currentStep" class="h-4 w-4" />
                                    <template v-else>{{ index + 1 }}</template>
                                </span>
                                <span class="min-w-0">
                                    <span class="block text-sm font-medium">{{ item.title }}</span>
                                    <span class="mt-0.5 block text-xs text-muted-foreground">
                                        {{ item.description }}
                                    </span>
                                </span>
                            </button>
                        </li>
                    </ol>
                </aside>

                <div class="flex min-h-0 flex-col">
                    <template v-if="finishPhase === 'saving'">
                        <CardContent
                            class="flex flex-1 flex-col items-center justify-center gap-4 text-center"
                        >
                            <span
                                class="h-10 w-10 animate-spin rounded-full border-2 border-muted-foreground/30 border-t-primary"
                            />
                            <div class="space-y-2">
                                <CardTitle>Saving your company</CardTitle>
                                <CardDescription>
                                    Please wait while we save your company details…
                                </CardDescription>
                            </div>
                        </CardContent>
                    </template>

                    <template v-else-if="finishPhase === 'success'">
                        <CardContent
                            class="flex flex-1 flex-col items-center justify-center gap-6 text-center"
                        >
                            <span
                                class="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary"
                            >
                                <PartyPopper class="h-7 w-7" />
                            </span>
                            <div class="space-y-2">
                                <CardTitle>Congratulations!</CardTitle>
                                <CardDescription class="max-w-md">
                                    Your company data has been saved. You’re all set to start
                                    creating invoices.
                                </CardDescription>
                            </div>
                            <Button type="button" size="lg" @click="goToDashboard">
                                Go to dashboard
                                <ArrowRight class="h-4 w-4" />
                            </Button>
                        </CardContent>
                    </template>

                    <template v-else>
                    <CardHeader class="shrink-0 gap-1 py-4 md:gap-2 md:py-6">
                        <CardTitle>{{ step.title }}</CardTitle>
                        <CardDescription>{{ step.description }}</CardDescription>
                    </CardHeader>

                    <CardContent class="min-h-0 flex-1 space-y-6 overflow-y-auto py-0">
                        <Alert v-if="error" variant="destructive">
                            <AlertCircle class="h-4 w-4" />
                            <AlertTitle>Error</AlertTitle>
                            <AlertDescription>{{ error }}</AlertDescription>
                        </Alert>

                        <div
                            v-show="currentStep === 0"
                            class="grid grid-cols-1 gap-4 md:grid-cols-2"
                        >
                            <FormField v-slot="{ componentField }" name="name">
                                <FormItem>
                                    <FormLabel>Company Name</FormLabel>
                                    <FormControl>
                                        <Input
                                            v-bind="componentField"
                                            placeholder="Enter company name"
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            </FormField>

                            <FormField v-slot="{ componentField }" name="phoneNumber">
                                <FormItem>
                                    <FormLabel>Phone Number</FormLabel>
                                    <FormControl>
                                        <Input
                                            v-bind="componentField"
                                            placeholder="Enter phone number"
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            </FormField>

                            <FormField v-slot="{ componentField }" name="email">
                                <FormItem>
                                    <FormLabel>Email</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="email"
                                            v-bind="componentField"
                                            placeholder="Enter email"
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            </FormField>

                            <FormField v-slot="{ componentField }" name="zipcode">
                                <FormItem>
                                    <FormLabel>Zip Code</FormLabel>
                                    <FormControl>
                                        <Input
                                            v-bind="componentField"
                                            placeholder="Enter zip code"
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            </FormField>
                        </div>

                        <div v-show="currentStep === 1">
                            <FormField v-slot="{ componentField }" name="address">
                                <FormItem>
                                    <FormLabel>Address</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            v-bind="componentField"
                                            placeholder="Enter address"
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            </FormField>
                        </div>

                        <div v-show="currentStep === 2" class="space-y-6">
                            <div class="space-y-2">
                                <Label>Logo</Label>
                                <ImageDropzone
                                    :model-value="logoFile"
                                    :preview-url="logoPreview"
                                    @update:model-value="onLogoSelected"
                                />
                            </div>

                            <FormField v-slot="{ componentField }" name="signature">
                                <FormItem>
                                    <FormLabel>Signature</FormLabel>
                                    <FormControl>
                                        <Input
                                            v-bind="componentField"
                                            placeholder="Enter signature name"
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            </FormField>
                        </div>

                        <div v-show="currentStep === 3" class="space-y-4">
                            <FormField v-slot="{ componentField }" name="terms">
                                <FormItem>
                                    <FormLabel>Terms</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            v-bind="componentField"
                                            placeholder="Enter terms"
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            </FormField>

                            <FormField v-slot="{ value, handleChange }" name="tags">
                                <FormItem>
                                    <FormLabel>Services</FormLabel>
                                    <FormControl>
                                        <TagInput
                                            :model-value="value ?? []"
                                            placeholder="Type a service"
                                            @update:model-value="handleChange"
                                        />
                                    </FormControl>
                                    <p class="text-xs text-muted-foreground">
                                        Hit or press Enter to add
                                    </p>
                                    <FormMessage />
                                </FormItem>
                            </FormField>
                        </div>

                        <div v-show="isReviewStep" class="space-y-6">
                            <p class="text-sm text-muted-foreground">
                                Review your company details below. Go back to edit anything, then
                                approve to finish setup.
                            </p>

                            <div class="flex flex-wrap items-center gap-6">
                                <Label class="w-full">Logo</Label>
                                <img
                                    v-if="logoPreview"
                                    :src="logoPreview"
                                    class="mt-2 h-auto w-32 rounded"
                                    alt="Company logo"
                                />
                                <p v-else class="text-sm text-muted-foreground">No logo uploaded</p>
                            </div>

                            <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <div class="grid gap-2">
                                    <Label>Company Name</Label>
                                    <Input :model-value="values.name || '—'" readonly disabled />
                                </div>
                                <div class="grid gap-2">
                                    <Label>Phone Number</Label>
                                    <Input
                                        :model-value="values.phoneNumber || '—'"
                                        readonly
                                        disabled
                                    />
                                </div>
                            </div>

                            <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <div class="grid gap-2">
                                    <Label>Zip Code</Label>
                                    <Input :model-value="values.zipcode || '—'" readonly disabled />
                                </div>
                                <div class="grid gap-2">
                                    <Label>Email</Label>
                                    <Input :model-value="values.email || '—'" readonly disabled />
                                </div>
                            </div>

                            <div class="grid gap-2">
                                <Label>Address</Label>
                                <Textarea
                                    :model-value="values.address || '—'"
                                    readonly
                                    disabled
                                />
                            </div>

                            <div class="grid gap-2">
                                <Label>Signature</Label>
                                <Input :model-value="values.signature || '—'" readonly disabled />
                            </div>

                            <div class="grid gap-2">
                                <Label>Terms</Label>
                                <Textarea :model-value="values.terms || '—'" readonly disabled />
                            </div>

                            <div class="grid gap-2">
                                <Label>Services</Label>
                                <TagInput
                                    :model-value="values.tags ?? []"
                                    disabled
                                    placeholder="No services added"
                                />
                            </div>
                        </div>
                    </CardContent>

                    <CardFooter
                        class="shrink-0 justify-between gap-3 border-t bg-background py-4"
                    >
                        <Button
                            type="button"
                            variant="outline"
                            :disabled="currentStep === 0 || loading || isFinishing"
                            @click="goBack"
                        >
                            <ArrowLeft class="h-4 w-4" />
                            Back
                        </Button>
                        <Button type="button" :disabled="loading || isFinishing" @click="goNext">
                            <template v-if="isReviewStep">
                                Approve & finish
                                <Check class="h-4 w-4" />
                            </template>
                            <template v-else>
                                Next
                                <ArrowRight class="h-4 w-4" />
                            </template>
                        </Button>
                    </CardFooter>
                    </template>
                </div>
            </div>
        </Card>
    </div>
</template>
