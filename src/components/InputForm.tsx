'use client';
import React, { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { setGenerating, setGenerationResult, setGenerationError, generationState } from '../lib/store';
import { useStore } from '@nanostores/react';
import { AlertCircle, ChevronLeft, ChevronRight, Loader2, Sparkles, FileText, Plus, Trash2 } from 'lucide-react';

const formSchema = z.object({
  fullname: z.string().min(2, 'Full Name is required'),
  email: z.string().email('Valid email is required'),
  phone: z.string().optional(),
  linkedin: z.string().optional(),
  education: z.array(
    z.object({
      degree: z.string().min(1, 'Degree/Major is required'),
      institution: z.string().min(1, 'Institution is required'),
      year: z.string().optional(),
      gpa: z.string().optional(),
      description: z.string().optional(),
    })
  ).optional(),
  projects: z.array(
    z.object({
      name: z.string().min(1, 'Project name is required'),
      description: z.string().min(5, 'Brief description required'),
    })
  ).optional(),
  experience: z.array(
    z.object({
      title: z.string().min(1, 'Job title is required'),
      company: z.string().min(1, 'Company is required'),
      duration: z.string().optional(),
      description: z.string().min(10, 'Please describe your responsibilities'),
    })
  ).min(1, 'At least one experience is required'),
  achievements: z.string().optional(),
  certifications: z.string().optional(),
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
    control,
    handleSubmit,
    trigger,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      language: 'auto',
      experience: [{ title: '', company: '', duration: '', description: '' }],
      education: [],
      projects: [],
      achievements: '',
      certifications: '',
    },
  });

  const { fields: expFields, append: appendExp, remove: removeExp } = useFieldArray({
    control,
    name: 'experience',
  });

  const { fields: eduFields, append: appendEdu, remove: removeEdu } = useFieldArray({
    control,
    name: 'education',
  });

  const { fields: projFields, append: appendProj, remove: removeProj } = useFieldArray({
    control,
    name: 'projects',
  });

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
    
    // Format payload nicely for prompt insertion
    let personalInfo = `Name: ${data.fullname}\nEmail: ${data.email}`;
    if (data.phone) personalInfo += `\nPhone: ${data.phone}`;
    if (data.linkedin) personalInfo += `\nLinkedIn: ${data.linkedin}`;

    let experienceText = data.experience.map(e => 
      `Role: ${e.title} at ${e.company} (${e.duration || 'N/A'})\nResponsibilities:\n${e.description}`
    ).join('\n\n');

    let educationText = data.education && data.education.length > 0 
      ? data.education.map(e => {
          let str = `${e.degree} from ${e.institution} (${e.year || 'N/A'})`;
          if (e.gpa) str += ` | GPA: ${e.gpa}`;
          if (e.description) str += `\nDetails: ${e.description}`;
          return str;
        }).join('\n')
      : 'None provided';

    let projectsText = data.projects && data.projects.length > 0
      ? data.projects.map(p => `Project: ${p.name}\nDescription: ${p.description}`).join('\n\n')
      : 'None provided';

    const payload: any = {
      personalInfo,
      experience: experienceText,
      education: educationText,
      projects: projectsText,
      achievements: data.achievements || '',
      certifications: data.certifications || '',
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
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-600 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
          <span>{state.error}</span>
        </div>
      )}

      {/* Progress Indicator */}
      <div className="mb-8">
        <div className="flex items-center justify-between relative">
          <div className="absolute left-0 top-1/2 -z-10 h-0.5 w-full -translate-y-1/2 bg-neutral-200 rounded-full"></div>
          <div 
            className="absolute left-0 top-1/2 -z-10 h-0.5 -translate-y-1/2 bg-neutral-900 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${((currentStep - 1) / (totalSteps - 1)) * 100}%` }}
          ></div>
          
          {[1, 2, 3, 4].map((step) => (
            <div 
              key={step} 
              className={`w-9 h-9 flex items-center justify-center rounded-full text-sm font-semibold transition-all duration-300 border-2 ${
                step === currentStep 
                  ? 'border-neutral-900 bg-neutral-900 text-white shadow-[0_0_0_4px_#fff]' 
                  : step < currentStep 
                    ? 'border-neutral-900 bg-neutral-100 text-neutral-900' 
                    : 'border-neutral-200 bg-white text-neutral-400'
              }`}
            >
              {step}
            </div>
          ))}
        </div>
        <div className="flex justify-between text-xs font-medium mt-3 px-1">
          <span className={currentStep >= 1 ? "text-neutral-900" : "text-neutral-400"}>Personal</span>
          <span className={currentStep >= 2 ? "text-neutral-900" : "text-neutral-400"}>Edu/Projects</span>
          <span className={currentStep >= 3 ? "text-neutral-900" : "text-neutral-400"}>Experience</span>
          <span className={currentStep >= 4 ? "text-neutral-900" : "text-neutral-400"}>Target Job</span>
        </div>
      </div>

      <div className="rounded-2xl border border-neutral-200 bg-white shadow-sm overflow-hidden min-h-[500px] flex flex-col transition-all duration-300">
        
        {/* Step 1: Personal Info */}
        <div className={`p-6 sm:p-8 flex-1 transition-opacity duration-300 ${currentStep === 1 ? 'block opacity-100' : 'hidden opacity-0'}`}>
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-neutral-900">Personal Information</h2>
            <p className="text-sm text-neutral-500 mt-1">Contact details so recruiters can reach you.</p>
          </div>
          
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-neutral-700">Full Name <span className="text-red-500">*</span></label>
              <input {...register('fullname')} className={`form-input w-full rounded-xl border-neutral-200 bg-neutral-50 px-4 py-3 focus:border-neutral-400 focus:ring-0 ${errors.fullname ? 'border-red-300' : ''}`} placeholder="Jane Smith" />
              {errors.fullname && <span className="text-xs text-red-500 mt-1 block">{errors.fullname.message}</span>}
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-neutral-700">Email <span className="text-red-500">*</span></label>
              <input type="email" {...register('email')} className={`form-input w-full rounded-xl border-neutral-200 bg-neutral-50 px-4 py-3 focus:border-neutral-400 focus:ring-0 ${errors.email ? 'border-red-300' : ''}`} placeholder="jane@example.com" />
              {errors.email && <span className="text-xs text-red-500 mt-1 block">{errors.email.message}</span>}
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-neutral-700">Phone <span className="text-neutral-400 font-normal text-xs">(optional)</span></label>
              <input type="tel" {...register('phone')} className="form-input w-full rounded-xl border-neutral-200 bg-neutral-50 px-4 py-3 focus:border-neutral-400 focus:ring-0" placeholder="+62 812 3456 7890" />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-neutral-700">LinkedIn URL <span className="text-neutral-400 font-normal text-xs">(optional)</span></label>
              <input type="url" {...register('linkedin')} className="form-input w-full rounded-xl border-neutral-200 bg-neutral-50 px-4 py-3 focus:border-neutral-400 focus:ring-0" placeholder="linkedin.com/in/janesmith" />
            </div>
          </div>
        </div>

        {/* Step 2: Education & Projects */}
        <div className={`p-6 sm:p-8 flex-1 transition-opacity duration-300 ${currentStep === 2 ? 'block opacity-100 overflow-y-auto max-h-[60vh]' : 'hidden opacity-0'}`}>
          
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-neutral-900">Education</h2>
            <p className="text-sm text-neutral-500 mt-1">Add your academic background.</p>
          </div>
          <div className="space-y-6">
            {eduFields.map((field, index) => (
              <div key={field.id} className="p-5 border border-neutral-200 rounded-2xl bg-neutral-50/50 relative">
                <button type="button" onClick={() => removeEdu(index)} className="absolute top-4 right-4 text-neutral-400 hover:text-red-500 transition-colors">
                  <Trash2 className="h-4 w-4" />
                </button>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold text-neutral-600">Degree / Major <span className="text-red-500">*</span></label>
                    <input {...register(`education.${index}.degree` as const)} className="form-input w-full rounded-lg border-neutral-200 px-3 py-2 text-sm focus:border-neutral-400" placeholder="B.S. Computer Science" />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold text-neutral-600">Institution <span className="text-red-500">*</span></label>
                    <input {...register(`education.${index}.institution` as const)} className="form-input w-full rounded-lg border-neutral-200 px-3 py-2 text-sm focus:border-neutral-400" placeholder="Politeknik Negeri Semarang" />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold text-neutral-600">Year</label>
                    <input {...register(`education.${index}.year` as const)} className="form-input w-full rounded-lg border-neutral-200 px-3 py-2 text-sm focus:border-neutral-400" placeholder="2020 - 2024" />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold text-neutral-600">GPA <span className="text-neutral-400 font-normal">(optional)</span></label>
                    <input {...register(`education.${index}.gpa` as const)} className="form-input w-full rounded-lg border-neutral-200 px-3 py-2 text-sm focus:border-neutral-400" placeholder="3.80 / 4.00" />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="mb-1.5 block text-xs font-semibold text-neutral-600">Relevant Coursework / Notes <span className="text-neutral-400 font-normal">(optional)</span></label>
                    <input {...register(`education.${index}.description` as const)} className="form-input w-full rounded-lg border-neutral-200 px-3 py-2 text-sm focus:border-neutral-400" placeholder="Relevant coursework: Algorithms, Machine Learning, Database Systems" />
                  </div>
                </div>
              </div>
            ))}
            <button type="button" onClick={() => appendEdu({ degree: '', institution: '', year: '', gpa: '', description: '' })} className="flex items-center gap-2 text-sm font-semibold text-neutral-700 hover:text-neutral-900 bg-neutral-100 px-4 py-2.5 rounded-xl transition-colors">
              <Plus className="h-4 w-4" /> Add Education
            </button>
          </div>

          <div className="mt-12 mb-8">
            <h2 className="text-2xl font-bold text-neutral-900">Projects</h2>
            <p className="text-sm text-neutral-500 mt-1">Add key projects to stand out.</p>
          </div>
          <div className="space-y-6">
            {projFields.map((field, index) => (
              <div key={field.id} className="p-5 border border-neutral-200 rounded-2xl bg-neutral-50/50 relative">
                <button type="button" onClick={() => removeProj(index)} className="absolute top-4 right-4 text-neutral-400 hover:text-red-500 transition-colors">
                  <Trash2 className="h-4 w-4" />
                </button>
                <div className="space-y-4">
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold text-neutral-600">Project Name <span className="text-red-500">*</span></label>
                    <input {...register(`projects.${index}.name` as const)} className="form-input w-full rounded-lg border-neutral-200 px-3 py-2 text-sm focus:border-neutral-400" placeholder="E-commerce App" />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold text-neutral-600">Description <span className="text-red-500">*</span></label>
                    <textarea {...register(`projects.${index}.description` as const)} rows={3} className="form-input w-full rounded-lg border-neutral-200 px-3 py-2 text-sm focus:border-neutral-400" placeholder="Built a full-stack e-commerce site using Next.js and Stripe..."></textarea>
                  </div>
                </div>
              </div>
            ))}
            <button type="button" onClick={() => appendProj({ name: '', description: '' })} className="flex items-center gap-2 text-sm font-semibold text-neutral-700 hover:text-neutral-900 bg-neutral-100 px-4 py-2.5 rounded-xl transition-colors">
              <Plus className="h-4 w-4" /> Add Project
            </button>
          </div>

          {/* Achievements & Certifications */}
          <div className="mt-12 mb-6">
            <h2 className="text-2xl font-bold text-neutral-900">Achievements <span className="text-sm font-normal text-neutral-400 ml-1">(optional)</span></h2>
            <p className="text-sm text-neutral-500 mt-1">Awards, honors, or notable accomplishments.</p>
          </div>
          <div>
            <textarea
              {...register('achievements')}
              rows={3}
              className="form-input w-full rounded-xl border-neutral-200 bg-neutral-50 px-4 py-3 text-sm focus:border-neutral-400 focus:ring-0"
              placeholder="- 1st Place, National Programming Competition 2023&#10;- Dean's List, 4 consecutive semesters"
            ></textarea>
          </div>

          <div className="mt-10 mb-6">
            <h2 className="text-2xl font-bold text-neutral-900">Certifications <span className="text-sm font-normal text-neutral-400 ml-1">(optional)</span></h2>
            <p className="text-sm text-neutral-500 mt-1">Professional certificates or courses completed.</p>
          </div>
          <div>
            <textarea
              {...register('certifications')}
              rows={3}
              className="form-input w-full rounded-xl border-neutral-200 bg-neutral-50 px-4 py-3 text-sm focus:border-neutral-400 focus:ring-0"
              placeholder="- AWS Certified Developer Associate (2024)&#10;- Google Data Analytics Certificate (Coursera, 2023)"
            ></textarea>
          </div>
        </div>

        {/* Step 3: Experience */}
        <div className={`p-6 sm:p-8 flex-1 transition-opacity duration-300 ${currentStep === 3 ? 'block opacity-100 overflow-y-auto max-h-[60vh]' : 'hidden opacity-0'}`}>
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-neutral-900">Professional Experience</h2>
            <p className="text-sm text-neutral-500 mt-1">Structure your work history. Our AI will optimize the wording.</p>
          </div>
          
          <div className="space-y-6">
            {expFields.map((field, index) => (
              <div key={field.id} className="p-5 border border-neutral-200 rounded-2xl bg-neutral-50/50 relative">
                {index > 0 && (
                  <button type="button" onClick={() => removeExp(index)} className="absolute top-4 right-4 text-neutral-400 hover:text-red-500 transition-colors">
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold text-neutral-600">Job Title <span className="text-red-500">*</span></label>
                    <input {...register(`experience.${index}.title` as const)} className="form-input w-full rounded-lg border-neutral-200 px-3 py-2 text-sm focus:border-neutral-400" placeholder="Software Engineer" />
                    {errors?.experience?.[index]?.title && <span className="text-[10px] text-red-500 mt-1">{errors.experience[index]?.title?.message}</span>}
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold text-neutral-600">Company <span className="text-red-500">*</span></label>
                    <input {...register(`experience.${index}.company` as const)} className="form-input w-full rounded-lg border-neutral-200 px-3 py-2 text-sm focus:border-neutral-400" placeholder="Tech Corp" />
                    {errors?.experience?.[index]?.company && <span className="text-[10px] text-red-500 mt-1">{errors.experience[index]?.company?.message}</span>}
                  </div>
                  <div className="sm:col-span-2">
                    <label className="mb-1.5 block text-xs font-semibold text-neutral-600">Duration</label>
                    <input {...register(`experience.${index}.duration` as const)} className="form-input w-full rounded-lg border-neutral-200 px-3 py-2 text-sm focus:border-neutral-400" placeholder="Jan 2020 - Present" />
                  </div>
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-neutral-600">Raw Responsibilities & Achievements <span className="text-red-500">*</span></label>
                  <textarea {...register(`experience.${index}.description` as const)} rows={4} className="form-input w-full rounded-lg border-neutral-200 px-3 py-2 text-sm focus:border-neutral-400" placeholder="- Managed a team of 5 developers&#10;- Improved page load speed by 40%"></textarea>
                  {errors?.experience?.[index]?.description && <span className="text-[10px] text-red-500 mt-1">{errors.experience[index]?.description?.message}</span>}
                </div>
              </div>
            ))}
            
            <button type="button" onClick={() => appendExp({ title: '', company: '', duration: '', description: '' })} className="flex w-full items-center justify-center gap-2 text-sm font-semibold text-neutral-700 border border-dashed border-neutral-300 hover:border-neutral-400 hover:bg-neutral-50 px-4 py-4 rounded-2xl transition-colors">
              <Plus className="h-4 w-4" /> Add Another Experience
            </button>
          </div>
        </div>

        {/* Step 4: Target Job */}
        <div className={`p-6 sm:p-8 flex-1 flex flex-col transition-opacity duration-300 ${currentStep === 4 ? 'flex opacity-100' : 'hidden opacity-0'}`}>
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-neutral-900">Target Job</h2>
            <p className="text-sm text-neutral-500 mt-1">Paste the job description so we can tailor your resume.</p>
          </div>
          
          <div className="mb-6 flex-1 flex flex-col">
            <div className="flex justify-between items-center mb-1.5">
              <label className="text-sm font-semibold text-neutral-700">Job Description <span className="text-red-500">*</span></label>
              <span className={`text-xs ${jobDescValue.length > 5000 ? 'text-red-500' : 'text-neutral-400'}`}>
                {jobDescValue.length} / 5,000
              </span>
            </div>
            <textarea 
              {...register('jobDescription')} 
              rows={8} 
              maxLength={5000} 
              className={`form-input flex-1 w-full rounded-xl border-neutral-200 bg-neutral-50 p-4 focus:border-neutral-400 focus:ring-0 resize-none ${errors.jobDescription ? 'border-red-300' : ''}`} 
              placeholder="Paste the requirements and responsibilities of the job you're applying for..."
            ></textarea>
            {errors.jobDescription && <span className="text-xs text-red-500 mt-1 block">{errors.jobDescription.message}</span>}
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-semibold text-neutral-700">Output Language</label>
            <select {...register('language')} className="form-input w-full sm:w-1/2 rounded-xl border-neutral-200 bg-neutral-50 px-4 py-3 focus:border-neutral-400 focus:ring-0 cursor-pointer">
              <option value="auto">Auto-detect from Job Description</option>
              <option value="en">English (EN)</option>
              <option value="id">Bahasa Indonesia (ID)</option>
            </select>
          </div>
        </div>

        {/* Navigation Footer */}
        <div className="border-t border-neutral-100 p-5 sm:px-8 bg-neutral-50 flex justify-between items-center mt-auto">
          {currentStep > 1 ? (
            <button 
              type="button" 
              onClick={prevStep}
              className="inline-flex items-center justify-center rounded-xl px-5 py-2.5 text-sm font-semibold text-neutral-700 bg-white border border-neutral-200 shadow-sm hover:bg-neutral-50 transition-colors"
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
              className="inline-flex items-center justify-center rounded-xl px-6 py-2.5 text-sm font-semibold text-white bg-neutral-900 border border-transparent shadow-sm hover:bg-neutral-800 transition-colors"
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
                className="inline-flex items-center justify-center rounded-xl px-5 py-2.5 text-sm font-semibold text-neutral-900 bg-white border border-neutral-200 hover:bg-neutral-50 transition-colors shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
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
                className="inline-flex items-center justify-center rounded-xl px-6 py-2.5 text-sm font-semibold text-white bg-neutral-900 hover:bg-neutral-800 transition-colors shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
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
