import { auth, db } from '@/lib/firebase'
import type { Company } from '@/types/company'
import { query, collection, where, getDocs } from 'firebase/firestore'
import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useCompanyStore = defineStore('company', () => {
    const loading = ref(false)
    const company = ref<Company | null>(null)

    const fetchCompany = async () => {
        const user = auth.currentUser

        if (!user) {
            return null
        }

        loading.value = true

        try {
            const q = query(collection(db, 'companies'), where('uuid', '==', user.uid))
            const snap = await getDocs(q)

            if (snap.empty) {
                console.warn('No company found for user:', user.uid)
                return
            }

            const docSnap = snap.docs[0] // assume only one company per user

            company.value = { ...(docSnap.data() as Company), id: docSnap.id }
        } catch (e) {
            console.error(e)
        } finally {
            loading.value = false
        }
    }

    return { fetchCompany, company }
})
