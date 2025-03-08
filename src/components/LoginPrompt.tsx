
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useUserContext } from '@/context/UserContext';

interface LoginPromptProps {
  onComplete?: () => void;
}

const LoginPrompt: React.FC<LoginPromptProps> = ({ onComplete }) => {
  const { login } = useUserContext();
  const [username, setUsername] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) {
      setError('Username cannot be empty');
      return;
    }
    
    setIsSubmitting(true);
    setError(null);
    
    try {
      await login(username.trim());
      if (onComplete) onComplete();
    } catch (err) {
      setError('Failed to log in. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="glass-panel rounded-xl p-6 max-w-md w-full mx-auto animate-game-fade-in">
      <h2 className="text-xl font-bold text-center mb-6 bg-clip-text text-transparent bg-gradient-to-r from-tron-blue to-tron-glow">
        ENTER USERNAME
      </h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="YourUsername"
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
          {isSubmitting ? 'Connecting...' : 'Continue'}
        </Button>
        
        <p className="text-xs text-center text-tron-text/60 mt-4">
          Your username will be used to track your scores on the leaderboard.
        </p>
      </form>
    </div>
  );
};

export default LoginPrompt;
