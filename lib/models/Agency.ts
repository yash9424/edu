import mongoose from 'mongoose'

const AgencySchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String },
  address: { type: String },
  contactPerson: { type: String, required: true },
  commissionRate: { type: Number, default: 15, min: 0, max: 100 },
  status: { type: String, enum: ['active', 'inactive'], default: 'active' },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  username: { type: String }
}, {
  timestamps: true
})

export default mongoose.models?.Agency || mongoose.model('Agency', AgencySchema)