import { auth, db } from '@/lib/firebase'
import type { Client } from '@/types/client'
import {
    addDoc,
    collection,
    deleteDoc,
    doc,
    getDoc,
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

const isActiveClient = (client: Client) => !client.deleted && client.deletedAt == null

export const useClientsStore = defineStore('clients', () => {
    const items = ref<Client[]>([])
    const loading = ref(false)
    const saving = ref(false)
    const error = ref<string | null>(null)
    const loaded = ref(false)

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

    const isAdminUser = async () => {
        const user = auth.currentUser
        if (!user) return false

        const tokenResult = await user.getIdTokenResult()
        if (tokenResult.claims.role === 'admin') return true

        const profileSnap = await getDoc(doc(db, 'profiles', user.uid))
        return profileSnap.exists() && profileSnap.data()?.role === 'admin'
    }

    const fetch = async (force = false) => {
        const user = auth.currentUser
        if (!user) {
            error.value = 'User not authenticated'
            return
        }

        if (loaded.value && !force) return

        try {
            loading.value = true
            error.value = null

            let docs: Client[]

            if (await isAdminUser()) {
                const snap = await getDocs(collection(db, 'clients'))
                docs = snap.docs.map((docSnap) => ({
                    ...(docSnap.data() as Client),
                    id: docSnap.id
                }))
            } else {
                const companyId = await getUserCompanyId()
                const [byUidSnap, byCompanySnap] = await Promise.all([
                    getDocs(query(collection(db, 'clients'), where('uid', '==', user.uid))),
                    getDocs(
                        query(collection(db, 'clients'), where('companyId', '==', companyId))
                    )
                ])

                const byId = new Map<string, Client>()
                for (const snap of [byUidSnap, byCompanySnap]) {
                    for (const docSnap of snap.docs) {
                        byId.set(docSnap.id, {
                            ...(docSnap.data() as Client),
                            id: docSnap.id
                        })
                    }
                }
                docs = [...byId.values()]
            }

            items.value = docs
                .filter(isActiveClient)
                .sort((a, b) => b.createdAt - a.createdAt)

            loaded.value = true
        } catch (e) {
            console.error(e)
            error.value = e instanceof Error ? e.message : 'Error fetching clients'
        } finally {
            loading.value = false
        }
    }

    const reset = () => {
        items.value = []
        error.value = null
        loaded.value = false
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
            return id
        } finally {
            saving.value = false
        }
    }

    const update = async (id: string, payload: CreateClientPayload, existing?: Client) => {
        saving.value = true
        try {
            const updatedAt = Date.now()
            await updateDoc(doc(db, 'clients', id), { ...payload, updatedAt })
            const patch = { ...payload, updatedAt }
            const base = items.value.find((client) => client.id === id) ?? existing

            const patched: Client = {
                ...(base ?? {
                    id,
                    uid: '',
                    companyId: '',
                    createdAt: updatedAt,
                    deleted: false,
                    deletedAt: null
                }),
                ...patch,
                id
            }

            items.value = items.value.some((client) => client.id === id)
                ? items.value.map((client) => (client.id === id ? patched : client))
                : [patched, ...items.value]
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
        loaded,
        fetch,
        reset,
        create,
        update,
        remove
    }
})
