'use client'

import { useEffect, useState } from 'react'
import { useAuthStore } from '@/store/authStore'
import { useRouter } from 'next/navigation'
import api from '@/lib/axios'
import toast from 'react-hot-toast'
import ThemeToggle from '@/components/ThemeToggle'
import { ArrowLeftIcon, UserIcon, BriefcaseIcon, BuildingOfficeIcon, CalendarDaysIcon, CheckCircleIcon, XCircleIcon, ClockIcon } from '@heroicons/react/24/outline'

interface Submission {
  id: string
  candidateName: string
  candidateEmail: string
  candidatePhone?: string
  status: string
  createdAt: string
  rejectionReasons?: string
  job: {
    id: string
    title: string
    employer: {
      firstName: string
      lastName: string
      employerProfile: {
        companyName: string
      }
    }
  }
}

export default function RecruiterSubmissionsPage() {
  const { user, logout } = useAuthStore()
  const router = useRouter()
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!user || user.userType !== 'RECRUITER') {
      router.push('/')
      return
    }
    fetchSubmissions()
  }, [user, router])

  const fetchSubmissions = async () => {
    try {
      const response = await api.get('/submissions/my-submissions')
      setSubmissions(response.data.submissions)
    } catch (error) {
      console.error('Failed to fetch submissions:', error)
      toast.error('Failed to load your submissions')
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'SUBMITTED': return 'bg-blue-100 text-blue-800';
      case 'REVIEWING': return 'bg-yellow-100 text-yellow-800';
      case 'INTERVIEWING': return 'bg-purple-100 text-purple-800';
      case 'OFFER': return 'bg-green-100 text-green-800';
      case 'REJECTED': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'SUBMITTED': return <ClockIcon className="h-4 w-4" />;
      case 'REVIEWING': return <ClockIcon className="h-4 w-4" />;
      case 'INTERVIEWING': return <CalendarDaysIcon className="h-4 w-4" />;
      case 'OFFER': return <CheckCircleIcon className="h-4 w-4" />;
      case 'REJECTED': return <XCircleIcon className="h-4 w-4" />;
      default: return <ClockIcon className="h-4 w-4" />;
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
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push('/recruiter/dashboard')}
                className="p-2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-400"
              >
                <ArrowLeftIcon className="h-6 w-6" />
              </button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">My Submissions</h1>
                <p className="text-gray-600 dark:text-gray-300">Track your candidate submissions and their progress</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <ThemeToggle />
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
          {isLoading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
            </div>
          ) : submissions.length === 0 ? (
            <div className="text-center py-12">
              <BriefcaseIcon className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" />
              <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No submissions yet</h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Start by browsing available job orders and submitting candidates.</p>
              <div className="mt-6">
                <button
                  onClick={() => router.push('/recruiter/dashboard')}
                  className="btn-primary"
                >
                  Browse Jobs
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Summary Stats */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
                  <div className="p-5">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <BriefcaseIcon className="h-6 w-6 text-gray-400 dark:text-gray-500" />
                      </div>
                      <div className="ml-5 w-0 flex-1">
                        <dl>
                          <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">Total Submissions</dt>
                          <dd className="text-lg font-medium text-gray-900 dark:text-white">{submissions.length}</dd>
                        </dl>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
                  <div className="p-5">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <CheckCircleIcon className="h-6 w-6 text-green-400 dark:text-green-500" />
                      </div>
                      <div className="ml-5 w-0 flex-1">
                        <dl>
                          <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">Offers</dt>
                          <dd className="text-lg font-medium text-gray-900 dark:text-white">
                            {submissions.filter(s => s.status === 'OFFER').length}
                          </dd>
                        </dl>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
                  <div className="p-5">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <CalendarDaysIcon className="h-6 w-6 text-purple-400 dark:text-purple-500" />
                      </div>
                      <div className="ml-5 w-0 flex-1">
                        <dl>
                          <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">Interviewing</dt>
                          <dd className="text-lg font-medium text-gray-900 dark:text-white">
                            {submissions.filter(s => s.status === 'INTERVIEWING').length}
                          </dd>
                        </dl>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
                  <div className="p-5">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <XCircleIcon className="h-6 w-6 text-red-400 dark:text-red-500" />
                      </div>
                      <div className="ml-5 w-0 flex-1">
                        <dl>
                          <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">Rejected</dt>
                          <dd className="text-lg font-medium text-gray-900 dark:text-white">
                            {submissions.filter(s => s.status === 'REJECTED').length}
                          </dd>
                        </dl>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Submissions List */}
              <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-md">
                <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                  {submissions.map((submission) => (
                    <li key={submission.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <div className="px-4 py-4 sm:px-6">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <div className="flex-shrink-0">
                              <UserIcon className="h-10 w-10 text-gray-400 dark:text-gray-500" />
                            </div>
                            <div className="ml-4">
                              <div className="flex items-center">
                                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                                  {submission.candidateName}
                                </h3>
                                <span className={`ml-3 badge ${
                                  submission.status === 'SUBMITTED' ? 'candidate-inbox' :
                                  submission.status === 'REVIEWING' ? 'candidate-reviewing' :
                                  submission.status === 'INTERVIEWING' ? 'candidate-interviewing' :
                                  submission.status === 'OFFER' ? 'candidate-offer' :
                                  'candidate-rejected'
                                }`}>
                                  {getStatusIcon(submission.status)}
                                  <span className="ml-1">{submission.status}</span>
                                </span>
                              </div>
                              <div className="mt-1 flex items-center text-sm text-gray-500 dark:text-gray-400">
                                <BriefcaseIcon className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400 dark:text-gray-500" />
                                <span>{submission.job.title}</span>
                                <span className="mx-2">•</span>
                                <BuildingOfficeIcon className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400 dark:text-gray-500" />
                                <span>{submission.job.employer.employerProfile.companyName}</span>
                              </div>
                              <div className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                                <span>Email: {submission.candidateEmail}</span>
                                {submission.candidatePhone && (
                                  <>
                                    <span className="mx-2">•</span>
                                    <span>Phone: {submission.candidatePhone}</span>
                                  </>
                                )}
                              </div>
                              <div className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                                <CalendarDaysIcon className="inline h-4 w-4 mr-1" />
                                Submitted: {new Date(submission.createdAt).toLocaleDateString()}
                              </div>
                              {submission.rejectionReasons && (
                                <div className="mt-2 p-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
                                  <p className="text-sm text-red-800 dark:text-red-300">
                                    <strong>Rejection reasons:</strong> {submission.rejectionReasons}
                                  </p>
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => router.push(`/recruiter/jobs/${submission.job.id}`)}
                              className="btn-secondary text-sm"
                            >
                              View Job
                            </button>
                          </div>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
