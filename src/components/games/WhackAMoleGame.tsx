'use client'

import { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { useTranslations } from 'next-intl'
import Image from 'next/image'

interface Mole {
  id: number
  isActive: boolean
  isGolden: boolean
  position: number
  isHit: boolean
}

interface GameState {
  score: number
  timeLeft: number
  isPlaying: boolean
  highScore: number
  combo: number
  moles: Mole[]
  correctHits: number
  totalHits: number
}

export default function WhackAMoleGame() {
  const t = useTranslations('games.whackAMole')
  const [gameState, setGameState] = useState<GameState>({
    score: 0,
    timeLeft: 60,
    isPlaying: false,
    highScore: 0,
    combo: 0,
    moles: Array(9).fill(null).map((_, index) => ({
      id: index,
      isActive: false,
      isGolden: false,
      position: index,
      isHit: false
    })),
    correctHits: 0,
    totalHits: 0
  })

  const startGame = () => {
    setGameState(prev => ({
      ...prev,
      score: 0,
      timeLeft: 60,
      isPlaying: true,
      combo: 0,
      moles: prev.moles.map(mole => ({ ...mole, isActive: false, isGolden: false }))
    }))
  }

  const whackMole = (moleId: number) => {
    if (!gameState.isPlaying) return

    setGameState(prev => {
      const mole = prev.moles[moleId]
      if (!mole.isActive) return prev

      const pointsEarned = mole.isGolden ? 3 : 1
      const newCombo = prev.combo + 1
      const comboBonus = Math.floor(newCombo / 5)

      return {
        ...prev,
        score: prev.score + pointsEarned + comboBonus,
        combo: newCombo,
        moles: prev.moles.map(m => 
          m.id === moleId ? { ...m, isActive: false, isGolden: false } : m
        ),
        highScore: Math.max(prev.highScore, prev.score + pointsEarned + comboBonus)
      }
    })
  }

  const spawnMole = useCallback(() => {
    if (!gameState.isPlaying) return

    setGameState(prev => {
      const inactiveMoles = prev.moles.filter(mole => !mole.isActive)
      if (inactiveMoles.length === 0) return prev

      const randomMole = inactiveMoles[Math.floor(Math.random() * inactiveMoles.length)]
      const isGolden = Math.random() < 0.05 // 降低到5%的出现概率
      // 或者使用更低的概率
      // const isGolden = Math.random() < 0.03 // 3%的出现概率

      return {
        ...prev,
        moles: prev.moles.map(mole => 
          mole.id === randomMole.id 
            ? { ...mole, isActive: true, isGolden } 
            : mole
        )
      }
    })
  }, [gameState.isPlaying])

  useEffect(() => {
    if (!gameState.isPlaying) return

    const gameTimer = setInterval(() => {
      setGameState(prev => {
        if (prev.timeLeft <= 0) {
          clearInterval(gameTimer)
          return { ...prev, isPlaying: false }
        }
        return { ...prev, timeLeft: prev.timeLeft - 1 }
      })
    }, 1000)

    const spawnTimer = setInterval(spawnMole, 1000)
    const despawnTimer = setInterval(() => {
      setGameState(prev => ({
        ...prev,
        moles: prev.moles.map(mole => 
          mole.isActive ? { ...mole, isActive: false, isGolden: false } : mole
        ),
        combo: 0
      }))
    }, 2000)

    return () => {
      clearInterval(gameTimer)
      clearInterval(spawnTimer)
      clearInterval(despawnTimer)
    }
  }, [gameState.isPlaying, spawnMole])

  return (
    <div className="w-full h-[calc(100vh-100px)] relative">
      <div className="relative w-full h-full bg-[url('/images/games/grass-background.jpg')] bg-cover">
        <div className="absolute top-4 left-1/2 -translate-x-1/2 flex gap-8 bg-black/30 text-white px-6 py-3 rounded-full backdrop-blur-sm z-10">
          <div className="text-2xl font-bold">
            <i className="fas fa-star text-yellow-400 mr-2"></i>
            {gameState.score}
          </div>
          <div className="text-2xl font-bold">
            <i className="fas fa-clock text-blue-400 mr-2"></i>
            {gameState.timeLeft}s
          </div>
          {gameState.combo > 0 && (
            <div className="text-2xl font-bold text-yellow-400">
              <i className="fas fa-fire mr-2"></i>
              x{gameState.combo}
            </div>
          )}
        </div>

        <div className="absolute inset-0 flex items-center justify-center">
          <div className="grid grid-cols-3 gap-8 p-8 w-[900px] h-[600px]">
            {gameState.moles.map((mole) => (
              <div key={mole.id} className="relative h-full flex items-end">
                <div className="absolute bottom-0 left-0 right-0 h-[120px] flex justify-center">
                  <Image
                    src="/images/games/hole.png"
                    alt="Hole"
                    width={150}
                    height={80}
                    className="object-contain"
                  />
                </div>
                
                <div className="absolute bottom-[60px] left-1/2 -translate-x-1/2 w-[100px] h-[120px] overflow-hidden">
                  <div
                    className={`
                      absolute bottom-0 w-full h-full transition-all duration-300 ease-in-out
                      ${mole.isActive ? 'translate-y-0' : 'translate-y-full'}
                      z-10
                    `}
                  >
                    <div 
                      onClick={() => whackMole(mole.id)}
                      className={`
                        relative w-full h-full cursor-pointer
                        ${mole.isHit ? 'animate-hit' : ''}
                      `}
                    >
                      <Image
                        src={mole.isGolden 
                          ? '/images/games/golden-mole.png'
                          : '/images/games/mole.png'
                        }
                        alt="Mole"
                        fill
                        className="object-contain"
                        priority
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {!gameState.isPlaying && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-white/90 p-8 rounded-2xl shadow-2xl text-center max-w-md mx-4">
              {gameState.score > 0 ? (
                <>
                  <h2 className="text-3xl font-bold mb-4">{t('gameOver')}</h2>
                  <div className="space-y-4 mb-6">
                    <div className="text-5xl font-bold text-primary">
                      {gameState.score}
                    </div>
                    <div className="text-xl text-gray-600">{t('finalScore')}</div>
                    {gameState.score > gameState.highScore && (
                      <div className="text-lg text-yellow-500 font-semibold">
                        <i className="fas fa-trophy mr-2"></i>
                        {t('newHighScore')}
                      </div>
                    )}
                  </div>
                  <div className="text-lg mb-6">
                    <div className="text-gray-600">
                      {t('highScore')}: {Math.max(gameState.score, gameState.highScore)}
                    </div>
                    <div className="text-gray-600">
                      {t('accuracy')}: {Math.round((gameState.correctHits / gameState.totalHits) * 100)}%
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <h1 className="text-4xl font-bold mb-4">{t('title')}</h1>
                  <p className="text-gray-600 mb-6">{t('instructions')}</p>
                </>
              )}
              <Button 
                onClick={startGame}
                className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-8 py-4 text-xl rounded-full shadow-lg transition-all"
              >
                <i className="fas fa-play mr-2"></i>
                {gameState.score > 0 ? t('playAgain') : t('startGame')}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
} 