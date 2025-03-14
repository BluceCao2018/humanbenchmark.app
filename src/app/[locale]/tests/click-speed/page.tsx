'use client'
import React, { useState, useEffect } from 'react'
import staticContent from '../alltoolslist.html'

export default function ClickSpeedTest() {
  const [gameState, setGameState] = useState<'start' | 'playing' | 'result'>('start')
  const [clickCount, setClickCount] = useState(0)
  const [timeLeft, setTimeLeft] = useState(30)

  const startGame = () => {
    setClickCount(0)
    setGameState('playing')
    setTimeLeft(10)

    // 每秒减少时间
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer)
          endGame()
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }

  const endGame = () => {
    setGameState('result')
  }

  const handleClick = () => {
    if (gameState === 'playing') {
      setClickCount(prev => prev + 1)
    }
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
                "name": "What is a good Click Speed (CPS)?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "A good click speed ranges from 6-8 clicks per second (CPS). Professional gamers often achieve 8-12 CPS, while the average person clicks at 4-6 CPS. Some specialized techniques can reach up to 15 CPS."
                }
              },
              {
                "@type": "Question",
                "name": "How can I improve my Click Speed?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Regular practice, proper mouse grip technique, and finger exercises can improve click speed. Using different clicking methods like jitter clicking or butterfly clicking can also help achieve higher CPS."
                }
              },
              {
                "@type": "Question",
                "name": "What factors affect Click Speed?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Mouse type, clicking technique, hand position, finger strength, and practice level all affect click speed. Physical factors like fatigue and hand size can also impact performance."
                }
              },
              {
                "@type": "Question",
                "name": "Why is Click Speed important?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Click speed is crucial for gaming performance, especially in genres like MOBAs and FPS. It can also improve productivity in tasks requiring rapid mouse input and is a measure of hand-eye coordination."
                }
              }
            ]
          })
        }}
      />

      <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
        {gameState === 'start' && (
          <div>
            <h1 className="text-3xl font-bold mb-6">点击速度测试</h1>
            <p className="mb-6">在10秒内尽可能多地点击下面的按钮！</p>
            <button 
              onClick={startGame} 
              className="bg-blue-600 text-white px-6 py-3 rounded-lg shadow-md hover:bg-blue-700 transition-colors"
            >
              开始测试
            </button>
          </div>
        )}

        {gameState === 'playing' && (
          <div>
            <h2 className="text-2xl font-bold mb-4">时间剩余: {timeLeft}秒</h2>
            <button 
              onClick={handleClick} 
              className="bg-green-600 text-white px-6 py-3 rounded-lg shadow-md hover:bg-green-700 transition-colors"
            >
              点击我！
            </button>
            <p className="mt-4 text-xl">点击次数: {clickCount}</p>
          </div>
        )}

        {gameState === 'result' && (
          <div>
            <h2 className="text-2xl font-bold mb-4">测试结果</h2>
            <p className="text-xl mb-4">你在10秒内点击了 {clickCount} 次！</p>
            <button 
              onClick={() => setGameState('start')}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg shadow-md hover:bg-blue-700 transition-colors"
            >
              重新开始
            </button>
          </div>
        )}
      </div>

        {/* 静态内容 */}
      <div dangerouslySetInnerHTML={{ __html: staticContent }} />
      
      {/* SEO Content Section */}
      <section className="max-w-4xl mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          Understanding Click Speed Testing
        </h2>
        
        <div className="prose prose-blue max-w-none">
          <p className="text-gray-700 leading-relaxed mb-4">
            Click speed testing measures your ability to rapidly click a mouse button, typically expressed in clicks per second (CPS). This metric is particularly important for gamers, digital artists, and professionals who rely on quick mouse movements in their work or hobbies.
          </p>
          
          <p className="text-gray-700 leading-relaxed mb-4">
            Different clicking techniques like jitter clicking, butterfly clicking, and drag clicking can help achieve higher CPS rates. Understanding and practicing these techniques can significantly improve your clicking performance and overall mouse control.
          </p>
          
          <p className="text-gray-700 leading-relaxed">
            Whether you're a competitive gamer looking to improve your APM (Actions Per Minute) or simply interested in testing your mouse control skills, click speed testing provides valuable insights into your manual dexterity and coordination.
          </p>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="max-w-4xl mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          Frequently Asked Questions About Click Speed
        </h2>
        
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              What is a good Click Speed (CPS)?
            </h3>
            <p className="text-gray-700">
              A good click speed ranges from 6-8 clicks per second (CPS). Professional gamers often achieve 8-12 CPS, while the average person clicks at 4-6 CPS. Some specialized techniques can reach up to 15 CPS.
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              How can I improve my Click Speed?
            </h3>
            <p className="text-gray-700">
              Regular practice, proper mouse grip technique, and finger exercises can improve click speed. Using different clicking methods like jitter clicking or butterfly clicking can also help achieve higher CPS.
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              What factors affect Click Speed?
            </h3>
            <p className="text-gray-700">
              Mouse type, clicking technique, hand position, finger strength, and practice level all affect click speed. Physical factors like fatigue and hand size can also impact performance.
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Why is Click Speed important?
            </h3>
            <p className="text-gray-700">
              Click speed is crucial for gaming performance, especially in genres like MOBAs and FPS. It can also improve productivity in tasks requiring rapid mouse input and is a measure of hand-eye coordination.
            </p>
          </div>
        </div>
      </section>
    </>
  )
} 