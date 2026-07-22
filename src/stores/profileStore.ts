import { auth, db } from '@/lib/firebase'
import type { UserProfile, UserProfileFlags } from '@/lib/firebase-auth'
import { doc, getDoc, setDoc } from 'firebase/firestore'
import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

export const useProfileStore = defineStore('profile', () => {
    const profile = ref<UserProfile | null>(null)
    const loading = ref(false)
    const error = ref<string | null>(null)
    const loaded = ref(false)

    const onboardingComplete = computed(
        () => Boolean(profile.value?.flags?.onboardingComplete)
    )

    const fetchProfile = async (force = false) => {
        const user = auth.currentUser
        if (!user) {
            profile.value = null
            loaded.value = true
            return null
        }

        if (loaded.value && !force && profile.value?.uid === user.uid) {
            return profile.value
        }

        loading.value = true
        error.value = null
        try {
            const snap = await getDoc(doc(db, 'profiles', user.uid))
            if (!snap.exists()) {
                profile.value = null
                loaded.value = true
                return null
            }

            profile.value = {
                ...(snap.data() as UserProfile),
                uid: user.uid
            }
            loaded.value = true
            return profile.value
        } catch (e) {
            console.error(e)
            error.value = e instanceof Error ? e.message : 'Error fetching profile'
            throw e
        } finally {
            loading.value = false
        }
    }

    const updateFlags = async (flags: UserProfileFlags) => {
        const user = auth.currentUser
        if (!user) throw new Error('User not authenticated')

        const nextFlags = {
            ...(profile.value?.flags ?? {}),
            ...flags
        }

        await setDoc(
            doc(db, 'profiles', user.uid),
            { flags: nextFlags },
            { merge: true }
        )

        if (profile.value) {
            profile.value = {
                ...profile.value,
                flags: nextFlags
            }
        } else {
            await fetchProfile(true)
        }
    }

    const markOnboardingComplete = async () => {
        await updateFlags({ onboardingComplete: true })
    }

    const isUsageLimitReached = (featureId: string) => {
        const featureUsage = profile.value?.usage?.find(
            (usage) => usage.featureId === featureId
        )

        if (!featureUsage) return false
        return featureUsage.used >= featureUsage.limit
    }

    const assertUsageAvailable = async (featureId: string) => {
        if (!loaded.value) {
            await fetchProfile()
        }

        if (isUsageLimitReached(featureId)) {
            throw new Error(
                `You have reached your ${featureId} limit. Upgrade your plan to create more.`
            )
        }
    }

    const incrementLocalUsage = (featureId: string) => {
        if (!profile.value?.usage) return

        profile.value = {
            ...profile.value,
            usage: profile.value.usage.map((usage) =>
                usage.featureId === featureId
                    ? { ...usage, used: usage.used + 1 }
                    : usage
            )
        }
    }

    const reset = () => {
        profile.value = null
        error.value = null
        loaded.value = false
        loading.value = false
    }

    return {
        profile,
        loading,
        error,
        loaded,
        onboardingComplete,
        fetchProfile,
        updateFlags,
        markOnboardingComplete,
        isUsageLimitReached,
        assertUsageAvailable,
        incrementLocalUsage,
        reset
    }
})
