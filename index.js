import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'
import dotenv from 'dotenv'

const __dirname = dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: resolve(__dirname, './.env') })

import cors from 'cors'
import express from 'express'
import { connectDatabase } from './config/database.js'
import authRoutes from './routes/authRoutes.js'
import budgetRoutes from './routes/budgetRoutes.js'
import goalRoutes from './routes/goalRoutes.js'
import transactionRoutes from './routes/transactionRoutes.js'
import userRoutes from './routes/userRoutes.js'
import { requireAuth } from './middleware/authMiddleware.js'

const app = express()
const PORT = process.env.PORT || 3000

const DEFAULT_CLIENT_URLS = [
  'http://localhost:5174',
  'http://127.0.0.1:5174',
  'http://localhost:4174',
  'http://127.0.0.1:4174',
]

const allowedOrigins = (process.env.CLIENT_URL || DEFAULT_CLIENT_URLS.join(','))
  .split(',')
  .map((origin) => origin.trim().replace(/\/$/, ''))
  .filter(Boolean)

// Any localhost/127.0.0.1 origin on any port (Vite picks 5173, 5174, ... when ports are busy).
const LOCAL_ORIGIN = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/

app.use(
  cors({
    origin(origin, callback) {
      // Allow requests with no Origin (curl, Postman, mobile apps, same-origin).
      if (!origin) {
        return callback(null, true)
      }
      const normalized = origin.replace(/\/$/, '')
      if (allowedOrigins.includes(normalized) || LOCAL_ORIGIN.test(normalized)) {
        return callback(null, true)
      }
      return callback(new Error(`Origin ${origin} not allowed by CORS`))
    },
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  }),
)
app.use(express.json({ limit: '2mb' }))

app.get('/api/health', (request, response) => {
  response.json({ status: 'ok', service: 'expensemind-api' })
})

app.use('/api/auth', authRoutes)
app.use('/api', requireAuth, userRoutes)
app.use('/api/transactions', requireAuth, transactionRoutes)
app.use('/api/budgets', requireAuth, budgetRoutes)
app.use('/api/goals', requireAuth, goalRoutes)

app.use((request, response) => {
  response.status(404).json({ error: 'Route not found' })
})

app.use((error, request, response, next) => {
  console.error(error)

  if (error.name === 'ValidationError') {
    return response.status(400).json({ error: error.message })
  }

  if (error.code === 11000) {
    return response.status(409).json({ error: 'A record with this value already exists.' })
  }

  response.status(500).json({ error: 'Something went wrong' })
})

connectDatabase()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`ExpenseMind API running at http://localhost:${PORT}`)
    })
  })
  .catch((error) => {
    console.error('MongoDB connection failed')
    console.error(error.message)
    process.exit(1)
  })
