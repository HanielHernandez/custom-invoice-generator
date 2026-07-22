<script setup lang="ts">
import AtText from '@/components/atoms/AtText.vue'
import { Button } from '@/components/ui/button'
import { PlusIcon } from 'lucide-vue-next'
import { computed } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import { Toaster } from 'vue-sonner'

const route = useRoute()
const showListHeader = computed(() => route.name === 'plans-list')
</script>

<template>
    <Toaster class="pointer-events-auto" rich-colors />
    <section class="flex flex-col gap-4">
        <div v-if="showListHeader" class="flex items-center justify-between">
            <AtText variant="h2">Plans</AtText>
            <Button asChild>
                <RouterLink to="/dashboard/plans/new" class="inline-flex items-center gap-2">
                    <PlusIcon class="h-4 w-4" />
                    Add Plan
                </RouterLink>
            </Button>
        </div>

        <RouterView />
    </section>
</template>
