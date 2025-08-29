import React, { useState } from 'react';
import {
  XMarkIcon,
  UserIcon,
  BuildingOfficeIcon,
  EnvelopeIcon,
  PhoneIcon,
  CalendarIcon,
  StarIcon,
  CurrencyDollarIcon,
  PencilIcon,
  TrashIcon,
  ChatBubbleLeftRightIcon,
  DocumentTextIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';

interface Lead {
  id: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  source: string;
  status: 'new' | 'contacted' | 'qualified' | 'proposal' | 'won' | 'lost';
  score: number;
  value: number;
  expected_close_date: Date;
  assigned_to: string;
  created_at: Date;
  notes: string;
  last_activity?: Date;
}

interface Activity {
  id: string;
  type: 'call' | 'email' | 'meeting' | 'note' | 'status_change';
  description: string;
  timestamp: Date;
  user: string;
}

interface LeadDetailModalProps {
  lead: Lead | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

const LeadDetailModal: React.FC<LeadDetailModalProps> = ({
  lead,
  isOpen,
  onClose,
  onEdit,
  onDelete
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'activity' | 'notes'>('overview');
  const [newNote, setNewNote] = useState('');

  if (!isOpen || !lead) return null;

  // Mock activity data
  const activities: Activity[] = [
    {
      id: '1',
      type: 'email',
      description: 'Sent follow-up email about kitchen renovation quote',
      timestamp: new Date('2024-01-15T10:30:00'),
      user: 'John Smith'
    },
    {
      id: '2',
      type: 'call',
      description: 'Called to discuss project timeline - left voicemail',
      timestamp: new Date('2024-01-14T14:15:00'),
      user: 'John Smith'
    },
    {
      id: '3',
      type: 'status_change',
      description: 'Status changed from New to Contacted',
      timestamp: new Date('2024-01-12T09:00:00'),
      user: 'System'
    },
    {
      id: '4',
      type: 'note',
      description: 'Initial contact - interested in complete kitchen renovation. Budget around $45k',
      timestamp: new Date('2024-01-10T16:45:00'),
      user: 'John Smith'
    }
  ];

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'new': return 'bg-blue-100 text-blue-800';
      case 'contacted': return 'bg-yellow-100 text-yellow-800';
      case 'qualified': return 'bg-green-100 text-green-800';
      case 'proposal': return 'bg-purple-100 text-purple-800';
      case 'won': return 'bg-emerald-100 text-emerald-800';
      case 'lost': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getScoreColor = (score: number): string => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const renderScoreStars = (score: number) => {
    const stars = Math.floor(score / 20);
    return (
      <div className="flex">
        {[1, 2, 3, 4, 5].map(star => (
          star <= stars ? (
            <StarIconSolid key={star} className="h-4 w-4 text-yellow-400" />
          ) : (
            <StarIcon key={star} className="h-4 w-4 text-gray-300" />
          )
        ))}
      </div>
    );
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (date: Date): string => {
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'call':
        return <PhoneIcon className="h-4 w-4" />;
      case 'email':
        return <EnvelopeIcon className="h-4 w-4" />;
      case 'meeting':
        return <CalendarIcon className="h-4 w-4" />;
      case 'note':
        return <DocumentTextIcon className="h-4 w-4" />;
      case 'status_change':
        return <StarIcon className="h-4 w-4" />;
      default:
        return <ClockIcon className="h-4 w-4" />;
    }
  };

  const handleAddNote = () => {
    if (newNote.trim()) {
      // TODO: Add note to lead
      console.log('Adding note:', newNote);
      setNewNote('');
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-screen overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-4">
            <div className="flex-shrink-0">
              <div className="h-12 w-12 bg-primary-100 rounded-full flex items-center justify-center">
                <UserIcon className="h-6 w-6 text-primary-600" />
              </div>
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-900">{lead.name}</h3>
              <p className="text-gray-600">{lead.company}</p>
              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(lead.status)}`}>
                {lead.status.charAt(0).toUpperCase() + lead.status.slice(1)}
              </span>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={onEdit}
              className="p-2 text-gray-400 hover:text-gray-600 rounded-md hover:bg-gray-100"
            >
              <PencilIcon className="h-5 w-5" />
            </button>
            <button
              onClick={onDelete}
              className="p-2 text-red-400 hover:text-red-600 rounded-md hover:bg-red-50"
            >
              <TrashIcon className="h-5 w-5" />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 rounded-md hover:bg-gray-100"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 px-6">
            {[
              { key: 'overview', label: 'Overview' },
              { key: 'activity', label: 'Activity' },
              { key: 'notes', label: 'Notes' }
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
          </nav>
        </div>

        {/* Content */}
        <div className="p-6 max-h-96 overflow-y-auto">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Key Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center">
                    <CurrencyDollarIcon className="h-8 w-8 text-green-600" />
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-500">Estimated Value</p>
                      <p className="text-lg font-semibold text-gray-900">{formatCurrency(lead.value)}</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center">
                    <StarIcon className="h-8 w-8 text-yellow-600" />
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-500">Lead Score</p>
                      <div className="flex items-center space-x-2">
                        <p className={`text-lg font-semibold ${getScoreColor(lead.score)}`}>{lead.score}</p>
                        {renderScoreStars(lead.score)}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center">
                    <CalendarIcon className="h-8 w-8 text-blue-600" />
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-500">Expected Close</p>
                      <p className="text-lg font-semibold text-gray-900">
                        {lead.expected_close_date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center">
                    <ClockIcon className="h-8 w-8 text-purple-600" />
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-500">Days Since Contact</p>
                      <p className="text-lg font-semibold text-gray-900">
                        {Math.floor((Date.now() - lead.created_at.getTime()) / (1000 * 60 * 60 * 24))}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-lg font-medium text-gray-900 mb-4">Contact Information</h4>
                  <div className="space-y-3">
                    <div className="flex items-center">
                      <EnvelopeIcon className="h-5 w-5 text-gray-400 mr-3" />
                      <span className="text-gray-900">{lead.email}</span>
                    </div>
                    <div className="flex items-center">
                      <PhoneIcon className="h-5 w-5 text-gray-400 mr-3" />
                      <span className="text-gray-900">{lead.phone}</span>
                    </div>
                    <div className="flex items-center">
                      <BuildingOfficeIcon className="h-5 w-5 text-gray-400 mr-3" />
                      <span className="text-gray-900">{lead.company}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-lg font-medium text-gray-900 mb-4">Lead Details</h4>
                  <div className="space-y-3">
                    <div>
                      <span className="text-sm font-medium text-gray-500">Source:</span>
                      <span className="ml-2 text-gray-900">{lead.source}</span>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-500">Assigned to:</span>
                      <span className="ml-2 text-gray-900">{lead.assigned_to}</span>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-500">Created:</span>
                      <span className="ml-2 text-gray-900">{formatDate(lead.created_at)}</span>
                    </div>
                    {lead.last_activity && (
                      <div>
                        <span className="text-sm font-medium text-gray-500">Last Activity:</span>
                        <span className="ml-2 text-gray-900">{formatDate(lead.last_activity)}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Notes */}
              {lead.notes && (
                <div>
                  <h4 className="text-lg font-medium text-gray-900 mb-4">Notes</h4>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-gray-700">{lead.notes}</p>
                  </div>
                </div>
              )}

              {/* Quick Actions */}
              <div>
                <h4 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h4>
                <div className="flex flex-wrap gap-3">
                  <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                    <PhoneIcon className="h-4 w-4 mr-2" />
                    Call Lead
                  </button>
                  <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                    <EnvelopeIcon className="h-4 w-4 mr-2" />
                    Send Email
                  </button>
                  <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                    <CalendarIcon className="h-4 w-4 mr-2" />
                    Schedule Meeting
                  </button>
                  <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                    <ChatBubbleLeftRightIcon className="h-4 w-4 mr-2" />
                    Send SMS
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'activity' && (
            <div className="space-y-4">
              <h4 className="text-lg font-medium text-gray-900">Recent Activity</h4>
              <div className="space-y-4">
                {activities.map((activity) => (
                  <div key={activity.id} className="flex items-start space-x-3">
                    <div className="flex-shrink-0 mt-1">
                      <div className="h-8 w-8 bg-gray-100 rounded-full flex items-center justify-center">
                        {getActivityIcon(activity.type)}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-900">{activity.description}</p>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className="text-xs text-gray-500">{activity.user}</span>
                        <span className="text-xs text-gray-400">•</span>
                        <span className="text-xs text-gray-500">{formatDate(activity.timestamp)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'notes' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-lg font-medium text-gray-900">Notes & Comments</h4>
              </div>
              
              {/* Add Note */}
              <div className="bg-gray-50 rounded-lg p-4">
                <textarea
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  placeholder="Add a note about this lead..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                />
                <div className="flex justify-end mt-3">
                  <button
                    onClick={handleAddNote}
                    disabled={!newNote.trim()}
                    className="px-4 py-2 text-sm font-medium text-white bg-primary-600 border border-transparent rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Add Note
                  </button>
                </div>
              </div>

              {/* Existing Notes */}
              <div className="space-y-3">
                {activities.filter(a => a.type === 'note').map((note) => (
                  <div key={note.id} className="bg-white border border-gray-200 rounded-lg p-4">
                    <p className="text-gray-900">{note.description}</p>
                    <div className="flex items-center space-x-2 mt-2">
                      <span className="text-xs text-gray-500">{note.user}</span>
                      <span className="text-xs text-gray-400">•</span>
                      <span className="text-xs text-gray-500">{formatDate(note.timestamp)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LeadDetailModal;