'use client'

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

interface JobHeaderProps {
  job: JobOpening
}

export default function JobHeader({ job }: JobHeaderProps) {
  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'HIGH':
        return 'priority-high'
      case 'NORMAL':
        return 'priority-medium'
      case 'LOW':
        return 'priority-low'
      default:
        return 'status-closed'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'OPEN':
        return 'status-published'
      case 'CLOSED':
        return 'status-closed'
      case 'PAUSED':
        return 'status-draft'
      default:
        return 'status-closed'
    }
  }

  return (
    <div className="bg-white dark:bg-gray-800 shadow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <div className="flex items-center space-x-4 mb-4">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{job.title}</h1>
              <span className={`badge ${getStatusColor(job.status)}`}>
                {job.status}
              </span>
              <span className={`badge ${getUrgencyColor(job.urgency)}`}>
                {job.urgency} Priority
              </span>
            </div>
            
            <p className="text-gray-600 dark:text-gray-300 mb-4">{job.description}</p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Salary Range</h3>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                  HK${job.salaryMin.toLocaleString()} - HK${job.salaryMax.toLocaleString()}
                </p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Placement Fee</h3>
                <p className="text-lg font-semibold text-green-600 dark:text-green-400">
                  {job.placementFeePercent}%
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Est. fee: HK${Math.round((job.salaryMax * job.placementFeePercent) / 100).toLocaleString()}
                </p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Progress</h3>
                <div className="flex space-x-4 text-sm">
                  <span className="text-blue-600 dark:text-blue-400 font-medium">
                    {job._count?.submissions || 0} Submissions
                  </span>
                  <span className="text-green-600 dark:text-green-400 font-medium">
                    {job._count?.offers || 0} Offers
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Requirements */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Must Have Requirements</h3>
            <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-md">
              <p className="text-sm text-gray-700 dark:text-gray-300">
                {job.mustHaveRequirements || 'No specific requirements listed'}
              </p>
            </div>
          </div>
          
          <div>
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Good to Have Requirements</h3>
            <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-md">
              <p className="text-sm text-gray-700 dark:text-gray-300">
                {job.goodToHaveRequirements || 'No additional requirements listed'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
