<script setup lang="ts">
import AtText from '@/components/atoms/AtText.vue';
import { Button } from '@/components/ui/button';
import { DialogHeader, Dialog, DialogContent } from '@/components/ui/dialog';
import DialogDescription from '@/components/ui/dialog/DialogDescription.vue';
import DialogTitle from '@/components/ui/dialog/DialogTitle.vue';
import UserForm from '@/components/UserForm.vue';
import { useUserStore } from '@/stores/usersStore';
import { PlusIcon } from 'lucide-vue-next';
import { computed, onBeforeMount, onMounted, ref } from 'vue';
import UsersTable from './UsersTable.vue';

const dialogOpen = ref(false)
const usersStore = useUserStore()

onMounted(async () => {

    usersStore.fetch()
})

const items = computed(() => usersStore.items)
const loading = computed(() => usersStore.loading)

const onFormSave = () => {
    usersStore.reset()
    dialogOpen.value = false
}


onBeforeMount(() => {
    usersStore.setLastItem(undefined)
})


</script>
<template>
    <section class="flex flex-col gap-4">
        <div class="flex justify-between">
            <at-text variant="h2"> Users </at-text>
            <Button @click="dialogOpen = true">
                <PlusIcon class="h-4 w-4" /> New User
            </Button>
        </div>
        <UsersTable :items="items" :loading="loading" />
        <Dialog :open="dialogOpen" @update:open="(o) => dialogOpen = o">
            <DialogContent class="max-w-3xl">
                <DialogHeader>
                    <DialogTitle>
                        New User
                    </DialogTitle>
                    <DialogDescription>
                        Fill the folowing form to create a new user
                    </DialogDescription>
                </DialogHeader>
                <UserForm @on-cancel="dialogOpen = false" @on-save="onFormSave()" />
            </DialogContent>
        </Dialog>
    </section>
</template>
<style lang="scss"></style>
