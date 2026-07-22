<script setup lang="ts">
import AtText from '@/components/atoms/AtText.vue'
import { Button } from '@/components/ui/button'

import { useCompanyStore } from '@/stores/companyStore'
import { useInvoiceStore } from '@/stores/InvoiceStore'
import { useProfileStore } from '@/stores/profileStore'
import { PlusIcon, RefreshCcw } from 'lucide-vue-next'
import { storeToRefs } from 'pinia'
import { computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { toast, Toaster } from 'vue-sonner'

const companyStore = useCompanyStore()
// company y router removidos (no usados tras refactor)
const route = useRoute()
const router = useRouter()
const invoicesStore = useInvoiceStore()
const profileStore = useProfileStore()
// Dialog removido: ya no se usa estado dialogOpen
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

onMounted(() => {
    if (!companyStore.company) {
        companyStore.fetchCompany()
    }
})

// uid eliminado: ya no se necesita en esta vista tras remover creación inline

const isNotPrintview = computed(() => {
    return !route.fullPath.includes('print')
})

const reload = () => {
    window.location.reload()
}

const invoiceLimitReached = computed(() =>
    profileStore.isUsageLimitReached('invoices')
)

const openCreateInvoice = () => {
    if (invoiceLimitReached.value) {
        toast.error('Invoice limit reached', {
            description: 'Upgrade your plan to create more invoices.'
        })
        return
    }

    router.push('/dashboard/invoices/new')
}
</script>
<template>
    <Toaster class="pointer-events-auto" />
    <div>
        <section class="flex flex-col gap-4">
            <div class="flex flex-col md:flex-row gap-4 md:justify-between" v-if="isNotPrintview">
                <at-text variant="h2"> Invoices </at-text>
                <div class="flex gap-4">
                    <Button color="primary" @click="reload">
                        <RefreshCcw class="size-4" /> Recargar</Button
                    >
                    <Button
                        :disabled="invoiceLimitReached"
                        @click="openCreateInvoice"
                    >
                        <PlusIcon class="size-4" />
                        {{ invoiceLimitReached ? 'Invoice limit reached' : 'Nuevo Invoice' }}
                    </Button>
                </div>
            </div>

            <RouterView />

            <!-- Dialog removido: ahora se navega a /dashboard/invoices/new -->
        </section>
    </div>
</template>
<style lang="scss"></style>
