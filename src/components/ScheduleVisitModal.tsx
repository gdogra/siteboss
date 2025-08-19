import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';

interface ScheduleVisitModalProps {
  children: React.ReactNode;
}

const ScheduleVisitModal = ({ children }: ScheduleVisitModalProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [date, setDate] = useState<Date>();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    time: '',
    property: '',
    message: ''
  });

  const { toast } = useToast();

  const timeSlots = [
  '9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM',
  '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM'];


  const properties = [
  'Oceanview Residences',
  'Sunset Villas',
  'Marina Heights',
  'Coastal Gardens'];


  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    toast({
      title: "Visit Scheduled!",
      description: `Thank you ${formData.name}! We'll contact you shortly to confirm your visit for ${format(date || new Date(), 'PPP')} at ${formData.time}.`
    });

    // Reset form
    setFormData({
      name: '',
      email: '',
      phone: '',
      time: '',
      property: '',
      message: ''
    });
    setDate(undefined);
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-heading text-2xl">Schedule Your Visit</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid md:grid-cols-2 gap-4">
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

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="phone">Phone Number *</Label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={handleInputChange}
                required
                className="mt-2"
                placeholder="(123) 456-7890" />

            </div>
            <div>
              <Label>Property Interest</Label>
              <Select
                value={formData.property}
                onValueChange={(value) => setFormData({ ...formData, property: value })}>

                <SelectTrigger className="mt-2">
                  <SelectValue placeholder="Select property" />
                </SelectTrigger>
                <SelectContent>
                  {properties.map((property) =>
                  <SelectItem key={property} value={property}>
                      {property}
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label>Preferred Date *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal mt-2">

                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, 'PPP') : 'Pick a date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    disabled={(date) => date < new Date() || date.getDay() === 0}
                    initialFocus />

                </PopoverContent>
              </Popover>
            </div>
            <div>
              <Label>Preferred Time *</Label>
              <Select
                value={formData.time}
                onValueChange={(value) => setFormData({ ...formData, time: value })}>

                <SelectTrigger className="mt-2">
                  <SelectValue placeholder="Select time" />
                </SelectTrigger>
                <SelectContent>
                  {timeSlots.map((time) =>
                  <SelectItem key={time} value={time}>
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-2" />
                        {time}
                      </div>
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="message">Additional Message</Label>
            <Textarea
              id="message"
              name="message"
              value={formData.message}
              onChange={handleInputChange}
              className="mt-2"
              placeholder="Any specific requirements or questions..."
              rows={3} />

          </div>

          <div className="flex gap-3">
            <Button
              type="submit"
              className="flex-1 luxury-gradient text-white hover:opacity-90"
              disabled={!date || !formData.time || !formData.name || !formData.email || !formData.phone}>

              Schedule Visit
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsOpen(false)}>

              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>);

};

export default ScheduleVisitModal;