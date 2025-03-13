'use client'
import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import Image from 'next/image'
import '@fortawesome/fontawesome-free/css/all.min.css'
import SharePoster from '@/components/SharePoster'
import ReactionTimeGame from '@/app/[locale]/tests/components/ReactionTimeGame'

interface RankingResult {
  reactionTime: number
  timestamp: number
}

interface Rankings {
  regionalRanking: { name: string; data: RankingResult[] }
  nationalRanking: { name: string; data: RankingResult[] }
  globalRanking: { name: string; data: RankingResult[] }
  cityRanking: { name: string; data: RankingResult[] }
}

export default function ReactionTime() {
  const t = useTranslations('reactionTime')
  const [results, setResults] = useState<Rankings>({
    regionalRanking: { name: '', data: [] },
    nationalRanking: { name: '', data: [] },
    globalRanking: { name: '', data: [] },
    cityRanking: { name: '', data: [] }
  })
  const [isShareOpen, setIsShareOpen] = useState(false)
  const [reactionTime, setReactionTime] = useState(0)

  // 获取排名数据
  const fetchRankings = async () => {
    try {
      const response = await fetch('/api/reaction-time')
      const data = await response.json()
      setResults({
        regionalRanking: {
          name: data.rankings.regional.name,
          data: data.rankings.regional.data
        },
        nationalRanking: {
          name: data.rankings.national.name,
          data: data.rankings.national.data
        },
        globalRanking: {
          name: data.rankings.global.name,
          data: data.rankings.global.data
        },
        cityRanking: {
          name: data.rankings.city.name,
          data: data.rankings.city.data
        }
      })
    } catch (error) {
      console.error('Error fetching rankings:', error)
    }
  }

  useEffect(() => {
    fetchRankings()
    const interval = setInterval(fetchRankings, 60000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="w-full mx-auto py-0 space-y-16">
      <ReactionTimeGame
        onResultUpdate={(time) => {
          setReactionTime(time)
          setResults(prev => ({
            ...prev,
            regionalRanking: {
              ...prev.regionalRanking,
              data: [...prev.regionalRanking.data, { reactionTime: time, timestamp: Date.now() }]
            }
          }))
        }}
        onShareOpen={() => setIsShareOpen(true)}
      />
      
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="space-y-8">
          <h2 className="text-3xl font-bold text-center mb-8 relative pb-3 after:content-[''] after:absolute after:bottom-0 after:left-1/2 after:-translate-x-1/2 after:w-24 after:h-1 after:bg-blue-500 after:rounded-full">
            {t("rankingTitle")}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* 地区排名 */}
            <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
              <h3 className="text-xl font-bold mb-6 pb-2 border-b border-gray-200 text-gray-800">
                {results.cityRanking.name}
              </h3>
              <div className="space-y-3">
                {results.regionalRanking.data?.map((result, index) => (
                  <div 
                    key={`regional-${index}`} 
                    className={`flex justify-between items-center p-2 rounded-lg
                      ${index === 0 ? 'bg-yellow-50' : 
                        index === 1 ? 'bg-gray-50' : 
                        index === 2 ? 'bg-orange-50' : 'hover:bg-gray-50'}`}
                  >
                    <div className="flex items-center gap-3">
                      <span className={`w-6 h-6 flex items-center justify-center rounded-full 
                        ${index === 0 ? 'bg-yellow-500' : 
                          index === 1 ? 'bg-gray-400' : 
                          index === 2 ? 'bg-orange-500' : 'bg-gray-200'} 
                        text-white text-sm font-medium`}>
                        {index + 1}
                      </span>
                      <span className="font-medium text-gray-800">{result.reactionTime}ms</span>
                    </div>
                    <span className="text-gray-500 text-sm">
                      {new Date(result.timestamp).toLocaleDateString()}
                    </span>
                  </div>
                ))}
                {results.regionalRanking.data.length === 0 && (
                  <div className="text-center text-gray-500 py-4">
                    {t("noData")}
                  </div>
                )}
              </div>
            </div>

            {/* 国家排名 */}
            <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
              <h3 className="text-xl font-bold mb-6 pb-2 border-b border-gray-200 text-gray-800">
                {results.nationalRanking.name}
              </h3>
              <div className="space-y-3">
                {results.nationalRanking.data?.map((result, index) => (
                  <div 
                    key={`national-${index}`} 
                    className={`flex justify-between items-center p-2 rounded-lg
                      ${index === 0 ? 'bg-yellow-50' : 
                        index === 1 ? 'bg-gray-50' : 
                        index === 2 ? 'bg-orange-50' : 'hover:bg-gray-50'}`}
                  >
                    <div className="flex items-center gap-3">
                      <span className={`w-6 h-6 flex items-center justify-center rounded-full 
                        ${index === 0 ? 'bg-yellow-500' : 
                          index === 1 ? 'bg-gray-400' : 
                          index === 2 ? 'bg-orange-500' : 'bg-gray-200'} 
                        text-white text-sm font-medium`}>
                        {index + 1}
                      </span>
                      <span className="font-medium text-gray-800">{result.reactionTime}ms</span>
                    </div>
                    <span className="text-gray-500 text-sm">
                      {new Date(result.timestamp).toLocaleDateString()}
                    </span>
                  </div>
                ))}
                {results.nationalRanking.data.length === 0 && (
                  <div className="text-center text-gray-500 py-4">
                    {t("noData")}
                  </div>
                )}
              </div>
            </div>

            {/* 全球排名 */}
            <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
              <h3 className="text-xl font-bold mb-6 pb-2 border-b border-gray-200 text-gray-800">
                {results.globalRanking.name}
              </h3>
              <div className="space-y-3">
                {results.globalRanking.data?.map((result, index) => (
                  <div 
                    key={`global-${index}`} 
                    className={`flex justify-between items-center p-2 rounded-lg
                      ${index === 0 ? 'bg-yellow-50' : 
                        index === 1 ? 'bg-gray-50' : 
                        index === 2 ? 'bg-orange-50' : 'hover:bg-gray-50'}`}
                  >
                    <div className="flex items-center gap-3">
                      <span className={`w-6 h-6 flex items-center justify-center rounded-full 
                        ${index === 0 ? 'bg-yellow-500' : 
                          index === 1 ? 'bg-gray-400' : 
                          index === 2 ? 'bg-orange-500' : 'bg-gray-200'} 
                        text-white text-sm font-medium`}>
                        {index + 1}
                      </span>
                      <span className="font-medium text-gray-800">{result.reactionTime}ms</span>
                    </div>
                    <span className="text-gray-500 text-sm">
                      {new Date(result.timestamp).toLocaleDateString()}
                    </span>
                  </div>
                ))}
                {results.globalRanking.data.length === 0 && (
                  <div className="text-center text-gray-500 py-4">
                    {t("noData")}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="grid md:grid-cols-2 gap-8 items-center">
          <div className="w-full h-[400px]">
            <h2 className="text-xl mb-4 font-semibold">{t("statisticsTitle")}</h2>
            <Image 
              src='/reactiontime-statistics.png' 
              alt='Reaction Time Test Statistics'
              className='w-full h-full' 
              width={400} 
              height={400}
            />
          </div>
          <div className="w-full h-[400px]">
            <h2 className="text-xl mb-4 font-semibold">{t("aboutTitle")}</h2>
            <p>{t("about")}</p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="space-y-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                title: "introduce.AverageReactionTime",
                description: "introduce.reactionTimeAverage",
                icon: "⚡",
                color: "bg-blue-50 border-blue-200"
              },
              {
                title: "introduce.definitionTitle",
                description: "introduce.definitionDesc",
                icon: "📝",
                color: "bg-green-50 border-green-200"
              },
              {
                title: "introduce.meaningTitle",
                description: "introduce.meaningDesc",
                icon: "🧠",
                color: "bg-purple-50 border-purple-200"
              }
            ].map((item, index) => (
              <div 
                key={index}
                className={`${item.color} border rounded-xl p-6 transition-all duration-300 hover:shadow-lg hover:-translate-y-1`}
              >
                <div className="flex flex-col h-full">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-3xl">{item.icon}</span>
                    <h3 className="text-xl font-bold text-gray-800">{t(item.title)}</h3>
                  </div>
                  <p className="text-gray-600 leading-relaxed flex-grow">
                    {t(item.description)}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <section className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
            <h2 className="text-2xl md:text-3xl font-bold mb-6 text-gray-800 relative pb-3 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-24 after:h-1 after:bg-blue-500 after:rounded-full">
              {t("introduce.averageReactionTitle")}
            </h2>
            <p className="text-gray-600 leading-relaxed text-base md:text-lg mb-6">
              {t("introduce.averageReactionDesc")}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { age: "18-24", range: "200-250ms", icon: "👶", color: "bg-blue-50 hover:bg-blue-100" },
                { age: "24-35", range: "225-275ms", icon: "👨", color: "bg-green-50 hover:bg-green-100" },
                { age: "35-50", range: "250-300ms", icon: "👨‍🦰", color: "bg-yellow-50 hover:bg-yellow-100" },
                { age: "50+", range: "275-325ms", icon: "👴", color: "bg-orange-50 hover:bg-orange-100" }
              ].map((item, index) => (
                <div 
                  key={index} 
                  className={`${item.color} p-6 rounded-xl transition-colors duration-300 flex flex-col items-center text-center`}
                >
                  <span className="text-3xl mb-3">{item.icon}</span>
                  <span className="font-semibold text-gray-700 mb-2">{item.age} years</span>
                  <span className="text-blue-600 font-medium text-lg">{item.range}</span>
                </div>
              ))}
            </div>
          </section>

          <section className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
            <h2 className="text-2xl md:text-3xl font-bold mb-6 text-gray-800 relative pb-3 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-24 after:h-1 after:bg-blue-500 after:rounded-full">
              {t("introduce.professionalTitle")}
            </h2>
            <p className="text-gray-600 leading-relaxed text-base md:text-lg mb-6">
              {t("introduce.professionalDesc")}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                { title: t("professionals.athlete"), time: "150-250ms", icon: "🏃‍♂️" },
                { title: t("professionals.raceDriver"), time: "150-200ms", icon: "🏎️" },
                { title: t("professionals.pilot"), time: "120-170ms", icon: "✈️" },
                { title: t("professionals.surgeon"), time: "180-250ms", icon: "👨‍⚕️" },
                { title: t("professionals.esportsPlayer"), time: "140-200ms", icon: "🎮" },
                { title: t("professionals.airTrafficController"), time: "170-230ms", icon: "🗼" },
                { title: t("professionals.military"), time: "160-220ms", icon: "💂‍♂️" },
                { title: t("professionals.boxer"), time: "140-190ms", icon: "🥊" },
                { title: t("professionals.tableTennisPlayer"), time: "130-180ms", icon: "🏓" }
              ].map((item, index) => (
                <div key={index} 
                     className="bg-gray-50 p-4 rounded-xl hover:bg-gray-100 transition-colors duration-300 transform hover:-translate-y-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-2xl">{item.icon}</span>
                    <h3 className="font-semibold text-gray-800">{item.title}</h3>
                  </div>
                  <p className="text-blue-600 font-medium">{item.time}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
            <h2 className="text-2xl md:text-3xl font-bold mb-6 text-gray-800 relative pb-3 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-24 after:h-1 after:bg-blue-500 after:rounded-full">
              {t("introduce.animalTitle")}
            </h2>
            <p className="text-gray-600 leading-relaxed text-base md:text-lg mb-6">
              {t("introduce.animalDesc")}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                { name: t("animals.fly"), time: "~30ms", icon: "🪰" },
                { name: t("animals.dog"), time: "~250ms", icon: "🐕" },
                { name: t("animals.cat"), time: "~200ms", icon: "🐱" },
                { name: t("animals.cheetah"), time: "~100ms", icon: "🐆" },
                { name: t("animals.snake"), time: "~150ms", icon: "🐍" },
                { name: t("animals.eagle"), time: "~75ms", icon: "🦅" },
                { name: t("animals.dragonfly"), time: "~50ms", icon: "🦗" },
                { name: t("animals.squirrel"), time: "~180ms", icon: "🐿️" },
                { name: t("animals.rabbit"), time: "~160ms", icon: "🐰" }
              ].map((animal, index) => (
                <div key={index} 
                     className="bg-gray-50 p-4 rounded-xl hover:bg-gray-100 transition-colors duration-300 transform hover:-translate-y-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-2xl">{animal.icon}</span>
                    <h3 className="font-semibold text-gray-800">{animal.name}</h3>
                  </div>
                  <p className="text-blue-600 font-medium">{animal.time}</p>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>

      <SharePoster
        reactionTime={reactionTime}
        rank={results.globalRanking.data.findIndex(r => r.reactionTime === reactionTime) + 1}
        totalUsers={results.globalRanking.data.length}
        isOpen={isShareOpen}
        onClose={() => setIsShareOpen(false)}
        testType="visual"
        title={t("poster.title")}
      />
    </div>
  )
}
