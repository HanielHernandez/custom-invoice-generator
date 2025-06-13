<script setup lang="ts">
import { SidebarProvider } from '@/components/ui/sidebar'
import AppSidebar from './AppSidebar.vue';
import AppHeader from './AppHeader.vue';
</script>
<template>
  <SidebarProvider>
    <AppSidebar />
    <div class="flex flex-col w-full overflow-auto ">
      <AppHeader />
      <main class="p-4 md:px-6  bg-neutral-100 h-full">
        <slot></slot>
      </main>
    </div>
  </SidebarProvider>
</template>
<style lang="scss"></style>
