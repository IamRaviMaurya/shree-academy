import React, { useState } from 'react';
import { LoginCredentials } from '../types';
import { useAuth } from '../hooks/useAuth';
import { TEACHERS } from '../utils/auth';
import { Card } from './Card';
import { Input } from './Input';
import { Button } from './Button';
import { ToastContainer } from './Toast';
import { useToast } from '../hooks/useToast';

export const Login: React.FC = () => {
  const { login } = useAuth();
  const { toasts, addToast, removeToast } = useToast();
  const [credentials, setCredentials] = useState<LoginCredentials>({
    username: '',
    password: '',
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (field: keyof LoginCredentials, value: string) => {
    setCredentials(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate loading delay
    setTimeout(() => {
      const success = login(credentials);
      if (success) {
        addToast('Login successful! Welcome back.', 'success');
      } else {
        addToast('Invalid username or password!', 'error');
      }
      setIsLoading(false);
    }, 500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-primary-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl text-white font-bold">SA</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Shree Academy</h1>
          <p className="text-gray-600">Teacher Login Portal</p>
        </div>

        {/* Login Form */}
        <Card className="shadow-xl">
          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              <Input
                label="Username"
                placeholder="Enter your username"
                value={credentials.username}
                onChange={(e) => handleInputChange('username', e.target.value)}
                required
                autoComplete="username"
              />

              <Input
                label="Password"
                type="password"
                placeholder="Enter your password"
                value={credentials.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                required
                autoComplete="current-password"
              />

              <Button
                type="submit"
                variant="primary"
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? 'Logging in...' : 'Login'}
              </Button>
            </div>
          </form>
        </Card>

        {/* Teacher Credentials Info */}
        {/* <Card className="mt-6 bg-gray-50 border-gray-200">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Available Teacher Accounts:</h3>
          <div className="space-y-2 text-xs">
            {TEACHERS.map((teacher) => (
              <div key={teacher.id} className="flex justify-between items-center p-2 bg-white rounded border">
                <div>
                  <span className="font-medium text-gray-800">{teacher.name}</span>
                  <span className="text-gray-500 ml-2">({teacher.subject})</span>
                </div>
                <div className="text-gray-600">
                  <div>Username: <code className="bg-gray-100 px-1 rounded">{teacher.username}</code></div>
                  <div>Password: <code className="bg-gray-100 px-1 rounded">{teacher.password}</code></div>
                </div>
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-500 mt-3 text-center">
            ⚠️ Demo credentials - Use these to test different teacher accounts
          </p>
        </Card> */}

        <ToastContainer toasts={toasts} onRemove={removeToast} />
      </div>
    </div>
  );
};