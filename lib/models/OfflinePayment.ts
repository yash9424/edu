import mongoose from 'mongoose'

const offlinePaymentSchema = new mongoose.Schema({
  agencyId: {
    type: String,
    required: true
  },
  beneficiary: {
    type: String,
    required: true
  },
  paymentType: {
    type: String,
    required: true,
    enum: ['upi', 'bank-transfer']
  },
  accountHolderName: {
    type: String,
    required: true
  },
  transactionId: {
    type: String,
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  txnDate: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  receiptFile: {
    type: String
  }
}, {
  timestamps: true
})

export const OfflinePayment = mongoose.models.OfflinePayment || mongoose.model('OfflinePayment', offlinePaymentSchema)