'use client'

import { useTranslations } from 'next-intl'
import Link from 'next/link'
import { useState } from 'react'

interface PopularTest {
  name: string
  description: string
  href: string
  icon: string
}

interface TestCategory {
  name: string
  tests: {
    name: string
    href: string
  }[]
}

const goalCategories: TestCategory[] = [
  {
    name: 'Reaction',
    tests: [
      { name: 'Reaction Time Test', href: '/tests/reactiontime' },
      { name: 'Audio Reaction Test', href: '/tests/audio-reaction-time' }
    ]
  },
  {
    name: 'Hearing',
    tests: [
      { name: 'Hearing Frequency Test', href: '/tests/hearing-frequency-test' },
      { name: 'Perfect Pitch Test', href: '/tests/perfect-pitch' }
    ]
  },
  {
    name: 'Vision',
    tests: [
      { name: 'Color Blindness Test', href: '/tests/color-blindness-test' },
      { name: 'Shades of Gray Test', href: '/tests/gray-shades-test' },
      { name: 'Color Perception Test', href: '/tests/color-perception-test' }
    ]
  },
  {
    name: 'Memory',
    tests: [
      { name: 'Sequence Test', href: '/tests/sequence' },
      { name: 'Number Test', href: '/tests/number-memory' },
      { name: 'Verbal Test', href: '/tests/verbal-memory' },
      { name: 'Chimp Test', href: '/tests/chimp' }
    ]
  }
]

const popularTests: PopularTest[] = [
  {
    name: 'hearingFrequency',
    description: 'Test your hearing range from 20Hz to 20kHz',
    href: '/tests/hearing-frequency-test',
    icon: 'fa-ear-listen'
  },
  {
    name: 'audioReaction',
    description: 'Measure your reaction time to sound',
    href: '/tests/audio-reaction-time',
    icon: 'fa-volume-high'
  },
  {
    name: 'colorBlindness',
    description: 'Check your color vision ability',
    href: '/tests/color-blindness-test',
    icon: 'fa-eye'
  },
  {
    name: 'reactionTime',
    description: 'Test your visual reaction speed',
    href: '/tests/reactiontime',
    icon: 'fa-bolt'
  }
]

export default function Hero() {
  const t = useTranslations('hero')
  const [showTestModal, setShowTestModal] = useState(false)

  return (
    <section className="relative bg-blue-theme min-h-[600px] flex items-center">
      <div className="container mx-auto px-4 py-16 sm:py-20">
        <div className="max-w-5xl mx-auto text-center">
          {/* H1 Title */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-6">
            {t('title')}
          </h1>

          {/* Value Proposition */}
          <p className="text-lg sm:text-xl text-blue-50 mb-10 max-w-3xl mx-auto">
            {t('valueProp')}
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
            <button
              onClick={() => setShowTestModal(true)}
              className="px-8 py-4 bg-white text-blue-600 hover:bg-blue-50 text-lg font-semibold rounded-lg shadow-lg transition-all duration-200 transform hover:scale-105"
            >
              {t('startTest')}
            </button>
            <Link
              href="#all-tests"
              className="px-8 py-4 bg-blue-700 hover:bg-blue-800 text-white text-lg font-semibold rounded-lg shadow-md border-2 border-blue-500 hover:border-blue-400 transition-all duration-200"
            >
              {t('browseAll')}
            </Link>
          </div>

          {/* Goal Categories */}
          <div className="text-left max-w-4xl mx-auto mb-12">
            <h2 className="text-2xl font-semibold text-white mb-6 text-center">
              {t('chooseByGoal')}
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {goalCategories.map((category) => (
                <div key={category.name} className="bg-white/10 backdrop-blur-sm p-4 rounded-xl border border-white/20">
                  <h3 className="text-lg font-semibold text-white mb-3 text-center">
                    {category.name}
                  </h3>
                  <div className="space-y-2">
                    {category.tests.map((test) => (
                      <Link
                        key={test.href}
                        href={test.href}
                        className="block text-sm text-blue-100 hover:text-white hover:bg-white/10 px-2 py-1 rounded transition-colors"
                      >
                        {test.name}
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Popular Tests Grid */}
          <div className="text-left max-w-4xl mx-auto">
            <h2 className="text-2xl font-semibold text-white mb-6 text-center">
              {t('popularTests')}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {popularTests.map((test) => (
                <Link
                  key={test.href}
                  href={test.href}
                  className="group bg-white/10 backdrop-blur-sm p-6 rounded-xl shadow-md hover:bg-white/20 transition-all duration-200 transform hover:-translate-y-1 border border-white/20 hover:border-white/30"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center group-hover:bg-white/30 transition-colors">
                      <i className={`fa-solid ${test.icon} text-white text-xl`}></i>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-white mb-1">
                        {t(`tests.${test.name}.name`)}
                      </h3>
                      <p className="text-sm text-blue-100">
                        {t(`tests.${test.name}.description`)}
                      </p>
                    </div>
                    <div className="flex-shrink-0">
                      <i className="fa-solid fa-chevron-right text-blue-200 group-hover:text-white transition-colors"></i>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Test Selection Modal */}
      {showTestModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowTestModal(false)}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-gray-900">
                  {t('modal.title')}
                </h3>
                <button
                  onClick={() => setShowTestModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <i className="fa-solid fa-xmark text-2xl"></i>
                </button>
              </div>
              <div className="space-y-3">
                {popularTests.map((test) => (
                  <Link
                    key={test.href}
                    href={test.href}
                    onClick={() => setShowTestModal(false)}
                    className="block p-4 rounded-lg hover:bg-blue-50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <i className={`fa-solid ${test.icon} text-blue-600`}></i>
                      <span className="font-medium text-gray-900">
                        {t(`tests.${test.name}.name`)}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
