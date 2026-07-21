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
import { useClientsStore } from '@/stores/clientsStore'
import type { Client } from '@/types/client'
import { ChevronLeft, ChevronRight, PencilIcon, SearchIcon, TrashIcon } from 'lucide-vue-next'
import { storeToRefs } from 'pinia'
import { computed, onMounted, ref, watch } from 'vue'
import { toast } from 'vue-sonner'

const PER_PAGE = 10

const emit = defineEmits<{
    (e: 'edit', client: Client): void
}>()

const clientsStore = useClientsStore()
const { items, loading, saving, error } = storeToRefs(clientsStore)

const searchQuery = ref('')
const page = ref(0)
const deleteDialogOpen = ref(false)
const pendingClientId = ref<string | null>(null)
const pendingClientName = ref<string | null>(null)
const deleting = ref(false)

const normalizedQuery = computed(() => searchQuery.value.trim().toLowerCase())

const filteredClients = computed(() => {
    if (!normalizedQuery.value) return items.value

    return items.value.filter((client) => {
        const name = client.name?.toLowerCase() ?? ''
        const email = client.email?.toLowerCase() ?? ''
        return name.includes(normalizedQuery.value) || email.includes(normalizedQuery.value)
    })
})

const totalPages = computed(() => Math.max(1, Math.ceil(filteredClients.value.length / PER_PAGE)))

const pageClients = computed(() => {
    const start = page.value * PER_PAGE
    return filteredClients.value.slice(start, start + PER_PAGE)
})

const isLastPage = computed(() => page.value >= totalPages.value - 1)

watch(normalizedQuery, () => {
    page.value = 0
})

watch(totalPages, (pages) => {
    if (page.value > pages - 1) {
        page.value = Math.max(0, pages - 1)
    }
})

onMounted(() => {
    void clientsStore.fetch()
})

const openDeleteDialog = (client: Client) => {
    if (!client.id) {
        console.error('Error deleting client: missing id', client)
        toast.error('Error deleting client', {
            position: 'top-center',
            description: 'Missing client id. Cannot delete this record.',
            closeButton: true
        })
        return
    }

    pendingClientId.value = client.id
    pendingClientName.value = client.name ?? null
    deleteDialogOpen.value = true
}

const closeDeleteDialog = () => {
    if (deleting.value) return
    deleteDialogOpen.value = false
    pendingClientId.value = null
    pendingClientName.value = null
}

const confirmDelete = async (clientId: string) => {
    if (deleting.value) return

    if (!clientId) {
        console.error('Error deleting client: missing id', clientId)
        toast.error('Error deleting client', {
            position: 'top-center',
            description: 'Missing client id. Cannot delete this record.',
            closeButton: true
        })
        return
    }

    deleting.value = true
    try {
        await clientsStore.remove(clientId)
        toast.success('Client deleted', {
            position: 'top-center',
            description: 'Client was deleted successfully',
            closeButton: true
        })
        deleting.value = false
        closeDeleteDialog()
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
    <div class="flex flex-col gap-4">
        <div class="relative w-full">
            <Input
                v-model="searchQuery"
                class="bg-white pl-10"
                placeholder="Search by name or email..."
            />
            <Button variant="ghost" class="absolute left-0 top-0 z-50" tabindex="-1">
                <SearchIcon class="h-5 w-5" />
            </Button>
        </div>

        <Card>
            <CardHeader>
                <CardTitle>Client List</CardTitle>
                <CardDescription>Manage your clients</CardDescription>
            </CardHeader>
            <CardContent>
                <div v-if="loading" class="py-8 text-center text-muted-foreground">Loading...</div>
                <div v-else-if="error" class="py-8 text-center text-destructive">{{ error }}</div>
                <div
                    v-else-if="pageClients.length === 0"
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
                        <TableRow v-for="client in pageClients" :key="client.id">
                            <TableCell>{{ client.name }}</TableCell>
                            <TableCell>{{ client.email }}</TableCell>
                            <TableCell>{{ client.phone }}</TableCell>
                            <TableCell>{{ client.address }}</TableCell>
                            <TableCell>{{ client.cityStateZip }}</TableCell>
                            <TableCell>
                                <div class="flex items-center gap-1">
                                    <TooltipProvider>
                                        <Tooltip>
                                            <TooltipTrigger as-child>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    @click="emit('edit', client)"
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
                                                    @click="openDeleteDialog(client)"
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
            </CardContent>
            <CardFooter>
                <div class="flex w-full flex-row items-center justify-between">
                    <div class="text-sm">page {{ page + 1 }} of {{ totalPages }}</div>
                    <div class="flex items-center gap-4">
                        <Button :disabled="page <= 0" @click="page -= 1">
                            <ChevronLeft />
                        </Button>
                        <Button :disabled="isLastPage" @click="page += 1">
                            <ChevronRight />
                        </Button>
                    </div>
                </div>
            </CardFooter>
        </Card>

        <ClientDeleteDialog
            :open="deleteDialogOpen"
            :loading="deleting || saving"
            :object-id="pendingClientId"
            :client-name="pendingClientName"
            @on-cancel="closeDeleteDialog"
            @on-continue="confirmDelete"
        />
    </div>
</template>
