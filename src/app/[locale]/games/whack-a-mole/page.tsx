'use client'

import { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import WhackAMoleGame from '@/components/games/WhackAMoleGame'
import '@fortawesome/fontawesome-free/css/all.min.css'



export default function WhackAMolePage() {
  //const t = getTranslations('games.whackAMole')

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
                "name": "What is a good Whack-a-Mole score?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "A good score in Whack-a-Mole is typically above 40 points in 60 seconds. Professional players can achieve scores above 60 points."
                }
              },
              // ... 更多FAQ
            ]
          })
        }}
      />

      <div className="w-full mx-auto py-0 space-y-16">
        <div className="banner w-full h-[550px] flex flex-col justify-center items-center bg-blue-theme">
          <WhackAMoleGame />
        </div>

        <div className="container mx-auto py-0 space-y-16">
          {/* SEO Content Section */}
          <section className="max-w-4xl mx-auto px-4 py-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Understanding the Whack-a-Mole Game
            </h2>
            
            <div className="prose prose-blue max-w-none">
              <p className="text-gray-700 leading-relaxed mb-4">
                The Whack-a-Mole game is a classic reaction time test that challenges your hand-eye coordination and reflexes...
              </p>
              {/* ... 更多内容 ... */}
            </div>
          </section>

          {/* FAQ Section */}
          <section className="max-w-4xl mx-auto px-4 py-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              FAQ About Whack-a-Mole
            </h2>
            
            <div className="space-y-6">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  What is a good Whack-a-Mole score?
                </h3>
                <p className="text-gray-700">
                  A good score in Whack-a-Mole is typically above 40 points in 60 seconds...
                </p>
              </div>
              {/* ... 更多FAQ ... */}
            </div>
          </section>
        </div>
      </div>
    </>
  )
} 