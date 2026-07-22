const trimTrailingSlash = (value: string) => value.replace(/\/+$/, '')

export const config = {
    firebase: {
        apiKey: import.meta.env.VITE_FIREBASE_API_KEY as string,
        authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN as string,
        projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID as string,
        storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET as string,
        messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID as string,
        appId: import.meta.env.VITE_FIREBASE_APP_ID as string,
        measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID as string,
        functionsUrl: trimTrailingSlash(
            (import.meta.env.VITE_FIREBASE_FUNCTIONS_URL as string | undefined) ?? ''
        ),
        functionsSecret: import.meta.env.VITE_FIREBASE_FUNCTIONS_SECRET as string
    },
    algolia: {
        appId: import.meta.env.VITE_ALGOLIA_APP_ID as string,
        apiKey: import.meta.env.VITE_ALGOLIA_API_KEY as string,
        writeApiKey: import.meta.env.VITE_ALGOLIA_WRITE_API_KEY as string | undefined,
        recordsIndex: import.meta.env.VITE_ALGOLIA_RECORDS_INDEX as string | undefined
    },
    siteUrl: trimTrailingSlash((import.meta.env.VITE_SITE_URL as string | undefined) ?? ''),
    flagsmith: {
        environmentKey: import.meta.env.VITE_FLAGSMITH_ENVIRONMENT_KEY as string
    }
} as const

export type AppConfig = typeof config
