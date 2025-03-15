import { ToolsPage } from '@/components/ToolsList';
import { Breadcrumb, BreadcrumbPage, BreadcrumbSeparator, BreadcrumbItem, BreadcrumbLink, BreadcrumbList } from '@/components/ui/breadcrumb';
import {getLocale, getTranslations} from 'next-intl/server';

export async function generateMetadata() {
  const t = await getTranslations('sprinter');
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

export default async function Layout({children}: {children: React.ReactNode}) {
  const categoryData = {
    src: "reactiontime.jsonc",
    name: "Reaction Time Test",
    description: "Test your reaction time",
    link: "reactiontime"
  };
  const categoryData2 = {
    src: "audition.jsonc",
    name: "Audition Test",
    description: "Test your audition ability",
    link: "audition"
  };

  const locale = await getLocale();
  const t = await getTranslations('navigation')
  const t2 = await getTranslations('audioReaction')
  return (
    <>
    {children}
    <div className="container mx-auto py-16 space-y-16">
    </div>
    </>
  );
} 
