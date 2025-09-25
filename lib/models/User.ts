import mongoose from 'mongoose'

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  name: { type: String, required: true },
  role: { type: String, enum: ['Admin', 'Agency'], required: true },
  agencyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Agency' },
  agencyName: { type: String },
  status: { type: String, enum: ['active', 'inactive'], default: 'active' },
  lastLogin: { type: Date }
}, {
  timestamps: true
})

export default mongoose.models?.User || mongoose.model('User', UserSchema)