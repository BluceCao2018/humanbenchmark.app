// components/Layout.tsx
import React from 'react'; // 确保导入 React
import { Navigation } from './Navigation'
import { Footer } from '@/components/Footer'
import { getCategories } from '@/lib/data';
import { getLocale } from 'next-intl/server';

export async function Layout({ 
  children, 
}: {
  children: React.ReactNode;
}) {
  const locale = await getLocale();
  const categories = getCategories(locale);

  return (
    <div className="min-h-screen bg-background font-sans antialiased">
      <Navigation categories={categories}/>
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  )
}