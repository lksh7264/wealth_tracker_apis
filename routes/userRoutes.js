import express from 'express'
import { getAnalytics, getDashboard, updateProfile } from '../controllers/userController.js'

const router = express.Router()

router.get('/dashboard', getDashboard)
router.get('/analytics', getAnalytics)
router.patch('/profile', updateProfile)

export default router
