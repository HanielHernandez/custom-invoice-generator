export interface Client {
    id?: string
    email: string
    name: string
    phone: string
    address: string
    cityStateZip: string
    uid: string
    companyId: string
    createdAt: number
    updatedAt: number
    deleted: boolean
    deletedAt: number | null
}
