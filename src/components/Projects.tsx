import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin, Home, DollarSign } from 'lucide-react';

const Projects = () => {
  const projects = [
    {
      id: 1,
      title: "Oceanview Residences",
      location: "Laguna Beach, CA",
      price: "From $2.5M",
      status: "Available",
      image: "https://images.unsplash.com/photo-1613490493576-7fde63acd811?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      description: "Luxury waterfront condominiums with panoramic ocean views and world-class amenities.",
      features: ["3-4 Bedrooms", "Ocean Views", "Private Beach Access", "Concierge Service"]
    },
    {
      id: 2,
      title: "Sunset Villas",
      location: "Newport Coast, CA",
      price: "From $3.2M",
      status: "Pre-Launch",
      image: "https://images.unsplash.com/photo-1660361339492-05c07e2e0a50?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3MTg3MTl8MHwxfHNlYXJjaHwxfHxBJTIwbW9kZXJuJTIwdmlsbGElMjB3aXRoJTIwYSUyMHBvb2wlMjBhbmQlMjBjb250ZW1wb3JhcnklMjBkZXNpZ24lMkMlMjBzdXJyb3VuZGVkJTIwYnklMjBncmVlbmVyeS58ZW58MHx8fHwxNzUzOTE0NDc4fDA&ixlib=rb-4.1.0&q=80&w=200$w=800",
      description: "Exclusive collection of modern villas featuring contemporary design and luxury finishes.",
      features: ["4-5 Bedrooms", "Private Pool", "Smart Home Tech", "Gourmet Kitchen"]
    },
    {
      id: 3,
      title: "Marina Heights",
      location: "Huntington Beach, CA",
      price: "From $1.8M",
      status: "Sold Out",
      image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      description: "High-rise luxury living with marina views and premium amenities in the heart of the city.",
      features: ["2-3 Bedrooms", "Marina Views", "Fitness Center", "Rooftop Deck"]
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Available': return 'bg-green-100 text-green-800';
      case 'Pre-Launch': return 'bg-blue-100 text-blue-800';
      case 'Sold Out': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
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
          className="text-center mb-16"
        >
          <h2 className="font-heading text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
            Featured
            <span className="text-transparent bg-clip-text luxury-gradient"> Projects</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Discover our portfolio of exceptional developments, each designed to offer 
            the finest in luxury coastal living.
          </p>
        </motion.div>

        {/* Projects Grid */}
        <div className="grid lg:grid-cols-3 gap-8">
          {projects.map((project, index) => (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: index * 0.2 }}
            >
              <Card className="overflow-hidden hover:shadow-xl transition-shadow duration-300 group">
                <div className="relative h-64 overflow-hidden">
                  <img
                    src={project.image}
                    alt={project.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
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
                      <DollarSign className="h-4 w-4 mr-1" />
                      <span className="font-semibold">{project.price}</span>
                    </div>
                  </div>
                  
                  <p className="text-gray-600 mb-4 text-sm leading-relaxed">
                    {project.description}
                  </p>
                  
                  <div className="mb-6">
                    <div className="grid grid-cols-2 gap-2">
                      {project.features.map((feature, featureIndex) => (
                        <div key={featureIndex} className="flex items-center text-xs text-gray-600">
                          <Home className="h-3 w-3 mr-1 text-primary" />
                          {feature}
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <Button 
                    className="w-full luxury-gradient text-white hover:opacity-90"
                    disabled={project.status === 'Sold Out'}
                  >
                    {project.status === 'Sold Out' ? 'Sold Out' : 'Learn More'}
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mt-12"
        >
          <Button size="lg" variant="outline" className="border-primary text-primary hover:bg-primary hover:text-white">
            View All Projects
          </Button>
        </motion.div>
      </div>
    </section>
  );
};

export default Projects;