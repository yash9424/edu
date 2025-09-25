const mongoose = require('mongoose')

const MONGODB_URI = 'mongodb://localhost:27017/edu-management'

async function fixData() {
  try {
    await mongoose.connect(MONGODB_URI)
    console.log('Connected to MongoDB')

    // Find testuser
    const user = await mongoose.connection.db.collection('users').findOne({username: 'testuser'})
    console.log('Found user:', user?.username, 'agencyId:', user?.agencyId)

    if (user && user.agencyId) {
      // Update the agency with proper data
      const updateResult = await mongoose.connection.db.collection('agencies').updateOne(
        { _id: user.agencyId },
        {
          $set: {
            name: 'Test Agency FIXED',
            phone: '7777777777',
            address: 'Test Address FIXED 789',
            commissionRate: 35.5,
            status: 'active'
          }
        }
      )
      
      console.log('Update result:', updateResult)
      
      // Verify the update
      const updatedAgency = await mongoose.connection.db.collection('agencies').findOne({ _id: user.agencyId })
      console.log('Updated agency:', updatedAgency)
    }

    console.log('Data fixed successfully!')
    
  } catch (error) {
    console.error('Error:', error)
  } finally {
    await mongoose.disconnect()
  }
}

fixData()