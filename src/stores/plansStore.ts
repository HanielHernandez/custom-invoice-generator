import { db } from '@/lib/firebase'
import type { Plan, PlanFeature, PlanInterval } from '@/types/plan'
import {
    collection,
    deleteDoc,
    deleteField,
    doc,
    getDoc,
    getDocs,
    setDoc,
    updateDoc
} from 'firebase/firestore'
import { defineStore } from 'pinia'
import { ref } from 'vue'

export type PlanPayload = {
    id: string
    name: string
    description: string
    interval: PlanInterval
    isFree: boolean
    stripePriceId?: string
    price?: number
    features: PlanFeature[]
}

const normalizeFeatures = (features: unknown): PlanFeature[] => {
    if (!Array.isArray(features)) return []

    return features
        .map((feature) => {
            if (!feature || typeof feature !== 'object') return null
            const id = 'id' in feature ? String((feature as PlanFeature).id ?? '').trim() : ''
            const rawValue = 'value' in feature ? Number((feature as PlanFeature).value) : NaN
            if (!id || !Number.isInteger(rawValue)) return null
            return { id, value: rawValue }
        })
        .filter((feature): feature is PlanFeature => feature != null)
}

const mapPlan = (id: string, data: Record<string, unknown>): Plan => {
    const isFree = Boolean(data.isFree)
    const plan: Plan = {
        id,
        name: String(data.name ?? ''),
        description: String(data.description ?? ''),
        interval: (data.interval === 'annually' ? 'annually' : 'monthly') as PlanInterval,
        isFree,
        features: normalizeFeatures(data.features),
        createdAt: Number(data.createdAt ?? 0),
        updatedAt: Number(data.updatedAt ?? 0)
    }

    if (!isFree) {
        if (typeof data.stripePriceId === 'string') {
            plan.stripePriceId = data.stripePriceId
        }
        if (typeof data.price === 'number') {
            plan.price = data.price
        } else if (data.price != null) {
            plan.price = Number(data.price)
        }
    }

    return plan
}

const buildPlanData = (payload: Omit<PlanPayload, 'id'>, timestamps: {
    createdAt?: number
    updatedAt: number
}) => {
    const base = {
        name: payload.name.trim(),
        description: payload.description.trim(),
        interval: payload.interval,
        isFree: payload.isFree,
        features: normalizeFeatures(payload.features),
        ...timestamps
    }

    if (payload.isFree) {
        return base
    }

    return {
        ...base,
        stripePriceId: (payload.stripePriceId ?? '').trim(),
        price: payload.price ?? 0
    }
}

export const usePlansStore = defineStore('plans', () => {
    const items = ref<Plan[]>([])
    const loading = ref(false)
    const saving = ref(false)
    const error = ref<string | null>(null)
    const loaded = ref(false)

    const fetch = async (force = false) => {
        if (loaded.value && !force) return

        try {
            loading.value = true
            error.value = null

            const snap = await getDocs(collection(db, 'plans'))
            items.value = snap.docs
                .map((docSnap) => mapPlan(docSnap.id, docSnap.data() as Record<string, unknown>))
                .sort((a, b) => (a.price ?? 0) - (b.price ?? 0))

            loaded.value = true
        } catch (e) {
            console.error(e)
            error.value = e instanceof Error ? e.message : 'Error fetching plans'
        } finally {
            loading.value = false
        }
    }

    const fetchById = async (id: string) => {
        const planId = id.trim()
        if (!planId) return null

        const cachedPlan = items.value.find((plan) => plan.id === planId)
        if (cachedPlan) return cachedPlan

        const snap = await getDoc(doc(db, 'plans', planId))
        if (!snap.exists()) return null

        const plan = mapPlan(snap.id, snap.data() as Record<string, unknown>)
        items.value = [...items.value, plan].sort((a, b) => (a.price ?? 0) - (b.price ?? 0))
        return plan
    }

    const create = async (payload: PlanPayload) => {
        const id = payload.id.trim()
        if (!id) throw new Error('Plan id is required')

        saving.value = true
        error.value = null
        try {
            const existing = await getDoc(doc(db, 'plans', id))
            if (existing.exists()) {
                throw new Error(`A plan with id "${id}" already exists`)
            }

            const now = Date.now()
            const data = buildPlanData(payload, { createdAt: now, updatedAt: now })
            const plan = mapPlan(id, { ...data, id })

            await setDoc(doc(db, 'plans', id), { ...data, id })
            items.value = [...items.value, plan].sort((a, b) => (a.price ?? 0) - (b.price ?? 0))
            return id
        } catch (e) {
            console.error('plansStore.create failed:', e)
            error.value = e instanceof Error ? e.message : 'Error creating plan'
            throw e
        } finally {
            saving.value = false
        }
    }

    const update = async (id: string, payload: Omit<PlanPayload, 'id'>) => {
        if (!id) throw new Error('Plan id is required')

        saving.value = true
        try {
            const updatedAt = Date.now()
            const data = buildPlanData(payload, { updatedAt })

            if (payload.isFree) {
                await updateDoc(doc(db, 'plans', id), {
                    ...data,
                    stripePriceId: deleteField(),
                    price: deleteField()
                })
            } else {
                await updateDoc(doc(db, 'plans', id), data)
            }

            const plan = mapPlan(id, { ...data, id, createdAt: items.value.find((p) => p.id === id)?.createdAt })
            items.value = items.value
                .map((item) => (item.id === id ? { ...item, ...plan } : item))
                .sort((a, b) => (a.price ?? 0) - (b.price ?? 0))
        } finally {
            saving.value = false
        }
    }

    const remove = async (id: string) => {
        if (!id) throw new Error('Plan id is required')

        saving.value = true
        try {
            await deleteDoc(doc(db, 'plans', id))
            items.value = items.value.filter((plan) => plan.id !== id)
        } finally {
            saving.value = false
        }
    }

    const reset = () => {
        items.value = []
        error.value = null
        loaded.value = false
    }

    return {
        items,
        loading,
        saving,
        error,
        loaded,
        fetch,
        fetchById,
        create,
        update,
        remove,
        reset
    }
})
