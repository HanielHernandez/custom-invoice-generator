<script setup lang="ts">
import Button from '@/components/ui/button/Button.vue'
import Skeleton from '@/components/ui/skeleton/Skeleton.vue'
import { userInvoiceStore } from '@/stores/InvoiceStore'
import { Printer, PrinterIcon } from 'lucide-vue-next'
import { storeToRefs } from 'pinia'
import { onMounted } from 'vue'
import { useRoute } from 'vue-router'


const route = useRoute()
const invoices = userInvoiceStore()
const { invoice, fetching } = storeToRefs(invoices)

onMounted(() => {
    const id = Array.isArray(route.params.id) ? route.params.id.join() : route.params.id
    invoices.find(id)
})


const formatDate = (timestamp?: number): string => {
    if (!timestamp) return new Date().toLocaleDateString()
    return new Date(timestamp).toLocaleDateString()
}

const print = () => {
    window.print()
}

</script>
<template>
    <div>
        <div class="fetching" v-if="fetching && !invoice">
            <Skeleton class="w-full h-92" />
        </div>

        <div>
            <Button variant="ghost" @click="print">
                <PrinterIcon />
            </Button>
        </div>


        <!---->
        <div class="max-w-4xl mx-auto p-6 bg-white shadow rounded-lg text-sm" v-if="invoice">
            <!-- Header -->
            <div class="flex justify-between items-center border-b pb-4 mb-4">
                <div>
                    <img :src="invoice.company.logoUrl" alt="Company Logo" class="h-20 w-auto mb-2" />
                    <p class="font-bold">{{ invoice.company.name }}</p>
                    <p>{{ invoice.company.address }}</p>
                    <p>{{ invoice.company.zipcode }}</p>
                    <p>{{ invoice.company.phoneNumber }}</p>
                </div>
                <div class="text-right">
                    <p class="text-xs text-gray-500">Date: {{ formatDate(invoice.createdAt) }}</p>
                    <p class="text-xs text-gray-500">Estimate: {{ invoice.stimates }}</p>
                    <div class="mt-2">
                        <p v-for="service in invoice.services" :key="service" class="text-green-600 font-semibold">
                            ✓ {{ service.toUpperCase() }}
                        </p>
                    </div>
                </div>
            </div>

            <!-- Client Info -->
            <div class="mb-4">
                <p class="font-bold">Client Name: {{ invoice.customerName }}</p>
                <p>Address: {{ invoice.customerAddres }}</p>
                <p>{{ invoice.city }}, {{ invoice.state }} {{ invoice.zip }}</p>
                <p>Phone: {{ invoice.phone }}</p>
            </div>

            <!-- Description -->
            <div class="mb-4">
                <p class="font-semibold border-b mb-2 pb-1">Project Description</p>
                <p>{{ invoice.description }}</p>
            </div>

            <!-- Total -->
            <div class="text-right text-lg font-bold">
                Total: ${{ invoice.total }}
            </div>

            <!-- Materials -->
            <div class="mt-4">
                <p class="text-sm">Materials: <span class="font-semibold">{{ invoice.materials ? '✔ Company' : 'Client'
                        }}</span></p>
            </div>

            <!-- Terms -->
            <div class="mt-4 text-xs text-gray-600">
                <p v-html="invoice.company.terms"></p>
            </div>

            <!-- Signatures -->
            <div class="flex justify-between items-end mt-8">
                <div class="text-center">
                    <div class="border-t border-black w-40 mx-auto"></div>
                    <p class="mt-1 text-xs">Signature Client</p>
                </div>
                <div class="text-center">
                    <img :src="invoice.company.signature" alt="Signature" class="h-10 mb-1" />
                    <div class="border-t border-black w-40 mx-auto"></div>
                    <p class="mt-1 text-xs">Signature Company</p>
                </div>
            </div>
        </div>



    </div>
</template>
<style lang="scss"></style>
