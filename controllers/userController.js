import { serializeUserData } from '../utils/serialize.js'

function getTotals(user) {
  const income = user.transactions
    .filter((tx) => tx.type === 'income')
    .reduce((sum, tx) => sum + Number(tx.amount || 0), 0)
  const expense = user.transactions
    .filter((tx) => tx.type === 'expense')
    .reduce((sum, tx) => sum + Number(tx.amount || 0), 0)
  const budgetLimit = user.budgets.reduce((sum, budget) => sum + Number(budget.limit || 0), 0)

  return {
    income,
    expense,
    balance: income - expense,
    budgetLimit,
    budgetUsed: expense,
    spentPct: budgetLimit ? Math.min(100, Math.round((expense / budgetLimit) * 100)) : 0,
  }
}

export async function updateProfile(request, response, next) {
  try {
    const allowedFields = ['name', 'email', 'phone', 'image']

    allowedFields.forEach((field) => {
      if (request.body[field] !== undefined) {
        request.user.profile[field] = request.body[field]
      }
    })

    if (request.body.email) {
      request.user.email = request.body.email.toLowerCase().trim()
      request.user.profile.email = request.user.email
    }

    await request.user.save()
    response.json(serializeUserData(request.user))
  } catch (error) {
    next(error)
  }
}

export async function getDashboard(request, response) {
  const userData = serializeUserData(request.user)
  const recentTransactions = [...userData.transactions]
    .sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0))
    .slice(0, 4)

  response.json({
    totals: getTotals(request.user),
    recentTransactions,
    goals: userData.goals,
    budgets: userData.budgets,
  })
}

export async function getAnalytics(request, response) {
  const expenses = request.user.transactions.filter((tx) => tx.type === 'expense')
  const categoryTotals = expenses.reduce((acc, tx) => {
    const key = tx.category || 'Other'
    acc[key] = (acc[key] || 0) + Number(tx.amount || 0)
    return acc
  }, {})
  const totalSpend = Object.values(categoryTotals).reduce((sum, value) => sum + value, 0)
  const categories = Object.entries(categoryTotals)
    .sort((a, b) => b[1] - a[1])
    .map(([name, amount]) => ({
      name,
      amount,
      pct: totalSpend ? Math.round((amount / totalSpend) * 100) : 0,
    }))

  const highest = expenses.reduce(
    (max, tx) => (Number(tx.amount || 0) > Number(max?.amount || 0) ? tx : max),
    null
  )

  response.json({
    totals: getTotals(request.user),
    categories,
    alerts: highest
      ? [
          {
            icon: 'shopping_cart',
            title: 'High-value purchase detected',
            desc: `${highest.payee || highest.category} for ₹${Number(highest.amount || 0).toLocaleString('en-IN')} was recorded recently.`,
            time: highest.date,
          },
        ]
      : [],
  })
}
