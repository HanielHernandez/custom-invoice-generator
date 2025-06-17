import { db } from '@/lib/firebase'
import { type UserProfile } from '@/lib/firebase-auth'
import { collection, getDocs, limit, orderBy, query, startAfter, where } from 'firebase/firestore'
import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useUserStore = defineStore('users', () => {
    const loading = ref(false)
    const email = ref<string | null>(null)

    const error = ref<string | null>(null)
    const items = ref<UserProfile[]>([])
    const orderby = ref<string>('createdAt')
    const flow = ref<'asc' | 'desc'>('desc')
    const perPage = ref(10)

    const lastItem = ref<number | null>(null)
    const before = ref<number | null>(null)
    const endReach = ref(false)

    const fetch = async (pageLimit = 10) => {
        try {
            perPage.value = pageLimit
            loading.value = true
            const usersRef = collection(db, 'profiles')
            const q = query(
                usersRef,
                orderBy(orderby.value, flow.value),
                ...(lastItem.value ? [startAfter(lastItem.value)] : []),
                ...(email.value !== null ? [where('email', '==', email.value)] : []),
                limit(perPage.value)
            )

            const querySnapshot = await getDocs(q)
            const docs = querySnapshot.docs

            before.value = lastItem.value ? lastItem.value : Date.now()

            if (docs.length) {
                lastItem.value = docs[docs.length - 1].data().createdAt
            } else {
                endReach.value = true
            }

            items.value = [
                ...items.value,
                ...docs.map<UserProfile>((doc) => ({
                    id: doc.id,
                    ...(doc.data() as UserProfile)
                }))
            ]
            console.log(
                docs.map<UserProfile>((doc) => ({
                    id: doc.id,
                    ...(doc.data() as UserProfile)
                }))
            )

            loading.value = false
        } catch (e) {
            console.error(e)
            loading.value = false
            error.value = 'Error fetching users'
        }
    }

    function reset() {
        email.value = null
        lastItem.value = null
        items.value = []
    }

    function setLastItem(payload: number | null) {
        lastItem.value = payload
    }

    async function filterByEmail(emailFilter: string) {
        reset()
        email.value = emailFilter == '' ? null : emailFilter
        console.log(email.value)
        await fetch()
    }

    return { loading, error, items, fetch, reset, setLastItem, before, lastItem, filterByEmail }
})
