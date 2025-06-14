<script lang="ts" setup>
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { searchClient } from '@/lib/algolia';
import { Card, CardContent, CardHeader } from './ui/card';
import CardTitle from './ui/card/CardTitle.vue';
import CardDescription from './ui/card/CardDescription.vue';
import Input from './ui/input/Input.vue';
import { computed, ref } from 'vue';
import CardFooter from './ui/card/CardFooter.vue';
import { Button } from './ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-vue-next';


const refineInput = (val: string, refine: (val: string) => void) => {

    refine(val)
}

const selectedCustomer = ref('Kimberley Houston')
const page = ref(1)

const filters = computed(() => {
    return selectedCustomer.value
        ? `uid:xuRfOIcXNkQcHP8Q9bMQNxF4W663`
        : ''
})

</script>
<template>


    <ais-instant-search :search-client="searchClient" index-name="invoices" class="flex flex-col gap-4">
        <ais-search-box>
            <template #default="{ currentRefinement, refine }">
                <Input :value="currentRefinement" @update:model-value="(val: string) => refineInput(val, refine)"
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

                <ais-hits>

                    <template #default="{ items }">
                        <Table>

                            <TableHeader>
                                <TableRow>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Company </TableHead>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Created at </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody v-if="items">

                                <TableRow v-for="item in items" :key="item.objectId">
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
                                        {{ item.createdAt }}
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


                                <a :href="createURL(currentRefinement + 1)"
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
