import User from '../models/User.js'
import { createToken, hashPassword, verifyPassword } from '../utils/auth.js'
import { serializeUserData } from '../utils/serialize.js'

function sendAuthResponse(response, user) {
  response.json({
    token: createToken(String(user._id)),
    user: {
      uid: String(user._id),
      email: user.email,
      displayName: user.profile.name,
    },
    userData: serializeUserData(user),
  })
}

export async function register(request, response, next) {
  try {
    const { name, email, password } = request.body

    if (!name || !email || !password) {
      return response.status(400).json({ error: 'name, email, and password are required' })
    }

    if (password.length < 6) {
      return response.status(400).json({ error: 'password must be at least 6 characters' })
    }

    const normalizedEmail = email.toLowerCase().trim()
    const existingUser = await User.findOne({ email: normalizedEmail })
    if (existingUser) {
      return response.status(409).json({ error: 'An account already exists for that email.' })
    }

    const { salt, hash } = hashPassword(password)
    const user = await User.create({
      email: normalizedEmail,
      passwordHash: hash,
      passwordSalt: salt,
      profile: {
        name: name.trim(),
        email: normalizedEmail,
      },
    })

    sendAuthResponse(response.status(201), user)
  } catch (error) {
    next(error)
  }
}

export async function login(request, response, next) {
  try {
    const { email, password } = request.body

    if (!email || !password) {
      return response.status(400).json({ error: 'email and password are required' })
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() })
    const validPassword = user ? verifyPassword(password, user.passwordSalt, user.passwordHash) : false

    if (!user || !validPassword) {
      return response.status(401).json({ error: 'Invalid email or password.' })
    }

    sendAuthResponse(response, user)
  } catch (error) {
    next(error)
  }
}

export async function getMe(request, response) {
  response.json({
    user: {
      uid: String(request.user._id),
      email: request.user.email,
      displayName: request.user.profile.name,
    },
    userData: serializeUserData(request.user),
  })
}
