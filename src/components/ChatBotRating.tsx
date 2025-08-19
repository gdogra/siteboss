
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Star, ThumbsUp, ThumbsDown } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ChatBotRatingProps {
  messageId: string;
  onRating: (messageId: string, rating: number, feedback?: string) => void;
  currentRating?: number;
}

const ChatBotRating: React.FC<ChatBotRatingProps> = ({ 
  messageId, 
  onRating, 
  currentRating 
}) => {
  const [selectedRating, setSelectedRating] = useState<number>(currentRating || 0);
  const [feedback, setFeedback] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();

  const handleQuickRating = (rating: number) => {
    setSelectedRating(rating);
    onRating(messageId, rating);
    
    if (rating <= 2) {
      setIsDialogOpen(true);
    } else {
      toast({
        title: "Thank you!",
        description: "Your feedback helps us improve.",
      });
    }
  };

  const handleDetailedRating = () => {
    onRating(messageId, selectedRating, feedback);
    setIsDialogOpen(false);
    setFeedback('');
    
    toast({
      title: "Feedback Submitted",
      description: "Thank you for your detailed feedback!",
    });
  };

  const renderStars = () => {
    return (
      <div className="flex space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Button
            key={star}
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0"
            onClick={() => handleQuickRating(star)}
          >
            <Star
              className={`h-3 w-3 ${
                star <= selectedRating 
                  ? 'text-yellow-500 fill-current' 
                  : 'text-gray-300'
              }`}
            />
          </Button>
        ))}
      </div>
    );
  };

  if (currentRating && currentRating !== 0) {
    return (
      <div className="flex items-center space-x-1">
        {currentRating > 0 ? (
          <>
            <ThumbsUp className="h-3 w-3 text-green-600" />
            <span className="text-xs text-gray-500">Rated {currentRating}/5</span>
          </>
        ) : (
          <>
            <ThumbsDown className="h-3 w-3 text-red-600" />
            <span className="text-xs text-gray-500">Feedback provided</span>
          </>
        )}
      </div>
    );
  }

  return (
    <>
      <div className="flex items-center space-x-2 mt-2">
        <span className="text-xs text-gray-500">Rate this response:</span>
        {renderStars()}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Help Us Improve</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              We noticed you gave a low rating. Could you help us understand what went wrong?
            </p>
            
            <div>
              <label className="text-sm font-medium">Your Rating:</label>
              <div className="flex space-x-1 mt-1">
                {renderStars()}
              </div>
            </div>
            
            <div>
              <label className="text-sm font-medium">Additional Feedback (Optional):</label>
              <Textarea
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="Tell us what we can do better..."
                className="mt-1"
              />
            </div>
            
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleDetailedRating}>
                Submit Feedback
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ChatBotRating;
