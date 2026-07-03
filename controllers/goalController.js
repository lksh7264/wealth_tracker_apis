import { serializeUserData } from '../utils/serialize.js'

export async function listGoals(request, response) {
  response.json(serializeUserData(request.user).goals)
}

export async function createGoal(request, response, next) {
  try {
    const { name, amount, targetDate, category, currentAmount = 0 } = request.body

    if (!name || !amount) {
      return response.status(400).json({ error: 'name and amount are required' })
    }

    request.user.goals.push({
      name,
      amount: Number(amount),
      targetDate: targetDate || undefined,
      category,
      currentAmount: Number(currentAmount || 0),
    })

    await request.user.save()
    response.status(201).json(serializeUserData(request.user))
  } catch (error) {
    next(error)
  }
}

export async function updateGoal(request, response, next) {
  try {
    const goal = request.user.goals.id(request.params.id)
    if (!goal) {
      return response.status(404).json({ error: 'Goal not found' })
    }

    ;['name', 'amount', 'targetDate', 'category', 'currentAmount'].forEach((field) => {
      if (request.body[field] !== undefined) {
        goal[field] = ['amount', 'currentAmount'].includes(field) ? Number(request.body[field]) : request.body[field]
      }
    })

    await request.user.save()
    response.json(serializeUserData(request.user))
  } catch (error) {
    next(error)
  }
}

export async function addGoalContribution(request, response, next) {
  try {
    const goal = request.user.goals.id(request.params.id)
    if (!goal) {
      return response.status(404).json({ error: 'Goal not found' })
    }

    goal.currentAmount = Number(goal.currentAmount || 0) + Number(request.body.amount || 0)
    await request.user.save()
    response.json(serializeUserData(request.user))
  } catch (error) {
    next(error)
  }
}

export async function deleteGoal(request, response, next) {
  try {
    const goal = request.user.goals.id(request.params.id)
    if (!goal) {
      return response.status(404).json({ error: 'Goal not found' })
    }

    goal.deleteOne()
    await request.user.save()
    response.json(serializeUserData(request.user))
  } catch (error) {
    next(error)
  }
}
