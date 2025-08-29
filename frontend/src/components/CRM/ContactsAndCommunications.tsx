import React, { useState, useEffect } from 'react';
import {
  PlusIcon,
  MagnifyingGlassIcon,
  UserIcon,
  PhoneIcon,
  AtSymbolIcon,
  BuildingOfficeIcon,
  TagIcon,
  PencilIcon,
  TrashIcon,
  EnvelopeIcon,
  ChatBubbleLeftRightIcon,
  StarIcon,
  CalendarIcon,
  ClockIcon,
  DocumentTextIcon,
  VideoCameraIcon,
  EllipsisVerticalIcon,
  FunnelIcon,
  XMarkIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { StarIcon as StarSolidIcon } from '@heroicons/react/24/solid';
import { useAuth } from '../../contexts/AuthContext';
import { UserRole } from '../../types';
import EmailModal from './EmailModal';
import SMSModal from './SMSModal';

interface Contact {
  id: string;
  firstName: string;
  lastName: string;
  company: string;
  title: string;
  email: string;
  phone: string;
  mobile?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  website?: string;
  notes?: string;
  tags: string[];
  type: 'customer' | 'vendor' | 'partner' | 'colleague' | 'lead';
  priority: 'low' | 'medium' | 'high';
  isFavorite: boolean;
  lastContact?: Date;
  totalCommunications: number;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  visibleToRoles: UserRole[];
  ownedBy: string;
  status: 'active' | 'inactive' | 'do_not_contact';
}

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
  contactId: string;
  contactName: string;
  duration?: number;
  attachments?: { name: string; url: string; size: number }[];
}

const ContactsAndCommunications: React.FC = () => {
  const { user } = useAuth();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [communications, setCommunications] = useState<Communication[]>([]);
  const [filteredContacts, setFilteredContacts] = useState<Contact[]>([]);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [activeView, setActiveView] = useState<'contacts' | 'communications' | 'contact-detail'>('contacts');
  const [activeCommTab, setActiveCommTab] = useState<'all' | 'inbox' | 'sent'>('all');
  
  // Search and filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedPriority, setSelectedPriority] = useState<string>('all');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [sortBy, setSortBy] = useState<'name' | 'company' | 'lastContact' | 'created'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  
  // Modals
  const [showContactModal, setShowContactModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [isSMSModalOpen, setIsSMSModalOpen] = useState(false);
  
  const [loading, setLoading] = useState(true);

  // Mock data combining both contact and communication data
  useEffect(() => {
    const mockContacts: Contact[] = [
      {
        id: '1',
        firstName: 'Sarah',
        lastName: 'Johnson',
        company: 'Johnson Construction',
        title: 'Project Manager',
        email: 'sarah.johnson@johnsonconstruction.com',
        phone: '(555) 123-4567',
        mobile: '(555) 123-4568',
        address: '123 Main St',
        city: 'Springfield',
        state: 'IL',
        zipCode: '62701',
        website: 'www.johnsonconstruction.com',
        notes: 'Prefers morning meetings. Kitchen renovation specialist.',
        tags: ['VIP', 'Kitchen', 'Residential'],
        type: 'customer',
        priority: 'high',
        isFavorite: true,
        lastContact: new Date('2024-01-15'),
        totalCommunications: 12,
        createdBy: 'John Smith',
        createdAt: new Date('2023-12-01'),
        updatedAt: new Date('2024-01-15'),
        visibleToRoles: ['super_admin', 'company_admin', 'project_manager', 'foreman'],
        ownedBy: 'John Smith',
        status: 'active'
      },
      {
        id: '2',
        firstName: 'Mike',
        lastName: 'Rodriguez',
        company: 'Rodriguez Properties',
        title: 'Real Estate Developer',
        email: 'mike@rodriguezprops.com',
        phone: '(555) 234-5678',
        mobile: '(555) 234-5679',
        address: '456 Oak Ave',
        city: 'Chicago',
        state: 'IL',
        zipCode: '60601',
        website: 'www.rodriguezproperties.com',
        notes: 'Large scale commercial projects. Always on time with payments.',
        tags: ['Commercial', 'Multi-Unit', 'High-Value'],
        type: 'customer',
        priority: 'high',
        isFavorite: true,
        lastContact: new Date('2024-01-14'),
        totalCommunications: 8,
        createdBy: 'Sarah Wilson',
        createdAt: new Date('2023-11-15'),
        updatedAt: new Date('2024-01-14'),
        visibleToRoles: ['super_admin', 'company_admin', 'project_manager'],
        ownedBy: 'Sarah Wilson',
        status: 'active'
      },
      {
        id: '3',
        firstName: 'Lisa',
        lastName: 'Chen',
        company: 'TechStartup Inc.',
        title: 'CEO',
        email: 'lisa.chen@techstartup.com',
        phone: '(555) 345-6789',
        mobile: '(555) 345-6790',
        address: '789 Tech Blvd',
        city: 'Austin',
        state: 'TX',
        zipCode: '73301',
        notes: 'Office renovation project. Interested in sustainable materials.',
        tags: ['Office', 'Sustainable', 'Tech'],
        type: 'customer',
        priority: 'medium',
        isFavorite: false,
        lastContact: new Date('2024-01-11'),
        totalCommunications: 15,
        createdBy: 'Mike Johnson',
        createdAt: new Date('2024-01-08'),
        updatedAt: new Date('2024-01-11'),
        visibleToRoles: ['super_admin', 'company_admin', 'project_manager'],
        ownedBy: 'Mike Johnson',
        status: 'active'
      },
      {
        id: '4',
        firstName: 'ABC',
        lastName: 'Suppliers',
        company: 'ABC Construction Supplies',
        title: 'Sales Manager',
        email: 'orders@abcsuppliers.com',
        phone: '(555) 456-7890',
        address: '321 Industrial Way',
        city: 'Springfield',
        state: 'IL',
        zipCode: '62702',
        website: 'www.abcsuppliers.com',
        notes: 'Bulk order discounts available. 30-day payment terms.',
        tags: ['Materials', 'Bulk', 'Reliable'],
        type: 'vendor',
        priority: 'medium',
        isFavorite: true,
        lastContact: new Date('2024-01-10'),
        totalCommunications: 25,
        createdBy: 'John Smith',
        createdAt: new Date('2023-10-01'),
        updatedAt: new Date('2024-01-10'),
        visibleToRoles: ['super_admin', 'company_admin', 'project_manager', 'foreman'],
        ownedBy: 'John Smith',
        status: 'active'
      },
      {
        id: '5',
        firstName: 'Emily',
        lastName: 'Davis',
        company: 'SiteBoss',
        title: 'Senior Project Manager',
        email: 'emily.davis@siteboss.com',
        phone: '(555) 678-9012',
        mobile: '(555) 678-9013',
        notes: 'Team lead for large commercial projects. Expert in LEED certification.',
        tags: ['Internal', 'LEED', 'Leadership'],
        type: 'colleague',
        priority: 'low',
        isFavorite: false,
        lastContact: new Date('2024-01-16'),
        totalCommunications: 45,
        createdBy: 'John Smith',
        createdAt: new Date('2023-08-01'),
        updatedAt: new Date('2024-01-16'),
        visibleToRoles: ['super_admin', 'company_admin', 'project_manager', 'foreman', 'worker'],
        ownedBy: 'John Smith',
        status: 'active'
      }
    ];

    const mockCommunications: Communication[] = [
      {
        id: '1',
        type: 'email',
        direction: 'inbound',
        subject: 'Kitchen Renovation Quote Request',
        content: 'Hi, I\'m interested in getting a quote for a complete kitchen renovation. The space is about 200 sq ft.',
        from: 'sarah.johnson@johnsonconstruction.com',
        to: 'sales@siteboss.com',
        timestamp: new Date('2024-01-15T10:30:00'),
        status: 'read',
        contactId: '1',
        contactName: 'Sarah Johnson'
      },
      {
        id: '2',
        type: 'call',
        direction: 'outbound',
        content: 'Discussed project timeline and budget. Client interested in starting in March.',
        from: 'john@siteboss.com',
        to: '(555) 234-5678',
        timestamp: new Date('2024-01-14T14:15:00'),
        status: 'delivered',
        contactId: '2',
        contactName: 'Mike Rodriguez',
        duration: 1320
      },
      {
        id: '3',
        type: 'sms',
        direction: 'outbound',
        content: 'Hi Lisa, this is John from SiteBoss. Thank you for your interest in our office renovation services.',
        from: 'john@siteboss.com',
        to: '(555) 345-6789',
        timestamp: new Date('2024-01-13T16:45:00'),
        status: 'delivered',
        contactId: '3',
        contactName: 'Lisa Chen'
      }
    ];

    // Filter contacts based on user role
    const accessibleContacts = mockContacts.filter(contact => 
      contact.visibleToRoles.includes(user?.role || 'worker') ||
      contact.ownedBy === user?.email ||
      contact.createdBy === user?.email
    );

    setTimeout(() => {
      setContacts(accessibleContacts);
      setCommunications(mockCommunications);
      setLoading(false);
    }, 500);
  }, [user]);

  // Filter contacts
  useEffect(() => {
    let filtered = [...contacts];

    if (searchTerm) {
      filtered = filtered.filter(contact =>
        `${contact.firstName} ${contact.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contact.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contact.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contact.phone.includes(searchTerm) ||
        contact.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    if (selectedType !== 'all') {
      filtered = filtered.filter(contact => contact.type === selectedType);
    }

    if (selectedPriority !== 'all') {
      filtered = filtered.filter(contact => contact.priority === selectedPriority);
    }

    if (showFavoritesOnly) {
      filtered = filtered.filter(contact => contact.isFavorite);
    }

    // Sort
    filtered.sort((a, b) => {
      let aValue: any, bValue: any;

      switch (sortBy) {
        case 'name':
          aValue = `${a.firstName} ${a.lastName}`.toLowerCase();
          bValue = `${b.firstName} ${b.lastName}`.toLowerCase();
          break;
        case 'company':
          aValue = a.company.toLowerCase();
          bValue = b.company.toLowerCase();
          break;
        case 'lastContact':
          aValue = a.lastContact || new Date(0);
          bValue = b.lastContact || new Date(0);
          break;
        case 'created':
          aValue = a.createdAt;
          bValue = b.createdAt;
          break;
        default:
          aValue = `${a.firstName} ${a.lastName}`.toLowerCase();
          bValue = `${b.firstName} ${b.lastName}`.toLowerCase();
      }

      if (sortOrder === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });

    setFilteredContacts(filtered);
  }, [contacts, searchTerm, selectedType, selectedPriority, showFavoritesOnly, sortBy, sortOrder]);

  const handleContactClick = (contact: Contact) => {
    setSelectedContact(contact);
    setActiveView('contact-detail');
  };

  const handleToggleFavorite = (contactId: string) => {
    setContacts(contacts.map(contact =>
      contact.id === contactId
        ? { ...contact, isFavorite: !contact.isFavorite, updatedAt: new Date() }
        : contact
    ));
  };

  const handleEmailClick = (contact: Contact) => {
    setSelectedContact(contact);
    setIsEmailModalOpen(true);
  };

  const handleSMSClick = (contact: Contact) => {
    setSelectedContact(contact);
    setIsSMSModalOpen(true);
  };

  const handleEmailSend = (emailData: any) => {
    console.log('Sending email:', emailData);
    alert(`Email sent successfully to ${emailData.to.join(', ')}`);
    
    // Add to communications
    const newComm: Communication = {
      id: Date.now().toString(),
      type: 'email',
      direction: 'outbound',
      subject: emailData.subject,
      content: emailData.body,
      from: user?.email || 'you@company.com',
      to: emailData.to[0],
      timestamp: new Date(),
      status: 'sent',
      contactId: selectedContact?.id || '',
      contactName: selectedContact ? `${selectedContact.firstName} ${selectedContact.lastName}` : ''
    };
    
    setCommunications(prev => [newComm, ...prev]);
    
    // Update contact last activity
    if (selectedContact) {
      setContacts(prev => prev.map(c => 
        c.id === selectedContact.id 
          ? { ...c, lastContact: new Date(), totalCommunications: c.totalCommunications + 1 }
          : c
      ));
    }
  };

  const handleSMSSend = (smsData: any) => {
    console.log('Sending SMS:', smsData);
    alert(`SMS sent successfully to ${smsData.to.join(', ')}`);
    
    // Add to communications
    const newComm: Communication = {
      id: Date.now().toString(),
      type: 'sms',
      direction: 'outbound',
      content: smsData.message,
      from: user?.email || 'you@company.com',
      to: smsData.to[0],
      timestamp: new Date(),
      status: 'sent',
      contactId: selectedContact?.id || '',
      contactName: selectedContact ? `${selectedContact.firstName} ${selectedContact.lastName}` : ''
    };
    
    setCommunications(prev => [newComm, ...prev]);
    
    // Update contact last activity
    if (selectedContact) {
      setContacts(prev => prev.map(c => 
        c.id === selectedContact.id 
          ? { ...c, lastContact: new Date(), totalCommunications: c.totalCommunications + 1 }
          : c
      ));
    }
  };

  const handleSaveContact = (contactData: Partial<Contact>) => {
    if (selectedContact) {
      // Update existing contact
      setContacts(prev => prev.map(contact => 
        contact.id === selectedContact.id 
          ? { ...contact, ...contactData, id: selectedContact.id }
          : contact
      ));
      alert('Contact updated successfully!');
    } else {
      // Create new contact
      const newContact: Contact = {
        id: `contact-${Date.now()}`,
        firstName: contactData.firstName || '',
        lastName: contactData.lastName || '',
        company: contactData.company || '',
        title: contactData.title || '',
        email: contactData.email || '',
        phone: contactData.phone || '',
        mobile: contactData.mobile || '',
        address: contactData.address || '',
        city: contactData.city || '',
        state: contactData.state || '',
        zipCode: contactData.zipCode || '',
        website: contactData.website || '',
        notes: contactData.notes || '',
        tags: contactData.tags || [],
        type: contactData.type || 'customer',
        priority: contactData.priority || 'medium',
        isFavorite: contactData.isFavorite || false,
        lastContact: undefined,
        totalCommunications: 0,
        createdBy: contactData.createdBy || user?.email || 'unknown',
        createdAt: new Date(),
        updatedAt: new Date(),
        visibleToRoles: contactData.visibleToRoles || ['company_admin', 'project_manager'] as UserRole[],
        ownedBy: contactData.ownedBy || user?.email || 'unknown',
        status: contactData.status || 'active'
      };
      
      setContacts(prev => [newContact, ...prev]);
      alert('Contact created successfully!');
    }
    
    // Close modal
    setShowContactModal(false);
    setSelectedContact(null);
    setIsEditing(false);
  };

  const canEditContact = (contact: Contact) => {
    if (!user) return false;
    if (['super_admin', 'company_admin'].includes(user.role)) return true;
    if (contact.ownedBy === user.email || contact.createdBy === user.email) return true;
    return false;
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'customer': return 'bg-blue-100 text-blue-800';
      case 'vendor': return 'bg-yellow-100 text-yellow-800';
      case 'partner': return 'bg-green-100 text-green-800';
      case 'colleague': return 'bg-purple-100 text-purple-800';
      case 'lead': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600';
      case 'medium': return 'text-yellow-600';
      case 'low': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  const formatDate = (date: Date): string => {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'email': return <EnvelopeIcon className="h-4 w-4" />;
      case 'sms': return <ChatBubbleLeftRightIcon className="h-4 w-4" />;
      case 'call': return <PhoneIcon className="h-4 w-4" />;
      case 'meeting': return <VideoCameraIcon className="h-4 w-4" />;
      case 'note': return <DocumentTextIcon className="h-4 w-4" />;
      default: return <DocumentTextIcon className="h-4 w-4" />;
    }
  };

  const filteredCommunications = communications.filter(comm => {
    const matchesContact = selectedContact ? comm.contactId === selectedContact.id : true;
    const matchesTab = activeCommTab === 'all' ? true :
                      activeCommTab === 'inbox' ? comm.direction === 'inbound' :
                      activeCommTab === 'sent' ? comm.direction === 'outbound' : true;
    return matchesContact && matchesTab;
  });

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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Contacts & Communications
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage your business relationships and communications
          </p>
        </div>
        
        <div className="mt-4 sm:mt-0 flex items-center space-x-3">
          {/* View Toggle */}
          <div className="flex rounded-lg border border-gray-200 p-1">
            <button
              onClick={() => setActiveView('contacts')}
              className={`px-3 py-1 rounded text-sm font-medium ${
                activeView === 'contacts'
                  ? 'bg-primary-100 text-primary-700'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Contacts
            </button>
            <button
              onClick={() => setActiveView('communications')}
              className={`px-3 py-1 rounded text-sm font-medium ${
                activeView === 'communications'
                  ? 'bg-primary-100 text-primary-700'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Communications
            </button>
          </div>

          <button
            onClick={() => {
              setSelectedContact(null);
              setShowContactModal(true);
              setIsEditing(true);
            }}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700"
          >
            <PlusIcon className="h-4 w-4 mr-2" />
            Add Contact
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <UserIcon className="h-6 w-6 text-blue-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Contacts</dt>
                  <dd className="text-lg font-medium text-gray-900">{contacts.length}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <StarSolidIcon className="h-6 w-6 text-yellow-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Favorites</dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {contacts.filter(c => c.isFavorite).length}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <EnvelopeIcon className="h-6 w-6 text-purple-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Emails</dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {communications.filter(c => c.type === 'email').length}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ChatBubbleLeftRightIcon className="h-6 w-6 text-green-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Messages</dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {communications.filter(c => c.type === 'sms').length}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <PhoneIcon className="h-6 w-6 text-orange-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Calls</dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {communications.filter(c => c.type === 'call').length}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      {activeView === 'contacts' && (
        <>
          {/* Filters and Search */}
          <div className="bg-white shadow rounded-lg p-4 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
              {/* Search */}
              <div className="lg:col-span-2">
                <div className="relative">
                  <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-3 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search contacts..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Type Filter */}
              <div>
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="all">All Types</option>
                  <option value="customer">Customers</option>
                  <option value="vendor">Vendors</option>
                  <option value="partner">Partners</option>
                  <option value="colleague">Colleagues</option>
                  <option value="lead">Leads</option>
                </select>
              </div>

              {/* Priority Filter */}
              <div>
                <select
                  value={selectedPriority}
                  onChange={(e) => setSelectedPriority(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="all">All Priorities</option>
                  <option value="high">High Priority</option>
                  <option value="medium">Medium Priority</option>
                  <option value="low">Low Priority</option>
                </select>
              </div>

              {/* Sort */}
              <div>
                <select
                  value={`${sortBy}-${sortOrder}`}
                  onChange={(e) => {
                    const [field, order] = e.target.value.split('-');
                    setSortBy(field as any);
                    setSortOrder(order as any);
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="name-asc">Name A-Z</option>
                  <option value="name-desc">Name Z-A</option>
                  <option value="company-asc">Company A-Z</option>
                  <option value="company-desc">Company Z-A</option>
                  <option value="lastContact-desc">Recent Contact</option>
                  <option value="created-desc">Recently Added</option>
                </select>
              </div>

              {/* Favorites Toggle */}
              <div className="flex items-center">
                <button
                  onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
                  className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    showFavoritesOnly
                      ? 'bg-yellow-100 text-yellow-800 border border-yellow-300'
                      : 'bg-gray-100 text-gray-700 border border-gray-300 hover:bg-gray-200'
                  }`}
                >
                  <StarIcon className="h-4 w-4 mr-1" />
                  Favorites
                </button>
              </div>
            </div>
          </div>

          {/* Contacts Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredContacts.map((contact) => (
              <div
                key={contact.id}
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => handleContactClick(contact)}
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-medium text-gray-900 truncate">
                      {contact.firstName} {contact.lastName}
                    </h3>
                    <p className="text-xs text-gray-500 truncate">{contact.company}</p>
                    {contact.title && (
                      <p className="text-xs text-gray-400 truncate">{contact.title}</p>
                    )}
                  </div>
                  <div className="flex items-center space-x-1 ml-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleFavorite(contact.id);
                      }}
                      className={`p-1 rounded ${contact.isFavorite ? 'text-yellow-500' : 'text-gray-400 hover:text-yellow-500'}`}
                    >
                      {contact.isFavorite ? (
                        <StarSolidIcon className="h-4 w-4" />
                      ) : (
                        <StarIcon className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Contact Info */}
                <div className="space-y-2 mb-3">
                  <div className="flex items-center text-xs text-gray-600">
                    <PhoneIcon className="h-3 w-3 mr-1" />
                    <span className="truncate">{contact.phone}</span>
                  </div>
                  <div className="flex items-center text-xs text-gray-600">
                    <AtSymbolIcon className="h-3 w-3 mr-1" />
                    <span className="truncate">{contact.email}</span>
                  </div>
                </div>

                {/* Type, Priority, and Communications Count */}
                <div className="flex items-center justify-between mb-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(contact.type)}`}>
                    {contact.type}
                  </span>
                  <div className="text-xs text-gray-500">
                    {contact.totalCommunications} messages
                  </div>
                </div>

                {/* Tags */}
                {contact.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-3">
                    {contact.tags.slice(0, 2).map((tag, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs"
                      >
                        {tag}
                      </span>
                    ))}
                    {contact.tags.length > 2 && (
                      <span className="px-2 py-1 bg-gray-100 text-gray-500 rounded text-xs">
                        +{contact.tags.length - 2}
                      </span>
                    )}
                  </div>
                )}

                {/* Actions */}
                <div className="flex justify-between items-center pt-3 border-t border-gray-100">
                  <div className="flex space-x-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEmailClick(contact);
                      }}
                      className="text-xs text-blue-600 hover:text-blue-800"
                      title="Send Email"
                    >
                      <EnvelopeIcon className="h-4 w-4" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSMSClick(contact);
                      }}
                      className="text-xs text-green-600 hover:text-green-800"
                      title="Send SMS"
                    >
                      <ChatBubbleLeftRightIcon className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="flex space-x-1">
                    {canEditContact(contact) && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedContact(contact);
                          setShowContactModal(true);
                          setIsEditing(true);
                        }}
                        className="text-xs text-gray-600 hover:text-gray-800"
                        title="Edit Contact"
                      >
                        <PencilIcon className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Last Contact */}
                {contact.lastContact && (
                  <div className="text-xs text-gray-400 mt-2">
                    Last contact: {contact.lastContact.toLocaleDateString()}
                  </div>
                )}
              </div>
            ))}
          </div>

          {filteredContacts.length === 0 && (
            <div className="text-center py-12">
              <UserIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No contacts found</h3>
              <p className="mt-1 text-sm text-gray-500">
                Try adjusting your filters or add a new contact.
              </p>
            </div>
          )}
        </>
      )}

      {activeView === 'communications' && (
        <div className="bg-white shadow rounded-lg">
          {/* Communication Tabs */}
          <div className="border-b border-gray-200">
            <div className="p-4">
              <div className="flex space-x-6">
                {[
                  { key: 'all', label: 'All Communications' },
                  { key: 'inbox', label: 'Inbox' },
                  { key: 'sent', label: 'Sent' }
                ].map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveCommTab(tab.key as any)}
                    className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                      activeCommTab === tab.key
                        ? 'border-primary-500 text-primary-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
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
                        <p className="font-medium text-gray-900">{comm.contactName}</p>
                        {comm.subject && (
                          <p className="text-sm font-medium text-gray-700 mt-1">{comm.subject}</p>
                        )}
                        <p className="text-sm text-gray-600 mt-1 line-clamp-2">{comm.content}</p>
                        <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                          <span>{formatDate(comm.timestamp)}</span>
                          {comm.duration && (
                            <span className="flex items-center">
                              <ClockIcon className="h-3 w-3 mr-1" />
                              {Math.floor(comm.duration / 60)}:{(comm.duration % 60).toString().padStart(2, '0')}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 ml-4">
                        <span className={`text-xs font-medium ${
                          comm.status === 'sent' ? 'text-blue-600' :
                          comm.status === 'delivered' ? 'text-green-600' :
                          comm.status === 'read' ? 'text-purple-600' : 'text-gray-600'
                        }`}>
                          {comm.status.charAt(0).toUpperCase() + comm.status.slice(1)}
                        </span>
                        <button className="text-gray-400 hover:text-gray-600">
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
              </div>
            )}
          </div>
        </div>
      )}

      {activeView === 'contact-detail' && selectedContact && (
        <div className="bg-white shadow rounded-lg">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setActiveView('contacts')}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ← Back to Contacts
                </button>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    {selectedContact.firstName} {selectedContact.lastName}
                  </h2>
                  <p className="text-sm text-gray-500">{selectedContact.company} • {selectedContact.title}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleEmailClick(selectedContact)}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-700 bg-white hover:bg-gray-50"
                >
                  <EnvelopeIcon className="h-4 w-4 mr-1" />
                  Email
                </button>
                <button
                  onClick={() => handleSMSClick(selectedContact)}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-700 bg-white hover:bg-gray-50"
                >
                  <ChatBubbleLeftRightIcon className="h-4 w-4 mr-1" />
                  SMS
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Contact Details */}
              <div className="lg:col-span-1 space-y-6">
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-medium text-gray-900 mb-4">Contact Information</h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex items-center">
                      <AtSymbolIcon className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-gray-600">{selectedContact.email}</span>
                    </div>
                    <div className="flex items-center">
                      <PhoneIcon className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-gray-600">{selectedContact.phone}</span>
                    </div>
                    {selectedContact.mobile && (
                      <div className="flex items-center">
                        <PhoneIcon className="h-4 w-4 text-gray-400 mr-2" />
                        <span className="text-gray-600">{selectedContact.mobile} (Mobile)</span>
                      </div>
                    )}
                    <div className="flex items-center">
                      <BuildingOfficeIcon className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-gray-600">{selectedContact.company}</span>
                    </div>
                  </div>
                </div>

                {selectedContact.tags.length > 0 && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="font-medium text-gray-900 mb-4">Tags</h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedContact.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-primary-100 text-primary-800 rounded text-xs"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {selectedContact.notes && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="font-medium text-gray-900 mb-4">Notes</h3>
                    <p className="text-sm text-gray-600">{selectedContact.notes}</p>
                  </div>
                )}
              </div>

              {/* Communications History */}
              <div className="lg:col-span-2">
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-medium text-gray-900">Communication History</h3>
                    <span className="text-sm text-gray-500">
                      {selectedContact.totalCommunications} total communications
                    </span>
                  </div>

                  {/* Communication tabs for this contact */}
                  <div className="flex space-x-4 mb-4">
                    {[
                      { key: 'all', label: 'All' },
                      { key: 'inbox', label: 'Received' },
                      { key: 'sent', label: 'Sent' }
                    ].map((tab) => (
                      <button
                        key={tab.key}
                        onClick={() => setActiveCommTab(tab.key as any)}
                        className={`py-1 px-2 text-sm font-medium transition-colors ${
                          activeCommTab === tab.key
                            ? 'text-primary-600 border-b-2 border-primary-500'
                            : 'text-gray-500 hover:text-gray-700'
                        }`}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>

                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    {filteredCommunications.map((comm) => (
                      <div key={comm.id} className="bg-white rounded-lg p-4 border border-gray-200">
                        <div className="flex items-start space-x-3">
                          <div className={`p-2 rounded-lg ${
                            comm.direction === 'inbound' ? 'bg-blue-100' : 'bg-green-100'
                          }`}>
                            {getTypeIcon(comm.type)}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center space-x-2">
                                <span className="font-medium text-gray-900">
                                  {comm.direction === 'inbound' ? 'Received' : 'Sent'}
                                </span>
                                <span className="text-sm text-gray-500">
                                  {formatDate(comm.timestamp)}
                                </span>
                              </div>
                              <span className={`text-xs font-medium px-2 py-1 rounded ${
                                comm.status === 'sent' ? 'bg-blue-100 text-blue-800' :
                                comm.status === 'delivered' ? 'bg-green-100 text-green-800' :
                                comm.status === 'read' ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-800'
                              }`}>
                                {comm.status}
                              </span>
                            </div>
                            {comm.subject && (
                              <h4 className="font-medium text-gray-900 mb-1">{comm.subject}</h4>
                            )}
                            <p className="text-sm text-gray-600">{comm.content}</p>
                            {comm.duration && (
                              <div className="flex items-center mt-2 text-xs text-gray-500">
                                <ClockIcon className="h-3 w-3 mr-1" />
                                Duration: {Math.floor(comm.duration / 60)}:{(comm.duration % 60).toString().padStart(2, '0')}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    {filteredCommunications.length === 0 && (
                      <div className="text-center py-8">
                        <DocumentTextIcon className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-500">No communications with this contact yet</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Email Modal */}
      <EmailModal
        isOpen={isEmailModalOpen}
        onClose={() => {
          setIsEmailModalOpen(false);
          setSelectedContact(null);
        }}
        deal={undefined}
        contact={selectedContact ? {
          id: selectedContact.id,
          firstName: selectedContact.firstName,
          lastName: selectedContact.lastName,
          company: selectedContact.company,
          title: selectedContact.title,
          email: selectedContact.email,
          phone: selectedContact.phone,
          type: selectedContact.type
        } : undefined}
        onSend={handleEmailSend}
      />

      {/* SMS Modal */}
      <SMSModal
        isOpen={isSMSModalOpen}
        onClose={() => {
          setIsSMSModalOpen(false);
          setSelectedContact(null);
        }}
        deal={undefined}
        contact={selectedContact ? {
          id: selectedContact.id,
          firstName: selectedContact.firstName,
          lastName: selectedContact.lastName,
          company: selectedContact.company,
          title: selectedContact.title,
          email: selectedContact.email,
          phone: selectedContact.phone,
          type: selectedContact.type
        } : undefined}
        onSend={handleSMSSend}
      />

      {/* Contact Modal Placeholder */}
      {showContactModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-2xl shadow-lg rounded-md bg-white">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-medium text-gray-900">
                {isEditing ? (selectedContact ? 'Edit Contact' : 'Add Contact') : 'Contact Details'}
              </h3>
              <button
                onClick={() => {
                  setShowContactModal(false);
                  setSelectedContact(null);
                  setIsEditing(false);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
            
            <ContactForm
              contact={selectedContact}
              isEditing={isEditing}
              currentUser={user}
              onSave={handleSaveContact}
              onCancel={() => {
                setShowContactModal(false);
                setSelectedContact(null);
                setIsEditing(false);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

// Contact Form Component
interface ContactFormProps {
  contact: Contact | null;
  isEditing: boolean;
  currentUser: any;
  onSave: (contactData: Partial<Contact>) => void;
  onCancel: () => void;
}

const ContactForm: React.FC<ContactFormProps> = ({ contact, isEditing, currentUser, onSave, onCancel }) => {
  const [formData, setFormData] = useState<Partial<Contact>>({
    firstName: '',
    lastName: '',
    company: '',
    title: '',
    email: '',
    phone: '',
    mobile: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    website: '',
    notes: '',
    tags: [],
    type: 'customer',
    priority: 'medium',
    isFavorite: false,
    status: 'active',
    visibleToRoles: ['company_admin', 'project_manager'] as UserRole[]
  });
  
  const [newTag, setNewTag] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Initialize form data
  useEffect(() => {
    if (contact) {
      setFormData({
        ...contact,
        tags: contact.tags || []
      });
    } else {
      // Reset form for new contact
      setFormData({
        firstName: '',
        lastName: '',
        company: '',
        title: '',
        email: '',
        phone: '',
        mobile: '',
        address: '',
        city: '',
        state: '',
        zipCode: '',
        website: '',
        notes: '',
        tags: [],
        type: 'customer',
        priority: 'medium',
        isFavorite: false,
        status: 'active',
        visibleToRoles: ['company_admin', 'project_manager'] as UserRole[]
      });
    }
  }, [contact]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.firstName?.trim()) {
      newErrors.firstName = 'First name is required';
    }
    if (!formData.lastName?.trim()) {
      newErrors.lastName = 'Last name is required';
    }
    if (!formData.email?.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    if (!formData.phone?.trim()) {
      newErrors.phone = 'Phone number is required';
    }
    if (!formData.company?.trim()) {
      newErrors.company = 'Company is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    const contactData: Partial<Contact> = {
      ...formData,
      createdBy: currentUser?.email || 'unknown',
      ownedBy: currentUser?.email || 'unknown',
      createdAt: contact ? contact.createdAt : new Date(),
      updatedAt: new Date(),
      lastContact: contact?.lastContact,
      totalCommunications: contact?.totalCommunications || 0
    };

    onSave(contactData);
  };

  const handleInputChange = (field: keyof Contact, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const addTag = () => {
    if (newTag.trim() && !formData.tags?.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...(prev.tags || []), newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags?.filter(tag => tag !== tagToRemove) || []
    }));
  };

  const toggleRole = (role: UserRole) => {
    const currentRoles = formData.visibleToRoles || [];
    const updatedRoles = currentRoles.includes(role)
      ? currentRoles.filter(r => r !== role)
      : [...currentRoles, role];
    
    setFormData(prev => ({
      ...prev,
      visibleToRoles: updatedRoles
    }));
  };

  const canEditRolePermissions = currentUser?.role === 'super_admin' || currentUser?.role === 'company_admin';
  const isViewOnly = Boolean(!isEditing && contact);

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-h-[70vh] overflow-y-auto">
      {/* Basic Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            First Name *
          </label>
          <input
            type="text"
            value={formData.firstName || ''}
            onChange={(e) => handleInputChange('firstName', e.target.value)}
            disabled={isViewOnly}
            className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent ${errors.firstName ? 'border-red-500' : ''} ${isViewOnly ? 'bg-gray-100' : ''}`}
            placeholder="Enter first name"
          />
          {errors.firstName && <p className="text-red-500 text-xs mt-1">{errors.firstName}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Last Name *
          </label>
          <input
            type="text"
            value={formData.lastName || ''}
            onChange={(e) => handleInputChange('lastName', e.target.value)}
            disabled={isViewOnly}
            className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent ${errors.lastName ? 'border-red-500' : ''} ${isViewOnly ? 'bg-gray-100' : ''}`}
            placeholder="Enter last name"
          />
          {errors.lastName && <p className="text-red-500 text-xs mt-1">{errors.lastName}</p>}
        </div>
      </div>

      {/* Contact Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email *
          </label>
          <input
            type="email"
            value={formData.email || ''}
            onChange={(e) => handleInputChange('email', e.target.value)}
            disabled={isViewOnly}
            className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent ${errors.email ? 'border-red-500' : ''} ${isViewOnly ? 'bg-gray-100' : ''}`}
            placeholder="Enter email address"
          />
          {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Phone *
          </label>
          <input
            type="tel"
            value={formData.phone || ''}
            onChange={(e) => handleInputChange('phone', e.target.value)}
            disabled={isViewOnly}
            className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent ${errors.phone ? 'border-red-500' : ''} ${isViewOnly ? 'bg-gray-100' : ''}`}
            placeholder="Enter phone number"
          />
          {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Mobile
        </label>
        <input
          type="tel"
          value={formData.mobile || ''}
          onChange={(e) => handleInputChange('mobile', e.target.value)}
          disabled={isViewOnly}
          className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent ${isViewOnly ? 'bg-gray-100' : ''}`}
          placeholder="Enter mobile number"
        />
      </div>

      {/* Company Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Company *
          </label>
          <input
            type="text"
            value={formData.company || ''}
            onChange={(e) => handleInputChange('company', e.target.value)}
            disabled={isViewOnly}
            className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent ${errors.company ? 'border-red-500' : ''} ${isViewOnly ? 'bg-gray-100' : ''}`}
            placeholder="Enter company name"
          />
          {errors.company && <p className="text-red-500 text-xs mt-1">{errors.company}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Title
          </label>
          <input
            type="text"
            value={formData.title || ''}
            onChange={(e) => handleInputChange('title', e.target.value)}
            disabled={isViewOnly}
            className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent ${isViewOnly ? 'bg-gray-100' : ''}`}
            placeholder="Enter job title"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Website
        </label>
        <input
          type="url"
          value={formData.website || ''}
          onChange={(e) => handleInputChange('website', e.target.value)}
          disabled={isViewOnly}
          className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent ${isViewOnly ? 'bg-gray-100' : ''}`}
          placeholder="https://example.com"
        />
      </div>

      {/* Address Information */}
      <div className="space-y-4">
        <h4 className="text-lg font-medium text-gray-900">Address Information</h4>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Address
          </label>
          <input
            type="text"
            value={formData.address || ''}
            onChange={(e) => handleInputChange('address', e.target.value)}
            disabled={isViewOnly}
            className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent ${isViewOnly ? 'bg-gray-100' : ''}`}
            placeholder="Enter street address"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              City
            </label>
            <input
              type="text"
              value={formData.city || ''}
              onChange={(e) => handleInputChange('city', e.target.value)}
              disabled={isViewOnly}
              className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent ${isViewOnly ? 'bg-gray-100' : ''}`}
              placeholder="Enter city"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              State
            </label>
            <input
              type="text"
              value={formData.state || ''}
              onChange={(e) => handleInputChange('state', e.target.value)}
              disabled={isViewOnly}
              className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent ${isViewOnly ? 'bg-gray-100' : ''}`}
              placeholder="Enter state"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              ZIP Code
            </label>
            <input
              type="text"
              value={formData.zipCode || ''}
              onChange={(e) => handleInputChange('zipCode', e.target.value)}
              disabled={isViewOnly}
              className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent ${isViewOnly ? 'bg-gray-100' : ''}`}
              placeholder="Enter ZIP code"
            />
          </div>
        </div>
      </div>

      {/* Contact Classification */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Contact Type
          </label>
          <select
            value={formData.type || 'customer'}
            onChange={(e) => handleInputChange('type', e.target.value as Contact['type'])}
            disabled={isViewOnly}
            className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent ${isViewOnly ? 'bg-gray-100' : ''}`}
          >
            <option value="customer">Customer</option>
            <option value="vendor">Vendor</option>
            <option value="partner">Partner</option>
            <option value="colleague">Colleague</option>
            <option value="lead">Lead</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Priority
          </label>
          <select
            value={formData.priority || 'medium'}
            onChange={(e) => handleInputChange('priority', e.target.value as Contact['priority'])}
            disabled={isViewOnly}
            className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent ${isViewOnly ? 'bg-gray-100' : ''}`}
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Status
          </label>
          <select
            value={formData.status || 'active'}
            onChange={(e) => handleInputChange('status', e.target.value as Contact['status'])}
            disabled={isViewOnly}
            className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent ${isViewOnly ? 'bg-gray-100' : ''}`}
          >
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="do_not_contact">Do Not Contact</option>
          </select>
        </div>
      </div>

      {/* Tags */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Tags
        </label>
        <div className="flex flex-wrap gap-2 mb-2">
          {formData.tags?.map((tag, index) => (
            <span
              key={index}
              className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
            >
              {tag}
              {!isViewOnly && (
                <button
                  type="button"
                  onClick={() => removeTag(tag)}
                  className="ml-1.5 inline-flex items-center justify-center w-4 h-4 rounded-full text-blue-400 hover:bg-blue-200 hover:text-blue-600"
                >
                  ×
                </button>
              )}
            </span>
          ))}
        </div>
        {!isViewOnly && (
          <div className="flex gap-2">
            <input
              type="text"
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="Add a tag"
            />
            <button
              type="button"
              onClick={addTag}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
            >
              Add
            </button>
          </div>
        )}
      </div>

      {/* Role-based Visibility Permissions */}
      {canEditRolePermissions && !isViewOnly && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Visible to Roles
          </label>
          <div className="space-y-2">
            {(['super_admin', 'company_admin', 'project_manager', 'foreman', 'worker', 'client'] as UserRole[]).map((role) => (
              <label key={role} className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.visibleToRoles?.includes(role) || false}
                  onChange={() => toggleRole(role)}
                  className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
                <span className="ml-2 text-sm text-gray-700">
                  {role.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Favorite Toggle */}
      <div className="flex items-center">
        <input
          type="checkbox"
          id="isFavorite"
          checked={formData.isFavorite || false}
          onChange={(e) => handleInputChange('isFavorite', e.target.checked)}
          disabled={isViewOnly}
          className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
        />
        <label htmlFor="isFavorite" className="ml-2 text-sm text-gray-700">
          Mark as favorite contact
        </label>
      </div>

      {/* Notes */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Notes
        </label>
        <textarea
          value={formData.notes || ''}
          onChange={(e) => handleInputChange('notes', e.target.value)}
          disabled={isViewOnly}
          rows={4}
          className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none ${isViewOnly ? 'bg-gray-100' : ''}`}
          placeholder="Enter any additional notes about this contact..."
        />
      </div>

      {/* Action Buttons */}
      {!isViewOnly && (
        <div className="flex justify-end space-x-3 pt-4 border-t">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
          >
            {contact ? 'Update Contact' : 'Create Contact'}
          </button>
        </div>
      )}
    </form>
  );
};

export default ContactsAndCommunications;