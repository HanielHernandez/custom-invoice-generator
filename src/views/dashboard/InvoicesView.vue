<script setup lang="ts">
import AtText from '@/components/atoms/AtText.vue';
import InvoiceForm from '@/components/InvoiceForm.vue';
import InvoicesTable from '@/components/InvoicesTable.vue';
import { Button } from '@/components/ui/button';
import { DialogHeader, Dialog, DialogContent } from '@/components/ui/dialog';
import DialogDescription from '@/components/ui/dialog/DialogDescription.vue';
import DialogTitle from '@/components/ui/dialog/DialogTitle.vue';

import { auth } from '@/lib/firebase';
import { useCompanyStore } from '@/stores/companyStore';
import { userInvoiceStore } from '@/stores/InvoiceStore';
import type { Invoice } from '@/types/Invoice';
import { PlusIcon } from 'lucide-vue-next';
import { storeToRefs } from 'pinia';
import { computed, onMounted, ref } from 'vue';

const companyStore = useCompanyStore()
const { company } = storeToRefs(companyStore)

const invoicesStore = userInvoiceStore()
const dialogOpen = ref(false)

const onFormSave = async (values: Invoice) => {

    console.log(company.value === null)

    if (company.value === null) {
        return
    }

    try {
        await invoicesStore.create({
            ...values,
            company: company.value,
            uid: uid.value || "",
            createdAt: Date.now()
        })

        dialogOpen.value = false

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


</script>
<template>
    <div>
        <section class="flex flex-col gap-4">
            <div class="flex justify-between">
                <at-text variant="h2"> Invoices </at-text>
                <Button @click="dialogOpen = true">
                    <PlusIcon class="h-4 w-4" /> New Invoice
                </Button>
            </div>


            <InvoicesTable />


            <Dialog :open="dialogOpen" @update:open="(o) => dialogOpen = o">
                <DialogContent class="w-full md:max-w-3xl md:max-h-200 overflow-auto">
                    <DialogHeader>
                        <DialogTitle>
                            New Invoice
                        </DialogTitle>
                        <DialogDescription>
                            Fill the folowing form to create a new user
                        </DialogDescription>
                    </DialogHeader>
                    <InvoiceForm v-if="companyStore.company" :loading="invoicesStore.loading"
                        :company="companyStore.company" @on-cancel="dialogOpen = false" @on-save="onFormSave" />
                </DialogContent>
            </Dialog>
        </section>

    </div>
</template>
<style lang="scss"></style>
