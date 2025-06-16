import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

export function generateInvoiceCode(prefix = 'INV'): string {
    const now = new Date()
    const datePart = now.toISOString().slice(0, 10).replace(/-/g, '') // e.g. 20250615
    const randomPart = Math.random().toString(36).substring(2, 7).toUpperCase() // e.g. 3F7A2
    return `${prefix}-${datePart}-${randomPart}`
}
