'use client'
import { useState, useEffect, useRef, useCallback } from 'react'
import { useTranslations } from 'next-intl'

// Types
type GameState = 'waiting' | 'ready' | 'toosoon' | 'testing' | 'result'

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
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

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
          description: t('tryAgain'), 
          icon: 'fas fa-check' 
        }
    }
  }, [gameState, reactionTime, t])

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
        setGameState('result')
        // 发送结果到后端
    try {
      const response = await fetch('/api/reaction-time', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          reactionTime: time,
          // 如果有用户ID，可以传入
          // userId: currentUser?.id 
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to save result')
      }
    } catch (error) {
      console.error('Error saving result:', error)
      // 可以添加用户友好的错误提示
    }
        break
      case 'result':
        setGameState('waiting')
        break
      default:
        handleStart()
    }
  }, [gameState, startTime, onResultUpdate, handleStart])

  // 添加状态监听
  useEffect(() => {
    console.log("游戏状态变化:", gameState)
  }, [gameState])

  return {
    gameState,
    reactionTime,
    setGameState,
    handleClick,
    getGameStateMessage,
    cleanup: () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current)
      }
    }
  }
}

// Main Component
export default function ReactionTimeGame({ onResultUpdate, onShareOpen }: ReactionTimeGameProps) {
  const t = useTranslations('reactionTime')
  const {
    gameState,
    setGameState,
    handleClick,
    getGameStateMessage,
    cleanup
  } = useReactionGame(onResultUpdate)

  useEffect(() => {
    return cleanup
  }, [cleanup])

  const { message, description, icon } = getGameStateMessage()

  return (
    <div 
      className={`
        banner w-full h-[550px] flex flex-col justify-center items-center 
        ${gameState === 'testing' ? '!bg-green-500 hover:!bg-green-600' : 
          gameState === 'ready' ? '!bg-red-500' : 
          'bg-blue-theme'}
        transition-all duration-300 cursor-pointer user-select-none
      `} 
      onClick={handleClick}
    >
      <i className={`${icon} text-9xl text-white mb-8 animate-fade`}></i>
      <h1 
        className="text-7xl font-bold text-center mb-4 text-white user-select-none" 
        dangerouslySetInnerHTML={{ __html: message }} 
      />
      <p 
        className="text-3xl text-center mb-20 text-white user-select-none" 
        dangerouslySetInnerHTML={{ __html: description?.replace(/\n/g, '<br />') || ''}} 
      />

      {gameState === 'result' && (
        <div className="flex gap-4" onClick={e => e.stopPropagation()}>
          <button
            onClick={() => setGameState('waiting')}
            className="mt-4 bg-blue-500 text-white px-6 py-2 rounded-lg 
                     hover:bg-blue-600 transition-colors duration-200
                     flex items-center gap-2"
          >
            <i className="fas fa-redo"></i>
            {t('tryAgain')}
          </button>
          <button
            onClick={() => onShareOpen?.()}
            className="mt-4 bg-green-500 text-white px-6 py-2 rounded-lg 
                     hover:bg-green-600 transition-colors duration-200
                     flex items-center gap-2"
          >
            <i className="fas fa-share-alt"></i>
            {t('share')}
          </button>
        </div>
      )}
    </div>
  )
}