import { db } from '@/lib/firebase'
import type { Invoice } from '@/types/Invoice'
import { addDoc, collection } from 'firebase/firestore'
import { defineStore } from 'pinia'
import { ref } from 'vue'

export const userInvoiceStore = defineStore('invices', () => {
    // const invoice = ref<Invoice | null>(null)
    const loading = ref(false)

    const create = async (payloadInvoice: Invoice) => {
        loading.value = true

        try {
            await addDoc(collection(db, 'invoices'), payloadInvoice)
        } catch (e) {
            console.error(e)
            alert('Error saving invoice')
        } finally {
            loading.value = false
        }
    }

    return { create, loading }
})
