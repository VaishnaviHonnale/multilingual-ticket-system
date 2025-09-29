// Test ticket creation after database fix
const testTicketCreation = async () => {
  console.log('🧪 Testing Ticket Creation...')
  console.log('==============================')
  
  try {
    const response = await fetch('http://localhost:3000/api/tickets', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title: 'Test Ticket Creation',
        description: 'Testing if ticket creation works after database fix',
        priority: 'medium',
        category: 'technical',
        language: 'en'
      })
    })
    
    if (response.ok) {
      const ticket = await response.json()
      console.log('✅ SUCCESS: Ticket created successfully!')
      console.log('📋 Ticket Details:')
      console.log('   ID:', ticket.id)
      console.log('   Title:', ticket.title)
      console.log('   Priority:', ticket.priority)
      console.log('   Category:', ticket.category)
      console.log('   Status:', ticket.status)
      console.log('')
      console.log('🎉 Database fix successful! Tickets are now working.')
    } else {
      const error = await response.json()
      console.log('❌ FAILED: Ticket creation failed')
      console.log('   Status:', response.status)
      console.log('   Error:', error.error)
      console.log('')
      console.log('💡 Next steps:')
      console.log('   1. Run QUICK_DATABASE_FIX.sql in Supabase SQL Editor')
      console.log('   2. Ensure SUPABASE_SERVICE_ROLE_KEY is set in .env.local')
      console.log('   3. Restart the development server')
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message)
    console.log('\n💡 Make sure:')
    console.log('   1. Development server is running (npm run dev)')
    console.log('   2. Database fix has been applied')
    console.log('   3. Environment variables are set correctly')
  }
}

// Run the test
testTicketCreation()