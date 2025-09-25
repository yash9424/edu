// Debug script to check admin applications API response
// Using built-in fetch (Node.js 18+)

async function debugAdminAPI() {
  try {
    console.log('Testing admin applications API...')
    
    const response = await fetch('http://localhost:3000/api/admin/applications', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    })
    
    console.log('Response status:', response.status)
    
    if (response.ok) {
      const data = await response.json()
      console.log('Number of applications:', data.length)
      
      if (data.length > 0) {
        console.log('\nFirst application structure:')
        console.log(JSON.stringify(data[0], null, 2))
        
        console.log('\nDocument-related fields in first application:')
        console.log('documents:', data[0].documents)
        console.log('documentCount:', data[0].documentCount)
        console.log('uploadedDocuments:', data[0].uploadedDocuments)
      }
    } else {
      const errorText = await response.text()
      console.log('Error response:', errorText)
    }
  } catch (error) {
    console.error('Error:', error.message)
  }
}

debugAdminAPI()