import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Search,
  ChevronLeft,
  ChevronRight,
  Edit,
  Trash2,
  Eye,
  Filter,
  SortAsc,
  SortDesc } from
'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue } from
'@/components/ui/select';

interface Column {
  key: string;
  title: string;
  sortable?: boolean;
  render?: (value: any, row: any) => React.ReactNode;
}

interface DataTableProps {
  title: string;
  data: any[];
  columns: Column[];
  loading?: boolean;
  onAdd?: () => void;
  onEdit?: (item: any) => void;
  onDelete?: (item: any) => void;
  onView?: (item: any) => void;
  searchable?: boolean;
  filterable?: boolean;
  pageSize?: number;
}

const DataTable: React.FC<DataTableProps> = ({
  title,
  data,
  columns,
  loading = false,
  onAdd,
  onEdit,
  onDelete,
  onView,
  searchable = true,
  pageSize = 10
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: 'asc' | 'desc';
  } | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  // Filter data based on search term
  const filteredData = data.filter((item) =>
  Object.values(item).some((value) =>
  String(value).toLowerCase().includes(searchTerm.toLowerCase())
  )
  );

  // Sort data
  const sortedData = [...filteredData].sort((a, b) => {
    if (!sortConfig) return 0;

    const aValue = a[sortConfig.key];
    const bValue = b[sortConfig.key];

    if (aValue < bValue) {
      return sortConfig.direction === 'asc' ? -1 : 1;
    }
    if (aValue > bValue) {
      return sortConfig.direction === 'asc' ? 1 : -1;
    }
    return 0;
  });

  // Paginate data
  const totalPages = Math.ceil(sortedData.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedData = sortedData.slice(startIndex, startIndex + pageSize);

  const handleSort = (key: string) => {
    setSortConfig((prev) => ({
      key,
      direction: prev?.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const getSortIcon = (key: string) => {
    if (sortConfig?.key !== key) return null;
    return sortConfig.direction === 'asc' ?
    <SortAsc className="h-4 w-4" /> :
    <SortDesc className="h-4 w-4" />;
  };

  const formatValue = (value: any) => {
    if (value === null || value === undefined) return 'N/A';
    if (typeof value === 'boolean') return value ? 'Yes' : 'No';
    if (typeof value === 'number' && value > 1000000000000) {
      // Likely a timestamp
      return new Date(value).toLocaleDateString();
    }
    return String(value);
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            <div className="space-y-2">
              {[...Array(5)].map((_, i) =>
              <div key={i} className="h-4 bg-gray-200 rounded"></div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>);

  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>{title}</CardTitle>
          {onAdd &&
          <Button onClick={onAdd}>
              Add New
            </Button>
          }
        </div>
        
        {searchable &&
        <div className="flex gap-4 items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10" />

            </div>
          </div>
        }
      </CardHeader>
      
      <CardContent>
        {paginatedData.length === 0 ?
        <div className="text-center py-8 text-gray-500">
            No data available
          </div> :

        <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    {columns.map((column) =>
                  <th
                    key={column.key}
                    className="text-left p-3 font-medium">

                        {column.sortable ?
                    <Button
                      variant="ghost"
                      onClick={() => handleSort(column.key)}
                      className="p-0 h-auto font-medium flex items-center gap-1">

                            {column.title}
                            {getSortIcon(column.key)}
                          </Button> :

                    column.title
                    }
                      </th>
                  )}
                    {(onEdit || onDelete || onView) &&
                  <th className="text-left p-3 font-medium">Actions</th>
                  }
                  </tr>
                </thead>
                <tbody>
                  {paginatedData.map((item, index) =>
                <tr key={item.id || index} className="border-b hover:bg-gray-50">
                      {columns.map((column) =>
                  <td key={column.key} className="p-3">
                          {column.render ?
                    column.render(item[column.key], item) :
                    formatValue(item[column.key])
                    }
                        </td>
                  )}
                      {(onEdit || onDelete || onView) &&
                  <td className="p-3">
                          <div className="flex gap-1">
                            {onView &&
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onView(item)}
                        title="View">

                                <Eye className="h-4 w-4" />
                              </Button>
                      }
                            {onEdit &&
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onEdit(item)}
                        title="Edit">

                                <Edit className="h-4 w-4" />
                              </Button>
                      }
                            {onDelete &&
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onDelete(item)}
                        title="Delete">

                                <Trash2 className="h-4 w-4" />
                              </Button>
                      }
                          </div>
                        </td>
                  }
                    </tr>
                )}
                </tbody>
              </table>
            </div>

            {totalPages > 1 &&
          <div className="flex justify-between items-center mt-4 pt-4 border-t">
                <div className="text-sm text-gray-600">
                  Showing {startIndex + 1} to {Math.min(startIndex + pageSize, sortedData.length)} of {sortedData.length} entries
                </div>
                <div className="flex gap-2">
                  <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                disabled={currentPage === 1}>

                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="px-3 py-1 text-sm">
                    Page {currentPage} of {totalPages}
                  </span>
                  <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}>

                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
          }
          </>
        }
      </CardContent>
    </Card>);

};

export default DataTable;