'use client'
import React, { useState, useEffect, useRef } from 'react'
import { useTranslations } from 'next-intl'
import '@fortawesome/fontawesome-free/css/all.min.css';
import Image from 'next/image'
import { useSearchParams } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Copy } from 'lucide-react'
import { EmbedDialog } from '@/components/EmbedDialog'
import staticContent from '../alltoolslist.html'

export default function ChimpTest() {
  const [gameState, setGameState] = useState<'start' | 'show' | 'play' | 'playing' | 'result'>('start')
  const [gridSize, setGridSize] = useState(3)
  const [sequence, setSequence] = useState<number[]>([])
  const [selectedNumbers, setSelectedNumbers] = useState<number[]>([])
  const [currentTarget, setCurrentTarget] = useState(4)
  const [level, setLevel] = useState(1)
  const [showTutorial, setShowTutorial] = useState(true)
  const [isSoundEnabled, setIsSoundEnabled] = useState(true)

  const t =  useTranslations('climp');
  const te = useTranslations('embed');
  
  const searchParams = useSearchParams();
  const isIframe = searchParams.get('embed') === 'true';
  const [showEmbedDialog, setShowEmbedDialog] = useState(false);
  const [embedUrl, setEmbedUrl] = useState('');

  // Add sound refs
  const correctSoundRef = useRef<HTMLAudioElement | null>(null)
  const wrongSoundRef = useRef<HTMLAudioElement | null>(null)

  // Initialize audio
  useEffect(() => {
    const soundPreference = localStorage.getItem('chimpTestSoundEnabled')
    setIsSoundEnabled(soundPreference !== 'false')

    correctSoundRef.current = new Audio('/sounds/correct.mp3')
    wrongSoundRef.current = new Audio('/sounds/wrong.mp3')

    const audioElements = [correctSoundRef, wrongSoundRef]
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
    localStorage.setItem('chimpTestSoundEnabled', newState.toString())
  }

  const generateSequence = (gridSize:number,currentTarget:number) => {
    const totalCells = gridSize * gridSize
    const positions = new Array(totalCells).fill(null)  // 初始化所有格子为null
    
    // 随机放置数字
    for (let i = 1; i <= currentTarget; i++) {
      let pos
      do {
        pos = Math.floor(Math.random() * totalCells)
      } while (positions[pos] !== null)  // 确保位置未被使用
      positions[pos] = i
    }
    
    return positions
  }

  const startGame = () => {
    const newSequence = generateSequence(3,4)
    setSequence(newSequence)
    setSelectedNumbers([])
    setCurrentTarget(4)
    setGameState('show')

    // 显示数字后隐藏
    // setTimeout(() => {
    //   setGameState('play')
    // }, 2000)
  }

  const getGridSizeForLevel = (level: number) => {
    if (level === 1) return 3
    if (level === 2) return 4
    if (level >= 3 && level <= 5) return 6
    if (level >= 6 && level <= 10) return 7
    if (level >= 11 && level <= 20) return 8
    if (level >= 21 && level <= 30) return 9
    return 10 // 31-100关
  }

  const handleClick = (number: number | null) => {
    if (!number) return
    const newSelectedNumbers = [...selectedNumbers, number]
    const expectedNumber = selectedNumbers.length + 1

    if (number === expectedNumber) {
      playSound(correctSoundRef) // 正确时播放音效
      setSelectedNumbers(newSelectedNumbers)
      setGameState('playing')
      
      if (newSelectedNumbers.length === currentTarget) {
        const nextLevel = level + 1
        const nextCurrentTarget = currentTarget + 1
        setLevel(nextLevel)
        setCurrentTarget(nextCurrentTarget)
        const newGridSize = getGridSizeForLevel(nextLevel)
        setGridSize(newGridSize)
        setSelectedNumbers([])
        setSequence(generateSequence(newGridSize, nextCurrentTarget))
        setGameState('show')
      }
    } else {
      playSound(wrongSoundRef) // 错误时播放音效
      setGameState('result')
    }
  }

  console.log('gameState:', gameState)
  console.log('sequence:', sequence)

  useEffect(() => {
    if (gameState === 'start') {
      // 显示数字一段时间后开始游戏
      setTimeout(() => {
        setGameState('play')
      }, 3000)
    }
  }, [gameState])

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
            level,
            gridSize,
            currentTarget,
            accuracy: ((selectedNumbers.length / currentTarget) * 100).toFixed(1)
          }
        }, '*')
      }

      return () => {
        observer.disconnect()
      }
    }
  }, [isIframe, gameState, level, gridSize, currentTarget, selectedNumbers])

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
                "name": "What is a good Chimp Test score?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "In the Chimp Test, successfully completing levels 7-9 is considered good, while reaching levels 10-12 is excellent. Average users typically achieve levels 5-7. The test is based on research showing chimpanzees can often outperform humans in this type of memory task."
                }
              },
              {
                "@type": "Question",
                "name": "How can I improve my Chimp Test performance?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Regular practice with the Chimp Test, developing quick scanning techniques, and improving spatial memory through pattern recognition can enhance your performance. Focused practice and proper rest between sessions help optimize learning."
                }
              },
              {
                "@type": "Question",
                "name": "What factors affect Chimp Test results?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Processing speed, visual attention span, short-term memory capacity, and stress levels affect Chimp Test performance. Environmental factors and overall cognitive alertness also play significant roles in test results."
                }
              },
              {
                "@type": "Question",
                "name": "How often should I practice the Chimp Test?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "For optimal improvement, practice the Chimp Test for 10-15 minutes daily. Short, focused practice sessions are more effective than longer, irregular sessions. Regular practice helps develop better visual processing skills."
                }
              },
              {
                "@type": "Question",
                "name": "Why is the Chimp Test important?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "The Chimp Test helps develop working memory, visual processing speed, and cognitive flexibility. These skills are crucial for many daily tasks and professional activities requiring quick visual processing and decision-making."
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
              <i className="fas fa-brain text-9xl text-white mb-8 animate-fade cursor-pointer" ></i>
              <h1 className="text-3xl font-bold mb-6 text-center"  dangerouslySetInnerHTML={{ __html: t("h2")?.replace(/\n/g, '<br />')  || ''}} ></h1>
              <p className="text-lg text-center mb-20 text-white" dangerouslySetInnerHTML={{ __html: t("description")?.replace(/\n/g, '<br />')  || ''}} ></p>
              
              <div className="flex gap-4 justify-center items-center">
              <Button 
                onClick={startGame} 
                className="bg-blue-600 text-white px-6 py-3 rounded-lg shadow-md hover:bg-blue-700 transition-colors"
              >
                {t("start")}
              </Button>
              </div>
            </div>
          )}

          {(gameState === 'show' || gameState === 'play') && (
            <div className="grid gap-2 w-full max-w-md" style={{ gridTemplateColumns: `repeat(${gridSize}, 1fr)` }}>
              {Array.from({length: gridSize * gridSize}).map((_, index) => {
                const number = sequence[index]
                const isInSequence = number !== null
                const isSelected = selectedNumbers.includes(number)

                return (
                  <button
                    key={index}
                    onClick={() => handleClick(number)}
                    className={`
                      w-16 h-16  text-2xl font-bold
                      ${isInSequence ? 'bg-blue-500 text-white border rounded-lg' : ''}
                    `}
                  >
                    {isInSequence ? number : ''}
                  </button>
                )
              })}
            </div>
          )}

  {(gameState === 'playing') && (
            <div className="grid gap-2 w-full max-w-md" style={{ gridTemplateColumns: `repeat(${gridSize}, 1fr)` }}>
              {Array.from({length: gridSize * gridSize}).map((_, index) => {
                const number = sequence[index]
                const isInSequence = number !== null
                const isSelected = selectedNumbers.includes(number)

                return (
                  <button
                    key={index}
                    onClick={() => handleClick(number)}
                    className={`
                      w-16 h-16  text-2xl font-bold
                      ${isInSequence && !isSelected ? 'bg-white text-white border rounded-lg' : ''}
                      ${isInSequence && isSelected ? '' : ''}
                    `}
                  >
                    {/* {isInSequence && !isSelected ? number : ''} */}
                  </button>
                )
              })}
            </div>
          )}

          {gameState === 'result' && (
            <div className="text-center text-white">
              <i className="fas fa-brain text-9xl text-white mb-8 animate-fade"></i>
              
              {/* 统计卡片网格 */}
              <div className="grid grid-cols-2 gap-4 max-w-xl mx-auto mb-8">
                {/* 当前等级 */}
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                  <div className="text-xl mb-2">
                    <i className="fas fa-layer-group mr-2"></i>
                    {t("stats.level")}
                  </div>
                  <div className="text-4xl font-bold">
                    {level}
                  </div>
                </div>

                {/* 网格大小 */}
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                  <div className="text-xl mb-2">
                    <i className="fas fa-th mr-2"></i>
                    {t("stats.gridSize")}
                  </div>
                  <div className="text-4xl font-bold">
                    {gridSize}x{gridSize}
                  </div>
                </div>

                {/* 数字数量 */}
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                  <div className="text-xl mb-2">
                    <i className="fas fa-hashtag mr-2"></i>
                    {t("stats.numbers")}
                  </div>
                  <div className="text-4xl font-bold">
                    {currentTarget}
                  </div>
                </div>

                {/* 准确率 */}
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                  <div className="text-xl mb-2">
                    <i className="fas fa-bullseye mr-2"></i>
                    {t("stats.accuracy")}
                  </div>
                  <div className="text-4xl font-bold">
                    {((selectedNumbers.length / currentTarget) * 100).toFixed(1)}%
                  </div>
                </div>
              </div>

              {/* 操作按钮 */}
              <div className="flex justify-center gap-4">
                <button 
                  onClick={() => {
                    setGameState('start')
                    setGridSize(3)
                    setLevel(1)
                    setCurrentTarget(4)
                    setSelectedNumbers([])
                    setSequence(generateSequence(3,4))
                  }}
                  className="px-6 py-3 bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                >
                  <i className="fas fa-redo"></i>
                  {t("tryAgain")}
                </button>
              </div>
            </div>
          )}
        </div>

  <div className="container mx-auto py-0 space-y-16 ">
 
  
  {/* 静态内容 */}
  <div dangerouslySetInnerHTML={{ __html: staticContent }} />

  {/* SEO Content Section */}
  <section className="max-w-4xl mx-auto px-4 py-8">
    <h2 className="text-2xl font-bold text-gray-900 mb-6">
      Understanding the Chimp Test
    </h2>
    
    <div className="prose prose-blue max-w-none">
      <p className="text-gray-700 leading-relaxed mb-4">
        The Chimp Test is a fascinating cognitive assessment tool inspired by groundbreaking research showing chimpanzees' remarkable working memory capabilities. This unique test challenges users to quickly memorize and recall the positions of numbers in a grid, testing both visual processing speed and short-term memory capacity. The Chimp Test provides valuable insights into human cognitive limitations and potential.
      </p>
      
      <p className="text-gray-700 leading-relaxed mb-4">
        During the Chimp Test, participants must memorize the locations of numbers displayed briefly on a grid before they are hidden. The Chimp Test increases in difficulty as users progress, requiring them to remember more numbers in more complex arrangements. Each session helps users understand their visual processing capabilities and memory limits.
      </p>
      
      <p className="text-gray-700 leading-relaxed mb-4">
        Regular practice with the Chimp Test can significantly enhance your visual processing speed and working memory capacity. Many professionals use the Chimp Test to improve their cognitive performance and decision-making abilities. The test's progressive nature ensures that users are consistently challenged at their skill level.
      </p>
      
      <p className="text-gray-700 leading-relaxed">
        Whether you're a student looking to enhance your cognitive abilities or a professional seeking to improve your visual processing skills, the Chimp Test offers a unique approach to memory training. The test's design focuses on both speed and accuracy, making it an effective tool for comprehensive cognitive development.
      </p>
    </div>
  </section>

  {/* FAQ Section */}
  <section className="max-w-4xl mx-auto px-4 py-8">
    <h2 className="text-2xl font-bold text-gray-900 mb-6">
      FAQ About Chimp Test
    </h2>
    
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          What is a good Chimp Test score?
        </h3>
        <p className="text-gray-700">
          In the Chimp Test, successfully completing levels 7-9 is considered good, while reaching levels 10-12 is excellent. Average users typically achieve levels 5-7. The test is based on research showing chimpanzees can often outperform humans in this type of memory task.
        </p>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          How can I improve my Chimp Test performance?
        </h3>
        <p className="text-gray-700">
          Regular practice with the Chimp Test, developing quick scanning techniques, and improving spatial memory through pattern recognition can enhance your performance. Focused practice and proper rest between sessions help optimize learning.
        </p>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          What factors affect Chimp Test results?
        </h3>
        <p className="text-gray-700">
          Processing speed, visual attention span, short-term memory capacity, and stress levels affect Chimp Test performance. Environmental factors and overall cognitive alertness also play significant roles in test results.
        </p>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          How often should I practice the Chimp Test?
        </h3>
        <p className="text-gray-700">
          For optimal improvement, practice the Chimp Test for 10-15 minutes daily. Short, focused practice sessions are more effective than longer, irregular sessions. Regular practice helps develop better visual processing skills.
        </p>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Why is the Chimp Test important?
        </h3>
        <p className="text-gray-700">
          The Chimp Test helps develop working memory, visual processing speed, and cognitive flexibility. These skills are crucial for many daily tasks and professional activities requiring quick visual processing and decision-making.
        </p>
      </div>
    </div>
  </section>

  </div>
  </div>

  {/* Add control buttons */}
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
    </div>
  </div>

  {/* Add tutorial overlay */}
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
          <i className="fas fa-brain text-blue-500"></i>
          {t("tutorial.howToPlay")}
        </h3>
        
        <ol className="list-decimal list-inside space-y-3 text-gray-700 dark:text-gray-300">
          <li className="flex items-center gap-2 p-2 rounded-lg hover:bg-black/5">
            <span className="text-blue-500">
              <i className="fas fa-eye w-6"></i>
            </span>
            {t("tutorial.step1")} {/* 记住数字的位置 */}
          </li>
          <li className="flex items-center gap-2 p-2 rounded-lg hover:bg-black/5">
            <span className="text-purple-500">
              <i className="fas fa-sort-numeric-up w-6"></i>
            </span>
            {t("tutorial.step2")} {/* 按顺序点击数字 */}
          </li>
          <li className="flex items-center gap-2 p-2 rounded-lg hover:bg-black/5">
            <span className="text-green-500">
              <i className="fas fa-expand w-6"></i>
            </span>
            {t("tutorial.step3")} {/* 随着等级提升，格子会变多 */}
          </li>
          <li className="flex items-center gap-2 p-2 rounded-lg hover:bg-black/5">
            <span className="text-yellow-500">
              <i className="fas fa-plus w-6"></i>
            </span>
            {t("tutorial.step4")} {/* 数字也会逐渐增加 */}
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
  </>
  )
} 