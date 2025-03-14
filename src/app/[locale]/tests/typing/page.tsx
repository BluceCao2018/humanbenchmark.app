'use client'
import React, { useState, useEffect, useRef } from 'react'
import { useTranslations } from 'next-intl'
import '@fortawesome/fontawesome-free/css/all.min.css';
import Image from 'next/image'
import { useSearchParams } from 'next/navigation'
import { EmbedDialog } from '@/components/EmbedDialog'
import staticContent from '../alltoolslist.html'

export default function TypingTest() {
  const [gameState, setGameState] = useState<'start' | 'playing' | 'result'>('start')
  const [currentText, setCurrentText] = useState<string>('')
  const [userInput, setUserInput] = useState<string>('')
  const [startTime, setStartTime] = useState<number>(0)
  const [errors, setErrors] = useState<number>(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const [elapsedTime, setElapsedTime] = useState(0)
  const [finalWPM, setFinalWPM] = useState<number>(0)
  const [finalTime, setFinalTime] = useState<number>(0)
  const [accuracy, setAccuracy] = useState<number>(100)

  const searchParams = useSearchParams()
  const isIframe = searchParams.get('embed') === 'true'
  const [embedUrl, setEmbedUrl] = useState('')
  const [showEmbedDialog, setShowEmbedDialog] = useState(false)

  const t =  useTranslations('typing');
  // 预定义的测试文本
  const sentences: string[] = t.raw("sentences");//JSON.parse(t.raw('sentences'));

  const startGame = () => {
    const randomText = sentences[Math.floor(Math.random() * sentences.length)]
    setCurrentText(randomText)
    setUserInput('')
    setErrors(0)
    setGameState('playing')
    setStartTime(Date.now())

    // 自动聚焦文本区域
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus()
      }
    }, 100)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setUserInput(value)

    // 计算错误数
    const errorCount = value.split('').filter((char, index) => char !== currentText[index]).length
    setErrors(errorCount)

    // 检查是否完成
    if (value === currentText) {
      endGame()
    }
  }

  const endGame = () => {
    const endTime = Date.now()
    const duration = (endTime - startTime) / 1000 // 秒
    const wordsPerMinute = Math.round((currentText.split(' ').length / duration) * 60)
    const accuracyValue = Math.max(0, Math.round(((currentText.length - errors) / currentText.length) * 100))
    
    // 保存最终速度和用时
    setFinalWPM(wordsPerMinute)
    setFinalTime(duration)
    setAccuracy(accuracyValue)
    setGameState('result')
  }

  useEffect(() => {
    let interval: NodeJS.Timeout
    if (gameState === 'playing') {
      interval = setInterval(() => {
        setElapsedTime(Date.now() - startTime)
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [gameState, startTime])

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
            wpm: finalWPM,
            accuracy: accuracy,
            errors: errors,
            time: finalTime
          }
        }, '*')
      }

      return () => {
        observer.disconnect()
      }
    }
  }, [isIframe, gameState, finalWPM, accuracy, errors, finalTime])

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
                "name": "What is a good Typing Test score?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "In the Typing Test, 50-70 WPM (Words Per Minute) is considered good for casual typing, while 70-90 WPM is professional level. Advanced typists often achieve 90-120 WPM. Professional typists can exceed 120 WPM with high accuracy."
                }
              },
              {
                "@type": "Question",
                "name": "How can I improve my typing speed?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Regular practice with the Typing Test, proper finger positioning, touch typing techniques, and maintaining good posture can improve your speed. Focus on accuracy first, and speed will naturally follow with consistent practice."
                }
              },
              {
                "@type": "Question",
                "name": "What factors affect Typing Test performance?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Keyboard quality, typing technique, finger dexterity, and practice frequency affect Typing Test results. Familiarity with the keyboard layout and overall typing experience also significantly impact performance."
                }
              },
              {
                "@type": "Question",
                "name": "How often should I practice typing?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "For optimal improvement, practice the Typing Test for 15-20 minutes daily. Regular, focused practice sessions are more effective than longer, irregular sessions. Consistent practice helps build muscle memory."
                }
              },
              {
                "@type": "Question",
                "name": "Why is typing speed important?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Fast, accurate typing is essential for productivity in most modern professions. Good typing skills save time, reduce fatigue, and allow you to focus more on content creation rather than the mechanical process of typing."
                }
              }
            ]
          })
        }}
      />

      <div className="w-full mx-auto py-0 space-y-16">
        <div className="banner w-full h-[550px] flex flex-col justify-center items-center bg-blue-theme text-white">
          {gameState === 'start' && (
            <div className='flex flex-col justify-center items-center'>
              <i className="fas fa-keyboard text-9xl text-white mb-8 animate-fade cursor-pointer" ></i>
              <h1 className="text-4xl font-bold text-center mb-4 text-white">{t("h2")}</h1>
                <p className="text-lg text-center mb-20 text-white" dangerouslySetInnerHTML={{ __html: t("description")?.replace(/\n/g, '<br />')  || ''}} ></p>
              <button 
                onClick={startGame} 
                className="bg-blue-600 text-white px-6 py-3 rounded-lg shadow-md hover:bg-blue-700 transition-colors"
              >
                {t("clickToStart")}
              </button>
            </div>
          )}

          {gameState === 'playing' && (
            <div className="w-full max-w-2xl flex flex-col items-center">
              {/* WPM Display */}
              <div className="text-6xl font-bold mb-8">
                {Math.round((userInput.split(' ').length / ((Date.now() - startTime) / 1000)) * 60)}
                <span className="text-2xl ml-2">WPM</span>
              </div>

              {/* Text Area with white background */}
              <div 
                className="w-full h-[350px] bg-white rounded-lg shadow-lg p-8 mb-8 focus:outline-none overflow-auto"
                tabIndex={0}
                onKeyDown={(e) => {
                  e.preventDefault();
                  if (e.key.length === 1) {
                    const newInput = userInput + e.key;
                    setUserInput(newInput);
                    
                    // 添加自动滚动逻辑
                    const currentChar = document.querySelector('.border-b-2.border-black');
                    if (currentChar) {
                      currentChar.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    }
                    
                    if (newInput === currentText) {
                      endGame();
                    }
                  } else if (e.key === 'Backspace') {
                    setUserInput(prev => prev.slice(0, -1));
                  }
                }}
                ref={inputRef}
              >
                <div className="mb-6 text-xl font-mono leading-relaxed text-black">
                  {currentText.split('').map((char, index) => {
                    let className = '';
                    if (index < userInput.length) {
                      className = userInput[index] === char ? 'bg-green-300' : 'bg-red-300 text-white';
                    } else if (index === userInput.length) {
                      className = 'border-b-2 border-black animate-pulse';
                    }
                    return (
                      <span 
                        key={index} 
                        className={className}
                      >
                        {char}
                      </span>
                    );
                  })}
                </div>
              </div>

              {/* Timer */}
              <div className="text-3xl font-mono">
                {Math.floor(((Date.now() - startTime) / 1000) / 60)}:
                {String(Math.floor(((Date.now() - startTime) / 1000) % 60)).padStart(2, '0')}
              </div>
            </div>
          )}

          {gameState === 'result' && (
            <div className="w-full max-w-2xl flex flex-col items-center">
              <i className="fas fa-keyboard text-9xl text-white mb-8 animate-fade cursor-pointer" ></i>
              <h2 className="text-2xl font-bold mb-4">{t("h2")}</h2>
              <div className="text-xl space-y-4">
                <p className="mb-2">
                  <span className="font-bold text-6xl">{finalWPM}</span> WPM
                </p>
                {/* <p className="mb-2">{t("errors")}: <span className="font-bold">{errors}</span></p>
                <p className="mb-2">{t("time")}: <span className="font-bold">
                  {Math.floor(finalTime / 60)}:
                  {String(Math.floor(finalTime % 60)).padStart(2, '0')}s
                </span></p> */}
              </div>
              <button 
                onClick={() => setGameState('start')}
                className="mt-8 bg-blue-600 text-white px-6 py-3 rounded-lg shadow-md hover:bg-blue-700 transition-colors"
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
              Understanding the Typing Test
            </h2>
            
            <div className="prose prose-blue max-w-none">
              <p className="text-gray-700 leading-relaxed mb-4">
                The Typing Test is a comprehensive assessment tool designed to measure your typing speed and accuracy. This professional-grade test evaluates both your Words Per Minute (WPM) and accuracy percentage, providing detailed insights into your typing proficiency. The Typing Test helps users identify areas for improvement and track progress over time.
              </p>
              
              <p className="text-gray-700 leading-relaxed mb-4">
                During the Typing Test, participants type a series of words or passages while being timed. The Typing Test calculates your WPM while accounting for errors, giving you a true measure of your typing efficiency. Each session provides immediate feedback on your performance, including detailed statistics about your typing speed and accuracy.
              </p>
              
              <p className="text-gray-700 leading-relaxed mb-4">
                Regular practice with the Typing Test can significantly improve your typing skills. Many professionals use the Typing Test to enhance their workplace efficiency and productivity. The test's varied content ensures that users develop well-rounded typing abilities across different types of text.
              </p>
              
              <p className="text-gray-700 leading-relaxed">
                Whether you're a student looking to improve academic performance or a professional seeking to enhance workplace efficiency, the Typing Test offers a practical approach to skill development. The test's design focuses on both speed and accuracy, making it an effective tool for comprehensive typing improvement.
              </p>
            </div>
          </section>

          {/* FAQ Section */}
          <section className="max-w-4xl mx-auto px-4 py-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              FAQ About Typing Test
            </h2>
            
            <div className="space-y-6">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  What is a good Typing Test score?
                </h3>
                <p className="text-gray-700">
                  In the Typing Test, 50-70 WPM is considered good for casual typing, while 70-90 WPM is professional level. Advanced typists often achieve 90-120 WPM. Professional typists can exceed 120 WPM with high accuracy.
                </p>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  How can I improve my typing speed?
                </h3>
                <p className="text-gray-700">
                  Regular practice with the Typing Test, proper finger positioning, touch typing techniques, and maintaining good posture can improve your speed. Focus on accuracy first, and speed will naturally follow with consistent practice.
                </p>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  What factors affect Typing Test performance?
                </h3>
                <p className="text-gray-700">
                  Keyboard quality, typing technique, finger dexterity, and practice frequency affect Typing Test results. Familiarity with the keyboard layout and overall typing experience also significantly impact performance.
                </p>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  How often should I practice typing?
                </h3>
                <p className="text-gray-700">
                  For optimal improvement, practice the Typing Test for 15-20 minutes daily. Regular, focused practice sessions are more effective than longer, irregular sessions. Consistent practice helps build muscle memory.
                </p>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Why is typing speed important?
                </h3>
                <p className="text-gray-700">
                  Fast, accurate typing is essential for productivity in most modern professions. Good typing skills save time, reduce fatigue, and allow you to focus more on content creation rather than the mechanical process of typing.
                </p>
              </div>
            </div>
          </section>

         
        </div>
      </div>
    </>
  )
} 