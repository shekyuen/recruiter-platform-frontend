'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useAuthStore } from '@/store/authStore'
import { useRouter } from 'next/navigation'
import api from '@/lib/axios'
import toast from 'react-hot-toast'

interface RegisterData {
  email: string
  password: string
  confirmPassword: string
  firstName: string
  lastName: string
  userType: string
}

export default function RegisterForm() {
  const { login } = useAuthStore()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch
  } = useForm<RegisterData>()

  const onSubmit = async (data: RegisterData) => {
    setIsLoading(true)
    try {
      const response = await api.post('/auth/register', data)
      const { token, user } = response.data
      
      login(token, user)
      toast.success('Registration successful!')
      
      // Redirect based on user type
      if (user.userType === 'EMPLOYER') {
        router.push('/employer/dashboard')
      } else if (user.userType === 'RECRUITER') {
        router.push('/recruiter/dashboard')
      } else if (user.userType === 'ADMIN') {
        router.push('/admin/dashboard')
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Registration failed')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Create your account</h2>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              First Name
            </label>
            <input
              {...register('firstName', { required: 'First name is required' })}
              type="text"
              className="input-field"
              placeholder="John"
            />
            {errors.firstName && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.firstName.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Last Name
            </label>
            <input
              {...register('lastName', { required: 'Last name is required' })}
              type="text"
              className="input-field"
              placeholder="Doe"
            />
            {errors.lastName && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.lastName.message}</p>
            )}
          </div>
        </div>

        <div>
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
            className="input-field"
            placeholder="john@example.com"
          />
          {errors.email && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.email.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="userType" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Account Type
          </label>
          <select
            {...register('userType', { required: 'Account type is required' })}
            className="input-field"
          >
            <option value="">Select account type</option>
            <option value="EMPLOYER">Employer</option>
            <option value="RECRUITER">Recruiter</option>
          </select>
          {errors.userType && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.userType.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Password
          </label>
          <input
            {...register('password', { 
              required: 'Password is required',
              minLength: {
                value: 6,
                message: 'Password must be at least 6 characters'
              }
            })}
            type="password"
            className="input-field"
            placeholder="Enter your password"
          />
          {errors.password && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.password.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Confirm Password
          </label>
          <input
            {...register('confirmPassword', { 
              required: 'Please confirm your password',
              validate: value => value === watch('password') || 'Passwords do not match'
            })}
            type="password"
            className="input-field"
            placeholder="Confirm your password"
          />
          {errors.confirmPassword && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.confirmPassword.message}</p>
          )}
        </div>

        <div>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Creating account...' : 'Create account'}
          </button>
        </div>
      </form>
    </div>
  )
}
