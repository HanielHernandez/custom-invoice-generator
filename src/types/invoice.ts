import type { Company } from './company'

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
    total: string
    description: string
    services: string[]
    materials: boolean
    uid: string
    objectID: string
    company: Company
    createdAt?: number
    deletedAt?: number | null
}
