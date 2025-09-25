import mongoose from 'mongoose'

const DocumentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: { type: String, required: true },
  size: { type: Number, required: true },
  applicationId: { type: String, required: true },
  agencyId: { type: String, required: true },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  filePath: { type: String, required: true },
  fileData: { type: String }, // Base64 encoded file data
  uploadedAt: { type: Date, default: Date.now }
}, {
  timestamps: true
})

// Clear existing model to force schema update
if (mongoose.models?.Document) {
  delete mongoose.models.Document
}

export default mongoose.model('Document', DocumentSchema)