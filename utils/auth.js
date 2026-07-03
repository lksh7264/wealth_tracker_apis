import crypto from 'crypto'

const TOKEN_TTL_MS = 7 * 24 * 60 * 60 * 1000

function getSecret() {
  return process.env.AUTH_SECRET || 'expensemind-dev-secret-change-me'
}

function base64UrlEncode(value) {
  return Buffer.from(JSON.stringify(value)).toString('base64url')
}

function base64UrlDecode(value) {
  return JSON.parse(Buffer.from(value, 'base64url').toString('utf8'))
}

function sign(value) {
  return crypto.createHmac('sha256', getSecret()).update(value).digest('base64url')
}

export function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex')
  const hash = crypto.scryptSync(password, salt, 64).toString('hex')
  return { salt, hash }
}

export function verifyPassword(password, salt, expectedHash) {
  const hash = crypto.scryptSync(password, salt, 64)
  const expected = Buffer.from(expectedHash, 'hex')
  return expected.length === hash.length && crypto.timingSafeEqual(hash, expected)
}

export function createToken(userId) {
  const payload = base64UrlEncode({
    sub: userId,
    exp: Date.now() + TOKEN_TTL_MS,
  })
  return `${payload}.${sign(payload)}`
}

export function verifyToken(token) {
  if (!token || !token.includes('.')) return null

  const [payload, signature] = token.split('.')
  if (signature !== sign(payload)) return null

  const data = base64UrlDecode(payload)
  if (!data?.sub || Date.now() > data.exp) return null

  return data
}
