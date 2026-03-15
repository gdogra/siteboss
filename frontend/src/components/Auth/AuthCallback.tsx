import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../services/supabase';
import { User } from '../../types';

const AuthCallback: React.FC = () => {
  const navigate = useNavigate();
  const { updateUser } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          throw new Error(error.message);
        }

        if (data.session?.user) {
          // Convert Supabase user to our User interface
          const userData: User = {
            id: data.session.user.id,
            email: data.session.user.email || '',
            first_name: data.session.user.user_metadata?.first_name || 
                        data.session.user.user_metadata?.full_name?.split(' ')[0] || 
                        'User',
            last_name: data.session.user.user_metadata?.last_name || 
                       data.session.user.user_metadata?.full_name?.split(' ').slice(1).join(' ') || 
                       '',
            role: data.session.user.user_metadata?.role || 'company_admin',
            company_id: data.session.user.user_metadata?.company_id || `company-${Date.now()}`,
            phone: data.session.user.user_metadata?.phone,
            email_verified: true,
            avatar_url: data.session.user.user_metadata?.avatar_url
          };

          updateUser(userData);
          localStorage.setItem('siteboss_user', JSON.stringify(userData));
          localStorage.setItem('siteboss_token', 'google-oauth-token');
          
          // Redirect to dashboard
          navigate('/dashboard', { replace: true });
        } else {
          throw new Error('No user session found');
        }
      } catch (err: any) {
        console.error('Auth callback error:', err);
        setError(err.message || 'Authentication failed');
        // Redirect to login with error
        setTimeout(() => {
          navigate('/login', { replace: true });
        }, 3000);
      } finally {
        setIsLoading(false);
      }
    };

    handleAuthCallback();
  }, [navigate, updateUser]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
              Authentication Error
            </h2>
            <p className="mt-2 text-sm text-red-600">{error}</p>
            <p className="mt-2 text-sm text-gray-600">
              Redirecting to login page...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            {isLoading ? 'Completing sign in...' : 'Sign in successful!'}
          </h2>
          {isLoading && (
            <div className="mt-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
            </div>
          )}
          <p className="mt-2 text-sm text-gray-600">
            {isLoading ? 'Please wait while we complete your authentication.' : 'Redirecting to dashboard...'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthCallback;