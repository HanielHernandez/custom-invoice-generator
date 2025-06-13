<script setup lang="ts">
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  // SidebarHeader,
} from '@/components/ui/sidebar'
import { ScrollTextIcon } from 'lucide-vue-next';
</script>

<template>
  <Sidebar>
    <div class="flex h-15 items-center border-b px-4 gap-2">
      <ScrollTextIcon />
      <h2 class="font-semibold "> Custom Invoice creator </h2>
    </div>
    <SidebarContent>
      <SidebarGroup />
      <SidebarGroup />
    </SidebarContent>
    <SidebarFooter />
  </Sidebar>
</template>
