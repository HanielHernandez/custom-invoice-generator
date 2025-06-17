<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { MenuIcon, PanelLeft } from 'lucide-vue-next'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { useSidebar } from './utils'

const props = defineProps<{
    class?: HTMLAttributes['class']
}>()

const { toggleSidebar } = useSidebar()
</script>

<template>
    <Button data-sidebar="trigger" data-slot="sidebar-trigger" variant="outline" size="icon"
        :class="cn('h-10 w-10', props.class)" @click="toggleSidebar">
        <MenuIcon />
        <span class="sr-only">Toggle Sidebar</span>
    </Button>
</template>
