import flagsmith from 'flagsmith'
import type { IInitConfig } from 'flagsmith'

const environmentID = import.meta.env.VITE_FLAGSMITH_ENVIRONMENT_KEY as string

let initPromise: Promise<typeof flagsmith> | null = null

export async function initFlagsmith(config: Omit<IInitConfig, 'environmentID'> = {}) {
    if (flagsmith.initialised) {
        return flagsmith
    }

    if (!initPromise) {
        initPromise = flagsmith
            .init({
                environmentID,
                cacheFlags: true,
                ...config
            })
            .then(() => flagsmith)
            .catch((error) => {
                initPromise = null
                throw error
            })
    }

    return initPromise
}

export { flagsmith }
