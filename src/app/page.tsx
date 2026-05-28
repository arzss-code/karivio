import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { ArrowRight, Sparkles, FileText, CheckCircle2, FileCheck, Layers, FileSignature } from 'lucide-react';

function Hero() {
  return (
    <section className="relative pt-32 pb-20 lg:pt-40 lg:pb-28 overflow-hidden bg-white">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="lg:grid lg:grid-cols-12 lg:gap-16 items-center">
          
          {/* Text Content */}
          <div className="lg:col-span-6 text-center lg:text-left mb-16 lg:mb-0">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-neutral-50 px-3 py-1 text-xs font-semibold text-neutral-600">
              <CheckCircle2 className="h-3.5 w-3.5 text-neutral-900" />
              <span>Trusted by professionals worldwide</span>
            </div>
            
            <h1 className="text-4xl font-extrabold tracking-tight text-neutral-900 sm:text-6xl mb-6 leading-[1.15]">
              Craft a resume that <span className="text-neutral-500">opens doors.</span>
            </h1>
            
            <p className="text-lg leading-relaxed text-neutral-500 mb-8 max-w-2xl mx-auto lg:mx-0">
              Build a polished, ATS-optimized resume and cover letter in minutes. We provide the structure and professional wording so you can focus on preparing for your next interview.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
              <Link href="/app" className="group flex w-full items-center justify-center gap-2 rounded-full bg-neutral-900 px-8 py-3.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-neutral-800 active:scale-95 sm:w-auto">
                Create My Resume
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
              <a href="#how-it-works" className="flex w-full items-center justify-center gap-2 rounded-full border border-neutral-200 bg-white px-8 py-3.5 text-sm font-semibold text-neutral-700 transition-all hover:bg-neutral-50 sm:w-auto">
                See How It Works
              </a>
            </div>
          </div>

          {/* Abstract Resume Mockup */}
          <div className="lg:col-span-6 flex justify-center lg:justify-end">
            <div className="relative w-full max-w-md perspective-1000">
              <div className="absolute inset-0 bg-neutral-100 rounded-3xl transform rotate-3 translate-y-4 scale-95 -z-10"></div>
              <div className="absolute inset-0 bg-neutral-50 rounded-3xl transform -rotate-2 -translate-y-2 scale-100 -z-10 border border-neutral-200"></div>
              
              <div className="bg-white rounded-3xl shadow-xl border border-neutral-100 p-8 transform transition-transform hover:-translate-y-2 duration-500">
                {/* Header */}
                <div className="flex items-center gap-4 mb-8 border-b border-neutral-100 pb-6">
                  <div className="h-16 w-16 rounded-full bg-neutral-100 border border-neutral-200"></div>
                  <div className="space-y-3 flex-1">
                    <div className="h-4 w-1/2 rounded bg-neutral-300"></div>
                    <div className="h-3 w-1/3 rounded bg-neutral-100"></div>
                  </div>
                </div>
                
                {/* Body Blocks */}
                <div className="space-y-6">
                  <div>
                    <div className="h-3 w-1/4 rounded bg-neutral-200 mb-3"></div>
                    <div className="space-y-2">
                      <div className="h-2 w-full rounded bg-neutral-100"></div>
                      <div className="h-2 w-5/6 rounded bg-neutral-100"></div>
                      <div className="h-2 w-4/6 rounded bg-neutral-100"></div>
                    </div>
                  </div>
                  <div>
                    <div className="h-3 w-1/3 rounded bg-neutral-200 mb-3"></div>
                    <div className="space-y-2">
                      <div className="h-2 w-full rounded bg-neutral-100"></div>
                      <div className="h-2 w-full rounded bg-neutral-100"></div>
                      <div className="h-2 w-3/4 rounded bg-neutral-100"></div>
                    </div>
                  </div>
                  <div className="pt-2 flex gap-2">
                    <div className="h-6 w-16 rounded-full bg-neutral-50 border border-neutral-200"></div>
                    <div className="h-6 w-20 rounded-full bg-neutral-50 border border-neutral-200"></div>
                    <div className="h-6 w-14 rounded-full bg-neutral-50 border border-neutral-200"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
        </div>
      </div>
    </section>
  );
}

function Features() {
  const features = [
    {
      title: 'AI-Powered Writing',
      desc: 'Gemini AI transforms your raw experience notes into professional, impactful bullet points instantly.',
      icon: <Sparkles className="h-5 w-5" />
    },
    {
      title: 'ATS-Optimized PDF',
      desc: 'Export to clean, standard PDF formats proven to pass parsing algorithms perfectly.',
      icon: <FileCheck className="h-5 w-5" />
    },
    {
      title: 'Tailored Cover Letters',
      desc: 'Generate custom cover letters aligned perfectly with the job description you are applying for.',
      icon: <FileSignature className="h-5 w-5" />
    }
  ];

  return (
    <section className="py-24 sm:py-32 bg-neutral-50/50 border-y border-neutral-100">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center mb-16">
          <h2 className="text-sm font-bold uppercase tracking-widest text-neutral-400 mb-2">Work Smarter</h2>
          <p className="text-3xl font-bold tracking-tight text-neutral-900 sm:text-4xl">Everything you need to stand out</p>
        </div>
        
        <div className="mx-auto max-w-5xl">
          <div className="grid max-w-xl grid-cols-1 gap-8 lg:max-w-none lg:grid-cols-3">
            {features.map((feature, i) => (
              <div key={i} className="flex flex-col bg-white p-8 rounded-3xl border border-neutral-200 shadow-sm hover:shadow-md transition-shadow duration-300">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-neutral-900 text-white mb-6">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-neutral-900 mb-3">{feature.title}</h3>
                <p className="text-neutral-500 leading-relaxed text-sm">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function HowItWorks() {
  const steps = [
    { num: '01', title: 'Input Basics', desc: 'Fill in your name, contact, and dump your raw work experiences.' },
    { num: '02', title: 'Let AI Magic Work', desc: 'Click generate and watch AI structure your professional profile perfectly.' },
    { num: '03', title: 'Download & Apply', desc: 'Preview your clean layout and download the ATS-friendly PDF instantly.' }
  ];

  return (
    <section id="how-it-works" className="py-24 sm:py-32 bg-white">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center mb-20">
          <h2 className="text-3xl font-bold tracking-tight text-neutral-900 sm:text-4xl">How it works</h2>
          <p className="mt-4 text-neutral-500">Three simple steps to your next interview.</p>
        </div>
        
        <div className="mx-auto max-w-5xl">
          <div className="grid grid-cols-1 gap-12 md:grid-cols-3 relative">
            {/* Desktop Connector Line */}
            <div className="hidden md:block absolute top-8 left-[15%] right-[15%] h-[1px] bg-neutral-200 -z-10"></div>
            
            {steps.map((step, i) => (
              <div key={i} className="flex flex-col items-center text-center group">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white border border-neutral-200 text-xl font-bold text-neutral-900 shadow-sm group-hover:bg-neutral-900 group-hover:text-white transition-colors duration-300">
                  {step.num}
                </div>
                <h3 className="mt-6 text-lg font-bold text-neutral-900">{step.title}</h3>
                <p className="mt-2 text-sm text-neutral-500 max-w-xs">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col font-sans selection:bg-neutral-900 selection:text-white">
      <Navbar />
      <main className="flex-1">
        <Hero />
        <Features />
        <HowItWorks />
      </main>
      <Footer />
    </div>
  );
}
