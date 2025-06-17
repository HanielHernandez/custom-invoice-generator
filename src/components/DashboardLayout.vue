<script setup lang="ts">
import { SidebarProvider } from '@/components/ui/sidebar'
import AppSidebar from './AppSidebar.vue';
import AppHeader from './AppHeader.vue';
import { useRoute } from 'vue-router';
import { computed } from 'vue';

const route = useRoute()


const isNotPrintview = computed(() => {
    return !route.fullPath.includes('print')
})

</script>
<template>
    <SidebarProvider>
        <AppSidebar v-if="isNotPrintview" />
        <div class="flex flex-col w-full overflow-auto ">
            <AppHeader v-if="isNotPrintview" />
            <main class="p-4 md:px-6  bg-neutral-100 h-full">
                <slot></slot>
            </main>
        </div>
    </SidebarProvider>
</template>
<style lang="scss"></style>
