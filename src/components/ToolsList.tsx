// components/ResourceList.tsx
import React from 'react'; // 确保导入 React
import { Link } from "@/lib/i18n";
import { ExternalLink, ArrowRightIcon } from 'lucide-react'
import {
  Card,
  CardThumb,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"

import { Badge } from "@/components/ui/badge";

import { getDataList } from '@/lib/data';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { FaLink, FaClock, FaList, FaBullseye, FaHashtag, FaComment, FaQuestion, FaKeyboard, FaPalette, FaEye, FaTrafficLight, FaAdjust, FaHeadphones, FaVolumeUp, FaMusic } from 'react-icons/fa';
import { FaFaceSmile } from 'react-icons/fa6';

// type toolProps = {
//   name: string;
//   description: string;
//   url: string;
//   tags: string[]
// }

type categoryProps = {
  name: string,
  src: string,
  description: string,
  link: string
}

type categoryListProps = {
  categories: categoryProps[]
}


type toolsListProps = {
  category: categoryProps,
  locale: string,
  showMoreLink?: boolean
}

type toolProps = {
  name: string,
  description: string,
  url: string,
  icon_url?: string,
  tags?: string[],
  thumb?: string,
  website?: string,
  icon:string
}

const iconMap: { [key: string]: React.ElementType } = {
  FaClock,
  FaList,
  FaBullseye,
  FaHashtag,
  FaComment,
  FaLink,
  FaQuestion,
  FaKeyboard,
  FaPalette,
  FaEye,
  FaTrafficLight,
  FaAdjust,
  FaHeadphones,
  FaVolumeUp,
  FaMusic,
  FaFaceSmile
};

const ToolsList = ({ category, locale, showMoreLink = true }: toolsListProps) => {
  const t = useTranslations('toolsList');
  const srcList = getDataList(category.src, locale)

  return (
    <section>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold tracking-tight capitalize">{category.name}</h2>
        {showMoreLink && (
          <Link href={`/category/${category.link}`} className="capitalize text-blue-600 hover:text-blue-800 transition-colors hover:underline">
            {t('more')} <span className='capitalize font-bold'>{category.name}</span> {t('tools')} →
          </Link>
        )}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {/* @ts-ignore */}
        {srcList.slice(0,8).map((resource: toolProps, index) => (
          <Card key={index} className='overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 group'>
          <a 
            href={resource.url}
            target="_blank"
            rel="noopener noreferrer"
            className="block"
            title={`Visit ${resource.name} - ${resource.description}`}
          >
            {/* 图片容器 */}
            <div className="relative h-48 w-full overflow-hidden bg-gradient-to-br from-blue-100 to-blue-50">
              {resource.thumb ? (
                <Image
                  src={resource.thumb}
                  alt={`${resource.name} thumbnail`}
                  title={`${resource.name} - ${resource.description}`}
                  quality={10}
                  loading="lazy"
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  {React.createElement(iconMap[resource.icon] || FaLink, { 
                    size: 80, 
                    className: "text-blue-600/50 transition-colors duration-300 group-hover:text-blue-500",
                    title: `${resource.name} - ${resource.description}`
                  })}
                </div>
              )}
            </div>

            {/* 内容区域 */}
            <CardHeader className="bg-white">
              <CardTitle className="text-lg font-semibold text-gray-900 hover:text-blue-600 transition-colors">
                {resource.name}
              </CardTitle>
              <CardDescription className="mt-2 text-sm text-gray-600 line-clamp-2">
                {resource.description}
              </CardDescription>
              {resource.tags && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {resource.tags.slice(0, 3).map((tag, i) => (
                    <Badge key={i} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}
            </CardHeader>
          </a>
        </Card>
        ))}
      </div>
    </section>
  )
}

const ToolsPage = ({ category, locale }: { category: categoryProps, locale: string }) => {
  const srcList = getDataList(category.src, locale);

  return (
    <section>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {/* @ts-ignore */}
        {srcList.slice(0,8).map((resource: toolProps, index) => (
          <Card key={index} className='overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 group'>
          <a 
            href={resource.url}
            target="_blank"
            rel="noopener noreferrer"
            className="block"
            title={`Visit ${resource.name} - ${resource.description}`}
          >
            {/* 图片容器 */}
            <div className="relative h-48 w-full overflow-hidden bg-gradient-to-br from-blue-100 to-blue-50">
              {resource.thumb ? (
                <Image
                  src={resource.thumb}
                  alt={`${resource.name} thumbnail`}
                  title={`${resource.name} - ${resource.description}`}
                  quality={10}
                  loading="lazy"
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  {React.createElement(iconMap[resource.icon] || FaLink, { 
                    size: 80, 
                    className: "text-blue-600/50 transition-colors duration-300 group-hover:text-blue-500",
                    title: `${resource.name} - ${resource.description}`
                  })}
                </div>
              )}
            </div>

            {/* 内容区域 */}
            <CardHeader className="bg-white">
              <CardTitle className="text-lg font-semibold text-gray-900 hover:text-blue-600 transition-colors">
                {resource.name}
              </CardTitle>
              <CardDescription className="mt-2 text-sm text-gray-600 line-clamp-2">
                {resource.description}
              </CardDescription>
              {resource.tags && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {resource.tags.slice(0, 3).map((tag, i) => (
                    <Badge key={i} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}
            </CardHeader>
          </a>
        </Card>
        ))}
      </div>
    </section>
  )
}

type searchPageProps = {
  searchData: toolProps[]
}

const SearchPage = ({ searchData }: searchPageProps) => {

  return (
    <section>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {/* @ts-ignore */}
        {searchData.slice(0,8).map((resource: toolProps, index) => (
          <Card key={index} className='max-w-sm overflow-hidden shadow-md transform transition-transform duration-300 hover:scale-105 transition-colors duration-300 group'>
            
            <CardHeader>
              <a 
                href={`${resource.url}`} 
                target="_blank" 
                rel="noopener noreferrer"
                className="transition-colors inline-flex flex-col items-center"
              >
                <div className='p-2 rounded-md mb-1'>
                  {React.createElement(iconMap[resource.icon] || FaLink, { size: 60, className: "text-blue-600 transition-colors duration-300 group-hover:text-yellow-500" })}
                </div>
                <CardTitle className='capitalize tracking-tighter'>{resource.name}</CardTitle>
                {/* <ExternalLink size={16} className='ml-1' /> */}
              </a>
              <CardDescription className='flex flex-col justify-between '>
                <div className='h-[60px] line-clamp-3 mt-1 tracking-tight text-start'>
                  {resource.description}
                </div>
                { resource.tags ? 
                  <div className='mt-3'>
                    {resource.tags.slice(0,3).map((tag, i) => (
                      <Badge key={i} variant="secondary" className='text-xs pb-1 mr-1 mt-2 tracking-tighter'>{tag}</Badge>
                    ))}
                  </div> :
                 null
                }     
              </CardDescription>
            </CardHeader>
          </Card>
        ))}
      </div>
    </section>
  )
}


const CategoryList = ({ categories }: categoryListProps) => {

  return (
    <section>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
        {/* @ts-ignore */}
        {categories.map((category: categoryProps, index) => (
          <Card key={index} className='max-w-sm overflow-hidden shadow-md transform transition-transform duration-300 hover:scale-105 transition-colors duration-300 hover:bg-gray-100'>
            <CardHeader>
              <a 
                href={`/category/${category.link}`}
                className="text-blue-600 hover:text-blue-800 transition-colors inline-flex items-center gap-1"
              >
                <CardTitle className='capitalize'>{category.name}</CardTitle>
                <ArrowRightIcon size={16} className='ml-2'/>
              </a>
              <CardDescription className='flex flex-col justify-between'>
                <div className='h-[40px] line-clamp-2 mt-4 tracking-tight text-start'>
                {category.description}
                </div>
              </CardDescription>
            </CardHeader>
          </Card>
        ))}
      </div>
    </section>
  )
}

// 新增一个用于展示所有工具的组件
export const AllToolsList = ({ tools, locale }: { tools: toolProps[], locale: string }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {tools.map((resource: toolProps, index) => (
        <Card key={index} className='overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 group'>
          <a 
            href={resource.url}
            target="_blank"
            rel="noopener noreferrer"
            className="block"
            title={`Visit ${resource.name} - ${resource.description}`}
          >
            {/* 图片容器 */}
            <div className="relative h-48 w-full overflow-hidden bg-gradient-to-br from-blue-100 to-blue-50">
              {resource.thumb ? (
                <Image
                  src={resource.thumb}
                  alt={`${resource.name} thumbnail`}
                  title={`${resource.name} - ${resource.description}`}
                  quality={10}
                  loading="lazy"
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  {React.createElement(iconMap[resource.icon] || FaLink, { 
                    size: 80, 
                    className: "text-blue-600/50 transition-colors duration-300 group-hover:text-blue-500",
                    title: `${resource.name} - ${resource.description}`
                  })}
                </div>
              )}
            </div>

            {/* 内容区域 */}
            <CardHeader className="bg-white">
              <CardTitle className="text-lg font-semibold text-gray-900 hover:text-blue-600 transition-colors">
                {resource.name}
              </CardTitle>
              <CardDescription className="mt-2 text-sm text-gray-600 line-clamp-2">
                {resource.description}
              </CardDescription>
              {resource.tags && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {resource.tags.slice(0, 3).map((tag, i) => (
                    <Badge key={i} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}
            </CardHeader>
          </a>
        </Card>
      ))}
    </div>
  )
}

export { ToolsList, ToolsPage, CategoryList, SearchPage };