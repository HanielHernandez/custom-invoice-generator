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
import { ArrowLeft } from 'lucide-vue-next'
import { RouterLink, useRouter } from 'vue-router'
import { toast } from 'vue-sonner'

const router = useRouter()

const onFormSave = () => {
    toast.success('Plan created', {
        position: 'top-center',
        description: 'The plan was saved successfully',
        closeButton: true
    })
    router.push({ name: 'plans-list' })
}

const onFormCancel = () => {
    router.push({ name: 'plans-list' })
}
</script>

<template>
    <div class="flex w-full flex-col items-start gap-4">
        <Button variant="ghost" asChild>
            <RouterLink to="/dashboard/plans" class="inline-flex items-center gap-2">
                <ArrowLeft class="h-4 w-4" />
                Back to Plans
            </RouterLink>
        </Button>

        <Card class="w-full max-w-2xl">
            <CardHeader>
                <CardTitle>Add Plan</CardTitle>
                <CardDescription>Fill in the plan information below</CardDescription>
            </CardHeader>
            <CardContent>
                <PlanForm @on-cancel="onFormCancel" @on-save="onFormSave" />
            </CardContent>
        </Card>
    </div>
</template>
