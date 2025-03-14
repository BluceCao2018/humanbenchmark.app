'use client'
import React, { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl';
import '@fortawesome/fontawesome-free/css/all.min.css';
import Image from 'next/image'
import { useSearchParams } from 'next/navigation'
import { EmbedDialog } from '@/components/EmbedDialog'
import { Button } from '@/components/ui/button';
import staticContent from '../alltoolslist.html'

export default function TimePerceptionTest() {
  const [isGameStarted, setIsGameStarted] = useState(false)
  const [results, setResults] = useState<Array<{
    targetTime: number,
    actualTime: number,
    deviation: number,
    deviationPercentage: number
  }>>([])
  
  const times = [1, 2, 3, 5, 0.5, 0.3, 0.2, 0.1, 30]
  const [activeTimer, setActiveTimer] = useState<number | null>(null)
  const [startTime, setStartTime] = useState<number>(0)
  const [completedGrids, setCompletedGrids] = useState<Set<number>>(new Set())

  const gameState = completedGrids.size === times.length ? 'result' : isGameStarted ? 'playing' : 'initial'

  const t = useTranslations('timePerception');
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
        const lastResult = results[results.length - 1];
        window.parent.postMessage({
          type: 'testComplete',
          results: {
            targetTime: lastResult.targetTime,
            actualTime: lastResult.actualTime,
            accuracy: 100 - Math.abs(lastResult.deviationPercentage)
          }
        }, '*')
      }

      return () => {
        observer.disconnect()
      }
    }
  }, [isIframe, gameState, results])

  const handleGridClick = (index: number, targetTime: number) => {
    const grid = document.getElementById(`grid-${index}`)
    if (!grid) return

    if (completedGrids.has(index)) return

    if (activeTimer === index) {
      // 停止计时
      const actualTime = (Date.now() - startTime) / 1000
      const deviation = actualTime - targetTime
      const deviationPercentage = (deviation / targetTime) * 100

      setResults(prev => [...prev, {
        targetTime,
        actualTime,
        deviation,
        deviationPercentage
      }])

      grid.classList.remove('bg-red-500', 'border-red-600')
      grid.classList.add('bg-green-500', 'border-green-600')
      setCompletedGrids(prev => new Set(Array.from(prev).concat(index)))
      setActiveTimer(null)
    } else {
      // 开始计时
      if (activeTimer !== null) {
        const prevGrid = document.getElementById(`grid-${activeTimer}`)
        prevGrid?.classList.remove('bg-red-500', 'border-red-600')
        prevGrid?.classList.add('bg-gray-100', 'border-gray-300')
      }
      
      grid.classList.remove('bg-gray-100', 'border-gray-300')
      grid.classList.add('bg-red-500', 'border-red-600')
      setStartTime(Date.now())
      setActiveTimer(index)
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
                "name": "What is Time Perception?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Time perception is the subjective experience of the passage of time. It's how our brain processes and understands the duration of events, which can vary significantly from actual clock time based on various psychological and physiological factors."
                }
              },
              {
                "@type": "Question",
                "name": "What factors affect Time Perception?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Attention, emotion, age, stress levels, and activity engagement all affect time perception. Time typically feels slower when we're bored or anxious, and faster when we're engaged or enjoying activities."
                }
              },
              {
                "@type": "Question",
                "name": "Can Time Perception be improved?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Time perception can be improved through mindfulness practices, meditation, and specific timing exercises. Regular practice with time estimation tasks and maintaining consistent daily routines can also help develop better time awareness."
                }
              },
              {
                "@type": "Question",
                "name": "Why is Time Perception important?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Accurate time perception is crucial for daily activities, sports performance, music, and professional tasks requiring precise timing. It affects decision-making, planning, and coordination in various life situations."
                }
              }
            ]
          })
        }}
      />

      <div className="w-full mx-auto py-0 space-y-16">
        <div className="banner w-full h-[550px] flex flex-col justify-center items-center" 
             style={{ backgroundColor: 'rgb(43, 135, 209)' }}>
          {!isGameStarted && (
            <div className="flex flex-col justify-center items-center">
              <i className="fas fa-clock text-9xl text-white mb-8 animate-fade"></i>
              <h1 className="text-4xl font-bold text-center mb-4 text-white">{t("h2")}</h1>
              <p className="text-lg text-center mb-20 text-white">{t("description")}</p>
            </div>
          )}

          <div className="w-full max-w-md text-center">
            {!isGameStarted ? (
              <div className="flex gap-4 justify-center items-center">
              <Button 
                onClick={() => setIsGameStarted(true)}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg shadow-md hover:bg-blue-700 transition-colors"
              >
                {t("clickToStart")}
              </Button>
              </div>
            ) : (
              <div>
                <div className="grid grid-cols-3 gap-3 rounded-xl shadow-lg p-4 bg-white">
                  {times.map((time, index) => (
                    <div
                      key={index}
                      id={`grid-${index}`}
                      className={`aspect-square rounded-lg cursor-pointer transition-all duration-200 ease-in-out border-2 
                        ${completedGrids.has(index) 
                          ? 'bg-green-500 border-green-600' 
                          : activeTimer === index
                            ? 'bg-red-500 border-red-600 text-white'
                            : 'bg-gray-100 border-gray-300'
                        } flex flex-col items-center justify-center text-xl font-bold`}
                      onClick={() => handleGridClick(index, time)}
                    >
                      <div>{time}s</div>
                      {completedGrids.has(index) && (
                        <div className="text-sm">
                          {results.find(r => r.targetTime === time)?.actualTime.toFixed(2)}s
                          <br />
                          ({(results.find(r => r.targetTime === time)?.deviationPercentage ?? 0) > 0 ? '+' : ''}
                          {results.find(r => r.targetTime === time)?.deviationPercentage?.toFixed(1) ?? '0.0'}%)
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                
                {completedGrids.size === times.length && (
                  <button 
                    onClick={() => {
                      setCompletedGrids(new Set())
                      setResults([])
                      setActiveTimer(null)
                    }}
                    className="mt-4 bg-blue-500 text-white px-6 py-2 rounded-lg shadow-md hover:bg-blue-600 transition-colors"
                  >
                    {t("tryAgain")}
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="container mx-auto py-0 space-y-16">
         
        </div>
      </div>
      
      {/* 静态内容 */}
      <div dangerouslySetInnerHTML={{ __html: staticContent }} />

      {/* SEO Content Section */}
      <section className="max-w-4xl mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          Understanding Time Perception Testing
        </h2>
        
        <div className="prose prose-blue max-w-none">
          <p className="text-gray-700 leading-relaxed mb-4">
            Time perception testing evaluates your ability to estimate and track the passage of time without external references. This fascinating aspect of human cognition reveals how our internal clock operates and how accurately we can judge different time intervals.
          </p>
          
          <p className="text-gray-700 leading-relaxed mb-4">
            The test challenges participants to estimate various time durations, from brief moments to longer intervals, providing insights into their temporal processing abilities. Understanding your time perception can be valuable for activities requiring precise timing and temporal awareness.
          </p>
          
          <p className="text-gray-700 leading-relaxed">
            Whether you're interested in improving your temporal judgment for professional purposes or curious about your internal time-keeping abilities, this test offers a structured way to assess and understand your time perception capabilities.
          </p>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="max-w-4xl mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          Frequently Asked Questions About Time Perception
        </h2>
        
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              What is Time Perception?
            </h3>
            <p className="text-gray-700">
              Time perception is the subjective experience of the passage of time. It's how our brain processes and understands the duration of events, which can vary significantly from actual clock time based on various psychological and physiological factors.
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              What factors affect Time Perception?
            </h3>
            <p className="text-gray-700">
              Attention, emotion, age, stress levels, and activity engagement all affect time perception. Time typically feels slower when we're bored or anxious, and faster when we're engaged or enjoying activities.
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Can Time Perception be improved?
            </h3>
            <p className="text-gray-700">
              Time perception can be improved through mindfulness practices, meditation, and specific timing exercises. Regular practice with time estimation tasks and maintaining consistent daily routines can also help develop better time awareness.
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Why is Time Perception important?
            </h3>
            <p className="text-gray-700">
              Accurate time perception is crucial for daily activities, sports performance, music, and professional tasks requiring precise timing. It affects decision-making, planning, and coordination in various life situations.
            </p>
          </div>
        </div>
      </section>

      
    </>
  )
} 