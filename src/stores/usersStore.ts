import { getUsers, type UserProfile } from '@/lib/firebase-auth'
import { QueryDocumentSnapshot } from 'firebase/firestore'
import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useUserStore = defineStore('users', () => {
    const loading = ref(false)
    const error = ref<string | null>(null)
    const items = ref<UserProfile[]>([])
    const orderby = ref<string>('createdAt')
    const flow = ref<'asc' | 'desc'>('desc')

    const max = ref<number>(10)
    const lastItem = ref<QueryDocumentSnapshot | undefined>(undefined)

    const fetch = async () => {
        try {
            loading.value = true

            const { items: userItems, lastItem: usersLastItem } = await getUsers({
                max: max.value,
                lastItem: lastItem.value,
                flow: flow.value,
                orderByProp: orderby.value
            })

            items.value = userItems
            lastItem.value = usersLastItem

            loading.value = false
        } catch (e) {
            console.error(e)
            loading.value = false
            error.value = 'Error fetching users'
        }
    }

    function reset() {
        lastItem.value = undefined
        fetch()
    }

    return { loading, error, items, fetch, reset }
})
