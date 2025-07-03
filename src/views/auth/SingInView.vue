<script setup lang="ts">
import { toTypedSchema } from '@vee-validate/zod'
import * as z from "zod"
import { useForm } from 'vee-validate';
import { FormField } from '@/components/ui/form';
import FormItem from '@/components/ui/form/FormItem.vue';
import FormLabel from '@/components/ui/form/FormLabel.vue';
import FormControl from '@/components/ui/form/FormControl.vue';
import FormMessage from '@/components/ui/form/FormMessage.vue';
import Button from '@/components/ui/button/Button.vue';
import Input from '@/components/ui/input/Input.vue';
import Card from '@/components/ui/card/Card.vue';
import CardHeader from '@/components/ui/card/CardHeader.vue';
import CardTitle from '@/components/ui/card/CardTitle.vue';
import { CardContent, CardDescription } from '@/components/ui/card';
import { auth } from '@/lib/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { useRouter } from 'vue-router';
import { ref } from 'vue';
import { AlertCircle, EyeClosed, EyeIcon } from 'lucide-vue-next';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import FormDescription from '@/components/ui/form/FormDescription.vue';

const router = useRouter()

const error = ref<string | null>(null)

const validationSchema = toTypedSchema(z.object({
    email: z.string().email(),
    password: z.string()
}))

const isPasswordVisible = ref(false)

const { handleSubmit, isSubmitting } = useForm({
    validationSchema
})

const onSubmit = handleSubmit(async ({ email, password }) => {
    error.value = null

    try {
        await signInWithEmailAndPassword(auth, email, password)
        router.push("/dashboard")

    } catch (e) {
        console.error(e)
        error.value = e as string
    }
})
</script>
<template>
    <div class="flex flex-col gap-4 w-full max-w-120">
        <Alert variant="destructive" v-if="error">
            <AlertCircle class="w-4 h-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>
                {{ error }}
            </AlertDescription>
        </Alert>
        <Card class="w-full max-w-120">

            <CardHeader class="text-center">
                <CardTitle>Welcome back</CardTitle>
                <CardDescription>Enter your credentials to access your account</CardDescription>
            </CardHeader>
            <CardContent>

                <form @submit.prevent="onSubmit" class="flex flex-col gap-4">
                    <FormField v-slot="{ componentField }" name="email">
                        <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                                <Input type="email" placeholder="name@example.com" v-bind="componentField" />
                            </FormControl>

                            <FormMessage />
                        </FormItem>
                    </FormField>
                    <FormField v-slot="{ componentField }" name="password">
                        <FormItem>
                            <FormLabel>Password</FormLabel>
                            <FormControl>
                                <div class="relative ">
                                    <Input :type="isPasswordVisible ? 'text' : 'password'" class="pr-10"
                                        placeholder="Your password" v-bind="componentField" />
                                    <Button variant="ghost" @click="isPasswordVisible = !isPasswordVisible"
                                        type="button" class="absolute top-0 right-0">

                                        <EyeClosed v-if="isPasswordVisible" />
                                        <EyeIcon v-else />
                                    </Button>
                                </div>
                            </FormControl>
                            <FormDescription class="text-right">
                                <router-link to="/auth/forgot-password"
                                    class="text-right text-blue-500 hover:blue-600 text-sm font-medium">Forgot
                                    password?</router-link>
                            </FormDescription>
                        </FormItem>
                    </FormField>

                    <Button type="submit" size="lg">
                        Sign In <span
                            class="animate-spin border-4 border-neutral-300 border-t-white w-6 h-6 rounded-full "
                            v-if="isSubmitting"> </span>
                    </Button>

                </form>
            </CardContent>



        </Card>
    </div>


</template>
<style lang="scss"></style>
