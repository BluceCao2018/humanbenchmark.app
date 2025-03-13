import {getTranslations} from 'next-intl/server';
import { title } from 'process';

export async function generateMetadata() {
  const t = await getTranslations('timePerception');
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
      images: `${w("domain")}/twitter/timeperceptiontest.png`,
    },
    openGraph: {
      type: 'article',
      title: t("meta_title"),
      description: t("meta_description"),
      url: `${w("domain")}/tests/time-perception-test`,
      images: `${w("domain")}/twitter/timeperceptiontest.png`,
    },
    h1: t("h1"),
  };
}

export default function Layout({children}: {children: React.ReactNode}) {
  return children;
} 