'use client'

import { useState } from 'react'
import { XMarkIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline'

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

interface RejectionModalProps {
  submission: CandidateSubmission
  jobId: string
  onClose: () => void
  onSubmissionUpdate: (submissions: CandidateSubmission[]) => void
}

const COMMON_REJECTION_REASONS = [
  'Insufficient experience for the role',
  'Skills mismatch with job requirements',
  'Salary expectations too high',
  'Availability conflicts with job requirements',
  'Cultural fit concerns',
  'Communication skills not suitable',
  'Technical skills below requirements',
  'Location/remote work preferences mismatch',
  'Overqualified for the position',
  'Background check concerns'
]

export default function RejectionModal({ submission, jobId, onClose, onSubmissionUpdate }: RejectionModalProps) {
  const [selectedReasons, setSelectedReasons] = useState<string[]>([])
  const [customReason, setCustomReason] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleRejection = async () => {
    if (selectedReasons.length === 0 && !customReason.trim()) {
      alert('Please select at least one rejection reason or provide a custom reason')
      return
    }

    setIsLoading(true)
    try {
      const rejectionReasons = [
        ...selectedReasons,
        ...(customReason.trim() ? [customReason.trim()] : [])
      ]

      const response = await fetch(`/api/submissions/${submission.id}/reject`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          reasons: rejectionReasons,
          jobId
        })
      })

      if (response.ok) {
        // Update submission status to REJECTED
        const statusResponse = await fetch(`/api/submissions/${submission.id}/status`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ status: 'REJECTED' })
        })

        if (statusResponse.ok) {
          onSubmissionUpdate([{ ...submission, status: 'REJECTED' }])
          onClose()
        }
      }
    } catch (error) {
      console.error('Failed to reject candidate:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const toggleReason = (reason: string) => {
    setSelectedReasons(prev => 
      prev.includes(reason) 
        ? prev.filter(r => r !== reason)
        : [...prev, reason]
    )
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full mx-4">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Reject Candidate</h2>
          <button
            onClick={onClose}
            className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-400"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6">
          {/* Warning */}
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <div className="flex items-center">
              <ExclamationTriangleIcon className="h-5 w-5 text-red-600 dark:text-red-400 mr-2" />
              <div>
                <h3 className="font-medium text-red-900 dark:text-red-200">Rejecting Candidate</h3>
                <p className="text-sm text-red-700 dark:text-red-300 mt-1">
                  You are about to reject <strong>{submission.candidateName}</strong>. 
                  This action will move the candidate to the "Rejected" column and notify the recruiter.
                </p>
              </div>
            </div>
          </div>

          {/* Candidate Info */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Candidate: {submission.candidateName}
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Recruiter: {submission.recruiter.firstName} {submission.recruiter.lastName}
            </p>
          </div>

          {/* Rejection Reasons */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Select rejection reasons (required)
            </label>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {COMMON_REJECTION_REASONS.map((reason) => (
                <label key={reason} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={selectedReasons.includes(reason)}
                    onChange={() => toggleReason(reason)}
                    className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                  />
                  <span className="ml-3 text-sm text-gray-700">{reason}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Custom Reason */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Additional/Custom Reason (Optional)
            </label>
            <textarea
              value={customReason}
              onChange={(e) => setCustomReason(e.target.value)}
              className="input-field"
              rows={3}
              placeholder="Provide any additional or custom rejection reason..."
            />
          </div>

          {/* Selected Reasons Summary */}
          {(selectedReasons.length > 0 || customReason.trim()) && (
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2">Selected Reasons:</h4>
              <ul className="text-sm text-gray-700 space-y-1">
                {selectedReasons.map((reason, index) => (
                  <li key={index} className="flex items-start">
                    <span className="text-red-600 mr-2">•</span>
                    <span>{reason}</span>
                  </li>
                ))}
                {customReason.trim() && (
                  <li className="flex items-start">
                    <span className="text-red-600 mr-2">•</span>
                    <span>{customReason.trim()}</span>
                  </li>
                )}
              </ul>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
            <button
              onClick={onClose}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button
              onClick={handleRejection}
              disabled={isLoading || (selectedReasons.length === 0 && !customReason.trim())}
              className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50"
            >
              {isLoading ? 'Rejecting...' : 'Reject Candidate'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
