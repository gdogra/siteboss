import React, { useEffect, useState } from 'react';
import { contractorApi } from '../../services/api';
import { PlusIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';

const SubcontractorsAdmin: React.FC = () => {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [form, setForm] = useState<any>({ business_name: '', contact_name: '', email: '', phone: '', specialty: '', hourly_rate: '' });
  const [submitting, setSubmitting] = useState(false);

  const load = async (query?: string) => {
    try {
      setLoading(true);
      const res: any = await contractorApi.getSubcontractors(query);
      setItems(res?.data || []);
    } catch (e) {
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const onSubmit = async () => {
    if (!form.business_name?.trim()) return;
    try {
      setSubmitting(true);
      await contractorApi.createSubcontractor({
        business_name: form.business_name,
        contact_name: form.contact_name || undefined,
        email: form.email || undefined,
        phone: form.phone || undefined,
        specialty: form.specialty || undefined,
        hourly_rate: form.hourly_rate ? Number(form.hourly_rate) : undefined,
      });
      setIsOpen(false);
      setForm({ business_name: '', contact_name: '', email: '', phone: '', specialty: '', hourly_rate: '' });
      await load(q);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Subcontractors</h1>
          <p className="text-gray-600">Manage your subcontractor directory</p>
        </div>
        <button
          onClick={() => setIsOpen(true)}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
        >
          <PlusIcon className="-ml-1 mr-2 h-5 w-5" />
          Add Subcontractor
        </button>
      </div>

      <div className="bg-white shadow rounded-lg p-4">
        <div className="flex items-center mb-4">
          <div className="relative w-full max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search by business name..."
              value={q}
              onChange={(e) => setQ(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') load(q); }}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
          <button onClick={() => load(q)} className="ml-3 px-4 py-2 bg-gray-100 rounded-md hover:bg-gray-200 text-sm">Search</button>
        </div>

        {loading ? (
          <div className="py-12 text-center text-gray-500">Loading...</div>
        ) : items.length === 0 ? (
          <div className="py-12 text-center text-gray-500">No subcontractors found</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Business</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Specialty</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rate</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {items.map((s) => (
                  <tr key={s.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{s.business_name}</div>
                      <div className="text-xs text-gray-500">{s.email || '—'}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{s.contact_name || '—'}</div>
                      <div className="text-xs text-gray-500">{s.phone || '—'}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">{s.specialty || '—'}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{s.hourly_rate ? `$${Number(s.hourly_rate)}/hr` : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {isOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-lg shadow-lg rounded-md bg-white">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">New Subcontractor</h3>
              <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-gray-600">×</button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Business Name</label>
                <input className="w-full border rounded-md px-3 py-2" value={form.business_name} onChange={e => setForm({ ...form, business_name: e.target.value })} />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Contact Name</label>
                  <input className="w-full border rounded-md px-3 py-2" value={form.contact_name} onChange={e => setForm({ ...form, contact_name: e.target.value })} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input type="email" className="w-full border rounded-md px-3 py-2" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <input className="w-full border rounded-md px-3 py-2" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Specialty</label>
                  <input className="w-full border rounded-md px-3 py-2" value={form.specialty} onChange={e => setForm({ ...form, specialty: e.target.value })} />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Hourly Rate</label>
                  <input type="number" min="0" step="0.01" className="w-full border rounded-md px-3 py-2" value={form.hourly_rate} onChange={e => setForm({ ...form, hourly_rate: e.target.value })} />
                </div>
              </div>
            </div>
            <div className="mt-6 flex justify-end space-x-3">
              <button onClick={() => setIsOpen(false)} className="bg-gray-100 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-200">Cancel</button>
              <button onClick={onSubmit} disabled={submitting || !form.business_name} className="bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700 disabled:opacity-50">{submitting ? 'Saving...' : 'Save'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubcontractorsAdmin;

