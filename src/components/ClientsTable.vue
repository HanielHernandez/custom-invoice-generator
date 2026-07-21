<script setup lang="ts">
import ClientDeleteDialog from '@/components/ClientDeleteDialog.vue'
import { Button } from '@/components/ui/button'
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from '@/components/ui/table'
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger
} from '@/components/ui/tooltip'
import { useRole } from '@/composable/useRole'
import { searchClient } from '@/lib/algolia'
import { auth } from '@/lib/firebase'
import { useClientsStore } from '@/stores/clientsStore'
import type { Client } from '@/types/client'
import { history as historyRouter } from 'instantsearch.js/es/lib/routers'
import { singleIndex as singleIndexMapping } from 'instantsearch.js/es/lib/stateMappings'
import { ChevronLeft, ChevronRight, PencilIcon, SearchIcon, TrashIcon } from 'lucide-vue-next'
import { storeToRefs } from 'pinia'
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { toast } from 'vue-sonner'

export type ClientHit = Client & {
    objectID?: string | number
    path?: string
}

const INDEX_NAME = 'client_index'

const emit = defineEmits<{
    (e: 'edit', client: Client): void
}>()

const clientsStore = useClientsStore()
const { saving } = storeToRefs(clientsStore)
const { role } = useRole()
const router = useRouter()

const deleteDialogOpen = ref(false)
const pendingObjectID = ref<string | null>(null)
const pendingClientName = ref<string | null>(null)
const deleting = ref(false)

const routing = {
    router: historyRouter(),
    stateMapping: singleIndexMapping(INDEX_NAME)
}

// NOT deleted:true keeps older records that lack a `deleted` field
const filters = computed(() => {
    const baseFilter =
        auth.currentUser && auth.currentUser.uid
            ? `uid:${auth.currentUser.uid} AND NOT deleted:true`
            : ''

    if (!role.value || role.value === 'editor') {
        return baseFilter
    }

    return 'NOT deleted:true'
})

const refineInput = (val: string, refine: (val: string) => void) => {
    refine(val)
}

const resolveObjectID = (hit: ClientHit): string | null => {
    if (typeof hit.objectID === 'string' && hit.objectID.length > 0) {
        return hit.objectID
    }
    if (typeof hit.objectID === 'number') {
        return String(hit.objectID)
    }
    if (typeof hit.path === 'string' && hit.path.startsWith('clients/')) {
        return hit.path.slice('clients/'.length)
    }
    return null
}

const toClient = (hit: ClientHit): Client => ({
    id: resolveObjectID(hit) ?? undefined,
    name: hit.name,
    email: hit.email,
    phone: hit.phone,
    address: hit.address,
    cityStateZip: hit.cityStateZip,
    uid: hit.uid,
    companyId: hit.companyId,
    createdAt: hit.createdAt,
    updatedAt: hit.updatedAt,
    deleted: hit.deleted ?? false,
    deletedAt: hit.deletedAt ?? null
})

const openDeleteDialog = (hit: ClientHit) => {
    const objectID = resolveObjectID(hit)
    if (!objectID) {
        console.error('Error deleting client: missing Algolia objectID', hit)
        toast.error('Error deleting client', {
            position: 'top-center',
            description: 'Missing objectID. Cannot delete this record.',
            closeButton: true
        })
        return
    }

    pendingObjectID.value = objectID
    pendingClientName.value = hit.name ?? null
    deleteDialogOpen.value = true
}

const closeDeleteDialog = () => {
    if (deleting.value) return
    deleteDialogOpen.value = false
    pendingObjectID.value = null
    pendingClientName.value = null
}

const confirmDelete = async (objectID: string) => {
    if (deleting.value) return

    if (!objectID) {
        console.error('Error deleting client: missing Algolia objectID', objectID)
        toast.error('Error deleting client', {
            position: 'top-center',
            description: 'Missing objectID. Cannot delete this record.',
            closeButton: true
        })
        return
    }

    deleting.value = true
    try {
        await clientsStore.remove(objectID)
        toast.success('Client deleted', {
            position: 'top-center',
            description: 'Client was deleted successfully',
            closeButton: true
        })
        deleting.value = false
        closeDeleteDialog()
        setTimeout(() => router.go(0), 800)
    } catch (e) {
        deleting.value = false
        console.error('Error deleting client:', e)
        toast.error('Error deleting client', {
            position: 'top-center',
            description: e instanceof Error ? e.message : 'Something went wrong',
            closeButton: true
        })
    }
}
</script>

<template>
    <ais-instant-search
        :search-client="searchClient"
        :index-name="INDEX_NAME"
        class="flex flex-col gap-4"
        :routing="routing"
    >
        <ais-search-box>
            <template #default="{ currentRefinement, refine }">
                <div class="relative w-full">
                    <Input
                        :value="currentRefinement"
                        class="bg-white pl-10"
                        placeholder="Search by name or email..."
                        @update:model-value="
                            (val: string | number) => refineInput(String(val), refine)
                        "
                    />
                    <Button variant="ghost" class="absolute left-0 top-0 z-50" tabindex="-1">
                        <SearchIcon class="h-5 w-5" />
                    </Button>
                </div>
            </template>
        </ais-search-box>

        <Card>
            <CardHeader>
                <CardTitle>Client List</CardTitle>
                <CardDescription>Manage your clients</CardDescription>
            </CardHeader>
            <CardContent>
                <ais-state-results v-slot="{ status, isSearchStalled }">
                    <div
                        v-if="status === 'loading' || isSearchStalled"
                        class="py-8 text-center text-muted-foreground"
                    >
                        Loading...
                    </div>
                    <div v-else class="hidden" aria-hidden="true" />
                </ais-state-results>

                <ais-hits>
                    <template #default="{ items }">
                        <div
                            v-if="items.length === 0"
                            class="py-8 text-center text-muted-foreground"
                        >
                            No clients found.
                        </div>
                        <Table v-else>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Email</TableHead>
                                    <TableHead>Phone</TableHead>
                                    <TableHead>Address</TableHead>
                                    <TableHead>City, State, Zip</TableHead>
                                    <TableHead class="w-[100px]">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                <TableRow v-for="item in items" :key="item.objectID">
                                    <TableCell>{{ item.name }}</TableCell>
                                    <TableCell>{{ item.email }}</TableCell>
                                    <TableCell>{{ item.phone }}</TableCell>
                                    <TableCell>{{ item.address }}</TableCell>
                                    <TableCell>{{ item.cityStateZip }}</TableCell>
                                    <TableCell>
                                        <div class="flex items-center gap-1">
                                            <TooltipProvider>
                                                <Tooltip>
                                                    <TooltipTrigger as-child>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            @click="emit('edit', toClient(item))"
                                                        >
                                                            <PencilIcon class="h-4 w-4" />
                                                            <span class="sr-only">Edit</span>
                                                        </Button>
                                                    </TooltipTrigger>
                                                    <TooltipContent>Edit</TooltipContent>
                                                </Tooltip>
                                            </TooltipProvider>
                                            <TooltipProvider>
                                                <Tooltip>
                                                    <TooltipTrigger as-child>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            class="text-destructive hover:text-destructive"
                                                            @click="openDeleteDialog(item)"
                                                        >
                                                            <TrashIcon class="h-4 w-4" />
                                                            <span class="sr-only">Delete</span>
                                                        </Button>
                                                    </TooltipTrigger>
                                                    <TooltipContent>Delete</TooltipContent>
                                                </Tooltip>
                                            </TooltipProvider>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>
                    </template>
                </ais-hits>
                <AisConfigure :hits-per-page.camel="10" :filters="filters" />
            </CardContent>
            <CardFooter>
                <ais-pagination class="w-full">
                    <template
                        #default="{ currentRefinement, nbPages, createURL, isLastPage, refine }"
                    >
                        <div class="flex w-full flex-row items-center justify-between">
                            <div class="text-sm">
                                page {{ currentRefinement + 1 }} of {{ nbPages || 1 }}
                            </div>
                            <div class="flex items-center gap-4">
                                <a
                                    :href="createURL(currentRefinement - 1)"
                                    @click.prevent="refine(currentRefinement - 1)"
                                >
                                    <Button :disabled="currentRefinement <= 0">
                                        <ChevronLeft />
                                    </Button>
                                </a>
                                <a
                                    :href="createURL(currentRefinement + 1)"
                                    @click.prevent="refine(currentRefinement + 1)"
                                >
                                    <Button :disabled="isLastPage">
                                        <ChevronRight />
                                    </Button>
                                </a>
                            </div>
                        </div>
                    </template>
                </ais-pagination>
            </CardFooter>
        </Card>

        <ClientDeleteDialog
            :open="deleteDialogOpen"
            :loading="deleting || saving"
            :object-id="pendingObjectID"
            :client-name="pendingClientName"
            @on-cancel="closeDeleteDialog"
            @on-continue="confirmDelete"
        />
    </ais-instant-search>
</template>
