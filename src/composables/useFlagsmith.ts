import { ref } from 'vue'
import { flagsmith, initFlagsmith } from '@/lib/flagsmith'

const isReady = ref(false)
const isIdentified = ref(false)
const error = ref<Error | null>(null)
const clients = ref(false)
const plans = ref(false)
const onboarding = ref(false)

const syncFlags = () => {
    clients.value = flagsmith.hasFeature('clients')
    plans.value = flagsmith.hasFeature('plans')
    onboarding.value = flagsmith.hasFeature('onboarding')
}

export function useFlagsmith() {
    const getFlagsmith = async () => {
        try {
            await initFlagsmith({
                onChange: () => {
                    syncFlags()
                }
            })
            syncFlags()
            isReady.value = true
            error.value = null
            return flagsmith
        } catch (e) {
            error.value = e instanceof Error ? e : new Error(String(e))
            throw e
        }
    }

    const identify = async (email: string) => {
        const client = await getFlagsmith()
        await client.identify(email)
        isIdentified.value = true
        syncFlags()
        return client
    }

    return {
        flagsmith,
        clients,
        plans,
        onboarding,
        isReady,
        isIdentified,
        error,
        getFlagsmith,
        identify,
        hasFeature: (key: string) => flagsmith.hasFeature(key),
        getValue: (key: string) => flagsmith.getValue(key)
    }
}
