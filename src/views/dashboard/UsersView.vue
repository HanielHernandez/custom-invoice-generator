<script setup lang="ts">
import AtText from '@/components/atoms/AtText.vue';
import { Button } from '@/components/ui/button';
import { DialogHeader, Dialog, DialogContent } from '@/components/ui/dialog';
import DialogDescription from '@/components/ui/dialog/DialogDescription.vue';
import DialogTitle from '@/components/ui/dialog/DialogTitle.vue';
import UserForm from '@/components/UserForm.vue';
import { useUserStore } from '@/stores/usersStore';
import { ChevronLeft, ChevronRight, PlusIcon } from 'lucide-vue-next';
import { computed, onMounted, ref } from 'vue';
import UsersTable from './UsersTable.vue';
import { useRoute } from 'vue-router';

// import { storeToRefs } from 'pinia';

const dialogOpen = ref(false)
const usersStore = useUserStore()
// const { lastItem } = storeToRefs(usersStore)
const page = ref(1)
const route = useRoute()
onMounted(async () => {
    usersStore.reset()
    // const after = route.query.after ? parseInt(route.query.after as string) : null
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


</script>
<template>
    <section class="flex flex-col gap-4">
        <div class="flex justify-between">
            <at-text variant="h2"> Users </at-text>
            <Button @click="dialogOpen = true">
                <PlusIcon class="h-4 w-4" /> New User
            </Button>
        </div>
        <UsersTable :items="items" v-if="!loading" :loading="loading" :load-more="loadMoreUser">

            <template #pagination>

                <div class="flex flex-row justify-between items-center w-full">


                    <div class="text-sm">
                        page {{ page }}
                    </div>
                    <div class="flex gap-4 items-center">
                        <a>
                            <Button>
                                <ChevronLeft />
                            </Button>
                        </a>
                        <a>

                            <Button>
                                <ChevronRight />
                            </Button>
                        </a>
                    </div>
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
