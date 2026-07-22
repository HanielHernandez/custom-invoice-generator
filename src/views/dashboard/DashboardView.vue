<script setup lang="ts">
import OnboardingWizard from '@/components/OnboardingWizard.vue'
import DashboardLayout from '@/components/DashboardLayout.vue'
import LoadingSpinner from '@/components/ui/LoadingSpinner.vue'
import { useFlagsmith } from '@/composables/useFlagsmith'
import { useAuthStore } from '@/stores/authStore'
import { useCompanyStore } from '@/stores/companyStore'
import { useProfileStore } from '@/stores/profileStore'
import { storeToRefs } from 'pinia'
import { onMounted, ref, watch } from 'vue'

const authStore = useAuthStore()
const profileStore = useProfileStore()
const companyStore = useCompanyStore()
const { identify, onboarding: onboardingFlag } = useFlagsmith()
const { company } = storeToRefs(companyStore)

const checking = ref(true)
const showOnboarding = ref(false)

watch(
    () => authStore.user?.email,
    async (email) => {
        if (!email) return
        await identify(email)
    },
    { immediate: true }
)

onMounted(async () => {
    try {
        await profileStore.fetchProfile(true)

        const email = authStore.user?.email
        if (email) {
            await identify(email)
        }

        await companyStore.fetchCompany()
        showOnboarding.value = onboardingFlag.value && company.value == null
    } catch (e) {
        console.error('Error loading onboarding gate:', e)
    } finally {
        checking.value = false
    }
})

const onOnboardingCompleted = async () => {
    showOnboarding.value = false
    await companyStore.fetchCompany()
    await profileStore.fetchProfile(true)
}
</script>

<template>
    <div v-if="checking" class="flex h-screen items-center justify-center bg-neutral-100">
        <LoadingSpinner />
    </div>

    <div v-else-if="showOnboarding" class="min-h-screen bg-neutral-100">
        <OnboardingWizard @completed="onOnboardingCompleted" />
    </div>

    <DashboardLayout v-else class="dashboard view">
        <RouterView />
    </DashboardLayout>
</template>
