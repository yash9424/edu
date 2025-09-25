const mongoose = require('mongoose')

async function checkAgencyUsers() {
  try {
    await mongoose.connect('mongodb://localhost:27017/edu-management')
    
    const User = mongoose.model('User', new mongoose.Schema({
      username: String,
      email: String,
      role: String,
      status: String
    }))
    
    const agencyUsers = await User.find({ role: 'Agency' })
    console.log('Agency users found:')
    agencyUsers.forEach(user => {
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

checkAgencyUsers()