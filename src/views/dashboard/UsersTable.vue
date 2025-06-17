<script setup lang="ts">
import { Card, CardTitle, CardHeader, CardDescription, CardContent, CardFooter } from '@/components/ui/card'
import { Table, TableHeader, TableBody, TableCell, TableRow, TableHead } from '@/components/ui/table'
import type { UserProfile } from '@/lib/firebase-auth';
import { useInfiniteScroll } from '@vueuse/core'
import { useTemplateRef } from 'vue';

const { items = [], loading = false, endReached = false, loadMore } = defineProps<{
    items: UserProfile[],
    loading: boolean,
    page?: number,
    endReached?: boolean,
    loadMore: Promise<void>
}>()


const el = useTemplateRef<HTMLElement>('table')


useInfiniteScroll(
    el,
    async () => {


        await loadMore
    },
    {
        distance: 20,
        direction: 'bottom',
        canLoadMore: () => {
            return endReached
        },
    }
)




</script>
<template>
    <Card class="gap-2">
        <CardHeader>
            <CardTitle>
                User List
            </CardTitle>
            <CardDescription>
                Manage your users
            </CardDescription>
        </CardHeader>
        <CardContent ref="table" class="h-[350px] overflow-y-scroll">


            <Table v-if="!loading">
                <TableHeader>
                    <TableRow>
                        <TableHead>
                            Email
                        </TableHead>
                        <TableHead>
                            Name
                        </TableHead>
                        <TableHead>
                            Phone Number
                        </TableHead>

                        <TableHead>
                            Created At
                        </TableHead>

                    </TableRow>
                </TableHeader>
                <TableBody>
                    <TableRow v-for="item in items" :key="item.uid">
                        <TableCell class="font-medium">
                            {{ item.email }}
                        </TableCell>
                        <TableCell>
                            {{ item.name }}
                        </TableCell>
                        <TableCell>
                            {{ item.phoneNumber }}
                        </TableCell>
                        <TableCell>
                            {{ item.createdAt }}
                        </TableCell>
                    </TableRow>
                </TableBody>
            </Table>
        </CardContent>
        <CardFooter>
            <slot name="pagination"></slot>
        </CardFooter>
    </Card>
</template>
<style lang="scss"></style>
