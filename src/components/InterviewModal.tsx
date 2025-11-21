'use client'

import { useState } from 'react'
import { XMarkIcon, VideoCameraIcon, UserGroupIcon, CalendarIcon } from '@heroicons/react/24/outline'

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

interface InterviewModalProps {
  submission: CandidateSubmission
  jobId: string
  onClose: () => void
  onSubmissionUpdate: (submissions: CandidateSubmission[]) => void
}

export default function InterviewModal({ submission, jobId, onClose, onSubmissionUpdate }: InterviewModalProps) {
  const [interviewType, setInterviewType] = useState<'video' | 'in-person'>('video')
  const [interviewDate, setInterviewDate] = useState('')
  const [interviewTime, setInterviewTime] = useState('')
  const [interviewNotes, setInterviewNotes] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleScheduleInterview = async () => {
    if (!interviewDate || !interviewTime) {
      alert('Please select both date and time for the interview')
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch('/api/interviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          submissionId: submission.id,
          jobId,
          type: interviewType,
          scheduledDate: `${interviewDate}T${interviewTime}`,
          notes: interviewNotes,
          candidateAvailability: submission.interviewAvailability
        })
      })

      if (response.ok) {
        // Update submission status to INTERVIEWING
        const statusResponse = await fetch(`/api/submissions/${submission.id}/status`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ status: 'INTERVIEWING' })
        })

        if (statusResponse.ok) {
          onSubmissionUpdate([{ ...submission, status: 'INTERVIEWING' }])
          onClose()
        }
      }
    } catch (error) {
      console.error('Failed to schedule interview:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const getIntegrationInfo = () => {
    if (interviewType === 'video') {
      return {
        icon: <VideoCameraIcon className="h-6 w-6 text-blue-600" />,
        title: 'Zoom Integration',
        description: 'Video interview will be conducted via Zoom',
        note: 'Zoom meeting link will be generated automatically'
      }
    } else {
      return {
        icon: <UserGroupIcon className="h-6 w-6 text-green-600" />,
        title: 'Calendly Integration',
        description: 'In-person interview will be scheduled via Calendly',
        note: 'Calendly booking link will be provided'
      }
    }
  }

  const integration = getIntegrationInfo()

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 rounded-t-xl">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Schedule Interview</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Set up an interview with the candidate</p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-400 transition-colors p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>
        </div>

        <div className="p-6">
          {/* Candidate Info */}
          <div className="mb-8 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-6 border border-blue-100 dark:border-blue-800">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                <span className="text-blue-600 dark:text-blue-400 font-semibold text-lg">
                  {submission.candidateName.charAt(0)}
                </span>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  {submission.candidateName}
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Submitted by {submission.recruiter.firstName} {submission.recruiter.lastName}
                </p>
              </div>
            </div>
          </div>

          {/* Interview Type Selection */}
          <div className="mb-8">
            <label className="block text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Choose Interview Format
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                onClick={() => setInterviewType('video')}
                className={`p-6 border-2 rounded-xl text-left transition-all duration-200 hover:shadow-md ${
                  interviewType === 'video'
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 shadow-md'
                    : 'border-gray-200 dark:border-gray-600 hover:border-blue-300 dark:hover:border-blue-400 hover:bg-blue-25 dark:hover:bg-blue-900/10'
                }`}
              >
                <div className="flex items-start space-x-4">
                  <div className={`p-3 rounded-lg ${interviewType === 'video' ? 'bg-blue-100 dark:bg-blue-900/30' : 'bg-gray-100 dark:bg-gray-700'}`}>
                    <VideoCameraIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-gray-900 dark:text-white mb-1">Video Interview</div>
                    <div className="text-sm text-gray-600 dark:text-gray-300 mb-2">Conduct interview via video call</div>
                    <div className="text-xs text-blue-600 dark:text-blue-400 font-medium">✓ Zoom Integration Available</div>
                  </div>
                  {interviewType === 'video' && (
                    <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                    </div>
                  )}
                </div>
              </button>

              <button
                onClick={() => setInterviewType('in-person')}
                className={`p-6 border-2 rounded-xl text-left transition-all duration-200 hover:shadow-md ${
                  interviewType === 'in-person'
                    ? 'border-green-500 bg-green-50 dark:bg-green-900/20 shadow-md'
                    : 'border-gray-200 dark:border-gray-600 hover:border-green-300 dark:hover:border-green-400 hover:bg-green-25 dark:hover:bg-green-900/10'
                }`}
              >
                <div className="flex items-start space-x-4">
                  <div className={`p-3 rounded-lg ${interviewType === 'in-person' ? 'bg-green-100 dark:bg-green-900/30' : 'bg-gray-100 dark:bg-gray-700'}`}>
                    <UserGroupIcon className="h-6 w-6 text-green-600 dark:text-green-400" />
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-gray-900 dark:text-white mb-1">In-Person Interview</div>
                    <div className="text-sm text-gray-600 dark:text-gray-300 mb-2">Meet at office location</div>
                    <div className="text-xs text-green-600 dark:text-green-400 font-medium">✓ Calendly Integration Available</div>
                  </div>
                  {interviewType === 'in-person' && (
                    <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                    </div>
                  )}
                </div>
              </button>
            </div>
          </div>

          {/* Integration Info */}
          <div className="mb-8 p-6 bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl border border-gray-200">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-white rounded-lg shadow-sm">
                {integration.icon}
              </div>
              <div className="flex-1">
                <div className="font-semibold text-gray-900 mb-1">{integration.title}</div>
                <div className="text-sm text-gray-600 mb-2">{integration.description}</div>
                <div className="text-xs text-blue-600 font-medium bg-blue-100 px-2 py-1 rounded-full inline-block">
                  {integration.note}
                </div>
              </div>
            </div>
          </div>

          {/* Interview Scheduling */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Schedule Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Interview Date
                </label>
                <div className="relative">
                  <input
                    type="date"
                    value={interviewDate}
                    onChange={(e) => setInterviewDate(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    min={new Date().toISOString().split('T')[0]}
                    required
                  />
                  <CalendarIcon className="absolute right-3 top-3 h-5 w-5 text-gray-400 pointer-events-none" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Interview Time
                </label>
                <input
                  type="time"
                  value={interviewTime}
                  onChange={(e) => setInterviewTime(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  required
                />
              </div>
            </div>
          </div>

          {/* Candidate Availability */}
          {submission.interviewAvailability && (
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Candidate Availability</h3>
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-xl border border-green-200">
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <CalendarIcon className="h-4 w-4 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-700 leading-relaxed">{submission.interviewAvailability}</p>
                    <p className="text-xs text-green-600 font-medium mt-2">✓ Based on candidate's submitted preferences</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Interview Notes */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Additional Notes</h3>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Interview Notes (Optional)
              </label>
              <textarea
                value={interviewNotes}
                onChange={(e) => setInterviewNotes(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none"
                rows={4}
                placeholder="Add any specific notes, requirements, or special instructions for this interview..."
              />
              <p className="text-xs text-gray-500">These notes will be shared with the candidate and recruiter</p>
            </div>
          </div>

          {/* Actions */}
          <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4 -mx-6 -mb-6 rounded-b-xl">
            <div className="flex justify-end space-x-4">
              <button
                onClick={onClose}
                className="px-6 py-3 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleScheduleInterview}
                disabled={isLoading || !interviewDate || !interviewTime}
                className="px-8 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors flex items-center space-x-2"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Scheduling...</span>
                  </>
                ) : (
                  <>
                    <CalendarIcon className="h-4 w-4" />
                    <span>Schedule Interview</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
