const mongoose = require('mongoose')

async function checkAdmin() {
  try {
    await mongoose.connect('mongodb://localhost:27017/edu-management')
    
    const User = mongoose.model('User', new mongoose.Schema({
      username: String,
      email: String,
      password: String,
      role: String,
      status: String
    }))
    
    const adminUsers = await User.find({ role: 'Admin' })
    console.log('Admin users found:')
    adminUsers.forEach(user => {
      console.log(`Email: ${user.email}`)
      console.log(`Username: ${user.username}`)
      console.log(`Status: ${user.status}`)
      console.log('---')
    })
    
  } catch (error) {
    console.error('Error:', error)
  } finally {
    await mongoose.disconnect()
  }
}

checkAdmin()