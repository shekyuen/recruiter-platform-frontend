'use client'

import { useState } from 'react'
import { XMarkIcon, CurrencyDollarIcon, CalendarIcon } from '@heroicons/react/24/outline'

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

interface OfferModalProps {
  submission: CandidateSubmission
  jobId: string
  onClose: () => void
  onSubmissionUpdate: (submissions: CandidateSubmission[]) => void
}

export default function OfferModal({ submission, jobId, onClose, onSubmissionUpdate }: OfferModalProps) {
  const [annualSalary, setAnnualSalary] = useState('')
  const [startDate, setStartDate] = useState('')
  const [offerNotes, setOfferNotes] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleCreateOffer = async () => {
    if (!annualSalary || !startDate) {
      alert('Please fill in all required fields')
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch('/api/offers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          submissionId: submission.id,
          jobId,
          annualSalary: parseFloat(annualSalary),
          startDate,
          notes: offerNotes,
          recruiterId: submission.recruiter.id
        })
      })

      if (response.ok) {
        // Update submission status to OFFER
        const statusResponse = await fetch(`/api/submissions/${submission.id}/status`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ status: 'OFFER' })
        })

        if (statusResponse.ok) {
          onSubmissionUpdate([{ ...submission, status: 'OFFER' }])
          onClose()
        }
      }
    } catch (error) {
      console.error('Failed to create offer:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const calculatePlacementFee = () => {
    const salary = parseFloat(annualSalary)
    if (!salary) return { total: 0, recruiter: 0, platform: 0 }
    
    // Assuming 20% placement fee (this should come from job data)
    const placementFeePercent = 20
    const totalFee = (salary * placementFeePercent) / 100
    const recruiterShare = totalFee * 0.7 // 70% for recruiter
    const platformShare = totalFee * 0.3 // 30% for platform
    
    return {
      total: Math.round(totalFee),
      recruiter: Math.round(recruiterShare),
      platform: Math.round(platformShare)
    }
  }

  const fee = calculatePlacementFee()

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full mx-4">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Create Job Offer</h2>
          <button
            onClick={onClose}
            className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-400"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6">
          {/* Candidate Info */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Making offer to: {submission.candidateName}
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Recruiter: {submission.recruiter.firstName} {submission.recruiter.lastName}
            </p>
          </div>

          {/* Offer Details */}
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Annual Salary (HK$)
              </label>
              <div className="relative">
                <CurrencyDollarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="number"
                  value={annualSalary}
                  onChange={(e) => setAnnualSalary(e.target.value)}
                  className="input-field pl-10"
                  placeholder="Enter annual salary"
                  min="0"
                  step="1000"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                First Day of Work
              </label>
              <div className="relative">
                <CalendarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="input-field pl-10"
                  min={new Date().toISOString().split('T')[0]}
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Offer Notes (Optional)
              </label>
              <textarea
                value={offerNotes}
                onChange={(e) => setOfferNotes(e.target.value)}
                className="input-field"
                rows={3}
                placeholder="Add any additional details about the offer..."
              />
            </div>
          </div>

          {/* Placement Fee Calculation */}
          {annualSalary && (
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-3">Placement Fee Calculation</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Placement Fee (20%):</span>
                  <span className="font-medium">HK${fee.total.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-green-600">
                  <span>Recruiter Share (70%):</span>
                  <span className="font-medium">HK${fee.recruiter.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-blue-600">
                  <span>Platform Fee (30%):</span>
                  <span className="font-medium">HK${fee.platform.toLocaleString()}</span>
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200 mt-6">
            <button
              onClick={onClose}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button
              onClick={handleCreateOffer}
              disabled={isLoading || !annualSalary || !startDate}
              className="btn-primary disabled:opacity-50"
            >
              {isLoading ? 'Creating Offer...' : 'Create Offer'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
