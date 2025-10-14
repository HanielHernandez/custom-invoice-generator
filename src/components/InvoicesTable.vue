<script lang="ts" setup>
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from '@/components/ui/table'
import { searchClient } from '@/lib/algolia'
import { Card, CardContent, CardHeader } from './ui/card'
import CardTitle from './ui/card/CardTitle.vue'
import CardDescription from './ui/card/CardDescription.vue'
import Input from './ui/input/Input.vue'
import { computed, ref, useTemplateRef } from 'vue'
import CardFooter from './ui/card/CardFooter.vue'
import { Button } from './ui/button'
import { ChevronLeft, ChevronRight, EditIcon, EyeIcon, SearchIcon, Trash } from 'lucide-vue-next'
import dayjs from 'dayjs'
import InvoIceDeleteDialog from './InvoIceDeleteDialog.vue'
import { useInvoiceStore } from '@/stores/InvoiceStore'
import { toast } from 'vue-sonner'
import { auth } from '@/lib/firebase'
import { Select, SelectContent, SelectTrigger, SelectValue } from './ui/select'
import SelectItem from './ui/select/SelectItem.vue'
import { useRole } from '@/composable/useRole'
import { history as historyRouter } from 'instantsearch.js/es/lib/routers'
import { singleIndex as singleIndexMapping } from 'instantsearch.js/es/lib/stateMappings'
import Label from './ui/label/Label.vue'
import { useRouter } from 'vue-router'

const routing = {
    router: historyRouter(),
    stateMaping: singleIndexMapping('invoices')
}
const sortBy = useTemplateRef('sortBy')
const flow = ref('asc')
const openDeleteModal = ref(false)
const invoiceId = ref<string | null>(null)
const invoiceStore = useInvoiceStore()
const { role } = useRole()
const router = useRouter()
const filters = computed(() => {
    const baseFilter =
        auth.currentUser && auth.currentUser.uid
            ? `uid:${auth.currentUser.uid} AND deleted:false`
            : ''

    if (!role.value || role.value == 'editor') {
        return baseFilter
    }

    return 'deleted:false'
})

const refineInput = (val: string, refine: (val: string) => void) => {
    refine(val)
}
const sortByOptions = [
    {
        label: 'Relevance',
        value: 'invoices'
    },
    {
        label: 'Created at desc.',
        value: 'invoices_createdAt_desc'
    },
    {
        label: 'Created at asc.',
        value: 'invoices_createdAt_asc'
    },
    {
        label: 'Name desc.',
        value: 'invoices_name_desc'
    },
    {
        label: 'Name asc.',
        value: 'invoices_name_asc'
    },
    {
        label: 'Customer Name desc.',
        value: 'invoices_customerName_desc'
    },
    {
        label: 'Customer Name asc.',
        value: 'invoices_customerName_asc'
    },
    {
        label: 'Code desc.',
        value: 'invoices_code_desc'
    },
    {
        label: 'Code asc.',
        value: 'invoices_code_asc'
    }
]

const format = (tiemstamp: number) => dayjs(new Date(tiemstamp)).format('MM/DD/YYYY')
const changeSort = (value: string) => {
    console.log(value)
    // const sortByEl: HTMLSelectElement | null = document.querySelector('.ais-SortBy-select')
    // if (!sortByEl) {
    //     return
    // }

    // sortByIndex.value = value
    // sortByEl.value = value;
    // sortByEl.dispatchEvent(new Event('change'));
    flow.value = flow.value == 'desc' ? 'asc' : 'desc'
}

const onDeleteCancel = () => {
    invoiceId.value = null
    openDeleteModal.value = false
}

const OnDeleteContinue = async () => {
    if (!invoiceId.value) return

    await invoiceStore.remove(invoiceId.value)
    onDeleteCancel()

    toast.success('Invoice deleted', {
        position: 'top-center',
        description: 'Invoice was deleted succesfully',
        closeButton: true
    })

    router.go(0)
}

const onInvoiceDelete = (id: string) => {
    invoiceId.value = id
    openDeleteModal.value = true
}

const columns = [
    {
        name: '# Id',
        property: 'code'
    },
    {
        name: 'Date:',
        property: 'createdAt'
    },
    {
        name: 'Actions:',
        property: 'actions'
    }
]
</script>
<template>
    <ais-instant-search
        :search-client="searchClient"
        index-name="invoices"
        class="flex flex-col"
        :routing="routing"
    >
        <ais-search-box class="mb-4">
            <template #default="{ currentRefinement, refine }">
                <div class="relative w-full">
                    <Input
                        :value="currentRefinement"
                        @update:model-value="
                            (val: string | number) => refineInput(val as string, refine)
                        "
                        placeholder="Search invoices..."
                        class="bg-white pl-10"
                    />

                    <Button variant="ghost" class="absolute left-0 top-0 z-50">
                        <SearchIcon class="h-6 w-6" />
                    </Button>
                </div>
            </template>
        </ais-search-box>

        <Card>
            <CardHeader class="hidden flex-col md:flex-row justify-between">
                <div class="mb-4 md:mb-0">
                    <CardTitle> Invoice List</CardTitle>
                    <CardDescription>
                        Manage your invoices, view details, and export them.
                    </CardDescription>
                </div>
                <ais-sort-by
                    :items="sortByOptions"
                    class="hidden"
                    default-refinement="invoices_createdAt_desc"
                >
                    <template #default="{ items, currentRefinement, canRefine, refine }">
                        <div class="flex flex-start gap-2">
                            <Label>Sort:</Label>
                            <Select
                                :model-value="currentRefinement"
                                @update:model-value="refine"
                                ref="sortBy"
                                :disabled="!canRefine"
                            >
                                <SelectTrigger class="w-[180px]">
                                    <SelectValue placeholder="Sort by ..." />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem
                                        v-for="item in items"
                                        :key="item.value"
                                        :value="item.value"
                                    >
                                        {{ item.label }}
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </template>
                </ais-sort-by>
            </CardHeader>
            <CardContent>
                <ais-state-results v-slot="{ status, isSearchStalled }">
                    <div v-if="status === 'loading' || isSearchStalled">loading...</div>
                    <div v-else class="hidden"></div>
                </ais-state-results>

                <ais-hits>
                    <template #default="{ items }">
                        <Table class="w-full">
                            <TableHeader>
                                <TableRow>
                                    <TableHead v-for="col in columns" :key="col.name">
                                        <div
                                            class="flex items-center gap-2 cursor-pointer"
                                            @click="changeSort(`invoices_${col.property}_${flow}`)"
                                        >
                                            {{ col.name }}
                                        </div>
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody v-if="items">
                                <div v-if="items.length == 0" class="text-neutral-600 p-4">
                                    No results found
                                </div>
                                <TableRow v-for="item in items" :key="item.objectId">
                                    <TableCell class="w-1/3">
                                        <p class="text-wrap">
                                            {{ item.code }} <br />
                                            {{ item.name }}
                                        </p>
                                    </TableCell>

                                    <TableCell class="w-1/3">
                                        {{ format(item.createdAt) }}
                                    </TableCell>
                                    <TableCell class="w-1/3">
                                        <div class="flex items-center flex-col lg:flex-row">
                                            <router-link
                                                :to="`/dashboard/invoices/${item.objectID}/edit`"
                                                class="px-3 py-2"
                                            >
                                                <Button>
                                                    <EditIcon class="h-4 w-4" />
                                                    Edit
                                                </Button>
                                            </router-link>
                                            <router-link
                                                tar
                                                :to="`/dashboard/invoices/${item.objectID}/print`"
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                class="px-3 py-2"
                                            >
                                                <Button>
                                                    <EyeIcon class="h-4 w-4" />
                                                    View
                                                </Button>
                                            </router-link>
                                            <Button
                                                variant="destructive"
                                                title="Remove invoice"
                                                @click="onInvoiceDelete(item.objectID)"
                                                class="0 opacity-75 hover:bg-red-200 hover:text-red-600 hover:opacity-100"
                                            >
                                                <Trash :size="14" />

                                                Delete
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>
                    </template>
                </ais-hits>
                <ais-refinement-list attribute="name" />
                <AisConfigure :hits-per-page.camel="10" :filters="filters" />
            </CardContent>
            <CardFooter>
                <ais-pagination class="w-full">
                    <template
                        #default="{ currentRefinement, nbPages, createURL, isLastPage, refine }"
                    >
                        <div class="flex flex-row justify-between items-center w-full">
                            <div class="text-sm">
                                page {{ currentRefinement + 1 }} of {{ nbPages }}
                            </div>
                            <div class="flex gap-4 items-center">
                                <a
                                    as="a"
                                    :href="createURL(currentRefinement - 1)"
                                    @click.prevent="refine(currentRefinement - 1)"
                                >
                                    <Button>
                                        <ChevronLeft />
                                    </Button>
                                </a>
                                <a
                                    :href="createURL(currentRefinement + 1)"
                                    :disabled="isLastPage"
                                    @click.prevent="refine(currentRefinement + 1)"
                                >
                                    <Button>
                                        <ChevronRight />
                                    </Button>
                                </a>
                            </div>
                        </div>
                    </template>
                </ais-pagination>
            </CardFooter>
        </Card>
        <InvoIceDeleteDialog
            :open="openDeleteModal"
            :loading="invoiceStore.deleting"
            @onCancel="onDeleteCancel"
            @on-continue="OnDeleteContinue"
        />
    </ais-instant-search>
</template>
