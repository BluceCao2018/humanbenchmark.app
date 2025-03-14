'use client'
import { useState, useEffect, useRef } from 'react'
import { useTranslations } from 'next-intl'
import Image from 'next/image'
import { FaMusic, FaPlay, FaCheck, FaTimes } from 'react-icons/fa'
import { useSearchParams } from 'next/navigation'
import { EmbedDialog } from '@/components/EmbedDialog'
import { Button } from '@/components/ui/button'
import staticContent from '../alltoolslist.html'

const NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']
const NOTE_FREQUENCIES: { [key: string]: number } = {
  'C': 261.63, // C4
  'C#': 277.18,
  'D': 293.66,
  'D#': 311.13,
  'E': 329.63,
  'F': 349.23,
  'F#': 369.99,
  'G': 392.00,
  'G#': 415.30,
  'A': 440.00, // A4
  'A#': 466.16,
  'B': 493.88,
}

export default function PerfectPitch() {
  const t = useTranslations('perfectPitch')
  const te = useTranslations('embed');
  const [gameState, setGameState] = useState<'waiting' | 'testing' | 'result'>('waiting')
  const [currentNotes, setCurrentNotes] = useState<string[]>([])
  const [notesCount, setNotesCount] = useState(1)
  const [score, setScore] = useState(0)
  const [totalAttempts, setTotalAttempts] = useState(0)
  const [selectedNotes, setSelectedNotes] = useState<string[]>([])
  const audioContext = useRef<AudioContext | null>(null)
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
            correctNotes: score,
            totalNotes: totalAttempts,
            accuracy: ((score / totalAttempts) * 100).toFixed(1)
          }
        }, '*')
      }

      return () => {
        observer.disconnect()
      }
    }
  }, [isIframe, gameState, score, totalAttempts])

  const playNotes = (frequencies: number[]) => {
    if (!audioContext.current) {
      audioContext.current = new AudioContext()
    }
    
    frequencies.forEach(frequency => {
      const oscillator = audioContext.current!.createOscillator()
      const gainNode = audioContext.current!.createGain()
      
      oscillator.connect(gainNode)
      gainNode.connect(audioContext.current!.destination)
      
      oscillator.frequency.value = frequency
      gainNode.gain.value = 0.1 / frequencies.length
      
      // ADSR envelope
      const now = audioContext.current!.currentTime
      gainNode.gain.setValueAtTime(0, now)
      gainNode.gain.linearRampToValueAtTime(0.1 / frequencies.length, now + 0.1)
      gainNode.gain.linearRampToValueAtTime(0.07 / frequencies.length, now + 0.3)
      gainNode.gain.linearRampToValueAtTime(0, now + 1)
      
      oscillator.start()
      oscillator.stop(now + 1)
    })
  }

  const startNewRound = () => {
    setSelectedNotes([])
    const selectedNotes: string[] = []
    while (selectedNotes.length < notesCount) {
      const randomNote = NOTES[Math.floor(Math.random() * NOTES.length)]
      if (!selectedNotes.includes(randomNote)) {
        selectedNotes.push(randomNote)
      }
    }
    setCurrentNotes(selectedNotes)
    playNotes(selectedNotes.map(note => NOTE_FREQUENCIES[note]))
    setGameState('testing')
  }

  const handleStart = () => {
    if (gameState === 'waiting') {
      startNewRound()
    }
  }

  const handleNoteGuess = async (note: string) => {
    if (selectedNotes.includes(note)) {
      setSelectedNotes(prev => prev.filter(n => n !== note))
    } else {
      if (selectedNotes.length < notesCount) {
        const newSelectedNotes = [...selectedNotes, note]
        setSelectedNotes(newSelectedNotes)
        
        // 如果选择的音符数量达到要求，自动检查答案
        if (newSelectedNotes.length === notesCount) {
          setTotalAttempts(prev => prev + 1)
          
          const isCorrect = 
            newSelectedNotes.length === currentNotes.length && 
            newSelectedNotes.every(n => currentNotes.includes(n)) &&
            currentNotes.every(n => newSelectedNotes.includes(n))
          
          if (isCorrect) {
            setScore(prev => prev + 1)
          }
          
          setGameState('result')
          
          try {
            await fetch('/api/perfect-pitch', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ 
                correct: isCorrect,
                notes: currentNotes,
                guesses: newSelectedNotes 
              }),
            })
          } catch (error) {
            console.error('Error saving result:', error)
          }
        }
      }
    }
  }

  const getGameStateMessage = () => {
    switch (gameState) {
      case 'waiting':
        return { 
          message: t("h1"),
          description: t("description"), 
          icon: <FaMusic className="text-9xl text-white mb-8 animate-fade" />
        }
      case 'testing':
        return { 
          message: t("identifyNote"),
          description: t("selectNote"), 
          icon: <FaPlay className="text-9xl text-white mb-8 animate-fade" />
        }
      case 'result':
        return { 
          message: `Score: ${score}/${totalAttempts}`,
          description: `${t("correctAnswer")}: ${currentNotes.join(', ')}`, 
          icon: score === totalAttempts ? 
            <FaCheck className="text-9xl text-white mb-8 animate-fade" /> :
            <FaTimes className="text-9xl text-white mb-8 animate-fade" />
        }
    }
  }

  const { message, description, icon } = getGameStateMessage()

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
                "name": "What is Perfect Pitch?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Perfect pitch, or absolute pitch, is the ability to identify or reproduce any musical note without a reference tone. It's a rare ability found in about 1 in 10,000 people and is often developed during early musical training."
                }
              },
              {
                "@type": "Question",
                "name": "Can Perfect Pitch be learned?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "While perfect pitch is often considered innate, early musical training (before age 3-4) can help develop this ability. Adults can improve their pitch recognition through dedicated practice, though achieving true perfect pitch is rare."
                }
              },
              {
                "@type": "Question",
                "name": "What's the difference between Perfect Pitch and Relative Pitch?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Perfect pitch allows identification of notes without reference, while relative pitch is the ability to identify notes in relation to a known reference note. Relative pitch is more common and can be developed through practice."
                }
              },
              {
                "@type": "Question",
                "name": "Why is Perfect Pitch important in music?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Perfect pitch can be advantageous for musicians, helping with tuning instruments, singing in tune, transcribing music, and composing. However, many successful musicians rely on well-developed relative pitch instead."
                }
              }
            ]
          })
        }}
      />

      <div className="w-full mx-auto py-0 space-y-16">
        <div className={`
          banner w-full h-[550px] flex flex-col justify-center items-center 
          ${gameState === 'waiting' ? 'bg-blue-theme' : 
            gameState === 'testing' ? 'bg-purple-500' : 
            gameState === 'result' ? (score === totalAttempts ? 'bg-green-500' : 'bg-red-500') :
            'bg-blue-theme'}
          transition-all duration-300 cursor-pointer user-select-none
        `} 
        onClick={gameState === 'waiting' ? handleStart : undefined}>
          {icon}
          <h1 className="text-7xl font-bold text-center mb-4 text-white user-select-none">
            {message}
          </h1>
          <p className="text-3xl text-center mb-20 text-white user-select-none">
            {description}
          </p>
          
          {gameState === 'waiting' && (
            <div className="mt-4 flex gap-4 items-center">
              <Button
                onClick={(e) => {
                  e.stopPropagation()
                  setNotesCount(Math.max(1, notesCount - 1))
                }}
                className="px-4 py-2 bg-white text-blue-500 rounded-lg hover:bg-gray-100"
              >
                -
              </Button>
              <span className="text-white text-xl">
                {t("notesCount")}: {notesCount}
              </span>
              <Button
                onClick={(e) => {
                  e.stopPropagation()
                  setNotesCount(Math.min(10, notesCount + 1))
                }}
                className="px-4 py-2 bg-white text-blue-500 rounded-lg hover:bg-gray-100"
              >
                +
              </Button>
            </div>
          )}
          
          {gameState === 'testing' && (
            <div className="flex flex-col items-center gap-6">
              <div className="grid grid-cols-6 gap-2 max-w-4xl">
                {NOTES.map(note => (
                  <button
                    key={note}
                    onClick={() => handleNoteGuess(note)}
                    className={`px-4 py-2 rounded-lg transition-colors text-sm
                      ${selectedNotes.includes(note) 
                        ? 'bg-purple-700 text-white' 
                        : 'bg-white text-purple-500 hover:bg-gray-100'}`}
                  >
                    {note}
                  </button>
                ))}
              </div>
              
              <div className="text-white text-xl text-center">
                {t("selectedNotes")}: {selectedNotes.join(', ')}
                <br />
                {t("remainingNotes")}: {notesCount - selectedNotes.length}
              </div>
            </div>
          )}
          
          {gameState === 'result' && (
            <div className="flex flex-col items-center gap-4">
              <div className="text-white text-xl space-y-2">
                <p>{t("yourAnswer")}: {selectedNotes.join(', ')}</p>
                <p>{t("correctNotes")}: {currentNotes.join(', ')}</p>
              </div>
              <button
                onClick={() => startNewRound()}
                className="px-8 py-4 bg-white text-purple-500 rounded-lg hover:bg-gray-100 transition-colors"
              >
                {t("nextNote")}
              </button>
            </div>
          )}
        </div>

        <div className="container mx-auto px-4 py-8 max-w-6xl">
          
        </div>
      </div>
      
      {/* 静态内容 */}
      <div dangerouslySetInnerHTML={{ __html: staticContent }} />

      {/* SEO Content Section */}
      <section className="max-w-4xl mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          Understanding Perfect Pitch Testing
        </h2>
        
        <div className="prose prose-blue max-w-none">
          <p className="text-gray-700 leading-relaxed mb-4">
            Perfect pitch testing evaluates your ability to identify musical notes without any reference tone. This rare and fascinating ability, also known as absolute pitch, is found in approximately 1 in 10,000 people and is often associated with early musical training.
          </p>
          
          <p className="text-gray-700 leading-relaxed mb-4">
            The test challenges participants to identify specific musical notes played in isolation, providing insights into their pitch recognition abilities. While perfect pitch is often considered an innate talent, various degrees of pitch recognition can be developed through practice.
          </p>
          
          <p className="text-gray-700 leading-relaxed">
            Whether you're a musician interested in assessing your pitch perception or simply curious about your musical abilities, this test offers a structured way to evaluate your pitch recognition capabilities.
          </p>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="max-w-4xl mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          Frequently Asked Questions About Perfect Pitch
        </h2>
        
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              What is Perfect Pitch?
            </h3>
            <p className="text-gray-700">
              Perfect pitch, or absolute pitch, is the ability to identify or reproduce any musical note without a reference tone. It's a rare ability found in about 1 in 10,000 people and is often developed during early musical training.
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Can Perfect Pitch be learned?
            </h3>
            <p className="text-gray-700">
              While perfect pitch is often considered innate, early musical training (before age 3-4) can help develop this ability. Adults can improve their pitch recognition through dedicated practice, though achieving true perfect pitch is rare.
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              What's the difference between Perfect Pitch and Relative Pitch?
            </h3>
            <p className="text-gray-700">
              Perfect pitch allows identification of notes without reference, while relative pitch is the ability to identify notes in relation to a known reference note. Relative pitch is more common and can be developed through practice.
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Why is Perfect Pitch important in music?
            </h3>
            <p className="text-gray-700">
              Perfect pitch can be advantageous for musicians, helping with tuning instruments, singing in tune, transcribing music, and composing. However, many successful musicians rely on well-developed relative pitch instead.
            </p>
          </div>
        </div>
      </section>

      
    </>
  )
} 