'use client'
import React, { useState, useEffect } from 'react'
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
      const currentTime = performance.now()
      const reactionTime = currentTime - lastClickTime
      updatedStats.correctClicks += 1
      updatedStats.reactionTimes.push(reactionTime)
      setLastClickTime(currentTime)
      
      if (remainingCount > 0) {
        setRemainingCount(remainingCount - 1)
      }
      generateTarget()
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
            <div 
              onClick={handleTargetClick}
              className='animate-fade'
              style={{
                position: 'absolute', 
                left: `${targetPosition.x}px`, 
                top: `${targetPosition.y}px`, 
                width: '100px', 
                height: '100px', 
                cursor: 'pointer',
                zIndex: 1000 // 确保在最上层
              }}
            >
              <i className="fas fa-bullseye text-white" style={{ fontSize: '100px' }}></i>
            </div>
            <h2 className="text-2xl font-bold mb-4">Remaining {remainingCount}</h2>
            </div>
          )}

          {gameState === 'result' && (
            <div className="text-center text-white">
              <i className="fas fa-bullseye text-9xl text-white mb-8 animate-fade cursor-pointer"></i>
              <h2 className="text-2xl font-bold mb-4">Average time per target</h2>
              <h1  className="text-5xl font-bold mb-4">{calculateAverageReactionTime()}ms</h1>
              <button 
                onClick={() => setGameState('start')}
                className="mt-4 bg-blue-600 text-white px-6 py-3 rounded-lg shadow-md hover:bg-blue-700 transition-colors"
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
