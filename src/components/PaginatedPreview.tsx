'use client';
import React, { useState, useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export const PAGE_HEIGHT_PX = 1122.52; // 297mm at 96 DPI
export const MARGIN_TOP_PX = 53;
export const MARGIN_BOTTOM_PX = 53;
export const CONTENT_WINDOW_PX = PAGE_HEIGHT_PX - MARGIN_TOP_PX - MARGIN_BOTTOM_PX;

interface PaginatedPreviewProps {
  zoom: number;
  children: React.ReactNode;
}

export default function PaginatedPreview({ zoom, children }: PaginatedPreviewProps) {
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  
  const ghostRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const widthMeasureRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const measure = () => {
      if (ghostRef.current) {
        const contentHeight = ghostRef.current.scrollHeight;
        const pages = Math.max(1, Math.ceil(contentHeight / CONTENT_WINDOW_PX));
        if (pages !== totalPages) {
           setTotalPages(pages);
           if (currentPage > pages) setCurrentPage(pages);
        }
      }
    };
    
    measure();
    const timeout = setTimeout(measure, 500);
    
    if (ghostRef.current && typeof window !== 'undefined' && window.ResizeObserver) {
      const resizeObserver = new ResizeObserver(() => measure());
      resizeObserver.observe(ghostRef.current);
      return () => {
        resizeObserver.disconnect();
        clearTimeout(timeout);
      };
    }
    
    return () => clearTimeout(timeout);
  }, [totalPages, currentPage, children]);

  const goToPage = (page: number) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
    
    if (scrollContainerRef.current && widthMeasureRef.current) {
      const pageWidth = widthMeasureRef.current.clientWidth; // exact pixels of 210mm in current zoom
      const gap = 32; // 32px column gap
      const scrollAmount = (page - 1) * (pageWidth + gap);
      
      scrollContainerRef.current.scrollTo({
        left: scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  return (
    <div className="w-full h-full relative flex flex-col items-center">
      
      {/* Scrollable Container */}
      <div 
        ref={scrollContainerRef}
        className="w-full h-full flex items-start justify-start overflow-x-hidden overflow-y-auto py-8 px-8" 
        style={{ zoom }}
      >
        <style>{`
          .avoid-break, p, li, h1, h2, h3, h4, .section, [contenteditable] {
             break-inside: avoid;
             page-break-inside: avoid;
          }
        `}</style>

        {/* Ghost Container for Measurement (Invisible) */}
        <div 
           className="absolute pointer-events-none opacity-0 ghost-container"
           style={{ width: '210mm', left: -9999, top: -9999 }}
        >
           <div ref={ghostRef} style={{ width: '100%' }}>
              {children}
           </div>
        </div>

        {/* Width Measurement Dummy */}
        <div 
           ref={widthMeasureRef} 
           className="absolute pointer-events-none opacity-0" 
           style={{ width: '210mm', left: -9999, top: -9999 }} 
        />
        
        {/* Render Workspace */}
        <div 
           className="relative transition-all duration-300" 
           style={{ 
             margin: '0 auto',
             width: `calc((210mm * ${totalPages}) + (32px * ${totalPages - 1}))`,
             height: '297mm',
             minHeight: '297mm'
           }}
        >
          {/* Absolute Solid White Paper Backgrounds */}
          {Array.from({ length: totalPages }).map((_, i) => (
            <div 
              key={`bg-${i}`} 
              className="absolute top-0 bg-white"
              style={{
                width: '210mm',
                height: '297mm',
                left: `calc(${i} * (210mm + 32px))`,
                boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)'
              }}
            >
              {/* Optional: Static page number indicator inside the paper */}
              <div className="absolute bottom-4 right-4 text-[10px] font-bold text-neutral-300 pointer-events-none select-none">
                 Page {i + 1} of {totalPages}
              </div>
            </div>
          ))}

          {/* Foreground Multi-Column Text Content */}
          <div 
            className="print-container absolute z-10"
            style={{
              top: 0,
              left: 0,
              width: '210mm', // Lock width to exactly 1 column. Overflowing columns will spawn perfectly to the right!
              boxSizing: 'border-box',
              height: '297mm',
              columnWidth: '210mm',
              columnGap: '32px',
              columnFill: 'auto',
              padding: '53px 0',
              textAlign: 'left',
            }}
          >
             {children}
          </div>
        </div>
      </div>

      {/* Floating Side Navigation Buttons */}
      {totalPages > 1 && (
        <>
          <button 
            onClick={() => goToPage(currentPage - 1)}
            disabled={currentPage === 1}
            className="absolute left-6 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-neutral-700 p-2 rounded-full shadow-xl border border-black/5 z-50 disabled:opacity-0 transition-all duration-300 cursor-pointer backdrop-blur hover:scale-105 active:scale-95"
            aria-label="Previous Page"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          
          <button 
            onClick={() => goToPage(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="absolute right-6 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-neutral-700 p-2 rounded-full shadow-xl border border-black/5 z-50 disabled:opacity-0 transition-all duration-300 cursor-pointer backdrop-blur hover:scale-105 active:scale-95"
            aria-label="Next Page"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </>
      )}
      
    </div>
  );
}
