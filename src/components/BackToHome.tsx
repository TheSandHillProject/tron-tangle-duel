
import React from 'react';
import { Link } from 'react-router-dom';
import { Home } from 'lucide-react';
import { Button } from '@/components/ui/button';

const BackToHome = () => {
  return (
    <div className="w-full flex justify-center mt-8">
      <Link to="/">
        <Button variant="outline" className="gap-2">
          <Home size={16} />
          Back to Homepage
        </Button>
      </Link>
    </div>
  );
};

export default BackToHome;
