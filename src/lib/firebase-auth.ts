import axios from 'axios'

export type User = {
    email: string | null
    password?: string
    phoneNumber: string | null
    photoUrl?: string
}

export type UserProfile = User & {
    createdAt: string
    veifiedAt: string
    name: string
    role: string
    uid: string
}

const FUNCTIONS_URL = import.meta.env.VITE_FIREBASE_FUNCTIONS_URL
const FUNCTIONS_SECRET = import.meta.env.VITE_FIREBASE_FUNCTIONS_SECRET

const functionsClient = axios.create({
    baseURL: FUNCTIONS_URL,
    headers: {}
})

export const createUser = (user: User) => {
    const authToken = FUNCTIONS_SECRET
    return functionsClient.post('/createCustomerUser', { ...user, authToken })
}

// type GetUsersOptions = {
//     max?: number
//     page?: number
//     orderByProp?: string
//     flow?: 'asc' | 'desc'
//     lastItem?: QueryDocumentSnapshot
// }

// type GetUserResponse<T> = {
//     items: T[]
//     lastItem: QueryDocumentSnapshot
// }

// export const getUsers = async ({
//     max = 10,
//     orderByProp = 'createdAt',
//     flow = 'desc',
//     lastItem
// }: GetUsersOptions): Promise<GetUserResponse<UserProfile>> => {
//     return { items, lastItem: lastItemInArray }
// }
