import User from '../models/User.js'
import { verifyToken } from '../utils/auth.js'

export async function requireAuth(request, response, next) {
  try {
    const header = request.headers.authorization || ''
    const token = header.startsWith('Bearer ') ? header.slice(7) : ''
    const payload = verifyToken(token)

    if (!payload) {
      return response.status(401).json({ error: 'Please sign in first.' })
    }

    const user = await User.findById(payload.sub)
    if (!user) {
      return response.status(401).json({ error: 'Account not found.' })
    }

    request.user = user
    next()
  } catch (error) {
    next(error)
  }
}
