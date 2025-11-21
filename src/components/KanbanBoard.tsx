'use client'

import { useState } from 'react'
import KanbanColumn from './KanbanColumn'
import { DragDropContext, Droppable } from '@hello-pangea/dnd'

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

interface KanbanBoardProps {
  jobId: string
  submissions: CandidateSubmission[]
  onSubmissionUpdate: (submissions: CandidateSubmission[]) => void
}

interface Column {
  id: string
  title: string
  color: string
  submissions: CandidateSubmission[]
}

export default function KanbanBoard({ jobId, submissions, onSubmissionUpdate }: KanbanBoardProps) {
  const [columns, setColumns] = useState<Column[]>([
    {
      id: 'inbox',
      title: 'Inbox',
      color: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800',
      submissions: submissions.filter(s => s.status === 'SUBMITTED')
    },
    {
      id: 'reviewing',
      title: 'Reviewing',
      color: 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800',
      submissions: submissions.filter(s => s.status === 'REVIEWING')
    },
    {
      id: 'interviewing',
      title: 'Interviewing',
      color: 'bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800',
      submissions: submissions.filter(s => s.status === 'INTERVIEWING')
    },
    {
      id: 'offer',
      title: 'Offer',
      color: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800',
      submissions: submissions.filter(s => s.status === 'OFFER')
    },
    {
      id: 'rejected',
      title: 'Rejected',
      color: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800',
      submissions: submissions.filter(s => s.status === 'REJECTED')
    }
  ])

  const handleDragEnd = async (result: any) => {
    const { destination, source, draggableId } = result

    if (!destination) return

    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return
    }

    const newColumns = [...columns]
    const sourceColumn = newColumns.find(col => col.id === source.droppableId)
    const destColumn = newColumns.find(col => col.id === destination.droppableId)

    if (!sourceColumn || !destColumn) return

    const submission = sourceColumn.submissions.find(s => s.id === draggableId)
    if (!submission) return

    // Remove from source column
    sourceColumn.submissions = sourceColumn.submissions.filter(s => s.id !== draggableId)
    
    // Add to destination column
    destColumn.submissions.splice(destination.index, 0, submission)

    // Update submission status
    const newStatus = destColumn.id.toUpperCase()
    submission.status = newStatus

    // Update local state
    setColumns(newColumns)
    
    // Update all submissions
    const allSubmissions = newColumns.flatMap(col => col.submissions)
    onSubmissionUpdate(allSubmissions)

    // Update backend
    try {
      await fetch(`/api/submissions/${draggableId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus })
      })
    } catch (error) {
      console.error('Failed to update submission status:', error)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Candidate Pipeline</h2>
        <div className="text-sm text-gray-500 dark:text-gray-400">
          Total: {submissions.length} candidates
        </div>
      </div>

      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {columns.map((column) => (
            <Droppable key={column.id} droppableId={column.id}>
              {(provided, snapshot) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className={`rounded-lg border-2 border-dashed transition-colors ${
                    snapshot.isDraggingOver 
                      ? 'border-primary-400 bg-primary-50' 
                      : column.color
                  }`}
                >
                  <KanbanColumn
                    column={column}
                    jobId={jobId}
                    onSubmissionUpdate={onSubmissionUpdate}
                  />
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          ))}
        </div>
      </DragDropContext>
    </div>
  )
}
