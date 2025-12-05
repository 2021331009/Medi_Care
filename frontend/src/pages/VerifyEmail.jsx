import React, { useContext, useEffect, useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { AppContext } from '../context/AppContext'
import { toast } from 'react-toastify'

const VerifyEmail = () => {
  const { backendUrl } = useContext(AppContext)
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()

  const [status, setStatus] = useState('checking')
  const [message, setMessage] = useState('Validating your verification link...')

  useEffect(() => {
    const token = searchParams.get('token')

    const verify = async () => {
      if (!token) {
        setStatus('error')
        setMessage('Missing verification token. Please use the link from your email.')
        return
      }

      try {
        const { data } = await axios.get(`${backendUrl}/api/user/verify-email`, {
          params: { token }
        })

        if (data.success) {
          setStatus('success')
          setMessage(data.message || 'Email verified successfully.')
          toast.success('Email verified. You can now log in.')
        } else {
          setStatus('error')
          setMessage(data.message || 'Verification link is invalid or expired.')
        }
      } catch (error) {
        setStatus('error')
        setMessage(error.response?.data?.message || 'Verification failed. Please try again.')
      }
    }

    verify()
  }, [backendUrl, searchParams])

  const handleBackToLogin = () => {
    navigate('/login')
  }

  const statusStyles = {
    checking: 'text-teal-600 bg-teal-50 border border-teal-100',
    success: 'text-green-600 bg-green-50 border border-green-100',
    error: 'text-red-600 bg-red-50 border border-red-100'
  }

  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="max-w-lg w-full bg-white shadow-lg rounded-xl p-8 text-center space-y-6">
        <div className={`p-4 rounded-lg ${statusStyles[status]}`}>
          <p className="font-semibold">{message}</p>
          {status === 'checking' && <p className="text-sm mt-2">Hang tight while we confirm your Gmail address.</p>}
        </div>

        <div className="space-y-4">
          {status === 'success' && (
            <p className="text-gray-600">You can now sign in with your verified Gmail account.</p>
          )}
          {status === 'error' && (
            <p className="text-gray-600">
              Need a new link? Go back to the login page and register again to receive another verification email.
            </p>
          )}
          <button
            onClick={handleBackToLogin}
            className="w-full bg-teal-600 text-white py-2 rounded-md hover:bg-teal-700 transition-colors cursor-pointer"
          >
            Back to Login
          </button>
        </div>
      </div>
    </div>
  )
}

export default VerifyEmail

