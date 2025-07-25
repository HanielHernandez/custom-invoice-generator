<script lang="ts" setup>
import SidebarTrigger from './ui/sidebar/SidebarTrigger.vue'
</script>
<template>
    <Header class="h-16 border-b flex items-center justify-start px-4 md:px-6">
        <SidebarTrigger class="md:hidden mr-2" />
        <router-link to="dashboard" class="text-2xl font-semibold tracking-tight">
            Dashboard</router-link
        >
    </Header>
</template>
<style lang="scss"></style>
