import { config } from '@/config'
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

const functionsClient = axios.create({
    baseURL: config.firebase.functionsUrl,
    headers: {}
})

export const createUser = (user: User) => {
    const authToken = config.firebase.functionsSecret
    return functionsClient.post('/createCustomerUser', { ...user, authToken })
}
