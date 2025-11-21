'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'
import api from '@/lib/axios'
import toast from 'react-hot-toast'
import ThemeToggle from '@/components/ThemeToggle'
import { ArrowLeftIcon, UserIcon, CurrencyDollarIcon, MapPinIcon, ClockIcon, BriefcaseIcon } from '@heroicons/react/24/outline'

interface JobOpening {
  id: string
  title: string
  description: string
  status: string
  urgency: string
  salaryMin: number
  salaryMax: number
  placementFeePercent: number
  location: string
  remote: boolean
  mustHaveRequirements: string
  goodToHaveRequirements: string
  createdAt: string
  employer: {
    firstName: string
    lastName: string
    employerProfile: {
      companyName: string
      companySize: string
      industry: string
    }
  }
  _count: {
    submissions: number
  }
}

export default function RecruiterJobDetailsPage() {
  const { id } = useParams()
  const router = useRouter()
  const { user } = useAuthStore()
  const [job, setJob] = useState<JobOpening | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [mounted, setMounted] = useState(false)

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

  const handleSubmitCandidate = () => {
    router.push(`/recruiter/jobs/${id}/submit`)
  }

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'HIGH': return 'bg-red-100 text-red-800';
      case 'NORMAL': return 'bg-yellow-100 text-yellow-800';
      case 'LOW': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
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
                onClick={() => router.push('/recruiter/dashboard')}
                className="p-2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-400"
              >
                <ArrowLeftIcon className="h-6 w-6" />
              </button>
              <div>
                <h1 className="text-3xl font-bold leading-tight text-gray-900 dark:text-white">{job.title}</h1>
                <p className="text-sm text-gray-600 dark:text-gray-300">{job.employer.employerProfile.companyName}</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <ThemeToggle />
              <span className={`badge ${
                job.urgency === 'HIGH' ? 'priority-high' :
                job.urgency === 'NORMAL' ? 'priority-medium' :
                'priority-low'
              }`}>
                <ClockIcon className="h-3 w-3 mr-1" />
                {job.urgency} Urgency
              </span>
              <button
                onClick={handleSubmitCandidate}
                disabled={isSubmitting}
                className="btn-primary disabled:opacity-50"
              >
                {isSubmitting ? 'Submitting...' : 'Submit Candidate'}
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Job Description */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Job Description</h2>
              <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{job.description}</p>
            </div>

            {/* Requirements */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Requirements</h2>
              
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Must Have</h3>
                  <ul className="list-disc list-inside space-y-1 text-gray-700 dark:text-gray-300">
                    {job.mustHaveRequirements.split(',').map((req, index) => (
                      <li key={index}>{req.trim()}</li>
                    ))}
                  </ul>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Good to Have</h3>
                  <ul className="list-disc list-inside space-y-1 text-gray-700 dark:text-gray-300">
                    {job.goodToHaveRequirements.split(',').map((req, index) => (
                      <li key={index}>{req.trim()}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Job Details */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Job Details</h2>
              
              <div className="space-y-4">
                <div className="flex items-center">
                  <CurrencyDollarIcon className="h-5 w-5 text-gray-400 dark:text-gray-500 mr-3" />
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-300">Salary Range</p>
                    <p className="font-medium">HK${job.salaryMin.toLocaleString()} - HK${job.salaryMax.toLocaleString()}</p>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <MapPinIcon className="h-5 w-5 text-gray-400 dark:text-gray-500 mr-3" />
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-300">Location</p>
                    <p className="font-medium text-gray-900 dark:text-white">{job.remote ? 'Remote' : job.location}</p>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <BriefcaseIcon className="h-5 w-5 text-gray-400 dark:text-gray-500 mr-3" />
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-300">Placement Fee</p>
                    <p className="font-medium text-green-600 dark:text-green-400">{job.placementFeePercent}%</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Company Info */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Company</h2>
              
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-300">Company Name</p>
                  <p className="font-medium text-gray-900 dark:text-white">{job.employer.employerProfile.companyName}</p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-300">Company Size</p>
                  <p className="font-medium text-gray-900 dark:text-white">{job.employer.employerProfile.companySize}</p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-300">Industry</p>
                  <p className="font-medium text-gray-900 dark:text-white">{job.employer.employerProfile.industry}</p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-300">Contact</p>
                  <p className="font-medium text-gray-900 dark:text-white">{job.employer.firstName} {job.employer.lastName}</p>
                </div>
              </div>
            </div>

            {/* Progress */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Progress</h2>
              
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-300">Total Submissions</span>
                  <span className="font-medium text-blue-600 dark:text-blue-400">{job._count.submissions}</span>
                </div>
                
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${Math.min((job._count.submissions / 10) * 100, 100)}%` }}
                  ></div>
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-300">Progress towards target</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
