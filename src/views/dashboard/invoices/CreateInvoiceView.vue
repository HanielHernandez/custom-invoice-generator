<script lang="ts" setup>
import InvoiceForm from '@/components/InvoiceForm.vue'
import Button from '@/components/ui/button/Button.vue'
import Card from '@/components/ui/card/Card.vue'
import CardContent from '@/components/ui/card/CardContent.vue'
import CardDescription from '@/components/ui/card/CardDescription.vue'
import CardHeader from '@/components/ui/card/CardHeader.vue'
import CardTitle from '@/components/ui/card/CardTitle.vue'
import { auth } from '@/lib/firebase'
import { generateInvoiceCode } from '@/lib/utils'
import { useCompanyStore } from '@/stores/companyStore'
import { useInvoiceStore } from '@/stores/InvoiceStore'
import type { Invoice } from '@/types/invoice'
import { ArrowLeft } from 'lucide-vue-next'
import { storeToRefs } from 'pinia'
import { computed, onMounted, ref, watch } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { toast } from 'vue-sonner'

const companyStore = useCompanyStore()
const { company } = storeToRefs(companyStore)
const router = useRouter()
const invoicesStore = useInvoiceStore()
const dialogOpen = ref(false)
const { error } = storeToRefs(invoicesStore)

const uid = computed(() => {
    return auth.currentUser?.uid
})

const onFormSave = async (values: Invoice) => {
    console.log(company.value === null)

    if (company.value === null) {
        return
    }

    try {
        const id = await invoicesStore.create({
            ...values,
            code: generateInvoiceCode('INV'),
            company: company.value,
            uid: uid.value || '',
            createdAt: Date.now(),
            deleted: false,
            deletedAt: null
        })

        dialogOpen.value = false

        toast.success('Invoice creado Exitosamente', {
            position: 'top-center',
            richColors: true,
            description: 'Su invoice ha sido guardado correctamente',
            closeButton: true,
            action: {
                label: 'Aceptar',
                onClick: () =>
                    router.push({
                        name: 'print-invoice',
                        params: { id }
                    })
            },
            onDismiss: () => {
                router.push({
                    name: 'print-invoice',
                    params: { id }
                })
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

watch(error, (newError) => {
    if (newError.title) {
        toast.error(newError.title, {
            description: newError.description,
            closeButton: true,
            onDismiss: invoicesStore.resetError
        })
    }
})
const onFormCancel = () => {
    router.push({ name: 'dashboard' })
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
                <CardTitle> Nuevo invoice</CardTitle>
                <CardDescription>
                    <p v-if="companyStore.company">
                        Fill the folowing form to create a new invoice
                    </p>
                    <p v-else>Please configure your company before creating a new Invoice</p>
                </CardDescription>
            </CardHeader>

            <CardContent>
                <InvoiceForm
                    v-if="companyStore.company"
                    :loading="invoicesStore.loading"
                    :company="companyStore.company"
                    @on-cancel="onFormCancel"
                    @on-save="onFormSave"
                />
            </CardContent>
        </Card>
    </div>
</template>
