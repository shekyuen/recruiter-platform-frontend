'use client'

import { useState } from 'react'
import { CheckCircleIcon, VideoCameraIcon, MicrophoneIcon, DocumentTextIcon } from '@heroicons/react/24/outline'
import BriefingSessionForm from './BriefingSessionForm'
import AudioBriefForm from './AudioBriefForm'

interface JobPublishingWorkflowProps {
  jobId: string
  onComplete: () => void
  onCancel: () => void
}

type PublishingStep = 'select' | 'briefing' | 'audio' | 'publish' | 'complete'

export default function JobPublishingWorkflow({ jobId, onComplete, onCancel }: JobPublishingWorkflowProps) {
  const [currentStep, setCurrentStep] = useState<PublishingStep>('select')
  const [selectedOption, setSelectedOption] = useState<string | null>(null)
  const [briefingSession, setBriefingSession] = useState<any>(null)
  const [audioBrief, setAudioBrief] = useState<any>(null)

  const handleOptionSelect = (option: string) => {
    setSelectedOption(option)
    if (option === 'briefing') {
      setCurrentStep('briefing')
    } else if (option === 'audio') {
      setCurrentStep('audio')
    } else if (option === 'publish') {
      setCurrentStep('publish')
    }
  }

  const handleBriefingSuccess = (session: any) => {
    setBriefingSession(session)
    setCurrentStep('complete')
  }

  const handleAudioBriefSuccess = (brief: any) => {
    setAudioBrief(brief)
    setCurrentStep('complete')
  }

  const handlePublishDirectly = async () => {
    try {
      // Update job status to PUBLISHED
      const response = await fetch(`/api/jobs/${jobId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          status: 'PUBLISHED'
        })
      })

      if (!response.ok) {
        throw new Error('Failed to publish job')
      }

      setCurrentStep('complete')
    } catch (error: any) {
      console.error('Error publishing job:', error)
      alert('Failed to publish job: ' + error.message)
    }
  }

  const renderStep = () => {
    switch (currentStep) {
      case 'select':
        return (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                How would you like to brief recruiters?
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-300">
                Choose how you'd like to share your hiring requirements with recruiters
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Live Briefing Session */}
              <div
                onClick={() => handleOptionSelect('briefing')}
                className="cursor-pointer bg-white dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 rounded-lg p-6 hover:border-blue-500 dark:hover:border-blue-400 hover:shadow-lg transition-all"
              >
                <div className="text-center">
                  <VideoCameraIcon className="h-12 w-12 text-blue-600 dark:text-blue-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                    Live Briefing Session
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-4">
                    Schedule a Zoom webinar to discuss your requirements with recruiters
                  </p>
                  <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                    <li>• Interactive Q&A session</li>
                    <li>• Real-time communication</li>
                    <li>• Anonymous participation</li>
                    <li>• Recorded for reference</li>
                  </ul>
                </div>
              </div>

              {/* Audio Brief */}
              <div
                onClick={() => handleOptionSelect('audio')}
                className="cursor-pointer bg-white dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 rounded-lg p-6 hover:border-green-500 dark:hover:border-green-400 hover:shadow-lg transition-all"
              >
                <div className="text-center">
                  <MicrophoneIcon className="h-12 w-12 text-green-600 dark:text-green-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                    Record Audio Brief
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-4">
                    Record a brief audio message about your hiring requirements
                  </p>
                  <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                    <li>• Quick and easy to create</li>
                    <li>• Available 24/7 for recruiters</li>
                    <li>• Personal touch</li>
                    <li>• Guided questions</li>
                  </ul>
                </div>
              </div>

              {/* Publish Directly */}
              <div
                onClick={() => handleOptionSelect('publish')}
                className="cursor-pointer bg-white dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 rounded-lg p-6 hover:border-gray-500 dark:hover:border-gray-400 hover:shadow-lg transition-all"
              >
                <div className="text-center">
                  <DocumentTextIcon className="h-12 w-12 text-gray-700 dark:text-gray-300 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                    Publish Directly
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-4">
                    Publish the job immediately without additional briefing
                  </p>
                  <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                    <li>• Immediate publication</li>
                    <li>• Standard job posting</li>
                    <li>• No additional setup</li>
                    <li>• Quick and simple</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="mt-8 text-center">
              <button
                onClick={onCancel}
                className="btn-secondary"
              >
                Cancel
              </button>
            </div>
          </div>
        )

      case 'briefing':
        return (
          <BriefingSessionForm
            jobId={jobId}
            onSuccess={handleBriefingSuccess}
            onCancel={() => setCurrentStep('select')}
          />
        )

      case 'audio':
        return (
          <AudioBriefForm
            jobId={jobId}
            onSuccess={handleAudioBriefSuccess}
            onCancel={() => setCurrentStep('select')}
          />
        )

      case 'publish':
        return (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
            <div className="text-center mb-8">
              <DocumentTextIcon className="h-16 w-16 text-gray-700 dark:text-gray-300 mx-auto mb-4" />
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                Publish Job Directly
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-300">
                Your job will be published immediately and visible to all recruiters
              </p>
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6 mb-8">
              <h3 className="text-lg font-medium text-blue-800 dark:text-blue-200 mb-2">What happens next?</h3>
              <ul className="text-blue-700 dark:text-blue-300 space-y-1">
                <li>• Your job will be published and visible to all recruiters</li>
                <li>• Recruiters can start submitting candidates immediately</li>
                <li>• You'll receive notifications for new submissions</li>
                <li>• You can always add a briefing session or audio brief later</li>
              </ul>
            </div>

            <div className="flex justify-center space-x-4">
              <button
                onClick={() => setCurrentStep('select')}
                className="btn-secondary"
              >
                Back to Options
              </button>
              <button
                onClick={handlePublishDirectly}
                className="btn-primary"
              >
                Publish Job Now
              </button>
            </div>
          </div>
        )

      case 'complete':
        return (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
            <div className="text-center">
              <CheckCircleIcon className="h-16 w-16 text-green-600 dark:text-green-400 mx-auto mb-4" />
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                Job Published Successfully!
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
                Your job has been published and is now visible to recruiters
              </p>

              {briefingSession && (
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6 mb-6">
                  <h3 className="text-lg font-medium text-blue-800 dark:text-blue-200 mb-2">
                    Briefing Session Scheduled
                  </h3>
                  <p className="text-blue-700 dark:text-blue-300">
                    <strong>Session:</strong> {briefingSession.title}
                  </p>
                  <p className="text-blue-700 dark:text-blue-300">
                    <strong>Date:</strong> {new Date(briefingSession.scheduledDateTime).toLocaleString()}
                  </p>
                  <p className="text-blue-700 dark:text-blue-300">
                    <strong>Duration:</strong> {briefingSession.duration} minutes
                  </p>
                  <p className="text-blue-700 dark:text-blue-300">
                    <strong>Zoom Link:</strong> {briefingSession.zoomMeetingUrl}
                  </p>
                </div>
              )}

              {audioBrief && (
                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-6 mb-6">
                  <h3 className="text-lg font-medium text-green-800 dark:text-green-200 mb-2">
                    Audio Brief Created
                  </h3>
                  <p className="text-green-700 dark:text-green-300">
                    <strong>Title:</strong> {audioBrief.title}
                  </p>
                  <p className="text-green-700 dark:text-green-300">
                    <strong>Duration:</strong> {Math.floor(audioBrief.duration / 60)} minutes
                  </p>
                  <p className="text-green-700 dark:text-green-300">
                    Recruiters can now listen to your audio brief when viewing the job
                  </p>
                </div>
              )}

              <button
                onClick={onComplete}
                className="btn-primary"
              >
                Continue to Job Management
              </button>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {renderStep()}
      </div>
    </div>
  )
}
