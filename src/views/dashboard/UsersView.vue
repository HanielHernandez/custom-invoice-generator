<script setup lang="ts">
import AtText from '@/components/atoms/AtText.vue';
import { Button } from '@/components/ui/button';
import { DialogHeader, Dialog, DialogContent } from '@/components/ui/dialog';
import DialogDescription from '@/components/ui/dialog/DialogDescription.vue';
import DialogTitle from '@/components/ui/dialog/DialogTitle.vue';
import UserForm from '@/components/UserForm.vue';
import { useUserStore } from '@/stores/usersStore';
import { PlusIcon, SearchIcon } from 'lucide-vue-next';
import { computed, onMounted, ref } from 'vue';
import UsersTable from './UsersTable.vue';
import { useRoute } from 'vue-router';
import Input from '@/components/ui/input/Input.vue';


const dialogOpen = ref(false)
const usersStore = useUserStore()
const route = useRoute()
const emailSearch = ref('')
onMounted(async () => {
    usersStore.reset()
    const limit = route.query.limit ? parseInt(route.query.limit as string) : 10
    console.log(limit)
    await usersStore.fetch(limit)
})

const items = computed(() => usersStore.items)
const loading = computed(() => usersStore.loading)

const onFormSave = () => {
    usersStore.reset()
    dialogOpen.value = false
}

const loadMoreUser = async () => {
    return usersStore.fetch()
}

const filterByEmail = async () => {
    await usersStore.filterByEmail(emailSearch.value)
}

</script>
<template>
    <section class="flex flex-col gap-4">
        <div class="flex justify-between">
            <at-text variant="h2"> Users </at-text>
            <Button @click="dialogOpen = true">
                <PlusIcon class="h-4 w-4" /> New User
            </Button>
        </div>

        <form @submit.prevent="filterByEmail">
            <div class="relative">
                <Input type="search" v-model="emailSearch" class="bg-white pl-12" placeholder="User Email" />
                <Button type="submit" variant="outline" class="absolute top-0 left-0 rounded-r-none">
                    <SearchIcon />
                </Button>
            </div>

        </form>

        <UsersTable :items="items" :loading="loading" :load-more="loadMoreUser">
            <template #pagination>
                <div class="flex flex-row justify-center items-center w-full">
                    <Button variant="secondary" @click="loadMoreUser">
                        Load More ...
                    </Button>
                </div>
            </template>
        </UsersTable>
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
