import mongoose from 'mongoose'

const CourseSchema = new mongoose.Schema({
  name: { type: String, required: true },
  level: { type: String, required: true },
  duration: { type: String, required: true },
  fee: { type: Number, required: true },
  currency: { type: String, required: true },
  requirements: { type: String, required: true },
  sessions: [{ type: String }],
  courseType: { type: String },
  streams: [{ type: String }],
  status: { type: String, enum: ['active', 'inactive'], default: 'active' },
  collegeId: { type: mongoose.Schema.Types.ObjectId, ref: 'College', required: true }
}, {
  timestamps: true
})

export default mongoose.models?.Course || mongoose.model('Course', CourseSchema)