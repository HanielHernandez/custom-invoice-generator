<script setup lang="ts">
import Button from '@/components/ui/button/Button.vue'
import Skeleton from '@/components/ui/skeleton/Skeleton.vue'
import { useCompanyStore } from '@/stores/companyStore'
import { useInvoiceStore } from '@/stores/InvoiceStore'
import { ArrowLeftIcon, CheckSquare, FileIcon, Share2Icon } from 'lucide-vue-next'
import { storeToRefs } from 'pinia'
import { onMounted, ref, watch, computed, onUnmounted } from 'vue'
import { useRoute, RouterLink } from 'vue-router'
import html2pdf from 'html2pdf.js'

const route = useRoute()
const logoBase64 = ref('')
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
    if (company.id) await companyStore.find(company.id)
}

watch(company, async () => {
    if (company.value == null) return
    logoBase64.value = await loadImageAsBase64(company.value.logoUrl)
})

const formatDate = (timestamp?: number): string => {
    if (!timestamp) return new Date().toLocaleDateString()
    return new Date(timestamp).toLocaleDateString()
}

const print = () => {
    window.print()
}

const loadImageAsBase64 = async (url: string): Promise<string> => {
    return new Promise((resolve, reject) => {
        const img = new Image()
        img.crossOrigin = 'anonymous' // important for CORS
        img.src = url
        img.onload = () => {
            const canvas = document.createElement('canvas')
            canvas.width = img.width
            canvas.height = img.height
            const ctx = canvas.getContext('2d')
            if (!ctx) return reject('Canvas not supported')
            ctx.drawImage(img, 0, 0)
            resolve(canvas.toDataURL('image/png'))
        }
        img.onerror = reject
    })
}

const share = async () => {
    try {
        const element = pdfContent.value
        if (!element) return

        // File name from your invoice
        const name = `${invoice.value?.code || 'invoice'}.pdf`

        // 1. Generate PDF as Blob
        const opt = {
            margin: 0.5,
            filename: name,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: {
                scale: 2,
                useCORS: true, // 👈 permite imágenes externas
                allowTaint: true
            }, // 👈 ensure images load
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
        }

        const pdfBlob = await html2pdf().set(opt).from(element).outputPdf('blob')

        // 2a. Trigger download
        html2pdf().set(opt).from(element).save()

        // 2b. Optionally share on mobile
        if (navigator.share) {
            const file = new File([pdfBlob], name, { type: 'application/pdf' })
            await navigator.share({
                title: 'Invoice',
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
                :src="logoBase64"
                crossorigin="anonymous"
            />

            <div class="flex flex-col mb-4">
                <div class="block font-bold text-lg text-center pb-6">
                    {{ invoice.code }}
                </div>
                <div class="flex justify-between items-center">
                    <img
                        :src="logoBase64"
                        crossorigin="anonymous"
                        alt="Company Logo"
                        class="h-20 w-auto mb-2"
                    />

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
