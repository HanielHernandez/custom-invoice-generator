import { db } from '@/lib/firebase'
import type { Invoice } from '@/types/invoice'
import { addDoc, collection, doc, getDoc, updateDoc } from 'firebase/firestore'
import { defineStore } from 'pinia'
import { reactive, ref, type Ref } from 'vue'

const catchErrors = async (
    callBack: () => Promise<void>,
    onError: (e: string) => void,
    loading: Ref<boolean>
) => {
    try {
        loading.value = true
        await callBack()
    } catch (e) {
        onError(e as string)
    } finally {
        loading.value = false
    }
}

export const useInvoiceStore = defineStore('invoices', () => {
    // const invoice = ref<Invoice | null>(null)
    const loading = ref(false)
    const deleting = ref(false)
    const fetching = ref(false)

    const error = reactive({
        title: '',
        description: ''
    })

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

    const remove = async (id: string) => {
        await catchErrors(
            () => updateDoc(doc(db, 'invoices', id), { deleted: true, deletedAt: Date.now() }),
            handleError('Error on delete invoice'),
            deleting
        )
    }

    const handleError = (title: string) => {
        return (description: string) => {
            error.title = title
            error.description = description
        }
    }

    const resetError = () => {
        error.title = ''
        error.description = ''
    }

    return {
        create,
        loading,
        find,
        invoice,
        update,
        fetching,
        remove,
        resetError,
        deleting,
        error
    }
})
