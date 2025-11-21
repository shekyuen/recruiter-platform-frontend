'use client'

import { useState, useEffect } from 'react'
import { useAuthStore } from '@/store/authStore'
import { useRouter } from 'next/navigation'
import api from '@/lib/axios'
import toast from 'react-hot-toast'
import ThemeToggle from '@/components/ThemeToggle'

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
  createdAt: string
  employer: {
    firstName: string
    lastName: string
    employerProfile: {
      companyName: string
    }
  }
  _count: {
    submissions: number
  }
}

export default function RecruiterDashboard() {
  const { user, logout } = useAuthStore()
  const router = useRouter()
  const [jobs, setJobs] = useState<JobOpening[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [takingJob, setTakingJob] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!user || user.userType !== 'RECRUITER') {
      router.push('/')
      return
    }
    fetchJobs()
  }, [user, router])

  const fetchJobs = async () => {
    try {
      const response = await api.get('/jobs')
      // Filter only published jobs
      const publishedJobs = response.data.jobs.filter((job: JobOpening) => job.status === 'PUBLISHED')
      setJobs(publishedJobs)
    } catch (error) {
      console.error('Failed to fetch jobs:', error)
      toast.error('Failed to load job orders')
    } finally {
      setIsLoading(false)
    }
  }

  const handleTakeJob = async (jobId: string) => {
    setTakingJob(jobId)
    try {
      const response = await api.post(`/jobs/${jobId}/take`, {})
      toast.success('Job taken successfully!')
      // Refresh jobs list
      fetchJobs()
    } catch (error: any) {
      console.error('Failed to take job:', error)
      toast.error(error.response?.data?.message || 'Failed to take job')
    } finally {
      setTakingJob(null)
    }
  }

  const handleViewDetails = (jobId: string) => {
    router.push(`/recruiter/jobs/${jobId}`)
  }

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'HIGH':
        return 'bg-red-100 text-red-800'
      case 'NORMAL':
        return 'bg-yellow-100 text-yellow-800'
      case 'LOW':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (!user || user.userType !== 'RECRUITER') {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Recruiter Dashboard</h1>
              <p className="text-gray-600 dark:text-gray-300">Welcome back, {user.firstName}!</p>
            </div>
            <div className="flex items-center space-x-4">
              <ThemeToggle />
              <button
                onClick={() => router.push('/recruiter/submissions')}
                className="btn-secondary"
              >
                My Submissions
              </button>
              <button
                onClick={logout}
                className="btn-secondary"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Available Job Orders</h2>
            <p className="text-gray-600 dark:text-gray-300">Browse and take on job orders to start submitting candidates</p>
          </div>
          
          {isLoading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
            </div>
          ) : jobs.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600 dark:text-gray-300 text-lg">No job orders available at the moment.</p>
              <p className="text-gray-600 dark:text-gray-300 text-sm mt-2">Check back later for new opportunities!</p>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {jobs.map((job) => (
                <div key={job.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{job.title}</h3>
                    <span className={`badge ${
                      job.urgency === 'HIGH' ? 'priority-high' :
                      job.urgency === 'NORMAL' ? 'priority-medium' :
                      'priority-low'
                    }`}>
                      {job.urgency}
                    </span>
                  </div>
                  
                  <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">{job.description}</p>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-300">Company:</span>
                      <span className="font-medium text-gray-900 dark:text-white">{job.employer.employerProfile.companyName}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-300">Salary Range:</span>
                      <span className="font-medium text-gray-900 dark:text-white">HK${job.salaryMin.toLocaleString()} - HK${job.salaryMax.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-300">Placement Fee:</span>
                      <span className="font-medium text-green-600 dark:text-green-400">{job.placementFeePercent}%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-300">Location:</span>
                      <span className="font-medium text-gray-900 dark:text-white">{job.remote ? 'Remote' : job.location}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-300">Submissions:</span>
                      <span className="font-medium text-blue-600 dark:text-blue-400">{job._count?.submissions || 0}</span>
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    <button 
                      onClick={() => handleTakeJob(job.id)}
                      disabled={takingJob === job.id}
                      className="btn-primary flex-1 text-sm disabled:opacity-50"
                    >
                      {takingJob === job.id ? 'Taking...' : 'Take Job'}
                    </button>
                    <button 
                      onClick={() => handleViewDetails(job.id)}
                      className="btn-secondary text-sm"
                    >
                      View Details
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
