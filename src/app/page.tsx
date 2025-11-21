'use client'

import { useEffect } from 'react'
import { useAuthStore } from '@/store/authStore'
import { useRouter } from 'next/navigation'
import LoginForm from '@/components/LoginForm'
import RegisterForm from '@/components/RegisterForm'
import ThemeToggle from '@/components/ThemeToggle'

export default function HomePage() {
  const { user } = useAuthStore()
  const router = useRouter()

  useEffect(() => {
    if (user) {
      if (user.userType === 'EMPLOYER') {
        router.push('/employer/dashboard')
      } else if (user.userType === 'RECRUITER') {
        router.push('/recruiter/dashboard')
      } else if (user.userType === 'ADMIN') {
        router.push('/admin/dashboard')
      }
    }
  }, [user, router])

  if (user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
        {/* Theme Toggle */}
        <div className="absolute top-4 right-4">
          <ThemeToggle />
        </div>
        
        {/* Header */}
        <div className="sm:mx-auto sm:w-full sm:max-w-md mb-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
              Recruiter Platform
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              Connect employers with recruiters
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">
              Streamline your recruitment process
            </p>
          </div>
        </div>

        {/* Login/Register Card */}
        <div className="sm:mx-auto sm:w-full sm:max-w-lg">
          <div className="bg-white dark:bg-gray-800 shadow-xl rounded-2xl p-8 sm:p-10">
            <div className="space-y-8">
              <LoginForm />
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200 dark:border-gray-600" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 font-medium">Or</span>
                </div>
              </div>
              <RegisterForm />
            </div>
          </div>
        </div>

        {/* Test Accounts Info */}
        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-lg">
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-4">Test Accounts</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-blue-100 dark:border-blue-800">
                <div className="font-medium text-blue-800 dark:text-blue-200 mb-1">Employer</div>
                <div className="text-blue-600 dark:text-blue-300">employer1@company.com</div>
                <div className="text-gray-600 dark:text-gray-300">password123</div>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-blue-100 dark:border-blue-800">
                <div className="font-medium text-blue-800 dark:text-blue-200 mb-1">Recruiter</div>
                <div className="text-blue-600 dark:text-blue-300">recruiter1@agency.com</div>
                <div className="text-gray-600 dark:text-gray-300">password123</div>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-blue-100 dark:border-blue-800">
                <div className="font-medium text-blue-800 dark:text-blue-200 mb-1">Admin</div>
                <div className="text-blue-600 dark:text-blue-300">admin@platform.com</div>
                <div className="text-gray-600 dark:text-gray-300">password123</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
