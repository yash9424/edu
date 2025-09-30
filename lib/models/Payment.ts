import mongoose from 'mongoose'

const PaymentSchema = new mongoose.Schema({
  applicationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Application' },
  studentName: { type: String },
  email: { type: String },
  phone: { type: String },
  agencyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Agency' },
  agencyName: { type: String },
  collegeId: { type: mongoose.Schema.Types.ObjectId, ref: 'College' },
  collegeName: { type: String },
  courseName: { type: String },
  
  // Payment details
  applicationFee: { type: Number, default: 0 },
  tuitionFee: { type: Number, default: 0 },
  paymentAmount: { type: Number, default: 0 },
  paymentDate: { type: Date },
  paymentMethod: { type: String },
  transactionId: { type: String },
  paymentLink: { type: String }, // Individual payment link for this specific payment
  paymentReceipt: {
    filename: String,
    size: Number,
    mimeType: String,
    data: String,
    uploadedAt: Date,
    uploadedBy: String
  },
  
  // Status tracking
  paymentStatus: { 
    type: String, 
    enum: ['pending', 'pending_approval', 'paid', 'verified', 'approved', 'rejected', 'failed'], 
    default: 'pending' 
  },
  leadStatus: { 
    type: String, 
    enum: ['new', 'contacted', 'interested', 'applied', 'enrolled', 'dropped'], 
    default: 'new' 
  },
  
  // Document tracking
  documents: {
    passport: {
      status: { type: String, enum: ['uploaded', 'pending', 'missing', 'approved', 'rejected'], default: 'missing' },
      uploadedAt: { type: Date },
      adminRequested: { type: Boolean, default: false },
      url: { type: String }
    },
    transcript: {
      status: { type: String, enum: ['uploaded', 'pending', 'missing', 'approved', 'rejected'], default: 'missing' },
      uploadedAt: { type: Date },
      adminRequested: { type: Boolean, default: false },
      url: { type: String }
    },
    sop: {
      status: { type: String, enum: ['uploaded', 'pending', 'missing', 'approved', 'rejected'], default: 'missing' },
      uploadedAt: { type: Date },
      adminRequested: { type: Boolean, default: false },
      url: { type: String }
    },
    ielts: {
      status: { type: String, enum: ['uploaded', 'pending', 'missing', 'approved', 'rejected'], default: 'missing' },
      uploadedAt: { type: Date },
      adminRequested: { type: Boolean, default: false },
      url: { type: String }
    }
  },
  
  // Commission tracking
  commissionAmount: { type: Number, default: 0 },
  commissionRate: { type: Number, default: 0 },
  commissionPaid: { type: Boolean, default: false },
  
  // Admin tracking
  adminVerifying: { type: Boolean, default: false },
  adminNotes: { type: String, default: '' },
  verifiedAt: { type: Date },
  verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  adminApproved: { type: Boolean, default: false },
  
  // Agency tracking
  agencyApproved: { type: Boolean, default: false },
  agencyNotes: { type: String, default: '' },
  
  // Contact tracking
  lastContact: { type: Date, default: Date.now },
  notes: { type: String, default: '' }
}, {
  timestamps: true
})

// Indexes for better query performance
PaymentSchema.index({ applicationId: 1 })
PaymentSchema.index({ agencyId: 1 })
PaymentSchema.index({ paymentStatus: 1 })
PaymentSchema.index({ leadStatus: 1 })
PaymentSchema.index({ createdAt: -1 })

export default mongoose.models?.Payment || mongoose.model('Payment', PaymentSchema)