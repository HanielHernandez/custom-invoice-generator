<script setup lang="ts">
;
import { Card, CardTitle, CardHeader, CardDescription, CardContent, CardFooter } from '@/components/ui/card'
import Skeleton from '@/components/ui/skeleton/Skeleton.vue';
import { TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import Table from '@/components/ui/table/Table.vue';
import type { UserProfile } from '@/lib/firebase-auth';

const { items = [], loading = false } = defineProps<{
    items: UserProfile[],
    loading: boolean,
    page?: number,
    endReached?: boolean,
}>()

const formatDate = (date: string | number) => {
    return typeof date == 'string' ? date : new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    }).format(date)
}
</script>
<template>
    <Card class="gap-4">
        <CardHeader>
            <CardTitle>
                User List
            </CardTitle>
            <CardDescription>
                Manage your users
            </CardDescription>
        </CardHeader>
        <CardContent class="space-y-4">
            <!-- <div class="flex flex-col gap-4 md:gap-6">
                <div v-for="user in items" :key="user.uid"
                    class="bg-white border border-gray-200 rounded-md p-4 transition-shadow duration-200 hover:bg-neutral-100 ">
                    <div class="flex items-center space-x-4 mb-4">
                        <img :src="user.photoUrl || `https://ui-avatars.com/api/?name=${user.name.replace(' ', '+')}`"
                            :alt="`${user.name}'s avatar`"
                            class="w-10 h-10 rounded-full object-cover border-2 border-gray-200" />
                        <div class="flex-1 min-w-0">
                            <h3 class="text-sm font-semibold text-gray-900 truncate">
                                {{ user.name }}
                            </h3>
                            <p class="text-sm text-gray-500 truncate">
                                {{ user.email }}
                            </p>
                        </div>
                    </div>
                    <div class="flex items-center text-sm text-gray-500">
                        <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span>Joined {{ formatDate(user.createdAt) }}</span>
                    </div>
                </div>
            </div> -->

            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>
                            User Name
                        </TableHead>
                        <TableHead>
                            Date Added
                        </TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    <TableRow v-for="user in items" :key="user.uid">
                        <TableCell>
                            <div class="flex items-center space-x-4 ">
                                <img :src="user.photoUrl || `https://ui-avatars.com/api/?name=${user.name.replace(' ', '+')}`"
                                    :alt="`${user.name}'s avatar`"
                                    class="w-10 h-10 rounded-full object-cover border-2 border-gray-200" />
                                <div class="flex-1 min-w-0">
                                    <h3 class="text-sm font-semibold text-gray-900 truncate">
                                        {{ user.name }}
                                    </h3>
                                    <p class="text-sm text-gray-600 truncate">
                                        {{ user.email }}
                                    </p>
                                </div>
                            </div>
                        </TableCell>

                        <TableCell>
                            <span class="text-sm text-neutral-600">Joined {{ formatDate(user.createdAt) }}</span>
                        </TableCell>
                    </TableRow>
                </TableBody>
            </Table>
            <div class="flex flex-col gap-2" v-if="loading">
                <Skeleton v-for="a in 10" :key="a" class="w-full h-14" />
            </div>
        </CardContent>
        <CardFooter>
            <slot name="pagination"></slot>
        </CardFooter>
    </Card>
</template>
<style lang="scss"></style>
