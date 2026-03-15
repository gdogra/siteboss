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
          const user = data.session.user;
          const isNewUser = user.created_at === user.last_sign_in_at;
          
          // Extract name from Google profile
          const fullName = user.user_metadata?.full_name || user.user_metadata?.name || '';
          const nameParts = fullName.split(' ');
          const firstName = user.user_metadata?.first_name || nameParts[0] || 'User';
          const lastName = user.user_metadata?.last_name || nameParts.slice(1).join(' ') || '';
          
          // Convert Supabase user to our User interface
          const userData: User = {
            id: user.id,
            email: user.email || '',
            first_name: firstName,
            last_name: lastName,
            role: user.user_metadata?.role || 'company_admin',
            company_id: user.user_metadata?.company_id || `company-${Date.now()}`,
            phone: user.user_metadata?.phone,
            email_verified: true,
            avatar_url: user.user_metadata?.avatar_url || user.user_metadata?.picture
          };

          // If this is a new user from Google signup, we should create their company record
          if (isNewUser) {
            try {
              // Create a company record for the new user
              const companyName = `${firstName} ${lastName}'s Company`;
              const { data: companyData, error: companyError } = await supabase
                .from('companies')
                .insert({
                  id: userData.company_id,
                  name: companyName,
                  email: userData.email
                })
                .select()
                .single();

              if (companyError) {
                console.warn('Could not create company record:', companyError);
                // Continue anyway - the user can update company info later
              }

              // Create user profile record
              const { error: profileError } = await supabase
                .from('users')
                .insert({
                  id: userData.id,
                  company_id: userData.company_id,
                  email: userData.email,
                  first_name: userData.first_name,
                  last_name: userData.last_name,
                  role: userData.role,
                  avatar_url: userData.avatar_url,
                  is_active: true
                });

              if (profileError) {
                console.warn('Could not create user profile:', profileError);
                // Continue anyway - basic auth still works
              }
            } catch (err) {
              console.warn('Error setting up new user profile:', err);
              // Continue anyway - user can complete setup later
            }
          }

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