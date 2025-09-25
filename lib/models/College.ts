import mongoose from 'mongoose'

const CollegeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  location: { type: String, required: true },
  type: { type: String, required: true },
  ranking: { type: Number, required: true },
  description: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  facilities: [{ type: String }],
  status: { type: String, enum: ['active', 'inactive'], default: 'active' },
  establishedYear: { type: Number, required: true }
}, {
  timestamps: true
})

export default mongoose.models?.College || mongoose.model('College', CollegeSchema)