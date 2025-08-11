"use client";
import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import AdminNav from '@/app/component/AdminNav';
import { FaHistory, FaUser, FaCalendarAlt, FaFilter } from 'react-icons/fa';
import * as XLSX from 'xlsx'; // install xlsx if not present

const HistoryPage = () => {
  const { data: session, status } = useSession();

  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({});
  
  // Filters
  const [filters, setFilters] = useState({
    actionType: '',
    entityCode: '',
    fromDate: '',
    toDate: '',
    page: 1,
    limit: 20
  });

  const [showExportPopup, setShowExportPopup] = useState(false);
  const [showDeletePopup, setShowDeletePopup] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) queryParams.append(key, value);
      });

      const response = await fetch(`/api/history?${queryParams}`);
      const data = await response.json();
      
      if (response.ok) {
        setHistory(data.history || []);
        setPagination(data.pagination || {});
      } else {
        console.error('Error fetching history:', data.error);
        setHistory([]);
      }
    } catch (error) {
      console.error('Error fetching history:', error);
      setHistory([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (status === "authenticated" && session?.user?.isAdmin) {
      fetchHistory();
    }
  }, [status, session, filters]);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: key !== 'page' ? 1 : value // Reset page when other filters change
    }));
  };

  const clearFilters = () => {
    setFilters({
      actionType: '',
      entityCode: '',
      fromDate: '',
      toDate: '',
      page: 1,
      limit: 20
    });
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getActionColor = (action) => {
    switch (action) {
      case 'CREATE': return 'bg-green-100 text-green-800';
      case 'UPDATE': return 'bg-blue-100 text-blue-800';
      case 'DELETE': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Export to Excel function
  const handleExportToExcel = async () => {
    setExporting(true);
    try {
      // Fetch all history from backend (not just paginated)
      const response = await fetch('/api/history?all=true');
      const data = await response.json();
      const records = data.history || [];

      // Prepare data for Excel
      const excelData = records.map(r => ({
        Name: r.changedBy?.userName || '',
        Email: r.changedBy?.userEmail || '',
        Summary: r.summary || '',
      }));

      // Create worksheet and workbook
      const worksheet = XLSX.utils.json_to_sheet(excelData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'History');

      // Download Excel file
      XLSX.writeFile(workbook, 'AD_history_export.xlsx');
    } catch (err) {
      alert('Error exporting history!');
    }
    setExporting(false);
    setShowExportPopup(false);
  };

  // Delete all history function
  const handleDeleteAllHistory = async () => {
    setDeleting(true);
    await handleExportToExcel(); // Export before delete
    try {
      const response = await fetch('/api/history', { method: 'DELETE' });
      if (response.ok) {
        alert('All history deleted!');
        fetchHistory(); // Refresh
      } else {
        alert('Error deleting history!');
      }
    } catch (err) {
      alert('Error deleting history!');
    }
    setDeleting(false);
    setShowDeletePopup(false);
  };

  if (status === "loading") {
    return (
      <AdminNav>
        <div className="w-full min-h-screen flex items-center justify-center text-black text-center">
          <div className="flex flex-col items-center gap-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            <div>Loading History...</div>
          </div>
        </div>
      </AdminNav>
    );
  }

  if (status !== "authenticated" || !session?.user?.isAdmin) {
    return (
      <AdminNav>
        <div className="w-full min-h-screen flex items-center justify-center text-black text-center">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded max-w-md">
            Access Denied. Admin privileges required.
          </div>
        </div>
      </AdminNav>
    );
  }

  return (
    <AdminNav>
      <div className='w-full min-h-screen flex flex-col gap-4 p-2 md:p-6 bg-[#E9E9E9] overflow-hidden'>
        {/* Export/Delete Buttons */}
        <div className="flex gap-2 mb-2">
          <button
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded font-semibold"
            onClick={() => setShowExportPopup(true)}
            disabled={exporting}
          >
            Export to Excel
          </button>
          <button
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded font-semibold"
            onClick={() => setShowDeletePopup(true)}
            disabled={deleting}
          >
            Delete All History
          </button>
        </div>

        {/* Export Popup */}
        {showExportPopup && (
          <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full">
              <h2 className="text-lg font-bold mb-2">Export to Excel</h2>
              <p className="mb-4">All history records from the database will be exported to Excel. Only Name, Email, and Change Summary will be included.</p>
              <div className="flex gap-2 justify-end">
                <button
                  className="bg-gray-200 px-4 py-2 rounded"
                  onClick={() => setShowExportPopup(false)}
                  disabled={exporting}
                >Cancel</button>
                <button
                  className="bg-green-600 text-white px-4 py-2 rounded"
                  onClick={handleExportToExcel}
                  disabled={exporting}
                >{exporting ? 'Exporting...' : 'Export'}</button>
              </div>
            </div>
          </div>
        )}

        {/* Delete Popup */}
        {showDeletePopup && (
          <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full">
              <h2 className="text-lg font-bold mb-2">Delete All History</h2>
              <p className="mb-4">Before deleting, all history will be exported to Excel. Are you sure you want to delete all history records?</p>
              <div className="flex gap-2 justify-end">
                <button
                  className="bg-gray-200 px-4 py-2 rounded"
                  onClick={() => setShowDeletePopup(false)}
                  disabled={deleting}
                >Cancel</button>
                <button
                  className="bg-red-600 text-white px-4 py-2 rounded"
                  onClick={handleDeleteAllHistory}
                  disabled={deleting}
                >{deleting ? 'Deleting...' : 'Delete & Export'}</button>
              </div>
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="bg-white w-full flex-1 text-black rounded-lg shadow flex flex-col overflow-hidden">
          <div className="p-2 md:p-4 flex-shrink-0">
            {/* Header */}
            <div className="flex items-center gap-3 mb-6">
              <FaHistory className="text-2xl text-blue-500 flex-shrink-0" />
              <div className="min-w-0">
                <h1 className="text-xl md:text-2xl font-bold text-gray-800 truncate">Ad Change History</h1>
                <p className="text-sm md:text-base text-gray-600">Track all advertisement changes and modifications</p>
              </div>
            </div>

            {/* Filters */}
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <div className="flex items-center gap-2 mb-3">
                <FaFilter className="text-gray-600 flex-shrink-0" />
                <h3 className="text-sm font-semibold text-gray-700">Filters</h3>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 mb-4">
                <select
                  className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
                  value={filters.actionType}
                  onChange={e => handleFilterChange('actionType', e.target.value)}
                >
                  <option value="">All Actions</option>
                  <option value="CREATE">Created</option>
                  <option value="UPDATE">Updated</option>
                  <option value="DELETE">Deleted</option>
                </select>

                <input
                  type="text"
                  placeholder="Search by media code"
                  className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
                  value={filters.entityCode}
                  onChange={e => handleFilterChange('entityCode', e.target.value)}
                />

                <input
                  type="date"
                  className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
                  value={filters.fromDate}
                  onChange={e => handleFilterChange('fromDate', e.target.value)}
                  title="From date"
                />

                <input
                  type="date"
                  className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
                  value={filters.toDate}
                  onChange={e => handleFilterChange('toDate', e.target.value)}
                  title="To date"
                />

                <select
                  className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
                  value={filters.limit}
                  onChange={e => handleFilterChange('limit', e.target.value)}
                >
                  <option value={20}>20 per page</option>
                  <option value={50}>50 per page</option>
                  <option value={100}>100 per page</option>
                </select>
              </div>

              <button
                onClick={clearFilters}
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1 rounded-md text-sm transition-colors duration-200"
              >
                Clear All Filters
              </button>
            </div>

            {/* Results Info */}
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 mb-4">
              <div className="text-sm text-gray-600">
                {pagination.total ? `Showing ${((pagination.page - 1) * pagination.limit) + 1}-${Math.min(pagination.page * pagination.limit, pagination.total)} of ${pagination.total} records` : 'No records found'}
              </div>
              <div className="text-sm text-gray-500">
                Page {pagination.page || 1} of {pagination.totalPages || 1}
              </div>
            </div>
          </div>

          {/* History List - Scrollable */}
          <div className="flex-1 overflow-y-auto px-2 md:px-4 pb-4">
            <div className="space-y-4">
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
                  <div className="text-gray-500">Loading history...</div>
                </div>
              ) : history.length === 0 ? (
                <div className="text-center py-8">
                  <FaHistory className="text-4xl text-gray-400 mx-auto mb-4" />
                  <div className="text-gray-500">No history records found</div>
                </div>
              ) : (
                history.map((record, index) => (
                  <div key={record._id || index} className="border border-gray-200 rounded-lg p-3 md:p-4 hover:bg-gray-50 transition-colors duration-150">
                    <div className="flex flex-col gap-4">
                      {/* Main Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getActionColor(record.actionType)} flex-shrink-0`}>
                            {record.actionType}
                          </span>
                          <span className="text-xs text-gray-500 font-mono break-all">
                            {record.entityCode}
                          </span>
                        </div>
                        
                        <p className="text-sm text-gray-900 mb-2 break-words">{record.summary}</p>
                        
                        {/* Changes Detail */}
                        {record.changes && record.changes.length > 0 && (
                          <div className="text-xs text-gray-600 bg-gray-100 rounded p-2 mt-2 overflow-hidden">
                            <strong>Detailed Changes:</strong>
                            <div className="mt-1 space-y-1 max-h-32 overflow-y-auto">
                              {record.changes.map((change, idx) => (
                                <div key={idx} className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 py-1">
                                  <span className="font-medium flex-shrink-0">{change.field}:</span>
                                  <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 min-w-0">
                                    <span className="text-red-600 break-words">"{change.oldValue || 'N/A'}"</span>
                                    <span className="flex-shrink-0">→</span>
                                    <span className="text-green-600 break-words">"{change.newValue || 'N/A'}"</span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Metadata */}
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-2 pt-2 border-t border-gray-100">
                        <div className="flex flex-col gap-1 text-xs text-gray-500 min-w-0">
                          <div className="flex items-center gap-1">
                            <FaUser className="text-gray-400 flex-shrink-0" />
                            <span className="truncate">{record.changedBy.userName}</span>
                          </div>
                          <div className="truncate">{record.changedBy.userEmail}</div>
                        </div>
                        <div className="flex flex-col items-start sm:items-end gap-1 text-xs text-gray-500">
                          <div className="flex items-center gap-1">
                            <FaCalendarAlt className="text-gray-400 flex-shrink-0" />
                            <span className="whitespace-nowrap">{formatTimestamp(record.timestamp)}</span>
                          </div>
                          {record.ipAddress && (
                            <div className="font-mono text-gray-400 text-xs">
                              IP: {record.ipAddress}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Pagination - Fixed at bottom */}
          {pagination.totalPages > 1 && (
            <div className="flex-shrink-0 border-t border-gray-200 p-2 md:p-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div className="text-sm text-gray-600">
                  Page {pagination.page} of {pagination.totalPages}
                </div>
                <div className="flex gap-2 justify-center sm:justify-end">
                  <button
                    disabled={pagination.page <= 1}
                    onClick={() => handleFilterChange('page', pagination.page - 1)}
                    className="px-3 py-2 text-sm bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-150"
                  >
                    Previous
                  </button>
                  <button
                    disabled={pagination.page >= pagination.totalPages}
                    onClick={() => handleFilterChange('page', pagination.page + 1)}
                    className="px-3 py-2 text-sm bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-150"
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </AdminNav>
  );
};

export default HistoryPage;