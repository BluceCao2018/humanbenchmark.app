'use client'
import React, { useState, useEffect } from 'react'
import '@fortawesome/fontawesome-free/css/all.min.css';
import { useTranslations } from 'next-intl';
import Image from 'next/image'
import { useSearchParams } from 'next/navigation'
import { EmbedDialog } from '@/components/EmbedDialog'
import { Button } from '@/components/ui/button';
import staticContent from '../alltoolslist.html'

export default function NumberMemoryTest() {
  const [gameState, setGameState] = useState<'start' | 'show' | 'input' | 'result'>('start')
  const [currentNumber, setCurrentNumber] = useState<string>('')
  const [userInput, setUserInput] = useState<string>('')
  const [level, setLevel] = useState(1)
  const [timer, setTimer] = useState<number>(0)
  const [progress, setProgress] = useState(100)
  const [showEmbedDialog, setShowEmbedDialog] = useState(false)
  
  const baseTime = 1000
  const timePerDigit = 1000

  const t =  useTranslations('numberMemory');
  const te = useTranslations('embed');

  const searchParams = useSearchParams()
  const isIframe = searchParams.get('embed') === 'true'
  const [embedUrl, setEmbedUrl] = useState('')

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setEmbedUrl(`${window.location.origin}${window.location.pathname}?embed=true`)
    }
  }, [])

  useEffect(() => {
    if (isIframe) {
      const sendHeight = () => {
        const height = document.querySelector('.banner')?.scrollHeight
        if (height) {
          window.parent.postMessage({ type: 'resize', height }, '*')
        }
      }

      const observer = new ResizeObserver(sendHeight)
      const banner = document.querySelector('.banner')
      if (banner) {
        observer.observe(banner)
      }

      if (gameState === 'result') {
        window.parent.postMessage({
          type: 'testComplete',
          results: {
            level: level,
            number: currentNumber,
            userAnswer: userInput
          }
        }, '*')
      }

      return () => {
        observer.disconnect()
      }
    }
  }, [isIframe, gameState, level, currentNumber, userInput])

  const generateNumber = () => {
    // 随机生成数字，长度随级别增加
    const digits = level + 1
    const number = Math.floor(Math.random() * Math.pow(10, digits)).toString().padStart(digits, '0')
    return number
  }

  const startGame = () => {
    setGameState('show')
    const number = generateNumber()
    setCurrentNumber(number)
    setUserInput('')

    // 根据数字位数调整显示时间
    // 基础时间 2000ms
    // 每位数字增加 1000ms
    const displayTime = baseTime + (level * timePerDigit)
    
    setTimeout(() => {
      setGameState('input')
      const startTime = Date.now()
      setTimer(startTime)
    }, displayTime)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (userInput === currentNumber) {
      // 答对进入下一关
      setLevel(prev => prev + 1)
      startGame()
    } else {
      // 答错进入结果页
      setGameState('result')
    }
  }

  const calculateScore = () => {
    // 分数基于达到的关卡
    return level - 1
  }

  useEffect(() => {
    if (gameState === 'show') {
      setProgress(100)
      const duration = baseTime + (level * timePerDigit)
      const interval = 10
      const steps = duration / interval
      const decrementPerStep = 100 / steps + 0.02

      const timer = setInterval(() => {
        setProgress(prev => {
          const next = prev - decrementPerStep
          return next < 0 ? 0 : next
        })
      }, interval)

      return () => clearInterval(timer)
    }
  }, [gameState, level, baseTime, timePerDigit])

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
                "name": "What is a good Number Memory Test score?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "In the Number Memory Test, remembering 7-8 digits is considered average, while 9-11 digits is good. Some individuals can remember 12 or more digits, which is exceptional. Professional memory athletes can achieve even higher scores."
                }
              },
              {
                "@type": "Question",
                "name": "How can I improve my number memory?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Regular practice with the Number Memory Test, using memory techniques like chunking, visualization, and creating number patterns can improve your performance. Daily practice and adequate rest are also essential for better memory retention."
                }
              },
              {
                "@type": "Question",
                "name": "What factors affect Number Memory Test performance?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Concentration level, fatigue, stress, and practice frequency affect Number Memory Test results. Environmental factors like distractions and time of day can also impact performance. Mental state and overall cognitive health play crucial roles."
                }
              },
              {
                "@type": "Question",
                "name": "How often should I practice number memory?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "For optimal improvement, practice the Number Memory Test for 10-15 minutes daily. Short, focused practice sessions are more effective than longer, irregular sessions. Consistency is key to developing better memory skills."
                }
              },
              {
                "@type": "Question",
                "name": "Why is number memory important?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Number memory is essential for daily tasks like remembering phone numbers, passwords, and dates. Strong number memory also indicates good working memory capacity, which is crucial for learning, problem-solving, and cognitive performance."
                }
              }
            ]
          })
        }}
      />

      <div className="w-full mx-auto py-0 space-y-16">
        <div className="banner w-full h-[550px] flex flex-col justify-center items-center bg-blue-theme text-white">
          {gameState === 'start' && (
            <div  className='flex flex-col justify-center items-center'>
              <i className="fas fa-th text-9xl text-white mb-8 animate-fade cursor-pointer"></i>
              <h1 className="text-4xl font-bold text-center mb-4 text-white">{t("h2")}</h1>
                <p className="text-lg text-center mb-20 text-white" dangerouslySetInnerHTML={{ __html: t("description")?.replace(/\n/g, '<br />')  || ''}} ></p>
              
              <div className="flex gap-4 justify-center items-center">
              <Button 
                onClick={startGame} 
                className="bg-blue-600 text-white px-6 py-3 rounded-lg shadow-md hover:bg-blue-700 transition-colors"
              >
                {t("clickToStart")}
              </Button>
              </div>
            </div>
          )}

          {gameState === 'show' && (
            <div className="flex flex-col items-center">
              <div className="text-6xl font-bold mb-4">
                {currentNumber}
              </div>
              <div className="w-full max-w-[400px] h-2 bg-white/0 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-white"
                  style={{ 
                    width: `${progress}%`,
                    transition: 'width 10ms linear'
                  }}
                />
              </div>
            </div>
          )}

          {gameState === 'input' && (
            <form onSubmit={handleSubmit} className="flex flex-col items-center">
              <i className="fas fa-th text-9xl text-white mb-8 animate-fade cursor-pointer"></i>
              <h1 className="text-4xl font-bold text-center mb-4 text-white">{t("remaindTitle")}</h1>
              <p className="text-lg text-center mb-4 text-white" dangerouslySetInnerHTML={{ __html: t("remaindDescription")?.replace(/\n/g, '<br />')  || ''}} ></p>
              <input 
                type="text" 
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                className="text-4xl text-center border-2 border-blue-500 rounded-lg p-2 mb-4 text-black"
                autoFocus
                placeholder=""
              />
              <button 
                type="submit" 
                className="bg-green-600 text-white px-6 py-3 rounded-lg shadow-md hover:bg-green-700 transition-colors"
              >
                {t("submit")}
              </button>
            </form>
          )}

          {gameState === 'result' && (
            <div   className='flex flex-col justify-center items-center'>
              <h2 className="text-2xl mb-4">{t("number")}</h2>
              
              <p className="text-3xl font-bold mb-6">{currentNumber}</p>
              <h2 className="text-2xl mb-4">{t("youAnswer")}</h2>
              <p className="text-3xl font-bold mb-4 line-through text-red">{userInput}</p>
              <h2  className="text-7xl font-bold mb-6">{t("level")} {level}</h2>
              <button 
                onClick={() => {
                  setGameState('start')
                  setLevel(1)
                }}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg shadow-md hover:bg-blue-700 transition-colors"
              >
                {t("tryAgain")}
              </button>
            </div>
          )}
        </div>

        <div className="container mx-auto py-0 space-y-16">
         

          {/* 静态内容 */}
          <div dangerouslySetInnerHTML={{ __html: staticContent }} />

          {/* SEO Content Section */}
          <section className="max-w-4xl mx-auto px-4 py-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Understanding the Number Memory Test
            </h2>
            
            <div className="prose prose-blue max-w-none">
              <p className="text-gray-700 leading-relaxed mb-4">
                The Number Memory Test is a sophisticated cognitive assessment tool designed to measure your numerical memory capacity and recall abilities. This comprehensive test challenges users to remember increasingly longer sequences of numbers, providing valuable insights into working memory performance. The Number Memory Test helps users understand and improve their memory capabilities through systematic practice.
              </p>
              
              <p className="text-gray-700 leading-relaxed mb-4">
                During the Number Memory Test, participants are presented with number sequences of increasing length. The test begins with shorter sequences and progressively increases difficulty as users demonstrate successful recall. Each Number Memory Test session provides immediate feedback on performance, allowing users to track their progress and identify areas for improvement.
              </p>
              
              <p className="text-gray-700 leading-relaxed mb-4">
                Regular practice with the Number Memory Test can significantly enhance your memory capacity. Many professionals and students use the Number Memory Test to strengthen their cognitive abilities and improve their performance in tasks requiring numerical recall. The test's adaptive difficulty ensures that users are consistently challenged at their skill level.
              </p>
              
              <p className="text-gray-700 leading-relaxed">
                Whether you're a student looking to enhance your learning capabilities or a professional seeking to improve your memory skills, the Number Memory Test offers a scientific approach to memory training. The test's design focuses on both accuracy and capacity, making it an effective tool for comprehensive memory development.
              </p>
            </div>
          </section>

          {/* FAQ Section */}
          <section className="max-w-4xl mx-auto px-4 py-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              FAQ About Number Memory Test
            </h2>
            
            <div className="space-y-6">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  What is a good Number Memory Test score?
                </h3>
                <p className="text-gray-700">
                  In the Number Memory Test, remembering 7-8 digits is considered average, while 9-11 digits is good. Some individuals can remember 12 or more digits, which is exceptional. Professional memory athletes can achieve even higher scores.
                </p>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  How can I improve my number memory?
                </h3>
                <p className="text-gray-700">
                  Regular practice with the Number Memory Test, using memory techniques like chunking, visualization, and creating number patterns can improve your performance. Daily practice and adequate rest are also essential for better memory retention.
                </p>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  What factors affect Number Memory Test performance?
                </h3>
                <p className="text-gray-700">
                  Concentration level, fatigue, stress, and practice frequency affect Number Memory Test results. Environmental factors like distractions and time of day can also impact performance. Mental state and overall cognitive health play crucial roles.
                </p>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  How often should I practice number memory?
                </h3>
                <p className="text-gray-700">
                  For optimal improvement, practice the Number Memory Test for 10-15 minutes daily. Short, focused practice sessions are more effective than longer, irregular sessions. Consistency is key to developing better memory skills.
                </p>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Why is number memory important?
                </h3>
                <p className="text-gray-700">
                  Number memory is essential for daily tasks like remembering phone numbers, passwords, and dates. Strong number memory also indicates good working memory capacity, which is crucial for learning, problem-solving, and cognitive performance.
                </p>
              </div>
            </div>
          </section>

          
        </div>
      </div>
    </>
  )
} 