"use client";

import { useState, useEffect, useRef } from "react";
import Microlink from "@microlink/react";

type Props = {
  url: string;
};

export default function LinkPreviewCard({ url }: Props) {
  const [mounted, setMounted] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Fix image display by reading url attribute and setting as background-image
  useEffect(() => {
    if (!mounted || !containerRef.current) return;

    const fixImages = () => {
      // Find all media elements with url attribute
      const mediaElements = containerRef.current?.querySelectorAll(
        '.microlink_card__media_image[url], [class*="microlink_card__media"][url]'
      );
      
      mediaElements?.forEach((el) => {
        const imgUrl = el.getAttribute('url');
        const htmlEl = el as HTMLElement;
        
        if (imgUrl) {
          // Always set the background-image to ensure it displays
          htmlEl.style.backgroundImage = `url("${imgUrl}")`;
          htmlEl.style.backgroundPosition = 'center';
          htmlEl.style.backgroundRepeat = 'no-repeat';
          htmlEl.style.display = 'block';
          htmlEl.style.visibility = 'visible';
          htmlEl.style.opacity = '1';
        }
      });

      // Hide URL/footer sections
      const urlSections = containerRef.current?.querySelectorAll(
        '.microlink_card__content_url, [class*="microlink_card__content_url"], .microlink_card footer, .microlink_card__content footer'
      );
      
      urlSections?.forEach((el) => {
        const htmlEl = el as HTMLElement;
        htmlEl.style.display = 'none';
        htmlEl.style.visibility = 'hidden';
        htmlEl.style.height = '0';
        htmlEl.style.padding = '0';
        htmlEl.style.margin = '0';
      });

      // Hide title and description content sections
      const contentSections = containerRef.current?.querySelectorAll(
        '.microlink_card__content, [class*="microlink_card__content"], .microlink_card__content_title, .microlink_card__content_description'
      );
      
      contentSections?.forEach((el) => {
        const htmlEl = el as HTMLElement;
        htmlEl.style.display = 'none';
        htmlEl.style.visibility = 'hidden';
        htmlEl.style.height = '0';
        htmlEl.style.padding = '0';
        htmlEl.style.margin = '0';
        htmlEl.style.width = '0';
        htmlEl.style.minWidth = '0';
      });

      // Force card and media to full width
      const cards = containerRef.current?.querySelectorAll('.microlink_card, a[class*="microlink_card"]');
      cards?.forEach((el) => {
        const htmlEl = el as HTMLElement;
        htmlEl.style.width = '100%';
        htmlEl.style.minWidth = '100%';
        htmlEl.style.maxWidth = '100%';
      });
    };

    // Run immediately and multiple times to catch dynamically added elements
    fixImages();
    const timeout1 = setTimeout(fixImages, 100);
    const timeout2 = setTimeout(fixImages, 500);
    const timeout3 = setTimeout(fixImages, 1000);
    const timeout4 = setTimeout(fixImages, 2000);
    const interval = setInterval(fixImages, 2000);

    return () => {
      clearTimeout(timeout1);
      clearTimeout(timeout2);
      clearTimeout(timeout3);
      clearTimeout(timeout4);
      clearInterval(interval);
    };
  }, [mounted, url]);

  if (!url) {
    return null;
  }

  // Only render Microlink on client side to avoid SSR issues
  if (!mounted) {
    return (
      <div className="mt-2 w-full p-4 border border-gray-200 rounded-lg bg-gray-50">
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-blue-600 underline break-all"
        >
          {url}
        </a>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="mt-2 w-full min-w-full">
      <Microlink
        url={url}
        size="small"
        media={["image", "logo"]}
        style={{ 
          width: "100%", 
          maxWidth: "100%",
          minWidth: "100%",
          display: "block",
          visibility: "visible"
        }}
      />
    </div>
  );
}

