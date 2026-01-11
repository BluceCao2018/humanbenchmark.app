"use client";

import Script from "next/script";

const clarityId = process.env.NEXT_PUBLIC_CLARITY_ID!;

export function ClarityAnalyticsScript() {
  return (
    <Script
      id="clarity-script"
      strategy="afterInteractive"
      type="text/javascript"
    >
      {`(function(c,l,a,r,i,t,y){
        c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
        t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
        y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
      })(window, document, "clarity", "script", "${clarityId}");`}
    </Script>
  );
}

export function useClarityAnalytics() {
  const trackEvent = (event: string, data?: Record<string, unknown>) => {
    if (typeof window === "undefined" || !(window as any).clarity) {
      return;
    }

    (window as any).clarity("event", event, data);
  };

  return {
    trackEvent,
  };
}
