import mongoose from 'mongoose'

const SettingsSchema = new mongoose.Schema({
  // System Settings
  systemName: { type: String, default: 'Education Management System' },
  adminEmail: { type: String, required: true },
  emailNotifications: { type: Boolean, default: true },
  autoBackup: { type: Boolean, default: true },
  maintenanceMode: { type: Boolean, default: false },
  
  // Escalation Matrix
  escalationMatrix: [{
    id: { type: String },
    name: { type: String, required: true },
    position: { type: String, required: true },
    email: { type: String, required: true },
    mobile: { type: String, required: true },
    level: { type: Number, default: 1 }
  }],
  
  // Banking Details
  bankingDetails: {
    bankName: { type: String },
    accountHolderName: { type: String },
    accountNumber: { type: String },
    ifscCode: { type: String },
    branchName: { type: String },
    routingNumber: { type: String },
    swiftCode: { type: String },
    address: { type: String },
    instructions: { type: String }
  },
  
  // Payment Settings
  paymentSettings: {
    paymentGateway: { type: String, default: 'stripe' },
    universalPaymentLink: { type: String, default: 'https://payments.example.com/pay' },
    publicKey: { type: String },
    secretKey: { type: String },
    webhookSecret: { type: String },
    currency: { type: String, default: 'USD' },
    paymentMethods: [{ type: String }],
    minimumAmount: { type: Number, default: 1 },
    maximumAmount: { type: Number, default: 10000 },
    processingFee: { type: Number, default: 0 },
    enabled: { type: Boolean, default: true }
  }
}, {
  timestamps: true
})

export default mongoose.models?.Settings || mongoose.model('Settings', SettingsSchema)