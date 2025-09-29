// Simple test script to verify chat API
const testChatAPI = async () => {
  try {
    console.log('Testing chat API...')
    
    const response = await fetch('http://localhost:3000/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: 'Hello, I need help creating a ticket'
      })
    })
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    const data = await response.json()
    console.log('✅ Chat API Response:', data.response)
    
  } catch (error) {
    console.error('❌ Chat API Error:', error)
  }
}

// Run the test
testChatAPI()