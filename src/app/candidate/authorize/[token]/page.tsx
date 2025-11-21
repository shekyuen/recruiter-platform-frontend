'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import ThemeToggle from '@/components/ThemeToggle'
import { CheckCircleIcon, VideoCameraIcon, PlayIcon, StopIcon } from '@heroicons/react/24/outline'

interface AuthorizationData {
  id: string
  candidateName: string
  candidateEmail: string
  jobTitle: string
  companyName: string
  recruiterName: string
  expiresAt: string
  isAuthorized: boolean
}

export default function CandidateAuthorizationPage() {
  const { token } = useParams()
  const [authorizationData, setAuthorizationData] = useState<AuthorizationData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [videoBlob, setVideoBlob] = useState<Blob | null>(null)
  const [videoUrl, setVideoUrl] = useState<string | null>(null)
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null)
  const [hasAgreed, setHasAgreed] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (token) {
      loadAuthorizationData()
    }
  }, [token])

  const loadAuthorizationData = async () => {
    try {
      const response = await fetch(`/api/candidate/authorize/${token}`)
      if (response.ok) {
        const data = await response.json()
        setAuthorizationData(data)
      } else {
        setError('Invalid or expired authorization link')
      }
    } catch (error) {
      setError('Failed to load authorization data')
    } finally {
      setIsLoading(false)
    }
  }

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: true, 
        audio: true 
      })
      
      const recorder = new MediaRecorder(stream)
      const chunks: BlobPart[] = []
      
      recorder.ondataavailable = (event) => {
        chunks.push(event.data)
      }
      
      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'video/webm' })
        setVideoBlob(blob)
        setVideoUrl(URL.createObjectURL(blob))
        stream.getTracks().forEach(track => track.stop())
      }
      
      setMediaRecorder(recorder)
      recorder.start()
      setIsRecording(true)
    } catch (error) {
      console.error('Error starting recording:', error)
      alert('Unable to access camera. Please check permissions.')
    }
  }

  const stopRecording = () => {
    if (mediaRecorder && isRecording) {
      mediaRecorder.stop()
      setIsRecording(false)
    }
  }

  const handleSubmit = async () => {
    if (!hasAgreed) {
      alert('Please agree to the Terms & Conditions')
      return
    }

    setIsSubmitting(true)
    try {
      const formData = new FormData()
      formData.append('token', token as string)
      formData.append('authorized', 'true')
      
      if (videoBlob) {
        formData.append('video', videoBlob, 'intro-video.webm')
      }

      const response = await fetch('/api/candidate/authorize', {
        method: 'POST',
        body: formData
      })

      if (response.ok) {
        const result = await response.json()
        alert('Authorization completed successfully! Your profile has been shared with the employer.')
        // Redirect or show success message
      } else {
        const error = await response.json()
        alert(error.message || 'Failed to complete authorization')
      }
    } catch (error) {
      console.error('Error submitting authorization:', error)
      alert('Failed to complete authorization')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (error || !authorizationData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Authorization Link Invalid</h1>
          <p className="text-gray-600">
            {error || 'This authorization link is invalid or has expired.'}
          </p>
        </div>
      </div>
    )
  }

  if (authorizationData.isAuthorized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <CheckCircleIcon className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Already Authorized</h1>
          <p className="text-gray-600">
            You have already authorized {authorizationData.recruiterName} to represent you for this position.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
          {/* Header */}
          <div className="bg-blue-600 dark:bg-blue-700 text-white p-6">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-2xl font-bold">Candidate Authorization</h1>
                <p className="text-blue-100 dark:text-blue-200 mt-2">
                  Complete your profile to proceed with the application
                </p>
              </div>
              <ThemeToggle />
            </div>
          </div>

          <div className="p-6">
            {/* Job Information */}
            <div className="bg-gray-50 rounded-lg p-6 mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Application Details</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Position</p>
                  <p className="font-medium">{authorizationData.jobTitle}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Company</p>
                  <p className="font-medium">{authorizationData.companyName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Recruiter</p>
                  <p className="font-medium">{authorizationData.recruiterName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Your Name</p>
                  <p className="font-medium">{authorizationData.candidateName}</p>
                </div>
              </div>
            </div>

            {/* Terms & Conditions */}
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Terms & Conditions</h2>
              <div className="bg-gray-50 rounded-lg p-4 max-h-40 overflow-y-auto">
                <div className="text-sm text-gray-700 space-y-2">
                  <p><strong>1. Authorization:</strong> By checking the box below, you authorize {authorizationData.recruiterName} to represent you in the recruitment process for the position of {authorizationData.jobTitle} at {authorizationData.companyName}.</p>
                  
                  <p><strong>2. Data Sharing:</strong> Your profile information, including resume, contact details, and any video introduction, will be shared with the employer for evaluation purposes.</p>
                  
                  <p><strong>3. Platform Usage:</strong> You agree to use this platform in accordance with our terms of service and privacy policy.</p>
                  
                  <p><strong>4. Communication:</strong> The recruiter may communicate with you regarding this application and any related opportunities.</p>
                  
                  <p><strong>5. Withdrawal:</strong> You may withdraw your authorization at any time by contacting the recruiter directly.</p>
                </div>
              </div>
              
              <div className="mt-4">
                <label className="flex items-start space-x-3">
                  <input
                    type="checkbox"
                    checked={hasAgreed}
                    onChange={(e) => setHasAgreed(e.target.checked)}
                    className="mt-1 h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">
                    I have read and agree to the Terms & Conditions above, and authorize {authorizationData.recruiterName} to represent me for this position.
                  </span>
                </label>
              </div>
            </div>

            {/* Video Introduction */}
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Video Introduction (Optional)</h2>
              <p className="text-sm text-gray-600 mb-4">
                Record a 30-second video to introduce yourself and increase your chances of getting an interview.
              </p>
              
              {/* Guiding Questions */}
              <div className="bg-blue-50 rounded-lg p-4 mb-4">
                <h3 className="font-medium text-blue-900 mb-2">Guiding Questions:</h3>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• What makes you excited about this role?</li>
                  <li>• What relevant experience do you bring?</li>
                  <li>• Why are you interested in this company?</li>
                  <li>• What are your key strengths for this position?</li>
                </ul>
              </div>

              {/* Video Recording */}
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                {!videoUrl ? (
                  <div>
                    <VideoCameraIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 mb-4">No video recorded yet</p>
                    <button
                      onClick={isRecording ? stopRecording : startRecording}
                      className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                        isRecording 
                          ? 'bg-red-600 hover:bg-red-700 text-white' 
                          : 'bg-blue-600 hover:bg-blue-700 text-white'
                      }`}
                    >
                      {isRecording ? (
                        <>
                          <StopIcon className="h-4 w-4 inline mr-2" />
                          Stop Recording
                        </>
                      ) : (
                        <>
                          <PlayIcon className="h-4 w-4 inline mr-2" />
                          Start Recording
                        </>
                      )}
                    </button>
                    {isRecording && (
                      <p className="text-sm text-gray-500 mt-2">Recording... (30 seconds max)</p>
                    )}
                  </div>
                ) : (
                  <div>
                    <video
                      src={videoUrl}
                      controls
                      className="w-full max-w-md mx-auto rounded-lg"
                    />
                    <button
                      onClick={() => {
                        setVideoUrl(null)
                        setVideoBlob(null)
                      }}
                      className="mt-4 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
                    >
                      Record Again
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end space-x-4">
              <button
                onClick={handleSubmit}
                disabled={!hasAgreed || isSubmitting}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors"
              >
                {isSubmitting ? 'Processing...' : 'Complete Authorization'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
