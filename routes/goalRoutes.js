import express from 'express'
import {
  addGoalContribution,
  createGoal,
  deleteGoal,
  listGoals,
  updateGoal,
} from '../controllers/goalController.js'

const router = express.Router()

router.get('/', listGoals)
router.post('/', createGoal)
router.patch('/:id', updateGoal)
router.post('/:id/contributions', addGoalContribution)
router.delete('/:id', deleteGoal)

export default router
