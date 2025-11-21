'use client'

import { useState, useRef, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { MicrophoneIcon, PlayIcon, StopIcon, PauseIcon } from '@heroicons/react/24/outline'

interface AudioBriefFormProps {
  jobId: string
  onSuccess: (audioBrief: any) => void
  onCancel: () => void
}

interface AudioBriefData {
  title: string
  description: string
  questions: string
}

const GUIDING_QUESTIONS = [
  "What are the key responsibilities for this role?",
  "What technical skills are absolutely essential?",
  "What soft skills or personality traits are you looking for?",
  "What would make a candidate stand out to you?",
  "What are your biggest concerns or deal-breakers?",
  "What's the team culture like?",
  "What opportunities for growth does this role offer?",
  "What challenges might the successful candidate face?",
  "How do you measure success in this role?",
  "Is there anything else you'd like recruiters to know?"
]

export default function AudioBriefForm({ jobId, onSuccess, onCancel }: AudioBriefFormProps) {
  const [isRecording, setIsRecording] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const audioRef = useRef<HTMLAudioElement>(null)
  const { register, handleSubmit, formState: { errors }, setValue } = useForm<AudioBriefData>()

  useEffect(() => {
    // Set default questions
    setValue('questions', GUIDING_QUESTIONS.join('\n'))
  }, [setValue])

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const recorder = new MediaRecorder(stream)
      const chunks: BlobPart[] = []

      recorder.ondataavailable = (e) => {
        chunks.push(e.data)
      }

      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/webm' })
        setAudioBlob(blob)
        setAudioUrl(URL.createObjectURL(blob))
        stream.getTracks().forEach(track => track.stop())
      }

      recorder.start()
      setMediaRecorder(recorder)
      setIsRecording(true)
    } catch (error) {
      console.error('Error starting recording:', error)
      alert('Failed to start recording. Please ensure microphone access is granted.')
    }
  }

  const stopRecording = () => {
    if (mediaRecorder && isRecording) {
      mediaRecorder.stop()
      setIsRecording(false)
    }
  }

  const playAudio = () => {
    if (audioRef.current && audioUrl) {
      audioRef.current.play()
      setIsPlaying(true)
    }
  }

  const pauseAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause()
      setIsPlaying(false)
    }
  }

  const retakeRecording = () => {
    setAudioBlob(null)
    setAudioUrl(null)
    setIsPlaying(false)
  }

  const onSubmit = async (data: AudioBriefData) => {
    if (!audioBlob) {
      alert('Please record an audio brief before submitting')
      return
    }

    setIsSubmitting(true)
    try {
      const formData = new FormData()
      formData.append('jobId', jobId)
      formData.append('title', data.title)
      formData.append('description', data.description || '')
      formData.append('questions', data.questions)
      formData.append('audio', audioBlob, 'audio-brief.webm')

      const response = await fetch('/api/briefing/audio', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formData
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to create audio brief')
      }

      const result = await response.json()
      onSuccess(result.audioBrief)
    } catch (error: any) {
      console.error('Error creating audio brief:', error)
      alert('Failed to create audio brief: ' + error.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
      <div className="flex items-center mb-6">
        <MicrophoneIcon className="h-8 w-8 text-green-600 dark:text-green-400 mr-3" />
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Record Audio Brief</h2>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Title */}
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Brief Title *
          </label>
          <input
            {...register('title', { required: 'Brief title is required' })}
            type="text"
            className="input-field"
            placeholder="e.g., Software Engineer Role Overview"
          />
          {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>}
        </div>

        {/* Description */}
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Brief Description
          </label>
          <textarea
            {...register('description')}
            rows={3}
            className="input-field"
            placeholder="Optional description of what this audio brief covers..."
          />
        </div>

        {/* Guiding Questions */}
        <div>
          <label htmlFor="questions" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Guiding Questions
          </label>
          <textarea
            {...register('questions')}
            rows={8}
            className="input-field"
            placeholder="Questions to guide your audio brief..."
          />
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
            These questions will help you structure your audio brief. Feel free to modify or add your own questions.
          </p>
        </div>

        {/* Audio Recording Section */}
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Record Your Audio Brief</h3>
          
          {!audioUrl ? (
            <div className="text-center">
              <div className="mb-4">
                <MicrophoneIcon className="h-16 w-16 text-gray-600 dark:text-gray-300 mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  Click the button below to start recording your audio brief. Speak clearly and cover the key points about your hiring requirements.
                </p>
              </div>
              
              <button
                type="button"
                onClick={startRecording}
                disabled={isRecording}
                className="btn-primary disabled:opacity-50"
              >
                <MicrophoneIcon className="h-5 w-5 mr-2" />
                {isRecording ? 'Recording...' : 'Start Recording'}
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-center space-x-4">
                <audio ref={audioRef} src={audioUrl} onEnded={() => setIsPlaying(false)} />
                
                {!isPlaying ? (
                  <button
                    type="button"
                    onClick={playAudio}
                    className="btn-secondary"
                  >
                    <PlayIcon className="h-5 w-5 mr-2" />
                    Play Recording
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={pauseAudio}
                    className="btn-secondary"
                  >
                    <PauseIcon className="h-5 w-5 mr-2" />
                    Pause
                  </button>
                )}
                
                <button
                  type="button"
                  onClick={retakeRecording}
                  className="btn-outline"
                >
                  <StopIcon className="h-5 w-5 mr-2" />
                  Retake Recording
                </button>
              </div>
              
              <p className="text-sm text-gray-600 dark:text-gray-300 text-center">
                Audio brief recorded successfully. You can play it back or retake if needed.
              </p>
            </div>
          )}
        </div>

        {/* Info Box */}
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
          <h3 className="text-sm font-medium text-green-800 dark:text-green-200 mb-2">Tips for a Great Audio Brief</h3>
          <ul className="text-sm text-green-700 dark:text-green-300 space-y-1">
            <li>• Speak clearly and at a moderate pace</li>
            <li>• Cover the key requirements and what you're looking for</li>
            <li>• Mention any specific challenges or opportunities</li>
            <li>• Keep it concise but comprehensive (2-5 minutes is ideal)</li>
            <li>• Be authentic and share your enthusiasm for the role</li>
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
            disabled={isSubmitting || !audioBlob}
            className="btn-primary disabled:opacity-50"
          >
            {isSubmitting ? 'Creating Audio Brief...' : 'Create Audio Brief'}
          </button>
        </div>
      </form>
    </div>
  )
}
