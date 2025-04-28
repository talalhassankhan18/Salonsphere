"use client"
import React, { useState } from 'react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Calendar } from '../../components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '../../components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Textarea } from '../../components/ui/textarea';
import { CalendarIcon, Clock } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../components/ui/dialog';
import { format } from 'date-fns';
import { cn } from '../..//lib/utils';
import { toast } from '../../hooks/use-toast';

interface AddAppointmentProps {
  open: boolean;
  onClose: () => void;
  onSave?: (data: any) => void;
}

const timeSlots = [
  '9:00 AM', '9:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM',
  '12:00 PM', '12:30 PM', '1:00 PM', '1:30 PM', '2:00 PM', '2:30 PM',
  '3:00 PM', '3:30 PM', '4:00 PM', '4:30 PM', '5:00 PM', '5:30 PM'
];

const AddAppointment: React.FC<AddAppointmentProps> = ({ open, onClose, onSave }) => {
  const [customerName, setCustomerName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [service, setService] = useState('');
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [startTime, setStartTime] = useState('');
  const [notes, setNotes] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!customerName || !email || !service || !date || !startTime) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);

    const serviceMap: Record<string, { name: string, duration: number, price: number }> = {
      'haircut': { name: 'Haircut', duration: 30, price: 35 },
      'coloring': { name: 'Hair Coloring', duration: 90, price: 120 },
      'styling': { name: 'Hair Styling', duration: 45, price: 55 },
      'facial': { name: 'Facial Treatment', duration: 60, price: 75 },
      'manicure': { name: 'Manicure', duration: 45, price: 40 },
      'pedicure': { name: 'Pedicure', duration: 60, price: 50 },
    };

    const selectedService = serviceMap[service];
    const startDate = new Date(date);
    const [hours, minutes] = startTime.includes('PM') 
      ? [parseInt(startTime.split(':')[0]) + 12, parseInt(startTime.split(':')[1])] 
      : [parseInt(startTime.split(':')[0]), parseInt(startTime.split(':')[1])];
    
    startDate.setHours(hours, minutes);
    
    const endDate = new Date(startDate);
    endDate.setMinutes(endDate.getMinutes() + selectedService.duration);

    setTimeout(() => {
      const appointmentData = {
        customer: {
          name: customerName,
          email: email,
          phone: phone
        },
        service: {
          _id: `service-${service}`,
          name: selectedService.name,
          duration: selectedService.duration,
          price: selectedService.price
        },
        startTime: startDate,
        endTime: endDate,
        status: 'pending',
        notes,
        _id: `appointment-${Date.now()}`
      };

      if (onSave) {
        onSave(appointmentData);
      }

      toast({
        title: "Appointment created",
        description: "The appointment has been scheduled successfully",
      });

      setCustomerName('');
      setEmail('');
      setPhone('');
      setService('');
      setDate(undefined);
      setStartTime('');
      setNotes('');
      setIsLoading(false);
      onClose();
    }, 1000);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Schedule New Appointment</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 py-4">
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="customerName">Customer Name *</Label>
                <Input 
                  id="customerName" 
                  value={customerName} 
                  onChange={(e) => setCustomerName(e.target.value)} 
                  placeholder="Enter customer name" 
                  required
                />
              </div>

              <div>
                <Label htmlFor="email">Email *</Label>
                <Input 
                  id="email" 
                  type="email"
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  placeholder="Enter email address" 
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="phone">Phone Number</Label>
                <Input 
                  id="phone" 
                  value={phone} 
                  onChange={(e) => setPhone(e.target.value)} 
                  placeholder="Enter phone number" 
                />
              </div>

              <div>
                <Label htmlFor="service">Service *</Label>
                <Select value={service} onValueChange={setService} required>
                  <SelectTrigger id="service">
                    <SelectValue placeholder="Select a service" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="haircut">Haircut ($35)</SelectItem>
                    <SelectItem value="coloring">Hair Coloring ($120)</SelectItem>
                    <SelectItem value="styling">Hair Styling ($55)</SelectItem>
                    <SelectItem value="facial">Facial Treatment ($75)</SelectItem>
                    <SelectItem value="manicure">Manicure ($40)</SelectItem>
                    <SelectItem value="pedicure">Pedicure ($50)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Date *</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !date && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {date ? format(date, "PPP") : "Select a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={date}
                      onSelect={setDate}
                      initialFocus
                      disabled={(date: Date) => date < new Date()}
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div>
                <Label>Time *</Label>
                <Select value={startTime} onValueChange={setStartTime}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a time">
                      {startTime ? (
                        <div className="flex items-center">
                          <Clock className="mr-2 h-4 w-4" />
                          {startTime}
                        </div>
                      ) : (
                        "Select a time"
                      )}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {timeSlots.map(time => (
                      <SelectItem key={time} value={time}>
                        {time}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="notes">Notes</Label>
              <Textarea 
                id="notes" 
                value={notes} 
                onChange={(e) => setNotes(e.target.value)} 
                placeholder="Add any notes or special requests..." 
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" className="bg-pink-600 hover:bg-pink-700" disabled={isLoading}>
              {isLoading ? 'Scheduling...' : 'Schedule Appointment'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddAppointment;