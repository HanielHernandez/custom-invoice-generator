<script setup lang="ts">
import { watch } from 'vue'
import DashboardLayout from '@/components/DashboardLayout.vue'
import { useAuthStore } from '@/stores/authStore'
import { useFlagsmith } from '@/composables/useFlagsmith'

const authStore = useAuthStore()
const { identify } = useFlagsmith()

watch(
    () => authStore.user?.email,
    async (email) => {
        if (!email) return
        await identify(email)
    },
    { immediate: true }
)
</script>
<template>
    <DashboardLayout class="dashboard view">
        <RouterView />
    </DashboardLayout>
</template>
<style lang="scss"></style>
