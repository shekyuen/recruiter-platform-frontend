'use client'

import { useEffect, useState } from 'react'
import { useAuthStore } from '@/store/authStore'
import { useRouter } from 'next/navigation'
import api from '@/lib/axios'
import toast from 'react-hot-toast'
import ThemeToggle from '@/components/ThemeToggle'
import { 
  UserGroupIcon, 
  VideoCameraIcon, 
  CurrencyDollarIcon, 
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  ChartBarIcon,
  Bars3Icon,
  XMarkIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  AdjustmentsHorizontalIcon
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
  createdAt: string
  employerId?: string
  employer?: {
    firstName: string
    lastName: string
  }
  _count: {
    submissions: number
    offers: number
  }
}

interface DashboardStats {
  totalSubmissions: number
  interviewsThisWeek: number
  offersPending: number
  hiredThisMonth: number
  performanceMetrics: {
    avgTimeToHire: number
    conversionRate: number
    topRecruiter: string
  }
}

export default function EmployerDashboard() {
  const { user, logout } = useAuthStore()
  const router = useRouter()
  const [jobs, setJobs] = useState<JobOpening[]>([])
  const [filteredJobs, setFilteredJobs] = useState<JobOpening[]>([])
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [mounted, setMounted] = useState(false)
  
  // Sidebar state
  const [sidebarOpen, setSidebarOpen] = useState(false)
  
  // Job filtering state
  const [jobSearchTerm, setJobSearchTerm] = useState('')
  const [jobStatusFilter, setJobStatusFilter] = useState('all')
  const [jobUrgencyFilter, setJobUrgencyFilter] = useState('all')
  const [jobSortBy, setJobSortBy] = useState('createdAt')
  const [showJobFilters, setShowJobFilters] = useState(false)
  
  // View mode for jobs
  const [jobViewMode, setJobViewMode] = useState<'cards' | 'chart' | 'list'>('chart')

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!user || user.userType !== 'EMPLOYER') {
      router.push('/')
      return
    }
    fetchJobs()
  }, [user, router])

  const fetchJobs = async () => {
    try {
      const response = await api.get('/jobs')
      setJobs(response.data.jobs)
      setFilteredJobs(response.data.jobs)
      // Generate mock dashboard stats for now
      generateMockDashboardStats(response.data.jobs)
    } catch (error) {
      console.error('Failed to fetch jobs:', error)
      toast.error('Failed to fetch jobs')
      setJobs([])
      setFilteredJobs([])
    } finally {
      setIsLoading(false)
    }
  }

  // Filter and sort jobs
  useEffect(() => {
    let filtered = [...jobs]

    // Search filter
    if (jobSearchTerm) {
      filtered = filtered.filter(job =>
        job.title.toLowerCase().includes(jobSearchTerm.toLowerCase()) ||
        job.description.toLowerCase().includes(jobSearchTerm.toLowerCase())
      )
    }

    // Status filter
    if (jobStatusFilter !== 'all') {
      filtered = filtered.filter(job => job.status === jobStatusFilter)
    }

    // Urgency filter
    if (jobUrgencyFilter !== 'all') {
      filtered = filtered.filter(job => job.urgency === jobUrgencyFilter)
    }

    // Sort
    filtered.sort((a, b) => {
      switch (jobSortBy) {
        case 'title':
          return a.title.localeCompare(b.title)
        case 'submissions':
          return b._count.submissions - a._count.submissions
        case 'offers':
          return b._count.offers - a._count.offers
        case 'createdAt':
        default:
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      }
    })

    setFilteredJobs(filtered)
  }, [jobs, jobSearchTerm, jobStatusFilter, jobUrgencyFilter, jobSortBy])

  const generateMockDashboardStats = (jobs: JobOpening[]) => {
    const totalSubmissions = jobs.reduce((sum, job) => sum + job._count.submissions, 0)
    const totalOffers = jobs.reduce((sum, job) => sum + job._count.offers, 0)
    
    // Calculate more realistic metrics based on job status and urgency
    const publishedJobs = jobs.filter(job => job.status === 'PUBLISHED')
    const urgentJobs = jobs.filter(job => job.urgency === 'URGENT' || job.urgency === 'HIGH')
    
    // More interviews for urgent jobs
    const urgentInterviews = urgentJobs.reduce((sum, job) => sum + Math.floor(job._count.submissions * 0.4), 0)
    const normalInterviews = (publishedJobs.length - urgentJobs.length) * 2 // Base interviews for normal jobs
    const interviewsThisWeek = urgentInterviews + normalInterviews
    
    // Higher conversion rate for urgent jobs
    const urgentOffers = urgentJobs.reduce((sum, job) => sum + Math.floor(job._count.submissions * 0.2), 0)
    const normalOffers = Math.floor(totalSubmissions * 0.05)
    const offersPending = Math.max(totalOffers, urgentOffers + normalOffers)
    
    // More hires for urgent positions
    const hiredThisMonth = Math.floor(offersPending * (urgentJobs.length > 0 ? 0.6 : 0.3))
    
    const mockStats: DashboardStats = {
      totalSubmissions,
      interviewsThisWeek,
      offersPending,
      hiredThisMonth,
      performanceMetrics: {
        avgTimeToHire: urgentJobs.length > 0 ? 8 : 15, // Faster for urgent jobs
        conversionRate: urgentJobs.length > 0 ? 25 : 12, // Higher conversion for urgent
        topRecruiter: urgentJobs.length > 0 ? 'Priority Recruiters' : 'TechRecruit Pro'
      }
    }
    
    setDashboardStats(mockStats)
  }

  // Generate chart data for stacked bar chart
  const generateChartData = (jobs: JobOpening[]) => {
    return jobs.map((job, index) => {
      const totalCandidates = job._count.submissions
      const offers = job._count.offers
      
      // Create varied pipeline distributions based on job characteristics
      let inbox, reviewing, interviewing, offer, rejected
      
      if (job.status === 'PUBLISHED') {
        // Published jobs have more active pipeline
        if (job.urgency === 'URGENT' || job.urgency === 'HIGH') {
          // High priority jobs move faster through pipeline
          inbox = Math.floor(totalCandidates * 0.2)
          reviewing = Math.floor(totalCandidates * 0.3)
          interviewing = Math.floor(totalCandidates * 0.3)
          offer = Math.max(offers, Math.floor(totalCandidates * 0.15))
          rejected = Math.floor(totalCandidates * 0.05)
        } else {
          // Normal priority jobs
          inbox = Math.floor(totalCandidates * 0.4)
          reviewing = Math.floor(totalCandidates * 0.3)
          interviewing = Math.floor(totalCandidates * 0.2)
          offer = Math.max(offers, Math.floor(totalCandidates * 0.08))
          rejected = Math.floor(totalCandidates * 0.02)
        }
      } else if (job.status === 'DRAFT') {
        // Draft jobs have minimal activity
        inbox = Math.floor(totalCandidates * 0.8)
        reviewing = Math.floor(totalCandidates * 0.15)
        interviewing = Math.floor(totalCandidates * 0.05)
        offer = 0
        rejected = 0
      } else {
        // Closed jobs have mostly rejected candidates
        inbox = Math.floor(totalCandidates * 0.1)
        reviewing = Math.floor(totalCandidates * 0.1)
        interviewing = Math.floor(totalCandidates * 0.1)
        offer = Math.max(offers, Math.floor(totalCandidates * 0.1))
        rejected = Math.floor(totalCandidates * 0.6)
      }
      
      // Add some randomness to make it more realistic
      const randomFactor = 0.1
      const randomAdjustment = () => Math.floor(Math.random() * totalCandidates * randomFactor)
      
      inbox = Math.max(0, inbox + randomAdjustment())
      reviewing = Math.max(0, reviewing + randomAdjustment())
      interviewing = Math.max(0, interviewing + randomAdjustment())
      offer = Math.max(0, offer + randomAdjustment())
      rejected = Math.max(0, rejected + randomAdjustment())
      
      // Ensure total doesn't exceed actual submissions
      const total = inbox + reviewing + interviewing + offer + rejected
      if (total > totalCandidates) {
        const scale = totalCandidates / total
        inbox = Math.floor(inbox * scale)
        reviewing = Math.floor(reviewing * scale)
        interviewing = Math.floor(interviewing * scale)
        offer = Math.floor(offer * scale)
        rejected = Math.floor(rejected * scale)
      }
      
      return {
        jobId: job.id,
        title: job.title,
        status: job.status,
        urgency: job.urgency,
        createdAt: job.createdAt,
        publishedAt: job.status === 'PUBLISHED' ? job.createdAt : null,
        totalCandidates,
        pipeline: {
          inbox,
          reviewing,
          interviewing,
          offer,
          rejected
        }
      }
    }).sort((a, b) => {
      // Sort by status first (PUBLISHED, DRAFT, CLOSED)
      const statusOrder: { [key: string]: number } = { 'PUBLISHED': 0, 'DRAFT': 1, 'CLOSED': 2 }
      const statusDiff = (statusOrder[a.status] || 3) - (statusOrder[b.status] || 3)
      if (statusDiff !== 0) return statusDiff
      
      // Then by published timestamp (if published)
      if (a.publishedAt && b.publishedAt) {
        return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
      }
      
      // Finally by creation timestamp
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    })
  }


  // Calculate recruiter's share after platform split (70:30)
  const calculateRecruiterShare = (employerFee: number) => {
    const recruiterShare = Math.round(employerFee * 0.7) // 70% to recruiter
    return recruiterShare
  }

  const handleLogout = () => {
    logout()
    router.push('/')
  }

  const handleJobStatusChange = async (jobId: string, newStatus: string) => {
    try {
      const response = await api.patch(`/jobs/${jobId}`, { status: newStatus })
      if (response.status === 200) {
        // Update the job in the local state
        setJobs(prevJobs => 
          prevJobs.map(job => 
            job.id === jobId ? { ...job, status: newStatus } : job
          )
        )
        toast.success(`Job ${newStatus.toLowerCase()} successfully`)
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || `Failed to ${newStatus.toLowerCase()} job`)
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

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Top Navigation */}
      <nav className="bg-white dark:bg-gray-800 shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="mr-4 p-2 rounded-md text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <Bars3Icon className="h-6 w-6" />
              </button>
              <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
                Employer Dashboard
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <ThemeToggle />
              <span className="text-sm text-gray-700 dark:text-gray-300">
                Welcome, {user?.firstName} {user?.lastName}
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

      <div className="flex">
        {/* Sidebar */}
        <div className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} fixed inset-y-0 left-0 z-50 w-80 bg-white dark:bg-gray-800 shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0`}>
          <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Dashboard</h2>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-2 rounded-md text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>
          
          <div className="p-4 space-y-6 overflow-y-auto h-full">
            {/* Quick Stats */}
            {dashboardStats && (
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wide">Quick Stats</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3">
                    <div className="flex items-center">
                      <UserGroupIcon className="h-5 w-5 text-blue-500 dark:text-blue-400" />
                      <div className="ml-2">
                        <p className="text-xs text-blue-600 dark:text-blue-300">Submissions</p>
                        <p className="text-lg font-bold text-blue-900 dark:text-blue-100">{dashboardStats.totalSubmissions}</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-3">
                    <div className="flex items-center">
                      <VideoCameraIcon className="h-5 w-5 text-purple-500 dark:text-purple-400" />
                      <div className="ml-2">
                        <p className="text-xs text-purple-600 dark:text-purple-300">Interviews</p>
                        <p className="text-lg font-bold text-purple-900 dark:text-purple-100">{dashboardStats.interviewsThisWeek}</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-3">
                    <div className="flex items-center">
                      <CurrencyDollarIcon className="h-5 w-5 text-yellow-500 dark:text-yellow-400" />
                      <div className="ml-2">
                        <p className="text-xs text-yellow-600 dark:text-yellow-300">Offers</p>
                        <p className="text-lg font-bold text-yellow-900 dark:text-yellow-100">{dashboardStats.offersPending}</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3">
                    <div className="flex items-center">
                      <CheckCircleIcon className="h-5 w-5 text-green-500 dark:text-green-400" />
                      <div className="ml-2">
                        <p className="text-xs text-green-600 dark:text-green-300">Hired</p>
                        <p className="text-lg font-bold text-green-900 dark:text-green-100">{dashboardStats.hiredThisMonth}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}


            {/* Performance Metrics */}
            {dashboardStats && (
              <div>
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wide mb-3">Performance</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-600 dark:text-gray-400">Avg. time to hire</span>
                    <span className="text-sm font-semibold text-gray-900 dark:text-white">{dashboardStats.performanceMetrics.avgTimeToHire}d</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-600 dark:text-gray-400">Conversion rate</span>
                    <span className="text-sm font-semibold text-gray-900 dark:text-white">{dashboardStats.performanceMetrics.conversionRate}%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-600 dark:text-gray-400">Top recruiter</span>
                    <span className="text-sm font-semibold text-gray-900 dark:text-white truncate">{dashboardStats.performanceMetrics.topRecruiter}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar Overlay */}
        {sidebarOpen && (
          <div 
            className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main Content */}
        <div className="flex-1 lg:ml-0">
          <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
            <div className="px-4 py-6 sm:px-0">
              {/* Job Openings Header with Search/Filter */}
              <div className="mb-6">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0 lg:space-x-4 mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Your Job Openings</h2>
                    <p className="text-gray-600 dark:text-gray-300">Manage and track your job postings</p>
                  </div>
                  <button 
                    onClick={() => router.push('/employer/jobs/create')}
                    className="btn-primary"
                  >
                    Create New Job
                  </button>
                </div>

                {/* Search and Filter Bar */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
                  <div className="flex flex-col lg:flex-row lg:items-center space-y-4 lg:space-y-0 lg:space-x-4">
                    {/* Search */}
                    <div className="flex-1">
                      <div className="relative">
                        <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 dark:text-gray-500" />
                        <input
                          type="text"
                          placeholder="Search jobs by title or description..."
                          value={jobSearchTerm}
                          onChange={(e) => setJobSearchTerm(e.target.value)}
                          className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        />
                      </div>
                    </div>

                    {/* Filter Toggle */}
                    <div className="flex items-center space-x-4">
                      <button
                        onClick={() => setShowJobFilters(!showJobFilters)}
                        className="flex items-center space-x-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
                      >
                        <FunnelIcon className="h-5 w-5" />
                        <span>Filters</span>
                      </button>
                    </div>
                  </div>

                  {/* Advanced Filters */}
                  {showJobFilters && (
                    <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Status Filter */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
                          <select
                            value={jobStatusFilter}
                            onChange={(e) => setJobStatusFilter(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                          >
                            <option value="all">All Status</option>
                            <option value="PUBLISHED">Published</option>
                            <option value="DRAFT">Draft</option>
                            <option value="CLOSED">Closed</option>
                          </select>
                        </div>

                        {/* Urgency Filter */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Urgency</label>
                          <select
                            value={jobUrgencyFilter}
                            onChange={(e) => setJobUrgencyFilter(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                          >
                            <option value="all">All Urgency</option>
                            <option value="URGENT">Urgent</option>
                            <option value="HIGH">High</option>
                            <option value="NORMAL">Normal</option>
                            <option value="LOW">Low</option>
                          </select>
                        </div>

                        {/* Sort By */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Sort By</label>
                          <select
                            value={jobSortBy}
                            onChange={(e) => setJobSortBy(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                          >
                            <option value="createdAt">Created Date</option>
                            <option value="title">Title</option>
                            <option value="submissions">Submissions</option>
                            <option value="offers">Offers</option>
                          </select>
                        </div>
                      </div>

                      {/* Clear Filters */}
                      <div className="mt-4 flex justify-end">
                        <button
                          onClick={() => {
                            setJobSearchTerm('')
                            setJobStatusFilter('all')
                            setJobUrgencyFilter('all')
                            setJobSortBy('createdAt')
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
                <div className="mt-4">
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Showing {filteredJobs.length} of {jobs.length} jobs
                  </p>
                </div>
              </div>

              {/* View Mode Toggle */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Job Openings</h2>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600 dark:text-gray-400 mr-3">View:</span>
                  <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                    <button
                      onClick={() => setJobViewMode('cards')}
                      className={`px-3 py-1 text-sm rounded-md transition-colors ${
                        jobViewMode === 'cards' 
                          ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm' 
                          : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                      }`}
                    >
                      Cards
                    </button>
                    <button
                      onClick={() => setJobViewMode('chart')}
                      className={`px-3 py-1 text-sm rounded-md transition-colors ${
                        jobViewMode === 'chart' 
                          ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm' 
                          : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                      }`}
                    >
                      Chart
                    </button>
                    <button
                      onClick={() => setJobViewMode('list')}
                      className={`px-3 py-1 text-sm rounded-md transition-colors ${
                        jobViewMode === 'list' 
                          ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm' 
                          : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                      }`}
                    >
                      List
                    </button>
                  </div>
                </div>
              </div>

              {/* Jobs List */}
              <div className="grid gap-6">
                {filteredJobs.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-gray-600 dark:text-gray-300 text-lg">No job openings found</p>
                    <p className="text-gray-500 dark:text-gray-400 text-sm mt-2">
                      {jobs.length === 0 
                        ? "Create your first job opening to get started"
                        : "Try adjusting your search or filters"
                      }
                    </p>
                    {jobs.length === 0 && (
                      <button
                        onClick={() => router.push('/employer/jobs/create')}
                        className="btn-primary mt-4"
                      >
                        Create Your First Job
                      </button>
                    )}
                  </div>
                ) : (
                  <>
                    {/* Cards View */}
                    {jobViewMode === 'cards' && (
                      filteredJobs.map((job) => (
                        <div key={job.id} className="card">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{job.title}</h3>
                              <p className="text-gray-600 dark:text-gray-300 mt-1 line-clamp-2">{job.description}</p>
                              
                              <div className="mt-4 flex items-center space-x-6 text-sm text-gray-600 dark:text-gray-300">
                                <span>Salary: HK${job.salaryMin.toLocaleString()} - HK${job.salaryMax.toLocaleString()}</span>
                                {user?.userType === 'EMPLOYER' ? (
                                  <span>Fee: {job.placementFeePercent}%</span>
                                ) : (
                                  <span>Recruiter Share: {calculateRecruiterShare(job.placementFeePercent)}%</span>
                                )}
                                <span className={`badge ${
                                  job.status === 'PUBLISHED' 
                                    ? 'status-published'
                                    : job.status === 'DRAFT'
                                    ? 'status-draft'
                                    : 'status-closed'
                                }`}>
                                  {job.status}
                                </span>
                                <span className={`badge ${
                                  job.urgency === 'URGENT' 
                                    ? 'status-urgent'
                                    : job.urgency === 'HIGH'
                                    ? 'status-high'
                                    : job.urgency === 'NORMAL'
                                    ? 'status-medium'
                                    : 'status-low'
                                }`}>
                                  {job.urgency}
                                </span>
                              </div>
                              
                              <div className="mt-3 flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-300">
                                <span>
                                  {job._count.submissions} submissions
                                </span>
                                <span>
                                  {job._count.offers} offers
                                </span>
                              </div>
                            </div>
                            <div className="flex space-x-2">
                              <button 
                                onClick={() => router.push(`/employer/jobs/${job.id}`)}
                                className="btn-secondary text-sm"
                              >
                                View Details
                              </button>
                              {job.status === 'PUBLISHED' && (
                                <button 
                                  onClick={() => handleJobStatusChange(job.id, 'DRAFT')}
                                  className="bg-yellow-600 hover:bg-yellow-700 text-white px-3 py-1 rounded text-sm"
                                >
                                  Pause
                                </button>
                              )}
                              {job.status === 'DRAFT' && (
                                <button 
                                  onClick={() => handleJobStatusChange(job.id, 'PUBLISHED')}
                                  className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm"
                                >
                                  Resume
                                </button>
                              )}
                              <button 
                                onClick={() => handleJobStatusChange(job.id, 'CLOSED')}
                                className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm"
                              >
                                Close
                              </button>
                            </div>
                          </div>
                        </div>
                      ))
                    )}

                    {/* Chart View */}
                    {jobViewMode === 'chart' && (
                      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 md:p-6">
                        <div className="mb-6">
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Job Progress Overview</h3>
                          <p className="text-sm text-gray-600 dark:text-gray-300">Visual representation of candidate pipeline across all jobs</p>
                        </div>
                        
                        <div className="space-y-4 overflow-x-auto">
                          {generateChartData(filteredJobs).map((jobData, index) => (
                            <div key={jobData.jobId} className="relative min-w-full">
                              {/* Job Info */}
                              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2 gap-2">
                                <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300 truncate min-w-0">
                                    {jobData.title}
                                  </span>
                                  <div className="flex items-center gap-2">
                                    <span className={`badge ${
                                      jobData.status === 'PUBLISHED' 
                                        ? 'status-published' 
                                        : jobData.status === 'DRAFT'
                                        ? 'status-draft'
                                        : 'status-closed'
                                    }`}>
                                      {jobData.status}
                                    </span>
                                    {jobData.urgency === 'HIGH' && (
                                      <span className="badge status-urgent">
                                        URGENT
                                      </span>
                                    )}
                                  </div>
                                </div>
                                <span className="text-sm text-gray-500 dark:text-gray-400">
                                  {jobData.totalCandidates} total
                                </span>
                              </div>
                              
                              {/* Stacked Bar with Central Axis */}
                              <div className="relative h-8 bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden">
                                {/* Calculate responsive scaling */}
                                {(() => {
                                  const allJobs = generateChartData(filteredJobs)
                                  
                                  // Calculate the maximum left and right extensions needed
                                  const maxLeftExtension = Math.max(...allJobs.map(job => job.pipeline.rejected))
                                  const maxRightExtension = Math.max(...allJobs.map(job => 
                                    job.pipeline.inbox + job.pipeline.reviewing + job.pipeline.interviewing + job.pipeline.offer
                                  ))
                                  const maxTotalExtension = maxLeftExtension + maxRightExtension
                                  
                                  // Scale factor to fit within 90% of container width (leaving 10% margin)
                                  const scale = 90 / maxTotalExtension
                                  
                                  // Calculate positions for this job
                                  const leftWidth = jobData.pipeline.rejected * scale
                                  const rightWidth = (jobData.pipeline.inbox + jobData.pipeline.reviewing + jobData.pipeline.interviewing + jobData.pipeline.offer) * scale
                                  
                                  // Central axis position (45% of container to account for scaling)
                                  const centralAxis = 45
                                  
                                  return (
                                    <>
                                      {/* Central Axis Line */}
                                      <div 
                                        className="absolute top-0 h-full w-0.5 bg-gray-400 dark:bg-gray-500"
                                        style={{ left: `${centralAxis}%` }}
                                      ></div>
                                      
                                      {/* Rejected candidates (left side from central axis) */}
                                      {jobData.pipeline.rejected > 0 && (
                                        <div 
                                          className="absolute top-0 h-full bg-red-500 flex items-center justify-center"
                                          style={{ 
                                            width: `${leftWidth}%`,
                                            right: `${centralAxis}%`
                                          }}
                                        >
                                          <span className="text-xs font-medium text-white">
                                            {jobData.pipeline.rejected}
                                          </span>
                                        </div>
                                      )}
                                      
                                      {/* Active pipeline (right side from central axis) */}
                                      {(() => {
                                        let currentPosition = 0
                                        const segments = [
                                          { count: jobData.pipeline.inbox, color: 'bg-blue-500', label: 'Inbox' },
                                          { count: jobData.pipeline.reviewing, color: 'bg-yellow-500', label: 'Reviewing' },
                                          { count: jobData.pipeline.interviewing, color: 'bg-purple-500', label: 'Interviewing' },
                                          { count: jobData.pipeline.offer, color: 'bg-green-500', label: 'Offer' }
                                        ].filter(segment => segment.count > 0)
                                        
                                        return segments.map((segment, index) => {
                                          const width = segment.count * scale
                                          const leftPosition = centralAxis + currentPosition
                                          currentPosition += width
                                          
                                          return (
                                            <div
                                              key={index}
                                              className={`absolute top-0 h-full ${segment.color} flex items-center justify-center`}
                                              style={{ 
                                                width: `${width}%`,
                                                left: `${leftPosition}%`
                                              }}
                                            >
                                              <span className="text-xs font-medium text-white">
                                                {segment.count}
                                              </span>
                                            </div>
                                          )
                                        })
                                      })()}
                                    </>
                                  )
                                })()}
                              </div>
                            </div>
                          ))}
                        </div>
                        
                        {/* Scale and Legend */}
                        <div className="mt-6 pt-4 border-t border-gray-200">
                          <div className="flex justify-between items-center mb-3">
                            <h4 className="text-sm font-medium text-gray-900">Legend</h4>
                            <div className="text-xs text-gray-500">
                              Central axis: Rejected (left) ← → Active pipeline (right)
                            </div>
                          </div>
                          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                            <div className="flex items-center space-x-2">
                              <div className="w-4 h-4 bg-red-500 rounded"></div>
                              <span className="text-sm text-gray-700">Rejected</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <div className="w-4 h-4 bg-blue-500 rounded"></div>
                              <span className="text-sm text-gray-700">Inbox</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <div className="w-4 h-4 bg-yellow-500 rounded"></div>
                              <span className="text-sm text-gray-700">Reviewing</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <div className="w-4 h-4 bg-purple-500 rounded"></div>
                              <span className="text-sm text-gray-700">Interviewing</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <div className="w-4 h-4 bg-green-500 rounded"></div>
                              <span className="text-sm text-gray-700">Offer</span>
                            </div>
                          </div>
                          <div className="mt-3 text-xs text-gray-500">
                            <p>• All jobs align to the same central axis</p>
                            <p>• Bar length represents actual candidate count</p>
                            <p>• Pipeline flows left to right: Inbox → Reviewing → Interviewing → Offer</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* List View */}
                    {jobViewMode === 'list' && (
                      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                        <div className="overflow-x-auto">
                          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                            <thead className="bg-gray-50 dark:bg-gray-900">
                              <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Job Title</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Submissions</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Offers</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                  {user?.userType === 'EMPLOYER' ? 'Fee' : 'Recruiter Share'}
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Created</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                              </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                              {filteredJobs.map((job) => (
                                <tr key={job.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm font-medium text-gray-900 dark:text-white">{job.title}</div>
                                    <div className="text-sm text-gray-500 dark:text-gray-400 truncate max-w-xs">{job.description}</div>
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`badge ${
                                      job.status === 'PUBLISHED' 
                                        ? 'status-published'
                                        : job.status === 'DRAFT'
                                        ? 'status-draft'
                                        : 'status-closed'
                                    }`}>
                                      {job.status}
                                    </span>
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                                    {job._count.submissions}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                                    {job._count.offers}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                    {user?.userType === 'EMPLOYER' ? (
                                      `Fee: ${job.placementFeePercent}%`
                                    ) : (
                                      `Recruiter: ${calculateRecruiterShare(job.placementFeePercent)}%`
                                    )}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                    {new Date(job.createdAt).toLocaleDateString()}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                    <div className="flex space-x-2">
                                      <button
                                        onClick={() => router.push(`/employer/jobs/${job.id}`)}
                                        className="text-primary-600 dark:text-primary-400 hover:text-primary-900 dark:hover:text-primary-300"
                                      >
                                        View Details
                                      </button>
                                      {job.status === 'PUBLISHED' && (
                                        <button 
                                          onClick={() => handleJobStatusChange(job.id, 'DRAFT')}
                                          className="text-yellow-600 hover:text-yellow-800"
                                        >
                                          Pause
                                        </button>
                                      )}
                                      {job.status === 'DRAFT' && (
                                        <button 
                                          onClick={() => handleJobStatusChange(job.id, 'PUBLISHED')}
                                          className="text-green-600 hover:text-green-800"
                                        >
                                          Resume
                                        </button>
                                      )}
                                      <button 
                                        onClick={() => handleJobStatusChange(job.id, 'CLOSED')}
                                        className="text-red-600 hover:text-red-800"
                                      >
                                        Close
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
