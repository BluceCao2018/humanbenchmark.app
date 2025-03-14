import {getTranslations, getLocale} from 'next-intl/server';

export async function generateMetadata() {
  const t = await getTranslations('website');
  return {
    alternates: {
      canonical: t("domain")
    },
  };
}

export default async function TestsLayout({
  children,
}: {
  children: React.ReactNode;
}) {

  return (
    <>
      {children}
    </>
  );
} 