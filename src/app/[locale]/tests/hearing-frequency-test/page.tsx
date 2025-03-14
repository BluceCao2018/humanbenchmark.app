'use client'
import React, { useState, useRef, useEffect } from 'react'
import { useTranslations } from 'next-intl';
import { FaVolumeUp } from 'react-icons/fa';
import SharePoster from '@/components/SharePoster'
import HearingTestPoster from '@/components/HearingTestPoster'
import { useSearchParams } from 'next/navigation'
import { EmbedDialog } from '@/components/EmbedDialog'
import { Button } from '@/components/ui/button';
import staticContent from '../alltoolslist.html'

export default function HearingFrequencyTest() {
  const [isGameStarted, setIsGameStarted] = useState(false)
  const [currentFreq, setCurrentFreq] = useState(20)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isComplete, setIsComplete] = useState(false)
  const [maxFreq, setMaxFreq] = useState(0)
  const [minFreq, setMinFreq] = useState(0)
  const [foundMin, setFoundMin] = useState(false)
  const audioContextRef = useRef<AudioContext | null>(null)
  const oscillatorRef = useRef<OscillatorNode | null>(null)
  const [isShareOpen, setIsShareOpen] = useState(false)
  const searchParams = useSearchParams()
  const isIframe = searchParams.get('embed') === 'true'
  const [embedUrl, setEmbedUrl] = useState('')
  const [showEmbedDialog, setShowEmbedDialog] = useState(false)

  const t = useTranslations('hearingTest');
  const te = useTranslations('embed');

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

      if (isComplete) {
        window.parent.postMessage({
          type: 'testComplete',
          results: {
            maxFrequency: maxFreq,
            minFrequency: minFreq,
            estimatedAge: getAgeEstimate(maxFreq)
          }
        }, '*')
      }

      return () => {
        observer.disconnect()
      }
    }
  }, [isIframe, isComplete, maxFreq, minFreq])

  const startAudio = () => {
    if (!audioContextRef.current) {
      audioContextRef.current = new AudioContext()
    }

    if (oscillatorRef.current) {
      oscillatorRef.current.stop()
    }

    oscillatorRef.current = audioContextRef.current.createOscillator()
    const gainNode = audioContextRef.current.createGain()
    
    oscillatorRef.current.connect(gainNode)
    gainNode.connect(audioContextRef.current.destination)
    
    // 设置音量（避免声音过大）
    gainNode.gain.value = 0.1
    
    // 设置频率
    oscillatorRef.current.frequency.value = currentFreq
    
    oscillatorRef.current.start()
    setIsPlaying(true)
  }

  const stopAudio = () => {
    if (oscillatorRef.current) {
      oscillatorRef.current.stop()
      setIsPlaying(false)
    }
  }

  const handleResponse = (canHear: boolean) => {
    if (canHear) {
      if (!foundMin) {
        setMinFreq(currentFreq)
        setFoundMin(true)
      }
      setMaxFreq(currentFreq)
    } else if (foundMin) {
      setIsComplete(true)
      stopAudio()
      return
    }

    const nextFreq = Math.min(
      currentFreq < 1000 ? currentFreq + 100 :
      currentFreq < 5000 ? currentFreq + 500 :
      currentFreq + 1000,
      20000
    )
    setCurrentFreq(nextFreq)
    startAudio()
  }

  const getAgeEstimate = (freq: number) => {
    return Math.max(0, Math.min(110, Math.floor(110 - freq / 200)))
  }

  const getResult = (freq: number) => {
    if (freq >= 17200) return t("result.excellent")
    if (freq >= 13200) return t("result.good")
    if (freq >= 9200) return t("result.normal")
    return t("result.needCheck")
  }

  const restart = () => {
    setCurrentFreq(20)
    setMaxFreq(0)
    setMinFreq(0)
    setFoundMin(false)
    setIsComplete(false)
    setIsPlaying(false)
    if (oscillatorRef.current) {
      oscillatorRef.current.stop()
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
                "name": "What is a normal hearing frequency range?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "The normal human hearing range is between 20 Hz and 20,000 Hz. Young people typically hear higher frequencies better, while the ability to hear high frequencies naturally decreases with age (presbycusis)."
                }
              },
              {
                "@type": "Question",
                "name": "How can I protect my hearing frequency range?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Protect your hearing by avoiding loud noises, using ear protection in noisy environments, keeping volume levels moderate when using headphones, and taking regular breaks from prolonged exposure to sound."
                }
              },
              {
                "@type": "Question",
                "name": "What affects hearing frequency perception?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Age, exposure to loud noises, certain medications, ear infections, genetics, and overall health can affect hearing frequency perception. Environmental factors like background noise can also impact test results."
                }
              },
              {
                "@type": "Question",
                "name": "Why test hearing frequency range?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Testing hearing frequency range helps identify potential hearing loss, monitor auditory health, and detect early signs of hearing problems. It's important for musicians, audio professionals, and anyone concerned about their hearing."
                }
              }
            ]
          })
        }}
      />

      <div className="w-full mx-auto py-0 space-y-16">
        <div className="banner w-full h-[550px] flex flex-col justify-center items-center bg-blue-theme text-white">
          {!isGameStarted && (
            <div className="flex flex-col justify-center items-center">
              <FaVolumeUp className="text-9xl mb-8 animate-fade" />
              <h1 className="text-4xl font-bold text-center mb-4">{t("h2")}</h1>
              <p className="text-lg text-center mb-20">{t("description")}</p>
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
              <div className="bg-white p-6 rounded-xl shadow-lg">
                {!isComplete ? (
                  <>
                    <div className="mb-4">
                      <span className="text-xl font-bold text-gray-800">
                        {t("currentFreq")}: {currentFreq}Hz
                      </span>
                    </div>
                    
                    <div className="flex flex-col gap-4 mb-4">
                      <button
                        onClick={isPlaying ? stopAudio : startAudio}
                        className="bg-blue-500 text-white px-6 py-3 rounded-lg shadow-md hover:bg-blue-600 transition-colors"
                      >
                        {isPlaying ? t("stopSound") : t("playSound")}
                      </button>

                      <div className="flex justify-center gap-4">
                        <button
                          onClick={() => handleResponse(true)}
                          className="bg-green-500 text-white px-6 py-3 rounded-lg shadow-md hover:bg-green-600 transition-colors"
                        >
                          {t("canHear")}
                        </button>
                        <button
                          onClick={() => handleResponse(false)}
                          className="bg-red-500 text-white px-6 py-3 rounded-lg shadow-md hover:bg-red-600 transition-colors"
                        >
                          {t("cannotHear")}
                        </button>
                      </div>
                    </div>

                    <p className="text-sm text-gray-600 mt-4">
                      {t("testInstruction")}
                    </p>
                  </>
                ) : (
                  <div className="mt-4">
                    <p className="text-xl mb-4 text-gray-800">
                      {t("maxFreq")}: {maxFreq}Hz
                    </p>
                    <p className="text-xl mb-4 text-gray-800">
                      {t("minFreq")}: {minFreq}Hz
                    </p>
                    <p className="text-lg mb-4 text-gray-600">
                      {getResult(maxFreq)}
                    </p>
                    <p className="text-sm mb-4 text-gray-500">
                      {t("estimatedAge")}: {getAgeEstimate(maxFreq)}
                    </p>
                    <div className="flex gap-4">
                      <button 
                        onClick={restart}
                        className="mt-4 bg-blue-500 text-white px-6 py-2 rounded-lg shadow-md hover:bg-blue-600 transition-colors"
                      >
                        {t("tryAgain")}
                      </button>
                      <button
                        onClick={() => setIsShareOpen(true)}
                        className="mt-4 bg-green-500 text-white px-6 py-2 rounded-lg shadow-md hover:bg-green-600 transition-colors flex items-center gap-2"
                      >
                        <i className="fas fa-share-alt"></i>
                        {t("share")}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="container mx-auto py-0 space-y-16">
          <div className="container mx-auto px-4 py-8 max-w-6xl">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div className="w-full h-[400px]">
                <h2 className="text-xl mb-4 font-semibold text-gray-800">{t("frequencyRangeTitle")}</h2>
                <table className="w-full text-left">
                  <thead>
                    <tr>
                      <th className="py-2">{t("age")}</th>
                      <th className="py-2">{t("frequency")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr><td>9-24</td><td>17200 - 20200 Hz</td></tr>
                    <tr><td>25-44</td><td>13200 - 17200 Hz</td></tr>
                    <tr><td>45-64</td><td>9200 - 13200 Hz</td></tr>
                    <tr><td>65+</td><td>&lt; 9000 Hz</td></tr>
                  </tbody>
                </table>
              </div>
              <div className="w-full h-[400px]">
                <h2 className="text-xl mb-4 font-semibold text-gray-800">{t("aboutTitle")}</h2>
                <p className="text-gray-600" 
                   dangerouslySetInnerHTML={{ __html: t("about")?.replace(/\n/g, '<br />') || '' }}>
                </p>
              </div>
            </div>
          </div>
        </div>
        <HearingTestPoster
          isOpen={isShareOpen}
          onClose={() => setIsShareOpen(false)}
          title={t("h2")}
          maxFreq={`${maxFreq}Hz`}
          minFreq={`${minFreq}Hz`}
          estimatedAge={getAgeEstimate(maxFreq)}
          result={getResult(maxFreq)}
        />
        
      </div>
      
      {/* 静态内容 */}
      <div dangerouslySetInnerHTML={{ __html: staticContent }} />

      {/* SEO Content Section */}
      <section className="max-w-4xl mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          Understanding Hearing Frequency Testing
        </h2>
        
        <div className="prose prose-blue max-w-none">
          <p className="text-gray-700 leading-relaxed mb-4">
            Hearing frequency testing measures the range of sound frequencies you can detect, from low bass tones to high-pitched sounds. This comprehensive evaluation helps assess your auditory capabilities and identify potential hearing limitations or loss across different frequency ranges.
          </p>
          
          <p className="text-gray-700 leading-relaxed mb-4">
            The test systematically presents tones at various frequencies, typically ranging from 20 Hz to 20,000 Hz, which represents the normal human hearing range. Understanding your hearing frequency range can be particularly important for musicians, audio professionals, and anyone concerned about their hearing health.
          </p>
          
          <p className="text-gray-700 leading-relaxed">
            Regular testing can help track changes in hearing ability over time and identify early signs of hearing loss, allowing for timely intervention and protection strategies to maintain optimal auditory health.
          </p>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="max-w-4xl mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          Frequently Asked Questions About Hearing Frequency
        </h2>
        
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              What is a normal hearing frequency range?
            </h3>
            <p className="text-gray-700">
              The normal human hearing range is between 20 Hz and 20,000 Hz. Young people typically hear higher frequencies better, while the ability to hear high frequencies naturally decreases with age (presbycusis).
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              How can I protect my hearing frequency range?
            </h3>
            <p className="text-gray-700">
              Protect your hearing by avoiding loud noises, using ear protection in noisy environments, keeping volume levels moderate when using headphones, and taking regular breaks from prolonged exposure to sound.
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              What affects hearing frequency perception?
            </h3>
            <p className="text-gray-700">
              Age, exposure to loud noises, certain medications, ear infections, genetics, and overall health can affect hearing frequency perception. Environmental factors like background noise can also impact test results.
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Why test hearing frequency range?
            </h3>
            <p className="text-gray-700">
              Testing hearing frequency range helps identify potential hearing loss, monitor auditory health, and detect early signs of hearing problems. It's important for musicians, audio professionals, and anyone concerned about their hearing.
            </p>
          </div>
        </div>
      </section>

      
    </>
  )
} 