<script setup lang="ts">
import { Alert, AlertDescription, AlertTitle, type AlertVariants } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { auth } from '@/lib/firebase';
import { toTypedSchema } from '@vee-validate/zod';
import { sendPasswordResetEmail } from 'firebase/auth';
import { AlertCircle } from 'lucide-vue-next';
import { useForm } from 'vee-validate';
import { reactive } from 'vue';
import z from 'zod';

const message: {
    type: AlertVariants['variant'],
    title: string,
    description: string
} = reactive({
    type: 'default',
    title: '',
    description: ''
})
const siteUrl = import.meta.env.VITE_SITE_URL

const validationSchema = toTypedSchema(z.object({
    email: z.string().email(),
}))

const { handleSubmit, isSubmitting } = useForm({
    validationSchema
})

const onSubmit = handleSubmit(async ({ email }) => {

    try {
        await sendPasswordResetEmail(auth, email || "")
        message.type = "default"
        message.title = 'Reset Email sent successfully'
        message.description = 'Check your email for a reset link'

    } catch (e) {
        console.error(e)
        message.type = "destructive"
        message.title = 'Error'
        message.description = 'Error while sending reset email'
    }
})

</script>
<template>
    <div class="flex flex-col gap-4 w-full max-w-120">
        <Alert v-if="message.title !== ''" :variant="message.type">
            <AlertCircle class="w-4 h-4" />
            <AlertTitle>{{ message.title }}</AlertTitle>
            <AlertDescription>
                {{ message.description }}
            </AlertDescription>
        </Alert>
        <Card class="w-full max-w-120">

            <CardHeader class="text-center">
                <CardTitle>Password Reset</CardTitle>
                <CardDescription>Enter your email to send you a reset link</CardDescription>
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

                    <Button type="submit" size="lg" :disabled="isSubmitting">
                        Send Reset Emial <span
                            class="animate-spin border-4 border-neutral-300 border-t-white w-6 h-6 rounded-full "
                            v-if="isSubmitting"> </span>
                    </Button>
                    <router-link to="/auth/signin" class="block text-center">
                        <Button variant="ghost" class="block text-center">Go Back</Button>
                    </router-link>


                </form>
            </CardContent>
        </Card>
    </div>
</template>
<style lang="scss"></style>
