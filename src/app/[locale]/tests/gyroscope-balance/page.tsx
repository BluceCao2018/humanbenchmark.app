'use client'
import { useState, useEffect, useRef } from 'react'
import { useTranslations } from 'next-intl'
import { FaPlay, FaTrophy, FaExclamationTriangle } from 'react-icons/fa'
import { motion, useMotionValue, useSpring } from 'framer-motion'

interface GameState {
  status: 'waiting' | 'calibrating' | 'playing' | 'result' | 'error'
  score: number
  timeRemaining: number
  bestScore: number
  error?: 'desktop' | 'nogyroscope' | 'permission'
}

export default function GyroscopeBalance() {
  const t = useTranslations('gyroscope')
  const [gameState, setGameState] = useState<GameState>({
    status: 'waiting',
    score: 0,
    timeRemaining: 30,
    bestScore: 0
  })
  
  const ballX = useMotionValue(0)
  const ballY = useMotionValue(0)
  const springX = useSpring(ballX, { stiffness: 300, damping: 20 })
  const springY = useSpring(ballY, { stiffness: 300, damping: 20 })
  
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const scoreRef = useRef<number>(0)
  const gyroscopeAvailable = useRef<boolean>(false)

  useEffect(() => {
    // 检查设备是否支持陀螺仪
    if (typeof window !== 'undefined') {
      // 检查是否在移动设备上
      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)
      if (!isMobile) {
        setGameState(prev => ({ 
          ...prev, 
          status: 'error',
          error: 'desktop'
        }))
        return
      }

      // 检查是否是 iOS Safari
      const isIOS = /iPhone|iPad|iPod/.test(navigator.userAgent) && !/CriOS/.test(navigator.userAgent)
      if (isIOS) {
        // 对于 iOS，我们需要等待用户交互后再检查陀螺仪
        gyroscopeAvailable.current = true
        // 检查是否已经有权限
        if (typeof (DeviceOrientationEvent as any).requestPermission === 'function') {
          setGameState(prev => ({
            ...prev,
            status: 'error',
            error: 'permission'
          }))
        } else {
          // 如果不需要请求权限，直接初始化游戏
          initializeGame()
        }
        return
      }

      // 对于其他设备，检查陀螺仪API是否可用
      if (!window.DeviceOrientationEvent) {
        setGameState(prev => ({ 
          ...prev, 
          status: 'error',
          error: 'nogyroscope'
        }))
        return
      }

      // 标记设备支持陀螺仪
      gyroscopeAvailable.current = true
    }
  }, [])

  const requestPermissionAndStart = async () => {
    try {
      // iOS Safari 特殊处理
      if (typeof (DeviceOrientationEvent as any).requestPermission === 'function') {
        console.log('Requesting device orientation permission...')
        try {
          // 直接请求权限
          const response = await (DeviceOrientationEvent as any).requestPermission()
          console.log('Permission response:', response)
          
          if (response === 'granted') {
            console.log('Permission granted, testing gyroscope...')
            let hasReceivedData = false
            
            // 测试陀螺仪是否真的可用
            const testHandler = (event: DeviceOrientationEvent) => {
              console.log('Orientation event received:', {
                alpha: event.alpha,
                beta: event.beta,
                gamma: event.gamma
              })
              
              if (event.beta !== null && event.gamma !== null) {
                hasReceivedData = true
                window.removeEventListener('deviceorientation', testHandler)
                console.log('Valid gyroscope data received, starting game')
                initializeGame()
              }
            }
            
            window.addEventListener('deviceorientation', testHandler)
            
            // 如果3秒内没有收到任何数据，认为陀螺仪不可用
            setTimeout(() => {
              window.removeEventListener('deviceorientation', testHandler)
              if (!hasReceivedData) {
                console.log('No gyroscope data received after timeout')
                setGameState(prev => ({
                  ...prev,
                  status: 'error',
                  error: 'nogyroscope'
                }))
              }
            }, 3000)
          } else {
            console.log('Permission denied by user')
            setGameState(prev => ({
              ...prev,
              status: 'error',
              error: 'permission'
            }))
          }
        } catch (error) {
          console.error('Error during permission request:', error)
          throw error
        }
      } else {
        // 非 iOS 设备直接开始游戏
        console.log('Permission not required, starting game directly')
        initializeGame()
      }
    } catch (error) {
      console.error('Error in requestPermissionAndStart:', error)
      setGameState(prev => ({
        ...prev,
        status: 'error',
        error: 'permission'
      }))
    }
  }

  const handleDeviceOrientation = (event: DeviceOrientationEvent) => {
    // 添加调试日志
    console.log('Device orientation event:', {
      status: gameState.status,
      beta: event.beta,
      gamma: event.gamma
    })
    
    if (gameState.status !== 'playing') {
      console.log('Game not in playing state, ignoring orientation event')
      return
    }
    
    // 确保陀螺仪数据有效
    if (event.beta === null || event.gamma === null) {
      console.log('Invalid gyroscope data:', event)
      return
    }
    
    const gamma = event.gamma // 左右倾斜 (-90 to 90)
    const beta = event.beta   // 前后倾斜 (-180 to 180)
    
    // 将陀螺仪数据映射到球的位置
    const maxTilt = 45
    const newX = (gamma / maxTilt) * 150
    const newY = ((beta - 90) / maxTilt) * 150
    
    // 添加调试日志
    console.log('Ball position:', { newX, newY })
    
    ballX.set(newX)
    ballY.set(newY)
    
    // 计算球到中心的距离
    const distance = Math.sqrt(newX * newX + newY * newY)
    const maxDistance = 150
    
    // 根据球的位置更新分数
    if (distance < maxDistance * 0.3) { // 在中心区域
      scoreRef.current += 2
    } else if (distance < maxDistance * 0.6) { // 在中间区域
      scoreRef.current += 1
    }
    
    setGameState(prev => ({
      ...prev,
      score: scoreRef.current
    }))
  }

  const startGame = () => {
    if (!gyroscopeAvailable.current) {
      setGameState(prev => ({
        ...prev,
        status: 'error',
        error: 'nogyroscope'
      }));
      return;
    }

    requestPermissionAndStart();
  };

  const initializeGame = () => {
    console.log('Initializing game...')
    scoreRef.current = 0
    
    // 先移除可能存在的旧事件监听器
    window.removeEventListener('deviceorientation', handleDeviceOrientation)
    if (timerRef.current) {
      clearInterval(timerRef.current)
    }
    
    // 重置球的位置
    ballX.set(0)
    ballY.set(0)
    
    // 更新游戏状态
    setGameState(prev => ({
      ...prev,
      status: 'playing',
      score: 0,
      timeRemaining: 30
    }))

    // 添加新的事件监听器
    console.log('Adding device orientation event listener...')
    window.addEventListener('deviceorientation', handleDeviceOrientation)
    
    // 开始倒计时
    console.log('Starting game timer...')
    timerRef.current = setInterval(() => {
      setGameState(prev => {
        if (prev.timeRemaining <= 1) {
          console.log('Game finished!')
          clearInterval(timerRef.current!)
          window.removeEventListener('deviceorientation', handleDeviceOrientation)
          return {
            ...prev,
            status: 'result',
            timeRemaining: 0,
            bestScore: Math.max(prev.bestScore, prev.score)
          }
        }
        return {
          ...prev,
          timeRemaining: prev.timeRemaining - 1
        }
      })
    }, 1000)
  }

  const resetGame = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
    }
    window.removeEventListener('deviceorientation', handleDeviceOrientation)
    setGameState({
      status: 'waiting',
      score: 0,
      timeRemaining: 30,
      bestScore: gameState.bestScore
    })
    ballX.set(0)
    ballY.set(0)
  }

  return (
    <div 
      className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white p-4"
      onClick={gameState.status === 'waiting' ? startGame : undefined}
    >
      {/* 游戏状态显示 */}
      <div className="text-center mb-8">
        {gameState.status === 'waiting' && (
          <>
            <FaPlay className="text-6xl mb-4 animate-pulse" />
            <h1 className="text-2xl font-bold mb-2">{t('tapToStart')}</h1>
            <p className="text-gray-400">{t('keepPhoneLevel')}</p>
          </>
        )}
        
        {gameState.status === 'error' && (
          <>
            <FaExclamationTriangle className="text-6xl mb-4 text-yellow-500" />
            <h1 className="text-2xl font-bold mb-2">
              {gameState.error === 'desktop' && t('desktopNotSupported')}
              {gameState.error === 'nogyroscope' && t('deviceNotSupported')}
              {gameState.error === 'permission' && t('permissionDenied')}
            </h1>
            <div className="text-gray-400 whitespace-pre-line mb-4">
              {gameState.error === 'desktop' && t('pleaseUsePhone')}
              {gameState.error === 'nogyroscope' && t('needGyroscope')}
              {gameState.error === 'permission' && (
                <div className="text-left p-4 bg-gray-800 rounded-lg">
                  <p className="font-bold mb-2 text-yellow-400">⚠️ 重要提示 / Important Note:</p>
                  <p className="mb-4">该功能需要使用 HTTPS 安全连接 / This feature requires HTTPS secure connection</p>
                  
                  <p className="font-bold mb-2">请按以下步骤操作 / Please follow these steps:</p>
                  <ol className="list-decimal list-inside space-y-2">
                    <li>确保网址以 https:// 开头 / Make sure the URL starts with https://</li>
                    <li>如果不是，请使用 HTTPS 版本访问 / If not, please access using HTTPS version</li>
                    <li>然后点击下方"请求权限"按钮 / Then tap "Request Permission" button below</li>
                    <li>在弹出的系统对话框中选择"允许" / Choose "Allow" in the system popup</li>
                  </ol>
                  
                  <p className="mt-4 text-yellow-400">
                    <strong>如果使用 HTTPS 后仍无法看到权限弹窗 / If still no popup after using HTTPS:</strong>
                  </p>
                  <ol className="list-decimal list-inside space-y-2 mt-2">
                    <li>完全关闭 Safari（从后台任务中移除）/ Completely close Safari (remove from background tasks)</li>
                    <li>重新打开 Safari / Reopen Safari</li>
                    <li>使用 HTTPS 访问本网站 / Visit this website using HTTPS</li>
                    <li>点击"请求权限"按钮 / Tap "Request Permission" button</li>
                  </ol>
                </div>
              )}
            </div>
            {gameState.error === 'permission' && (
              <div className="mt-4">
                <button
                  className="bg-blue-500 hover:bg-blue-600 px-6 py-2 rounded-full"
                  onClick={requestPermissionAndStart}
                >
                  {t('requestPermission')}
                </button>
              </div>
            )}
          </>
        )}
        
        {gameState.status === 'playing' && (
          <div className="text-xl">
            <div className="mb-2">{t('score')}: {gameState.score}</div>
            <div>{t('time')}: {gameState.timeRemaining}s</div>
          </div>
        )}
        
        {gameState.status === 'result' && (
          <>
            <FaTrophy className="text-6xl mb-4 text-yellow-400" />
            <h1 className="text-2xl font-bold mb-2">
              {t('finalScore')}: {gameState.score}
            </h1>
            <p className="text-gray-400 mb-4">
              {t('bestScore')}: {gameState.bestScore}
            </p>
            <button
              className="bg-blue-500 hover:bg-blue-600 px-6 py-2 rounded-full"
              onClick={resetGame}
            >
              {t('playAgain')}
            </button>
          </>
        )}
      </div>

      {/* 游戏区域 */}
      <div className="relative w-80 h-80 bg-gray-800 rounded-full border-4 border-gray-700">
        {/* 目标区域 */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-24 h-24 rounded-full border-2 border-green-500 opacity-30" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-48 h-48 rounded-full border-2 border-yellow-500 opacity-30" />
        
        {/* 小球 */}
        <motion.div
          className="absolute w-6 h-6 bg-white rounded-full"
          style={{
            x: springX,
            y: springY,
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)'
          }}
        />
      </div>
    </div>
  )
} 