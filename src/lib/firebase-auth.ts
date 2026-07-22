import axios from 'axios'

export type PlanId = string

export type UserProfileFlags = {
    onboardingComplete?: boolean
}

export type UserUsage = {
    featureId: string
    used: number
    limit: number
}

export type User = {
    email: string | null
    password?: string
    phoneNumber: string | null
    photoUrl?: string
}

export type UserProfile = User & {
    createdAt: string | number
    veifiedAt: string | number
    name: string
    role: string
    uid: string
    planId: PlanId
    usage: UserUsage[]
    flags?: UserProfileFlags
}

const FUNCTIONS_URL = import.meta.env.VITE_FIREBASE_FUNCTIONS_URL
const FUNCTIONS_SECRET = import.meta.env.VITE_FIREBASE_FUNCTIONS_SECRET

const functionsClient = axios.create({
    baseURL: FUNCTIONS_URL,
    headers: {}
})

export const createUser = (user: User) => {
    const authToken = FUNCTIONS_SECRET
    return functionsClient.post('/createCustomerUser', { ...user, authToken })
}
