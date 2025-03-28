'use client'
import React, { useState, useEffect, useRef, useCallback } from 'react'
import '@fortawesome/fontawesome-free/css/all.min.css'
import { useTranslations } from 'next-intl'
import Image from 'next/image'
import { useSearchParams } from 'next/navigation'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Copy } from 'lucide-react'
import { toast } from 'sonner'
import { EmbedDialog } from '@/components/EmbedDialog'
import staticContent from '../alltoolslist.html'

interface TestResult {
  correctResponses: number
  omissionErrors: number
  commissionErrors: number
  averageReactionTime: number
  totalTrials: number
}

interface PeriodStats {
  startTime: number;
  correctResponses: number;
  commissionErrors: number;
  omissionErrors: number;
  reactionTimes: number[];
}

export default function CPTTest() {
  const searchParams = useSearchParams()
  const isIframe = searchParams.get('embed') === 'true'

  const [gameState, setGameState] = useState<'start' | 'test' | 'result'>('start')
  const [currentLetter, setCurrentLetter] = useState<string>('')
  const [results, setResults] = useState<TestResult>({
    correctResponses: 0,
    omissionErrors: 0,
    commissionErrors: 0,
    averageReactionTime: 0,
    totalTrials: 0
  })
  const [reactionTimes, setReactionTimes] = useState<number[]>([])
  const [lastStimulusTime, setLastStimulusTime] = useState<number>(0)
  const [progress, setProgress] = useState(0)
  const [periodStats, setPeriodStats] = useState<PeriodStats[]>([])
  const [testStartTime, setTestStartTime] = useState<number>(0)
  const [showEmbedDialog, setShowEmbedDialog] = useState(false)
  const [embedUrl, setEmbedUrl] = useState('')
  const [isSoundEnabled, setIsSoundEnabled] = useState(true)
  const [showTutorial, setShowTutorial] = useState(true)
  const [selectedDuration, setSelectedDuration] = useState(120000) // 默认2分钟
  
  // Add sound refs
  const correctSoundRef = useRef<HTMLAudioElement | null>(null)
  const wrongSoundRef = useRef<HTMLAudioElement | null>(null)

  // 修改测试时长常量为动态值
  const testDuration = selectedDuration
  
  // 定义可选的测试时长
  const durationOptions = [
    { value: 60000, label: '1 min' },
    { value: 120000, label: '2 min' },
    { value: 180000, label: '3 min' },
    { value: 300000, label: '5 min' }
  ]

  const stimulusDuration = 500 // Changed to 500ms
  const interStimulusInterval = 1000 // time between stimuli

  const letters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z']
  const targetLetter = 'X'

  const t = useTranslations('cpt')

  const intervalsRef = useRef<{
    stimulus?: NodeJS.Timeout;
    progress?: NodeJS.Timeout;
  }>({})

  // Initialize audio
  useEffect(() => {
    const soundPreference = localStorage.getItem('cptTestSoundEnabled')
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
    localStorage.setItem('cptTestSoundEnabled', newState.toString())
  }

  const startTest = () => {
    setTestStartTime(Date.now())
    setGameState('test')
    setResults({
      correctResponses: 0,
      omissionErrors: 0,
      commissionErrors: 0,
      averageReactionTime: 0,
      totalTrials: 0
    })
    setReactionTimes([])
    setProgress(0)
    setPeriodStats([])

    const startTime = Date.now()
    intervalsRef.current.progress = setInterval(() => {
      const elapsed = Date.now() - startTime
      setProgress((elapsed / testDuration) * 100)
      if (elapsed >= testDuration) {
        endTest()
      }
    }, 100)

    showStimuli()

    setTimeout(() => {
      endTest()
    }, testDuration)
  }

  const showStimuli = () => {
    const displayStimulus = () => {
      const isTarget = Math.random() < 0.2  // 20% 概率显示目标字母
      const letter = isTarget ? targetLetter : letters.filter(l => l !== targetLetter)[Math.floor(Math.random() * (letters.length - 1))]
      const currentTime = Date.now()
      
      // 先清除之前的字母和时间戳
      setCurrentLetter('')
      setLastStimulusTime(0)
      
      // 短暂延迟后显示新字母，确保状态已更新
      setTimeout(() => {
        setCurrentLetter(letter)
        setLastStimulusTime(currentTime)
        console.log('New stimulus:', { letter, time: currentTime, isTarget })
        
        // 清除当前字母
        setTimeout(() => {
          setCurrentLetter('')
          setLastStimulusTime(0)
        }, stimulusDuration)
      }, 50)
    }

    displayStimulus()
    const intervalId = setInterval(displayStimulus, interStimulusInterval)
    intervalsRef.current.stimulus = intervalId
  }

  const handleClick = useCallback(() => {
    if (gameState !== 'test') return

    const currentTime = Date.now()
    const currentDisplayedLetter = currentLetter
    const currentStimulusTime = lastStimulusTime
    
    if (!currentDisplayedLetter || !currentStimulusTime) return
    
    const reactionTime = currentTime - currentStimulusTime
    const periodStartTime = Math.floor((currentTime - testStartTime) / 30000) * 30000

    // 更新时间段统计
    setPeriodStats(prev => {
      const currentPeriod = prev.find(p => p.startTime === periodStartTime) || {
        startTime: periodStartTime,
        correctResponses: 0,
        commissionErrors: 0,
        omissionErrors: 0,
        reactionTimes: []
      };

      const updatedPeriod = {
        ...currentPeriod,
        reactionTimes: [...currentPeriod.reactionTimes, reactionTime]
      };

      if (currentDisplayedLetter === targetLetter && reactionTime <= stimulusDuration) {
        updatedPeriod.correctResponses++;
      } else {
        updatedPeriod.commissionErrors++;
      }

      return [
        ...prev.filter(p => p.startTime !== periodStartTime),
        updatedPeriod
      ].sort((a, b) => a.startTime - b.startTime);
    });

    console.log('Click detected:', { 
      letter: currentDisplayedLetter, 
      reactionTime,
      isTarget: currentDisplayedLetter === targetLetter,
      lastStimulusTime: currentStimulusTime,
      currentTime
    })
    
    if (currentDisplayedLetter === targetLetter && reactionTime <= stimulusDuration) {
      playSound(correctSoundRef)
      // 正确响应
      console.log('Recording correct response for:', currentDisplayedLetter)
      setResults(prev => {
        const newResults = {
          ...prev,
          correctResponses: prev.correctResponses + 1,
          totalTrials: prev.totalTrials + 1
        };
        console.log('Updated results:', newResults);
        return newResults;
      })
      setReactionTimes(prev => [...prev, reactionTime])
    } else if (currentDisplayedLetter !== '') {
      playSound(wrongSoundRef)
      // 错误响应（虚报）或超时
      console.log('Recording commission error for:', currentDisplayedLetter, 'reactionTime:', reactionTime)
      setResults(prev => {
        const newResults = {
          ...prev,
          commissionErrors: prev.commissionErrors + 1,
          totalTrials: prev.totalTrials + 1
        };
        console.log('Updated results (error):', newResults);
        return newResults;
      })
    }
  }, [gameState, currentLetter, lastStimulusTime, testStartTime, targetLetter, stimulusDuration]);

  const endTest = () => {
    if (intervalsRef.current.stimulus) {
      clearInterval(intervalsRef.current.stimulus)
    }
    if (intervalsRef.current.progress) {
      clearInterval(intervalsRef.current.progress)
    }

    setGameState('result')
    setCurrentLetter('')
    document.body.style.overflow = '';  // 恢复滚动

    const avgRT = reactionTimes.length > 0 
      ? reactionTimes.reduce((a, b) => a + b) / reactionTimes.length 
      : 0

    setResults(prev => ({
      ...prev,
      averageReactionTime: avgRT
    }))
  }

  useEffect(() => {
    const preventScroll = (event: KeyboardEvent) => {
      if (event.code === 'Space') {
        event.preventDefault();
        return false;
      }
    };

    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.code === 'Space') {
        event.preventDefault();
        handleClick();
        return false;
      }
    };

    // 只在测试进行时添加事件监听器
    if (gameState === 'test') {
      window.addEventListener('keydown', preventScroll, { passive: false });
      window.addEventListener('keyup', preventScroll, { passive: false });
      window.addEventListener('keypress', preventScroll, { passive: false });
      window.addEventListener('keydown', handleKeyPress);
      document.body.style.overflow = 'hidden';  // 测试时禁用滚动
    }

    return () => {
      window.removeEventListener('keydown', preventScroll);
      window.removeEventListener('keyup', preventScroll);
      window.removeEventListener('keypress', preventScroll);
      window.removeEventListener('keydown', handleKeyPress);
      document.body.style.overflow = '';  // 清理时恢复滚动
    };
  }, [gameState, handleClick]);

  // 组件卸载时也要恢复滚动
  useEffect(() => {
    return () => {
      document.body.style.overflow = '';
    }
  }, []);

  // 添加 iframe 消息通信
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
            correctResponses: results.correctResponses,
            omissionErrors: results.omissionErrors,
            commissionErrors: results.commissionErrors,
            averageReactionTime: Math.round(results.averageReactionTime),
            accuracy: ((results.correctResponses / results.totalTrials) * 100).toFixed(1)
          }
        }, '*')
      }

      return () => {
        observer.disconnect()
      }
    }
  }, [isIframe, gameState, results])


  // 完整模式下渲染所有内容
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
                "name": "What does a CPT test measure?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "The Continuous Performance Test (CPT) measures sustained attention, vigilance, and impulsivity. It evaluates a person's ability to maintain focused attention over time and respond consistently to specific stimuli."
                }
              },
              {
                "@type": "Question",
                "name": "How long does a CPT test take?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "A standard CPT test typically takes 15-20 minutes to complete. The duration is intentionally set to effectively measure sustained attention and detect potential attention fluctuations over time."
                }
              },
              {
                "@type": "Question",
                "name": "What can CPT results indicate?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "CPT results can indicate attention difficulties, impulsivity levels, and vigilance capabilities. The test is often used as part of ADHD assessments and cognitive function evaluations."
                }
              },
              {
                "@type": "Question",
                "name": "How can I improve my CPT performance?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Regular practice of attention-focused activities, adequate sleep, proper nutrition, and stress management can help improve CPT performance. Mindfulness exercises and cognitive training may also be beneficial."
                }
              }
            ]
          })
        }}
      />

      <div className="w-full mx-auto py-0 space-y-16">
        <div className="banner w-full h-[550px] flex flex-col justify-center items-center bg-blue-theme text-white relative">
          {gameState === 'start' && (
            <div className='flex flex-col justify-center items-center'>
              <i className="fas fa-bullseye text-9xl text-white mb-8 animate-fade cursor-pointer"></i>
              <h1 className="text-4xl font-bold text-center mb-4">{t('h1')}</h1>
              <p className="text-lg text-center mb-8">
                {t('description')}<br />
              </p>

              {/* Duration selector */}
              <div className="flex flex-col items-center gap-4 mb-12">
                <h2 className="text-xl font-semibold">{t('selectDuration')}</h2>
                <div className="flex gap-3">
                  {durationOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => setSelectedDuration(option.value)}
                      className={`px-4 py-2 rounded-lg transition-colors duration-200
                        ${selectedDuration === option.value 
                          ? 'bg-white text-blue-600 font-semibold' 
                          : 'bg-white/10 hover:bg-white/20'}`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-4">
                <Button 
                  onClick={startTest}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3"
                >
                  {t('startButton')}
                </Button>
              </div>
            </div>
          )}

          {gameState === 'test' && (
            <div 
              className="flex flex-col items-center w-full h-full justify-center cursor-pointer"
              onClick={() => {
                console.log('Click event triggered');
                handleClick();
              }}
            >
              <div className="text-9xl font-bold mb-4 h-[144px] flex items-center justify-center">
                {currentLetter}
              </div>
              <div className="w-full max-w-[400px] h-2 bg-white/20 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-white transition-all duration-100"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}

          {gameState === 'result' && (
            <div className='flex flex-col justify-center items-center max-w-2xl mx-auto p-8 bg-white/10 rounded-xl backdrop-blur-sm'>
              <h2 className="text-4xl font-bold mb-8">{t('results')}</h2>
              <div className="w-full grid grid-cols-2 gap-4">
                <div className="flex justify-between items-center p-4 bg-white/5 rounded-lg">
                  <span>{t('correctResponses')}:</span>
                  <span className="font-bold text-xl">{results.correctResponses}</span>
                </div>
                <div className="flex justify-between items-center p-4 bg-white/5 rounded-lg">
                  <span>{t('omissionErrors')}:</span>
                  <span className="font-bold text-xl">{results.omissionErrors}</span>
                </div>
                <div className="flex justify-between items-center p-4 bg-white/5 rounded-lg">
                  <span>{t('commissionErrors')}:</span>
                  <span className="font-bold text-xl">{results.commissionErrors}</span>
                </div>
                <div className="flex justify-between items-center p-4 bg-white/5 rounded-lg">
                  <span>{t('averageReactionTime')}:</span>
                  <span className="font-bold text-xl">{Math.round(results.averageReactionTime)}ms</span>
                </div>
                <div className="flex justify-between items-center p-4 bg-white/5 rounded-lg col-span-2">
                  <span>{t('accuracyRate')}:</span>
                  <span className="font-bold text-xl">
                    {((results.correctResponses / results.totalTrials) * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="flex justify-between items-center p-4 bg-white/5 rounded-lg col-span-2">
                  <span>{t('testDuration')}:</span>
                  <span className="font-bold text-xl">
                    {selectedDuration / 60000} {t('minutes')}
                  </span>
                </div>
              </div>
              <div className="flex gap-4 mt-8">
                <Button 
                  onClick={() => setGameState('start')}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3"
                >
                  {t('tryAgain')}
                </Button>
              </div>
            </div>
          )}
        </div>
        <div className="container mx-auto py-0 space-y-16">
          <div className="container mx-auto px-4 py-8 max-w-6xl">
            <div className="grid md:grid-cols-1 gap-8 items-center">
              <div className="w-full">
                <h2 className="text-xl mb-4 font-semibold">{t('thirtySecondIntervals')}</h2>
                <div className="overflow-x-auto shadow-lg rounded-lg">
                  <table className="w-full text-sm bg-white dark:bg-gray-800">
                    <thead>
                      <tr className="bg-gray-50 dark:bg-gray-700">
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          {t('timePeriod')}
                        </th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          {t('correct')}
                        </th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          {t('errors')}
                        </th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          {t('omissions')}
                        </th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          {t('averageResponse')}
                        </th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          {t('accuracy')}
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                      {Array.from({ length: Math.ceil(testDuration / 30000) }).map((_, index) => {
                        const startTime = index * 30000;
                        const endTime = Math.min((index + 1) * 30000, testDuration);
                        
                        // 找到这个时间段的统计数据
                        const periodStat = periodStats.find(
                          stat => stat.startTime === startTime
                        ) || {
                          correctResponses: 0,
                          commissionErrors: 0,
                          omissionErrors: 0,
                          reactionTimes: []
                        };
                        
                        const periodAvgRT = periodStat.reactionTimes.length > 0 
                          ? Math.round(periodStat.reactionTimes.reduce((a, b) => a + b) / periodStat.reactionTimes.length)
                          : 0;
                          
                        const total = periodStat.correctResponses + 
                          periodStat.commissionErrors + 
                          periodStat.omissionErrors;
                          
                        const periodAccuracy = total > 0
                          ? ((periodStat.correctResponses / total) * 100).toFixed(1)
                          : '0.0';

                        return (
                          <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                            <td className="px-6 py-4 whitespace-nowrap text-gray-600 dark:text-gray-300 time-period">
                              {Math.round(startTime/1000)}-{Math.round(endTime/1000)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-center text-gray-600 dark:text-gray-300">
                              {periodStat.correctResponses}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-center text-gray-600 dark:text-gray-300">
                              {periodStat.commissionErrors}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-center text-gray-600 dark:text-gray-300">
                              {periodStat.omissionErrors}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-center text-gray-600 dark:text-gray-300">
                              {periodAvgRT}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-center text-gray-600 dark:text-gray-300">
                              <span className={`px-2 py-1 rounded-full text-xs ${
                                parseFloat(periodAccuracy) >= 80 ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                                parseFloat(periodAccuracy) >= 60 ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                                'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                              }`}>
                                {periodAccuracy}%
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
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
          Understanding the Continuous Performance Test (CPT)
        </h2>
        
        <div className="prose prose-blue max-w-none">
          <p className="text-gray-700 leading-relaxed mb-4">
            The Continuous Performance Test (CPT) is a sophisticated neuropsychological tool that measures sustained attention, vigilance, and response inhibition. This standardized computer-based test helps evaluate attention patterns and cognitive control mechanisms essential for daily functioning.
          </p>
          
          <p className="text-gray-700 leading-relaxed mb-4">
            During the test, participants respond to specific target stimuli while ignoring non-target stimuli, providing valuable insights into attention maintenance and impulse control. The test's duration and repetitive nature are specifically designed to assess sustained attention capabilities.
          </p>
          
          <p className="text-gray-700 leading-relaxed">
            CPT results can be particularly useful in educational and clinical settings, helping identify attention-related challenges and informing intervention strategies. Regular testing can also track improvements in attention and cognitive control over time.
          </p>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="max-w-4xl mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          Frequently Asked Questions About CPT
        </h2>
        
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              What does a CPT test measure?
            </h3>
            <p className="text-gray-700">
              The Continuous Performance Test (CPT) measures sustained attention, vigilance, and impulsivity. It evaluates a person's ability to maintain focused attention over time and respond consistently to specific stimuli.
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              How long does a CPT test take?
            </h3>
            <p className="text-gray-700">
              A standard CPT test typically takes 15-20 minutes to complete. The duration is intentionally set to effectively measure sustained attention and detect potential attention fluctuations over time.
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              What can CPT results indicate?
            </h3>
            <p className="text-gray-700">
              CPT results can indicate attention difficulties, impulsivity levels, and vigilance capabilities. The test is often used as part of ADHD assessments and cognitive function evaluations.
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              How can I improve my CPT performance?
            </h3>
            <p className="text-gray-700">
              Regular practice of attention-focused activities, adequate sleep, proper nutrition, and stress management can help improve CPT performance. Mindfulness exercises and cognitive training may also be beneficial.
            </p>
          </div>
        </div>
      </section>

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
          <div className="relative bg-white/90 dark:bg-gray-800/90 p-6 rounded-xl shadow-xl max-w-md mx-4">
            <button 
              onClick={() => setShowTutorial(false)}
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
            >
              <i className="fas fa-times text-xl"></i>
            </button>
            
            <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white flex items-center gap-2">
              <i className="fas fa-bullseye text-blue-500"></i>
              {t("tutorial.howToPlay")}
            </h3>
            
            <ol className="list-decimal list-inside space-y-3 text-gray-700 dark:text-gray-300">
              <li className="flex items-center gap-2 p-2 rounded-lg hover:bg-black/5">
                <span className="text-blue-500">
                  <i className="fas fa-eye w-6"></i>
                </span>
                {t("tutorial.step1")} {/* 注意屏幕上显示的字母 */}
              </li>
              <li className="flex items-center gap-2 p-2 rounded-lg hover:bg-black/5">
                <span className="text-purple-500">
                  <i className="fas fa-keyboard w-6"></i>
                </span>
                {t("tutorial.step2")} {/* 当看到字母 'X' 时按空格键 */}
              </li>
              <li className="flex items-center gap-2 p-2 rounded-lg hover:bg-black/5">
                <span className="text-green-500">
                  <i className="fas fa-clock w-6"></i>
                </span>
                {t("tutorial.step3")} {/* 保持专注，测试持续5分钟 */}
              </li>
              <li className="flex items-center gap-2 p-2 rounded-lg hover:bg-black/5">
                <span className="text-yellow-500">
                  <i className="fas fa-chart-line w-6"></i>
                </span>
                {t("tutorial.step4")} {/* 测试结束后查看详细分析 */}
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