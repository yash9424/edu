import mongoose from 'mongoose'

const ApplicationSchema = new mongoose.Schema({
  studentName: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  agencyId: { type: String, required: true },
  agencyName: { type: String, required: true },
  collegeId: { type: String, required: true },
  collegeName: { type: String, required: true },
  courseId: { type: String, required: true },
  courseName: { type: String, required: true },
  courseType: String,
  stream: String,
  status: { type: String, enum: ['pending', 'approved', 'rejected', 'processing'], default: 'pending' },
  fees: { type: Number, required: true },
  documents: [String],
  pendingDocuments: [String],
  abcId: String,
  debId: String,
  applicationId: { type: String, unique: true, index: true },
  academicRecords: [{
    level: String,
    board: String,
    year: String,
    obtainedMarks: String,
    percentage: String,
    marksheetUrl: String
  }],
  studentDetails: {
    dateOfBirth: String,
    nationality: String,
    address: String,
    personalStatement: String,
    workExperience: String,
    previousEducation: String,
    gpa: String,
    englishProficiency: String,
    fatherName: String,
    motherName: String,
    religion: String,
    caste: String,
    maritalStatus: String
  },
  pdfGenerated: { type: Boolean, default: false },
  lastUpdated: { type: Date, default: Date.now }
}, {
  timestamps: true
})

export default mongoose.models?.Application || mongoose.model('Application', ApplicationSchema)