export default function Footer() {
  return (
    <footer className="bg-white border-t border-neutral-200 py-10 mt-auto">
      <div className="mx-auto max-w-7xl px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-neutral-900 group">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-neutral-900 transition-transform duration-300 group-hover:scale-110" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
          </svg>
          <span className="text-sm font-bold tracking-tight">CareerGen</span>
        </div>
        
        <p className="text-xs font-medium text-neutral-400">
          &copy; {new Date().getFullYear()} CareerGen. All rights reserved.
        </p>
        
        <div className="text-xs font-medium text-neutral-400 flex items-center gap-1">
          Built with <span className="text-neutral-900">Next.js</span> & <span className="text-neutral-900">Gemini AI</span>
        </div>
      </div>
    </footer>
  );
}
