<script lang="ts" setup>
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { searchClient } from '@/lib/algolia';
import { Card, CardContent, CardHeader } from './ui/card';
import CardTitle from './ui/card/CardTitle.vue';
import CardDescription from './ui/card/CardDescription.vue';
import Input from './ui/input/Input.vue';
import { computed, ref, useTemplateRef } from 'vue';
import CardFooter from './ui/card/CardFooter.vue';
import { Button } from './ui/button';
import { ChevronLeft, ChevronRight, EditIcon, HashIcon, PrinterIcon, Trash } from 'lucide-vue-next';
import dayjs from 'dayjs'
import { Skeleton } from './ui/skeleton';


const refineInput = (val: string, refine: (val: string) => void) => {

    refine(val)
}
const sortBy = useTemplateRef('sortBy')

const selectedCustomer = ref('Kimberley Houston')

const filters = computed(() => {
    return selectedCustomer.value
        ? `uid:xuRfOIcXNkQcHP8Q9bMQNxF4W663`
        : ''
})

const sortByOptions = [{
    label: 'default', value: 'invoices'
},
{
    label: 'Created at desc', value: 'invoices_createdAt_desc'
},
{
    label: 'Created at asc', value: 'invoices_createdAt_asc'
}
]


const format = (tiemstamp: number) => dayjs(new Date(tiemstamp)).format("DD/MM/YYYY HH:mm:ss A")

const changeSort = (value: string) => {
    console.log(sortBy.value)
    const sortByEl: HTMLSelectElement | null = document.querySelector('.ais-SortBy-select')
    if (!sortByEl) {
        return
    }

    sortByEl.value = value; // change the value
    sortByEl.dispatchEvent(new Event('change'));


}

</script>
<template>


    <ais-instant-search :search-client="searchClient" index-name="invoices" class="flex flex-col">

        <ais-state-results v-slot="{ status, isSearchStalled }">
            <div v-if="status === 'loading' || isSearchStalled">
                <div class="flex flex-col gap-4">
                    <Skeleton class="w-full h-9" />
                    <Skeleton class="w-full h-58" />
                </div>
            </div>

            <div v-else class="hidden">

            </div>
        </ais-state-results>



        <ais-search-box class="mb-4">
            <template #default="{ currentRefinement, refine }">
                <Input :value="currentRefinement"
                    @update:model-value="(val: string | number) => refineInput(val as string, refine)"
                    placeholder="Search invoices..." class="bg-white " />
            </template>
        </ais-search-box>

        <Card>
            <CardHeader>
                <CardTitle> Invoice List</CardTitle>
                <CardDescription>
                    Manage your invoices, view details, and export them.
                </CardDescription>
            </CardHeader>

            <CardContent>
                <ais-sort-by ref="sortBy" :items="sortByOptions" class="hidden" />


                <ais-hits>
                    <template #default="{ items, }">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>
                                        <div class="flex items-center gap-2">
                                            <HashIcon class="h-4 w-4" /> ID
                                        </div>
                                    </TableHead>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Company </TableHead>
                                    <TableHead>Customer Name</TableHead>
                                    <TableHead @click="changeSort('invoices_createdAt_desc')">Created at
                                    </TableHead>
                                    <TableHead>Actions </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody v-if="items">

                                <div v-if="items.length == 0" class="text-neutral-600 p-4">
                                    No results found
                                </div>

                                <TableRow v-for="item in items" :key="item.objectId">
                                    <TableCell>
                                        {{ item.code }}
                                    </TableCell>
                                    <TableCell>
                                        {{ item.name }}
                                    </TableCell>
                                    <TableCell>
                                        {{ item.company.name }}
                                    </TableCell>
                                    <TableCell>
                                        {{ item.customerName }}
                                    </TableCell>

                                    <TableCell>
                                        {{ format(item.createdAt) }}
                                    </TableCell>
                                    <TableCell>
                                        <div class="flex items-center">
                                            <router-link :to="`/dashboard/invoices/${item.objectID}/edit`"
                                                class="px-3 py-2">
                                                <EditIcon class="h-4 w-4" />
                                            </router-link>

                                            <router-link :to="`/dashboard/invoices/${item.objectID}/print`"
                                                class="px-3 py-2">
                                                <PrinterIcon class="h-4 w-4" />
                                            </router-link>


                                            <Button variant="ghost" title="Remove invoice"
                                                class="text-red-600 opacity-75 hover:bg-red-200  hover:text-red-600 hover:opacity-100 ">
                                                <Trash :size="14" />
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
                    <template #default="{ currentRefinement, nbPages, createURL, isLastPage, refine }">
                        <div class="flex flex-row justify-between items-center w-full">

                            <div class="text-sm">
                                page {{ currentRefinement + 1 }} of {{ nbPages }}
                            </div>
                            <div class="flex gap-4 items-center">

                                <a as="a" :href="createURL(currentRefinement - 1)"
                                    @click.prevent="refine(currentRefinement - 1)">
                                    <Button>
                                        <ChevronLeft />
                                    </Button>
                                </a>


                                <a :href="createURL(currentRefinement + 1)" :disabled="isLastPage"
                                    @click.prevent="refine(currentRefinement + 1)">

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

    </ais-instant-search>

</template>
