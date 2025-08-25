# Email Confirmation Setup Guide

## Overview
This guide explains how to configure email confirmation for user registration in SiteBoss using Supabase.

## Implementation Status
✅ **Completed:**
- Email confirmation flow implemented in the frontend
- Registration process updated to require email verification
- Email confirmation page with proper UX
- Resend email functionality
- Route protection and user flow

## Supabase Configuration Required

### 1. Email Settings in Supabase Dashboard

To enable email confirmation, you need to configure the following settings in your Supabase project dashboard:

#### Authentication Settings:
1. Go to **Authentication > Settings** in your Supabase dashboard
2. Under **Email Auth**, ensure the following settings:
   - ✅ **Enable email confirmations** - Turn this ON
   - ✅ **Confirm email** - Set to "Required"
   - ✅ **Enable email change confirmations** - Optional but recommended

#### Email Templates:
1. Go to **Authentication > Email Templates**
2. Customize the **Confirm signup** template:
   ```html
   <h2>Confirm your signup</h2>
   
   <p>Follow this link to confirm your account:</p>
   
   <p><a href="{{ .ConfirmationURL }}">Confirm your account</a></p>
   
   <p>If you didn't sign up for SiteBoss, you can safely ignore this email.</p>
   ```

#### URL Configuration:
1. In **Authentication > URL Configuration**, add your domain:
   - **Site URL**: `https://your-domain.com` (or `http://localhost:3000` for development)
   - **Additional Redirect URLs**: Add your confirmation URL:
     - `https://your-domain.com/email-confirmation`
     - `http://localhost:3000/email-confirmation` (for development)

### 2. SMTP Configuration (Optional but Recommended)

By default, Supabase uses their email service, but for production, you should configure your own SMTP:

1. Go to **Authentication > Settings**
2. Under **SMTP Settings**:
   - **SMTP Host**: Your SMTP server (e.g., `smtp.sendgrid.net`)
   - **SMTP Port**: Usually 587 or 465
   - **SMTP User**: Your SMTP username
   - **SMTP Pass**: Your SMTP password
   - **SMTP Admin Email**: Your admin email
   - **SMTP Sender Name**: "SiteBoss" or your company name

### 3. Rate Limiting

Configure rate limiting to prevent abuse:
- **Email Rate Limit**: 3-5 emails per hour per IP
- **SMS Rate Limit**: Not applicable for email confirmation

## Frontend Implementation Details

### Registration Flow:
1. User fills out registration form
2. Form submits to Supabase auth
3. User is redirected to `/email-confirmation?email=user@example.com`
4. Confirmation page displays instructions
5. User clicks link in email
6. Supabase processes confirmation and redirects to `/email-confirmation?token=...&type=signup`
7. Frontend verifies token and redirects to login

### Key Components:
- `RegisterForm.tsx` - Updated to redirect to email confirmation
- `EmailConfirmation.tsx` - Handles confirmation flow and token verification
- `AuthContext.tsx` - Modified registration to not auto-login users
- `supabase.ts` - Updated with email redirect URL support

### Security Features:
- Users cannot access the dashboard until email is confirmed
- Confirmation tokens have expiration
- Resend functionality with rate limiting
- Clear error handling for expired/invalid tokens

## Environment Variables

Ensure your `.env` file has:
```
REACT_APP_SUPABASE_URL=your_supabase_url
REACT_APP_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Testing the Flow

### Development Testing:
1. Register a new account
2. Check your email for confirmation
3. Click the confirmation link
4. Verify redirection to login page

### Production Checklist:
- [ ] SMTP configured with your domain
- [ ] Email templates customized with your branding
- [ ] Redirect URLs configured for your domain
- [ ] SSL certificate installed
- [ ] Email deliverability tested
- [ ] Rate limiting configured appropriately

## Troubleshooting

### Common Issues:

1. **Emails not sending:**
   - Check SMTP configuration
   - Verify email templates are enabled
   - Check Supabase logs for errors

2. **Confirmation links not working:**
   - Verify redirect URLs in Supabase settings
   - Check that email templates use `{{ .ConfirmationURL }}`
   - Ensure frontend route `/email-confirmation` exists

3. **Users getting signed in before confirmation:**
   - Check that "Confirm email" is set to "Required"
   - Verify frontend doesn't auto-login after registration

### Support:
- Check Supabase documentation: https://supabase.com/docs/guides/auth/auth-email
- Supabase community: https://github.com/supabase/supabase/discussions

## Next Steps

1. **Configure Supabase settings** as described above
2. **Test the flow** in your development environment
3. **Customize email templates** with your branding
4. **Set up production SMTP** for reliable delivery
5. **Monitor email delivery** and user activation rates

This completes the email confirmation implementation for SiteBoss user registration.