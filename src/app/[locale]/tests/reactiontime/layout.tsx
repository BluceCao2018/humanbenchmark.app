import {getTranslations, getLocale} from 'next-intl/server';
import { ToolsPage } from '@/components/ToolsList'

export async function generateMetadata() {
  const t = await getTranslations('reactionTime');
  const w = await getTranslations('website');
  return {
    title: t("meta_title"),
    description: t("meta_description"),
    alternates: {
      canonical: w("domain")
    },
    twitter: {
      card: 'summary_large_image',
      title: t("meta_title"),
      description: t("meta_description"),
      site: '@BluceC56570',
      images: `${w("domain")}/reactiontimetest.png`,
    },
    openGraph: {
      type: 'article',
      title: t("meta_title"),
      description: t("meta_description"),
      url: `${w("domain")}/tests/reactiontime`,
      images: `${w("domain")}/reactiontimetest.png`,
    },
  };
}

export default async function ReactionTimeLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      {children}
    </>
  )
} 
