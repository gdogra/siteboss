import React, { useState, useEffect } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { 
  EnvelopeIcon, 
  CheckCircleIcon, 
  ExclamationTriangleIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import { supabase } from '../../services/supabase';

const EmailConfirmation: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'checking' | 'success' | 'error' | 'waiting'>('checking');
  const [message, setMessage] = useState('');
  const [email, setEmail] = useState('');
  const [resending, setResending] = useState(false);

  // Check if this is a confirmation callback
  const token = searchParams.get('token');
  const type = searchParams.get('type');
  const emailFromUrl = searchParams.get('email');

  useEffect(() => {
    const handleEmailConfirmation = async () => {
      if (token && type === 'signup') {
        try {
          // Handle the confirmation token
          const { error } = await supabase.auth.verifyOtp({
            token_hash: token,
            type: 'email'
          });

          if (error) {
            setStatus('error');
            setMessage('Invalid or expired confirmation link. Please request a new one.');
          } else {
            setStatus('success');
            setMessage('Email confirmed successfully! You can now sign in to your account.');
            // Redirect to login after 3 seconds
            setTimeout(() => {
              navigate('/login');
            }, 3000);
          }
        } catch (error) {
          setStatus('error');
          setMessage('An error occurred while confirming your email.');
        }
      } else if (emailFromUrl) {
        // This is a pending confirmation page
        setStatus('waiting');
        setEmail(emailFromUrl);
        setMessage(`We've sent a confirmation email to ${emailFromUrl}. Please check your inbox and click the confirmation link.`);
      } else {
        // No valid parameters
        setStatus('error');
        setMessage('Invalid confirmation link.');
      }
    };

    handleEmailConfirmation();
  }, [token, type, emailFromUrl, navigate]);

  const handleResendConfirmation = async () => {
    if (!email) return;

    setResending(true);
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email,
        options: {
          emailRedirectTo: `${window.location.origin}/email-confirmation`
        }
      });

      if (error) {
        setMessage('Failed to resend confirmation email. Please try again.');
      } else {
        setMessage('Confirmation email sent! Please check your inbox.');
      }
    } catch (error) {
      setMessage('An error occurred while resending the confirmation email.');
    } finally {
      setResending(false);
    }
  };

  const renderContent = () => {
    switch (status) {
      case 'checking':
        return (
          <div className="text-center">
            <ArrowPathIcon className="mx-auto h-12 w-12 text-primary-600 animate-spin" />
            <h2 className="mt-4 text-2xl font-bold text-gray-900">Verifying your email...</h2>
            <p className="mt-2 text-gray-600">Please wait while we confirm your email address.</p>
          </div>
        );

      case 'success':
        return (
          <div className="text-center">
            <CheckCircleIcon className="mx-auto h-12 w-12 text-green-600" />
            <h2 className="mt-4 text-2xl font-bold text-gray-900">Email Confirmed!</h2>
            <p className="mt-2 text-gray-600">{message}</p>
            <div className="mt-6">
              <Link
                to="/login"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                Go to Sign In
              </Link>
            </div>
          </div>
        );

      case 'waiting':
        return (
          <div className="text-center">
            <EnvelopeIcon className="mx-auto h-12 w-12 text-blue-600" />
            <h2 className="mt-4 text-2xl font-bold text-gray-900">Check Your Email</h2>
            <p className="mt-2 text-gray-600">{message}</p>
            
            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <div className="flex">
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-blue-800">
                    What to do next:
                  </h3>
                  <div className="mt-2 text-sm text-blue-700">
                    <ul className="list-disc list-inside space-y-1">
                      <li>Check your email inbox for a message from SiteBoss</li>
                      <li>Click the confirmation link in the email</li>
                      <li>If you don't see it, check your spam/junk folder</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={handleResendConfirmation}
                disabled={resending}
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
              >
                {resending ? (
                  <ArrowPathIcon className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <EnvelopeIcon className="h-4 w-4 mr-2" />
                )}
                {resending ? 'Resending...' : 'Resend Email'}
              </button>
              
              <Link
                to="/register"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                Back to Registration
              </Link>
            </div>
          </div>
        );

      case 'error':
        return (
          <div className="text-center">
            <ExclamationTriangleIcon className="mx-auto h-12 w-12 text-red-600" />
            <h2 className="mt-4 text-2xl font-bold text-gray-900">Confirmation Failed</h2>
            <p className="mt-2 text-gray-600">{message}</p>
            <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                to="/register"
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                Back to Registration
              </Link>
              <Link
                to="/login"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                Go to Sign In
              </Link>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="mx-auto h-12 w-auto flex items-center justify-center">
            <h1 className="text-3xl font-bold text-primary-600">SiteBoss</h1>
          </div>
        </div>
        
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default EmailConfirmation;