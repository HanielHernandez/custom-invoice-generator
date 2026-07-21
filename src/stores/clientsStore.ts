import { auth, db } from '@/lib/firebase'
import type { Client } from '@/types/client'
import {
    addDoc,
    collection,
    deleteDoc,
    doc,
    getDocs,
    query,
    updateDoc,
    where
} from 'firebase/firestore'
import { defineStore } from 'pinia'
import { ref } from 'vue'
import { useCompanyStore } from './companyStore'

export type CreateClientPayload = Omit<
    Client,
    'id' | 'uid' | 'companyId' | 'createdAt' | 'updatedAt' | 'deleted' | 'deletedAt'
>

export const useClientsStore = defineStore('clients', () => {
    const items = ref<Client[]>([])
    const cachedClients = ref<Client[]>([])
    const loading = ref(false)
    const saving = ref(false)
    const error = ref<string | null>(null)
    const perPage = ref(10)
    const endReach = ref(false)

    const getUserCompanyId = async () => {
        const companyStore = useCompanyStore()

        if (!companyStore.company?.id) {
            await companyStore.fetchCompany()
        }

        const companyId = companyStore.company?.id
        if (!companyId) {
            throw new Error('No company found for the current user')
        }

        return companyId
    }

    const fetch = async (pageLimit = 10) => {
        const user = auth.currentUser
        if (!user) {
            error.value = 'User not authenticated'
            return
        }

        try {
            perPage.value = pageLimit
            loading.value = true
            error.value = null

            // Equality-only query — no composite index required.
            // Sort + paginate on the client.
            if (cachedClients.value.length === 0 && !endReach.value) {
                const q = query(collection(db, 'clients'), where('uid', '==', user.uid))
                const snap = await getDocs(q)

                cachedClients.value = snap.docs
                    .map((docSnap) => ({
                        ...(docSnap.data() as Client),
                        id: docSnap.id
                    }))
                    .filter((client) => !client.deleted && client.deletedAt == null)
                    .sort((a, b) => b.createdAt - a.createdAt)
            }

            const start = items.value.length
            const nextPage = cachedClients.value.slice(start, start + perPage.value)

            items.value = [...items.value, ...nextPage]

            if (items.value.length >= cachedClients.value.length) {
                endReach.value = true
            }
        } catch (e) {
            console.error(e)
            error.value = e instanceof Error ? e.message : 'Error fetching clients'
        } finally {
            loading.value = false
        }
    }

    const reset = () => {
        endReach.value = false
        items.value = []
        cachedClients.value = []
        error.value = null
    }

    const create = async (payload: CreateClientPayload) => {
        const user = auth.currentUser
        if (!user) throw new Error('User not authenticated')

        saving.value = true
        try {
            const companyId = await getUserCompanyId()
            const now = Date.now()
            const client: Omit<Client, 'id'> = {
                ...payload,
                uid: user.uid,
                companyId,
                createdAt: now,
                updatedAt: now,
                deleted: false,
                deletedAt: null
            }
            const { id } = await addDoc(collection(db, 'clients'), client)
            const created = { ...client, id }
            items.value = [created, ...items.value]
            cachedClients.value = [created, ...cachedClients.value]
            return id
        } finally {
            saving.value = false
        }
    }

    const update = async (id: string, payload: CreateClientPayload) => {
        saving.value = true
        try {
            const updatedAt = Date.now()
            await updateDoc(doc(db, 'clients', id), { ...payload, updatedAt })
            const patch = { ...payload, updatedAt }
            items.value = items.value.map((client) =>
                client.id === id ? { ...client, ...patch } : client
            )
            cachedClients.value = cachedClients.value.map((client) =>
                client.id === id ? { ...client, ...patch } : client
            )
        } finally {
            saving.value = false
        }
    }

    const remove = async (id: string) => {
        if (!id) {
            throw new Error('Client id is required to delete')
        }

        saving.value = true
        try {
            await deleteDoc(doc(db, 'clients', id))
            items.value = items.value.filter((client) => client.id !== id)
            cachedClients.value = cachedClients.value.filter((client) => client.id !== id)
        } catch (e) {
            console.error('clientsStore.remove failed:', e)
            throw e
        } finally {
            saving.value = false
        }
    }

    return {
        items,
        loading,
        saving,
        error,
        endReach,
        fetch,
        reset,
        create,
        update,
        remove
    }
})
