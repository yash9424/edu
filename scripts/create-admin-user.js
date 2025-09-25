const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/edu-management'

// User schema
const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['Admin', 'Agency'], required: true },
  status: { type: String, enum: ['active', 'inactive'], default: 'active' },
  agencyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Agency' },
  agencyName: { type: String },
  lastLogin: { type: Date }
}, {
  timestamps: true
})

const User = mongoose.models?.User || mongoose.model('User', UserSchema)

async function createAdminUser() {
  try {
    await mongoose.connect(MONGODB_URI)
    console.log('Connected to MongoDB')

    // Check if admin user exists
    const existingAdmin = await User.findOne({ email: 'admin@grindx.io' })
    
    if (existingAdmin) {
      console.log('Admin user already exists')
      
      // Update password to ensure it's correct
      const hashedPassword = await bcrypt.hash('admin123', 10)
      await User.findByIdAndUpdate(existingAdmin._id, { 
        password: hashedPassword,
        status: 'active'
      })
      console.log('Admin password updated')
    } else {
      // Create admin user
      const hashedPassword = await bcrypt.hash('admin123', 10)
      
      const adminUser = new User({
        name: 'Admin User',
        email: 'admin@grindx.io',
        password: hashedPassword,
        role: 'Admin',
        status: 'active'
      })

      await adminUser.save()
      console.log('Admin user created successfully')
    }

    // Check if agency user exists
    const existingAgency = await User.findOne({ email: 'agency@grindx.io' })
    
    if (existingAgency) {
      console.log('Agency user already exists')
      
      // Update password to ensure it's correct
      const hashedPassword = await bcrypt.hash('agency123', 10)
      await User.findByIdAndUpdate(existingAgency._id, { 
        password: hashedPassword,
        status: 'active'
      })
      console.log('Agency password updated')
    } else {
      // Create agency user
      const hashedPassword = await bcrypt.hash('agency123', 10)
      
      const agencyUser = new User({
        name: 'Test Agency',
        email: 'agency@grindx.io',
        password: hashedPassword,
        role: 'Agency',
        status: 'active',
        agencyName: 'Test Agency'
      })

      await agencyUser.save()
      console.log('Agency user created successfully')
    }

    console.log('Setup completed successfully')
    process.exit(0)
  } catch (error) {
    console.error('Error:', error)
    process.exit(1)
  }
}

createAdminUser()