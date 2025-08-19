import { useState } from 'react';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { Play, X } from 'lucide-react';

interface VideoModalProps {
  children: React.ReactNode;
}

const VideoModal = ({ children }: VideoModalProps) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-4xl p-0 bg-black border-0">
        <div className="relative aspect-video">
          {/* Video placeholder - in a real app, this would be an actual video player */}
          <div className="w-full h-full bg-gradient-to-br from-gray-900 to-black flex items-center justify-center">
            <div className="text-center text-white">
              <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Play className="h-8 w-8 text-white ml-1" />
              </div>
              <h3 className="text-2xl font-heading font-semibold mb-2">
                Laguna Bay Development
              </h3>
              <p className="text-gray-300">
                Experience luxury coastal living like never before
              </p>
              <p className="text-sm text-gray-400 mt-4">
                This is a demo - Video player would be implemented here
              </p>
            </div>
          </div>
          
          {/* Close button */}
          <button
            onClick={() => setIsOpen(false)}
            className="absolute top-4 right-4 w-10 h-10 bg-black/50 hover:bg-black/70 rounded-full flex items-center justify-center text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default VideoModal;