export default function Footer() {
  return (
    <footer className="bg-white border-t border-neutral-200 py-10 mt-auto">
      <div className="mx-auto max-w-7xl px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-neutral-900 group">
          <img src="/icon.svg" alt="Karivio Logo" className="h-8 w-8 transition-transform duration-300 group-hover:scale-110" />
          <span className="text-sm font-bold tracking-tight">Karivio</span>
        </div>

        <p className="text-xs font-medium text-neutral-400">
          &copy; {new Date().getFullYear()} Karivio. All rights reserved.
        </p>

        <div className="text-xs font-medium text-neutral-400 flex items-center gap-1">
          Built with <span className="text-neutral-900">Next.js</span> & <span className="text-neutral-900">Gemini AI</span>
        </div>
      </div>
    </footer>
  );
}
