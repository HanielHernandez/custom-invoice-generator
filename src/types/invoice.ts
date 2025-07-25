import type { Company } from './company'

export type Item = {
    description: string
    price: number
    quantity: number
}

export interface Invoice {
    id?: string
    code?: string
    name: string
    stimates: string
    customerName: string
    customerAddres: string
    city: string
    state: string
    zip: string
    phone: string
    total: number
    description: string
    services: string[]
    materials: boolean
    uid: string
    objectID: string
    company: Company
    createdAt?: number
    deleted?: boolean
    deletedAt?: number | null
    items?: Item[]
}
