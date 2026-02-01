'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { postToBackend } from '@/lib/api'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useLanguage } from '@/contexts/language-context'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

const translations = {
  en: {
    greeting: "Hi! I'm your GovConnect assistant. I can help you with government schemes, forms, and complaints. How can I assist you today?",
    chatCleared: "Chat cleared. How can I help you today?",
    demoResponse: "I understand you need help with that. This is a demo response. In production, I would connect to the AI backend to provide personalized guidance based on your query.",
    quickPrompts: [
      'Check scheme eligibility',
      'Help with form filling',
      'Draft a complaint',
      'Find schemes for farmers',
    ],
    title: 'AI Assistant',
    subtitle: 'Always here to help',
    clearButton: 'Clear',
    placeholder: 'Type your message...',
  },
  hi: {
    greeting: "नमस्ते! मैं आपका GovConnect सहायक हूं। मैं आपको सरकारी योजनाओं, फॉर्मों और शिकायतों में मदद कर सकता हूं। आज मैं आपकी कैसे सहायता कर सकता हूं?",
    chatCleared: "चैट साफ़ हो गई। आज मैं आपकी कैसे मदद कर सकता हूं?",
    demoResponse: "मैं समझता हूं कि आपको इसमें मदद की जरूरत है। यह एक डेमो प्रतिक्रिया है। उत्पादन में, मैं आपके प्रश्न के आधार पर व्यक्तिगत मार्गदर्शन प्रदान करने के लिए AI बैकएंड से कनेक्ट करूंगा।",
    quickPrompts: [
      'योजना पात्रता जांचें',
      'फॉर्म भरने में मदद',
      'शिकायत लिखें',
      'किसानों के लिए योजनाएं खोजें',
    ],
    title: 'AI सहायक',
    subtitle: 'हमेशा मदद के लिए यहां',
    clearButton: 'साफ़ करें',
    placeholder: 'अपना संदेश लिखें...',
  },
  te: {
    greeting: "హాయ! నేను మీ GovConnect సహాయకుడిని. నేను మీకు ప్రభుత్వ పథకాలు, ఫారమ్‌లు మరియు ఫిర్యాదులలో సహాయం చేయగలను. ఈరోజు నేను మీకు ఎలా సహాయం చేయగలను?",
    chatCleared: "చాట్ క్లియర్ చేయబడింది. ఈరోజు నేను మీకు ఎలా సహాయం చేయగలను?",
    demoResponse: "మీకు దీనిలో సహాయం కావాలని నేను అర్థం చేసుకున్నాను. ఇది డెమో ప్రతిస్పందన. ఉత్పత్తిలో, మీ ప్రశ్న ఆధారంగా వ్యక్తిగత మార్గదర్శకత్వం అందించడానికి నేను AI బ్యాకెండ్‌కు కనెక్ట్ అవుతాను.",
    quickPrompts: [
      'పథకం అర్హత తనిఖీ చేయండి',
      'ఫారమ్ పూరించడంలో సహాయం',
      'ఫిర్యాదు రాయండి',
      'రైతుల కోసం పథకాలు కనుగొనండి',
    ],
    title: 'AI సహాయకుడు',
    subtitle: 'ఎల్లప్పుడూ సహాయానికి ఇక్కడ',
    clearButton: 'క్లియర్ చేయండి',
    placeholder: 'మీ సందేశం టైప్ చేయండి...',
  },
}

export function AIAssistant() {
  const { language } = useLanguage()
  const t = translations[language]

  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: t.greeting,
      timestamp: new Date(),
    },
  ])
  const [inputValue, setInputValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSend = async () => {
    if (!inputValue.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputValue,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInputValue('')
    setIsLoading(true)

    try {
      // Call Backend Intent API directly
      const intentData = await postToBackend<{ intent: string, entities: any[], confidence: number }>('/api/intent', { text: inputValue })

      // Client-side response mapping (moved from API route)
      const intentMessages: Record<string, string> = {
        scheme: "I can help you find government schemes! Based on your message, you seem to be looking for government schemes. Go to the Schemes page to explore options that match your profile.",
        form: "I can help you understand forms! It seems you need assistance with a government form. Visit the Forms page to get guidance on filling out official documents.",
        complaint: "I can help you file a complaint! It looks like you want to raise a grievance. Go to the Complaints page to generate a formally worded complaint.",
        process: "I can track processes for you! You seem to be asking about a government process. Visit the Process Tracker to see step-by-step procedures.",
        service_locator: "I can help you find services! It looks like you're looking for government offices nearby. Visit the Service Locator to find offices in your area.",
        life_event: "I can guide you through life events! It seems you're going through a major life change. Visit the Life Events page for a complete checklist.",
      }

      const responseMessage = intentMessages[intentData.intent] ||
        `I understand you're asking about: "${inputValue}". I'm here to help with government schemes, forms, complaints, and services. Try asking about a specific topic!`

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: responseMessage,
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, assistantMessage])
    } catch (error) {
      console.error('Chat error:', error)
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: t.demoResponse,
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, assistantMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleClearChat = () => {
    setMessages([
      {
        id: '1',
        role: 'assistant',
        content: t.chatCleared,
        timestamp: new Date(),
      },
    ])
  }

  // Update greeting when language changes
  useEffect(() => {
    if (messages.length === 1 && messages[0].role === 'assistant') {
      setMessages([{
        id: '1',
        role: 'assistant',
        content: t.greeting,
        timestamp: new Date(),
      }])
    }
  }, [language])

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-[2001] flex h-[52px] w-[52px] items-center justify-center rounded-full bg-[#0D9488] text-white shadow-lg transition-all hover:scale-110 hover:shadow-xl"
        aria-label="Open AI Assistant"
      >
        {isOpen ? (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            className="h-6 w-6"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            className="h-6 w-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.37.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z"
            />
          </svg>
        )}
      </button>

      {/* Chat Panel */}
      {isOpen && (
        <Card className="fixed bottom-24 right-4 md:right-6 z-[2001] flex h-[500px] max-h-[70vh] w-[90vw] max-w-[400px] flex-col shadow-2xl transition-all duration-200 ease-in-out">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-border bg-gradient-to-r from-[#1E3A8A] to-[#0D9488] p-4 rounded-t-lg shrink-0">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                  className="h-5 w-5 text-white"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 22l-.394-1.433a2.25 2.25 0 00-1.423-1.423L13.25 19l1.433-.394a2.25 2.25 0 001.423-1.423L16.5 16l.394 1.433a2.25 2.25 0 001.423 1.423L19.75 19l-1.433.394a2.25 2.25 0 00-1.423 1.423z"
                  />
                </svg>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white">{t.title}</h3>
                <p className="text-xs text-white/80">{t.subtitle}</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearChat}
              className="h-8 text-white hover:bg-white/20 hover:text-white"
            >
              {t.clearButton}
            </Button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4" >
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-lg p-3 ${message.role === 'user'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-foreground'
                    }`}
                >
                  <p className="text-sm leading-relaxed">{message.content}</p>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="max-w-[85%] rounded-lg bg-muted p-3">
                  <div className="flex gap-1">
                    <div className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground [animation-delay:-0.3s]" />
                    <div className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground [animation-delay:-0.15s]" />
                    <div className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground" />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="flex items-center gap-2 border-t border-border p-4 shrink-0 bg-card z-10">
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder={t.placeholder}
              className="flex-1"
            />
            <Button
              onClick={handleSend}
              disabled={!inputValue.trim() || isLoading}
              size="icon"
              className="h-10 w-10 shrink-0"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className="h-5 w-5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5"
                />
              </svg>
            </Button>
          </div>
        </Card>
      )}
    </>
  )
}
