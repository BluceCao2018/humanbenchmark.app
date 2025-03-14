'use client'
import React, { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import '@fortawesome/fontawesome-free/css/all.min.css';
import Image from 'next/image'
import { useSearchParams } from 'next/navigation'
import { EmbedDialog } from '@/components/EmbedDialog'
import { Button } from '@/components/ui/button';
import staticContent from '../alltoolslist.html'

export default function VerbalMemoryTest() {
  const [gameState, setGameState] = useState<'start' | 'playing' | 'result'>('start')
  const [words, setWords] = useState<string[]>([])
  const [currentWord, setCurrentWord] = useState<string>('')
  const [score, setScore] = useState(0)
  const [seenWords, setSeenWords] = useState<Set<string>>(new Set())
  const [correctAnswers, setCorrectAnswers] = useState(0)
  const [wrongAnswers, setWrongAnswers] = useState(0)

  const t =  useTranslations('verbalMemory');
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
            score: score,
            seenWords: seenWords.size,
            correctAnswers: correctAnswers,
            wrongAnswers: wrongAnswers
          }
        }, '*')
      }

      return () => {
        observer.disconnect()
      }
    }
  }, [isIframe, gameState, score, seenWords, correctAnswers, wrongAnswers])

  // 生成随机单词
  const generateWord = () => {
    const syllables = ['ba', 'ka', 'da', 'ma', 'na', 'pa', 'ra', 'sa', 'ta', 'wa']
    const length = Math.floor(Math.random() * 3) + 2 // 2-4个音节
    const word = Array.from({ length }, () => 
      syllables[Math.floor(Math.random() * syllables.length)]
    ).join('')
    return word
  }

  const startGame = () => {
    const initialWords = Array.from({ length: 10 }, () => generateWord())
    setWords(initialWords)
    setCurrentWord(initialWords[0])
    setScore(0)
    setSeenWords(new Set())
    setGameState('playing')
  }

  const handleResponse = (response: 'new' | 'seen') => {
    const isCorrect = 
      (response === 'new' && !seenWords.has(currentWord)) ||
      (response === 'seen' && seenWords.has(currentWord))

    if (isCorrect) {
      setScore(prev => prev + 1)
      setCorrectAnswers(prev => prev + 1)
    } else {
      setWrongAnswers(prev => prev + 1)
      setGameState('result')
      return
    }

    // 标记当前单词为已见
    const updatedSeenWords = new Set(seenWords)
    updatedSeenWords.add(currentWord)
    setSeenWords(updatedSeenWords)

    // 获取下一个单词
    const remainingWords = words.filter(w => w !== currentWord)
    if (remainingWords.length === 0) {
      // 生成新单词
      const newWord = generateWord()
      setWords([...words, newWord])
      setCurrentWord(newWord)
    } else {
      const nextWord = remainingWords[0]
      setCurrentWord(nextWord)
      setWords(remainingWords)
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
                "name": "What is a good Verbal Memory Test score?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "In the Verbal Memory Test, remembering 50-70 words is considered good, while scores above 80 words are excellent. Average users typically remember 30-50 words before making three mistakes. Professional memory athletes can achieve significantly higher scores."
                }
              },
              {
                "@type": "Question",
                "name": "How can I improve my verbal memory?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Regular practice with the Verbal Memory Test, using visualization techniques, creating word associations, and active reading can improve your performance. Daily practice sessions combined with adequate sleep help strengthen verbal memory capacity."
                }
              },
              {
                "@type": "Question",
                "name": "What factors affect Verbal Memory Test performance?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Several factors influence Verbal Memory Test results, including vocabulary size, language proficiency, attention span, and fatigue level. Environmental conditions and time of day can also impact performance significantly."
                }
              },
              {
                "@type": "Question",
                "name": "How often should I practice verbal memory?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "For optimal results, practice the Verbal Memory Test for 10-15 minutes daily. Consistent, shorter practice sessions are more effective than longer, irregular training periods. Regular practice helps build long-term memory capacity."
                }
              },
              {
                "@type": "Question",
                "name": "Why is verbal memory important?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Verbal memory is crucial for learning new languages, vocabulary acquisition, and academic success. Strong verbal memory enhances communication skills, reading comprehension, and overall cognitive performance in daily activities."
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
              <i className="fas fa-language text-9xl text-white mb-8 animate-fade cursor-pointer"></i>
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

          {gameState === 'playing' && (
            <div className="flex flex-col items-center">
              <p className="text-4xl font-bold mb-12">{currentWord}</p>
              <div className="flex space-x-4">
                <button 
                  onClick={() => handleResponse('new')}
                  className="bg-green-600 text-white px-6 py-3 rounded-lg shadow-md hover:bg-green-700 transition-colors"
                >
                  {t("new")}
                </button>
                <button 
                  onClick={() => handleResponse('seen')}
                  className="bg-red-600 text-white px-6 py-3 rounded-lg shadow-md hover:bg-red-700 transition-colors"
                >
                  {t("seen")}
                </button>
              </div>
              <div className="absolute top-4 right-4">
                <p>分数: {score}</p>
              </div>
            </div>
          )}

          {gameState === 'result' && (
            <div  className='flex flex-col justify-center items-center'>
              <i className="fas fa-language text-9xl text-white mb-8 animate-fade cursor-pointer"></i>
              <h2 className="text-2xl font-bold mb-4">{t("h2")}</h2>
              <p className="text-6xl mb-4">{score} words</p>
              <button 
                onClick={() => setGameState('start')}
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
              Understanding the Verbal Memory Test
            </h2>
            
            <div className="prose prose-blue max-w-none">
              <p className="text-gray-700 leading-relaxed mb-4">
                The Verbal Memory Test is an advanced cognitive assessment tool designed to measure your word recognition and retention abilities. This comprehensive test evaluates how well you can identify and remember previously seen words among new ones. The Verbal Memory Test provides valuable insights into your verbal working memory capacity and helps track improvements over time.
              </p>
              
              <p className="text-gray-700 leading-relaxed mb-4">
                During the Verbal Memory Test, participants encounter a series of words and must identify whether each word is new or has appeared before. The Verbal Memory Test continues until three mistakes are made, allowing for an accurate assessment of verbal memory capacity. Each session provides immediate feedback, helping users understand their performance level.
              </p>
              
              <p className="text-gray-700 leading-relaxed mb-4">
                Regular engagement with the Verbal Memory Test can significantly enhance your word recognition abilities. Many students and professionals use the Verbal Memory Test to improve their vocabulary retention and language learning capabilities. The test's progressive nature ensures that users are consistently challenged as their skills improve.
              </p>
              
              <p className="text-gray-700 leading-relaxed">
                Whether you're learning a new language or seeking to enhance your cognitive abilities, the Verbal Memory Test offers a scientific approach to memory improvement. The test's design focuses on both recognition accuracy and memory capacity, making it an effective tool for comprehensive verbal memory development.
              </p>
            </div>
          </section>

          {/* FAQ Section */}
          <section className="max-w-4xl mx-auto px-4 py-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              FAQ About Verbal Memory Test
            </h2>
            
            <div className="space-y-6">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  What is a good Verbal Memory Test score?
                </h3>
                <p className="text-gray-700">
                  In the Verbal Memory Test, remembering 50-70 words is considered good, while scores above 80 words are excellent. Average users typically remember 30-50 words before making three mistakes. Professional memory athletes can achieve significantly higher scores.
                </p>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  How can I improve my verbal memory?
                </h3>
                <p className="text-gray-700">
                  Regular practice with the Verbal Memory Test, using visualization techniques, creating word associations, and active reading can improve your performance. Daily practice sessions combined with adequate sleep help strengthen verbal memory capacity.
                </p>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  What factors affect Verbal Memory Test performance?
                </h3>
                <p className="text-gray-700">
                  Several factors influence Verbal Memory Test results, including vocabulary size, language proficiency, attention span, and fatigue level. Environmental conditions and time of day can also impact performance significantly.
                </p>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  How often should I practice verbal memory?
                </h3>
                <p className="text-gray-700">
                  For optimal results, practice the Verbal Memory Test for 10-15 minutes daily. Consistent, shorter practice sessions are more effective than longer, irregular training periods. Regular practice helps build long-term memory capacity.
                </p>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Why is verbal memory important?
                </h3>
                <p className="text-gray-700">
                  Verbal memory is crucial for learning new languages, vocabulary acquisition, and academic success. Strong verbal memory enhances communication skills, reading comprehension, and overall cognitive performance in daily activities.
                </p>
              </div>
            </div>
          </section>

         
        </div>
      </div>

      <div className="container mx-auto py-0 space-y-16 ">
        
      </div>
    </>
  )
} 