const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')

async function resetPassword() {
  try {
    await mongoose.connect('mongodb://localhost:27017/edu-management')
    
    const User = mongoose.model('User', new mongoose.Schema({
      username: String,
      email: String,
      password: String,
      role: String,
      status: String
    }))
    
    const hashedPassword = await bcrypt.hash('agency123', 10)
    
    await User.updateOne(
      { email: 'user@gmail.com' },
      { password: hashedPassword }
    )
    
    console.log('Password reset successfully!')
    console.log('Email: user@gmail.com')
    console.log('Password: agency123')
    
  } catch (error) {
    console.error('Error:', error)
  } finally {
    await mongoose.disconnect()
  }
}

resetPassword()