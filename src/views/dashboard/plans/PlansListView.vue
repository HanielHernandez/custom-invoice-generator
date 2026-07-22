<script setup lang="ts">
import PlanForm from '@/components/PlanForm.vue'
import { Button } from '@/components/ui/button'
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle
} from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader } from '@/components/ui/dialog'
import DialogDescription from '@/components/ui/dialog/DialogDescription.vue'
import DialogTitle from '@/components/ui/dialog/DialogTitle.vue'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from '@/components/ui/table'
import { usePlansStore } from '@/stores/plansStore'
import type { Plan } from '@/types/plan'
import { MoreVertical, PencilIcon } from 'lucide-vue-next'
import { storeToRefs } from 'pinia'
import { onMounted, ref } from 'vue'

const plansStore = usePlansStore()
const { items, loading, error } = storeToRefs(plansStore)

const dialogOpen = ref(false)
const editingPlan = ref<Plan | null>(null)

onMounted(() => {
    void plansStore.fetch()
})

const openEditDialog = (plan: Plan) => {
    editingPlan.value = plan
    dialogOpen.value = true
}

const closeDialog = () => {
    dialogOpen.value = false
    editingPlan.value = null
}

const onFormSave = () => {
    closeDialog()
}

const formatPrice = (price: number) =>
    new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
    }).format(price)

const planSubtitle = (plan: Plan) => {
    const priceLabel = plan.isFree ? 'Free' : formatPrice(plan.price ?? 0)
    return `${priceLabel} · ${plan.interval}`
}
</script>

<template>
    <Card>
        <CardHeader>
            <CardTitle>Plan List</CardTitle>
            <CardDescription>Manage subscription plans for customers</CardDescription>
        </CardHeader>
        <CardContent>
            <div v-if="loading" class="py-8 text-center text-muted-foreground">Loading...</div>
            <div v-else-if="error" class="py-8 text-center text-destructive">{{ error }}</div>
            <div v-else-if="items.length === 0" class="py-8 text-center text-muted-foreground">
                No plans found.
            </div>
            <template v-else>
                <ul class="divide-y md:hidden">
                    <li
                        v-for="plan in items"
                        :key="plan.id"
                        class="flex items-center gap-3 py-3"
                    >
                        <div class="min-w-0 flex-1">
                            <p class="truncate font-medium">{{ plan.name }}</p>
                            <p class="truncate text-sm capitalize text-muted-foreground">
                                {{ planSubtitle(plan) }}
                            </p>
                        </div>
                        <DropdownMenu>
                            <DropdownMenuTrigger as-child>
                                <Button variant="ghost" size="icon" class="shrink-0">
                                    <MoreVertical class="h-4 w-4" />
                                    <span class="sr-only">Open menu</span>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem @click="openEditDialog(plan)">
                                    <PencilIcon class="h-4 w-4" />
                                    Edit
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </li>
                </ul>

                <div class="hidden md:block">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Id</TableHead>
                                <TableHead>Name</TableHead>
                                <TableHead>Interval</TableHead>
                                <TableHead>Free</TableHead>
                                <TableHead>Price</TableHead>
                                <TableHead class="w-[80px]">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            <TableRow v-for="plan in items" :key="plan.id">
                                <TableCell>{{ plan.id }}</TableCell>
                                <TableCell>{{ plan.name }}</TableCell>
                                <TableCell class="capitalize">{{ plan.interval }}</TableCell>
                                <TableCell>{{ plan.isFree ? 'Yes' : 'No' }}</TableCell>
                                <TableCell>
                                    {{ plan.isFree ? 'Free' : formatPrice(plan.price ?? 0) }}
                                </TableCell>
                                <TableCell>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        @click="openEditDialog(plan)"
                                    >
                                        <PencilIcon class="h-4 w-4" />
                                        <span class="sr-only">Edit</span>
                                    </Button>
                                </TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>
                </div>
            </template>
        </CardContent>
    </Card>

    <Dialog :open="dialogOpen" @update:open="(o) => (o ? (dialogOpen = true) : closeDialog())">
        <DialogContent class="max-h-[90vh] max-w-xl overflow-y-auto">
            <DialogHeader>
                <DialogTitle>Edit Plan</DialogTitle>
                <DialogDescription>Update the plan information below</DialogDescription>
            </DialogHeader>
            <PlanForm
                v-if="dialogOpen && editingPlan"
                :key="editingPlan.id"
                :plan="editingPlan"
                @on-cancel="closeDialog"
                @on-save="onFormSave"
            />
        </DialogContent>
    </Dialog>
</template>
