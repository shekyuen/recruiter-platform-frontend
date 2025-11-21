'use client'

import { useState, useEffect } from 'react'
import { useAuthStore } from '@/store/authStore'
import { useRouter } from 'next/navigation'
import api from '@/lib/axios'
import ThemeToggle from '@/components/ThemeToggle'

export default function AdminDashboard() {
  const { user, logout } = useAuthStore()
  const router = useRouter()
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalJobs: 0,
    totalSubmissions: 0,
    totalOffers: 0
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!user || user.userType !== 'ADMIN') {
      router.push('/')
      return
    }
    fetchStats()
  }, [user, router])

  const fetchStats = async () => {
    try {
      // For now, we'll use mock data since we don't have admin endpoints yet
      setStats({
        totalUsers: 15,
        totalJobs: 8,
        totalSubmissions: 23,
        totalOffers: 5
      })
    } catch (error) {
      console.error('Failed to fetch stats:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (!user || user.userType !== 'ADMIN') {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Admin Dashboard</h1>
              <p className="text-gray-600 dark:text-gray-300">Platform Overview</p>
            </div>
            <div className="flex items-center space-x-4">
              <ThemeToggle />
              <button
                onClick={logout}
                className="btn-secondary"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center">
                      <span className="text-white font-bold">U</span>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Total Users</dt>
                      <dd className="text-lg font-medium text-gray-900">{stats.totalUsers}</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-green-500 rounded-md flex items-center justify-center">
                      <span className="text-white font-bold">J</span>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Total Jobs</dt>
                      <dd className="text-lg font-medium text-gray-900">{stats.totalJobs}</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-yellow-500 rounded-md flex items-center justify-center">
                      <span className="text-white font-bold">S</span>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Submissions</dt>
                      <dd className="text-lg font-medium text-gray-900">{stats.totalSubmissions}</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-purple-500 rounded-md flex items-center justify-center">
                      <span className="text-white font-bold">O</span>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Total Offers</dt>
                      <dd className="text-lg font-medium text-gray-900">{stats.totalOffers}</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button className="btn-primary">
                Manage Users
              </button>
              <button className="btn-secondary">
                View All Jobs
              </button>
              <button className="btn-secondary">
                Platform Settings
              </button>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white shadow rounded-lg p-6 mt-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Recent Activity</h2>
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span className="text-sm text-gray-600">New job posted by TechCorp</span>
                <span className="text-xs text-gray-400">2 hours ago</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                <span className="text-sm text-gray-600">Candidate submission received</span>
                <span className="text-xs text-gray-400">4 hours ago</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                <span className="text-sm text-gray-600">New recruiter registered</span>
                <span className="text-xs text-gray-400">6 hours ago</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
