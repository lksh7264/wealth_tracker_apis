import mongoose from 'mongoose'

const profileSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    phone: { type: String, default: '', trim: true },
    image: { type: String, default: '' },
    memberSince: { type: Date, default: Date.now },
  },
  { _id: false }
)

const transactionSchema = new mongoose.Schema(
  {
    amount: { type: Number, required: true, min: 0.01 },
    category: { type: String, required: true, trim: true },
    subCategory: { type: String, required: true, trim: true },
    date: { type: Date, required: true },
    note: { type: String, default: '', trim: true },
    payee: { type: String, default: '', trim: true },
    type: { type: String, enum: ['income', 'expense'], required: true },
  },
  { timestamps: true }
)

const budgetSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    limit: { type: Number, required: true, min: 0 },
  },
  { timestamps: true }
)

const goalSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    amount: { type: Number, required: true, min: 0.01 },
    targetDate: { type: Date },
    category: { type: String, default: 'Other', trim: true },
    currentAmount: { type: Number, default: 0, min: 0 },
  },
  { timestamps: true }
)

const userSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    passwordSalt: { type: String, required: true },
    profile: { type: profileSchema, required: true },
    transactions: { type: [transactionSchema], default: [] },
    budgets: { type: [budgetSchema], default: [] },
    goals: { type: [goalSchema], default: [] },
  },
  { timestamps: true }
)

export default mongoose.model('User', userSchema)
