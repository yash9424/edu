const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')

async function createAdmin() {
  try {
    await mongoose.connect('mongodb://localhost:27017/edu-management')
    
    const User = mongoose.model('User', new mongoose.Schema({
      username: { type: String, required: true, unique: true },
      email: { type: String, required: true, unique: true },
      password: { type: String, required: true },
      name: { type: String, required: true },
      role: { type: String, enum: ['Admin', 'Agency'], required: true },
      status: { type: String, enum: ['active', 'inactive'], default: 'active' }
    }, { timestamps: true }))
    
    const hashedPassword = await bcrypt.hash('admin123', 10)
    
    const admin = new User({
      username: 'admin',
      email: 'admin@grindx.io',
      password: hashedPassword,
      name: 'Administrator',
      role: 'Admin',
      status: 'active'
    })
    
    await admin.save()
    console.log('Admin user created successfully!')
    console.log('Email: admin@grindx.io')
    console.log('Password: admin123')
    
  } catch (error) {
    if (error.code === 11000) {
      console.log('Admin user already exists!')
      console.log('Email: admin@grindx.io')
      console.log('Password: admin123')
    } else {
      console.error('Error:', error)
    }
  } finally {
    await mongoose.disconnect()
  }
}

createAdmin()