import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MapPin, Home, DollarSign, Calendar, Users, Car, Waves, Shield } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Project {
  id: number;
  title: string;
  location: string;
  price: string;
  status: string;
  image: string;
  description: string;
  features: string[];
}

interface ProjectDetailsModalProps {
  project: Project;
  children: React.ReactNode;
}

const ProjectDetailsModal = ({ project, children }: ProjectDetailsModalProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();

  const handleInquiry = () => {
    toast({
      title: "Inquiry Sent!",
      description: `Thank you for your interest in ${project.title}. Our sales team will contact you within 24 hours.`
    });
    setIsOpen(false);
  };

  const additionalImages = [
    "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1613490493576-7fde63acd811?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
  ];

  const amenities = [
    { icon: Waves, text: "Private Beach Access" },
    { icon: Car, text: "Valet Parking" },
    { icon: Users, text: "24/7 Concierge" },
    { icon: Shield, text: "Security System" },
    { icon: Home, text: "Smart Home Technology" },
    { icon: Calendar, text: "Clubhouse & Spa" }
  ];

  const specifications = {
    "Unit Types": "2, 3, 4 Bedroom Residences",
    "Square Footage": "1,800 - 4,500 sq ft",
    "Ceiling Height": "10 - 12 feet",
    "Balcony": "Private terraces with ocean views",
    "Parking": "2-3 assigned spaces",
    "Pet Policy": "Pet-friendly with restrictions"
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div>
              <DialogTitle className="font-heading text-3xl mb-2">{project.title}</DialogTitle>
              <div className="flex items-center gap-4 text-gray-600">
                <div className="flex items-center">
                  <MapPin className="h-4 w-4 mr-1" />
                  <span>{project.location}</span>
                </div>
                <div className="flex items-center">
                  <DollarSign className="h-4 w-4 mr-1" />
                  <span className="font-semibold">{project.price}</span>
                </div>
              </div>
            </div>
            <Badge className={project.status === 'Available' ? 'bg-green-100 text-green-800' : 
                             project.status === 'Pre-Launch' ? 'bg-blue-100 text-blue-800' : 
                             'bg-red-100 text-red-800'}>
              {project.status}
            </Badge>
          </div>
        </DialogHeader>
        
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="gallery">Gallery</TabsTrigger>
            <TabsTrigger value="amenities">Amenities</TabsTrigger>
            <TabsTrigger value="specs">Specifications</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="aspect-video rounded-lg overflow-hidden">
              <img
                src={project.image}
                alt={project.title}
                className="w-full h-full object-cover"
              />
            </div>
            
            <div>
              <h3 className="font-heading text-xl font-semibold mb-3">About This Development</h3>
              <p className="text-gray-600 leading-relaxed mb-4">{project.description}</p>
              <p className="text-gray-600 leading-relaxed">
                Experience the pinnacle of luxury living with breathtaking ocean views, world-class amenities, 
                and meticulously crafted interiors. This exclusive development offers an unparalleled lifestyle 
                in one of California's most prestigious coastal communities.
              </p>
            </div>

            <div>
              <h3 className="font-heading text-xl font-semibold mb-3">Key Features</h3>
              <div className="grid grid-cols-2 gap-3">
                {project.features.map((feature, index) => (
                  <div key={index} className="flex items-center">
                    <Home className="h-4 w-4 text-primary mr-2" />
                    <span className="text-gray-700">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="gallery" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="aspect-square rounded-lg overflow-hidden">
                <img
                  src={project.image}
                  alt={`${project.title} - Main`}
                  className="w-full h-full object-cover"
                />
              </div>
              {additionalImages.map((image, index) => (
                <div key={index} className="aspect-square rounded-lg overflow-hidden">
                  <img
                    src={image}
                    alt={`${project.title} - ${index + 2}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="amenities" className="space-y-4">
            <div className="grid grid-cols-2 gap-6">
              {amenities.map((amenity, index) => (
                <div key={index} className="flex items-center p-4 border rounded-lg">
                  <div className="w-12 h-12 luxury-gradient rounded-lg flex items-center justify-center mr-4">
                    <amenity.icon className="h-6 w-6 text-white" />
                  </div>
                  <span className="font-medium text-gray-900">{amenity.text}</span>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="specs" className="space-y-4">
            <div className="space-y-4">
              {Object.entries(specifications).map(([key, value]) => (
                <div key={key} className="flex justify-between items-center p-4 border rounded-lg">
                  <span className="font-medium text-gray-900">{key}</span>
                  <span className="text-gray-600">{value}</span>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex gap-3 pt-4 border-t">
          <Button
            onClick={handleInquiry}
            className="flex-1 luxury-gradient text-white hover:opacity-90"
            disabled={project.status === 'Sold Out'}
          >
            {project.status === 'Sold Out' ? 'Sold Out' : 'Request Information'}
          </Button>
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProjectDetailsModal;