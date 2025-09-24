<script setup lang="ts">
import { useForm } from 'vee-validate'
import { z } from 'zod'
import { toTypedSchema } from '@vee-validate/zod'
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form'
import Input from './ui/input/Input.vue'
import Textarea from './ui/textarea/Textarea.vue'
import Button from './ui/button/Button.vue'
import Checkbox from './ui/checkbox/Checkbox.vue'

import type { Company } from '@/types/company'
import type { Invoice } from '@/types/invoice'
import LoadingSpinner from './ui/LoadingSpinner.vue'
import { MenuIcon, StoreIcon } from 'lucide-vue-next'

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
    zip: z.string().min(1, 'ZIP is required'),
    phone: z.string().min(1, 'Phone is required'),
    total: z.string().optional(),
    description: z.string(),
    services: z.array(z.string()),
    materials: z.boolean().optional()
})

// Tipo inferido desde el esquema
export type InvoiceFormValues = z.infer<typeof invoiceSchema>

const { handleSubmit, handleReset } = useForm<InvoiceFormValues>({
    validationSchema: toTypedSchema(invoiceSchema),
    initialValues: invoice
        ? {
              ...invoice,
              total: invoice.total !== undefined ? String(invoice.total) : undefined
          }
        : { services: [], materials: false }
})

const onSubmit = handleSubmit((data: InvoiceFormValues) => {
    emit('onSave', data as unknown as Invoice)
})

// Helper: suma una expresión con +
function sumPlusSeparated(expr: string): number {
    if (!expr) return 0
    return expr
        .split(/[+,]/) // ahora separa por + y por coma
        .map((p) => p.trim())
        .filter((p) => p.length > 0)
        .map((p) => Number(p.replace(/,/g, '.')) || 0)
        .reduce((a, b) => a + b, 0)
}
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

        <FormField v-slot="{ componentField }" name="zip">
            <FormItem>
                <FormLabel>City, State, ZIP</FormLabel>
                <FormControl>
                    <Input v-bind="componentField" placeholder="Enter ZIP and city" />
                </FormControl>
                <FormMessage />
            </FormItem>
        </FormField>

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
                    <Input
                        v-bind="componentField"
                        type="text"
                        placeholder="Enter total amount or expression (e.g. 10+20+30)"
                        @blur="
                            componentField.onChange(
                                String(sumPlusSeparated(String(componentField.modelValue)))
                            )
                        "
                    />
                </FormControl>
                <FormDescription>Puede escribir una suma: 100+250+30</FormDescription>
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
                <FormLabel>Include Materials to:</FormLabel>

                <select
                    name="materials"
                    id="materials"
                    :value="value"
                    class="border px-3 py-2 rounded shadow-xs w-full min-w-10"
                    :onchange="handleChange"
                    placeholder="include materials"
                >
                    <option :value="true">Client</option>
                    <option :value="false">Company</option>
                </select>

                <!--
                <FormControl class="flex flex-row gap-2 items-center">
                    <div>
                        <Checkbox :model-value="value" @update:model-value="handleChange" />
                        <FormDescription
                            >By checking this box the invoice will include the cost of any material
                            to the client</FormDescription
                        >
                    </div>


                </FormControl> -->
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
