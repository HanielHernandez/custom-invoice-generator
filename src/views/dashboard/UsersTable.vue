<script setup lang="ts">
import type { UserProfile } from 'firebase/auth';
import { Card, CardTitle, CardHeader, CardDescription, CardContent } from '@/components/ui/card'
import { Table, TableHeader, TableBody, TableCell, TableRow, TableHead } from '@/components/ui/table'

const { items = [], loading = false } = defineProps<{
    items: UserProfile[],
    loading: boolean
}>()


</script>
<template>
    <Card>
        <CardHeader class="pb-2">
            <CardTitle>
                User List
            </CardTitle>
            <CardDescription>
                Manage your users
            </CardDescription>
        </CardHeader>
        <CardContent>


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
    </Card>
</template>
<style lang="scss"></style>
