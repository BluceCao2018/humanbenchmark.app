'use client'
import React, { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl';
import { FaAdjust } from 'react-icons/fa';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { EmbedDialog } from '@/components/EmbedDialog';
import staticContent from '../alltoolslist.html'

export default function GrayShadesTest() {
  const [isGameStarted, setIsGameStarted] = useState(false)
  const [level, setLevel] = useState(1)
  const [score, setScore] = useState(0)
  const [isComplete, setIsComplete] = useState(false)
  const [showEmbedDialog, setShowEmbedDialog] = useState(false)
  const searchParams = useSearchParams()
  const isIframe = searchParams.get('embed') === 'true'
  const [embedUrl, setEmbedUrl] = useState('')
  const [gameState, setGameState] = useState<'start' | 'playing' | 'result'>('start')
  
  const t = useTranslations('grayShades');
  const te = useTranslations('embed');
  // 生成关卡数据
  const generateLevel = (level: number) => {
    // 基础色值，从深到浅
    const baseGray = Math.floor(255 * (level / 51))
    // 差异值随关卡递减
    const difference = Math.max(50 - level, 3)
    
    // 生成四个方块的颜色，其中一个略有不同
    const colors = Array(4).fill(0).map(() => baseGray)
    const differentIndex = Math.floor(Math.random() * 4)
    colors[differentIndex] = Math.min(255, baseGray + difference)

    return {
      colors,
      correctIndex: differentIndex
    }
  }

  const [currentLevel, setCurrentLevel] = useState(generateLevel(1))

  const handleSquareClick = (index: number) => {
    if (index === currentLevel.correctIndex) {
      // 正确选择
      if (level < 51) {
        setScore(score + 1)
        setLevel(level + 1)
        setCurrentLevel(generateLevel(level + 1))
      } else {
        setIsComplete(true)
        setGameState('result')
      }
    } else {
      // 错误选择
      setIsComplete(true)
      setGameState('result')
    }
  }

  const restart = () => {
    setLevel(1)
    setScore(0)
    setIsComplete(false)
    setCurrentLevel(generateLevel(1))
  }

  useEffect(() => {
    if (isIframe) {
      // ...通用的height调整代码
      
      if (gameState === 'result') {
        window.parent.postMessage({
          type: 'testComplete',
          results: {
            level: level,
            score: score
          }
        }, '*')
      }
    }
  }, [isIframe, gameState, level, score])

  useEffect(() => {
    // Set embed URL when component mounts
    if (typeof window !== 'undefined') {
      setEmbedUrl(`${window.location.origin}${window.location.pathname}?embed=true`)
    }
  }, [])

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
                "name": "What is Gray Shade Discrimination?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Gray shade discrimination is the ability to distinguish between subtle differences in gray tones. This skill is particularly important for artists, photographers, designers, and medical professionals who need to interpret grayscale images."
                }
              },
              {
                "@type": "Question",
                "name": "How can I improve my Gray Shade perception?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Regular practice with gray shade exercises, working in optimal lighting conditions, and training your eyes through art and photography can improve gray shade perception. Taking breaks to prevent eye fatigue is also important."
                }
              },
              {
                "@type": "Question",
                "name": "Why is Gray Shade perception important?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Gray shade perception is crucial for various professional fields including radiology, printing, photography, and design. It helps in detecting subtle details in medical imaging and creating balanced visual compositions."
                }
              },
              {
                "@type": "Question",
                "name": "What factors affect Gray Shade perception?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Lighting conditions, screen calibration, eye fatigue, and overall vision health can affect gray shade perception. Age and certain eye conditions may also impact the ability to distinguish between gray tones."
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
              <FaAdjust className="text-9xl mb-8 animate-fade" />
              <h1 className="text-4xl font-bold text-center mb-4">{t("h2")}</h1>
              <p className="text-lg text-center mb-20 ">{t("description")}</p>
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
                        {t("level")} {level}/51
                      </span>
                      <span className="text-xl font-bold text-gray-800 ml-4">
                        {t("score")}: {score}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      {currentLevel.colors.map((color, index) => (
                        <button
                          key={index}
                          onClick={() => handleSquareClick(index)}
                          className="aspect-square rounded-lg transition-colors duration-200 hover:opacity-90"
                          style={{
                            backgroundColor: `rgb(${color}, ${color}, ${color})`
                          }}
                        />
                      ))}
                    </div>

                    <p className="text-sm text-gray-600 mt-4">
                      {t("findDifferent")}
                    </p>
                  </>
                ) : (
                  <div className="mt-4">
                    <p className="text-xl mb-4 text-gray-800">
                      {t("finalScore")}: {score}/51
                    </p>
                    <p className="text-lg mb-4 text-gray-600">
                      {score >= 45 ? t("excellent") :
                       score >= 35 ? t("good") :
                       score >= 25 ? t("average") :
                       t("needPractice")}
                    </p>
                    <button 
                      onClick={restart}
                      className="bg-blue-500 text-white px-6 py-2 rounded-lg shadow-md hover:bg-blue-600 transition-colors"
                    >
                      {t("tryAgain")}
                    </button>
                  </div>
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
          Understanding Gray Shade Perception Testing
        </h2>
        
        <div className="prose prose-blue max-w-none">
          <p className="text-gray-700 leading-relaxed mb-4">
            Gray shade perception testing evaluates your ability to distinguish between subtle variations in gray tones. This specialized visual skill is essential for many professional fields, including medical imaging, photography, and design, where the ability to detect minor differences in grayscale can be crucial.
          </p>
          
          <p className="text-gray-700 leading-relaxed mb-4">
            The test challenges your visual discrimination abilities by presenting increasingly subtle differences between gray shades. This helps assess your eye's sensitivity to tonal variations and can indicate your potential in fields requiring precise visual discrimination.
          </p>
          
          <p className="text-gray-700 leading-relaxed">
            Whether you're a professional requiring precise gray tone discrimination or simply interested in testing your visual perception abilities, this test provides valuable insights into your grayscale sensitivity and visual acuity.
          </p>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="max-w-4xl mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          Frequently Asked Questions About Gray Shade Perception
        </h2>
        
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              What is Gray Shade Discrimination?
            </h3>
            <p className="text-gray-700">
              Gray shade discrimination is the ability to distinguish between subtle differences in gray tones. This skill is particularly important for artists, photographers, designers, and medical professionals who need to interpret grayscale images.
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              How can I improve my Gray Shade perception?
            </h3>
            <p className="text-gray-700">
              Regular practice with gray shade exercises, working in optimal lighting conditions, and training your eyes through art and photography can improve gray shade perception. Taking breaks to prevent eye fatigue is also important.
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Why is Gray Shade perception important?
            </h3>
            <p className="text-gray-700">
              Gray shade perception is crucial for various professional fields including radiology, printing, photography, and design. It helps in detecting subtle details in medical imaging and creating balanced visual compositions.
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              What factors affect Gray Shade perception?
            </h3>
            <p className="text-gray-700">
              Lighting conditions, screen calibration, eye fatigue, and overall vision health can affect gray shade perception. Age and certain eye conditions may also impact the ability to distinguish between gray tones.
            </p>
          </div>
        </div>
      </section>

      
    </>
  )
} 