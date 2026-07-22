<script setup lang="ts">
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import Button from '@/components/ui/button/Button.vue'
import { CardContent, CardDescription } from '@/components/ui/card'
import Card from '@/components/ui/card/Card.vue'
import CardHeader from '@/components/ui/card/CardHeader.vue'
import CardTitle from '@/components/ui/card/CardTitle.vue'
import { FormField } from '@/components/ui/form'
import FormControl from '@/components/ui/form/FormControl.vue'
import FormItem from '@/components/ui/form/FormItem.vue'
import FormLabel from '@/components/ui/form/FormLabel.vue'
import FormMessage from '@/components/ui/form/FormMessage.vue'
import Input from '@/components/ui/input/Input.vue'
import { auth, db } from '@/lib/firebase'
import type { PlanId, UserProfile, UserUsage } from '@/lib/firebase-auth'
import { useAuthStore } from '@/stores/authStore'
import { toTypedSchema } from '@vee-validate/zod'
import { FirebaseError } from 'firebase/app'
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth'
import { doc, getDoc, setDoc } from 'firebase/firestore'
import { AlertCircle, EyeClosed, EyeIcon } from 'lucide-vue-next'
import { useForm } from 'vee-validate'
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import * as z from 'zod'

const router = useRouter()
const authStore = useAuthStore()
const error = ref<string | null>(null)
const isPasswordVisible = ref(false)
const isConfirmPasswordVisible = ref(false)

const buildUsage = (features: unknown): UserUsage[] => {
    if (!Array.isArray(features)) return []

    return features.flatMap((feature) => {
        if (!feature || typeof feature !== 'object') return []

        const { id, value } = feature as { id?: unknown; value?: unknown }
        const featureId = typeof id === 'string' ? id.trim() : ''
        const limit = Number(value)

        if (!featureId || !Number.isInteger(limit)) return []
        return [{ featureId, used: 0, limit }]
    })
}

const validationSchema = toTypedSchema(
    z
        .object({
            name: z.string().min(1, 'Name is required'),
            email: z.string().email(),
            password: z.string().min(6, 'Password must be at least 6 characters'),
            confirmPassword: z.string().min(1, 'Confirm your password')
        })
        .refine((values) => values.password === values.confirmPassword, {
            message: 'Passwords do not match',
            path: ['confirmPassword']
        })
)

const { handleSubmit, isSubmitting } = useForm({
    validationSchema
})

const onSubmit = handleSubmit(async ({ name, email, password }) => {
    error.value = null

    try {
        const freePlanSnap = await getDoc(doc(db, 'plans', 'free'))
        if (!freePlanSnap.exists()) {
            throw new Error('Free plan not found. Please contact support.')
        }
        const planId: PlanId = freePlanSnap.id
        const usage = buildUsage(freePlanSnap.data().features)

        const { user } = await createUserWithEmailAndPassword(auth, email, password)
        const photoUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}`
        await updateProfile(user, { displayName: name, photoURL: photoUrl })

        const now = Date.now()
        const profile: UserProfile = {
            uid: user.uid,
            name,
            email,
            phoneNumber: null,
            photoUrl,
            role: 'editor',
            planId,
            usage,
            flags: {
                onboardingComplete: false
            },
            createdAt: now,
            veifiedAt: ''
        }

        await setDoc(doc(db, 'profiles', user.uid), profile)

        await user.reload()
        // Reassign so the sidebar picks up displayName/photoURL updates.
        authStore.setUser(null)
        authStore.setUser(auth.currentUser)

        router.push('/dashboard')
    } catch (e) {
        console.error(e)
        if (e instanceof FirebaseError) {
            error.value = e.message
            return
        }
        error.value = e instanceof Error ? e.message : 'Unable to create account'
    }
})
</script>

<template>
    <div class="flex w-full max-w-120 flex-col gap-4">
        <Alert v-if="error" variant="destructive">
            <AlertCircle class="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>
                {{ error }}
            </AlertDescription>
        </Alert>

        <Card class="w-full max-w-120">
            <CardHeader class="text-center">
                <CardTitle>Create an account</CardTitle>
                <CardDescription>Enter your details to get started</CardDescription>
            </CardHeader>
            <CardContent>
                <form class="flex flex-col gap-4" @submit.prevent="onSubmit">
                    <FormField v-slot="{ componentField }" name="name">
                        <FormItem>
                            <FormLabel>Name</FormLabel>
                            <FormControl>
                                <Input
                                    type="text"
                                    placeholder="John Doe"
                                    v-bind="componentField"
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
                                    placeholder="name@example.com"
                                    v-bind="componentField"
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    </FormField>

                    <FormField v-slot="{ componentField }" name="password">
                        <FormItem>
                            <FormLabel>Password</FormLabel>
                            <FormControl>
                                <div class="relative">
                                    <Input
                                        :type="isPasswordVisible ? 'text' : 'password'"
                                        class="pr-10"
                                        placeholder="Your password"
                                        v-bind="componentField"
                                    />
                                    <Button
                                        variant="ghost"
                                        type="button"
                                        class="absolute top-0 right-0"
                                        @click="isPasswordVisible = !isPasswordVisible"
                                    >
                                        <EyeClosed v-if="isPasswordVisible" />
                                        <EyeIcon v-else />
                                    </Button>
                                </div>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    </FormField>

                    <FormField v-slot="{ componentField }" name="confirmPassword">
                        <FormItem>
                            <FormLabel>Confirm password</FormLabel>
                            <FormControl>
                                <div class="relative">
                                    <Input
                                        :type="isConfirmPasswordVisible ? 'text' : 'password'"
                                        class="pr-10"
                                        placeholder="Confirm your password"
                                        v-bind="componentField"
                                    />
                                    <Button
                                        variant="ghost"
                                        type="button"
                                        class="absolute top-0 right-0"
                                        @click="
                                            isConfirmPasswordVisible = !isConfirmPasswordVisible
                                        "
                                    >
                                        <EyeClosed v-if="isConfirmPasswordVisible" />
                                        <EyeIcon v-else />
                                    </Button>
                                </div>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    </FormField>

                    <Button type="submit" size="lg" :disabled="isSubmitting">
                        Sign Up
                        <span
                            v-if="isSubmitting"
                            class="h-6 w-6 animate-spin rounded-full border-4 border-neutral-300 border-t-white"
                        />
                    </Button>

                    <p class="text-center text-sm">
                        Already have an account?
                        <router-link
                            to="/auth/signin"
                            class="font-medium text-blue-500 hover:text-blue-600"
                        >
                            Sign In
                        </router-link>
                    </p>
                </form>
            </CardContent>
        </Card>
    </div>
</template>
