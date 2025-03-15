import { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import GamesList from '@/components/GamesList'

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('games')
  
  return {
    title: t('pageTitle'),
    description: t('pageDescription'),
  }
}

export default async function GamesPage() {
  const t = await getTranslations('games')

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-6">{t('title')}</h1>
      <p className="text-muted-foreground mb-8">{t('description')}</p>
      <GamesList />
    </div>
  )
} 