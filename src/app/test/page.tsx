'use client'

import { useState } from 'react'
import api from '@/lib/axios'

export default function TestPage() {
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const testLogin = async () => {
    setLoading(true)
    try {
      const response = await api.post('/auth/login', {
        email: 'employer1@company.com',
        password: process.env.NEXT_PUBLIC_TEST_PASSWORD || 'password123'
      })
      setResult({ success: true, data: response.data })
    } catch (error: any) {
      setResult({ success: false, error: error.message })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">API Test Page</h1>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <button
            onClick={testLogin}
            disabled={loading}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Testing...' : 'Test Login'}
          </button>
          
          {result && (
            <div className="mt-4 p-4 bg-gray-50 rounded">
              <h3 className="font-semibold mb-2">Result:</h3>
              <pre className="text-sm overflow-auto">
                {JSON.stringify(result, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
