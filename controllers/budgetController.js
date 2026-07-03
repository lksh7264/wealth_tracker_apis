import { serializeUserData } from '../utils/serialize.js'

export async function listBudgets(request, response) {
  response.json(serializeUserData(request.user).budgets)
}

export async function createBudget(request, response, next) {
  try {
    const { name, limit } = request.body

    if (!name || limit === undefined) {
      return response.status(400).json({ error: 'name and limit are required' })
    }

    request.user.budgets.push({ name, limit: Number(limit) })
    await request.user.save()
    response.status(201).json(serializeUserData(request.user))
  } catch (error) {
    next(error)
  }
}

export async function updateBudget(request, response, next) {
  try {
    const budget = request.user.budgets.id(request.params.id)
    if (!budget) {
      return response.status(404).json({ error: 'Budget not found' })
    }

    if (request.body.name !== undefined) budget.name = request.body.name
    if (request.body.limit !== undefined) budget.limit = Number(request.body.limit)

    await request.user.save()
    response.json(serializeUserData(request.user))
  } catch (error) {
    next(error)
  }
}

export async function deleteBudget(request, response, next) {
  try {
    const budget = request.user.budgets.id(request.params.id)
    if (!budget) {
      return response.status(404).json({ error: 'Budget not found' })
    }

    budget.deleteOne()
    await request.user.save()
    response.json(serializeUserData(request.user))
  } catch (error) {
    next(error)
  }
}
