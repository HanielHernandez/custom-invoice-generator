import { config } from '@/config'
import flagsmith from 'flagsmith'
import type { IInitConfig } from 'flagsmith'

let initPromise: Promise<typeof flagsmith> | null = null

export async function initFlagsmith(initConfig: Omit<IInitConfig, 'environmentID'> = {}) {
    if (flagsmith.initialised) {
        return flagsmith
    }

    if (!initPromise) {
        initPromise = flagsmith
            .init({
                environmentID: config.flagsmith.environmentKey,
                cacheFlags: true,
                ...initConfig
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
