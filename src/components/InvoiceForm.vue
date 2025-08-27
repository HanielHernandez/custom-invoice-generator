<script setup lang="ts">
import { useForm } from 'vee-validate'
import { z } from 'zod'
import { toTypedSchema } from '@vee-validate/zod'
import {
    FormField,
    FormItem,
    FormLabel,
    FormControl,
    FormMessage,
    FormDescription
} from '@/components/ui/form'
import Input from './ui/input/Input.vue'
import Textarea from './ui/textarea/Textarea.vue'
import Button from './ui/button/Button.vue'
import Checkbox from './ui/checkbox/Checkbox.vue'

import type { Company } from '@/types/company'
import type { Invoice } from '@/types/invoice'
import LoadingSpinner from './ui/LoadingSpinner.vue'
import { HamburgerIcon, MenuIcon, StoreIcon } from 'lucide-vue-next'

const {
    company,
    loading = false,
    invoice
} = defineProps<{
    company: Company
    loading: boolean
    invoice?: Invoice
}>()

const emit = defineEmits<{
    (e: 'onSave', payload: Invoice): void
    (e: 'onCancle.'): void
}>()

const invoiceSchema = z.object({
    name: z.string().min(1, 'Name is required'),
    stimates: z.string().min(1, 'Estimate is required'),
    customerName: z.string().min(1, 'Customer name is required'),
    customerAddres: z.string().min(1, 'Address is required'),
    city: z.string().min(1, 'City is required'),
    state: z.string().min(1, 'State is required'),
    zip: z.string().min(1, 'ZIP is required'),
    phone: z.string().min(1, 'Phone is required'),
    total: z.number().min(1, 'Total is required'),
    description: z.string(),
    services: z.array(z.string()),
    materials: z.boolean().optional()
})

const { handleSubmit, handleReset } = useForm({
    validationSchema: toTypedSchema(invoiceSchema),
    initialValues: invoice ? invoice : { services: [], materials: false }
})

const onSubmit = handleSubmit((data) => {
    emit('onSave', data as Invoice)
})
</script>

<template>
    <form @submit.prevent="onSubmit" class="space-y-4">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField v-slot="{ componentField }" name="name">
                <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                        <Input v-bind="componentField" placeholder="Enter invoice name" />
                    </FormControl>
                    <FormMessage />
                </FormItem>
            </FormField>

            <FormField v-slot="{ componentField }" name="stimates">
                <FormItem>
                    <FormLabel>Estimate</FormLabel>
                    <FormControl>
                        <Input v-bind="componentField" placeholder="Enter estimate" />
                    </FormControl>
                    <FormMessage />
                </FormItem>
            </FormField>
        </div>

        <FormField v-slot="{ componentField }" name="customerName">
            <FormItem>
                <FormLabel>Customer Name</FormLabel>
                <FormControl>
                    <Input v-bind="componentField" placeholder="Enter customer name" />
                </FormControl>
                <FormMessage />
            </FormItem>
        </FormField>

        <FormField v-slot="{ componentField }" name="customerAddres">
            <FormItem>
                <FormLabel>Customer Address</FormLabel>
                <FormControl>
                    <Input v-bind="componentField" placeholder="Enter customer address" />
                </FormControl>
                <FormMessage />
            </FormItem>
        </FormField>

        <div class="grid grid-cols-3 gap-4">
            <FormField v-slot="{ componentField }" name="city">
                <FormItem>
                    <FormLabel>City</FormLabel>
                    <FormControl>
                        <Input v-bind="componentField" placeholder="Enter city" />
                    </FormControl>
                    <FormMessage />
                </FormItem>
            </FormField>
            <FormField v-slot="{ componentField }" name="state">
                <FormItem>
                    <FormLabel>State</FormLabel>
                    <FormControl>
                        <Input v-bind="componentField" placeholder="Enter state" />
                    </FormControl>
                    <FormMessage />
                </FormItem>
            </FormField>
            <FormField v-slot="{ componentField }" name="zip">
                <FormItem>
                    <FormLabel>ZIP</FormLabel>
                    <FormControl>
                        <Input v-bind="componentField" placeholder="Enter ZIP code" />
                    </FormControl>
                    <FormMessage />
                </FormItem>
            </FormField>
        </div>

        <FormField v-slot="{ componentField }" name="phone">
            <FormItem>
                <FormLabel>Phone</FormLabel>
                <FormControl>
                    <Input v-bind="componentField" placeholder="Enter phone number" />
                </FormControl>
                <FormMessage />
            </FormItem>
        </FormField>

        <FormField v-slot="{ componentField }" name="total">
            <FormItem>
                <FormLabel>Total</FormLabel>
                <FormControl>
                    <Input type="number" v-bind="componentField" placeholder="Enter total amount" />
                </FormControl>
                <FormMessage />
            </FormItem>
        </FormField>

        <FormField v-slot="{ componentField }" name="description">
            <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                    <Textarea v-bind="componentField" rows="10" placeholder="Enter description" />
                </FormControl>
                <FormMessage />
            </FormItem>
        </FormField>

        <label
            class="flex items-center gap-2 text-sm leading-none font-medium select-none group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50 peer-disabled:cursor-not-allowed peer-disabled:opacity-50 data-[error=true]:text-destructive-foreground"
        >
            Services
        </label>
        <FormField
            v-for="service in company.tags"
            v-slot="{ value, handleChange }"
            :key="service"
            type="checkbox"
            :value="service"
            :unchecked-value="false"
            name="services"
        >
            <FormItem class="flex flex-row items-start space-x-3 space-y-0">
                <FormControl>
                    <Checkbox
                        :model-value="value.includes(service)"
                        @update:model-value="handleChange"
                    />
                </FormControl>
                <FormLabel class="font-normal">
                    {{ service }}
                </FormLabel>
            </FormItem>
        </FormField>
        <div v-if="!company.tags.length" class="text-sm text-neutral-600 leading-5">
            <p>
                No services saved for your company, press menu button (<span>
                    <MenuIcon class="inline h-3.5" /> </span
                >) at the top left part of the screen and then press
                <b> <StoreIcon class="inline h-3.5" /> company</b> to add them
            </p>
        </div>

        <!-- <FormField name="services" v-if="company">
            <FormItem>
                <FormLabel>Services</FormLabel>
                <FormControl>

                    <div v-for="(service, idx) in company.tags" :key="service" class="flex items-center space-x-2">

                        <Checkbox id="service" :value="service" type="checkbox"
                            @update:model-value="(val) => val ? pushService(service) : remove(idx)"
                            placeholder="Service" />
                        <label for="terms"
                            class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                            {{ service }}
                        </label>
                    </div>
                </FormControl>
                <FormMessage />
            </FormItem>
        </FormField> -->

        <FormField v-slot="{ value, handleChange }" name="materials">
            <FormItem class="flex flex-col items-start space-x-3 space-y-0 mt-3">
                <FormLabel>Include Materials</FormLabel>
                <FormControl class="flex flex-row gap-2 items-center">
                    <div>
                        <Checkbox :model-value="value" @update:model-value="handleChange" />
                        <FormDescription
                            >By checking this box the invoice will include the cost of any material
                            to the client</FormDescription
                        >
                    </div>
                </FormControl>
            </FormItem>
        </FormField>

        <div class="flex gap-4 pt-4 sticky botom-0 left-0">
            <Button type="submit"
                >Save
                <LoadingSpinner class="ml-2" v-if="loading" />
            </Button>
            <Button type="button" variant="outline" @click="handleReset">Reset</Button>
        </div>
    </form>
</template>

<style scoped>
/* optional additional styling */
</style>
