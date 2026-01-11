'use client';

// Force dynamic rendering
export const dynamic = 'force-dynamic'

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { getAuth, verifyPasswordResetCode, confirmPasswordReset } from 'firebase/auth';
import { firebaseApp } from '@/lib/firebase/client';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Icons } from '@/components/ui/icons';

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [email, setEmail] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isVerifying, setIsVerifying] = useState(true);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const oobCode = searchParams.get('oobCode');

    if (!oobCode) {
      setError('Missing password reset code.');
      setIsVerifying(false);
      return;
    }

    // Verify the password reset code is valid
    const verifyCode = async () => {
      try {
        const auth = getAuth(firebaseApp);
        const email = await verifyPasswordResetCode(auth, oobCode);
        setEmail(email);
        setIsVerifying(false);
      } catch (error: any) {
        console.error('Error verifying reset code:', error);
        setError(error.message || 'Invalid or expired reset code.');
        setIsVerifying(false);
      }
    };

    verifyCode();
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    const oobCode = searchParams.get('oobCode');
    if (!oobCode) {
      setError('Missing password reset code.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setIsLoading(true);
    try {
      const auth = getAuth(firebaseApp);
      await confirmPasswordReset(auth, oobCode, password);
      setSuccess(true);
      
      // Redirect to login after a short delay
      setTimeout(() => {
        router.push('/auth/login');
      }, 3000);
    } catch (error: any) {
      console.error('Error resetting password:', error);
      setError(error.message || 'Failed to reset password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isVerifying) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="max-w-md w-full bg-white shadow-md rounded-lg p-8 text-center">
          <h1 className="text-2xl font-bold mb-4">Verifying Reset Code</h1>
          <p className="text-gray-600 mb-4">Please wait while we verify your password reset code...</p>
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error && !email) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="max-w-md w-full bg-white shadow-md rounded-lg p-8 text-center">
          <h1 className="text-2xl font-bold mb-4 text-red-600">Reset Code Error</h1>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button 
            onClick={() => router.push('/auth/login')}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Return to Login
          </Button>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="max-w-md w-full bg-white shadow-md rounded-lg p-8 text-center">
          <h1 className="text-2xl font-bold mb-4 text-green-600">Password Reset Successful!</h1>
          <p className="text-gray-600 mb-4">
            Your password has been successfully reset. You will be redirected to the login page shortly.
          </p>
          <Button 
            onClick={() => router.push('/auth/login')}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Go to Login
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="max-w-md w-full bg-white shadow-md rounded-lg p-8">
        <h1 className="text-2xl font-bold mb-4 text-center">Reset Your Password</h1>
        <p className="text-gray-600 mb-4 text-center">
          {email ? `Enter a new password for ${email}` : 'Enter a new password for your account'}
        </p>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="password">New Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your new password"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <Input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm your new password"
              required
            />
          </div>
          
          {error && (
            <p className="text-red-500 text-sm">{error}</p>
          )}
          
          <Button 
            type="submit" 
            className="w-full"
            disabled={isLoading}
          >
            {isLoading && <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />}
            Reset Password
          </Button>
        </form>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ResetPasswordContent />
    </Suspense>
  );
} 