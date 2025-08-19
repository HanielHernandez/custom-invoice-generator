<script setup lang="ts">
import AtText from '@/components/atoms/AtText.vue'
import InvoiceForm from '@/components/InvoiceForm.vue'
import { Button } from '@/components/ui/button'
import { DialogHeader, Dialog, DialogContent } from '@/components/ui/dialog'
import DialogDescription from '@/components/ui/dialog/DialogDescription.vue'
import DialogTitle from '@/components/ui/dialog/DialogTitle.vue'

import { auth } from '@/lib/firebase'
import { generateInvoiceCode } from '@/lib/utils'
import { useCompanyStore } from '@/stores/companyStore'
import { useInvoiceStore } from '@/stores/InvoiceStore'
import type { Invoice } from '@/types/invoice'
import { PlusIcon } from 'lucide-vue-next'
import { storeToRefs } from 'pinia'
import { computed, onMounted, ref, watch } from 'vue'
import * as instantsearch from 'vue-instantsearch/vue3/es'
import { useRoute, useRouter } from 'vue-router'
import { toast, Toaster } from 'vue-sonner'

console.log(instantsearch)

const companyStore = useCompanyStore()
const { company } = storeToRefs(companyStore)
const router = useRouter()
const route = useRoute()
const invoicesStore = useInvoiceStore()
const dialogOpen = ref(false)
const { error } = storeToRefs(invoicesStore)

watch(error, (newError) => {
    if (newError.title) {
        toast.error(newError.title, {
            description: newError.description,
            closeButton: true,
            onDismiss: invoicesStore.resetError
        })
    }
})

const onFormSave = async (values: Invoice) => {
    console.log(company.value === null)

    if (company.value === null) {
        return
    }

    try {
        await invoicesStore.create({
            ...values,
            code: generateInvoiceCode('INV'),
            company: company.value,
            uid: uid.value || '',
            createdAt: Date.now(),
            deleted: false,
            deletedAt: null
        })

        dialogOpen.value = false

        toast('Invoice created succesfully', {
            position: 'top-center',
            description: 'your invoice hast been save successfully',
            closeButton: true,
            onDismiss: () => {
                router.go(0)
            }
        })
    } catch (e) {
        console.error(e)
    }
}

onMounted(() => {
    if (!companyStore.company) {
        companyStore.fetchCompany()
    }
})

const uid = computed(() => {
    return auth.currentUser?.uid
})

const isNotPrintview = computed(() => {
    return !route.fullPath.includes('print')
})
</script>
<template>
    <Toaster class="pointer-events-auto" />
    <div>
        <section class="flex flex-col gap-4">
            <div class="flex justify-between" v-if="isNotPrintview">
                <at-text variant="h2"> Invoices </at-text>
                <Button @click="dialogOpen = true">
                    <PlusIcon class="h-4 w-4" /> New Invoice
                </Button>
            </div>

            <RouterView />

            <Dialog :open="dialogOpen" @update:open="(o) => (dialogOpen = o)">
                <DialogContent class="w-full md:max-w-3xl overflow-auto">
                    <DialogHeader>
                        <DialogTitle> New Invoice </DialogTitle>
                        <DialogDescription>
                            <p v-if="companyStore.company">
                                Fill the folowing form to create a new user
                            </p>
                            <p v-else>
                                Please configure your company before creating a new Invoice
                            </p>
                        </DialogDescription>
                    </DialogHeader>
                    <InvoiceForm
                        v-if="companyStore.company"
                        :loading="invoicesStore.loading"
                        :company="companyStore.company"
                        @on-cancel="dialogOpen = false"
                        @on-save="onFormSave"
                    />
                </DialogContent>
            </Dialog>
        </section>
    </div>
</template>
<style lang="scss"></style>
