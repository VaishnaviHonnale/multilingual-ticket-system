export interface TicketClassification {
  category: "technical" | "billing" | "general" | "feature" | "bug" | "support" | "other"
  priority: "low" | "medium" | "high" | "urgent" | "critical"
  sentiment: "positive" | "neutral" | "negative"
  urgency_score: number // 1-10 scale
  suggested_tags: string[]
  confidence: number // 0-1 scale
  reasoning: string
  language_detected?: string
  suggestedAgent?: string
}

export interface TicketContent {
  title: string
  description: string
  language?: string
}

// Multilingual keywords for classification
const MULTILINGUAL_KEYWORDS = {
  urgent: {
    en: ['urgent', 'critical', 'emergency', 'asap', 'immediately', 'crisis'],
    hi: ['अत्यावश्यक', 'तत्काल', 'आपातकालीन', 'जरूरी', 'संकट'],
    ta: ['அவசர', 'முக்கியமான', 'அவசரகால', 'உடனடி'],
    te: ['అత్యవసర', 'క్లిష్టమైన', 'అత్యవసరం', 'వెంటనే'],
    kn: ['ಅತ್ಯವಸರ', 'ಬಿಕ್ಕಟ್ಟು', 'ತುರ್ತು', 'ಕೂಡಲೇ']
  },
  technical: {
    en: ['bug', 'error', 'broken', 'not working', 'crash', 'issue', 'problem', 'api', 'integration'],
    hi: ['बग', 'त्रुटि', 'टूटा', 'काम नहीं कर रहा', 'क्रैश', 'समस्या', 'एपीआई'],
    ta: ['பிழை', 'தவறு', 'உடைந்த', 'வேலை செய்யவில்லை', 'சிக்கல்'],
    te: ['బగ్', 'లోపం', 'పనిచేయడంలేదు', 'సమస్య', 'క్రాష్'],
    kn: ['ದೋಷ', 'ತಪ್ಪು', 'ಕೆಲಸ ಮಾಡುತ್ತಿಲ್ಲ', 'ಸಮಸ್ಯೆ']
  },
  billing: {
    en: ['payment', 'invoice', 'billing', 'charge', 'refund', 'subscription', 'price'],
    hi: ['भुगतान', 'बिल', 'चालान', 'शुल्क', 'रिफंड', 'सदस्यता', 'कीमत'],
    ta: ['பணம்', 'பில்', 'கட்டணம்', 'திருப்பி', 'சந்தா', 'விலை'],
    te: ['చెల్లింపు', 'బిల్లు', 'ఛార్జ్', 'రిఫండ్', 'చందా', 'ధర'],
    kn: ['ಪಾವತಿ', 'ಬಿಲ್', 'ಶುಲ್ಕ', 'ಮರುಪಾವತಿ', 'ಚಂದಾ', 'ಬೆಲೆ']
  }
}

const GROQ_API_KEY = process.env.GROQ_API_KEY || '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'

export async function classifyTicket(content: TicketContent): Promise<TicketClassification> {
  try {
    console.log('Starting ticket classification...')
    
    if (!GROQ_API_KEY || GROQ_API_KEY.includes('your_groq_api_key')) {
      console.warn('Groq API key not configured, using fallback classification')
      return keywordBasedClassification(content)
    }

    const prompt = `You are a multilingual AI assistant that classifies customer support tickets. Analyze the following ticket content and provide a structured JSON response.

Ticket Title: "${content.title}"
Ticket Description: "${content.description}"
Specified Language: ${content.language || "en"}

Provide classification in this exact JSON format:
{
  "category": "technical",
  "priority": "medium",
  "sentiment": "neutral",
  "urgency_score": 5,
  "suggested_tags": ["support"],
  "confidence": 0.8,
  "reasoning": "Brief explanation",
  "language_detected": "en"
}

Categories: technical, billing, general, feature, bug, support, other
Priorities: low, medium, high, urgent, critical
Sentiments: positive, neutral, negative

Respond ONLY with valid JSON.`

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.1-8b-instant',
        messages: [
          {
            role: 'system',
            content: 'You are a multilingual support ticket classifier. Always respond with valid JSON only.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3,
        max_completion_tokens: 500,
        top_p: 1,
        stream: false
      })
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Groq API error:', response.status, errorText)
      throw new Error(`Groq API error: ${response.status}`)
    }

    const data = await response.json()
    const responseContent = data.choices?.[0]?.message?.content

    if (!responseContent) {
      throw new Error('No response content from Groq API')
    }

    console.log('Groq API response:', responseContent)

    try {
      // Clean the response to ensure it's valid JSON
      const cleanedResponse = responseContent.trim()
      const classification = JSON.parse(cleanedResponse) as TicketClassification

      // Validate required fields and set defaults if missing
      const validatedClassification: TicketClassification = {
        category: classification.category || 'general',
        priority: classification.priority || 'medium',
        sentiment: classification.sentiment || 'neutral',
        urgency_score: classification.urgency_score || 5,
        suggested_tags: classification.suggested_tags || ['needs-review'],
        confidence: classification.confidence || 0.7,
        reasoning: classification.reasoning || 'AI classification completed',
        language_detected: classification.language_detected || content.language || 'en'
      }

      console.log('Classification successful:', validatedClassification)
      return validatedClassification

    } catch (parseError) {
      console.error('Error parsing Groq response:', parseError)
      console.error('Raw response:', responseContent)
      return keywordBasedClassification(content)
    }

  } catch (error) {
    console.error('Error in Groq classification:', error)
    return keywordBasedClassification(content)
  }
}

// Fallback keyword-based classification for multilingual support
function keywordBasedClassification(content: TicketContent): TicketClassification {
  const text = `${content.title} ${content.description}`.toLowerCase()
  const lang = content.language || 'en'
  
  // Determine category
  let category: TicketClassification['category'] = 'general'
  let priority: TicketClassification['priority'] = 'medium'
  let urgency_score = 5
  let tags: string[] = []
  
  // Check for technical issues
  const technicalKeywords = MULTILINGUAL_KEYWORDS.technical[lang as keyof typeof MULTILINGUAL_KEYWORDS.technical] || MULTILINGUAL_KEYWORDS.technical.en
  if (technicalKeywords.some(keyword => text.includes(keyword))) {
    category = 'bug'
    tags.push('technical-issue')
  }
  
  // Check for billing issues
  const billingKeywords = MULTILINGUAL_KEYWORDS.billing[lang as keyof typeof MULTILINGUAL_KEYWORDS.billing] || MULTILINGUAL_KEYWORDS.billing.en
  if (billingKeywords.some(keyword => text.includes(keyword))) {
    category = 'billing'
    tags.push('payment-related')
  }
  
  // Check for urgency
  const urgentKeywords = MULTILINGUAL_KEYWORDS.urgent[lang as keyof typeof MULTILINGUAL_KEYWORDS.urgent] || MULTILINGUAL_KEYWORDS.urgent.en
  if (urgentKeywords.some(keyword => text.includes(keyword))) {
    priority = 'urgent'
    urgency_score = 8
    tags.push('urgent')
  }
  
  // Detect sentiment
  const negativeWords = ['not working', 'broken', 'error', 'failed', 'problem', 'issue', 'bad']
  const positiveWords = ['thank', 'good', 'great', 'excellent', 'love', 'appreciate']
  
  let sentiment: TicketClassification['sentiment'] = 'neutral'
  if (negativeWords.some(word => text.includes(word))) {
    sentiment = 'negative'
  } else if (positiveWords.some(word => text.includes(word))) {
    sentiment = 'positive'
  }
  
  return {
    category,
    priority,
    sentiment,
    urgency_score,
    suggested_tags: tags.length > 0 ? tags : ['needs-review'],
    confidence: 0.6, // Lower confidence for keyword-based
    reasoning: 'Classification based on keyword analysis',
    language_detected: lang
  }
}

export async function suggestResponse(content: TicketContent, classification: TicketClassification): Promise<string> {
  try {
    if (!GROQ_API_KEY || GROQ_API_KEY.includes('your_groq_api_key')) {
      console.warn('Groq API key not configured, using default response')
      return getDefaultResponse(content.language || 'en', classification.priority)
    }

    const lang = classification.language_detected || content.language || 'en'
    
    const prompt = `You are a helpful multilingual customer support assistant. Based on the ticket, suggest a professional response.

Ticket Title: "${content.title}"
Ticket Description: "${content.description}"
Category: ${classification.category}
Priority: ${classification.priority}
Sentiment: ${classification.sentiment}
Language: ${lang}

Generate a helpful, empathetic response in ${lang === 'en' ? 'English' : lang === 'hi' ? 'Hindi' : lang === 'ta' ? 'Tamil' : lang === 'te' ? 'Telugu' : lang === 'kn' ? 'Kannada' : 'English'}.
The response should:
1. Acknowledge the issue
2. Express empathy if needed
3. Provide next steps or solution
4. Be professional and concise

Response:`

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.1-8b-instant',
        messages: [
          {
            role: 'system',
            content: 'You are a multilingual customer support assistant. Provide helpful, empathetic responses.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_completion_tokens: 300,
        top_p: 1,
        stream: false
      })
    })

    if (!response.ok) {
      throw new Error(`Groq API error: ${response.status}`)
    }

    const data = await response.json()
    return data.choices?.[0]?.message?.content || getDefaultResponse(lang, classification.priority)
  } catch (error) {
    console.error('Error generating response suggestion:', error)
    return getDefaultResponse(content.language || 'en', classification.priority)
  }
}

function getDefaultResponse(lang: string, priority: string): string {
  const responses = {
    en: {
      urgent: "Thank you for contacting us about this urgent matter. We understand the importance of this issue and our team is prioritizing your request. We will get back to you within 2 hours.",
      default: "Thank you for contacting us. We have received your request and will review it shortly. Our team will get back to you within 24 hours."
    },
    hi: {
      urgent: "इस अत्यावश्यक मामले के बारे में हमसे संपर्क करने के लिए धन्यवाद। हम इस मुद्दे के महत्व को समझते हैं और हमारी टीम आपके अनुरोध को प्राथमिकता दे रही है।",
      default: "हमसे संपर्क करने के लिए धन्यवाद। हमें आपका अनुरोध प्राप्त हो गया है और हम इसकी जल्द ही समीक्षा करेंगे।"
    },
    ta: {
      urgent: "இந்த அவசர விஷயத்தைப் பற்றி எங்களைத் தொடர்பு கொண்டதற்கு நன்றி. உங்கள் கோரிக்கைக்கு முன்னுரிமை அளிக்கிறோம்.",
      default: "எங்களைத் தொடர்பு கொண்டதற்கு நன்றி. உங்கள் கோரிக்கை பெறப்பட்டது, விரைவில் பரிசீலிக்கப்படும்."
    },
    te: {
      urgent: "ఈ అత్యవసర విషయం గురించి మమ్మల్ని సంప్రదించినందుకు ధన్యవాదాలు. మీ అభ్యర్థనకు ప్రాధాన్యత ఇస్తున్నాము.",
      default: "మమ్మల్ని సంప్రదించినందుకు ధన్యవాదాలు. మీ అభ్యర్థన అందింది, త్వరలో పరిశీలించబడుతుంది."
    },
    kn: {
      urgent: "ಈ ತುರ್ತು ವಿಷಯದ ಬಗ್ಗೆ ನಮ್ಮನ್ನು ಸಂಪರ್ಕಿಸಿದ್ದಕ್ಕಾಗಿ ಧನ್ಯವಾದಗಳು. ನಿಮ್ಮ ವಿನಂತಿಗೆ ಆದ್ಯತೆ ನೀಡುತ್ತಿದ್ದೇವೆ.",
      default: "ನಮ್ಮನ್ನು ಸಂಪರ್ಕಿಸಿದ್ದಕ್ಕಾಗಿ ಧನ್ಯವಾದಗಳು. ನಿಮ್ಮ ವಿನಂತಿಯನ್ನು ಸ್ವೀಕರಿಸಲಾಗಿದೆ ಮತ್ತು ಶೀಘ್ರದಲ್ಲೇ ಪರಿಶೀಲಿಸಲಾಗುವುದು."
    }
  }
  
  const langResponses = responses[lang as keyof typeof responses] || responses.en
  return (priority === 'urgent' || priority === 'critical') ? langResponses.urgent : langResponses.default
}
