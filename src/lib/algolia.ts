import { liteClient as algoliasearch } from 'algoliasearch/lite'

const { VITE_ALGOLIA_APP_ID, VITE_ALGOLIA_API_KEY } = import.meta.env

export const searchClient = algoliasearch(VITE_ALGOLIA_APP_ID, VITE_ALGOLIA_API_KEY)
