import '@fortawesome/fontawesome-free/css/all.min.css'
import HomeReactionGame from '../components/HomeReactionGame'
import { AllToolsList } from '@/components/ToolsList'
import { getLocale, getTranslations } from 'next-intl/server'
import { getCategories, getDataList } from '@/lib/data'

type categoryType = { 
  name: string; 
  src: string; 
  description: string;
  link: string; 
}

export default async function ReactionTime() {
  const locale = await getLocale();
  const t = await getTranslations('reactionTime');
  const w = await getTranslations('website');
  const categories = getCategories(locale);
  const allTools = categories.flatMap((category: categoryType) => 
    getDataList(category.src, locale)
  )

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
                "name": "What is a good reaction time test score?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "In a Reaction Time Test, scores between 200-250ms are considered excellent. Average reaction times typically fall between 250-300ms. Professional gamers and athletes often achieve reaction times below 200ms through consistent practice and training."
                }
              },
              {
                "@type": "Question",
                "name": "How can I improve my reaction time test results?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Regular practice with Reaction Time Test exercises can help improve your response speed. Getting adequate sleep, maintaining good physical health, and staying mentally alert also contribute to better reaction times. Many athletes and gamers incorporate specific reaction time training into their routines."
                }
              },
              {
                "@type": "Question",
                "name": "What factors affect reaction time test performance?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Several factors can influence your Reaction Time Test results, including age, fatigue level, time of day, and overall physical condition. Environmental factors like lighting, screen brightness, and input device quality can also impact test performance."
                }
              },
              {
                "@type": "Question",
                "name": "How often should I practice the reaction time test?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "For optimal improvement, try to practice the Reaction Time Test 2-3 times per week. Each session should include multiple attempts to ensure consistent measurement. Regular practice helps track progress and identify patterns in your performance."
                }
              },
              {
                "@type": "Question",
                "name": "Why is reaction time testing important?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Reaction Time Tests are crucial for assessing cognitive performance and motor skills. They're particularly important in sports, gaming, driving, and various professional fields where quick response times are essential. Regular testing can help monitor cognitive health and track improvements over time."
                }
              }
            ]
          })
        }}
      />

      <div className="w-full mx-auto py-0 space-y-16">
        <section>
          <HomeReactionGame />
        </section>

        <div className="container mx-auto py-0 space-y-16">
          <section className="max-w-7xl mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12 text-gray-900">
              Human Benchmark Tests
            </h2>
            <AllToolsList tools={allTools} locale={locale} />
          </section>

          {/* SEO Content Section */}
          <section className="max-w-4xl mx-auto px-4 py-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Understanding Reaction Time Test
            </h2>
            
            <div className="prose prose-blue max-w-none">
              <p className="text-gray-700 leading-relaxed mb-4">
                The Reaction Time Test is a fundamental tool for measuring your response speed to visual stimuli. This scientifically-designed test helps you understand how quickly you can react to sudden changes, which is crucial for various activities from driving to gaming. Our Reaction Time Test provides accurate measurements in milliseconds, allowing you to track and improve your performance over time.
              </p>
              
              <p className="text-gray-700 leading-relaxed mb-4">
                During the Reaction Time Test, you'll need to click as quickly as possible when the color changes from red to green. The test measures the time between the color change and your click, providing instant feedback on your reaction speed. Multiple attempts are recorded to calculate your average Reaction Time Test score, ensuring more accurate results.
              </p>
              
              <p className="text-gray-700 leading-relaxed mb-4">
                Regular practice with the Reaction Time Test can help improve your response speed. Athletes often use Reaction Time Test tools to enhance their performance, as quick reactions are essential in many sports. Similarly, gamers can benefit from Reaction Time Test training to improve their gaming reflexes. The test also serves as a valuable tool for researchers studying human performance and cognitive function.
              </p>
              
              <p className="text-gray-700 leading-relaxed">
                Whether you're an athlete, gamer, or simply interested in measuring your cognitive abilities, our Reaction Time Test offers a reliable way to assess and track your response speed. The test is designed to be both engaging and scientifically valid, making it an effective tool for understanding and improving your reaction time.
              </p>
            </div>

            </section>

            {/* FAQ Section */}
            <section className="max-w-4xl mx-auto px-4 py-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                FAQ About Reaction Time Test
              </h2>
              
              <div className="space-y-6">
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    What is a good reaction time test score?
                  </h3>
                  <p className="text-gray-700">
                    In a Reaction Time Test, scores between 200-250ms are considered excellent. Average reaction times typically fall between 250-300ms. Professional gamers and athletes often achieve reaction times below 200ms through consistent practice and training.
                  </p>
                </div>

                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    How can I improve my reaction time test results?
                  </h3>
                  <p className="text-gray-700">
                    Regular practice with Reaction Time Test exercises can help improve your response speed. Getting adequate sleep, maintaining good physical health, and staying mentally alert also contribute to better reaction times. Many athletes and gamers incorporate specific reaction time training into their routines.
                  </p>
                </div>

                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    What factors affect reaction time test performance?
                  </h3>
                  <p className="text-gray-700">
                    Several factors can influence your Reaction Time Test results, including age, fatigue level, time of day, and overall physical condition. Environmental factors like lighting, screen brightness, and input device quality can also impact test performance.
                  </p>
                </div>

                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    How often should I practice the reaction time test?
                  </h3>
                  <p className="text-gray-700">
                    For optimal improvement, try to practice the Reaction Time Test 2-3 times per week. Each session should include multiple attempts to ensure consistent measurement. Regular practice helps track progress and identify patterns in your performance.
                  </p>
                </div>

                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Why is reaction time testing important?
                  </h3>
                  <p className="text-gray-700">
                    Reaction Time Tests are crucial for assessing cognitive performance and motor skills. They're particularly important in sports, gaming, driving, and various professional fields where quick response times are essential. Regular testing can help monitor cognitive health and track improvements over time.
                  </p>
                </div>
              </div>
            </section>
          </div>
        </div>
    </>
  )
}
