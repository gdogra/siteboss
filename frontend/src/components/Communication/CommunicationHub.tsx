import React, { useState, useEffect } from 'react';
import {
  PlusIcon,
  EnvelopeIcon,
  PhoneIcon,
  ChatBubbleLeftRightIcon,
  EllipsisVerticalIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  PaperAirplaneIcon,
  MicrophoneIcon,
  VideoCameraIcon,
  DocumentTextIcon,
  ClockIcon,
  UserIcon,
  CheckIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

interface Communication {
  id: string;
  type: 'email' | 'sms' | 'call' | 'meeting' | 'note';
  direction: 'inbound' | 'outbound';
  subject?: string;
  content: string;
  from: string;
  to: string;
  timestamp: Date;
  status: 'sent' | 'delivered' | 'read' | 'failed' | 'scheduled';
  lead_id?: string;
  deal_id?: string;
  contact_name: string;
  contact_email: string;
  contact_phone: string;
  duration?: number; // For calls in seconds
  recording_url?: string;
  attachments?: { name: string; url: string; size: number }[];
}

interface Contact {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  last_contact: Date;
  total_communications: number;
  status: 'active' | 'inactive' | 'do_not_contact';
}

const CommunicationHub: React.FC = () => {
  const [communications, setCommunications] = useState<Communication[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [activeTab, setActiveTab] = useState<'inbox' | 'sent' | 'scheduled' | 'analytics'>('inbox');
  const [selectedType, setSelectedType] = useState<'all' | 'email' | 'sms' | 'call' | 'meeting' | 'note'>('all');
  const [isComposingEmail, setIsComposingEmail] = useState(false);
  const [isComposingSMS, setIsComposingSMS] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  // Mock data
  useEffect(() => {
    const mockContacts: Contact[] = [
      {
        id: '1',
        name: 'Sarah Johnson',
        email: 'sarah@johnsonhomes.com',
        phone: '+1 (555) 123-4567',
        company: 'Johnson Homes',
        last_contact: new Date('2024-01-15'),
        total_communications: 12,
        status: 'active'
      },
      {
        id: '2',
        name: 'Mike Rodriguez',
        email: 'mike@constructionco.com',
        phone: '+1 (555) 234-5678',
        company: 'Rodriguez Construction',
        last_contact: new Date('2024-01-14'),
        total_communications: 8,
        status: 'active'
      },
      {
        id: '3',
        name: 'Lisa Chen',
        email: 'lisa@techstartup.com',
        phone: '+1 (555) 345-6789',
        company: 'Tech Startup Inc',
        last_contact: new Date('2024-01-13'),
        total_communications: 15,
        status: 'active'
      }
    ];

    const mockCommunications: Communication[] = [
      {
        id: '1',
        type: 'email',
        direction: 'inbound',
        subject: 'Kitchen Renovation Quote Request',
        content: 'Hi, I\'m interested in getting a quote for a complete kitchen renovation. The space is about 200 sq ft. When would be a good time to schedule a consultation?',
        from: 'sarah@johnsonhomes.com',
        to: 'sales@siteboss.com',
        timestamp: new Date('2024-01-15T10:30:00'),
        status: 'read',
        contact_name: 'Sarah Johnson',
        contact_email: 'sarah@johnsonhomes.com',
        contact_phone: '+1 (555) 123-4567',
        lead_id: '1'
      },
      {
        id: '2',
        type: 'call',
        direction: 'outbound',
        content: 'Discussed project timeline and budget. Client interested in starting in March. Follow-up meeting scheduled for next week.',
        from: 'john@siteboss.com',
        to: '+1 (555) 234-5678',
        timestamp: new Date('2024-01-14T14:15:00'),
        status: 'delivered',
        contact_name: 'Mike Rodriguez',
        contact_email: 'mike@constructionco.com',
        contact_phone: '+1 (555) 234-5678',
        duration: 1320,
        deal_id: '2'
      },
      {
        id: '3',
        type: 'sms',
        direction: 'outbound',
        content: 'Hi Lisa, this is John from SiteBoss. Thank you for your interest in our office renovation services. I\'ve sent the proposal to your email. Let me know if you have any questions!',
        from: 'john@siteboss.com',
        to: '+1 (555) 345-6789',
        timestamp: new Date('2024-01-13T16:45:00'),
        status: 'delivered',
        contact_name: 'Lisa Chen',
        contact_email: 'lisa@techstartup.com',
        contact_phone: '+1 (555) 345-6789',
        lead_id: '3'
      },
      {
        id: '4',
        type: 'email',
        direction: 'outbound',
        subject: 'Project Proposal - Office Renovation',
        content: 'Dear Lisa, Please find attached our detailed proposal for your office renovation project. We\'ve included timeline, materials, and pricing. Looking forward to hearing from you.',
        from: 'john@siteboss.com',
        to: 'lisa@techstartup.com',
        timestamp: new Date('2024-01-13T16:30:00'),
        status: 'read',
        contact_name: 'Lisa Chen',
        contact_email: 'lisa@techstartup.com',
        contact_phone: '+1 (555) 345-6789',
        attachments: [
          { name: 'Office_Renovation_Proposal.pdf', url: '#', size: 2400000 }
        ]
      }
    ];

    setTimeout(() => {
      setContacts(mockContacts);
      setCommunications(mockCommunications);
      setLoading(false);
    }, 1000);
  }, []);

  const formatDate = (date: Date): string => {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDuration = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'email':
        return <EnvelopeIcon className="h-4 w-4" />;
      case 'sms':
        return <ChatBubbleLeftRightIcon className="h-4 w-4" />;
      case 'call':
        return <PhoneIcon className="h-4 w-4" />;
      case 'meeting':
        return <VideoCameraIcon className="h-4 w-4" />;
      case 'note':
        return <DocumentTextIcon className="h-4 w-4" />;
      default:
        return <DocumentTextIcon className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'sent':
        return 'text-blue-600';
      case 'delivered':
        return 'text-green-600';
      case 'read':
        return 'text-purple-600';
      case 'failed':
        return 'text-red-600';
      case 'scheduled':
        return 'text-yellow-600';
      default:
        return 'text-gray-600';
    }
  };

  const handleCommunicationAction = (communicationId: string) => {
    // TODO: Implement communication actions (reply, forward, etc.)
    console.log('Communication action for:', communicationId);
  };

  const filteredCommunications = communications.filter(comm => {
    const matchesTab = activeTab === 'inbox' ? comm.direction === 'inbound' : 
                      activeTab === 'sent' ? comm.direction === 'outbound' : true;
    const matchesType = selectedType === 'all' || comm.type === selectedType;
    const matchesSearch = comm.contact_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         comm.subject?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         comm.content.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesTab && matchesType && matchesSearch;
  });

  const getCommunicationStats = () => {
    const total = communications.length;
    const emails = communications.filter(c => c.type === 'email').length;
    const calls = communications.filter(c => c.type === 'call').length;
    const sms = communications.filter(c => c.type === 'sms').length;
    const responseRate = Math.round((communications.filter(c => c.direction === 'inbound').length / total) * 100);
    
    return { total, emails, calls, sms, responseRate };
  };

  const stats = getCommunicationStats();

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-300 rounded w-1/4 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="bg-gray-200 h-24 rounded"></div>
            ))}
          </div>
          <div className="bg-gray-200 h-96 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Communication Hub</h1>
          <p className="text-gray-600 mt-1">Manage all customer communications in one place</p>
        </div>
        <div className="flex space-x-3">
          <button 
            onClick={() => setIsComposingEmail(true)}
            className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
          >
            <EnvelopeIcon className="h-5 w-5" />
            <span>New Email</span>
          </button>
          <button 
            onClick={() => setIsComposingSMS(true)}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
          >
            <ChatBubbleLeftRightIcon className="h-5 w-5" />
            <span>New SMS</span>
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
        <div className="bg-white rounded-lg p-4 shadow border">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <DocumentTextIcon className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-500">Total Communications</h3>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-4 shadow border">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <EnvelopeIcon className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-500">Emails</h3>
              <p className="text-2xl font-bold text-gray-900">{stats.emails}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-4 shadow border">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <PhoneIcon className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-500">Calls</h3>
              <p className="text-2xl font-bold text-gray-900">{stats.calls}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-4 shadow border">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <ChatBubbleLeftRightIcon className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-500">SMS</h3>
              <p className="text-2xl font-bold text-gray-900">{stats.sms}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-4 shadow border">
          <div className="flex items-center">
            <div className="p-2 bg-orange-100 rounded-lg">
              <CheckIcon className="h-6 w-6 text-orange-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-500">Response Rate</h3>
              <p className="text-2xl font-bold text-gray-900">{stats.responseRate}%</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Contacts Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow border">
            <div className="p-4 border-b border-gray-200">
              <h3 className="font-medium text-gray-900">Recent Contacts</h3>
            </div>
            <div className="max-h-96 overflow-y-auto">
              {contacts.map((contact) => (
                <div
                  key={contact.id}
                  onClick={() => setSelectedContact(contact)}
                  className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 ${
                    selectedContact?.id === contact.id ? 'bg-primary-50 border-primary-200' : ''
                  }`}
                >
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="h-8 w-8 bg-primary-600 rounded-full flex items-center justify-center">
                        <span className="text-xs font-medium text-white">
                          {contact.name.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                    </div>
                    <div className="ml-3 flex-1">
                      <p className="text-sm font-medium text-gray-900">{contact.name}</p>
                      <p className="text-xs text-gray-500">{contact.company}</p>
                      <p className="text-xs text-gray-400 mt-1">{formatDate(contact.last_contact)}</p>
                    </div>
                    <div className="text-xs text-gray-400">
                      {contact.total_communications}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Communications Main Area */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-lg shadow border">
            {/* Tabs and Filters */}
            <div className="border-b border-gray-200">
              <div className="p-4 flex flex-col space-y-4">
                {/* Tabs */}
                <div className="flex space-x-6">
                  {[
                    { key: 'inbox', label: 'Inbox' },
                    { key: 'sent', label: 'Sent' },
                    { key: 'scheduled', label: 'Scheduled' },
                    { key: 'analytics', label: 'Analytics' }
                  ].map((tab) => (
                    <button
                      key={tab.key}
                      onClick={() => setActiveTab(tab.key as any)}
                      className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                        activeTab === tab.key
                          ? 'border-primary-500 text-primary-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                {/* Search and Filters */}
                <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
                  <div className="flex-1 relative">
                    <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search communications..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>
                  <select
                    value={selectedType}
                    onChange={(e) => setSelectedType(e.target.value as any)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    <option value="all">All Types</option>
                    <option value="email">Email</option>
                    <option value="sms">SMS</option>
                    <option value="call">Call</option>
                    <option value="meeting">Meeting</option>
                    <option value="note">Note</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Communications List */}
            <div className="max-h-96 overflow-y-auto">
              {filteredCommunications.map((comm) => (
                <div key={comm.id} className="p-4 border-b border-gray-100 hover:bg-gray-50">
                  <div className="flex items-start space-x-3">
                    <div className={`p-2 rounded-lg ${
                      comm.direction === 'inbound' ? 'bg-blue-100' : 'bg-green-100'
                    }`}>
                      {getTypeIcon(comm.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-medium text-gray-900">{comm.contact_name}</p>
                          {comm.subject && (
                            <p className="text-sm font-medium text-gray-700 mt-1">{comm.subject}</p>
                          )}
                          <p className="text-sm text-gray-600 mt-1 line-clamp-2">{comm.content}</p>
                          <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                            <span>{formatDate(comm.timestamp)}</span>
                            {comm.duration && (
                              <span className="flex items-center">
                                <ClockIcon className="h-3 w-3 mr-1" />
                                {formatDuration(comm.duration)}
                              </span>
                            )}
                            {comm.attachments && comm.attachments.length > 0 && (
                              <span className="flex items-center">
                                <DocumentTextIcon className="h-3 w-3 mr-1" />
                                {comm.attachments.length} attachment{comm.attachments.length > 1 ? 's' : ''}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center space-x-2 ml-4">
                          <span className={`text-xs font-medium ${getStatusColor(comm.status)}`}>
                            {comm.status.charAt(0).toUpperCase() + comm.status.slice(1)}
                          </span>
                          <button 
                            onClick={() => handleCommunicationAction(comm.id)}
                            className="text-gray-400 hover:text-gray-600"
                          >
                            <EllipsisVerticalIcon className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              
              {filteredCommunications.length === 0 && (
                <div className="text-center py-12">
                  <DocumentTextIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No communications found</p>
                  <p className="text-sm text-gray-400 mt-1">Try adjusting your filters</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommunicationHub;