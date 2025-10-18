<script setup lang="ts">
import InvoiceForm from '@/components/InvoiceForm.vue'
import { Button } from '@/components/ui/button'
import { CardContent, CardDescription } from '@/components/ui/card'
import Card from '@/components/ui/card/Card.vue'
import CardHeader from '@/components/ui/card/CardHeader.vue'
import CardTitle from '@/components/ui/card/CardTitle.vue'
import { Skeleton } from '@/components/ui/skeleton'
import { useInvoiceStore } from '@/stores/InvoiceStore'
import type { Invoice } from '@/types/invoice'
import { storeToRefs } from 'pinia'
import { onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { toast } from 'vue-sonner'
import { RouterLink } from 'vue-router'
import { ArrowLeft } from 'lucide-vue-next'
const route = useRoute()
const router = useRouter()
const invoices = useInvoiceStore()
const { invoice, loading, fetching } = storeToRefs(invoices)

onMounted(() => {
    const id = Array.isArray(route.params.id) ? route.params.id.join() : route.params.id
    invoices.find(id)
})

const onFormSave = async (payloadInvocie: Invoice) => {
    if (!invoice.value) return
    console.log(invoice.value)
    await invoices.update(invoice.value.objectID, payloadInvocie)
    const timeout = setTimeout(() => {
        router.push({
            name: 'print-invoice',
            params: { id: route.params.id }
        })
    }, 2500)
    toast.success('Invoice actualizado Exitosamente', {
        position: 'top-center',
        description: 'Su Invoice ha sido actualizado exitosamente',
        closeButton: true,
        action: {
            label: 'Aceptar',
            onClick: () => {
                clearTimeout(timeout)
                router.push({
                    name: 'print-invoice',
                    params: { id: route.params.id }
                })
            }
        },
        onDismiss: () => {
            clearTimeout(timeout)
            router.push({
                name: 'print-invoice',
                params: { id: route.params.id }
            })
        }
    })
}
</script>
<template>
    <div class="flex flex-col gap-4 items-start w-full">
        <Button variant="ghost" to="/" :as="RouterLink">
            <ArrowLeft />
            Go Back to Dashboard
        </Button>

        <Card class="w-full">
            <CardHeader>
                <CardTitle> Edit Invoice</CardTitle>
                <CardDescription> Edit your Invoice </CardDescription>
            </CardHeader>

            <CardContent>
                <div v-if="fetching" class="flex flex-col gap-4">
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Skeleton class="h-14" />
                        <Skeleton class="h-14" />
                    </div>
                    <Skeleton class="h-14" />
                    <Skeleton class="h-14" />

                    <div class="grid grid-cols-3 gap-4">
                        <Skeleton class="h-14" />
                        <Skeleton class="h-14" />
                        <Skeleton class="h-14" />
                    </div>

                    <Skeleton class="h-14" />
                    <Skeleton class="h-14" />
                    <Skeleton class="h-22" />
                    <Skeleton class="h-22" />

                    <Skeleton class="h-4" />
                    <Skeleton class="h-4" />
                    <Skeleton class="h-4" />
                    <Skeleton class="h-4" />
                </div>

                <InvoiceForm
                    v-if="invoice"
                    :company="invoice.company"
                    :loading="loading"
                    :invoice="invoice"
                    @on-save="onFormSave"
                />
            </CardContent>
        </Card>
    </div>
</template>

<style lang="scss"></style>
