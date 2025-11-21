'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useAuthStore } from '@/store/authStore'
import { useRouter } from 'next/navigation'
import api from '@/lib/axios'
import toast from 'react-hot-toast'

interface LoginData {
  email: string
  password: string
}

export default function LoginForm() {
  const { login } = useAuthStore()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<LoginData>()

  const onSubmit = async (data: LoginData) => {
    setIsLoading(true)
    console.log('Attempting login with:', data)
    try {
      const response = await api.post('/auth/login', data)
      console.log('Login response:', response.data)
      const { token, user } = response.data
      
      login(token, user)
      toast.success('Login successful!')
      
      // Redirect based on user type
      if (user.userType === 'EMPLOYER') {
        router.push('/employer/dashboard')
      } else if (user.userType === 'RECRUITER') {
        router.push('/recruiter/dashboard')
      } else if (user.userType === 'ADMIN') {
        router.push('/admin/dashboard')
      }
    } catch (error: any) {
      console.error('Login error:', error)
      toast.error(error.response?.data?.message || 'Login failed')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div>
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Sign in to your account</h2>
        <p className="text-gray-600 dark:text-gray-300">Access your recruitment dashboard</p>
      </div>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-2">
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Email address
          </label>
          <input
            {...register('email', { 
              required: 'Email is required',
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: 'Invalid email address'
              }
            })}
            type="email"
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
            placeholder="Enter your email"
          />
          {errors.email && (
            <p className="text-sm text-red-600 dark:text-red-400">{errors.email.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Password
          </label>
          <input
            {...register('password', { required: 'Password is required' })}
            type="password"
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
            placeholder="Enter your password"
          />
          {errors.password && (
            <p className="text-sm text-red-600 dark:text-red-400">{errors.password.message}</p>
          )}
        </div>

        <div className="pt-4 space-y-3">
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Signing in...</span>
              </>
            ) : (
              <span>Sign in</span>
            )}
          </button>
          
          {/* Test Login Buttons */}
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => onSubmit({ email: 'employer1@company.com', password: process.env.NEXT_PUBLIC_TEST_PASSWORD || 'password123' })}
              className="text-xs bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 py-2 px-2 rounded text-center"
            >
              Test Employer
            </button>
            <button
              type="button"
              onClick={() => onSubmit({ email: 'recruiter1@agency.com', password: process.env.NEXT_PUBLIC_TEST_PASSWORD || 'password123' })}
              className="text-xs bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 py-2 px-2 rounded text-center"
            >
              Test Recruiter
            </button>
            <button
              type="button"
              onClick={() => onSubmit({ email: 'admin@platform.com', password: process.env.NEXT_PUBLIC_TEST_PASSWORD || 'password123' })}
              className="text-xs bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 py-2 px-2 rounded text-center"
            >
              Test Admin
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}
