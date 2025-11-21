'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useAuthStore } from '@/store/authStore'
import { useRouter } from 'next/navigation'
import api from '@/lib/axios'
import toast from 'react-hot-toast'
import ThemeToggle from '@/components/ThemeToggle'
import JobPublishingWorkflow from '@/components/JobPublishingWorkflow'

interface JobFormData {
  title: string
  description: string
  mustHaveRequirements: string[]
  goodToHaveRequirements: string[]
  salaryMin: number
  salaryMax: number
  placementFeePercent: number
  urgency: string
  location: string
  remote: boolean
}

export default function CreateJobPage() {
  const { user } = useAuthStore()
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showPublishingWorkflow, setShowPublishingWorkflow] = useState(false)
  const [createdJobId, setCreatedJobId] = useState<string | null>(null)
  const [requirements, setRequirements] = useState({
    mustHave: [''],
    goodToHave: ['']
  })

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue
  } = useForm<JobFormData>({
    defaultValues: {
      urgency: 'NORMAL',
      remote: false,
      placementFeePercent: 19
    }
  })

  const addRequirement = (type: 'mustHave' | 'goodToHave') => {
    setRequirements(prev => ({
      ...prev,
      [type]: [...prev[type], '']
    }))
  }

  const removeRequirement = (type: 'mustHave' | 'goodToHave', index: number) => {
    setRequirements(prev => ({
      ...prev,
      [type]: prev[type].filter((_, i) => i !== index)
    }))
  }

  const updateRequirement = (type: 'mustHave' | 'goodToHave', index: number, value: string) => {
    setRequirements(prev => ({
      ...prev,
      [type]: prev[type].map((item, i) => i === index ? value : item)
    }))
  }

  const onSubmit = async (data: JobFormData) => {
    setIsSubmitting(true)
    try {
      const jobData = {
        ...data,
        mustHaveRequirements: requirements.mustHave.filter(req => req.trim() !== ''),
        goodToHaveRequirements: requirements.goodToHave.filter(req => req.trim() !== '')
      }

      const response = await api.post('/jobs', jobData)
      const createdJob = response.data
      setCreatedJobId(createdJob.id)
      setShowPublishingWorkflow(true)
      toast.success('Job opening created! Now choose how to brief recruiters.')
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to create job opening')
    } finally {
      setIsSubmitting(false)
    }
  }

  const nextStep = () => {
    if (currentStep < 4) setCurrentStep(currentStep + 1)
  }

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1)
  }

  if (!user || user.userType !== 'EMPLOYER') {
    router.push('/')
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <nav className="bg-white dark:bg-gray-800 shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <button
                onClick={() => router.push('/employer/dashboard')}
                className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 mr-4"
              >
                ← Back to Dashboard
              </button>
              <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
                Create New Job Opening
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <ThemeToggle />
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Progress Steps */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              {[1, 2, 3, 4].map((step) => (
                <div key={step} className="flex items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    currentStep >= step 
                      ? 'bg-primary-600 text-white' 
                      : 'bg-gray-300 text-gray-600'
                  }`}>
                    {step}
                  </div>
                  {step < 4 && (
                    <div className={`w-16 h-1 ml-2 ${
                      currentStep > step ? 'bg-primary-600' : 'bg-gray-300'
                    }`} />
                  )}
                </div>
              ))}
            </div>
            <div className="flex justify-between mt-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">Basic Info</span>
              <span className="text-sm text-gray-600 dark:text-gray-400">Requirements</span>
              <span className="text-sm text-gray-600 dark:text-gray-400">Compensation</span>
              <span className="text-sm text-gray-600 dark:text-gray-400">Review</span>
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            {/* Step 1: Basic Information */}
            {currentStep === 1 && (
              <div className="card">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Basic Information</h2>
                
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Job Title *
                    </label>
                    <input
                      {...register('title', { required: 'Job title is required' })}
                      type="text"
                      className="input-field"
                      placeholder="e.g., Senior Software Engineer"
                    />
                    {errors.title && (
                      <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Job Description *
                    </label>
                    <textarea
                      {...register('description', { required: 'Job description is required' })}
                      rows={6}
                      className="input-field"
                      placeholder="Describe the role, responsibilities, and what the candidate will be working on..."
                    />
                    {errors.description && (
                      <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Location
                      </label>
                      <input
                        {...register('location')}
                        type="text"
                        className="input-field"
                        placeholder="e.g., Central, Hong Kong"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Urgency Level
                      </label>
                      <select {...register('urgency')} className="input-field">
                        <option value="LOW">Low</option>
                        <option value="NORMAL">Normal</option>
                        <option value="HIGH">High</option>
                        <option value="URGENT">Urgent</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex items-center">
                    <input
                      {...register('remote')}
                      type="checkbox"
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    />
                    <label className="ml-2 block text-sm text-gray-900">
                      Remote work allowed
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Requirements */}
            {currentStep === 2 && (
              <div className="card">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Job Requirements</h2>
                
                <div className="space-y-8">
                  {/* Must Have Requirements */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-4">
                      Must Have Requirements *
                    </label>
                    <div className="space-y-3">
                      {requirements.mustHave.map((req, index) => (
                        <div key={index} className="flex items-center space-x-2">
                          <input
                            type="text"
                            value={req}
                            onChange={(e) => updateRequirement('mustHave', index, e.target.value)}
                            className="flex-1 input-field"
                            placeholder="e.g., 5+ years of software development experience"
                          />
                          {requirements.mustHave.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeRequirement('mustHave', index)}
                              className="text-red-600 hover:text-red-800"
                            >
                              Remove
                            </button>
                          )}
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={() => addRequirement('mustHave')}
                        className="text-primary-600 hover:text-primary-800 text-sm"
                      >
                        + Add another requirement
                      </button>
                    </div>
                  </div>

                  {/* Good to Have Requirements */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-4">
                      Good to Have Requirements
                    </label>
                    <div className="space-y-3">
                      {requirements.goodToHave.map((req, index) => (
                        <div key={index} className="flex items-center space-x-2">
                          <input
                            type="text"
                            value={req}
                            onChange={(e) => updateRequirement('goodToHave', index, e.target.value)}
                            className="flex-1 input-field"
                            placeholder="e.g., Experience with cloud platforms"
                          />
                          {requirements.goodToHave.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeRequirement('goodToHave', index)}
                              className="text-red-600 hover:text-red-800"
                            >
                              Remove
                            </button>
                          )}
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={() => addRequirement('goodToHave')}
                        className="text-primary-600 hover:text-primary-800 text-sm"
                      >
                        + Add another requirement
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Compensation */}
            {currentStep === 3 && (
              <div className="card">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Compensation & Fees</h2>
                
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Minimum Salary (HKD) *
                      </label>
                      <input
                        {...register('salaryMin', { 
                          required: 'Minimum salary is required',
                          min: { value: 0, message: 'Salary must be positive' }
                        })}
                        type="number"
                        className="input-field"
                        placeholder="400000"
                      />
                      {errors.salaryMin && (
                        <p className="mt-1 text-sm text-red-600">{errors.salaryMin.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Maximum Salary (HKD) *
                      </label>
                      <input
                        {...register('salaryMax', { 
                          required: 'Maximum salary is required',
                          min: { value: 0, message: 'Salary must be positive' }
                        })}
                        type="number"
                        className="input-field"
                        placeholder="600000"
                      />
                      {errors.salaryMax && (
                        <p className="mt-1 text-sm text-red-600">{errors.salaryMax.message}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Placement Fee Percentage *
                    </label>
                    
                    {/* Slider Container */}
                    <div className="space-y-4">
                      <div className="flex items-center space-x-4">
                        <span className="text-sm text-gray-500 min-w-[3rem]">19%</span>
                        <div className="flex-1 relative">
                          <input
                            {...register('placementFeePercent', { 
                              required: 'Placement fee percentage is required',
                              min: { value: 19, message: 'Minimum fee is 19%' },
                              max: { value: 33, message: 'Maximum fee is 33%' }
                            })}
                            type="range"
                            min="19"
                            max="33"
                            step="1"
                            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                            style={{
                              background: `linear-gradient(to right, #3B82F6 0%, #3B82F6 ${((watch('placementFeePercent') - 19) / 14) * 100}%, #E5E7EB ${((watch('placementFeePercent') - 19) / 14) * 100}%, #E5E7EB 100%)`
                            }}
                          />
                        </div>
                        <span className="text-sm text-gray-500 min-w-[3rem]">33%</span>
                      </div>
                      
                      {/* Current Value Display */}
                      <div className="text-center">
                        <span className="text-2xl font-bold text-primary-600">
                          {watch('placementFeePercent') || 19}%
                        </span>
                        <span className="text-sm text-gray-500 ml-2">of maximum salary</span>
                      </div>
                      
                      {/* Dynamic Encouragement Text */}
                      <div className="p-4 rounded-lg border-l-4" style={{
                        backgroundColor: watch('placementFeePercent') <= 19 ? '#FEF3C7' : 
                                        watch('placementFeePercent') <= 25 ? '#DBEAFE' : '#D1FAE5',
                        borderLeftColor: watch('placementFeePercent') <= 19 ? '#F59E0B' : 
                                        watch('placementFeePercent') <= 25 ? '#3B82F6' : '#10B981'
                      }}>
                        {watch('placementFeePercent') <= 19 ? (
                          <div className="flex items-start">
                            <div className="flex-shrink-0">
                              <svg className="h-5 w-5 text-amber-400" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                              </svg>
                            </div>
                            <div className="ml-3">
                              <h3 className="text-sm font-medium text-amber-800">
                                💡 Consider increasing the placement fee
                              </h3>
                              <p className="mt-1 text-sm text-amber-700">
                                A higher fee (20-25%) will attract more qualified recruiters and speed up your hiring process. 
                                This investment in quality recruitment can save you time and ensure better candidate matches.
                              </p>
                            </div>
                          </div>
                        ) : watch('placementFeePercent') <= 25 ? (
                          <div className="flex items-start">
                            <div className="flex-shrink-0">
                              <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                              </svg>
                            </div>
                            <div className="ml-3">
                              <h3 className="text-sm font-medium text-blue-800">
                                ✅ Good placement fee for regular hiring speed
                              </h3>
                              <p className="mt-1 text-sm text-blue-700">
                                This fee range attracts quality recruiters and provides a balanced approach to your hiring timeline. 
                                You should receive good candidate submissions within a reasonable timeframe.
                              </p>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-start">
                            <div className="flex-shrink-0">
                              <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.293l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414z" clipRule="evenodd" />
                              </svg>
                            </div>
                            <div className="ml-3">
                              <h3 className="text-sm font-medium text-green-800">
                                🚀 Accelerated hiring with premium placement fee
                              </h3>
                              <p className="mt-1 text-sm text-green-700">
                                Excellent! This premium fee will attract top recruiters and accelerate your hiring process. 
                                You can expect faster candidate submissions and higher quality matches with this competitive rate.
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                      
                      {/* Fee Calculation */}
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <p className="text-sm text-gray-600">
                          <span className="font-medium">Estimated placement fee:</span> HK${(() => {
                            const salaryMax = watch('salaryMax')
                            const feePercent = watch('placementFeePercent') || 19
                            return salaryMax ? Math.round((salaryMax * feePercent) / 100).toLocaleString() : '0'
                          })()}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          Recruiter receives: HK${(() => {
                            const salaryMax = watch('salaryMax')
                            const feePercent = watch('placementFeePercent') || 19
                            return salaryMax ? Math.round((salaryMax * feePercent * 0.7) / 100).toLocaleString() : '0'
                          })()} (70%) | 
                          Platform fee: HK${(() => {
                            const salaryMax = watch('salaryMax')
                            const feePercent = watch('placementFeePercent') || 19
                            return salaryMax ? Math.round((salaryMax * feePercent * 0.3) / 100).toLocaleString() : '0'
                          })()} (30%)
                        </p>
                      </div>
                    </div>
                    
                    {errors.placementFeePercent && (
                      <p className="mt-1 text-sm text-red-600">{errors.placementFeePercent.message}</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Review */}
            {currentStep === 4 && (
              <div className="card">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Review & Publish</h2>
                
                <div className="space-y-6">
                  <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                    <h3 className="font-semibold text-lg text-gray-900 dark:text-white">{watch('title')}</h3>
                    <p className="text-gray-600 dark:text-gray-300 mt-2">{watch('description')}</p>
                    
                    <div className="mt-4 grid grid-cols-2 gap-4 text-sm text-gray-700 dark:text-gray-300">
                      <div>
                        <span className="font-medium">Location:</span> {watch('location') || 'Not specified'}
                      </div>
                      <div>
                        <span className="font-medium">Remote:</span> {watch('remote') ? 'Yes' : 'No'}
                      </div>
                      <div>
                        <span className="font-medium">Urgency:</span> {watch('urgency')}
                      </div>
                      <div>
                        <span className="font-medium">Salary Range:</span> HK${watch('salaryMin')?.toLocaleString()} - HK${watch('salaryMax')?.toLocaleString()}
                      </div>
                    </div>
                  </div>

                  <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                    <h4 className="font-semibold text-blue-900 dark:text-blue-200 mb-2">Must Have Requirements:</h4>
                    <ul className="list-disc list-inside text-sm text-blue-800 dark:text-blue-300">
                      {requirements.mustHave.filter(req => req.trim() !== '').map((req, index) => (
                        <li key={index}>{req}</li>
                      ))}
                    </ul>
                  </div>

                  {requirements.goodToHave.filter(req => req.trim() !== '').length > 0 && (
                    <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                      <h4 className="font-semibold text-green-900 dark:text-green-200 mb-2">Good to Have Requirements:</h4>
                      <ul className="list-disc list-inside text-sm text-green-800 dark:text-green-300">
                        {requirements.goodToHave.filter(req => req.trim() !== '').map((req, index) => (
                          <li key={index}>{req}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
                    <h4 className="font-semibold text-yellow-900 dark:text-yellow-200 mb-2">Placement Fee Details:</h4>
                    <p className="text-sm text-yellow-800 dark:text-yellow-300">
                      You will pay <strong>{watch('placementFeePercent')}%</strong> of the maximum salary 
                      (<strong>HK${watch('salaryMax')?.toLocaleString()}</strong>) = 
                      <strong> HK${watch('salaryMax') ? Math.round((watch('salaryMax') * watch('placementFeePercent')) / 100).toLocaleString() : '0'}</strong>
                    </p>
                    <p className="text-xs text-yellow-700 dark:text-yellow-400 mt-1">
                      The recruiter will receive 70% of this fee, and the platform will take 30%.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between">
              <button
                type="button"
                onClick={prevStep}
                disabled={currentStep === 1}
                className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>

              <div className="flex space-x-4">
                {currentStep < 4 ? (
                  <button
                    type="button"
                    onClick={nextStep}
                    className="btn-primary"
                  >
                    Next
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? 'Creating Job...' : 'Create Job Opening'}
                  </button>
                )}
              </div>
            </div>
          </form>
        </div>
      </div>

      {/* Publishing Workflow Modal */}
      {showPublishingWorkflow && createdJobId && (
        <JobPublishingWorkflow
          jobId={createdJobId}
          onComplete={() => {
            setShowPublishingWorkflow(false)
            router.push('/employer/dashboard')
          }}
          onCancel={() => {
            setShowPublishingWorkflow(false)
            router.push('/employer/dashboard')
          }}
        />
      )}
    </div>
  )
}
