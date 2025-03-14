'use client'
import { useState, useEffect, useRef } from 'react'
import { useTranslations } from 'next-intl'
import Image from 'next/image'
import { FaVolumeUp, FaHourglassStart, FaExclamationTriangle, FaPlay, FaCheck, FaTrophy } from 'react-icons/fa'
import SharePoster from '@/components/SharePoster'
import { useSearchParams } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Copy } from 'lucide-react'
import { EmbedDialog } from '@/components/EmbedDialog'
import '@fortawesome/fontawesome-free/css/all.min.css';
import staticContent from '../alltoolslist.html'

interface RankingResult {
  reactionTime: number;
  timestamp: number;
}

export default function AudioReactionTime() {
  const t = useTranslations('audioReaction')
  const te = useTranslations('embed')
  
  const searchParams = useSearchParams()
  const isIframe = searchParams.get('embed') === 'true'
  const [showEmbedDialog, setShowEmbedDialog] = useState(false)
  const [embedUrl, setEmbedUrl] = useState('')
  const [gameState, setGameState] = useState<'waiting' | 'ready' | 'toosoon' | 'testing' | 'result' | 'final'>('waiting')
  const [startTime, setStartTime] = useState(0)
  const [reactionTime, setReactionTime] = useState(0)
  const [attempts, setAttempts] = useState<number[]>([])
  const [results, setResults] = useState<{
    regionalRanking: { name: string; data: RankingResult[] };
    nationalRanking: { name: string; data: RankingResult[] };
    globalRanking: { name: string; data: RankingResult[] };
    cityRanking: { name: string; data: RankingResult[] };
  }>({
    regionalRanking: { name: '', data: [] },
    nationalRanking: { name: '', data: [] },
    globalRanking: { name: '', data: [] },
    cityRanking: { name: '', data: [] }
  })
  const [averageTime, setAverageTime] = useState(0)
  const [bestTime, setBestTime] = useState(0)
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const audioContext = useRef<AudioContext | null>(null)
  const [showSharePoster, setShowSharePoster] = useState(false)

  const playBeep = () => {
    if (!audioContext.current) {
      audioContext.current = new AudioContext()
    }
    
    const oscillator = audioContext.current.createOscillator()
    const gainNode = audioContext.current.createGain()
    
    oscillator.connect(gainNode)
    gainNode.connect(audioContext.current.destination)
    
    oscillator.frequency.value = 1000 // 1000Hz beep
    gainNode.gain.value = 0.1 // 音量控制
    
    oscillator.start()
    oscillator.stop(audioContext.current.currentTime + 0.1) // 播放100ms
  }

  const handleStart = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current)
    }

    if (gameState === 'waiting') {
      setGameState('ready')
      const delay = Math.random() * 4000 + 1000 
      timerRef.current = setTimeout(() => {
        setGameState('testing')
        setStartTime(Date.now())
        playBeep()
        timerRef.current = null
      }, delay)
    }
  }

  const handleClick = async () => {
    if (gameState === 'waiting') {
      handleStart()
      return
    }
    
    const clearTime = Date.now()
    
    if (timerRef.current) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }

    switch (gameState) {
      case 'ready':
        setGameState('toosoon')
        break
      case 'toosoon':
        setGameState('waiting')
        break
      case 'testing':
        const endTime = Date.now()
        const time = endTime - startTime - (endTime - clearTime)
        setReactionTime(time)
        
        const newAttempts = [...attempts, time]
        setAttempts(newAttempts)
        
        if (newAttempts.length >= 5) {
          setGameState('final')
          const avgTime = Math.round(newAttempts.reduce((a, b) => a + b, 0) / newAttempts.length)
          setAverageTime(avgTime)
          // 发送所有结果到后端
          try {
            const response = await fetch('/api/audio-reaction-time', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ 
                reactionTimes: newAttempts,
                averageTime: avgTime
              }),
            })

            if (!response.ok) {
              throw new Error('Failed to save result')
            }
          } catch (error) {
            console.error('Error saving results:', error)
          }
        } else {
          setGameState('result')
        }
        break
      case 'result':
        setGameState('ready')
        const delay = Math.random() * 4000 + 1000 
        timerRef.current = setTimeout(() => {
          setGameState('testing')
          setStartTime(Date.now())
          playBeep()
          timerRef.current = null
        }, delay)
        break
      case 'final':
        // 重置所有状态
        setAttempts([])
        setReactionTime(0)
        setStartTime(0)
        setGameState('waiting')
        break
      default:
        handleStart()
    }
  }

  useEffect(() => {
    if (attempts.length > 0) {
      setBestTime(Math.min(...attempts))
    }
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current)
      }
    }
  }, [attempts])

  const fetchRankings = async () => {
    try {
      const response = await fetch('/api/audio-reaction-time')
      const data = await response.json()
      setResults({
        regionalRanking: { name: data.rankings.regional.name, data: data.rankings.regional.data },
        nationalRanking: { name: data.rankings.national.name, data: data.rankings.national.data },
        globalRanking: { name: data.rankings.global.name, data: data.rankings.global.data },
        cityRanking: { name: data.rankings.city.name, data: data.rankings.city.data }
      })
    } catch (error) {
      console.error('Error fetching rankings:', error)
    }
  }

  useEffect(() => {
    fetchRankings()
    const interval = setInterval(fetchRankings, 60000)
    return () => clearInterval(interval)
  }, [])

  const getGameStateMessage = () => {
    switch (gameState) {
      case 'waiting':
        return { 
          message: t("h1"),
          description: t("description"), 
          icon: <FaVolumeUp className="text-9xl text-white mb-8 animate-fade" />
        }
      case 'ready':
        return { 
          message: t("waitForBeep"),
          description: t("click"), 
          icon: <FaHourglassStart className="text-9xl text-white mb-8 animate-fade" />
        }
      case 'toosoon':
        return { 
          message: t("tooSoon"),
          description: t("clickToTryAgain"), 
          icon: <FaExclamationTriangle className="text-9xl text-white mb-8 animate-fade" />
        }
      case 'testing':
        return { 
          message: t("click"),
          description: '', 
          icon: <FaPlay className="text-9xl text-white mb-8 animate-fade" />
        }
      case 'result':
        return { 
          message: `${t("reactionTime")}\n${reactionTime} ms`,
          description: `${t("attempt")} ${attempts.length}/5`, 
          icon: <FaCheck className="text-9xl text-white mb-8 animate-fade" />
        }
      case 'final':
        return {
          message: `${averageTime} ms`,
          description: t("averageTime"),
          icon: <FaTrophy className="text-9xl text-white mb-8 animate-fade" />
        }
    }
  }

  const { message, description, icon } = getGameStateMessage()

  const calculateRankInfo = () => {
    const allTimes = results.globalRanking.data.map(r => r.reactionTime)
    const currentRank = allTimes.findIndex(time => time > reactionTime) + 1
    return {
      rank: currentRank || allTimes.length + 1,
      totalUsers: allTimes.length || 1
    }
  }

  const { rank, totalUsers } = calculateRankInfo()

  const renderResultActions = () => {
    if (gameState !== 'result' && gameState !== 'final') return null;

    return (
      <div className="flex gap-4 mt-6" onClick={e => e.stopPropagation()}>
        <button
          onClick={() => {
            if (gameState === 'final') {
              setAttempts([])
              setReactionTime(0)
              setStartTime(0)
              setGameState('waiting')
            } else {
              handleClick()
            }
          }}
          className="bg-blue-500 text-white px-6 py-2 rounded-lg 
                    hover:bg-blue-600 transition-colors duration-200
                    flex items-center gap-2"
        >
          <i className={`fas ${gameState === 'final' ? 'fa-redo' : 'fa-forward'}`}></i>
          {gameState === 'final' ? t('tryAgain') : t('continue')}
        </button>
      </div>
    )
  }


  return (
    <>
      {/* FAQ Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "mainEntity": [
              {
                "@type": "Question",
                "name": "What is a good audio reaction time?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "A typical audio reaction time ranges from 140-160 milliseconds in healthy adults. Professional athletes and musicians often achieve times below 130 milliseconds through regular practice and training."
                }
              },
              {
                "@type": "Question",
                "name": "How can I improve my audio reaction time?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Regular practice, adequate sleep, proper nutrition, and focused attention during testing can help improve audio reaction time. Physical exercise and cognitive training exercises may also enhance overall reaction speed."
                }
              },
              {
                "@type": "Question",
                "name": "What factors affect audio reaction time?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Age, fatigue, stress, caffeine intake, and overall health can affect audio reaction time. Environmental factors like background noise and time of day may also impact performance."
                }
              },
              {
                "@type": "Question",
                "name": "Why test audio reaction time?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Testing audio reaction time helps assess cognitive processing speed, neurological health, and overall alertness. It's particularly relevant for activities requiring quick responses to sound cues."
                }
              }
            ]
          })
        }}
      />

      {/* 游戏组件 */}
      <div className="w-full mx-auto py-0 space-y-16">
        <div 
          className={`
            relative banner w-full h-[550px] flex flex-col justify-center items-center bg-blue-theme
            transition-all duration-300 cursor-pointer user-select-none
          `} 
          onClick={handleClick}
        >
          {/* 进度指示器 */}
          {gameState !== 'waiting' && (
            <>
              <div className="hidden md:flex absolute left-8 top-1/2 -translate-y-1/2 flex-col gap-4">
                {[...Array(5)].map((_, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <div 
                      className={`
                        w-3 h-3 rounded-full transition-all duration-300
                        ${attempts[index] ? 'bg-white' : 'bg-white/30'}
                      `}
                    />
                    <div className={`
                      transition-all duration-300
                      ${attempts[index] 
                        ? 'opacity-100 translate-x-0' 
                        : 'opacity-0 -translate-x-2'}
                    `}>
                      <span className="text-white text-sm font-medium">
                        {attempts[index] ? `${attempts[index]}ms` : ''}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="md:hidden absolute top-4 left-1/2 -translate-x-1/2 flex gap-2">
                {[...Array(5)].map((_, index) => (
                  <div key={index} className="flex flex-col items-center">
                    <div 
                      className={`
                        w-2 h-2 rounded-full mb-1 transition-all duration-300
                        ${attempts[index] ? 'bg-white' : 'bg-white/30'}
                      `}
                    />
                    <span className={`
                      text-xs text-white font-medium transition-all duration-300
                      ${attempts[index] 
                        ? 'opacity-100 scale-100' 
                        : 'opacity-0 scale-95'}
                    `}>
                      {attempts[index] ? `${attempts[index]}` : ''}
                    </span>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* 主要内容 */}
          {getGameStateMessage() && (
            <>
              {getGameStateMessage()?.icon}
              <h1 
                className="text-4xl md:text-5xl lg:text-6xl font-bold text-center mb-4 text-white user-select-none" 
                dangerouslySetInnerHTML={{ __html: getGameStateMessage()?.message || '' }} 
              />
              <p 
                className="text-3xl text-center mb-20 text-white user-select-none" 
                dangerouslySetInnerHTML={{ 
                  __html: getGameStateMessage()?.description?.replace(/\n/g, '<br />') || ''
                }} 
              />
            </>
          )}

          {/* 按钮区域 */}
          {renderResultActions()}
        </div>
      
      
      <div  className="container mx-auto py-0 space-y-16">
      {/* 静态内容 */}
      <div dangerouslySetInnerHTML={{ __html: staticContent }} />
      {/* SEO Content Section */}
      <section className="max-w-4xl mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          Understanding Audio Reaction Time Testing
        </h2>
        
        <div className="prose prose-blue max-w-none">
          <p className="text-gray-700 leading-relaxed mb-4">
            Audio reaction time testing measures your ability to respond quickly to sound stimuli, providing valuable insights into your auditory processing speed and cognitive function. This specialized test evaluates how fast your brain can process and respond to audio signals, which is crucial for many daily activities and professional skills.
          </p>
          
          <p className="text-gray-700 leading-relaxed mb-4">
            The audio reaction time test presents a simple beep sound at random intervals, challenging you to react as quickly as possible. Your reaction time is measured in milliseconds, allowing for precise assessment of your auditory response speed. This measurement helps identify patterns in your reaction capabilities and areas for potential improvement.
          </p>
          
          <p className="text-gray-700 leading-relaxed">
            Whether you're an athlete needing quick auditory reflexes, a musician timing your performances, or someone interested in cognitive performance, understanding your audio reaction time is essential. Regular testing and practice can help improve your reaction speed, contributing to better performance in various activities requiring quick auditory responses.
          </p>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="max-w-4xl mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          Frequently Asked Questions About Audio Reaction Time
        </h2>
        
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              What is a good audio reaction time?
            </h3>
            <p className="text-gray-700">
              A typical audio reaction time ranges from 140-160 milliseconds in healthy adults. Professional athletes and musicians often achieve times below 130 milliseconds through regular practice and training. Your reaction time can vary based on factors like age, alertness, and overall health.
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              How can I improve my audio reaction time?
            </h3>
            <p className="text-gray-700">
              Regular practice with audio reaction tests, maintaining good sleep habits, proper nutrition, and staying focused during testing can help improve your reaction time. Physical exercise and cognitive training exercises may also enhance overall reaction speed. Consistency in practice is key to seeing improvements.
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              What factors affect audio reaction time?
            </h3>
            <p className="text-gray-700">
              Several factors can influence your audio reaction time, including age, fatigue levels, stress, caffeine intake, and overall health condition. Environmental factors such as background noise, time of day, and your level of concentration can also significantly impact your performance.
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Why test audio reaction time?
            </h3>
            <p className="text-gray-700">
              Testing audio reaction time helps assess cognitive processing speed, neurological health, and overall alertness. It's particularly important for activities requiring quick responses to sound cues, such as driving, sports, music performance, and various professional tasks requiring rapid auditory processing.
            </p>
          </div>
        </div>
      </section>
      </div>
      </div>
    </>
  )
} 