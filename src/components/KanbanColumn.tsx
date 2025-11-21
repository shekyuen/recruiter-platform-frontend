'use client'

import { Draggable } from '@hello-pangea/dnd'
import CandidateCard from './CandidateCard'

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

interface Column {
  id: string
  title: string
  color: string
  submissions: CandidateSubmission[]
}

interface KanbanColumnProps {
  column: Column
  jobId: string
  onSubmissionUpdate: (submissions: CandidateSubmission[]) => void
}

export default function KanbanColumn({ column, jobId, onSubmissionUpdate }: KanbanColumnProps) {
  const getColumnIcon = (columnId: string) => {
    switch (columnId) {
      case 'inbox':
        return '📥'
      case 'reviewing':
        return '👀'
      case 'interviewing':
        return '🎥'
      case 'offer':
        return '💰'
      case 'rejected':
        return '❌'
      default:
        return '📋'
    }
  }

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <span className="text-lg">{getColumnIcon(column.id)}</span>
          <h3 className="font-semibold text-gray-900 dark:text-white">{column.title}</h3>
        </div>
        <span className="bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs font-medium px-2 py-1 rounded-full">
          {column.submissions.length}
        </span>
      </div>

      <div className="space-y-3 min-h-[200px]">
        {column.submissions
          .sort((a, b) => new Date(a.submittedAt).getTime() - new Date(b.submittedAt).getTime())
          .map((submission, index) => (
            <Draggable key={submission.id} draggableId={submission.id} index={index}>
              {(provided, snapshot) => (
                <div
                  ref={provided.innerRef}
                  {...provided.draggableProps}
                  {...provided.dragHandleProps}
                  className={`transition-transform ${
                    snapshot.isDragging ? 'rotate-2 scale-105' : ''
                  }`}
                >
                  <CandidateCard
                    submission={submission}
                    jobId={jobId}
                    columnId={column.id}
                    onSubmissionUpdate={onSubmissionUpdate}
                  />
                </div>
              )}
            </Draggable>
          ))}
        
        {column.submissions.length === 0 && (
          <div className="text-center py-8 text-gray-400 dark:text-gray-500">
            <div className="text-4xl mb-2">{getColumnIcon(column.id)}</div>
            <p className="text-sm">No candidates in this stage</p>
          </div>
        )}
      </div>
    </div>
  )
}
