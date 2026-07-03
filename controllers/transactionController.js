import { serializeUserData } from '../utils/serialize.js'

function findTransaction(user, id) {
  return user.transactions.id(id)
}

export async function listTransactions(request, response) {
  response.json(serializeUserData(request.user).transactions)
}

export async function createTransaction(request, response, next) {
  try {
    const { amount, category, subCategory, date, note = '', payee = '', type } = request.body

    if (!amount || !category || !type || !subCategory) {
      return response.status(400).json({ error: 'amount, category, subCategory, and type are required' })
    }

    request.user.transactions.push({
      amount: Number(amount),
      category,
      subCategory,
      date: date || new Date(),
      note,
      payee,
      type,
    })

    await request.user.save()
    response.status(201).json(serializeUserData(request.user))
  } catch (error) {
    next(error)
  }
}

export async function updateTransaction(request, response, next) {
  try {
    const transaction = findTransaction(request.user, request.params.id)
    if (!transaction) {
      return response.status(404).json({ error: 'Transaction not found' })
    }

    ;['amount', 'category', 'subCategory', 'date', 'note', 'payee', 'type'].forEach((field) => {
      if (request.body[field] !== undefined) {
        transaction[field] = field === 'amount' ? Number(request.body[field]) : request.body[field]
      }
    })

    await request.user.save()
    response.json(serializeUserData(request.user))
  } catch (error) {
    next(error)
  }
}

export async function deleteTransaction(request, response, next) {
  try {
    const transaction = findTransaction(request.user, request.params.id)
    if (!transaction) {
      return response.status(404).json({ error: 'Transaction not found' })
    }

    transaction.deleteOne()
    await request.user.save()
    response.json(serializeUserData(request.user))
  } catch (error) {
    next(error)
  }
}
