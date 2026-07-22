import { auth, db } from '@/lib/firebase'
import type { Company } from '@/types/company'
import { query, collection, where, getDocs, doc, getDoc } from 'firebase/firestore'
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
                company.value = null
                return null
            }

            const docSnap = snap.docs[0] // assume only one company per user

            company.value = { ...(docSnap.data() as Company), id: docSnap.id }
            return company.value
        } catch (e) {
            console.error(e)
        } finally {
            loading.value = false
        }
    }

    const find = async (id: string) => {
        loading.value = true
        try {
            const docSnap = await getDoc(doc(db, 'companies', id))
            company.value = docSnap.exists()
                ? ({ ...docSnap.data(), objectID: docSnap.id } as Company)
                : null
        } catch (e) {
            console.error(e)
        } finally {
            loading.value = false
        }
    }

    const reset = () => {
        company.value = null
        loading.value = false
    }

    return { fetchCompany, company, find, reset }
})
