import React, { useState, useEffect } from 'react';
import {
  XMarkIcon,
  PaperAirplaneIcon,
  UserPlusIcon,
  MagnifyingGlassIcon,
  AtSymbolIcon,
  UserIcon,
  ClipboardDocumentIcon
} from '@heroicons/react/24/outline';

interface Contact {
  id: string;
  firstName: string;
  lastName: string;
  company: string;
  title: string;
  email: string;
  phone?: string;
  type: 'customer' | 'vendor' | 'partner' | 'colleague' | 'lead';
}

interface Deal {
  id: string;
  title: string;
  customer: string;
  value: number;
  assigned_to: string;
  expected_close_date: Date;
}

interface EmailModalProps {
  isOpen: boolean;
  onClose: () => void;
  deal?: Deal;
  contact?: Contact;
  onSend: (emailData: {
    to: string[];
    cc?: string[];
    subject: string;
    body: string;
    attachments?: string[];
  }) => void;
}

const EmailModal: React.FC<EmailModalProps> = ({ isOpen, onClose, deal, contact, onSend }) => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [filteredContacts, setFilteredContacts] = useState<Contact[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedContacts, setSelectedContacts] = useState<Contact[]>([]);
  const [ccContacts, setCcContacts] = useState<Contact[]>([]);
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [showContactList, setShowContactList] = useState(false);
  const [addingTo, setAddingTo] = useState<'to' | 'cc'>('to');

  // Mock contacts data
  useEffect(() => {
    if (isOpen) {
      const mockContacts: Contact[] = [
        {
          id: '1',
          firstName: 'Sarah',
          lastName: 'Johnson',
          title: 'Homeowner',
          email: 'sarah.johnson@email.com',
          company: 'Johnson Construction',
          phone: '(555) 123-4567',
          type: 'customer'
        },
        {
          id: '2',
          firstName: 'Mike',
          lastName: 'Rodriguez',
          title: 'Property Manager',
          email: 'mike.rodriguez@email.com',
          company: 'Rodriguez Properties',
          phone: '(555) 234-5678',
          type: 'customer'
        },
        {
          id: '3',
          firstName: 'Lisa',
          lastName: 'Chen',
          title: 'CEO',
          email: 'lisa.chen@techstartup.com',
          company: 'TechStartup Inc.',
          phone: '(555) 345-6789',
          type: 'customer'
        },
        {
          id: '4',
          firstName: 'John',
          lastName: 'Smith',
          title: 'Project Manager',
          email: 'john.smith@siteboss.com',
          company: 'SiteBoss',
          phone: '(555) 456-7890',
          type: 'colleague'
        },
        {
          id: '5',
          firstName: 'Sarah',
          lastName: 'Wilson',
          title: 'Sales Manager',
          email: 'sarah.wilson@siteboss.com',
          company: 'SiteBoss',
          phone: '(555) 567-8901',
          type: 'colleague'
        },
        {
          id: '6',
          firstName: 'David',
          lastName: 'Thompson',
          title: 'Owner',
          email: 'david.thompson@email.com',
          company: 'Thompson Holdings',
          phone: '(555) 678-9012',
          type: 'customer'
        },
        {
          id: '7',
          firstName: 'Amanda',
          lastName: 'Wilson',
          title: 'Director',
          email: 'amanda.wilson@email.com',
          company: 'Wilson Enterprises',
          phone: '(555) 789-0123',
          type: 'customer'
        },
        {
          id: '8',
          firstName: 'Tech',
          lastName: 'Solutions',
          title: 'Contact',
          email: 'contact@ecotech.com',
          company: 'EcoTech Solutions',
          phone: '(555) 890-1234',
          type: 'customer'
        },
        {
          id: '9',
          firstName: 'ABC',
          lastName: 'Suppliers',
          title: 'Sales Rep',
          email: 'orders@abcsuppliers.com',
          company: 'ABC Suppliers',
          phone: '(555) 901-2345',
          type: 'vendor'
        }
      ];

      setContacts(mockContacts);
      
      // Auto-populate if we have contact information (from contact card)
      if (contact) {
        const contactData = {
          id: contact.id,
          firstName: contact.firstName,
          lastName: contact.lastName,
          title: contact.title,
          email: contact.email,
          company: contact.company,
          phone: contact.phone,
          type: contact.type
        };
        setSelectedContacts([contactData]);
        
        // Set default subject and body based on contact type and information
        const firstName = contact.firstName;
        const contactTypeSubjects = {
          customer: `Following up on our discussion`,
          vendor: `Partnership opportunity - ${contact.company}`,
          partner: `Collaboration discussion`,
          colleague: `Quick follow-up`,
          lead: `Thank you for your interest in SiteBoss services`
        };
        
        const contactTypeBodies = {
          customer: `Hi ${firstName},

I hope this email finds you well. I wanted to follow up on our recent discussion and see if you have any questions about our services.

At SiteBoss, we specialize in delivering high-quality construction and renovation projects. I'd be happy to schedule a consultation to discuss how we can help with your upcoming projects.

Please let me know a convenient time for you, and I'll be glad to provide more details about our services and pricing.

Best regards,
SiteBoss Team`,
          vendor: `Hi ${firstName},

I hope you're doing well. I'm reaching out from SiteBoss regarding potential partnership opportunities with ${contact.company}.

We're always looking for reliable suppliers and vendors to work with on our construction projects. I'd love to discuss how we might collaborate and explore mutual business opportunities.

Would you be available for a brief call this week to discuss potential partnership possibilities?

Best regards,
SiteBoss Team`,
          partner: `Hi ${firstName},

I hope this email finds you well. I wanted to reach out regarding our ongoing partnership with ${contact.company}.

I'd like to schedule some time to discuss upcoming collaboration opportunities and see how we can continue to work together effectively.

Please let me know your availability for a brief meeting or call.

Best regards,
SiteBoss Team`,
          colleague: `Hi ${firstName},

Hope you're having a great day! I wanted to follow up on our recent discussion.

Let me know if you need any additional information or if there's anything I can help with.

Best regards,`,
          lead: `Hi ${firstName},

Thank you for your interest in SiteBoss services! We're excited about the opportunity to work with ${contact.company}.

I'd love to schedule a consultation to discuss your project requirements and how our team can help bring your vision to life. We specialize in high-quality construction and renovation projects.

Please let me know a convenient time for a call or meeting, and I'll provide you with detailed information about our services and approach.

Looking forward to hearing from you!

Best regards,
SiteBoss Team`
        };
        
        setSubject(contactTypeSubjects[contact.type] || contactTypeSubjects.customer);
        setBody(contactTypeBodies[contact.type] || contactTypeBodies.customer);
      }
      // Auto-populate if we have deal information (from sales pipeline)
      else if (deal) {
        const dealCustomer = mockContacts.find(c => `${c.firstName} ${c.lastName}` === deal.customer);
        if (dealCustomer) {
          setSelectedContacts([dealCustomer]);
        }
        
        // Set default subject and body for deals
        setSubject(`Regarding your ${deal.title} project`);
        setBody(`Hi ${deal.customer.split(' ')[0]},

I hope this email finds you well. I wanted to follow up on your ${deal.title} project.

Deal Details:
- Project: ${deal.title}
- Value: ${new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(deal.value)}
- Expected Close Date: ${deal.expected_close_date.toLocaleDateString()}
- Assigned Representative: ${deal.assigned_to}

Please let me know if you have any questions or would like to discuss next steps. I'm happy to schedule a call at your convenience.

Best regards,
${deal.assigned_to}
SiteBoss Team`);
      }
    }
  }, [isOpen, deal, contact]);

  // Filter contacts based on search
  useEffect(() => {
    if (searchTerm) {
      const filtered = contacts.filter(contact =>
        `${contact.firstName} ${contact.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contact.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contact.company?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredContacts(filtered);
    } else {
      setFilteredContacts(contacts);
    }
  }, [contacts, searchTerm]);

  const handleContactSelect = (contact: Contact) => {
    if (addingTo === 'to') {
      if (!selectedContacts.find(c => c.id === contact.id)) {
        setSelectedContacts([...selectedContacts, contact]);
      }
    } else {
      if (!ccContacts.find(c => c.id === contact.id)) {
        setCcContacts([...ccContacts, contact]);
      }
    }
    setShowContactList(false);
    setSearchTerm('');
  };

  const handleRemoveContact = (contactId: string, type: 'to' | 'cc') => {
    if (type === 'to') {
      setSelectedContacts(selectedContacts.filter(c => c.id !== contactId));
    } else {
      setCcContacts(ccContacts.filter(c => c.id !== contactId));
    }
  };

  const handleSend = () => {
    if (selectedContacts.length === 0) {
      alert('Please select at least one recipient');
      return;
    }
    if (!subject.trim()) {
      alert('Please enter a subject');
      return;
    }
    if (!body.trim()) {
      alert('Please enter a message');
      return;
    }

    const emailData = {
      to: selectedContacts.map(c => c.email),
      cc: ccContacts.length > 0 ? ccContacts.map(c => c.email) : undefined,
      subject,
      body,
      attachments: [] // Could add attachment functionality later
    };

    onSend(emailData);
    onClose();
    
    // Reset form
    setSelectedContacts([]);
    setCcContacts([]);
    setSubject('');
    setBody('');
  };

  const getContactTypeColor = (type: string) => {
    switch (type) {
      case 'customer': return 'bg-blue-100 text-blue-800';
      case 'colleague': return 'bg-green-100 text-green-800';
      case 'vendor': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-4xl shadow-lg rounded-md bg-white">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-medium text-gray-900">
            Compose Email {deal && `- ${deal.title}`}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        <div className="space-y-6">
          {/* Recipients */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              To: *
            </label>
            <div className="flex flex-wrap gap-2 mb-2">
              {selectedContacts.map((contact) => (
                <span
                  key={contact.id}
                  className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
                >
                  {contact.firstName} {contact.lastName} ({contact.email})
                  <button
                    onClick={() => handleRemoveContact(contact.id, 'to')}
                    className="ml-2 text-blue-600 hover:text-blue-800"
                  >
                    <XMarkIcon className="h-4 w-4" />
                  </button>
                </span>
              ))}
            </div>
            <button
              onClick={() => {
                setAddingTo('to');
                setShowContactList(true);
              }}
              className="inline-flex items-center px-3 py-1 border border-gray-300 rounded-md text-sm text-gray-700 bg-white hover:bg-gray-50"
            >
              <UserPlusIcon className="h-4 w-4 mr-1" />
              Add Recipient
            </button>
          </div>

          {/* CC */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              CC:
            </label>
            <div className="flex flex-wrap gap-2 mb-2">
              {ccContacts.map((contact) => (
                <span
                  key={contact.id}
                  className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-gray-100 text-gray-800"
                >
                  {contact.firstName} {contact.lastName} ({contact.email})
                  <button
                    onClick={() => handleRemoveContact(contact.id, 'cc')}
                    className="ml-2 text-gray-600 hover:text-gray-800"
                  >
                    <XMarkIcon className="h-4 w-4" />
                  </button>
                </span>
              ))}
            </div>
            <button
              onClick={() => {
                setAddingTo('cc');
                setShowContactList(true);
              }}
              className="inline-flex items-center px-3 py-1 border border-gray-300 rounded-md text-sm text-gray-700 bg-white hover:bg-gray-50"
            >
              <UserPlusIcon className="h-4 w-4 mr-1" />
              Add CC
            </button>
          </div>

          {/* Subject */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Subject: *
            </label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              placeholder="Enter email subject"
            />
          </div>

          {/* Body */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Message: *
            </label>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={12}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              placeholder="Enter your message"
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSend}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700"
            >
              <PaperAirplaneIcon className="h-4 w-4 mr-1" />
              Send Email
            </button>
          </div>
        </div>

        {/* Contact Selection Modal */}
        {showContactList && (
          <div className="absolute inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center">
            <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-96 overflow-hidden">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-lg font-medium">Select Contact</h4>
                <button
                  onClick={() => {
                    setShowContactList(false);
                    setSearchTerm('');
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>

              {/* Search */}
              <div className="relative mb-4">
                <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-3 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search contacts..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              {/* Contacts List */}
              <div className="max-h-64 overflow-y-auto">
                <div className="space-y-2">
                  {filteredContacts.map((contact) => (
                    <div
                      key={contact.id}
                      onClick={() => handleContactSelect(contact)}
                      className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
                    >
                      <div className="flex items-center space-x-3">
                        <UserIcon className="h-6 w-6 text-gray-400" />
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="font-medium text-gray-900">{contact.firstName} {contact.lastName}</span>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getContactTypeColor(contact.type)}`}>
                              {contact.type}
                            </span>
                          </div>
                          <div className="text-sm text-gray-500">
                            {contact.email} • {contact.company}
                          </div>
                        </div>
                      </div>
                      <AtSymbolIcon className="h-5 w-5 text-gray-400" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmailModal;