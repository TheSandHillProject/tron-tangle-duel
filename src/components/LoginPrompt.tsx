
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useUserContext } from '@/context/UserContext';
import { Toaster } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { useGameContext } from '@/context/GameContext';

interface LoginPromptProps {
  onComplete?: () => void;
  gameMode?: 'single' | 'two';
}

const LoginPrompt: React.FC<LoginPromptProps> = ({ onComplete, gameMode = 'single' }) => {
  const { login } = useUserContext();
  const { setNavigatingFrom } = useGameContext();
  const [email, setEmail] = useState('');
  const [screenName, setScreenName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

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
      if (onComplete) onComplete();
      
      // Navigate to game setup after successful login
      setNavigatingFrom('/');
      navigate(`/game/${gameMode}`);
    } catch (err) {
      // Don't set generic error here since we're showing toast notifications
      // Error messages from the backend are displayed via toast in the UserContext
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="glass-panel rounded-xl p-6 max-w-md w-full mx-auto animate-game-fade-in">
      <Toaster position="top-center" />
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
          {error && <p className="text-red-400 text-sm mt-1">{error}</p>}
        </div>
        
        <Button
          type="submit"
          className="w-full bg-tron-blue/20 text-tron-blue hover:bg-tron-blue/30 border border-tron-blue/50"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Connecting...' : 'Enter The Grid'}
        </Button>
        
        <p className="text-xs text-center text-tron-text/60 mt-4">
          Your email is used as your unique identifier and your screen name will appear on the leaderboard.
        </p>
      </form>
    </div>
  );
};

export default LoginPrompt;
