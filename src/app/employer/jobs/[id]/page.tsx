'use client'

import { useState, useEffect } from 'react'
import { useAuthStore } from '@/store/authStore'
import { useRouter } from 'next/navigation'
import { useParams } from 'next/navigation'
import api from '@/lib/axios'
import toast from 'react-hot-toast'
import KanbanBoard from '@/components/KanbanBoard'
import JobHeader from '@/components/JobHeader'
import ThemeToggle from '@/components/ThemeToggle'
import { 
  MagnifyingGlassIcon, 
  FunnelIcon, 
  AdjustmentsHorizontalIcon,
  ListBulletIcon,
  Squares2X2Icon,
  ChartBarIcon
} from '@heroicons/react/24/outline'

interface JobOpening {
  id: string
  title: string
  description: string
  status: string
  urgency: string
  salaryMin: number
  salaryMax: number
  placementFeePercent: number
  mustHaveRequirements: string
  goodToHaveRequirements: string
  createdAt: string
  _count: {
    submissions: number
    offers: number
  }
}

interface CandidateSubmission {
  id: string
  candidateName: string
  candidateEmail: string
  candidatePhone: string
  resumeUrl: string
  screeningResponses: string
  fitNotes: string
  status: string
  submittedAt: string
  recruiter: {
    id: string
    firstName: string
    lastName: string
    email: string
  }
  interviewAvailability: string
}

export default function JobDetailsPage() {
  const { user, logout } = useAuthStore()
  const router = useRouter()
  const params = useParams()
  const jobId = params.id as string

  const [job, setJob] = useState<JobOpening | null>(null)
  const [submissions, setSubmissions] = useState<CandidateSubmission[]>([])
  const [filteredSubmissions, setFilteredSubmissions] = useState<CandidateSubmission[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [mounted, setMounted] = useState(false)
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedRecruiter, setSelectedRecruiter] = useState('all')
  const [selectedExperience, setSelectedExperience] = useState('all')
  const [selectedLocation, setSelectedLocation] = useState('all')
  const [selectedRating, setSelectedRating] = useState('all')
  const [sortBy, setSortBy] = useState('submissionDate')
  const [viewMode, setViewMode] = useState<'kanban' | 'list' | 'analytics'>('kanban')
  const [showFilters, setShowFilters] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!user || user.userType !== 'EMPLOYER') {
      router.push('/')
      return
    }
    fetchJobDetails()
  }, [user, router, jobId])

  const fetchJobDetails = async () => {
    try {
      const [jobResponse, submissionsResponse] = await Promise.all([
        api.get(`/jobs/${jobId}`),
        api.get(`/submissions/job/${jobId}`)
      ])
      
      setJob(jobResponse.data.job)
      setSubmissions(submissionsResponse.data.submissions)
      setFilteredSubmissions(submissionsResponse.data.submissions)
    } catch (error) {
      console.error('Failed to fetch job details:', error)
      toast.error('Failed to load job details')
    } finally {
      setIsLoading(false)
    }
  }

  // Filter and sort submissions
  useEffect(() => {
    let filtered = [...submissions]

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(submission =>
        submission.candidateName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        submission.candidateEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
        submission.recruiter.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        submission.recruiter.lastName.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Recruiter filter
    if (selectedRecruiter !== 'all') {
      filtered = filtered.filter(submission => 
        `${submission.recruiter.firstName} ${submission.recruiter.lastName}` === selectedRecruiter
      )
    }

    // Experience filter (mock implementation)
    if (selectedExperience !== 'all') {
      // This would need to be implemented based on actual data
      filtered = filtered.filter(submission => {
        // Mock logic - in real implementation, this would check actual experience data
        return true
      })
    }

    // Location filter (mock implementation)
    if (selectedLocation !== 'all') {
      // This would need to be implemented based on actual data
      filtered = filtered.filter(submission => {
        // Mock logic - in real implementation, this would check actual location data
        return true
      })
    }

    // Rating filter (mock implementation)
    if (selectedRating !== 'all') {
      // This would need to be implemented based on actual data
      filtered = filtered.filter(submission => {
        // Mock logic - in real implementation, this would check actual rating data
        return true
      })
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.candidateName.localeCompare(b.candidateName)
        case 'recruiter':
          return `${a.recruiter.firstName} ${a.recruiter.lastName}`.localeCompare(`${b.recruiter.firstName} ${b.recruiter.lastName}`)
        case 'submissionDate':
        default:
          return new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()
      }
    })

    setFilteredSubmissions(filtered)
  }, [submissions, searchTerm, selectedRecruiter, selectedExperience, selectedLocation, selectedRating, sortBy])

  // Get unique recruiters for filter dropdown
  const uniqueRecruiters = Array.from(
    new Set(submissions.map(s => `${s.recruiter.firstName} ${s.recruiter.lastName}`))
  )

  const handleLogout = () => {
    logout()
    router.push('/')
  }

  if (!user || user.userType !== 'EMPLOYER') {
    return null
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
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Job Not Found</h2>
          <button
            onClick={() => router.push('/employer/dashboard')}
            className="btn-primary"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
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
                Job Details
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <ThemeToggle />
              <span className="text-sm text-gray-700 dark:text-gray-300">
                Welcome, {user.firstName} {user.lastName}
              </span>
              <button
                onClick={handleLogout}
                className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Job Header */}
      <JobHeader job={job} />

      {/* Filter and Search Section */}
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Search and Filter Bar */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0 lg:space-x-4">
              {/* Search */}
              <div className="flex-1">
                <div className="relative">
                  <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 dark:text-gray-500" />
                  <input
                    type="text"
                    placeholder="Search by name, email, or recruiter..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                  />
                </div>
              </div>

              {/* Filter Toggle */}
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center space-x-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
                >
                  <FunnelIcon className="h-5 w-5" />
                  <span>Filters</span>
                </button>

                {/* View Mode Toggle */}
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setViewMode('kanban')}
                    className={`p-2 rounded-lg ${viewMode === 'kanban' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                    title="Kanban View"
                  >
                    <Squares2X2Icon className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded-lg ${viewMode === 'list' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                    title="List View"
                  >
                    <ListBulletIcon className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => setViewMode('analytics')}
                    className={`p-2 rounded-lg ${viewMode === 'analytics' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                    title="Analytics View"
                  >
                    <ChartBarIcon className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Advanced Filters */}
            {showFilters && (
              <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-600">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                  {/* Recruiter Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Recruiter</label>
                    <select
                      value={selectedRecruiter}
                      onChange={(e) => setSelectedRecruiter(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      <option value="all">All Recruiters</option>
                      {uniqueRecruiters.map(recruiter => (
                        <option key={recruiter} value={recruiter}>{recruiter}</option>
                      ))}
                    </select>
                  </div>

                  {/* Experience Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Experience</label>
                    <select
                      value={selectedExperience}
                      onChange={(e) => setSelectedExperience(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      <option value="all">All Levels</option>
                      <option value="junior">Junior</option>
                      <option value="mid">Mid-Level</option>
                      <option value="senior">Senior</option>
                    </select>
                  </div>

                  {/* Location Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Location</label>
                    <select
                      value={selectedLocation}
                      onChange={(e) => setSelectedLocation(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      <option value="all">All Locations</option>
                      <option value="remote">Remote</option>
                      <option value="hong-kong">Hong Kong</option>
                      <option value="singapore">Singapore</option>
                    </select>
                  </div>

                  {/* Rating Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Rating</label>
                    <select
                      value={selectedRating}
                      onChange={(e) => setSelectedRating(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      <option value="all">All Ratings</option>
                      <option value="5">5 Stars</option>
                      <option value="4">4+ Stars</option>
                      <option value="3">3+ Stars</option>
                    </select>
                  </div>

                  {/* Sort By */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Sort By</label>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      <option value="submissionDate">Submission Date</option>
                      <option value="name">Name</option>
                      <option value="recruiter">Recruiter</option>
                    </select>
                  </div>
                </div>

                {/* Clear Filters */}
                <div className="mt-4 flex justify-end">
                  <button
                    onClick={() => {
                      setSearchTerm('')
                      setSelectedRecruiter('all')
                      setSelectedExperience('all')
                      setSelectedLocation('all')
                      setSelectedRating('all')
                      setSortBy('submissionDate')
                    }}
                    className="px-4 py-2 text-sm text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100"
                  >
                    Clear All Filters
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Results Summary */}
          <div className="mb-4">
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Showing {filteredSubmissions.length} of {submissions.length} candidates
            </p>
          </div>

          {/* Content based on view mode */}
          {viewMode === 'kanban' && (
            <KanbanBoard 
              jobId={jobId}
              submissions={filteredSubmissions}
              onSubmissionUpdate={setSubmissions}
            />
          )}
          
          {viewMode === 'list' && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">List View</h3>
                <div className="space-y-4">
                  {filteredSubmissions.map((submission) => (
                    <div key={submission.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-white dark:bg-gray-800">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium text-gray-900 dark:text-white">{submission.candidateName}</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-300">{submission.candidateEmail}</p>
                          <p className="text-xs text-gray-600 dark:text-gray-300">
                            Submitted by {submission.recruiter.firstName} {submission.recruiter.lastName}
                          </p>
                        </div>
                        <div className="text-right">
                          <span className={`badge ${
                            submission.status === 'SUBMITTED' ? 'candidate-inbox' :
                            submission.status === 'REVIEWING' ? 'candidate-reviewing' :
                            submission.status === 'INTERVIEWING' ? 'candidate-interviewing' :
                            submission.status === 'OFFER' ? 'candidate-offer' :
                            'candidate-rejected'
                          }`}>
                            {submission.status}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {viewMode === 'analytics' && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Analytics View</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {filteredSubmissions.filter(s => s.status === 'SUBMITTED').length}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">New Submissions</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                    {filteredSubmissions.filter(s => s.status === 'INTERVIEWING').length}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">In Interview</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {filteredSubmissions.filter(s => s.status === 'OFFER').length}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Offers Made</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
