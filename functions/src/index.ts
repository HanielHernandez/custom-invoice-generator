import { onRequest } from 'firebase-functions/v2/https'
import { initializeApp, getApps } from 'firebase-admin/app'
import { getAuth } from 'firebase-admin/auth'
import * as dotenv from 'dotenv'

dotenv.config()

// Initialize Firebase Admin if not already initialized
if (!getApps().length) {
  initializeApp()
}

// HTTP Function (v2)
export const createAdminUser = onRequest(async (req, res: any) => {
  const auth = getAuth()

  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).send('Method Not Allowed')
  }

  const { email, password, authToken } = req.body

  if (!email || !password) {
    return res.status(400).send('Missing email or password')
  }

  // Optional: Admin secret check
  const ADMIN_SECRET = process.env.ADMIN_SECRET
  if (ADMIN_SECRET && authToken !== ADMIN_SECRET) {
    return res.status(403).send('Forbidden: Invalid admin secret')
  }

  try {
    // 🔒 Check if an admin user already exists
    let adminExists = false
    let nextPageToken: string | undefined

    do {
      const result = await auth.listUsers(1000, nextPageToken)
      adminExists = result.users.some((user) => user.customClaims?.role === 'admin')
      nextPageToken = result.pageToken
    } while (!adminExists && nextPageToken)

    if (adminExists) {
      return res.status(409).json({ error: 'An admin user already exists.' })
    }

    // ✅ Create user
    const user = await auth.createUser({ email, password })

    // ✅ Set admin claim
    await auth.setCustomUserClaims(user.uid, { role: 'admin' })

    return res.status(201).json({
      message: `✅ Admin user created: ${user.uid}`,
      uid: user.uid
    })
  } catch (err: any) {
    console.error('❌ Error:', err)
    return res.status(500).json({ error: err.message })
  }
})
