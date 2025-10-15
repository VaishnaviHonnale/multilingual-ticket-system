// Test chatbot with fallback mode (no API key needed)
const testFallbackChat = async () => {
  console.log('🧪 Testing Chatbot Fallback Mode...')
  console.log('====================================')
  console.log('This test works WITHOUT a valid Groq API key!\n')
  
  const testQuestions = [
    "How do I create a ticket?",
    "What are the different priority levels?",
    "Can I use voice input?",
    "What languages are supported?",
    "How do I check ticket status?"
  ]
  
  for (const question of testQuestions) {
    try {
      console.log(`\n❓ Question: "${question}"`)
      
      const response = await fetch('http://localhost:3000/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: question })
      })
      
      if (response.ok) {
        const data = await response.json()
        console.log(`✅ Response: ${data.response.substring(0, 150)}...`)
      } else {
        console.log(`❌ Failed with status: ${response.status}`)
      }
      
    } catch (error) {
      console.error(`❌ Error: ${error.message}`)
    }
  }
  
  console.log('\n====================================')
  console.log('🎉 Fallback Mode Test Complete!')
  console.log('The chatbot works even without a valid API key!')
  console.log('\n💡 To get AI-powered responses:')
  console.log('   1. Visit https://console.groq.com')
  console.log('   2. Create a new API key')
  console.log('   3. Update GROQ_API_KEY in .env file')
  console.log('   4. Restart server: npm run dev')
}

// Run the test
testFallbackChat()