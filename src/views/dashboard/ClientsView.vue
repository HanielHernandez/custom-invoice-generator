<script setup lang="ts">
import AtText from '@/components/atoms/AtText.vue'
import ClientForm from '@/components/ClientForm.vue'
import ClientsTable from '@/components/ClientsTable.vue'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader } from '@/components/ui/dialog'
import DialogDescription from '@/components/ui/dialog/DialogDescription.vue'
import DialogTitle from '@/components/ui/dialog/DialogTitle.vue'
import type { Client } from '@/types/client'
import { PlusIcon } from 'lucide-vue-next'
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { Toaster } from 'vue-sonner'

const dialogOpen = ref(false)
const editingClient = ref<Client | null>(null)
const router = useRouter()

const isEditing = computed(() => Boolean(editingClient.value?.id))

const openCreateDialog = () => {
    editingClient.value = null
    dialogOpen.value = true
}

const openEditDialog = (client: Client) => {
    editingClient.value = client
    dialogOpen.value = true
}

const closeDialog = () => {
    dialogOpen.value = false
    editingClient.value = null
}

const onFormSave = () => {
    closeDialog()
    setTimeout(() => router.go(0), 800)
}
</script>

<template>
    <Toaster class="pointer-events-auto" rich-colors />
    <section class="flex flex-col gap-4">
        <div class="flex items-center justify-between">
            <AtText variant="h2">Clients</AtText>
            <Button @click="openCreateDialog">
                <PlusIcon class="h-4 w-4" />
                Add Client
            </Button>
        </div>

        <ClientsTable @edit="openEditDialog" />

        <Dialog :open="dialogOpen" @update:open="(o) => (o ? (dialogOpen = true) : closeDialog())">
            <DialogContent class="max-w-xl">
                <DialogHeader>
                    <DialogTitle>{{ isEditing ? 'Edit Client' : 'Add Client' }}</DialogTitle>
                    <DialogDescription>
                        {{
                            isEditing
                                ? 'Update the client information below'
                                : 'Fill in the client information below'
                        }}
                    </DialogDescription>
                </DialogHeader>
                <ClientForm
                    :key="editingClient?.id ?? 'new'"
                    :client="editingClient"
                    @on-cancel="closeDialog"
                    @on-save="onFormSave"
                />
            </DialogContent>
        </Dialog>
    </section>
</template>
