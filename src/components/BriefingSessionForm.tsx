'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { CalendarDaysIcon, ClockIcon, UsersIcon, VideoCameraIcon } from '@heroicons/react/24/outline'

interface BriefingSessionFormProps {
  jobId: string
  onSuccess: (session: any) => void
  onCancel: () => void
}

interface BriefingSessionData {
  title: string
  description: string
  scheduledDateTime: string
  duration: number
  maxParticipants: number
  isAnonymous: boolean
}

export default function BriefingSessionForm({ jobId, onSuccess, onCancel }: BriefingSessionFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { register, handleSubmit, formState: { errors } } = useForm<BriefingSessionData>()

  const onSubmit = async (data: BriefingSessionData) => {
    setIsSubmitting(true)
    try {
      const response = await fetch('/api/briefing/sessions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          ...data,
          jobId
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to create briefing session')
      }

      const result = await response.json()
      onSuccess(result.briefingSession)
    } catch (error: any) {
      console.error('Error creating briefing session:', error)
      alert('Failed to create briefing session: ' + error.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
      <div className="flex items-center mb-6">
        <VideoCameraIcon className="h-8 w-8 text-blue-600 dark:text-blue-400 mr-3" />
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Schedule Live Briefing Session</h2>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Title */}
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Session Title *
          </label>
          <input
            {...register('title', { required: 'Session title is required' })}
            type="text"
            className="input-field"
            placeholder="e.g., Software Engineer Role Briefing"
          />
          {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>}
        </div>

        {/* Description */}
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Session Description
          </label>
          <textarea
            {...register('description')}
            rows={3}
            className="input-field"
            placeholder="Brief description of what will be covered in this session..."
          />
        </div>

        {/* Date and Time */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="scheduledDateTime" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <CalendarDaysIcon className="h-5 w-5 inline mr-2" />
              Scheduled Date & Time *
            </label>
            <input
              {...register('scheduledDateTime', { required: 'Scheduled date and time is required' })}
              type="datetime-local"
              className="input-field"
              min={new Date().toISOString().slice(0, 16)}
            />
            {errors.scheduledDateTime && <p className="mt-1 text-sm text-red-600">{errors.scheduledDateTime.message}</p>}
          </div>

          <div>
            <label htmlFor="duration" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <ClockIcon className="h-5 w-5 inline mr-2" />
              Duration (minutes) *
            </label>
            <select
              {...register('duration', { required: 'Duration is required' })}
              className="input-field"
            >
              <option value={15}>15 minutes</option>
              <option value={30}>30 minutes</option>
              <option value={60}>60 minutes</option>
              <option value={90}>90 minutes</option>
              <option value={120}>120 minutes</option>
            </select>
            {errors.duration && <p className="mt-1 text-sm text-red-600">{errors.duration.message}</p>}
          </div>
        </div>

        {/* Max Participants */}
        <div>
          <label htmlFor="maxParticipants" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            <UsersIcon className="h-5 w-5 inline mr-2" />
            Maximum Participants *
          </label>
          <select
            {...register('maxParticipants', { required: 'Maximum participants is required' })}
            className="input-field"
          >
            <option value={10}>10 participants</option>
            <option value={25}>25 participants</option>
            <option value={50}>50 participants</option>
            <option value={100}>100 participants</option>
          </select>
          {errors.maxParticipants && <p className="mt-1 text-sm text-red-600">{errors.maxParticipants.message}</p>}
        </div>

        {/* Anonymous Participation */}
        <div className="flex items-center">
          <input
            {...register('isAnonymous')}
            type="checkbox"
            id="isAnonymous"
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded dark:bg-gray-700 dark:border-gray-600"
            defaultChecked
          />
          <label htmlFor="isAnonymous" className="ml-2 block text-sm text-gray-900 dark:text-gray-100">
            Allow anonymous participation (recruiters can join without revealing their identity)
          </label>
        </div>

        {/* Info Box */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <h3 className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-2">What happens next?</h3>
          <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
            <li>• A Zoom webinar link will be generated automatically</li>
            <li>• Recruiters can join the session anonymously</li>
            <li>• You'll be able to share your hiring requirements and answer questions</li>
            <li>• The session will be recorded for future reference</li>
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={onCancel}
            className="btn-secondary"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="btn-primary disabled:opacity-50"
          >
            {isSubmitting ? 'Creating Session...' : 'Schedule Briefing Session'}
          </button>
        </div>
      </form>
    </div>
  )
}
