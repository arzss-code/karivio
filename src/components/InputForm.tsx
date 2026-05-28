import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { setGenerating, setGenerationResult, setGenerationError, generationState } from '../lib/store';
import { useStore } from '@nanostores/react';
import { AlertCircle, ChevronLeft, ChevronRight, Loader2, Sparkles, FileText } from 'lucide-react';

const formSchema = z.object({
  fullname: z.string().min(2, 'Full Name is required'),
  email: z.string().email('Valid email is required'),
  phone: z.string().optional(),
  linkedin: z.string().optional(),
  education: z.string().optional(),
  projects: z.string().optional(),
  experience: z.string().min(10, 'Experience must be at least 10 characters'),
  jobDescription: z.string().min(10, 'Job description must be at least 10 characters'),
  language: z.enum(['auto', 'en', 'id']),
});

type FormValues = z.infer<typeof formSchema>;

export default function InputForm() {
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 4;
  const state = useStore(generationState);

  const {
    register,
    handleSubmit,
    trigger,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      language: 'auto',
    },
  });

  const experienceValue = watch('experience') || '';
  const jobDescValue = watch('jobDescription') || '';

  const nextStep = async () => {
    let fieldsToValidate: any[] = [];
    if (currentStep === 1) fieldsToValidate = ['fullname', 'email'];
    if (currentStep === 2) fieldsToValidate = ['education', 'projects'];
    if (currentStep === 3) fieldsToValidate = ['experience'];

    const isStepValid = await trigger(fieldsToValidate as any);
    if (isStepValid) {
      setCurrentStep((prev) => Math.min(prev + 1, totalSteps));
    }
  };

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const onSubmit = async (data: FormValues, type: 'cv' | 'cover-letter') => {
    setGenerating(true, type);
    
    let personalInfo = `${data.fullname}\n${data.email}`;
    if (data.phone) personalInfo += `\n${data.phone}`;
    if (data.linkedin) personalInfo += `\n${data.linkedin}`;

    const payload: any = {
      personalInfo,
      experience: data.experience,
      education: data.education,
      projects: data.projects,
      jobDescription: data.jobDescription,
      language: data.language,
    };

    if (type === 'cover-letter') {
      payload.name = data.fullname;
      payload.email = data.email;
    }

    try {
      const endpoint = type === 'cv' ? '/api/generate-cv' : '/api/generate-cover-letter';
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const resultData = await response.json();
      if (!response.ok) {
        throw new Error(resultData.error || 'Failed to generate document');
      }

      setGenerationResult(resultData.result);
      
      // Scroll to result preview section
      setTimeout(() => {
        document.getElementById('result-preview-section')?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
      
    } catch (err: any) {
      setGenerationError(err.message || 'An unexpected error occurred.');
    }
  };

  return (
    <section id="input-form-section" className="animate-slide-up w-full max-w-4xl mx-auto">
      {state.error && (
        <div className="mb-6 rounded-xl border border-error/30 bg-error/5 px-5 py-4 text-sm text-error flex items-start gap-3">
          <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
          <span>{state.error}</span>
        </div>
      )}

      {/* Progress Indicator */}
      <div className="mb-8">
        <div className="flex items-center justify-between relative">
          <div className="absolute left-0 top-1/2 -z-10 h-0.5 w-full -translate-y-1/2 bg-neutral-200 rounded-full"></div>
          <div 
            className="absolute left-0 top-1/2 -z-10 h-0.5 -translate-y-1/2 bg-primary-600 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${((currentStep - 1) / (totalSteps - 1)) * 100}%` }}
          ></div>
          
          {[1, 2, 3, 4].map((step) => (
            <div 
              key={step} 
              className={`w-9 h-9 flex items-center justify-center rounded-full text-sm font-semibold transition-all duration-300 border-2 ${
                step === currentStep 
                  ? 'border-primary-900 bg-primary-900 text-white shadow-[0_0_0_4px_var(--color-primary-50)] scale-110' 
                  : step < currentStep 
                    ? 'border-primary-900 bg-primary-50 text-primary-900' 
                    : 'border-neutral-200 bg-white text-neutral-400'
              }`}
            >
              {step}
            </div>
          ))}
        </div>
        <div className="flex justify-between text-xs font-medium mt-3 px-1">
          <span className={currentStep >= 1 ? "text-primary-800" : "text-neutral-400"}>Personal</span>
          <span className={currentStep >= 2 ? "text-primary-800" : "text-neutral-400"}>Education</span>
          <span className={currentStep >= 3 ? "text-primary-800" : "text-neutral-400"}>Experience</span>
          <span className={currentStep >= 4 ? "text-primary-800" : "text-neutral-400"}>Target Job</span>
        </div>
      </div>

      <div className="rounded-2xl border border-neutral-200/80 bg-white/95 backdrop-blur-sm shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden min-h-[480px] flex flex-col transition-all duration-300">
        
        {/* Step 1: Personal Info */}
        <div className={`p-6 sm:p-8 flex-1 transition-opacity duration-300 ${currentStep === 1 ? 'block opacity-100' : 'hidden opacity-0'}`}>
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-neutral-900">Personal Information</h2>
            <p className="text-sm text-neutral-500 mt-1">Let's start with your contact details so recruiters can reach you.</p>
          </div>
          
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-neutral-700">Full Name <span className="text-error">*</span></label>
              <input {...register('fullname')} className={`form-input ${errors.fullname ? 'border-error ring-1 ring-error' : ''}`} placeholder="Jane Smith" />
              {errors.fullname && <span className="text-xs text-error mt-1">{errors.fullname.message}</span>}
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-neutral-700">Email <span className="text-error">*</span></label>
              <input type="email" {...register('email')} className={`form-input ${errors.email ? 'border-error ring-1 ring-error' : ''}`} placeholder="jane@example.com" />
              {errors.email && <span className="text-xs text-error mt-1">{errors.email.message}</span>}
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-neutral-700">Phone <span className="text-neutral-400 font-normal text-xs">(optional)</span></label>
              <input type="tel" {...register('phone')} className="form-input" placeholder="+62 812 3456 7890" />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-neutral-700">LinkedIn URL <span className="text-neutral-400 font-normal text-xs">(optional)</span></label>
              <input type="url" {...register('linkedin')} className="form-input" placeholder="https://linkedin.com/in/janesmith" />
            </div>
          </div>
        </div>

        {/* Step 2: Education & Projects */}
        <div className={`p-6 sm:p-8 flex-1 transition-opacity duration-300 ${currentStep === 2 ? 'block opacity-100' : 'hidden opacity-0'}`}>
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-neutral-900">Education & Projects</h2>
            <p className="text-sm text-neutral-500 mt-1">Highlight your academic background and key achievements.</p>
          </div>
          
          <div className="grid grid-cols-1 gap-6">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-neutral-700">Education Background <span className="text-neutral-400 font-normal text-xs">(optional)</span></label>
              <textarea {...register('education')} rows={4} className="form-input resize-y" placeholder="e.g. B.S. Computer Science, University of Technology (2018 - 2022)"></textarea>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-neutral-700">Key Projects <span className="text-neutral-400 font-normal text-xs">(optional)</span></label>
              <textarea {...register('projects')} rows={4} className="form-input resize-y" placeholder="e.g. Built an E-commerce site using React and Node.js. Integrated Stripe payment."></textarea>
            </div>
          </div>
        </div>

        {/* Step 3: Experience */}
        <div className={`p-6 sm:p-8 flex-1 flex flex-col transition-opacity duration-300 ${currentStep === 3 ? 'flex opacity-100' : 'hidden opacity-0'}`}>
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-neutral-900">Professional Experience</h2>
            <p className="text-sm text-neutral-500 mt-1">Paste your rough work history. Our AI will structure it perfectly.</p>
          </div>
          
          <div className="flex-1 flex flex-col">
            <div className="flex justify-between items-center mb-1.5">
              <label className="text-sm font-medium text-neutral-700">Your Experience <span className="text-error">*</span></label>
              <span className={`text-xs ${experienceValue.length > 5000 ? 'text-error' : 'text-neutral-400'}`}>
                {experienceValue.length} / 5,000
              </span>
            </div>
            <textarea 
              {...register('experience')} 
              rows={8} 
              maxLength={5000} 
              className={`form-input flex-1 resize-y ${errors.experience ? 'border-error ring-1 ring-error' : ''}`} 
              placeholder="e.g. Software Engineer at Tech Corp (2020-2023). Managed a team of 5..."
            ></textarea>
            {errors.experience && <span className="text-xs text-error mt-1">{errors.experience.message}</span>}
          </div>
        </div>

        {/* Step 4: Target Job */}
        <div className={`p-6 sm:p-8 flex-1 flex flex-col transition-opacity duration-300 ${currentStep === 4 ? 'flex opacity-100' : 'hidden opacity-0'}`}>
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-neutral-900">Target Job</h2>
            <p className="text-sm text-neutral-500 mt-1">Paste the job description so we can perfectly tailor your documents.</p>
          </div>
          
          <div className="mb-6 flex-1 flex flex-col">
            <div className="flex justify-between items-center mb-1.5">
              <label className="text-sm font-medium text-neutral-700">Job Description <span className="text-error">*</span></label>
              <span className={`text-xs ${jobDescValue.length > 5000 ? 'text-error' : 'text-neutral-400'}`}>
                {jobDescValue.length} / 5,000
              </span>
            </div>
            <textarea 
              {...register('jobDescription')} 
              rows={6} 
              maxLength={5000} 
              className={`form-input flex-1 resize-y ${errors.jobDescription ? 'border-error ring-1 ring-error' : ''}`} 
              placeholder="Paste the requirements and responsibilities of the job you're applying for..."
            ></textarea>
            {errors.jobDescription && <span className="text-xs text-error mt-1">{errors.jobDescription.message}</span>}
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-neutral-700">Output Language</label>
            <select {...register('language')} className="form-input sm:w-1/2 cursor-pointer bg-white">
              <option value="auto">Auto-detect from Job Description</option>
              <option value="en">English (EN)</option>
              <option value="id">Bahasa Indonesia (ID)</option>
            </select>
          </div>
        </div>

        {/* Navigation Footer */}
        <div className="border-t border-neutral-100 p-4 sm:px-8 bg-neutral-50/50 flex justify-between items-center mt-auto">
          {currentStep > 1 ? (
            <button 
              type="button" 
              onClick={prevStep}
              className="inline-flex items-center justify-center rounded-xl px-4 py-2.5 text-sm font-medium text-neutral-700 bg-white border border-neutral-200 shadow-sm hover:bg-neutral-50 hover:text-neutral-900 transition-colors"
              disabled={state.isGenerating}
            >
              <ChevronLeft className="w-4 h-4 mr-1.5" />
              Back
            </button>
          ) : <div></div>}
          
          {currentStep < totalSteps ? (
            <button 
              type="button" 
              onClick={nextStep}
              className="inline-flex items-center justify-center rounded-xl px-5 py-2.5 text-sm font-semibold text-white bg-primary-900 border border-transparent shadow-sm hover:bg-primary-800 transition-colors"
            >
              Next Step
              <ChevronRight className="w-4 h-4 ml-1.5" />
            </button>
          ) : (
            <div className="flex gap-3">
              <button 
                type="button"
                onClick={handleSubmit((data) => onSubmit(data, 'cover-letter'))}
                disabled={state.isGenerating}
                className="inline-flex items-center justify-center rounded-xl px-4 py-2.5 text-sm font-medium text-primary-900 bg-primary-50 border border-primary-100 hover:bg-primary-100 transition-colors shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {state.isGenerating && state.type === 'cover-letter' ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <FileText className="w-4 h-4 mr-2" />
                )}
                Cover Letter
              </button>
              
              <button 
                type="button"
                onClick={handleSubmit((data) => onSubmit(data, 'cv'))}
                disabled={state.isGenerating}
                className="inline-flex items-center justify-center rounded-xl px-5 py-2.5 text-sm font-semibold text-white bg-primary-900 hover:bg-primary-800 transition-colors shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {state.isGenerating && state.type === 'cv' ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Sparkles className="w-4 h-4 mr-2" />
                )}
                Generate CV
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
