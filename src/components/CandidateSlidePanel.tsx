'use client'

import { useState, useEffect, useRef } from 'react'
import { XMarkIcon, DocumentIcon, EnvelopeIcon, PhoneIcon, CalendarIcon, ChatBubbleLeftRightIcon, PaperAirplaneIcon } from '@heroicons/react/24/outline'
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
  videoIntroUrl?: string
}

interface ChatMessage {
  id: string
  message: string
  senderId: string
  senderType: string
  createdAt: string
  sender: {
    id: string
    firstName: string
    lastName: string
    userType: string
  }
}

interface CandidateSlidePanelProps {
  submission: CandidateSubmission
  onClose: () => void
  onSubmissionUpdate: (submissions: CandidateSubmission[]) => void
  columnId?: string
  onScheduleInterview?: () => void
  onMakeOffer?: () => void
  onReject?: () => void
}

export default function CandidateSlidePanel({ 
  submission, 
  onClose, 
  onSubmissionUpdate, 
  columnId, 
  onScheduleInterview, 
  onMakeOffer, 
  onReject 
}: CandidateSlidePanelProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [isLoadingMessages, setIsLoadingMessages] = useState(false)
  const [isSendingMessage, setIsSendingMessage] = useState(false)
  const chatEndRef = useRef<HTMLDivElement>(null)
  const { user } = useAuthStore()

  // Load chat messages when panel opens
  useEffect(() => {
    if (submission.status !== 'SUBMITTED') {
      loadChatMessages()
    }
  }, [submission.id, submission.status])

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [chatMessages])

  const loadChatMessages = async () => {
    setIsLoadingMessages(true)
    try {
      const response = await fetch(`/api/chat/submission/${submission.id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        setChatMessages(data.messages)
      }
    } catch (error) {
      console.error('Error loading chat messages:', error)
    } finally {
      setIsLoadingMessages(false)
    }
  }

  const sendMessage = async () => {
    if (!newMessage.trim() || isSendingMessage) return

    setIsSendingMessage(true)
    try {
      const response = await fetch(`/api/chat/submission/${submission.id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ message: newMessage })
      })

      if (response.ok) {
        const data = await response.json()
        setChatMessages(prev => [...prev, data.message])
        setNewMessage('')
      } else {
        const error = await response.json()
        alert(error.message || 'Failed to send message')
      }
    } catch (error) {
      console.error('Error sending message:', error)
      alert('Failed to send message')
    } finally {
      setIsSendingMessage(false)
    }
  }

  const handleMoveToReviewing = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/submissions/${submission.id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ status: 'REVIEWING' })
      })

      if (response.ok) {
        const submissionsResponse = await fetch('/api/submissions', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        })
        
        if (submissionsResponse.ok) {
          const data = await submissionsResponse.json()
          onSubmissionUpdate(data.submissions)
        }
        
        onClose()
      } else {
        const error = await response.json()
        alert(error.message || 'Failed to move candidate to reviewing')
      }
    } catch (error) {
      console.error('Error moving candidate to reviewing:', error)
      alert('Failed to move candidate to reviewing')
    } finally {
      setIsLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const isCurrentUser = (senderId: string) => {
    return user?.id === senderId
  }

  const canChat = submission.status !== 'SUBMITTED'

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-40"
        onClick={onClose}
      />
      
      {/* Slide-in Panel */}
      <div className="fixed right-0 top-0 h-full w-full max-w-4xl bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out">
        <div className="flex h-full">
          {/* Left Side - Candidate Profile */}
          <div className="flex-1 flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gray-50">
              <div className="flex items-center space-x-3">
                <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 font-semibold text-lg">
                    {submission.candidateName.split(' ').map(n => n[0]).join('')}
                  </span>
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    {submission.candidateName}
                  </h2>
                  <span className={`badge ${
                    submission.status === 'SUBMITTED' 
                      ? 'candidate-inbox'
                      : submission.status === 'REVIEWING'
                      ? 'candidate-reviewing'
                      : submission.status === 'INTERVIEWING'
                      ? 'candidate-interviewing'
                      : submission.status === 'OFFER'
                      ? 'candidate-offer'
                      : 'candidate-rejected'
                  }`}>
                    {submission.status}
                  </span>
                </div>
              </div>
              <button
                onClick={onClose}
                className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors p-2"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            {/* Profile Content */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="space-y-6">
                {/* Contact Information - Hidden from Employers */}
                {user?.userType !== 'EMPLOYER' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Email Address
                      </label>
                      <div className="flex items-center space-x-2">
                        <EnvelopeIcon className="h-5 w-5 text-gray-600 dark:text-gray-300" />
                        <span className="text-gray-900 dark:text-white">{submission.candidateEmail}</span>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Phone Number
                      </label>
                      <div className="flex items-center space-x-2">
                        <PhoneIcon className="h-5 w-5 text-gray-600 dark:text-gray-300" />
                        <span className="text-gray-900 dark:text-white">{submission.candidatePhone}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Contact Information Hidden Notice for Employers */}
                {user?.userType === 'EMPLOYER' && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <EnvelopeIcon className="h-5 w-5 text-blue-400" />
                      </div>
                      <div className="ml-3">
                        <h3 className="text-sm font-medium text-blue-800">
                          Contact Information Protected
                        </h3>
                        <p className="text-sm text-blue-700 mt-1">
                          Candidate contact details are protected. Use the chat function to communicate with the recruiter.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Recruiter Information */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {user?.userType === 'EMPLOYER' ? 'Recruiter Information' : 'Submitted by Recruiter'}
                  </label>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0">
                        <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-blue-600 font-medium">
                            {submission.recruiter.firstName[0]}{submission.recruiter.lastName[0]}
                          </span>
                        </div>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {user?.userType === 'EMPLOYER' ? 'Recruiter (Contact Protected)' : `${submission.recruiter.firstName} ${submission.recruiter.lastName}`}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          {user?.userType === 'EMPLOYER' ? 'Use chat function to communicate' : submission.recruiter.email}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Resume */}
                {submission.resumeUrl && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Resume
                    </label>
                    <a
                      href={submission.resumeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center space-x-2 text-blue-600 hover:text-blue-800"
                    >
                      <DocumentIcon className="h-5 w-5" />
                      <span>View Resume</span>
                    </a>
                  </div>
                )}

                {/* Screening Responses */}
                {submission.screeningResponses && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Screening Responses
                    </label>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-sm text-gray-700 whitespace-pre-wrap">
                        {submission.screeningResponses}
                      </p>
                    </div>
                  </div>
                )}

                {/* Fit Notes */}
                {submission.fitNotes && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Why This Candidate Fits
                    </label>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-sm text-gray-700 whitespace-pre-wrap">
                        {submission.fitNotes}
                      </p>
                    </div>
                  </div>
                )}

                {/* Interview Availability */}
                {submission.interviewAvailability && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Interview Availability
                    </label>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center space-x-2">
                        <CalendarIcon className="h-5 w-5 text-gray-600 dark:text-gray-300" />
                        <span className="text-sm text-gray-700">
                          {submission.interviewAvailability}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Video Introduction */}
                {submission.videoIntroUrl && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Video Introduction
                    </label>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <video
                        src={submission.videoIntroUrl}
                        controls
                        className="w-full max-w-md rounded-lg"
                        poster="/api/placeholder/400/300"
                      >
                        Your browser does not support the video tag.
                      </video>
                      <p className="text-xs text-gray-600 dark:text-gray-300 mt-2">
                        30-second self-introduction video
                      </p>
                    </div>
                  </div>
                )}

                {/* Submission Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Submitted on
                  </label>
                  <p className="text-sm text-gray-600">
                    {formatDate(submission.submittedAt)}
                  </p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="border-t border-gray-200 p-6 bg-gray-50">
              <div className="flex justify-end space-x-4">
                <button
                  onClick={onClose}
                  className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-md transition-colors font-medium"
                >
                  Close
                </button>
                
                {columnId === 'inbox' && (
                  <>
                    <button
                      onClick={handleMoveToReviewing}
                      disabled={isLoading}
                      className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md transition-colors disabled:opacity-50 font-medium"
                    >
                      {isLoading ? 'Moving...' : 'Keep'}
                    </button>
                    {onReject && (
                      <button
                        onClick={onReject}
                        className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md transition-colors font-medium"
                      >
                        Reject
                      </button>
                    )}
                  </>
                )}
                
                {columnId === 'reviewing' && onScheduleInterview && (
                  <>
                    <button
                      onClick={onScheduleInterview}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors font-medium"
                    >
                      Schedule Interview
                    </button>
                    {onReject && (
                      <button
                        onClick={onReject}
                        className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md transition-colors font-medium"
                      >
                        Reject
                      </button>
                    )}
                  </>
                )}
                
                {columnId === 'interviewing' && onMakeOffer && (
                  <>
                    <button
                      onClick={onMakeOffer}
                      className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md transition-colors font-medium"
                    >
                      Make Offer
                    </button>
                    {onReject && (
                      <button
                        onClick={onReject}
                        className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md transition-colors font-medium"
                      >
                        Reject
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Right Side - Chat */}
          {canChat && (
            <div className="w-96 border-l border-gray-200 flex flex-col">
              {/* Chat Header */}
              <div className="p-4 border-b border-gray-200 bg-gray-50">
                <div className="flex items-center space-x-2">
                  <ChatBubbleLeftRightIcon className="h-5 w-5 text-blue-600" />
                  <h3 className="font-medium text-gray-900">Chat with Recruiter</h3>
                  {chatMessages.length > 0 && (
                    <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                      {chatMessages.length}
                    </span>
                  )}
                </div>
              </div>

              {/* Chat Messages */}
              <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
                {isLoadingMessages ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  </div>
                ) : chatMessages.length === 0 ? (
                  <div className="flex items-center justify-center h-full text-gray-600 dark:text-gray-300">
                    <div className="text-center">
                      <ChatBubbleLeftRightIcon className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                      <p>No messages yet. Start the conversation!</p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {chatMessages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${isCurrentUser(message.senderId) ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-xs px-4 py-2 rounded-lg ${
                            isCurrentUser(message.senderId)
                              ? 'bg-blue-600 text-white'
                              : 'bg-white text-gray-900 border border-gray-200'
                          }`}
                        >
                          <p className="text-sm">{message.message}</p>
                          <p className={`text-xs mt-1 ${
                            isCurrentUser(message.senderId) ? 'text-blue-100' : 'text-gray-600 dark:text-gray-300'
                          }`}>
                            {message.sender.firstName} {message.sender.lastName} • {formatDate(message.createdAt)}
                          </p>
                        </div>
                      </div>
                    ))}
                    <div ref={chatEndRef} />
                  </div>
                )}
              </div>

              {/* Message Input */}
              <div className="border-t border-gray-200 p-4 bg-white">
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                    placeholder="Type your message..."
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                    disabled={isSendingMessage}
                  />
                  <button
                    onClick={sendMessage}
                    disabled={!newMessage.trim() || isSendingMessage}
                    className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <PaperAirplaneIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
