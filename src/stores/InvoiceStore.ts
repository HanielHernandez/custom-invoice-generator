import { db } from '@/lib/firebase'
import type { Invoice } from '@/types/invoice'
import { addDoc, collection, doc, getDoc, updateDoc } from 'firebase/firestore'
import { defineStore } from 'pinia'
import { ref } from 'vue'

export const userInvoiceStore = defineStore('invices', () => {
    // const invoice = ref<Invoice | null>(null)
    const loading = ref(false)
    const fetching = ref(false)

    const invoice = ref<Invoice | null>(null)
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

    const find = async (id: string) => {
        fetching.value = true
        try {
            const docSnap = await getDoc(doc(db, 'invoices', id))
            invoice.value = docSnap.exists()
                ? ({ ...docSnap.data(), objectID: docSnap.id } as Invoice)
                : null
        } catch (e) {
            console.error(e)
        } finally {
            fetching.value = false
        }
    }

    const update = async (id: string, payload: Invoice) => {
        loading.value = true
        try {
            await updateDoc(doc(db, 'invoices', id), { ...payload })
        } catch (e) {
            console.error(e)
        } finally {
            loading.value = false
        }
    }

    return { create, loading, find, invoice, update, fetching }
})
