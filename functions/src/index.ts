import { onRequest } from 'firebase-functions/v2/https'
import { initializeApp, getApps } from 'firebase-admin/app'
import { getAuth } from 'firebase-admin/auth'
import * as functions from 'firebase-functions'

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

  // Optional: Basic token check (e.g. hardcoded admin secret)
  const ADMIN_SECRET = process.env.ADMIN_SECRET
  if (ADMIN_SECRET && authToken !== ADMIN_SECRET) {
    return res.status(403).send('Forbidden: Invalid admin secret')
  }

  try {
    // Create user
    const user = await auth.createUser({ email, password })

    // Set custom claim
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
