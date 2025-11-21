'use client'

import { useState } from 'react'
import { EyeIcon, PhoneIcon, EnvelopeIcon, DocumentIcon, CalendarIcon } from '@heroicons/react/24/outline'
import CandidateSlidePanel from './CandidateSlidePanel'
import InterviewModal from './InterviewModal'
import OfferModal from './OfferModal'
import RejectionModal from './RejectionModal'
import { useAuthStore } from '../store/authStore'

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

interface CandidateCardProps {
  submission: CandidateSubmission
  jobId: string
  columnId: string
  onSubmissionUpdate: (submissions: CandidateSubmission[]) => void
}

export default function CandidateCard({ submission, jobId, columnId, onSubmissionUpdate }: CandidateCardProps) {
  const [showSlidePanel, setShowSlidePanel] = useState(false)
  const [showInterviewModal, setShowInterviewModal] = useState(false)
  const [showOfferModal, setShowOfferModal] = useState(false)
  const [showRejectionModal, setShowRejectionModal] = useState(false)
  const { user } = useAuthStore()

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getStatusClass = (status: string) => {
    switch (status) {
      case 'SUBMITTED':
        return 'candidate-inbox'
      case 'REVIEWING':
        return 'candidate-reviewing'
      case 'INTERVIEWING':
        return 'candidate-interviewing'
      case 'OFFER':
        return 'candidate-offer'
      case 'REJECTED':
        return 'candidate-rejected'
      default:
        return 'status-closed'
    }
  }

  const handleStatusUpdate = async (newStatus: string) => {
    try {
      const response = await fetch(`/api/submissions/${submission.id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ status: newStatus })
      })
      if (response.ok) {
        // Refresh the submissions
        window.location.reload()
      }
    } catch (error) {
      console.error(`Error updating status to ${newStatus}:`, error)
    }
  }

  const getActionButtons = () => {
    // Always show View Details button for all columns
    const viewDetailsButton = (
      <button
        onClick={() => setShowSlidePanel(true)}
        className="w-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 text-sm py-2 px-3 rounded-md transition-colors mb-2"
      >
        View Details
      </button>
    )

    switch (columnId) {
      case 'inbox':
        return (
          <div className="space-y-2">
            {viewDetailsButton}
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => handleStatusUpdate('REVIEWING')}
                className="w-full bg-green-600 hover:bg-green-700 text-white text-sm py-2 px-3 rounded-md transition-colors font-medium"
              >
                Keep
              </button>
              <button
                onClick={() => setShowRejectionModal(true)}
                className="w-full bg-red-600 hover:bg-red-700 text-white text-sm py-2 px-3 rounded-md transition-colors font-medium"
              >
                Reject
              </button>
            </div>
          </div>
        )
      case 'reviewing':
        return (
          <div className="space-y-2">
            {viewDetailsButton}
            <button
              onClick={() => setShowInterviewModal(true)}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm py-2 px-3 rounded-md transition-colors font-medium"
            >
              Schedule Interview
            </button>
            <button
              onClick={() => setShowRejectionModal(true)}
              className="w-full bg-red-600 hover:bg-red-700 text-white text-sm py-2 px-3 rounded-md transition-colors font-medium"
            >
              Reject
            </button>
          </div>
        )
      case 'interviewing':
        return (
          <div className="space-y-2">
            {viewDetailsButton}
            <button
              onClick={() => setShowOfferModal(true)}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white text-sm py-2 px-3 rounded-md transition-colors font-medium"
            >
              Make Offer
            </button>
            <button
              onClick={() => setShowRejectionModal(true)}
              className="w-full bg-red-600 hover:bg-red-700 text-white text-sm py-2 px-3 rounded-md transition-colors font-medium"
            >
              Reject
            </button>
          </div>
        )
      case 'offer':
        return (
          <div className="space-y-2">
            {viewDetailsButton}
            <div className="text-center">
              <span className="text-sm text-green-600 font-medium">
                Offer Pending
              </span>
            </div>
          </div>
        )
      case 'rejected':
        return (
          <div className="space-y-2">
            {viewDetailsButton}
            <div className="text-center">
              <span className="text-sm text-red-600 font-medium">
                Rejected
              </span>
            </div>
          </div>
        )
      default:
        return viewDetailsButton
    }
  }

  return (
    <>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 hover:shadow-md transition-shadow">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h4 className="font-semibold text-gray-900 dark:text-white text-sm mb-1">
              {submission.candidateName}
            </h4>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
              Submitted by {submission.recruiter.firstName} {submission.recruiter.lastName}
            </p>
            <span className={`badge ${getStatusClass(submission.status)}`}>
              {submission.status}
            </span>
          </div>
        </div>

        <div className="space-y-2 mb-3">
          {/* Contact Information - Hidden from Employers */}
          {user?.userType !== 'EMPLOYER' && (
            <>
              <div className="flex items-center text-xs text-gray-600 dark:text-gray-400">
                <EnvelopeIcon className="h-3 w-3 mr-1" />
                <span className="truncate">{submission.candidateEmail}</span>
              </div>
              <div className="flex items-center text-xs text-gray-600 dark:text-gray-400">
                <PhoneIcon className="h-3 w-3 mr-1" />
                <span>{submission.candidatePhone}</span>
              </div>
            </>
          )}
          
          {/* Contact Information Hidden Notice for Employers */}
          {user?.userType === 'EMPLOYER' && (
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded p-2">
              <div className="flex items-center text-xs text-blue-700 dark:text-blue-300">
                <EnvelopeIcon className="h-3 w-3 mr-1" />
                <span>Contact info protected - Use chat to communicate</span>
              </div>
            </div>
          )}
          
          <div className="flex items-center text-xs text-gray-600 dark:text-gray-400">
            <CalendarIcon className="h-3 w-3 mr-1" />
            <span>{formatDate(submission.submittedAt)}</span>
          </div>
        </div>

        {submission.fitNotes && (
          <div className="mb-3">
            <p className="text-xs text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-700 p-2 rounded">
              <strong>Recruiter Notes:</strong> {submission.fitNotes}
            </p>
          </div>
        )}

        {getActionButtons()}
      </div>

      {/* Modals */}
      {showSlidePanel && (
        <CandidateSlidePanel
          submission={submission}
          onClose={() => setShowSlidePanel(false)}
          onSubmissionUpdate={onSubmissionUpdate}
          columnId={columnId}
          onScheduleInterview={() => {
            setShowSlidePanel(false)
            setShowInterviewModal(true)
          }}
          onMakeOffer={() => {
            setShowSlidePanel(false)
            setShowOfferModal(true)
          }}
          onReject={() => {
            setShowSlidePanel(false)
            setShowRejectionModal(true)
          }}
        />
      )}

      {showInterviewModal && (
        <InterviewModal
          submission={submission}
          jobId={jobId}
          onClose={() => setShowInterviewModal(false)}
          onSubmissionUpdate={onSubmissionUpdate}
        />
      )}

      {showOfferModal && (
        <OfferModal
          submission={submission}
          jobId={jobId}
          onClose={() => setShowOfferModal(false)}
          onSubmissionUpdate={onSubmissionUpdate}
        />
      )}

      {showRejectionModal && (
        <RejectionModal
          submission={submission}
          jobId={jobId}
          onClose={() => setShowRejectionModal(false)}
          onSubmissionUpdate={onSubmissionUpdate}
        />
      )}
    </>
  )
}
