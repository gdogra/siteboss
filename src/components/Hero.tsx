import { Button } from '@/components/ui/button';
import { ArrowRight, Play } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import ScheduleVisitModal from '@/components/ScheduleVisitModal';
import VideoModal from '@/components/VideoModal';

const Hero = () => {
  return (
    <section className="relative h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: 'url(https://images.unsplash.com/photo-1581858726788-75bc0f6a952d?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80)'
        }} />

      
      {/* Overlay */}
      <div className="absolute inset-0 hero-overlay" />
      
      {/* Content */}
      <div className="relative z-10 text-center px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}>

          <h1 className="font-heading text-4xl sm:text-6xl lg:text-7xl font-bold text-white mb-6 text-shadow">
            Transform Your
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-yellow-600">
              Dream Home
            </span>
          </h1>
          
          <p className="text-xl sm:text-2xl text-gray-200 mb-8 max-w-2xl mx-auto leading-relaxed">
            Expert home renovations, custom builds, and construction services 
            bringing your vision to life with quality craftsmanship.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link to="/projects">
              <Button
                size="lg"
                className="luxury-gradient text-white hover:opacity-90 px-8 py-4 text-lg font-medium group">
                View Our Work
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            
            <VideoModal>
              <Button
                size="lg"
                variant="outline"
                className="bg-white/10 border-white/30 text-white hover:bg-white/20 backdrop-blur-sm px-8 py-4 text-lg">
                <Play className="mr-2 h-5 w-5" />
                Watch Video
              </Button>
            </VideoModal>
          </div>
        </motion.div>
        
        {/* Scroll Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.8 }}
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2">

          <div className="w-6 h-10 border-2 border-white/50 rounded-full flex justify-center">
            <motion.div
              animate={{ y: [0, 12, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="w-1 h-3 bg-white/70 rounded-full mt-2" />

          </div>
        </motion.div>
      </div>
    </section>);

};

export default Hero;