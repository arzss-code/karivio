import Link from 'next/link';
import Navbar from '@/components/Navbar';

function Hero() {
  return (
    <section className="relative overflow-hidden pt-32 pb-20 lg:pt-40 lg:pb-28">
      <div className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80" aria-hidden="true">
        <div className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#3b82f6] to-[#8b5cf6] opacity-20 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"></div>
      </div>
      <div className="mx-auto max-w-7xl px-6 lg:px-8 text-center">
        <div className="mx-auto max-w-3xl animate-slide-up">
          <h1 className="text-4xl font-extrabold tracking-tight text-neutral-900 sm:text-6xl mb-8">
            Create an ATS-Friendly CV in <span className="gradient-text">Seconds</span>
          </h1>
          <p className="mt-6 text-lg leading-8 text-[var(--color-text-muted)] mb-10">
            Powered by Google Gemini AI. Stop struggling with wording. Let AI craft a tailored, professional resume and cover letter that beats the tracking systems.
          </p>
          <div className="flex items-center justify-center gap-x-6">
            <Link href="/app" className="rounded-xl bg-neutral-900 px-8 py-3.5 text-sm font-semibold text-white shadow-xl hover:bg-neutral-800 transition-all hover:scale-105 active:scale-95">
              Build My CV Now
            </Link>
            <a href="#how-it-works" className="text-sm font-semibold leading-6 text-neutral-900 flex items-center gap-1 hover:text-neutral-600 transition-colors">
              How it works <span aria-hidden="true">→</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

function Features() {
  return (
    <section className="py-24 sm:py-32 bg-white/50">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center mb-16 animate-slide-up stagger-1">
          <h2 className="text-base font-semibold leading-7 text-blue-600">Work Smarter</h2>
          <p className="mt-2 text-3xl font-bold tracking-tight text-neutral-900 sm:text-4xl">Everything you need to land the interview</p>
        </div>
        <div className="mx-auto max-w-5xl mt-16 sm:mt-20 lg:mt-24">
          <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-10 lg:max-w-none lg:grid-cols-3">
            {[
              {
                title: 'AI-Powered Writing',
                desc: 'Gemini AI transforms your raw experience notes into professional, impactful bullet points instantly.',
                icon: '✨'
              },
              {
                title: 'ATS-Optimized PDF',
                desc: 'Export to clean, standard PDF formats (like the Harvard template) proven to pass parsing algorithms.',
                icon: '📄'
              },
              {
                title: 'Tailored Cover Letters',
                desc: 'Generate custom cover letters aligned perfectly with the job description you are applying for.',
                icon: '✉️'
              }
            ].map((feature, i) => (
              <div key={i} className="flex flex-col glass p-8 rounded-2xl hover:-translate-y-1 transition-transform duration-300">
                <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-neutral-900 mb-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-2xl">
                    {feature.icon}
                  </div>
                  {feature.title}
                </dt>
                <dd className="mt-1 flex flex-auto flex-col text-base leading-7 text-[var(--color-text-muted)]">
                  <p className="flex-auto">{feature.desc}</p>
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
}

function HowItWorks() {
  return (
    <section id="how-it-works" className="py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center mb-16 animate-slide-up stagger-2">
          <h2 className="text-3xl font-bold tracking-tight text-neutral-900 sm:text-4xl">3 Simple Steps</h2>
        </div>
        <div className="mx-auto max-w-5xl">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3 relative">
            <div className="hidden md:block absolute top-12 left-[15%] right-[15%] h-0.5 bg-neutral-200 -z-10"></div>
            {[
              { num: '1', title: 'Input Basics', desc: 'Fill in your name, contact, and raw work experiences.' },
              { num: '2', title: 'Let AI Magic Work', desc: 'Click generate and watch AI structure your professional profile.' },
              { num: '3', title: 'Download & Apply', desc: 'Preview your clean layout and download the ATS-friendly PDF.' }
            ].map((step, i) => (
              <div key={i} className="flex flex-col items-center text-center relative group">
                <div className="flex h-24 w-24 items-center justify-center rounded-full bg-white border-4 border-neutral-100 text-3xl font-black text-neutral-900 shadow-sm group-hover:border-blue-100 group-hover:text-blue-600 transition-all duration-300">
                  {step.num}
                </div>
                <h3 className="mt-6 text-xl font-bold text-neutral-900">{step.title}</h3>
                <p className="mt-2 text-[var(--color-text-muted)]">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="bg-white border-t border-[var(--color-border)] py-12 mt-auto">
      <div className="mx-auto max-w-7xl px-6 lg:px-8 text-center text-sm text-[var(--color-text-muted)]">
        <p>&copy; {new Date().getFullYear()} CareerGen. All rights reserved.</p>
        <p className="mt-2">Built with Next.js & Gemini AI</p>
      </div>
    </footer>
  );
}

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <Features />
        <HowItWorks />
      </main>
      <Footer />
    </>
  );
}
