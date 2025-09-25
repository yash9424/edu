const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/edu-management'

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  name: { type: String, required: true },
  role: { type: String, enum: ['Admin', 'Agency'], required: true },
  agencyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Agency' },
  status: { type: String, enum: ['active', 'inactive'], default: 'active' }
}, { timestamps: true })

const AgencySchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true },
  address: { type: String, required: true },
  contactPerson: { type: String, required: true },
  commissionRate: { type: Number, required: true, min: 0, max: 100 },
  status: { type: String, enum: ['active', 'inactive'], default: 'active' },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true })

const User = mongoose.model('User', UserSchema)
const Agency = mongoose.model('Agency', AgencySchema)

async function addTestData() {
  try {
    await mongoose.connect(MONGODB_URI)
    console.log('Connected to MongoDB')

    // Create test agency
    const agency = new Agency({
      name: 'Test Agency Ltd',
      email: 'testuser@example.com',
      phone: '9876543210',
      address: '123 Test Street, Test City, State 12345',
      contactPerson: 'testuser',
      commissionRate: 20.5,
      status: 'active'
    })
    const savedAgency = await agency.save()
    console.log('Created test agency:', savedAgency.name)

    // Create test user
    const hashedPassword = await bcrypt.hash('test123', 10)
    const user = new User({
      username: 'testuser',
      email: 'testuser@example.com',
      password: hashedPassword,
      name: 'testuser',
      role: 'Agency',
      agencyId: savedAgency._id,
      status: 'active'
    })
    const savedUser = await user.save()
    console.log('Created test user:', savedUser.username)

    // Link agency to user
    await Agency.findByIdAndUpdate(savedAgency._id, { userId: savedUser._id })
    console.log('Linked agency to user')

    console.log('Test data added successfully!')
    
  } catch (error) {
    console.error('Error adding test data:', error)
  } finally {
    await mongoose.disconnect()
  }
}

addTestData()