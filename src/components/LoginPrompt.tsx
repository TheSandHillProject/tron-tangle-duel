
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useUserContext } from '@/context/UserContext';
import { Loader2 } from 'lucide-react';

interface LoginPromptProps {
  onComplete?: () => void;
}

const LoginPrompt: React.FC<LoginPromptProps> = ({ onComplete }) => {
  const { login } = useUserContext();
  const [email, setEmail] = useState('');
  const [screenName, setScreenName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setError('Email cannot be empty');
      return;
    }
    
    if (!screenName.trim()) {
      setError('Screen name cannot be empty');
      return;
    }
    
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setError('Please enter a valid email address');
      return;
    }
    
    setIsSubmitting(true);
    setError(null);
    
    try {
      await login(email.trim(), screenName.trim());
      if (onComplete) {
        // Small delay to ensure state is updated before calling onComplete
        setTimeout(() => {
          onComplete();
        }, 100);
      }
    } catch (err) {
      let errorMessage = 'Failed to log in. Please try again.';
      if (err instanceof Error) {
        errorMessage = err.message;
      }
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="glass-panel rounded-xl p-6 max-w-md w-full mx-auto animate-game-fade-in">
      <h2 className="text-xl font-bold text-center mb-6 bg-clip-text text-transparent bg-gradient-to-r from-tron-blue to-tron-glow">
        JOIN THE GRID
      </h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-tron-text mb-1">
            Email
          </label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="bg-black/40 border-tron-blue/30 text-tron-text w-full"
            disabled={isSubmitting}
          />
        </div>
        
        <div>
          <label htmlFor="screenName" className="block text-sm font-medium text-tron-text mb-1">
            Screen Name
          </label>
          <Input
            id="screenName"
            type="text"
            value={screenName}
            onChange={(e) => setScreenName(e.target.value)}
            placeholder="YourGameTag"
            className="bg-black/40 border-tron-blue/30 text-tron-text w-full"
            maxLength={20}
            disabled={isSubmitting}
          />
        </div>
        
        {error && (
          <div className="p-3 bg-red-900/30 border border-red-500/50 rounded-md text-red-300 text-sm">
            {error}
          </div>
        )}
        
        <Button
          type="submit"
          className="w-full bg-tron-blue/20 text-tron-blue hover:bg-tron-blue/30 border border-tron-blue/50"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Connecting...
            </>
          ) : (
            'Enter The Grid'
          )}
        </Button>
        
        <p className="text-xs text-center text-tron-text/60 mt-4">
          Your email is used as your unique identifier and your screen name will appear on the leaderboard.
        </p>
      </form>
    </div>
  );
};

export default LoginPrompt;
