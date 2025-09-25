const mongoose = require('mongoose')

// Test the user update directly
async function testUserUpdate() {
  try {
    await mongoose.connect('mongodb://localhost:27017/edu-management')
    console.log('Connected to MongoDB')
    
    const User = mongoose.model('User', new mongoose.Schema({
      username: String,
      email: String,
      password: String,
      name: String,
      role: String,
      status: String,
      agencyId: mongoose.Schema.Types.ObjectId
    }))
    
    const userId = '68ce96b40c9988304b237f70'
    const user = await User.findById(userId)
    console.log('Found user:', user)
    
    if (user) {
      const updated = await User.findByIdAndUpdate(userId, {
        username: 'test',
        email: 'test@test.com',
        status: 'active'
      }, { new: true })
      console.log('Updated user:', updated)
    }
    
  } catch (error) {
    console.error('Error:', error)
  } finally {
    await mongoose.disconnect()
  }
}

testUserUpdate()