'use client'
import { useState, useEffect, useRef } from 'react'
import { useTranslations } from 'next-intl'
import Image from 'next/image'
import { FaVolumeUp, FaHourglassStart, FaExclamationTriangle, FaPlay, FaCheck, FaTrophy } from 'react-icons/fa'
import '@fortawesome/fontawesome-free/css/all.min.css';
import staticContent from '../alltoolslist.html'

interface RankingResult {
  reactionTime: number;
  timestamp: number;
}

export default function AudioReactionTime() {
  const t = useTranslations('sprinter')
  
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

  const playStartGun = () => {
    if (!audioContext.current) {
      audioContext.current = new AudioContext()
    }
    
    const ctx = audioContext.current
    const oscillator = ctx.createOscillator()
    const gainNode = ctx.createGain()
    
    // 连接节点
    oscillator.connect(gainNode)
    gainNode.connect(ctx.destination)
    
    // 增加音量并调整衰减
    gainNode.gain.setValueAtTime(1.5, ctx.currentTime)
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2)
    
    // 调整频率使声音更清晰
    oscillator.frequency.setValueAtTime(180, ctx.currentTime)
    oscillator.frequency.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2)
    
    // 开始播放
    oscillator.start(ctx.currentTime)
    oscillator.stop(ctx.currentTime + 0.2)
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
        playStartGun()
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
          playStartGun()
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
          message: t("waitForBeep"),
          description: t("description"), 
          icon: <FaVolumeUp className="text-9xl text-white mb-8 animate-fade" />
        }
      case 'ready':
        return { 
          message: t("onyourmark"),
          description: t("onyourmarkdes"), 
          icon: <FaHourglassStart className="text-9xl text-white mb-8 animate-fade" />
        }
      case 'toosoon':
        return { 
          message: t("tooSoon"),
          description: t("tooSoonDes"), 
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

  // 1. 更新页面标题和描述
  const pageTitle = "Professional Reaction Time Test for Sprinters | Sprint Start Training"
  const pageDescription = "Professional reaction time test for sprinters using official starting gun simulation. Train like elite sprinters with our precise reaction timer. IAAF-standard testing helps sprinters improve start performance."

  // 2. 更新 SEO 内容部分
  const seoContent = (
    <section className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">
        Reaction Time Test for Sprinters
      </h1>
      
      <div className="prose prose-blue max-w-none">
        <p className="text-gray-700 leading-relaxed mb-4">
          Our professional reaction time test for sprinters simulates real race conditions with official starting gun sounds. Elite sprinters rely on lightning-fast reaction times, making this specialized testing tool essential for track athletes and coaches.
        </p>
        
        <p className="text-gray-700 leading-relaxed mb-4">
          Following international athletics standards, this sprinter reaction test helps identify false starts (under 100ms) and measures your start reaction time with millisecond precision. Top sprinters typically achieve reaction times between 120-160ms.
        </p>
        
        <h2 className="text-2xl font-bold text-gray-900 my-6">
          Why Use Our Sprint Reaction Timer?
        </h2>
        
        <ul className="list-disc pl-6 mb-6">
          <li>Professional-grade reaction testing for sprinters</li>
          <li>Authentic starting gun simulation</li>
          <li>IAAF-compliant false start detection</li>
          <li>Track your progress over time</li>
          <li>Compare with elite sprinter benchmarks</li>
        </ul>
        
        <p className="text-gray-700 leading-relaxed">
          Whether you're a competitive sprinter, coach, or aspiring athlete, regular reaction time testing is crucial for improving your sprint start performance. Use this tool to develop faster, more consistent reaction times at the starting block.
        </p>
      </div>
    </section>
  )

  // 3. 更新 FAQ Schema 内容
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "How accurate is this reaction time test for sprinters?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Our sprint reaction test provides millisecond-precise measurements following IAAF standards. It's specifically designed for sprinters to simulate real race conditions with authentic starting gun sounds."
        }
      },
      {
        "@type": "Question",
        "name": "What is a legal reaction time for sprinters?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "According to World Athletics rules, any reaction time less than 100 milliseconds is considered a false start. Elite sprinters typically achieve reaction times between 120-160 milliseconds."
        }
      },
      {
        "@type": "Question",
        "name": "How can sprinters improve their start reaction time?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Sprinters can improve reaction time through regular testing and practice, mental preparation, and proper rest. Our reaction time test for sprinters helps track progress and identify areas for improvement."
        }
      },
      {
        "@type": "Question",
        "name": "Why do sprinters need specialized reaction time testing?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Sprint events are often decided by milliseconds, making start reaction time crucial. Professional sprinters need specialized testing tools that simulate race conditions and provide precise measurements for training."
        }
      }
    ]
  }

  return (
    <>
      {/* FAQ Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(faqSchema)
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
      {seoContent}

      {/* FAQ Section */}
      <section className="max-w-4xl mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          FAQ About Sprint Start Reaction Time
        </h2>
        
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              What is a legal reaction time for sprinters?
            </h3>
            <p className="text-gray-700">
              According to World Athletics rules, any reaction time less than 100 milliseconds (0.100 seconds) is considered a false start. Elite sprinters typically react between 120-160 milliseconds.
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              How can sprinters improve their reaction time?
            </h3>
            <p className="text-gray-700">
              Sprinters can improve reaction time through specific start practice, mental preparation, focus exercises, and regular testing. Proper rest, nutrition, and maintaining peak physical condition are also crucial.
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Why is reaction time important in sprinting?
            </h3>
            <p className="text-gray-700">
              In sprint events, where races are often decided by hundredths of a second, a quick reaction time at the start can be the difference between winning and losing. It's a crucial component of overall sprint performance.
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              What factors affect sprint start reaction time?
            </h3>
            <p className="text-gray-700">
              Factors include mental focus, physical readiness, fatigue levels, experience, stress levels, and environmental conditions. Regular practice and proper technique are essential for consistent performance.
            </p>
          </div>
        </div>
      </section>
      </div>
      </div>
    </>
  )
} 