import React, { useState, Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon, CurrencyDollarIcon, CalendarIcon, DocumentIcon } from '@heroicons/react/24/outline';
import { api } from '../../services/api';
import { Expense } from '../../types';

interface BudgetCategory {
  id: string;
  name: string;
  category: string;
}

interface ExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExpenseAdded: (expense: Expense) => void;
  projectId: string;
  categoryId?: string;
  categories: BudgetCategory[];
}

interface ExpenseFormData {
  description: string;
  amount: string;
  expense_date: string;
  vendor_name: string;
  budget_category_id: string;
  receipt_file?: File;
}

const initialFormData: ExpenseFormData = {
  description: '',
  amount: '',
  expense_date: new Date().toISOString().split('T')[0],
  vendor_name: '',
  budget_category_id: ''
};

const ExpenseModal: React.FC<ExpenseModalProps> = ({
  isOpen,
  onClose,
  onExpenseAdded,
  projectId,
  categoryId,
  categories
}) => {
  const [formData, setFormData] = useState<ExpenseFormData>(initialFormData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Set category when modal opens
  React.useEffect(() => {
    if (categoryId && categories.length > 0) {
      setFormData(prev => ({ ...prev, budget_category_id: categoryId }));
    } else if (categories.length > 0 && !formData.budget_category_id) {
      setFormData(prev => ({ ...prev, budget_category_id: categories[0].id }));
    }
  }, [categoryId, categories, isOpen]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        setError('File size must be less than 10MB');
        return;
      }
      
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'];
      if (!allowedTypes.includes(file.type)) {
        setError('Only images (JPEG, PNG, GIF) and PDF files are allowed');
        return;
      }
      
      setFormData(prev => ({ ...prev, receipt_file: file }));
      setError(null);
    }
  };

  const uploadReceipt = async (file: File): Promise<string> => {
    const uploadFormData = new FormData();
    uploadFormData.append('receipt', file);
    uploadFormData.append('project_id', projectId);

    const response = await api.post('/upload/receipt', uploadFormData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (progressEvent.total) {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(percentCompleted);
        }
      }
    });

    return response.data.file_path;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setUploadProgress(0);

    try {
      let receipt_url: string | undefined;

      // Upload receipt if provided
      if (formData.receipt_file) {
        receipt_url = await uploadReceipt(formData.receipt_file);
      }

      // Create expense
      const expenseData = {
        project_id: projectId,
        budget_category_id: formData.budget_category_id || null,
        description: formData.description,
        amount: parseFloat(formData.amount),
        expense_date: formData.expense_date,
        vendor_name: formData.vendor_name || null,
        receipt_url
      };

      const response = await api.post<Expense>('/expenses', expenseData);
      onExpenseAdded(response.data);
      handleClose();
    } catch (error: any) {
      console.error('Error creating expense:', error);
      setError(error.response?.data?.error || 'Failed to create expense');
    } finally {
      setLoading(false);
      setUploadProgress(0);
    }
  };

  const handleClose = () => {
    setFormData(initialFormData);
    setError(null);
    setUploadProgress(0);
    onClose();
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-10" onClose={handleClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                <div className="flex items-center justify-between">
                  <Dialog.Title
                    as="h3"
                    className="text-lg font-medium leading-6 text-gray-900"
                  >
                    Add New Expense
                  </Dialog.Title>
                  <button
                    type="button"
                    className="text-gray-400 hover:text-gray-600"
                    onClick={handleClose}
                  >
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                  {error && (
                    <div className="bg-red-50 border border-red-200 rounded-md p-4">
                      <p className="text-sm text-red-600">{error}</p>
                    </div>
                  )}

                  {/* Description */}
                  <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                      Description *
                    </label>
                    <textarea
                      name="description"
                      id="description"
                      required
                      rows={2}
                      value={formData.description}
                      onChange={handleInputChange}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
                      placeholder="Enter expense description"
                    />
                  </div>

                  {/* Amount */}
                  <div>
                    <label htmlFor="amount" className="block text-sm font-medium text-gray-700">
                      Amount *
                    </label>
                    <div className="mt-1 relative">
                      <input
                        type="number"
                        name="amount"
                        id="amount"
                        required
                        min="0"
                        step="0.01"
                        value={formData.amount}
                        onChange={handleInputChange}
                        className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 pl-10"
                        placeholder="0.00"
                      />
                      <CurrencyDollarIcon className="absolute left-3 top-2 h-5 w-5 text-gray-400" />
                    </div>
                  </div>

                  {/* Date */}
                  <div>
                    <label htmlFor="expense_date" className="block text-sm font-medium text-gray-700">
                      Expense Date *
                    </label>
                    <div className="mt-1 relative">
                      <input
                        type="date"
                        name="expense_date"
                        id="expense_date"
                        required
                        value={formData.expense_date}
                        onChange={handleInputChange}
                        className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 pr-10"
                      />
                      <CalendarIcon className="absolute right-3 top-2 h-5 w-5 text-gray-400" />
                    </div>
                  </div>

                  {/* Vendor */}
                  <div>
                    <label htmlFor="vendor_name" className="block text-sm font-medium text-gray-700">
                      Vendor/Supplier
                    </label>
                    <input
                      type="text"
                      name="vendor_name"
                      id="vendor_name"
                      value={formData.vendor_name}
                      onChange={handleInputChange}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
                      placeholder="Vendor or supplier name"
                    />
                  </div>

                  {/* Category */}
                  <div>
                    <label htmlFor="budget_category_id" className="block text-sm font-medium text-gray-700">
                      Budget Category
                    </label>
                    <select
                      name="budget_category_id"
                      id="budget_category_id"
                      value={formData.budget_category_id}
                      onChange={handleInputChange}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
                    >
                      <option value="">No specific category</option>
                      {categories.map((category) => (
                        <option key={category.id} value={category.id}>
                          {category.name} ({category.category})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Receipt Upload */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Receipt (Optional)
                    </label>
                    <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                      <div className="space-y-1 text-center">
                        <DocumentIcon className="mx-auto h-12 w-12 text-gray-400" />
                        <div className="flex text-sm text-gray-600">
                          <label
                            htmlFor="receipt_file"
                            className="relative cursor-pointer bg-white rounded-md font-medium text-primary-600 hover:text-primary-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-primary-500"
                          >
                            <span>Upload receipt</span>
                            <input
                              id="receipt_file"
                              name="receipt_file"
                              type="file"
                              className="sr-only"
                              accept="image/*,application/pdf"
                              onChange={handleFileChange}
                            />
                          </label>
                        </div>
                        <p className="text-xs text-gray-500">
                          PNG, JPG, GIF, PDF up to 10MB
                        </p>
                        {formData.receipt_file && (
                          <p className="text-xs text-gray-700 font-medium">
                            Selected: {formData.receipt_file.name}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Upload Progress */}
                  {uploadProgress > 0 && uploadProgress < 100 && (
                    <div className="mt-2">
                      <div className="flex justify-between text-sm text-gray-600 mb-1">
                        <span>Uploading receipt...</span>
                        <span>{uploadProgress}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${uploadProgress}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex items-center justify-end space-x-3 pt-6 border-t border-gray-200">
                    <button
                      type="button"
                      onClick={handleClose}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="px-4 py-2 text-sm font-medium text-white bg-primary-600 border border-transparent rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? 'Adding...' : 'Add Expense'}
                    </button>
                  </div>
                </form>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default ExpenseModal;