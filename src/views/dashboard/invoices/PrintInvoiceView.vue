<script setup lang="ts">
import Button from '@/components/ui/button/Button.vue'
import Checkbox from '@/components/ui/checkbox/Checkbox.vue'
import Skeleton from '@/components/ui/skeleton/Skeleton.vue'
import { useCompanyStore } from '@/stores/companyStore'
import { useInvoiceStore } from '@/stores/InvoiceStore'
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'
import { ArrowLeftIcon, CheckSquare, FileIcon, Share2Icon, ShareIcon } from 'lucide-vue-next'
import { storeToRefs } from 'pinia'
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { RouterLink, useRoute } from 'vue-router'

const route = useRoute()
const invoices = useInvoiceStore()
const companyStore = useCompanyStore()
const pdfContent = ref(null)

const { invoice, fetching } = storeToRefs(invoices)
const { company } = storeToRefs(companyStore)

const id = computed(() =>
    Array.isArray(route.params.id) ? route.params.id.join() : route.params.id
)

onMounted(async () => {
    // await Promise.all([invoices.find(id), loadCompany()])
    await invoices.find(id.value)
    await loadCompany()

    updateScale()
    window.addEventListener('resize', updateScale)
})

const minWidth = 800
const scale = ref(1)

function updateScale() {
    const screenWidth = window.innerWidth
    scale.value = screenWidth < minWidth ? screenWidth / minWidth : 1
}

onUnmounted(() => {
    window.removeEventListener('resize', updateScale)
})

const loadCompany = async () => {
    if (invoice.value == null) return
    const { company } = invoice.value

    console.log(company.id)

    if (company.id) await companyStore.find(company.id)
}

const formatDate = (timestamp?: number): string => {
    if (!timestamp) return new Date().toLocaleDateString()
    return new Date(timestamp).toLocaleDateString()
}

const print = () => {
    window.print()
}

const share = async () => {
    try {
        // 1. Capture the div as canvas
        const element = pdfContent.value

        if (!element) return

        const canvas = await html2canvas(element, { scale: 2 })
        const imgData = canvas.toDataURL('image/png')

        // 2. Create PDF
        const pdf = new jsPDF('p', 'mm', 'a4')
        const pageWidth = pdf.internal.pageSize.getWidth()
        //const pageHeight = pdf.internal.pageSize.getHeight();

        // Scale image to fit page
        const imgProps = pdf.getImageProperties(imgData)
        const ratio = imgProps.width / imgProps.height
        const pdfWidth = pageWidth
        const pdfHeight = pageWidth / ratio

        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight)

        // 3a. Trigger download
        const name = `${invoice.value?.code}.pdf`
        pdf.save(name)

        // 3b. Optionally share on mobile (if supported)
        if (navigator.share) {
            const pdfBlob = pdf.output('blob')
            const file = new File([pdfBlob], 'invoice.pdf', { type: 'application/pdf' })

            await navigator.share({
                title: 'Invoice #123',
                text: 'Here is your invoice',
                files: [file]
            })
        }
    } catch (err) {
        console.error('PDF generation error:', err)
    }
}
</script>
<template>
    <div class="flex flex-col items-center mx-auto print:max-h-screen print:overflow-hidden w-full">
        <div class="flex flex-row w-full items-center justify-center text-center mb-4">
            <Button
                variant="ghost"
                :as="RouterLink"
                :to="`/dashboard/invoices/`"
                class="print:hidden"
            >
                <ArrowLeftIcon /> Go Back
            </Button>

            <Button variant="ghost" @click="print" class="print:hidden">
                <FileIcon /> <span>Download</span>
            </Button>

            <Button variant="ghost" @click="share" class="print:hidden">
                <Share2Icon /> <span>Share</span>
            </Button>
        </div>

        <div class="fetching" v-if="fetching && !invoice">
            <Skeleton class="w-full h-180" />
        </div>

        <!---->
        <div
            ref="pdfContent"
            class="min-w-180 w-180 md:scale-100 mx-auto p-6 text-sm z-20 relative print:scale-100 responsive-scale"
            :style="{
                transformOrigin: 'top left',
                transform: `scale(${scale})`
            }"
            v-if="invoice && company"
        >
            <!-- Header -->
            <img
                class="absolute w-1/2 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 opacity-20"
                :src="company.logoUrl"
            />

            <div class="flex flex-col mb-4">
                <div class="block font-bold text-lg text-center pb-6">
                    {{ invoice.code }}
                </div>
                <div class="flex justify-between items-center">
                    <img :src="company.logoUrl" alt="Company Logo" class="h-20 w-auto mb-2" />

                    <div class="text-right">
                        <p>
                            <span class="font-bold">Date:</span> {{ formatDate(invoice.createdAt) }}
                        </p>
                        <p><span class="font-bold">Estimate:</span> {{ invoice.stimates }}</p>
                        <div class="mt-2 text-right flex flex-col gap-2 mb-4">
                            <p>
                                <b>Services:</b>
                            </p>
                            <div
                                v-for="service in invoice.services"
                                :key="service"
                                class="text-green-600 font-semibold text-sm flex items-center gap-2 justify-end"
                            >
                                <CheckSquare class="h-3.5" />
                                <span> {{ service.toUpperCase() }} </span>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="flex justify-between">
                    <div>
                        <p class="font-bold">Contractor</p>
                        <p class="font-bold">{{ company.name }}</p>
                        <p><span class="font-bold">Address:</span> {{ company.address }}</p>
                        <p><span class="font-bold">City,State,Zip: </span> {{ company.zipcode }}</p>
                        <p><span class="font-bold">Phone</span>{{ company.phoneNumber }}</p>
                    </div>

                    <!-- Client Info -->
                    <div>
                        <p class="font-bold">Client Name: {{ invoice.customerName }}</p>
                        <p><b>Address:</b> {{ invoice.customerAddres }}</p>
                        <p>
                            <b>City, State, Zip:</b> {{ invoice.city }}, {{ invoice.state }}
                            {{ invoice.zip }}
                        </p>
                        <p><b>Phone:</b> {{ invoice.phone }}</p>
                    </div>
                </div>
            </div>

            <table class="w-full border-t">
                <thead>
                    <tr>
                        <th>
                            <p class="font-semibold border-b py-4 text-left c">
                                Project Description
                            </p>
                        </th>
                        <th>
                            <p class="font-semibold border-b py-4 text-right">Amount</p>
                        </th>
                    </tr>
                </thead>

                <tbody>
                    <tr>
                        <td>
                            <p class="py-4">
                                {{ invoice.description }}
                            </p>
                        </td>
                        <td></td>
                    </tr>
                </tbody>
            </table>

            <!-- Total -->
            <div class="text-right text-lg font-bold">
                Total: <br />
                ${{ invoice.total }}
            </div>

            <div class="text-center text-sm mb-6">
                <p><b>Thank you for your preference!</b></p>
                <p>if you have any question concerning this document</p>
                <p class="font-bold" v-if="company">
                    {{ company.email || 'franciscopainting@gmail.com' }}
                </p>
                <div class="flex flex-row items-center justify-center text-sm gap-2 mt-2">
                    Materials:
                    <input type="checkbox" :checked="!invoice.materials" class="font" />Company
                    <input type="checkbox" :checked="invoice.materials" class="font" /> Client
                </div>
            </div>

            <!-- Terms -->
            <div class="mt-4 text-sm">
                <p v-html="company.terms"></p>
            </div>

            <!-- Signatures -->
            <div class="flex justify-between items-end mt-8">
                <div class="text-center">
                    <div class="border-t border-black w-40 mx-auto"></div>
                    <p class="mt-1 text-xs">Signature Client</p>
                </div>
                <div class="text-center">
                    <p
                        :src="company.signature"
                        alt="Signature"
                        class="font-great-vibes text-2xl h-10 mb-1"
                    >
                        {{ company.signature }}
                    </p>
                    <div class="border-t border-black w-40 mx-auto"></div>
                    <p class="mt-1 text-xs">Signature Company</p>
                </div>
            </div>
        </div>
    </div>
</template>
<style lang="css" scoped>
@media print {
    .responsive-scale {
        transform: scale(1) !important;
    }
}
</style>
