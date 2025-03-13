'use client'

import ReactionTimeGame from '@/app/[locale]/tests/components/ReactionTimeGame'

export default function HomeReactionGame() {
  const handleResultUpdate = (time: number) => {
    console.log('Reaction time:', time)
  }

  const handleShareOpen = () => {
    window.location.href = '/tests/reactiontime'
  }

  return (
    <ReactionTimeGame 
      onResultUpdate={handleResultUpdate}
      onShareOpen={handleShareOpen}
    />
  )
}