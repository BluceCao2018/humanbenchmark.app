'use client'

import { Card } from '@/components/ui/card'
import Link from 'next/link'
import Image from 'next/image'
import { useTranslations } from 'next-intl'

const games = [
  {
    id: 'reaction-time',
    title: 'Reaction Time Games',
    description: 'Improve your reaction speed with scientific methods',
    image: '/images/games/reaction.jpg',
    category: 'reaction',
    articles: 5
  },
  {
    id: 'memory',
    title: 'Memory Games',
    description: 'Enhance your memory capacity through training',
    image: '/images/games/memory.jpg',
    category: 'memory',
    articles: 5
  },
  {
    id: 'attention',
    title: 'Attention Games',
    description: 'Focus training and concentration improvement',
    image: '/images/games/attention.jpg',
    category: 'attention',
    articles: 5
  }
]

export default function GamesList() {
  const t = useTranslations('games')

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {games.map((game) => (
        <Link key={game.id} href={`/games/${game.id}`}>
          <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-200">
            <div className="relative h-48">
              <Image
                src={game.image}
                alt={game.title}
                fill
                className="object-cover"
              />
            </div>
            <div className="p-4">
              <h3 className="font-semibold text-lg mb-2">{game.title}</h3>
              <p className="text-muted-foreground text-sm">{game.description}</p>
              <div className="mt-3 text-xs text-muted-foreground">
                {game.articles} articles
              </div>
            </div>
          </Card>
        </Link>
      ))}
    </div>
  )
} 