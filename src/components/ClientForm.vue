<script setup lang="ts">
import { toTypedSchema } from '@vee-validate/zod'
import { Button } from './ui/button'
import { DialogFooter } from './ui/dialog'
import { z } from 'zod'
import { useForm } from 'vee-validate'
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from './ui/form'
import { Input } from './ui/input'
import Alert from './ui/alert/Alert.vue'
import { AlertCircle } from 'lucide-vue-next'
import { AlertDescription, AlertTitle } from './ui/alert'
import { computed, ref } from 'vue'
import { useClientsStore } from '@/stores/clientsStore'
import type { Client } from '@/types/client'

const props = defineProps<{
    client?: Client | null
}>()

const emit = defineEmits<{
    (e: 'onSave'): void
    (e: 'onCancel'): void
}>()

const clientsStore = useClientsStore()
const error = ref<string | null>(null)
const isEditing = computed(() => Boolean(props.client?.id))

const validationSchema = toTypedSchema(
    z.object({
        name: z.string().min(1, 'Name is required'),
        email: z.string().email('Enter a valid email'),
        phone: z.string().min(1, 'Phone is required'),
        address: z.string().min(1, 'Address is required'),
        cityStateZip: z.string().min(1, 'City, state and zip are required')
    })
)

const { handleSubmit, isSubmitting } = useForm({
    validationSchema,
    initialValues: {
        name: props.client?.name ?? '',
        email: props.client?.email ?? '',
        phone: props.client?.phone ?? '',
        address: props.client?.address ?? '',
        cityStateZip: props.client?.cityStateZip ?? ''
    }
})

const onSubmit = handleSubmit(async (values) => {
    error.value = null
    try {
        if (isEditing.value && props.client?.id) {
            await clientsStore.update(props.client.id, values)
        } else {
            await clientsStore.create(values)
        }
        emit('onSave')
    } catch (e) {
        error.value = e instanceof Error ? e.message : String(e)
        console.error(e)
    }
})
</script>

<template>
    <form @submit.prevent="onSubmit" class="flex flex-col gap-4">
        <Alert variant="destructive" v-if="error">
            <AlertCircle class="w-4 h-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>
                {{ error }}
            </AlertDescription>
        </Alert>

        <FormField name="name" v-slot="{ componentField }">
            <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                    <Input type="text" placeholder="John Doe" v-bind="componentField" />
                </FormControl>
                <FormMessage />
            </FormItem>
        </FormField>

        <FormField name="email" v-slot="{ componentField }">
            <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                    <Input type="email" placeholder="name@example.com" v-bind="componentField" />
                </FormControl>
                <FormMessage />
            </FormItem>
        </FormField>

        <FormField name="phone" v-slot="{ componentField }">
            <FormItem>
                <FormLabel>Client Phone</FormLabel>
                <FormControl>
                    <Input type="tel" placeholder="+1 555 555 5555" v-bind="componentField" />
                </FormControl>
                <FormMessage />
            </FormItem>
        </FormField>

        <FormField name="address" v-slot="{ componentField }">
            <FormItem>
                <FormLabel>Address</FormLabel>
                <FormControl>
                    <Input type="text" placeholder="123 Main St" v-bind="componentField" />
                </FormControl>
                <FormMessage />
            </FormItem>
        </FormField>

        <FormField name="cityStateZip" v-slot="{ componentField }">
            <FormItem>
                <FormLabel>City, State, Zip</FormLabel>
                <FormControl>
                    <Input
                        type="text"
                        placeholder="Austin, TX 78701"
                        v-bind="componentField"
                    />
                </FormControl>
                <FormMessage />
            </FormItem>
        </FormField>

        <DialogFooter>
            <Button
                type="submit"
                class="min-w-24"
                :class="{ 'animate-pulse': isSubmitting }"
                :disabled="isSubmitting"
            >
                <template v-if="isSubmitting">
                    {{ isEditing ? 'Updating...' : 'Saving...' }}
                </template>
                <template v-else>
                    {{ isEditing ? 'Update' : 'Save' }}
                </template>
            </Button>
            <Button
                type="button"
                variant="outline"
                :disabled="isSubmitting"
                @click="emit('onCancel')"
            >
                Cancel
            </Button>
        </DialogFooter>
    </form>
</template>
