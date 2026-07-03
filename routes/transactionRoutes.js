import express from 'express'
import {
  createTransaction,
  deleteTransaction,
  listTransactions,
  updateTransaction,
} from '../controllers/transactionController.js'

const router = express.Router()

router.get('/', listTransactions)
router.post('/', createTransaction)
router.patch('/:id', updateTransaction)
router.delete('/:id', deleteTransaction)

export default router
