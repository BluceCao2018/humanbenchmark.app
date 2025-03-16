'use client'
import React, { useState, useEffect, useCallback, useRef } from 'react'
import {getTranslations, getLocale} from 'next-intl/server';
import { useTranslations } from 'next-intl';
import '@fortawesome/fontawesome-free/css/all.min.css';
import Image from 'next/image'
import { useSearchParams } from 'next/navigation'
import { EmbedDialog } from '@/components/EmbedDialog'
import { Button } from '@/components/ui/button';
import staticContent from '../alltoolslist.html'


export default function SequenceMemoryTest() {
  const [sequence, setSequence] = useState<number[]>([])
  const [userSequence, setUserSequence] = useState<number[]>([])
  const [gameState, setGameState] = useState<'start' | 'show' | 'play' | 'result' | 'review'>('start')
  const [level, setLevel] = useState(1)
  const [score, setScore] = useState(0)
  const [isGameStarted, setIsGameStarted] = useState(false)
  const [bestScore, setBestScore] = useState(0)
  const [showTutorial, setShowTutorial] = useState(true)
  const [isAnimating, setIsAnimating] = useState(false)
  const [isSoundEnabled, setIsSoundEnabled] = useState(true)
  
  // Audio refs
  const clickSoundRef = useRef<HTMLAudioElement | null>(null)
  const correctSoundRef = useRef<HTMLAudioElement | null>(null)
  const wrongSoundRef = useRef<HTMLAudioElement | null>(null)

  const GRID_SIZE = 9
  const COLORS = {
    default: 'bg-gray-100 border-gray-300',
    highlight: 'bg-blue-500 border-blue-600',
    wrong: 'bg-red-500 border-red-600',
    correct: 'bg-green-500 border-green-600'
  }

  const t = useTranslations('sequence');
  const te = useTranslations('embed');

  const searchParams = useSearchParams()
  const isIframe = searchParams.get('embed') === 'true'
  const [embedUrl, setEmbedUrl] = useState('')
  const [showEmbedDialog, setShowEmbedDialog] = useState(false)

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
            score: score,
            sequence: sequence
          }
        }, '*')
      }

      return () => {
        observer.disconnect()
      }
    }
  }, [isIframe, gameState, level, score, sequence])

  useEffect(() => {
    // Load best score from localStorage
    const savedBestScore = localStorage.getItem('sequenceMemoryBestScore')
    if (savedBestScore) {
      setBestScore(parseInt(savedBestScore))
    }
  }, [])

  // Initialize audio elements
  useEffect(() => {
    const soundPreference = localStorage.getItem('sequenceMemorySoundEnabled')
    setIsSoundEnabled(soundPreference !== 'false')

    // Remove levelup sound initialization
    clickSoundRef.current = new Audio('/sounds/click.mp3')
    correctSoundRef.current = new Audio('/sounds/correct.mp3')
    wrongSoundRef.current = new Audio('/sounds/wrong.mp3')

    // Set volume
    const audioElements = [clickSoundRef, correctSoundRef, wrongSoundRef]
    audioElements.forEach(ref => {
      if (ref.current) {
        ref.current.volume = 0.5
      }
    })
  }, [])

  // Sound utility function
  const playSound = (soundRef: React.RefObject<HTMLAudioElement>) => {
    if (isSoundEnabled && soundRef.current) {
      soundRef.current.currentTime = 0
      soundRef.current.play().catch(e => console.log('Audio play failed:', e))
    }
  }

  // Toggle sound function
  const toggleSound = () => {
    const newState = !isSoundEnabled
    setIsSoundEnabled(newState)
    localStorage.setItem('sequenceMemorySoundEnabled', newState.toString())
  }

  const generateSequence = useCallback((length: number) => {
    const sequence = Array.from({ length }).map(() => Math.floor(Math.random() * GRID_SIZE));
    console.log(`Generated sequence for length ${length}:`, sequence);
    return sequence;
  }, []);


  const startGame = (level:number) => {
    setIsGameStarted(true)
    setIsAnimating(true)
    console.log(`Starting game at level: ${level}`)
    const newSequence = generateSequence(level)
    setSequence(newSequence)
    console.log(`New sequence generated:`, newSequence)
    setUserSequence([])
    setGameState('show')

    // Show sequence with enhanced animation
    newSequence.forEach((index, i) => {
      setTimeout(() => {
        const grid = document.getElementById(`grid-${index}`)
        if (grid) {
          grid.style.transform = 'scale(1.1)'
          grid.style.backgroundColor = '#3b82f6'
          grid.style.borderColor = '#2563eb'
          
          setTimeout(() => {
            grid.style.backgroundColor = ''
            grid.style.borderColor = ''
            grid.style.transform = 'scale(1)'
            
            if (i === newSequence.length - 1) {
              setGameState('play')
              setIsAnimating(false)
            }
          }, 500)
        }
      }, i * 600)
    })
  }

  const handleGridClick = (index: number) => {
    if (gameState !== 'play' || isAnimating) return

    const grid = document.getElementById(`grid-${index}`)
    if (grid) {
      grid.style.transform = 'scale(1.1)'
      grid.className = `aspect-square rounded-lg cursor-pointer transition-all duration-200 ease-in-out border-2 bg-green-500 border-green-600`

      setTimeout(() => {
        grid.style.transform = 'scale(1)'
        grid.className = `aspect-square rounded-lg cursor-pointer transition-all duration-200 ease-in-out border-2 ${COLORS.default}`
      }, 200)
    }

    const newUserSequence = [...userSequence, index]
    setUserSequence(newUserSequence)

    const isCorrectSoFar = newUserSequence.every((val, idx) => val === sequence[idx])

    if (!isCorrectSoFar) {
      playSound(wrongSoundRef)
      const wrongGrid = document.getElementById(`grid-${index}`)
      if (wrongGrid) {
        wrongGrid.style.transform = 'scale(1.1)'
        wrongGrid.classList.add(...COLORS.wrong.split(' '))
        setTimeout(() => {
          wrongGrid.style.transform = 'scale(1)'
          wrongGrid.classList.remove(...COLORS.wrong.split(' '))
          setGameState('result')
          if (level > bestScore) {
            setBestScore(level)
            localStorage.setItem('sequenceMemoryBestScore', level.toString())
          }
        }, 200)
      }
      return
    }

    if (newUserSequence.length === sequence.length) {
      playSound(correctSoundRef)
      const newScore = score + 1
      const newLevel = level + 1
      setScore(newScore)
      setLevel(newLevel)
      
      const allGrids = document.querySelectorAll('[id^="grid-"]')
      allGrids.forEach((grid) => {
        grid.classList.add('animate-pulse')
        setTimeout(() => {
          grid.classList.remove('animate-pulse')
        }, 500)
      })
      
      // Simply start new game after delay, without level up sound
      setTimeout(() => startGame(newLevel), 1000)
    } else {
      playSound(clickSoundRef)
    }
  }

  const reviewSequence = () => {
    setGameState('review')
    
    sequence.forEach((index, i) => {
      setTimeout(() => {
        const grid = document.getElementById(`grid-${index}`)
        if (grid) {
          grid.style.backgroundColor = '#3b82f6'
          grid.style.borderColor = '#2563eb'
          
          setTimeout(() => {
            grid.style.backgroundColor = ''
            grid.style.borderColor = ''
            
            if (i === sequence.length - 1) {
              // 回看完成后，可以选择返回结果页或重新开始
              setTimeout(() => {
                setGameState('result')
              }, 1000)
            }
          }, 500)
        }
      }, i * 600)
    })
  }

  // 重试当前关卡的函数
  const retryCurrentLevel = () => {
    const newSequence = generateSequence(level)
    setSequence(newSequence)
    setUserSequence([])
    setGameState('show')

    newSequence.forEach((index, i) => {
      setTimeout(() => {
        const grid = document.getElementById(`grid-${index}`)
        if (grid) {
          grid.style.backgroundColor = '#3b82f6'
          grid.style.borderColor = '#2563eb'
          
          setTimeout(() => {
            grid.style.backgroundColor = ''
            grid.style.borderColor = ''
            
            if (i === newSequence.length - 1) {
              setGameState('play')
            }
          }, 500)
        }
      }, i * 600)
    })
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
                "name": "What is a good Sequence Memory Test score?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "In the Sequence Memory Test, reaching levels 12-15 is considered good, while achieving levels 16-20 is excellent. Average users typically reach levels 8-11. Professional memory athletes and experienced users can achieve even higher levels."
                }
              },
              {
                "@type": "Question",
                "name": "How can I improve my sequence memory?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Regular practice with the Sequence Memory Test, developing pattern recognition strategies, and using visualization techniques can improve your performance. Consistent practice combined with proper rest enhances sequence memory capacity."
                }
              },
              {
                "@type": "Question",
                "name": "What factors affect Sequence Memory Test performance?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Concentration level, pattern recognition ability, processing speed, and fatigue affect Sequence Memory Test results. Environmental conditions and overall cognitive state also significantly impact performance."
                }
              },
              {
                "@type": "Question",
                "name": "How often should I practice sequence memory?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "For optimal improvement, practice the Sequence Memory Test for 10-15 minutes daily. Short, focused practice sessions are more effective than longer, irregular sessions. Consistent practice helps develop stronger memory skills."
                }
              },
              {
                "@type": "Question",
                "name": "Why is sequence memory important?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Sequence memory is crucial for learning patterns, remembering procedures, and developing problem-solving skills. Strong sequence memory enhances performance in various activities, from music and sports to mathematics and programming."
                }
              }
            ]
          })
        }}
      />

      <div className="w-full mx-auto py-0 space-y-16">
        <div className="banner w-full h-[550px] flex flex-col justify-center items-center bg-blue-theme text-white">
          {!isGameStarted && (
            <div className="flex flex-col justify-center items-center relative">
              <i className="fas fa-bolt text-9xl text-white mb-8 animate-fade"></i>
              <h1 className="text-4xl font-bold text-center mb-4 text-white">{t("h2")}</h1>
              <p className="text-lg text-center mb-20 text-white">{t("description")}</p>
              
              {/* 修改后的tutorial overlay */}
              {showTutorial && (
                <div className="absolute inset-0 flex items-center justify-center z-10">
                  <div className="backdrop-blur-sm bg-black/30 absolute inset-0" 
                       onClick={() => setShowTutorial(false)} />
                  <div className="relative bg-white/90 dark:bg-gray-800/90 p-6 rounded-xl shadow-xl max-w-md mx-4">
                    <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
                      {t("tutorial.howToPlay")}
                    </h3>
                    <ol className="list-decimal list-inside space-y-2 text-gray-700 dark:text-gray-300">
                      <li className="flex items-center gap-2">
                        <span className="text-blue-500">
                          <i className="fas fa-eye w-6"></i>
                        </span>
                        {t("tutorial.step1")}
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="text-purple-500">
                          <i className="fas fa-brain w-6"></i>
                        </span>
                        {t("tutorial.step2")}
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="text-green-500">
                          <i className="fas fa-mouse-pointer w-6"></i>
                        </span>
                        {t("tutorial.step3")}
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="text-yellow-500">
                          <i className="fas fa-level-up-alt w-6"></i>
                        </span>
                        {t("tutorial.step4")}
                      </li>
                    </ol>
                    <button 
                      onClick={() => setShowTutorial(false)}
                      className="mt-6 w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center justify-center gap-2"
                    >
                      <i className="fas fa-check"></i>
                      {t("tutorial.gotIt")}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
          
          <div className="w-full max-w-md text-center">
        {gameState === 'start' && (
          <div className="flex gap-4 justify-center items-center">
            <Button 
              onClick={() => startGame(1)} 
              className="bg-blue-600 text-white px-6 py-3 rounded-lg shadow-md hover:bg-blue-700 transition-colors"
            >
              {t("clickToStart")}
            </Button>
            
          </div>
        )}

        {gameState === 'result' && (
          <div className='text-white'>
             <i className="fas fa-bolt text-9xl text-white mb-8 animate-fade"></i>
            <h2 className="text-2xl font-bold mb-4">{t("sequenceMemory")}</h2>
            <p className="text-7xl mb-6">Level <span className="font-bold">{level}</span></p>
            <div className="flex justify-center space-x-4">
              <button 
                onClick={() => {
                  setScore(0)
                  setLevel(1)
                  startGame(1)
                }} 
                className="px-6 py-3 rounded-lg shadow-md bg-green-500 text-white hover:bg-green-700 transition-colors"
              >
                {t("restart")}
              </button>
              <button 
                onClick={retryCurrentLevel}
                className="px-6 py-3 rounded-lg shadow-md bg-blue-500 text-white hover:bg-blue-700 transition-colors"
              >
                {t("retryLevel")}
              </button>
              <button 
                onClick={reviewSequence}
                className="px-6 py-3 rounded-lg shadow-md bg-purple-500 text-white hover:bg-purple-700 transition-colors"
              >
                {t("review")}
              </button>
            </div>
          </div>
        )}

        {(gameState === 'show' || gameState === 'play' || gameState === 'review') && (
          <div>
            {/* 添加帮助按钮 */}
            <button
              onClick={() => setShowTutorial(true)}
              className="absolute top-4 left-4 w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 
                 flex items-center justify-center transition-all duration-200 
                 text-white border border-white/30 hover:border-white/50"
              title={t("tutorial.help")}
            >
              <i className="fas fa-question-circle text-xl"></i>
            </button>

            {/* Add sound control button next to help button */}
            <div className="fixed top-[calc(65px+1rem)] left-4 z-[100]">
              <div className="flex items-center bg-white/10 backdrop-blur-sm rounded-full border border-white/20 p-1">
                <button
                  onClick={() => setShowTutorial(true)}
                  className="w-8 h-8 rounded-full hover:bg-white/20 
                           flex items-center justify-center transition-all duration-200 
                           text-white"
                  title={t("tutorial.help")}
                >
                  <i className="fas fa-question-circle text-lg"></i>
                </button>
                
                <div className="w-[1px] h-4 bg-white/20 mx-1"></div>

                <button
                  onClick={toggleSound}
                  className="w-8 h-8 rounded-full hover:bg-white/20
                           flex items-center justify-center transition-all duration-200 
                           text-white"
                  title={isSoundEnabled ? t("sound.disable") : t("sound.enable")}
                >
                  <i className={`fas ${isSoundEnabled ? 'fa-volume-up' : 'fa-volume-mute'} text-lg`}></i>
                </button>

                <div className="w-[1px] h-4 bg-white/20 mx-1"></div>

                <button
                  onClick={retryCurrentLevel}
                  className={`w-8 h-8 rounded-full hover:bg-white/20
                           flex items-center justify-center transition-all duration-200 
                           text-white ${(!isGameStarted) ? 'opacity-50 cursor-not-allowed' : ''}`}
                  disabled={!isGameStarted}
                  title={t("retry")}
                >
                  <i className="fas fa-redo-alt text-lg"></i>
                </button>
              </div>
            </div>

            <div className="mb-4 font-bold text-white">
              <div className="flex items-center justify-between mb-2">
                <span className="text-3xl">Level: {level}</span>
                <span className="text-xl">Best: {bestScore}</span>
              </div>
              
              {/* Add progress indicator */}
              <div className="w-full bg-gray-200 rounded-full h-2.5 mb-4">
                <div 
                  className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
                  style={{ 
                    width: `${(userSequence.length / sequence.length) * 100}%`,
                    display: gameState === 'play' ? 'block' : 'none'
                  }}
                ></div>
              </div>
              
              {gameState === 'show' && (
                <div className="text-sm animate-pulse">
                  Watch carefully...
                </div>
              )}
              {gameState === 'play' && (
                <div className="text-sm">
                  Your turn! ({userSequence.length}/{sequence.length})
                </div>
              )}
            </div>

            {/* 移动 Tutorial Overlay 到外层，使其覆盖整个游戏区域 */}
            {showTutorial && (
              <div className="fixed inset-0 flex items-center justify-center z-50">
                <div 
                  className="backdrop-blur-sm bg-black/30 absolute inset-0" 
                  onClick={() => setShowTutorial(false)} 
                />
                <div className="relative bg-white/90 dark:bg-gray-800/90 p-6 rounded-xl shadow-xl max-w-md mx-4 animate-fade-in">
                  <button 
                    onClick={() => setShowTutorial(false)}
                    className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                  >
                    <i className="fas fa-times text-xl"></i>
                  </button>
                  
                  <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white flex items-center gap-2">
                    <i className="fas fa-lightbulb text-yellow-500"></i>
                    {t("tutorial.howToPlay")}
                  </h3>
                  
                  <ol className="list-decimal list-inside space-y-3 text-gray-700 dark:text-gray-300">
                    <li className="flex items-center gap-2 p-2 rounded-lg hover:bg-black/5">
                      <span className="text-blue-500">
                        <i className="fas fa-eye w-6"></i>
                      </span>
                      {t("tutorial.step1")}
                    </li>
                    <li className="flex items-center gap-2 p-2 rounded-lg hover:bg-black/5">
                      <span className="text-purple-500">
                        <i className="fas fa-brain w-6"></i>
                      </span>
                      {t("tutorial.step2")}
                    </li>
                    <li className="flex items-center gap-2 p-2 rounded-lg hover:bg-black/5">
                      <span className="text-green-500">
                        <i className="fas fa-mouse-pointer w-6"></i>
                      </span>
                      {t("tutorial.step3")}
                    </li>
                    <li className="flex items-center gap-2 p-2 rounded-lg hover:bg-black/5">
                      <span className="text-yellow-500">
                        <i className="fas fa-level-up-alt w-6"></i>
                      </span>
                      {t("tutorial.step4")}
                    </li>
                  </ol>

                  <div className="mt-6 flex justify-end">
                    <button 
                      onClick={() => setShowTutorial(false)}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 
                         transition-colors duration-200 flex items-center gap-2"
                    >
                      <i className="fas fa-check"></i>
                      {t("tutorial.gotIt")}
                    </button>
                  </div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-3 gap-3 rounded-xl shadow-lg p-4">
              {Array.from({ length: GRID_SIZE }).map((_, index) => (
                <div
                  key={index}
                  id={`grid-${index}`}
                  className={`aspect-square rounded-lg cursor-pointer transition-all duration-200 ease-in-out border-2 ${COLORS.default}`}
                  onClick={() => gameState === 'play' ? handleGridClick(index) : null}
                />
              ))}
            </div>
          </div>
        )}
      </div>

        </div>
     
        <div className="container mx-auto py-0 space-y-16">

          {/* 静态内容 */}
          <div dangerouslySetInnerHTML={{ __html: staticContent }} />

          {/* SEO Content Section */}
          <section className="max-w-4xl mx-auto px-4 py-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Understanding the Sequence Memory Test
            </h2>
            
            <div className="prose prose-blue max-w-none">
              <p className="text-gray-700 leading-relaxed mb-4">
                The Sequence Memory Test is an advanced cognitive assessment tool designed to measure your ability to remember and reproduce sequential patterns. This comprehensive test evaluates how well you can recall increasingly complex sequences of visual information. The Sequence Memory Test provides valuable insights into your working memory capacity and pattern recognition abilities.
              </p>
              
              <p className="text-gray-700 leading-relaxed mb-4">
                During the Sequence Memory Test, participants observe and replicate progressively longer sequences of illuminated squares. The Sequence Memory Test increases in difficulty as users successfully complete each level, challenging their ability to maintain and recall longer patterns. Each session provides immediate feedback on performance accuracy.
              </p>
              
              <p className="text-gray-700 leading-relaxed mb-4">
                Regular practice with the Sequence Memory Test can significantly enhance your sequential memory and pattern recognition capabilities. Many professionals and students use the Sequence Memory Test to improve their cognitive abilities and performance in tasks requiring sequential processing. The test's adaptive difficulty ensures consistent challenge and growth.
              </p>
              
              <p className="text-gray-700 leading-relaxed">
                Whether you're a student developing learning skills or a professional seeking to enhance cognitive abilities, the Sequence Memory Test offers a scientific approach to memory improvement. The test's design focuses on both accuracy and complexity, making it an effective tool for comprehensive memory development.
              </p>
            </div>
          </section>

          {/* FAQ Section */}
          <section className="max-w-4xl mx-auto px-4 py-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              FAQ About Sequence Memory Test
            </h2>
            
            <div className="space-y-6">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  What is a good Sequence Memory Test score?
                </h3>
                <p className="text-gray-700">
                  In the Sequence Memory Test, reaching levels 12-15 is considered good, while achieving levels 16-20 is excellent. Average users typically reach levels 8-11. Professional memory athletes and experienced users can achieve even higher levels.
                </p>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  How can I improve my sequence memory?
                </h3>
                <p className="text-gray-700">
                  Regular practice with the Sequence Memory Test, developing pattern recognition strategies, and using visualization techniques can improve your performance. Consistent practice combined with proper rest enhances sequence memory capacity.
                </p>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  What factors affect Sequence Memory Test performance?
                </h3>
                <p className="text-gray-700">
                  Concentration level, pattern recognition ability, processing speed, and fatigue affect Sequence Memory Test results. Environmental conditions and overall cognitive state also significantly impact performance.
                </p>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  How often should I practice sequence memory?
                </h3>
                <p className="text-gray-700">
                  For optimal improvement, practice the Sequence Memory Test for 10-15 minutes daily. Short, focused practice sessions are more effective than longer, irregular sessions. Consistent practice helps develop stronger memory skills.
                </p>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Why is sequence memory important?
                </h3>
                <p className="text-gray-700">
                  Sequence memory is crucial for learning patterns, remembering procedures, and developing problem-solving skills. Strong sequence memory enhances performance in various activities, from music and sports to mathematics and programming.
                </p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </>
  )
} 