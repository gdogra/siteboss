import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Award, Users, MapPin, Calendar } from 'lucide-react';

const About = () => {
  const stats = [
    { icon: Award, label: 'Awards Won', value: '25+' },
    { icon: Users, label: 'Happy Families', value: '500+' },
    { icon: MapPin, label: 'Prime Locations', value: '12' },
    { icon: Calendar, label: 'Years Experience', value: '15' },
  ];

  return (
    <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="font-heading text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              Crafting Dreams into
              <span className="text-transparent bg-clip-text luxury-gradient block">
                Reality
              </span>
            </h2>
            
            <p className="text-lg text-gray-600 mb-6 leading-relaxed">
              For over 15 years, Laguna Bay Development has been synonymous with luxury, 
              innovation, and uncompromising quality. We don't just build homes; we create 
              lifestyle experiences that exceed expectations.
            </p>
            
            <p className="text-lg text-gray-600 mb-8 leading-relaxed">
              Our commitment to excellence is reflected in every detail, from our carefully 
              selected waterfront locations to our partnerships with world-renowned architects 
              and interior designers.
            </p>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-6">
              {stats.map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                >
                  <Card className="border-0 shadow-lg">
                    <CardContent className="p-6 text-center">
                      <stat.icon className="h-8 w-8 text-primary mx-auto mb-3" />
                      <h3 className="font-heading text-2xl font-bold text-gray-900 mb-1">
                        {stat.value}
                      </h3>
                      <p className="text-sm text-gray-600">{stat.label}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Image */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="relative"
          >
            <div className="relative h-96 lg:h-[500px] rounded-2xl overflow-hidden shadow-2xl">
              <img
                src="https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
                alt="Luxury development"
                className="w-full h-full object-cover"
              />
              
              {/* Floating Card */}
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="absolute -bottom-6 -left-6 bg-white p-6 rounded-xl shadow-xl border"
              >
                <h4 className="font-heading text-lg font-semibold text-gray-900 mb-2">
                  Premium Quality
                </h4>
                <p className="text-gray-600 text-sm">
                  Every project reflects our commitment to excellence and attention to detail.
                </p>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default About;