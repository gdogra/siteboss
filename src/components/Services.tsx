import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Building2, Compass, Palette, Shield, Users, Wrench } from 'lucide-react';

const Services = () => {
  const services = [
    {
      icon: Building2,
      title: "Luxury Development",
      description: "Premium residential and commercial development projects with uncompromising attention to detail and quality."
    },
    {
      icon: Compass,
      title: "Site Selection",
      description: "Expert analysis and selection of prime waterfront and coastal locations for maximum investment potential."
    },
    {
      icon: Palette,
      title: "Custom Design",
      description: "Bespoke architectural design and interior styling services tailored to your vision and lifestyle."
    },
    {
      icon: Shield,
      title: "Project Management",
      description: "Comprehensive project oversight ensuring timely delivery, budget control, and quality assurance."
    },
    {
      icon: Users,
      title: "Investment Advisory",
      description: "Strategic guidance for real estate investments with focus on luxury coastal properties and developments."
    },
    {
      icon: Wrench,
      title: "Property Services",
      description: "Ongoing maintenance, concierge services, and property management for our luxury developments."
    }
  ];

  return (
    <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
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
            Our
            <span className="text-transparent bg-clip-text luxury-gradient"> Services</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            From concept to completion, we provide comprehensive services to bring your 
            luxury development vision to life.
          </p>
        </motion.div>

        {/* Services Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, index) => (
            <motion.div
              key={service.title}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: index * 0.1 }}
            >
              <Card className="h-full hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-0 shadow-md">
                <CardHeader className="text-center pb-4">
                  <div className="w-16 h-16 luxury-gradient rounded-full flex items-center justify-center mx-auto mb-4">
                    <service.icon className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="font-heading text-xl font-semibold text-gray-900">
                    {service.title}
                  </h3>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="text-gray-600 leading-relaxed">
                    {service.description}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="mt-20 text-center"
        >
          <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-2xl p-12">
            <h3 className="font-heading text-3xl font-bold text-white mb-4">
              Ready to Start Your Project?
            </h3>
            <p className="text-gray-300 text-lg mb-8 max-w-2xl mx-auto">
              Let's discuss how we can bring your luxury development vision to life 
              with our expertise and commitment to excellence.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-white text-gray-900 hover:bg-gray-100 px-8 py-3 rounded-lg font-medium transition-colors">
                Schedule Consultation
              </button>
              <button className="border border-white/30 text-white hover:bg-white/10 px-8 py-3 rounded-lg font-medium transition-colors">
                View Portfolio
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Services;