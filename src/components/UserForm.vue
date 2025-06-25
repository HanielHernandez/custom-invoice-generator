<script setup lang="ts">
import { toTypedSchema } from '@vee-validate/zod';
import { Button } from './ui/button';
import { DialogFooter } from './ui/dialog';
import { z } from 'zod';
import { useForm } from 'vee-validate';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from './ui/form';
import { Input } from './ui/input';

import LoadingSpinner from '@/components/ui/LoadingSpinner.vue'
import { createUser, type User } from '@/lib/firebase-auth';
import Alert from './ui/alert/Alert.vue';
import { AlertCircle } from 'lucide-vue-next';
import { AlertDescription, AlertTitle } from './ui/alert';
import { ref } from 'vue';
import { AxiosError } from 'axios';

const emit = defineEmits<{
    (e: "onSave"): void,
    (e: "onCancel"): void
}>()
const error = ref<string | null>()

const validationSchema = toTypedSchema(z.object({
    name: z.string(),
    email: z.string(),
    phoneNumber: z.string().regex(/^\+[1-9]\d{1,14}$/, {
        message: 'Phone number must be in E.164 format (e.g., +14155552671)',
    }),
    password: z.string()
}))

const { handleSubmit, isSubmitting } = useForm({ validationSchema })


const onsubmit = handleSubmit(async (values) => {

    try {
        await createUser(values as User)
        emit('onSave')
    } catch (e) {
        if (e instanceof AxiosError) {
            error.value = e.response?.data.error || ""
        } else {
            error.value = e as string
        }

        console.error(e)
    }

})
</script>
<template>
    <form @submit.prevent="onsubmit" class="flex flex-col gap-4 ">
        <Alert variant="destructive" v-if="error">
            <AlertCircle class="w-4 h-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>
                {{ error }}
            </AlertDescription>
        </Alert>

        <FormField name="name" v-slot="{ componentField: nameField }">
            <FormItem>
                <FormLabel>
                    Name
                </FormLabel>
                <FormControl>
                    <Input type="text" placeholder="Jhon Doe" v-bind="nameField" />
                </FormControl>

                <FormMessage />
            </FormItem>
        </FormField>

        <FormField name="email" v-slot="{ componentField: emailfield }">
            <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                    <Input type="email" placeholder="name@example.com" v-bind="emailfield" />
                </FormControl>

                <FormMessage />
            </FormItem>
        </FormField>
        <FormField name="password" v-slot="{ componentField: passwordField }">
            <FormItem>
                <FormLabel>
                    Password
                </FormLabel>
                <FormControl>
                    <Input type="password" placeholder="xxxxxx" v-bind="passwordField" />
                </FormControl>

                <FormMessage />
            </FormItem>
        </FormField>

        <FormField name="phoneNumber" v-slot="{ componentField: phoneField }">
            <FormItem>
                <FormLabel>
                    Phone Number
                </FormLabel>
                <FormControl>
                    <Input type="tel" placeholder="+000000000" v-bind="phoneField" />
                </FormControl>

                <FormMessage />
            </FormItem>
        </FormField>
        <DialogFooter>
            <Button type="submit">Save
                <LoadingSpinner v-if="isSubmitting" />
            </Button>
            <Button type="button" variant="outline" @click="emit('onCancel')">Cancel</Button>
        </DialogFooter>
    </form>
</template>
<style lang="scss"></style>
