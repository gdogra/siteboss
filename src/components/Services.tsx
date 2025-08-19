import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Hammer, Home, Paintbrush, Wrench, Building2, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import ScheduleVisitModal from '@/components/ScheduleVisitModal';

const Services = () => {
  const services = [
  {
    icon: Home,
    title: "Home Renovations",
    description: "Complete home makeovers from kitchens and bathrooms to whole-house renovations with expert craftsmanship."
  },
  {
    icon: Building2,
    title: "Custom New Builds",
    description: "Build your dream home from the ground up with our experienced construction team and custom design services."
  },
  {
    icon: Hammer,
    title: "Remodeling & Additions",
    description: "Expand your living space with room additions, basement finishing, and comprehensive remodeling projects."
  },
  {
    icon: Paintbrush,
    title: "Design & Planning",
    description: "Professional architectural design, 3D visualization, and project planning to bring your vision to life."
  },
  {
    icon: Users,
    title: "Project Management",
    description: "Comprehensive project oversight ensuring timely delivery, budget control, and quality assurance throughout."
  },
  {
    icon: Wrench,
    title: "Maintenance & Repairs",
    description: "Ongoing maintenance services, emergency repairs, and property improvements to keep your home in perfect condition."
  }];


  return (
    <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16">

          <h2 className="font-heading text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
            Our
            <span className="text-transparent bg-clip-text luxury-gradient"> Services</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            From concept to completion, we provide comprehensive construction and renovation 
            services to transform your space into something extraordinary.
          </p>
        </motion.div>

        {/* Services Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, index) =>
          <motion.div
            key={service.title}
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: index * 0.1 }}>

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
          )}
        </div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="mt-20 text-center">

          <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-2xl p-12">
            <h3 className="font-heading text-3xl font-bold text-white mb-4">
              Ready to Start Your Project?
            </h3>
            <p className="text-gray-300 text-lg mb-8 max-w-2xl mx-auto">
              Let's discuss how we can transform your space with our expertise 
              and commitment to quality craftsmanship.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <ScheduleVisitModal>
                <button className="bg-white text-gray-900 hover:bg-gray-100 px-8 py-3 rounded-lg font-medium transition-colors">
                  Schedule Consultation
                </button>
              </ScheduleVisitModal>
              <Link to="/projects">
                <button className="border border-white/30 text-white hover:bg-white/10 px-8 py-3 rounded-lg font-medium transition-colors">
                  View Our Work
                </button>
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </section>);

};

export default Services;