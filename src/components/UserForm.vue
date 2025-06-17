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

const emit = defineEmits<{
    (e: "onSave"): void,
    (e: "onCancel"): void
}>()

const validationSchema = toTypedSchema(z.object({
    name: z.string(),
    email: z.string(),
    phoneNumber: z.string().optional(),
    password: z.string()
}))

const { handleSubmit, isSubmitting } = useForm({ validationSchema })


const onsubmit = handleSubmit(async (values) => {

    try {
        await createUser(values as User)
    } catch (e) {
        console.error(e)
    }

    emit('onSave')
})
</script>
<template>
    <form @submit.prevent="onsubmit" class="flex flex-col gap-4 ">
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
                    <Input type="tel" placeholder="xxx-xxx-xxx" v-bind="phoneField" />
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
