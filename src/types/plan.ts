export type PlanInterval = 'monthly' | 'annually'

export type PlanFeature = {
    id: string
    value: number
}

export type Plan = {
    id: string
    name: string
    description: string
    interval: PlanInterval
    isFree: boolean
    stripePriceId?: string
    price?: number
    features: PlanFeature[]
    createdAt: number
    updatedAt: number
}
