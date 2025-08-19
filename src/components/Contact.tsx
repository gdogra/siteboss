import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Phone, Mail, MapPin, Clock } from 'lucide-react';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });

  const { toast } = useToast();

  const contactInfo = [
  {
    icon: Phone,
    title: "Phone",
    details: ["+1 (949) 555-0123", "+1 (949) 555-0124"],
    description: "Monday to Friday, 9AM - 6PM PST"
  },
  {
    icon: Mail,
    title: "Email",
    details: ["info@lagunabaydeveloping.com", "sales@lagunabaydeveloping.com"],
    description: "We'll respond within 24 hours"
  },
  {
    icon: MapPin,
    title: "Office",
    details: ["1234 Pacific Coast Highway", "Laguna Beach, CA 92651"],
    description: "Visit our luxury showroom"
  },
  {
    icon: Clock,
    title: "Hours",
    details: ["Mon - Fri: 9:00 AM - 6:00 PM", "Sat - Sun: 10:00 AM - 4:00 PM"],
    description: "By appointment only on weekends"
  }];


  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Message Sent!",
      description: "Thank you for your inquiry. We'll get back to you within 24 hours."
    });
    setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
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
            Get In
            <span className="text-transparent bg-clip-text luxury-gradient"> Touch</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Ready to explore luxury coastal living? Contact our team to discuss your 
            dream property or investment opportunity.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-12">
          {/* Contact Info */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="space-y-6">

            {contactInfo.map((info, index) =>
            <Card key={info.title} className="border-0 shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 luxury-gradient rounded-lg flex items-center justify-center flex-shrink-0">
                      <info.icon className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">{info.title}</h3>
                      {info.details.map((detail, detailIndex) =>
                    <p key={detailIndex} className="text-gray-700 font-medium">
                          {detail}
                        </p>
                    )}
                      <p className="text-sm text-gray-500 mt-1">{info.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </motion.div>

          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="lg:col-span-2">

            <Card className="border-0 shadow-xl">
              <CardHeader>
                <h3 className="font-heading text-2xl font-semibold text-gray-900">
                  Send us a Message
                </h3>
                <p className="text-gray-600">
                  Fill out the form below and we'll get back to you as soon as possible.
                </p>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="name">Full Name *</Label>
                      <Input
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                        className="mt-2"
                        placeholder="Your full name" />

                    </div>
                    <div>
                      <Label htmlFor="email">Email Address *</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                        className="mt-2"
                        placeholder="your.email@example.com" />

                    </div>
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        name="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className="mt-2"
                        placeholder="(123) 456-7890" />

                    </div>
                    <div>
                      <Label htmlFor="subject">Subject *</Label>
                      <Input
                        id="subject"
                        name="subject"
                        value={formData.subject}
                        onChange={handleInputChange}
                        required
                        className="mt-2"
                        placeholder="How can we help?" />

                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="message">Message *</Label>
                    <Textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleInputChange}
                      required
                      className="mt-2 min-h-32"
                      placeholder="Tell us more about your inquiry..." />

                  </div>
                  
                  <Button
                    type="submit"
                    className="w-full luxury-gradient text-white hover:opacity-90 py-3">

                    Send Message
                  </Button>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Map Section */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="mt-16">

          <Card className="border-0 shadow-xl overflow-hidden">
            <div className="h-96 bg-gray-200 flex items-center justify-center">
              <div className="text-center">
                <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 font-medium">Interactive Map</p>
                <p className="text-sm text-gray-500">1234 Pacific Coast Highway, Laguna Beach, CA</p>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    </section>);

};

export default Contact;