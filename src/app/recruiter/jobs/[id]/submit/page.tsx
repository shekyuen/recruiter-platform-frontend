'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'
import { useForm } from 'react-hook-form'
import api from '@/lib/axios'
import toast from 'react-hot-toast'
import ThemeToggle from '@/components/ThemeToggle'
import { ArrowLeftIcon, UserIcon, DocumentTextIcon, ChatBubbleLeftRightIcon, CalendarDaysIcon } from '@heroicons/react/24/outline'

interface JobOpening {
  id: string
  title: string
  salaryMin: number
  salaryMax: number
  placementFeePercent: number
}

interface CandidateSubmissionFormData {
  candidateName: string
  candidateEmail: string
  countryCode: string
  candidatePhone: string
  resumeUrl: string
  coverLetter?: string
  screeningResponses: string
  fitNotes: string
  interviewAvailability: string
}

export default function SubmitCandidatePage() {
  const { id } = useParams()
  const router = useRouter()
  const { user } = useAuthStore()
  const [job, setJob] = useState<JobOpening | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [mounted, setMounted] = useState(false)

  const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm<CandidateSubmissionFormData>()

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!user || user.userType !== 'RECRUITER') {
      router.push('/')
      return
    }

    if (id) {
      fetchJobDetails()
    }
  }, [id, user, router])

  const fetchJobDetails = async () => {
    try {
      const response = await api.get(`/jobs/${id}`)
      setJob(response.data.job)
    } catch (error) {
      toast.error('Failed to fetch job details.')
      console.error('Error fetching job details:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const onSubmit = async (data: CandidateSubmissionFormData) => {
    setIsSubmitting(true)
    try {
      await api.post('/submissions', {
        jobId: id,
        candidateName: data.candidateName,
        candidateEmail: data.candidateEmail,
        candidatePhone: `${data.countryCode} ${data.candidatePhone}`,
        resumeUrl: data.resumeUrl,
        coverLetter: data.coverLetter,
        screeningResponses: data.screeningResponses,
        fitNotes: data.fitNotes,
        interviewAvailability: data.interviewAvailability,
        status: 'SUBMITTED'
      })
      
      toast.success('Candidate submitted successfully!')
      router.push(`/recruiter/jobs/${id}`)
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to submit candidate.')
      console.error('Submit candidate error:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (!job) {
    return <div className="text-center py-10 text-gray-600 dark:text-gray-300">Job not found.</div>
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push(`/recruiter/jobs/${id}`)}
                className="p-2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-400"
              >
                <ArrowLeftIcon className="h-6 w-6" />
              </button>
              <div>
                <h1 className="text-3xl font-bold leading-tight text-gray-900 dark:text-white">Submit Candidate</h1>
                <p className="text-sm text-gray-600 dark:text-gray-300">for {job.title}</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <ThemeToggle />
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Candidate Information */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <UserIcon className="h-6 w-6 mr-2 text-primary-600" />
                Candidate Information
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="candidateName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 dark:text-gray-300">
                    Full Name *
                  </label>
                  <input
                    {...register('candidateName', { required: 'Candidate name is required' })}
                    type="text"
                    className="input-field mt-1"
                    placeholder="John Doe"
                  />
                  {errors.candidateName && <p className="mt-1 text-sm text-red-600">{errors.candidateName.message}</p>}
                </div>
                
                <div>
                  <label htmlFor="candidateEmail" className="block text-sm font-medium text-gray-700 dark:text-gray-300 dark:text-gray-300">
                    Email Address *
                  </label>
                  <input
                    {...register('candidateEmail', { 
                      required: 'Email is required',
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: 'Invalid email address'
                      }
                    })}
                    type="email"
                    className="input-field mt-1"
                    placeholder="john.doe@email.com"
                  />
                  {errors.candidateEmail && <p className="mt-1 text-sm text-red-600">{errors.candidateEmail.message}</p>}
                </div>
                
                <div>
                  <label htmlFor="candidatePhone" className="block text-sm font-medium text-gray-700 dark:text-gray-300 dark:text-gray-300">
                    Phone Number *
                  </label>
                  <div className="mt-1 flex rounded-md shadow-sm">
                    <select
                      {...register('countryCode', { required: 'Country code is required' })}
                      className="inline-flex items-center px-3 rounded-l-md border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-sm focus:border-primary-500 focus:ring-primary-500"
                    >
                      <option value="+852">🇭🇰 Hong Kong (+852)</option>
                      <option value="+86">🇨🇳 China (+86)</option>
                      <option value="+65">🇸🇬 Singapore (+65)</option>
                      <option value="+60">🇲🇾 Malaysia (+60)</option>
                      <option value="+66">🇹🇭 Thailand (+66)</option>
                      <option value="+63">🇵🇭 Philippines (+63)</option>
                      <option value="+62">🇮🇩 Indonesia (+62)</option>
                      <option value="+84">🇻🇳 Vietnam (+84)</option>
                      <option value="+1">🇺🇸 USA (+1)</option>
                      <option value="+44">🇬🇧 UK (+44)</option>
                      <option value="+61">🇦🇺 Australia (+61)</option>
                      <option value="+81">🇯🇵 Japan (+81)</option>
                      <option value="+82">🇰🇷 South Korea (+82)</option>
                    </select>
                    <input
                      {...register('candidatePhone', { 
                        required: 'Phone number is required',
                        pattern: {
                          value: /^[0-9\s\-\(\)]+$/,
                          message: 'Please enter numbers only'
                        }
                      })}
                      type="tel"
                      className="flex-1 min-w-0 block w-full px-3 py-2 rounded-none rounded-r-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:border-primary-500 focus:ring-primary-500"
                      placeholder="9123 4567"
                    />
                  </div>
                  {errors.candidatePhone && <p className="mt-1 text-sm text-red-600">{errors.candidatePhone.message}</p>}
                </div>
              </div>
            </div>

            {/* Documents */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <DocumentTextIcon className="h-6 w-6 mr-2 text-primary-600" />
                Documents
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label htmlFor="resumeUrl" className="block text-sm font-medium text-gray-700 dark:text-gray-300 dark:text-gray-300">
                    Resume URL *
                  </label>
                  <input
                    {...register('resumeUrl', { 
                      required: 'Resume URL is required',
                      pattern: {
                        value: /^https?:\/\/.+/,
                        message: 'Please enter a valid URL'
                      }
                    })}
                    type="url"
                    className="input-field mt-1"
                    placeholder="https://drive.google.com/file/..."
                  />
                  {errors.resumeUrl && <p className="mt-1 text-sm text-red-600">{errors.resumeUrl.message}</p>}
                </div>
                
                <div>
                  <label htmlFor="coverLetter" className="block text-sm font-medium text-gray-700 dark:text-gray-300 dark:text-gray-300">
                    Cover Letter URL (Optional)
                  </label>
                  <input
                    {...register('coverLetter', {
                      pattern: {
                        value: /^https?:\/\/.+/,
                        message: 'Please enter a valid URL'
                      }
                    })}
                    type="url"
                    className="input-field mt-1"
                    placeholder="https://drive.google.com/file/..."
                  />
                  {errors.coverLetter && <p className="mt-1 text-sm text-red-600">{errors.coverLetter.message}</p>}
                </div>
              </div>
            </div>

            {/* Screening Responses */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <ChatBubbleLeftRightIcon className="h-6 w-6 mr-2 text-primary-600" />
                Screening Responses
              </h2>
              
              <div>
                <label htmlFor="screeningResponses" className="block text-sm font-medium text-gray-700 dark:text-gray-300 dark:text-gray-300">
                  Candidate's responses to screening questions *
                </label>
                <textarea
                  {...register('screeningResponses', { required: 'Screening responses are required' })}
                  rows={6}
                  className="input-field mt-1"
                  placeholder="Please provide the candidate's responses to the job requirements and any screening questions..."
                ></textarea>
                {errors.screeningResponses && <p className="mt-1 text-sm text-red-600">{errors.screeningResponses.message}</p>}
              </div>
            </div>

            {/* Recruiter Notes */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Recruiter Assessment</h2>
              
              <div className="space-y-4">
                <div>
                  <label htmlFor="fitNotes" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Why this candidate fits the role *
                  </label>
                  <textarea
                    {...register('fitNotes', { required: 'Fit notes are required' })}
                    rows={4}
                    className="input-field mt-1"
                    placeholder="Explain why this candidate is a good fit for the position, highlighting relevant experience and skills..."
                  ></textarea>
                  {errors.fitNotes && <p className="mt-1 text-sm text-red-600">{errors.fitNotes.message}</p>}
                </div>
                
              </div>
            </div>

            {/* Interview Availability */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <CalendarDaysIcon className="h-6 w-6 mr-2 text-primary-600" />
                Interview Availability
              </h2>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Candidate's interview availability *
                </label>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-2">
                      Select available dates (from today to 2 weeks ahead):
                    </label>
                    <div className="grid grid-cols-7 gap-2">
                      {Array.from({ length: 14 }, (_, i) => {
                        const date = new Date()
                        date.setDate(date.getDate() + i)
                        const dateStr = date.toISOString().split('T')[0]
                        const dayName = date.toLocaleDateString('en-US', { weekday: 'short' })
                        const dayNum = date.getDate()
                        
                        return (
                          <label key={dateStr} className="relative">
                            <input
                              type="checkbox"
                              value={dateStr}
                              className="sr-only peer"
                              onChange={(e) => {
                                const currentValue = watch('interviewAvailability') || ''
                                const selectedDates = currentValue ? currentValue.split(',') : []
                                
                                if (e.target.checked) {
                                  selectedDates.push(dateStr)
                                } else {
                                  const index = selectedDates.indexOf(dateStr)
                                  if (index > -1) selectedDates.splice(index, 1)
                                }
                                
                                setValue('interviewAvailability', selectedDates.join(','))
                              }}
                            />
                            <div className="w-full p-2 text-center border rounded-lg cursor-pointer peer-checked:bg-primary-100 peer-checked:border-primary-500 peer-checked:text-primary-700 hover:bg-gray-50">
                              <div className="text-xs text-gray-500">{dayName}</div>
                              <div className="font-medium">{dayNum}</div>
                            </div>
                          </label>
                        )
                      })}
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-2">
                      Preferred time slots:
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {['9:00 AM', '10:00 AM', '11:00 AM', '2:00 PM', '3:00 PM', '4:00 PM'].map(time => (
                        <label key={time} className="relative">
                          <input
                            type="checkbox"
                            value={time}
                            className="sr-only peer"
                            onChange={(e) => {
                              const currentValue = watch('interviewAvailability') || ''
                              const selectedTimes = currentValue.includes('|') ? currentValue.split('|')[1]?.split(',') || [] : []
                              
                              if (e.target.checked) {
                                selectedTimes.push(time)
                              } else {
                                const index = selectedTimes.indexOf(time)
                                if (index > -1) selectedTimes.splice(index, 1)
                              }
                              
                              const dates = currentValue.includes('|') ? currentValue.split('|')[0] : currentValue
                              setValue('interviewAvailability', `${dates}|${selectedTimes.join(',')}`)
                            }}
                          />
                          <div className="w-full p-2 text-center border rounded-lg cursor-pointer peer-checked:bg-primary-100 peer-checked:border-primary-500 peer-checked:text-primary-700 hover:bg-gray-50">
                            {time}
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
                
                {errors.interviewAvailability && <p className="mt-1 text-sm text-red-600">{errors.interviewAvailability.message}</p>}
              </div>
            </div>

            {/* Job Summary */}
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Job Summary</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500 dark:text-gray-400">Salary Range:</span>
                  <p className="font-medium text-gray-900 dark:text-white">HK${job.salaryMin.toLocaleString()} - HK${job.salaryMax.toLocaleString()}</p>
                </div>
                <div>
                  <span className="text-gray-500 dark:text-gray-400">Placement Fee:</span>
                  <p className="font-medium text-green-600 dark:text-green-400">{job.placementFeePercent}%</p>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => router.push(`/recruiter/jobs/${id}`)}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="btn-primary disabled:opacity-50"
              >
                {isSubmitting ? 'Submitting...' : 'Submit Candidate'}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  )
}
