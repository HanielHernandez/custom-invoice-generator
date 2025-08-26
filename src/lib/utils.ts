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

/**
 * Convierte los estilos CSS de color, background-color y border-color en un elemento HTML
 * de oklch a rgba (solo si el valor es oklch).
 * @param el Elemento HTML al que se le convertirán los colores
 */
export function convertElementOklchToRgba(el: HTMLElement) {
    if (!el || !el.style) return

    const oklchRegex = /oklch\(\s*([\d.]+)\s+([\d.]+)\s+([\d.]+)\s*(?:\/\s*([\d.]+))?\s*\)/i

    // Placeholder: convierte cualquier oklch a blanco, puedes integrar una librería real si lo necesitas
    function oklchToRgba(oklch: string): string {
        // Aquí deberías usar una librería como 'culori' para conversión real
        return 'rgba(255,255,255,1)'
    }

    const styleProps = ['color', 'backgroundColor', 'borderColor']

    styleProps.forEach((prop) => {
        const val = el.style[prop as any]
        if (typeof val === 'string' && oklchRegex.test(val)) {
            el.style[prop as any] = val.replace(oklchRegex, oklchToRgba)
        }
    })
}
