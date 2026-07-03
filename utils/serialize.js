function mapSubdocument(item) {
  const plain = item?.toObject ? item.toObject() : item
  if (!plain) return plain

  return {
    ...plain,
    id: String(plain._id),
    _id: undefined,
    date: plain.date ? new Date(plain.date).toISOString().slice(0, 10) : plain.date,
    targetDate: plain.targetDate ? new Date(plain.targetDate).toISOString().slice(0, 10) : plain.targetDate,
  }
}

export function serializeUserData(user) {
  if (!user) return null

  return {
    uid: String(user._id),
    profile: {
      ...user.profile.toObject(),
      memberSince: user.profile.memberSince?.toISOString?.() || user.profile.memberSince,
    },
    transactions: user.transactions.map(mapSubdocument),
    budgets: user.budgets.map(mapSubdocument),
    goals: user.goals.map(mapSubdocument),
  }
}
