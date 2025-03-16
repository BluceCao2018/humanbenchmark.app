'use client'
import React, { useState, useEffect, useRef } from 'react'
import '@fortawesome/fontawesome-free/css/all.min.css';
import { useTranslations } from 'use-intl';
import staticContent from '../alltoolslist.html'

export default function AimTrainerTest() {
  const [gameState, setGameState] = useState<'start' | 'playing' | 'result'>('start')
  const [targetPosition, setTargetPosition] = useState<{ x: number, y: number } | null>(null)
  const [stats, setStats] = useState({
    totalClicks: 0,
    correctClicks: 0,
    reactionTimes: [] as number[]
  })

  const [remainingCount, setRemainingCount] =useState(30)
  const [lastClickTime, setLastClickTime] = useState(0)
  const [showTutorial, setShowTutorial] = useState(true)
  const [isSoundEnabled, setIsSoundEnabled] = useState(true)
  
  // Audio refs
  const hitSoundRef = useRef<HTMLAudioElement | null>(null)
  const missSoundRef = useRef<HTMLAudioElement | null>(null)

  const t = useTranslations('aim');
  

  const startGame = () => {
    setGameState('playing')
    setStats({ totalClicks: 0, correctClicks: 0, reactionTimes: [] })
    setRemainingCount(30)
    setLastClickTime(performance.now())
    generateTarget()
  }

  const generateTarget = () => {
    const bannerHeight = 550; // banner 的高度
    const navHeight = 65; // 假设导航区域的高度为 60 像素
    const bannerWidth = window.innerWidth; // banner 的宽度

    const x = Math.random() * (bannerWidth - 100); // 100 是图标的宽度
    const y = Math.random() * (bannerHeight - navHeight - 100); // 100 是图标的高度
    console.log('Target generated at:', { x, y: y + navHeight })
    setTargetPosition({ x, y: y + navHeight })
  }

  // Initialize audio elements
  useEffect(() => {
    // Load sound preference from localStorage
    const soundPreference = localStorage.getItem('aimTrainerSoundEnabled')
    setIsSoundEnabled(soundPreference !== 'false')

    // Initialize audio elements
    hitSoundRef.current = new Audio('/sounds/hit.mp3')
    missSoundRef.current = new Audio('/sounds/miss.mp3')

    // Set volume
    const audioElements = [hitSoundRef, missSoundRef]
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
    localStorage.setItem('aimTrainerSoundEnabled', newState.toString())
  }

  const handleTargetClick = (e: React.MouseEvent) => {
    console.log('Click event triggered')
    
    e.preventDefault()
    e.stopPropagation()

    if (gameState !== 'playing' || !targetPosition) {
      console.log('Invalid game state or no target')
      return
    }

    const { clientX, clientY } = e
    const targetRect = e.currentTarget.getBoundingClientRect()
    
    console.log('Click coordinates:', { clientX, clientY })
    console.log('Target rect:', targetRect)
    console.log('Target position:', targetPosition)

    const isHit = 
      clientX >= targetRect.left && 
      clientX <= targetRect.right && 
      clientY >= targetRect.top && 
      clientY <= targetRect.bottom

    console.log('Is hit:', isHit)

    const updatedStats = { 
      ...stats, 
      totalClicks: stats.totalClicks + 1 
    }

    if (isHit) {
      playSound(hitSoundRef) // Play hit sound
      const currentTime = performance.now()
      const reactionTime = currentTime - lastClickTime
      updatedStats.correctClicks += 1
      updatedStats.reactionTimes.push(reactionTime)
      setLastClickTime(currentTime)
      
      if (remainingCount > 0) {
        setRemainingCount(remainingCount - 1)
      }
      generateTarget()
    } else {
      playSound(missSoundRef) // Play miss sound
    }

    setStats(updatedStats)

    if (updatedStats.totalClicks >= 30) {
      endGame()
    }
  }

  const endGame = () => {
    setGameState('result')
  }

  const calculateAverageReactionTime = () => {
    const { reactionTimes } = stats
    return reactionTimes.length 
      ? (reactionTimes.reduce((a, b) => a + b, 0) / reactionTimes.length).toFixed(2)
      : '0'
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
                "name": "What is a good Aim Trainer score?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "In Aim Trainer tests, hitting targets within 250-300ms is considered good. Professional gamers often achieve times under 200ms, while average users typically score between 300-400ms per target."
                }
              },
              {
                "@type": "Question",
                "name": "How can I improve my Aim Trainer performance?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Regular practice with the Aim Trainer, maintaining consistent mouse sensitivity, proper posture, and focused training sessions can improve your performance. Many users see improvements with 15-20 minutes of daily practice."
                }
              },
              {
                "@type": "Question",
                "name": "What factors affect Aim Trainer results?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Mouse sensitivity, screen resolution, hand-eye coordination, and physical fatigue all affect Aim Trainer performance. Your setup, including mouse quality and desk ergonomics, also plays a crucial role."
                }
              },
              {
                "@type": "Question",
                "name": "How often should I use the Aim Trainer?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "For optimal results, use the Aim Trainer for 15-20 minutes daily. Consistent, shorter practice sessions are more effective than longer, irregular training periods."
                }
              },
              {
                "@type": "Question",
                "name": "Why is Aim Trainer important for gaming?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "The Aim Trainer is essential for developing precise mouse control, improving reaction times, and building muscle memory. It's particularly valuable for FPS games where accurate targeting is crucial."
                }
              }
            ]
          })
        }}
      />

      {/* Add help button and tutorial overlay */}
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

      {/* Tutorial Overlay */}
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
              <i className="fas fa-bullseye text-red-500"></i>
              {t("tutorial.howToPlay")}
            </h3>
            
            <ol className="list-decimal list-inside space-y-3 text-gray-700 dark:text-gray-300">
              <li className="flex items-center gap-2 p-2 rounded-lg hover:bg-black/5">
                <span className="text-blue-500">
                  <i className="fas fa-mouse-pointer w-6"></i>
                </span>
                {t("tutorial.step1")} {/* 点击出现的目标 */}
              </li>
              <li className="flex items-center gap-2 p-2 rounded-lg hover:bg-black/5">
                <span className="text-red-500">
                  <i className="fas fa-tachometer-alt w-6"></i>
                </span>
                {t("tutorial.step2")} {/* 越快点击越好 */}
              </li>
              <li className="flex items-center gap-2 p-2 rounded-lg hover:bg-black/5">
                <span className="text-green-500">
                  <i className="fas fa-bullseye w-6"></i>
                </span>
                {t("tutorial.step3")} {/* 目标会随机出现在屏幕上 */}
              </li>
              <li className="flex items-center gap-2 p-2 rounded-lg hover:bg-black/5">
                <span className="text-yellow-500">
                  <i className="fas fa-trophy w-6"></i>
                </span>
                {t("tutorial.step4")} {/* 完成30次点击后显示平均反应时间 */}
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

      <div className="w-full mx-auto py-0 space-y-16">
        <div className="banner w-full h-[550px] flex flex-col justify-center items-center bg-blue-theme">
         
          {gameState === 'start' && (
            <div className='flex flex-col justify-center items-center'>
              <i className="fas fa-bullseye text-9xl text-white mb-8 animate-fade cursor-pointer" onClick={startGame} ></i>
              <h1 className="text-4xl font-bold text-center mb-4 text-white">{t("h2")}</h1>
              <p className="text-lg text-center mb-20 text-white" dangerouslySetInnerHTML={{ __html: t("description")?.replace(/\n/g, '<br />')  || ''}} ></p>
            </div>
            )}

          {gameState === 'playing' && targetPosition && (
            <div className='flex flex-col justify-center items-center text-white'>
              {/* 添加顶部状态栏 */}
              <div className="fixed top-[calc(65px+4rem)] left-1/2 transform -translate-x-1/2 w-96 flex flex-col items-center gap-3">
                {/* 进度条 */}
                <div className="w-full bg-white/20 rounded-full h-2">
                  <div 
                    className="bg-white h-2 rounded-full transition-all duration-300"
                    style={{ width: `${((30 - remainingCount) / 30) * 100}%` }}
                  />
                </div>
                
                {/* 统计信息 */}
                <div className="flex justify-between w-full text-sm">
                  <div className="flex items-center gap-2">
                    <i className="fas fa-crosshairs"></i>
                    <span>{30 - remainingCount}/30</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <i className="fas fa-stopwatch"></i>
                    <span>
                      {stats.reactionTimes.length > 0 
                        ? `${stats.reactionTimes[stats.reactionTimes.length - 1].toFixed(0)}ms` 
                        : '---'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <i className="fas fa-percentage"></i>
                    <span>{((stats.correctClicks / Math.max(stats.totalClicks, 1)) * 100).toFixed(1)}%</span>
                  </div>
                </div>
              </div>

              {/* 目标 - 添加动画效果 */}
              <div 
                onClick={handleTargetClick}
                className='animate-pop-in'
                style={{
                  position: 'absolute', 
                  left: `${targetPosition.x}px`, 
                  top: `${targetPosition.y}px`, 
                  width: '100px', 
                  height: '100px', 
                  cursor: 'pointer',
                  zIndex: 1000
                }}
              >
                <i className="fas fa-bullseye text-white" style={{ fontSize: '100px' }}></i>
              </div>
            </div>
          )}

          {gameState === 'result' && (
            <div className="text-center text-white">
              <i className="fas fa-bullseye text-9xl text-white mb-8 animate-fade"></i>
              
              {/* 统计卡片网格 */}
              <div className="grid grid-cols-2 gap-4 max-w-xl mx-auto mb-8">
                {/* 平均反应时间 */}
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                  <div className="text-xl mb-2">
                    <i className="fas fa-clock mr-2"></i>
                    {t("stats.avgTime")}
                  </div>
                  <div className="text-4xl font-bold">
                    {calculateAverageReactionTime()}
                    <span className="text-2xl">ms</span>
                  </div>
                </div>

                {/* 准确率 */}
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                  <div className="text-xl mb-2">
                    <i className="fas fa-bullseye mr-2"></i>
                    {t("stats.accuracy")}
                  </div>
                  <div className="text-4xl font-bold">
                    {((stats.correctClicks / stats.totalClicks) * 100).toFixed(1)}
                    <span className="text-2xl">%</span>
                  </div>
                </div>

                {/* 最佳时间 */}
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                  <div className="text-xl mb-2">
                    <i className="fas fa-trophy mr-2"></i>
                    {t("stats.bestTime")}
                  </div>
                  <div className="text-4xl font-bold">
                    {Math.min(...stats.reactionTimes).toFixed(0)}
                    <span className="text-2xl">ms</span>
                  </div>
                </div>

                {/* 总点击数 */}
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                  <div className="text-xl mb-2">
                    <i className="fas fa-mouse-pointer mr-2"></i>
                    {t("stats.totalClicks")}
                  </div>
                  <div className="text-4xl font-bold">
                    {stats.totalClicks}
                  </div>
                </div>
              </div>

              {/* 操作按钮 */}
              <div className="flex justify-center gap-4">
                <button 
                  onClick={() => startGame()}
                  className="px-6 py-3 bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                >
                  <i className="fas fa-redo"></i>
                  {t("tryAgain")}
                </button>
                <button 
                  onClick={() => setGameState('start')}
                  className="px-6 py-3 bg-white/20 backdrop-blur-sm rounded-lg hover:bg-white/30 transition-colors flex items-center gap-2"
                >
                  <i className="fas fa-home"></i>
                  {t("backToStart")}
                </button>
              </div>
            </div>
          )}
          </div>
       
        

  <div className="container mx-auto py-0 space-y-16">
            {/* 静态内容 */}
        <div dangerouslySetInnerHTML={{ __html: staticContent }} />
        
        {/* SEO Content Section */}
        <section className="max-w-4xl mx-auto px-4 py-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Understanding the Aim Trainer
          </h2>
          
          <div className="prose prose-blue max-w-none">
            <p className="text-gray-700 leading-relaxed mb-4">
              The Aim Trainer is a sophisticated tool designed to enhance your mouse accuracy and targeting precision. This comprehensive training system helps gamers and professionals develop superior hand-eye coordination through targeted exercises. Our Aim Trainer provides detailed performance metrics, allowing users to track their progress and identify areas for improvement.
            </p>
            
            <p className="text-gray-700 leading-relaxed mb-4">
              When using the Aim Trainer, users engage with randomly appearing targets that challenge their reflexes and precision. The Aim Trainer measures various aspects of performance, including target acquisition speed, click accuracy, and movement consistency. Each session with the Aim Trainer provides valuable data to help users understand their targeting capabilities.
            </p>
            
            <p className="text-gray-700 leading-relaxed mb-4">
              Professional esports players regularly incorporate the Aim Trainer into their practice routines. The Aim Trainer's effectiveness in improving mouse control makes it an essential tool for competitive gamers. Through consistent practice with the Aim Trainer, users can develop the muscle memory and precision needed for high-level gaming performance.
            </p>
            
            <p className="text-gray-700 leading-relaxed">
              Whether you're a competitive gamer seeking to enhance your skills or someone looking to improve their mouse accuracy, the Aim Trainer offers a scientific approach to developing targeting abilities. The Aim Trainer's design focuses on both speed and accuracy, making it an effective tool for comprehensive mouse control training.
            </p>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="max-w-4xl mx-auto px-4 py-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            FAQ About Aim Trainer
          </h2>
          
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                What is a good Aim Trainer score?
              </h3>
              <p className="text-gray-700">
                In Aim Trainer tests, hitting targets within 250-300ms is considered good. Professional gamers often achieve times under 200ms, while average users typically score between 300-400ms per target.
              </p>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                How can I improve my Aim Trainer performance?
              </h3>
              <p className="text-gray-700">
                Regular practice with the Aim Trainer, maintaining consistent mouse sensitivity, proper posture, and focused training sessions can improve your performance. Many users see improvements with 15-20 minutes of daily practice.
              </p>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                What factors affect Aim Trainer results?
              </h3>
              <p className="text-gray-700">
                Mouse sensitivity, screen resolution, hand-eye coordination, and physical fatigue all affect Aim Trainer performance. Your setup, including mouse quality and desk ergonomics, also plays a crucial role.
              </p>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                How often should I use the Aim Trainer?
              </h3>
              <p className="text-gray-700">
                For optimal results, use the Aim Trainer for 15-20 minutes daily. Consistent, shorter practice sessions are more effective than longer, irregular training periods.
              </p>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Why is Aim Trainer important for gaming?
              </h3>
              <p className="text-gray-700">
                The Aim Trainer is essential for developing precise mouse control, improving reaction times, and building muscle memory. It's particularly valuable for FPS games where accurate targeting is crucial.
              </p>
            </div>
          </div>
        </section>

        
      </div>
    </div>
    </>
  )
}
