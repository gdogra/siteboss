import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin, Home, Calendar } from 'lucide-react';
import { Link } from 'react-router-dom';
import ProjectDetailsModal from '@/components/ProjectDetailsModal';

const Projects = () => {
  const projects = [
  {
    id: 1,
    title: "Modern Kitchen Renovation",
    location: "Newport Beach, CA",
    timeline: "3 months",
    status: "Completed",
    image: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    description: "Complete kitchen transformation with custom cabinetry, quartz countertops, and modern appliances.",
    features: ["Custom Cabinetry", "Quartz Countertops", "Smart Appliances", "LED Lighting"]
  },
  {
    id: 2,
    title: "Luxury Bathroom Remodel",
    location: "Laguna Beach, CA",
    timeline: "6 weeks",
    status: "In Progress",
    image: "https://images.unsplash.com/photo-1620626011761-996317b8d101?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    description: "Spa-like master bathroom renovation featuring marble tiles, rainfall shower, and custom vanity.",
    features: ["Marble Finishes", "Rainfall Shower", "Heated Floors", "Custom Vanity"]
  },
  {
    id: 3,
    title: "Custom Home Build",
    location: "Huntington Beach, CA",
    timeline: "8 months",
    status: "Planning",
    image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    description: "Ground-up custom home construction with modern design and sustainable building practices.",
    features: ["Sustainable Design", "Open Floor Plan", "Smart Home Tech", "Energy Efficient"]
  }];


  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed':return 'bg-green-100 text-green-800';
      case 'In Progress':return 'bg-blue-100 text-blue-800';
      case 'Planning':return 'bg-yellow-100 text-yellow-800';
      default:return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16">

          <h2 className="font-heading text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
            Featured
            <span className="text-transparent bg-clip-text luxury-gradient"> Projects</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Explore our portfolio of exceptional renovations and custom builds, 
            each showcasing our commitment to quality craftsmanship.
          </p>
        </motion.div>

        {/* Projects Grid */}
        <div className="grid lg:grid-cols-3 gap-8">
          {projects.map((project, index) =>
          <motion.div
            key={project.id}
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: index * 0.2 }}>

              <Card className="overflow-hidden hover:shadow-xl transition-shadow duration-300 group">
                <div className="relative h-64 overflow-hidden">
                  <img
                  src={project.image}
                  alt={project.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />

                  <Badge className={`absolute top-4 right-4 ${getStatusColor(project.status)}`}>
                    {project.status}
                  </Badge>
                </div>
                
                <CardContent className="p-6">
                  <div className="mb-4">
                    <h3 className="font-heading text-xl font-semibold text-gray-900 mb-2">
                      {project.title}
                    </h3>
                    
                    <div className="flex items-center text-gray-600 mb-2">
                      <MapPin className="h-4 w-4 mr-1" />
                      <span className="text-sm">{project.location}</span>
                    </div>
                    
                    <div className="flex items-center text-primary mb-3">
                      <Calendar className="h-4 w-4 mr-1" />
                      <span className="font-semibold">{project.timeline}</span>
                    </div>
                  </div>
                  
                  <p className="text-gray-600 mb-4 text-sm leading-relaxed">
                    {project.description}
                  </p>
                  
                  <div className="mb-6">
                    <div className="grid grid-cols-2 gap-2">
                      {project.features.map((feature, featureIndex) =>
                    <div key={featureIndex} className="flex items-center text-xs text-gray-600">
                          <Home className="h-3 w-3 mr-1 text-primary" />
                          {feature}
                        </div>
                    )}
                    </div>
                  </div>
                  
                  <ProjectDetailsModal project={project}>
                    <Button
                    className="w-full luxury-gradient text-white hover:opacity-90">
                      View Details
                    </Button>
                  </ProjectDetailsModal>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mt-12">

          <Link to="/projects">
            <Button size="lg" variant="outline" className="border-primary text-primary hover:bg-primary hover:text-white">
              View All Projects
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>);

};

export default Projects;