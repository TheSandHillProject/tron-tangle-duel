
import React from 'react';
import Game from '@/components/Game';
import { Toaster } from 'sonner'; // Import the Sonner Toaster component

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col items-center py-8 px-4">
      <div className="w-full max-w-4xl">
        <Game />
      </div>
      
      {/* Configure Sonner toast with fewer messages and shorter durations */}
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 2000, // Make toasts disappear faster
          className: "bg-tron-background text-tron-text border-tron-blue/30",
        }}
        richColors
      />
      
      <footer className="mt-auto pt-8 pb-4 text-xs text-tron-text/50">
        <p className="text-center">
          &copy; 2025 Nic Pavao. All Rights Reserved.
        </p>
      </footer>
    </div>
  );
};

export default Index;
