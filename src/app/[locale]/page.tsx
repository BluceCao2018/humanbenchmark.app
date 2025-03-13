// pages/index.js
import React, { Suspense } from 'react'; // 确保导入 React
import { getSortedPostsData } from '@/lib/posts'
import { getCategories, getDataList } from '@/lib/data';
import Link from 'next/link'; // 确保导入 Link 组件

import { ToolsList } from '@/components/ToolsList';
import { ArticleList } from '@/components/ArticleList'

import { Search } from '@/components/Search';
import {getTranslations, getLocale} from 'next-intl/server';

import '@fortawesome/fontawesome-free/css/all.min.css';
import HomeReactionGame from '@/app/[locale]/tests/components/HomeReactionGame'
import { AllToolsList } from '@/components/ToolsList'

export async function generateMetadata() {
  const t = await getTranslations('home');
  const w = await getTranslations('website');
  return {
    title: t("meta_title"),
    description: t("meta_description"),
    alternates: {
      canonical: w("domain")
    }
  };
}


type categoryType = { 
  name: string; 
  src: string; 
  description: string;
  link: string; 
}


export default async function Home() {
  const locale = await getLocale();
  const t = await getTranslations('home');
  const w = await getTranslations('website');
  // categories data
  const categories = getCategories(locale);
  console.log('categories: ', categories)

  const sortedPosts = await getSortedPostsData("article")
  const allPostsData = sortedPosts.slice(0, 6)
  
  // deployment

  // 获取所有工具
  const allTools = categories.flatMap((category: categoryType) => 
    getDataList(category.src, locale)
  )

  return (
    <div className="w-full mx-auto py-0 space-y-16">
      <section>
        <HomeReactionGame />
      </section>

      <div className="container mx-auto py-0 space-y-16">
        {/* Tools Section */}
        <section className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-900">
            Human Benchmark Tests
          </h2>
          <AllToolsList tools={allTools} locale={locale} />
        </section>
        
        {/* SEO Content Section */}
        <section className="max-w-4xl mx-auto px-4 py-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Understanding Human Benchmark Tests
          </h2>
          
          <div className="prose prose-blue max-w-none">
            <p className="text-gray-700 leading-relaxed mb-4">
              Human Benchmark tests are essential tools for measuring and understanding cognitive abilities. These scientifically-designed tests evaluate various aspects of human performance, including reaction time, memory capacity, and visual perception. Our comprehensive suite of Human Benchmark tools helps you assess and track your cognitive capabilities.
            </p>
            
            <p className="text-gray-700 leading-relaxed mb-4">
              Each Human Benchmark test focuses on specific cognitive functions. The reaction time test measures your response speed, while memory tests evaluate your information retention capabilities. Visual and auditory tests in our Human Benchmark collection provide insights into sensory processing abilities. Regular practice with these Human Benchmark tools can help identify areas for improvement and track progress over time.
            </p>
            
            <p className="text-gray-700 leading-relaxed">
              Whether you're a researcher, student, or someone interested in cognitive performance, our Human Benchmark platform offers valuable insights into human capabilities. The tests are designed to be both engaging and scientifically valid, making Human Benchmark testing an effective way to understand and enhance cognitive functions.
            </p>
          </div>
        </section>
      </div>
    </div>
  )
}