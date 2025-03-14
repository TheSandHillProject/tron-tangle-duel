
import React from 'react';
import { Mail } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';

const FeedbackDialog = () => {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button 
          variant="outline" 
          size="sm"
          className="text-xs gap-2 bg-gray-500/20 text-tron-text/70 border-gray-500/30 hover:bg-gray-500/30 hover:text-tron-text transition-colors h-9"
        >
          <Mail className="h-4 w-4" />
          Feedback
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent className="glass-panel border-tron-blue/50 bg-tron-background/70">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-tron-blue">Contact Us</AlertDialogTitle>
          <AlertDialogDescription className="text-tron-text">
            For feedback, reporting bugs, or questions related to Battle Tron, you can reach us at:
            <div className="mt-4 text-tron-blue font-medium">
              email: mail@nicpavao.com<br />
              twitter: @BattleTronGram
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogAction 
            className="bg-tron-blue/20 text-tron-blue hover:bg-tron-blue/30 hover:text-tron-blue border border-tron-blue/50"
          >
            Close
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default FeedbackDialog;
