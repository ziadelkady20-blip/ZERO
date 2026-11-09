import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";
import MetaPixel from "./meta-pixel";

export const metadata: Metadata = {
  title: "ZERO CLOTHING — Modern Menswear",
  description: "Discover ZERO CLOTHING menswear: considered everyday essentials, refined fits, and versatile pieces for the modern man.",
  applicationName: "ZERO CLOTHING",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <head>
        <Script id="meta-pixel" strategy="beforeInteractive">
          {`!function(f,b,e,v,n,t,s)
{if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};
if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];
s.parentNode.insertBefore(t,s)}(window, document,'script',
'https://connect.facebook.net/en_US/fbevents.js');
fbq('init', '2262347167945074');
fbq('track', 'PageView');`}
        </Script>
      </head>
      <body>
        <noscript>
          <img
            height="1"
            width="1"
            style={{ display: "none" }}
            src="https://www.facebook.com/tr?id=2262347167945074&ev=PageView&noscript=1"
            alt=""
          />
        </noscript>
        <MetaPixel />
        {children}
        <a
          className="zero-whatsapp-float"
          href="https://wa.me/201098256906?text=%D9%85%D8%B1%D8%AD%D8%A8%D9%8B%D8%A7%D8%8C%20%D9%85%D8%AD%D8%AA%D8%A7%D8%AC%20%D9%85%D8%B3%D8%A7%D8%B9%D8%AF%D8%A9%20%D8%A8%D8%AE%D8%B5%D9%88%D8%B5%20ZERO%20CLOTHING"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="تواصل مع دعم ZERO CLOTHING عبر واتساب"
          title="WhatsApp Support"
        >
          <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
            <path fill="currentColor" d="M20.5 3.5A11.8 11.8 0 0 0 12.1 0C5.6 0 .3 5.3.3 11.8c0 2.1.6 4.1 1.6 5.9L0 24l6.5-1.7a11.8 11.8 0 0 0 5.6 1.4h.1c6.5 0 11.8-5.3 11.8-11.8 0-3.2-1.2-6.2-3.5-8.4ZM12.2 21.7a9.9 9.9 0 0 1-5-1.3l-.4-.2-3.8 1 1-3.7-.2-.4a9.8 9.8 0 1 1 8.4 4.6Zm5.4-7.4c-.3-.1-1.6-.8-1.9-.9-.3-.1-.4-.1-.6.2s-.7.9-.9 1.1-.3.2-.6.1a8 8 0 0 1-2.3-1.4 8.6 8.6 0 0 1-1.6-2c-.2-.3 0-.4.1-.6l.4-.5c.1-.2.2-.3.3-.5.1-.2 0-.4 0-.5l-.9-2.1c-.2-.5-.5-.4-.6-.4h-.5c-.2 0-.5.1-.7.3-.2.3-1 1-1 2.4s1 2.8 1.2 3c.1.2 2 3.1 4.8 4.2.7.3 1.2.4 1.6.5.7.2 1.3.1 1.8.1.6-.1 1.6-.7 1.8-1.3.2-.6.2-1.1.2-1.3-.1-.1-.3-.2-.6-.4Z"/>
          </svg>
          <span>WhatsApp</span>
        </a>
      </body>
    </html>
  );
}
