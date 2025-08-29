import React, { useState, useEffect } from 'react';
import {
  XMarkIcon,
  PaperAirplaneIcon,
  UserPlusIcon,
  MagnifyingGlassIcon,
  PhoneIcon,
  UserIcon,
  ChatBubbleLeftRightIcon
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

interface SMSModalProps {
  isOpen: boolean;
  onClose: () => void;
  deal?: Deal;
  contact?: Contact;
  onSend: (smsData: {
    to: string[];
    message: string;
  }) => void;
}

const SMSModal: React.FC<SMSModalProps> = ({ isOpen, onClose, deal, contact, onSend }) => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [filteredContacts, setFilteredContacts] = useState<Contact[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedContacts, setSelectedContacts] = useState<Contact[]>([]);
  const [message, setMessage] = useState('');
  const [showContactList, setShowContactList] = useState(false);

  // SMS templates
  const templates = [
    {
      id: '1',
      name: 'Follow-up',
      content: 'Hi {name}, this is {sender} from SiteBoss. Just checking in on your {project} project. Can we schedule a quick call? Thanks!'
    },
    {
      id: '2',
      name: 'Project Update',
      content: 'Hi {name}, wanted to give you a quick update on your {project} project. Everything is progressing well. Will call you tomorrow to discuss details.'
    },
    {
      id: '3',
      name: 'Appointment Reminder',
      content: 'Hi {name}, this is a reminder about our meeting tomorrow regarding your {project} project. Looking forward to speaking with you!'
    },
    {
      id: '4',
      name: 'Thank You',
      content: 'Hi {name}, thank you for choosing SiteBoss for your {project} project! We appreciate your business and look forward to working with you.'
    },
    {
      id: '5',
      name: 'Proposal Ready',
      content: 'Hi {name}, your proposal for the {project} project is ready for review. When would be a good time to discuss? Thanks!'
    }
  ];

  // Mock contacts data (same as EmailModal but with phone numbers)
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
        }
      ];

      setContacts(mockContacts.filter(c => c.phone)); // Only contacts with phone numbers
      
      // Auto-populate if we have contact information (from contact card)
      if (contact && contact.phone) {
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
        
        // Set default message based on contact type
        const firstName = contact.firstName;
        const contactTypeMessages = {
          customer: `Hi ${firstName}, this is SiteBoss reaching out about your upcoming project. We'd love to discuss how we can help bring your vision to life. When would be a good time for a quick call?`,
          vendor: `Hi ${firstName}, this is SiteBoss. We're interested in exploring partnership opportunities with ${contact.company}. Could we schedule a brief call to discuss potential collaboration?`,
          partner: `Hi ${firstName}, this is SiteBoss. I wanted to touch base regarding our ongoing partnership. When would be a good time to discuss upcoming projects?`,
          colleague: `Hi ${firstName}, just wanted to follow up on our recent discussion. Let me know if you need anything!`,
          lead: `Hi ${firstName}, thank you for your interest in SiteBoss! We're excited to help with your project. When would be a convenient time to discuss your requirements?`
        };
        
        setMessage(contactTypeMessages[contact.type] || contactTypeMessages.customer);
      }
      // Auto-populate if we have deal information (from sales pipeline)
      else if (deal) {
        const dealCustomer = mockContacts.find(c => `${c.firstName} ${c.lastName}` === deal.customer && c.phone);
        if (dealCustomer) {
          setSelectedContacts([dealCustomer]);
        }
        
        // Set default message for deals
        setMessage(`Hi ${deal.customer.split(' ')[0]}, this is ${deal.assigned_to} from SiteBoss. I wanted to follow up on your ${deal.title} project (${new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(deal.value)}). Can we schedule a quick call to discuss next steps? Thanks!`);
      }
    }
  }, [isOpen, deal, contact]);

  // Filter contacts based on search
  useEffect(() => {
    if (searchTerm) {
      const filtered = contacts.filter(contact =>
        `${contact.firstName} ${contact.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contact.phone?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contact.company?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredContacts(filtered);
    } else {
      setFilteredContacts(contacts);
    }
  }, [contacts, searchTerm]);

  const handleContactSelect = (contact: Contact) => {
    if (!selectedContacts.find(c => c.id === contact.id)) {
      setSelectedContacts([...selectedContacts, contact]);
    }
    setShowContactList(false);
    setSearchTerm('');
  };

  const handleRemoveContact = (contactId: string) => {
    setSelectedContacts(selectedContacts.filter(c => c.id !== contactId));
  };

  const handleTemplateSelect = (template: any) => {
    let templatedMessage = template.content;
    
    if (contact) {
      // Use contact information for personalization
      templatedMessage = templatedMessage
        .replace('{name}', contact.firstName)
        .replace('{sender}', 'SiteBoss Team')
        .replace('{project}', `your ${contact.type === 'customer' ? 'project' : 'business'}`);
    } else if (deal && selectedContacts.length > 0) {
      // Use deal information for personalization
      templatedMessage = templatedMessage
        .replace('{name}', selectedContacts[0].firstName)
        .replace('{sender}', deal.assigned_to)
        .replace('{project}', deal.title);
    } else if (selectedContacts.length > 0) {
      // Use selected contact information
      templatedMessage = templatedMessage
        .replace('{name}', selectedContacts[0].firstName)
        .replace('{sender}', 'SiteBoss Team')
        .replace('{project}', 'your project');
    }
    
    setMessage(templatedMessage);
  };

  const handleSend = () => {
    if (selectedContacts.length === 0) {
      alert('Please select at least one recipient');
      return;
    }
    if (!message.trim()) {
      alert('Please enter a message');
      return;
    }

    const smsData = {
      to: selectedContacts.map(c => c.phone || ''),
      message: message.trim()
    };

    onSend(smsData);
    onClose();
    
    // Reset form
    setSelectedContacts([]);
    setMessage('');
  };

  const getContactTypeColor = (type: string) => {
    switch (type) {
      case 'customer': return 'bg-blue-100 text-blue-800';
      case 'colleague': return 'bg-green-100 text-green-800';
      case 'vendor': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const messageLength = message.length;
  const maxLength = 160;
  const smsCount = Math.ceil(messageLength / maxLength);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-3xl shadow-lg rounded-md bg-white">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-medium text-gray-900">
            <ChatBubbleLeftRightIcon className="h-6 w-6 inline mr-2" />
            Send SMS {deal && `- ${deal.title}`}
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
              Send To: *
            </label>
            <div className="flex flex-wrap gap-2 mb-2">
              {selectedContacts.map((contact) => (
                <span
                  key={contact.id}
                  className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-green-100 text-green-800"
                >
                  {contact.firstName} {contact.lastName} ({contact.phone})
                  <button
                    onClick={() => handleRemoveContact(contact.id)}
                    className="ml-2 text-green-600 hover:text-green-800"
                  >
                    <XMarkIcon className="h-4 w-4" />
                  </button>
                </span>
              ))}
            </div>
            <button
              onClick={() => setShowContactList(true)}
              className="inline-flex items-center px-3 py-1 border border-gray-300 rounded-md text-sm text-gray-700 bg-white hover:bg-gray-50"
            >
              <UserPlusIcon className="h-4 w-4 mr-1" />
              Add Recipient
            </button>
          </div>

          {/* Templates */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Quick Templates:
            </label>
            <div className="flex flex-wrap gap-2">
              {templates.map((template) => (
                <button
                  key={template.id}
                  onClick={() => handleTemplateSelect(template)}
                  className="px-3 py-1 text-xs border border-gray-300 rounded-full text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                >
                  {template.name}
                </button>
              ))}
            </div>
          </div>

          {/* Message */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Message: *
            </label>
            <div className="relative">
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={6}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                placeholder="Type your message here..."
                maxLength={maxLength * 3} // Allow up to 3 SMS
              />
              <div className="absolute bottom-2 right-2 text-xs text-gray-500">
                {messageLength}/{maxLength * 3} chars • {smsCount} SMS
              </div>
            </div>
            {smsCount > 1 && (
              <p className="text-xs text-yellow-600 mt-1">
                ⚠️ This message will be sent as {smsCount} text messages
              </p>
            )}
          </div>

          {/* Preview */}
          {selectedContacts.length > 0 && message && (
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Preview:</h4>
              <div className="text-sm text-gray-600">
                <strong>To:</strong> {selectedContacts.map(c => `${c.firstName} ${c.lastName} (${c.phone})`).join(', ')}
              </div>
              <div className="mt-2 p-3 bg-white rounded border-l-4 border-green-400">
                <p className="text-sm">{message}</p>
              </div>
            </div>
          )}

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
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700"
            >
              <PaperAirplaneIcon className="h-4 w-4 mr-1" />
              Send SMS
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
                  placeholder="Search contacts with phone numbers..."
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
                            {contact.phone} • {contact.company}
                          </div>
                        </div>
                      </div>
                      <PhoneIcon className="h-5 w-5 text-gray-400" />
                    </div>
                  ))}
                  
                  {filteredContacts.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <PhoneIcon className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p>No contacts with phone numbers found</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SMSModal;