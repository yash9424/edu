import mongoose from 'mongoose'

const ApplicationSchema = new mongoose.Schema({
  studentName: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  agencyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Agency', required: true },
  agencyName: { type: String, required: true },
  collegeId: { type: mongoose.Schema.Types.ObjectId, ref: 'College', required: true },
  collegeName: { type: String, required: true },
  courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  courseName: { type: String, required: true },
  courseType: { type: String },
  stream: { type: String },
  status: { type: String, enum: ['pending', 'approved', 'rejected', 'processing'], default: 'pending' },
  fees: { type: Number, required: true },
  documents: [{ type: String }],
  pendingDocuments: [{ type: String }],
  abcId: { type: String },
  debId: { type: String },
  applicationId: { type: String, unique: true, index: true },
  academicRecords: [{
    level: { type: String },
    board: { type: String },
    year: { type: String },
    obtainedMarks: { type: String },
    percentage: { type: String },
    marksheetUrl: { type: String }
  }],
  studentDetails: {
    dateOfBirth: { type: String },
    nationality: { type: String },
    address: { type: String },
    personalStatement: { type: String },
    workExperience: { type: String },
    previousEducation: { type: String },
    gpa: { type: String },
    englishProficiency: { type: String },
    fatherName: { type: String },
    motherName: { type: String },
    religion: { type: String },
    caste: { type: String, enum: ['General', 'SC', 'ST', 'OBC', 'EWS'] },
    maritalStatus: { type: String, enum: ['Single', 'Married', 'Divorced', 'Widowed'] }
  },
  pdfGenerated: { type: Boolean, default: false },
  lastUpdated: { type: Date, default: Date.now }
}, {
  timestamps: true
})

export default mongoose.models?.Application || mongoose.model('Application', ApplicationSchema)