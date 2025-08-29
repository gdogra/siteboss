import React, { useState, useEffect } from 'react';
import {
  PlusIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  UserIcon,
  PhoneIcon,
  AtSymbolIcon,
  BuildingOfficeIcon,
  TagIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  ChatBubbleLeftRightIcon,
  EnvelopeIcon,
  StarIcon,
  MapPinIcon,
  CalendarIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { StarIcon as StarSolidIcon } from '@heroicons/react/24/solid';
import { useAuth } from '../../contexts/AuthContext';
import { UserRole } from '../../types';

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
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  // Role-based access
  visibleToRoles: UserRole[];
  ownedBy: string;
}

interface RolodexProps {}

const Rolodex: React.FC<RolodexProps> = () => {
  const { user } = useAuth();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [filteredContacts, setFilteredContacts] = useState<Contact[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedPriority, setSelectedPriority] = useState<string>('all');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [sortBy, setSortBy] = useState<'name' | 'company' | 'lastContact' | 'created'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [showContactModal, setShowContactModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // Mock data with role-based access
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
        createdBy: 'John Smith',
        createdAt: new Date('2023-12-01'),
        updatedAt: new Date('2024-01-15'),
        visibleToRoles: ['super_admin', 'company_admin', 'project_manager', 'foreman'],
        ownedBy: 'John Smith'
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
        createdBy: 'Sarah Wilson',
        createdAt: new Date('2023-11-15'),
        updatedAt: new Date('2024-01-14'),
        visibleToRoles: ['super_admin', 'company_admin', 'project_manager'],
        ownedBy: 'Sarah Wilson'
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
        createdBy: 'Mike Johnson',
        createdAt: new Date('2024-01-08'),
        updatedAt: new Date('2024-01-11'),
        visibleToRoles: ['super_admin', 'company_admin', 'project_manager'],
        ownedBy: 'Mike Johnson'
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
        createdBy: 'John Smith',
        createdAt: new Date('2023-10-01'),
        updatedAt: new Date('2024-01-10'),
        visibleToRoles: ['super_admin', 'company_admin', 'project_manager', 'foreman'],
        ownedBy: 'John Smith'
      },
      {
        id: '5',
        firstName: 'David',
        lastName: 'Thompson',
        company: 'Thompson Holdings',
        title: 'Property Manager',
        email: 'david.thompson@thompsonholdings.com',
        phone: '(555) 567-8901',
        mobile: '(555) 567-8902',
        notes: 'Manages multiple commercial properties. Potential for ongoing maintenance contracts.',
        tags: ['Commercial', 'Maintenance', 'Multi-Property'],
        type: 'lead',
        priority: 'medium',
        isFavorite: false,
        lastContact: new Date('2024-01-13'),
        createdBy: 'Sarah Wilson',
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-13'),
        visibleToRoles: ['super_admin', 'company_admin', 'project_manager'],
        ownedBy: 'Sarah Wilson'
      },
      {
        id: '6',
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
        createdBy: 'John Smith',
        createdAt: new Date('2023-08-01'),
        updatedAt: new Date('2024-01-16'),
        visibleToRoles: ['super_admin', 'company_admin', 'project_manager', 'foreman', 'worker'],
        ownedBy: 'John Smith'
      },
      {
        id: '7',
        firstName: 'Green',
        lastName: 'Energy Partners',
        company: 'Green Energy Solutions',
        title: 'Business Development',
        email: 'partnerships@greenenergy.com',
        phone: '(555) 789-0123',
        website: 'www.greenenergysolutions.com',
        notes: 'Solar panel installation partner. Good referral source for sustainable projects.',
        tags: ['Partner', 'Solar', 'Referrals'],
        type: 'partner',
        priority: 'medium',
        isFavorite: true,
        lastContact: new Date('2024-01-12'),
        createdBy: 'Mike Johnson',
        createdAt: new Date('2023-09-15'),
        updatedAt: new Date('2024-01-12'),
        visibleToRoles: ['super_admin', 'company_admin'],
        ownedBy: 'Mike Johnson'
      }
    ];

    // Filter contacts based on user role and access
    const accessibleContacts = mockContacts.filter(contact => 
      contact.visibleToRoles.includes(user?.role || 'worker') ||
      contact.ownedBy === user?.email ||
      contact.createdBy === user?.email
    );

    setContacts(accessibleContacts);
  }, [user]);

  // Filter and search
  useEffect(() => {
    let filtered = [...contacts];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(contact =>
        `${contact.firstName} ${contact.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contact.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contact.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contact.phone.includes(searchTerm) ||
        contact.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Type filter
    if (selectedType !== 'all') {
      filtered = filtered.filter(contact => contact.type === selectedType);
    }

    // Priority filter
    if (selectedPriority !== 'all') {
      filtered = filtered.filter(contact => contact.priority === selectedPriority);
    }

    // Favorites filter
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
    setShowContactModal(true);
    setIsEditing(false);
  };

  const handleEditContact = (contact: Contact) => {
    setSelectedContact(contact);
    setShowContactModal(true);
    setIsEditing(true);
  };

  const handleToggleFavorite = (contactId: string) => {
    setContacts(contacts.map(contact =>
      contact.id === contactId
        ? { ...contact, isFavorite: !contact.isFavorite, updatedAt: new Date() }
        : contact
    ));
  };

  const handleDeleteContact = (contactId: string) => {
    if (window.confirm('Are you sure you want to delete this contact?')) {
      setContacts(contacts.filter(contact => contact.id !== contactId));
      if (selectedContact?.id === contactId) {
        setShowContactModal(false);
        setSelectedContact(null);
      }
    }
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

  const canEditContact = (contact: Contact) => {
    if (!user) return false;
    
    // Super admin and company admin can edit all
    if (['super_admin', 'company_admin'].includes(user.role)) return true;
    
    // Contact owner can edit
    if (contact.ownedBy === user.email || contact.createdBy === user.email) return true;
    
    return false;
  };

  const canDeleteContact = (contact: Contact) => {
    return canEditContact(contact); // Same permissions as edit
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Digital Rolodex</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage your business contacts and relationships
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
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
                <BuildingOfficeIcon className="h-6 w-6 text-green-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Customers</dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {contacts.filter(c => c.type === 'customer').length}
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
                <TagIcon className="h-6 w-6 text-purple-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Vendors</dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {contacts.filter(c => c.type === 'vendor').length}
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
                <UserIcon className="h-6 w-6 text-orange-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Leads</dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {contacts.filter(c => c.type === 'lead').length}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

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
              Favorites Only
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

            {/* Tags and Type */}
            <div className="flex items-center justify-between mb-3">
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(contact.type)}`}>
                {contact.type}
              </span>
              <span className={`text-xs font-medium ${getPriorityColor(contact.priority)}`}>
                {contact.priority} priority
              </span>
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
                    // TODO: Open email modal
                  }}
                  className="text-xs text-blue-600 hover:text-blue-800"
                  title="Send Email"
                >
                  <EnvelopeIcon className="h-4 w-4" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    // TODO: Open SMS modal
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
                      handleEditContact(contact);
                    }}
                    className="text-xs text-gray-600 hover:text-gray-800"
                    title="Edit Contact"
                  >
                    <PencilIcon className="h-4 w-4" />
                  </button>
                )}
                {canDeleteContact(contact) && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteContact(contact.id);
                    }}
                    className="text-xs text-red-600 hover:text-red-800"
                    title="Delete Contact"
                  >
                    <TrashIcon className="h-4 w-4" />
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

      {/* TODO: Contact Detail/Edit Modal */}
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
            
            {selectedContact && (
              <div className="space-y-4">
                <p className="text-center text-gray-500">
                  Contact details modal would go here with full contact information,
                  edit form, and communication history.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Rolodex;