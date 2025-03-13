'use client'
import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { useTranslations } from 'next-intl'

// Types
type GameState = 'waiting' | 'ready' | 'toosoon' | 'testing' | 'result' | 'final'

interface ReactionTimeGameProps {
  onResultUpdate?: (time: number) => void
  onShareOpen?: () => void
}

// Custom Hook
function useReactionGame(onResultUpdate?: (time: number) => void) {
  const t = useTranslations('reactionTime')
  const [gameState, setGameState] = useState<GameState>('waiting')
  const [startTime, setStartTime] = useState(0)
  const [reactionTime, setReactionTime] = useState(0)
  const [attempts, setAttempts] = useState<number[]>([])
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const averageTime = useMemo(() => {
    return attempts.length ? Math.round(attempts.reduce((a, b) => a + b, 0) / attempts.length) : 0
  }, [attempts])

  const getGameStateMessage = useCallback(() => {
    switch (gameState) {
      case 'waiting':
        return { 
          message: t('h1'), 
          description: t('description'), 
          icon: 'fas fa-bolt' 
        }
      case 'ready':
        return { 
          message: t('waitForGreen'), 
          description: '', 
          icon: 'fas fa-hourglass-start' 
        }
      case 'toosoon':
        return { 
          message: t('tooSoon'), 
          description: t('clickToTryAgain'), 
          icon: 'fas fa-exclamation-triangle' 
        }
      case 'testing':
        return { 
          message: t('click'), 
          description: '', 
          icon: 'fas fa-play' 
        }
      case 'result':
        return { 
          message: `<h3>${t('reactionTime')}</h3>\r\n${reactionTime} ms`, 
          description: `${t('attempt')} ${attempts.length}/5`, 
          icon: 'fas fa-check' 
        }
      case 'final':
        return {
          message: `<h3>${averageTime} ms</h3>`,
          description: t('averageTime'),
          icon: 'fas fa-trophy'
        }
    }
  }, [gameState, reactionTime, attempts.length, averageTime, t])

  const handleStart = useCallback(() => {
    console.log("handleStart called, current state:", gameState)
    
    if (timerRef.current) {
      clearTimeout(timerRef.current)
    }

    if (gameState === 'waiting') {
      setGameState('ready')
      const delay = Math.floor(Math.random() * 4000 + 1000)
      console.log("等待随机变绿, 延迟:", delay)
      
      requestAnimationFrame(() => {
        timerRef.current = setTimeout(() => {
          console.log("计时器回调执行")
          setGameState('testing')
          setStartTime(Date.now())
          timerRef.current = null
        }, delay)
      })
    }
  }, [gameState])

  // 先声明 startImmediately
  const startImmediately = useCallback(() => {
    const delay = Math.floor(Math.random() * 4000 + 1000)
    setGameState('ready')
    
    requestAnimationFrame(() => {
      timerRef.current = setTimeout(() => {
        setGameState('testing')
        setStartTime(Date.now())
        timerRef.current = null
      }, delay)
    })
  }, [])

  // 然后在 handleClick 中使用
  const handleClick = useCallback(async () => {
    if (gameState === 'waiting') {
      handleStart()
      return
    }
    const clearTime = Date.now()
    
    if (timerRef.current) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }

    switch (gameState) {
      case 'ready':
        setGameState('toosoon')
        break
      case 'toosoon':
        setGameState('waiting')
        break
      case 'testing':
        const endTime = Date.now()
        const time = endTime - startTime - (endTime - clearTime)
        setReactionTime(time)
        
        const newAttempts = [...attempts, time]
        setAttempts(newAttempts)
        
        if (newAttempts.length >= 5) {
          setGameState('final')
          // 发送所有结果到后端
          try {
            await fetch('/api/reaction-time', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ 
                reactionTimes: newAttempts,
                averageTime: averageTime
              }),
            })
          } catch (error) {
            console.error('Error saving results:', error)
          }
        } else {
          setGameState('result')
        }
        break
      case 'result':
        setGameState('waiting')
        startImmediately()
        break
      case 'final':
        // 清空所有状态
        setAttempts([])
        setReactionTime(0)
        setStartTime(0)
        setGameState('waiting')
        break
      default:
        handleStart()
    }
  }, [gameState, startTime, attempts, averageTime, handleStart, startImmediately])

  // 添加状态监听
  useEffect(() => {
    console.log("游戏状态变化:", gameState)
  }, [gameState])

  return {
    gameState,
    reactionTime,
    attempts,
    averageTime,
    setGameState,
    setAttempts,
    setReactionTime,
    setStartTime,
    handleClick,
    handleStart,
    getGameStateMessage,
    cleanup: () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current)
      }
    },
    startImmediately,
  }
}

// 桌面端进度指示器
const DesktopProgressIndicator = ({ attempts }: { attempts: number[] }) => {
  return (
    <div className="hidden md:flex absolute left-8 top-1/2 -translate-y-1/2 flex-col gap-4">
      {[...Array(5)].map((_, index) => (
        <div key={index} className="flex items-center gap-3">
          <div 
            className={`
              w-3 h-3 rounded-full transition-all duration-300
              ${attempts[index] ? 'bg-white' : 'bg-white/30'}
            `}
          />
          <div className={`
            transition-all duration-300
            ${attempts[index] 
              ? 'opacity-100 translate-x-0' 
              : 'opacity-0 -translate-x-2'}
          `}>
            <span className="text-white text-sm font-medium">
              {attempts[index] ? `${attempts[index]}ms` : ''}
            </span>
          </div>
        </div>
      ))}
    </div>
  )
}

// 移动端进度指示器
const MobileProgressIndicator = ({ attempts }: { attempts: number[] }) => {
  return (
    <div className="md:hidden absolute top-4 left-1/2 -translate-x-1/2 flex gap-2">
      {[...Array(5)].map((_, index) => (
        <div key={index} className="flex flex-col items-center">
          <div 
            className={`
              w-2 h-2 rounded-full mb-1 transition-all duration-300
              ${attempts[index] ? 'bg-white' : 'bg-white/30'}
            `}
          />
          <span className={`
            text-xs text-white font-medium transition-all duration-300
            ${attempts[index] 
              ? 'opacity-100 scale-100' 
              : 'opacity-0 scale-95'}
          `}>
            {attempts[index] ? `${attempts[index]}` : ''}
          </span>
        </div>
      ))}
    </div>
  )
}

// Main Component
export default function ReactionTimeGame({ onResultUpdate, onShareOpen }: ReactionTimeGameProps) {
  const t = useTranslations('reactionTime')
  const {
    gameState,
    reactionTime,
    attempts,
    averageTime,
    setGameState,
    setAttempts,
    setReactionTime,
    setStartTime,
    handleClick,
    handleStart,
    getGameStateMessage,
    cleanup,
    startImmediately,
  } = useReactionGame(onResultUpdate)

  useEffect(() => {
    return cleanup
  }, [cleanup])

  const { message, description, icon } = getGameStateMessage()

  return (
    <div 
      className={`
        relative banner w-full h-[550px] flex flex-col justify-center items-center 
        ${gameState === 'testing' ? '!bg-green-500 hover:!bg-green-600' : 
          gameState === 'ready' ? '!bg-red-500' : 
          'bg-blue-theme'}
        transition-all duration-300 cursor-pointer user-select-none
      `} 
      onClick={handleClick}
    >
      {/* 根据屏幕尺寸显示不同的进度指示器 */}
      {gameState !== 'waiting' && (
        <>
          <DesktopProgressIndicator attempts={attempts} />
          <MobileProgressIndicator attempts={attempts} />
        </>
      )}

      {/* 主要内容 */}
      <div className="flex flex-col items-center">
        <i className={`${icon} text-9xl text-white mb-8 animate-fade`}></i>
        <h1 
          className="text-4xl md:text-5xl lg:text-6xl font-bold text-center mb-4 text-white user-select-none" 
          dangerouslySetInnerHTML={{ __html: message }} 
        />
        <p 
          className="text-3xl text-center mb-20 text-white user-select-none" 
          dangerouslySetInnerHTML={{ __html: description?.replace(/\n/g, '<br />') || ''}} 
        />

       

        {/* 按钮区域 */}
        {(gameState === 'result' || gameState === 'final') && (
          <div className="flex gap-4 mt-6" onClick={e => e.stopPropagation()}>
            <button
              onClick={() => {
                if (gameState === 'final') {
                  // 清空所有状态
                  setAttempts([])
                  setReactionTime(0)
                  setStartTime(0)
                  setGameState('waiting')
                } else {
                  handleClick()
                }
              }}
              className="bg-blue-500 text-white px-6 py-2 rounded-lg 
                        hover:bg-blue-600 transition-colors duration-200
                        flex items-center gap-2"
            >
              <i className={`fas ${gameState === 'final' ? 'fa-redo' : 'fa-forward'}`}></i>
              {gameState === 'final' ? t('tryAgain') : t('continue')}
            </button>
            {/* {gameState === 'final' && (
              <button
                onClick={() => onShareOpen?.()}
                className="bg-green-500 text-white px-6 py-2 rounded-lg 
                         hover:bg-green-600 transition-colors duration-200
                         flex items-center gap-2"
              >
                <i className="fas fa-share-alt"></i>
                {t('share')}
              </button>
            )} */}
          </div>
        )}
      </div>
    </div>
  )
}