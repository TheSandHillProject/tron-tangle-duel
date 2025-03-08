
import React from 'react';
import { Link } from 'react-router-dom';
import { Home } from 'lucide-react';
import { Button } from '@/components/ui/button';

const BackToHome = () => {
  return (
    <div className="w-full flex justify-center mt-8">
      <Link to="/">
        <Button 
          variant="outline" 
          className="gap-2 bg-gray-500/20 text-tron-text/70 border-gray-500/30 hover:bg-gray-500/30 hover:text-tron-text transition-colors"
        >
          <Home size={16} />
          Back to Homepage
        </Button>
      </Link>
    </div>
  );
};

export default BackToHome;
