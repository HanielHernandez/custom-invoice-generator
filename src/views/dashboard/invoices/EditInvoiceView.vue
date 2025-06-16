<script setup lang="ts">
import InvoiceForm from '@/components/InvoiceForm.vue';
import { CardContent, CardDescription } from '@/components/ui/card';
import Card from '@/components/ui/card/Card.vue';
import CardHeader from '@/components/ui/card/CardHeader.vue';
import CardTitle from '@/components/ui/card/CardTitle.vue';
import { Skeleton } from '@/components/ui/skeleton';
import { useInvoiceStore } from '@/stores/InvoiceStore';
import type { Invoice } from '@/types/invoice';
import { storeToRefs } from 'pinia';
import { onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { toast } from 'vue-sonner';

const route = useRoute()
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

    toast("Invoice updated succesfully", {
        position: "top-center",
        description: "Invoice was successuflly updated reload to refresh the page",
        closeButton: true,
    })


}
</script>
<template>
    <Card>
        <CardHeader>
            <CardTitle> Edit Invoice</CardTitle>
            <CardDescription>
                Edit your Invoice
            </CardDescription>
        </CardHeader>

        <CardContent>

            <div v-if="fetching" class="flex flex-col gap-4">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Skeleton class="h-14" />
                    <Skeleton class="h-14" />
                </div>
                <Skeleton class="h-14" />
                <Skeleton class="h-14" />

                <div class="grid grid-cols-3  gap-4">
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


            <InvoiceForm v-if="invoice" :company="invoice.company" :loading="loading" :invoice="invoice"
                @on-save="onFormSave" />
        </CardContent>
    </Card>
</template>

<style lang="scss"></style>
