"use client";
import React, { useEffect, useState, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import AdminNav from '@/app/component/AdminNav';
import ExportToExcel from '@/app/component/ExportToExcel';
import { FaPen, FaEye, FaTrash } from 'react-icons/fa';
import { MdDownloading } from 'react-icons/md';

const page = () => {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const exportRef = useRef();

  const [data, setData] = useState([]);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [adToDelete, setAdToDelete] = useState(null);
  const [viewAd, setViewAd] = useState(null);
  const [loading, setLoading] = useState(false);

  // Filter states
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [selectedClient, setSelectedClient] = useState('');
  const [selectedFromDate, setSelectedFromDate] = useState('');
  const [selectedToDate, setSelectedToDate] = useState('');
  const [selectedLocality, setSelectedLocality] = useState(''); // New filter
  const [selectedHoldBookedBy, setSelectedHoldBookedBy] = useState(''); // New filter

  // Pagination
  const [page, setPage] = useState(1);
  const PER_PAGE = 10;
  const [dateSortAsc, setDateSortAsc] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetch("/api/ads")
      .then((res) => res.json())
      .then((data) => {
        setData(data || []);
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
      })
      .finally(() => {
        setLoading(false);
      });

  }, []);

  const handleDelete = async () => {
    if (!adToDelete) return;
    try {
      const res = await fetch(`/api/ads`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mediacode: adToDelete.mediacode }),
      });
      if (res.ok) {
        setData((prev) => prev.filter((ad) => ad.mediacode !== adToDelete.mediacode));
      } else {
        const errorData = await res.json();
        alert(errorData.error || "Failed to delete ad.");
      }
    } catch (err) {
      alert("Error deleting ad.");
    }
    setConfirmDelete(false);
    setAdToDelete(null);
  };

  const handleExportWithCurrentFilters = () => {
    if (filteredData.length === 0) {
      alert("No data to export with current filters.");
      return;
    }
    
    // Use the current filtered data directly
    exportRef.current.exportData(filteredData, 'inventory');
    
    // Show confirmation message with filter info
    const filterInfo = [];
    if (selectedStatus) filterInfo.push(`Status: ${selectedStatus}`);
    if (selectedCity) filterInfo.push(`City: ${selectedCity}`);
    if (selectedType) filterInfo.push(`Type: ${selectedType}`);
    if (selectedClient) filterInfo.push(`Client: ${selectedClient}`);
    if (selectedLocality) filterInfo.push(`Locality: ${selectedLocality}`);
    if (selectedHoldBookedBy) filterInfo.push(`Hold/Booked By: ${selectedHoldBookedBy}`);
    if (selectedFromDate) filterInfo.push(`From: ${selectedFromDate}`);
    if (selectedToDate) filterInfo.push(`To: ${selectedToDate}`);
    
    const message = filterInfo.length > 0 
      ? `Exported ${filteredData.length} records with filters: ${filterInfo.join(', ')}`
      : `Exported all ${filteredData.length} records`;
      
    alert(message);
  };

  // Fixed filtering logic
  const filteredData = data.filter(d => {
    if (selectedStatus && d.status !== selectedStatus) return false;
    if (selectedCity && d.city !== selectedCity) return false;
    if (selectedType && d.type !== selectedType) return false;
    
    // Locality filter
    if (selectedLocality && d.locality !== selectedLocality) return false;
    
    // Hold/Booked by filter
    if (selectedHoldBookedBy && d.holdBookedBy !== selectedHoldBookedBy) return false;

    if (selectedClient) {
      const clientName = d.clientname || d.clientName || '';
      if (clientName !== selectedClient) return false;
    }

    if (selectedFromDate || selectedToDate) {
      if (!d.date) return false;

      const dDate = new Date(d.date);
      const fromDate = selectedFromDate ? new Date(selectedFromDate) : null;
      const toDate = selectedToDate ? new Date(selectedToDate) : null;

      if (fromDate) {
        fromDate.setHours(0, 0, 0, 0);
        dDate.setHours(0, 0, 0, 0);
        if (dDate < fromDate) return false;
      }

      if (toDate) {
        toDate.setHours(23, 59, 59, 999);
        dDate.setHours(23, 59, 59, 999);
        if (dDate > toDate) return false;
      }
    }

    return true;
  });

  // Sort by date
  const sortedData = [...filteredData].sort((a, b) => {
    if (!a.date || !b.date) return 0;
    return dateSortAsc
      ? new Date(a.date) - new Date(b.date)
      : new Date(b.date) - new Date(a.date);
  });

  const paginated = sortedData.slice((page - 1) * PER_PAGE, page * PER_PAGE);
  const totalPages = Math.ceil(sortedData.length / PER_PAGE);

  const statusOptions = Array.from(new Set(data.map(d => d.status).filter(Boolean)));
  const cityOptions = Array.from(new Set(data.map(d => d.city).filter(Boolean)));
  const typeOptions = Array.from(new Set(data.map(d => d.type).filter(Boolean)));
  const clientOptions = Array.from(new Set(data.map(d => d.clientname || d.clientName).filter(Boolean)));
  const localityOptions = Array.from(new Set(data.map(d => d.locality).filter(Boolean))); // New options
  const holdBookedByOptions = Array.from(new Set(data.map(d => d.holdBookedBy).filter(Boolean))); // New options

  const resetPage = () => setPage(1);

  if (status === "loading") {
    return (
      <AdminNav>
        <div className="w-full min-h-screen flex items-center justify-center text-black text-center">
          <div className="flex flex-col items-center gap-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            <div>Hold on While we fetching data - JMD<br />Showa.online</div>
          </div>
        </div>
      </AdminNav>
    );
  }

  if (loading) {
    return (
      <AdminNav>
        <div className="w-full min-h-screen flex items-center justify-center text-black text-center">
          <div className="flex flex-col items-center gap-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            <div>Hold on While we fetching Ads - JMD<br />Showa.online</div>
          </div>
        </div>
      </AdminNav>
    );
  }

if (status === "authenticated") {
  return (
    <AdminNav>
      <div className='w-full min-h-screen flex flex-col gap-4 p-4 bg-[#F5F5F5]'>
        {/* Navigation Tabs */}
        <div className='w-full h-auto bg-white flex flex-col md:flex-row items-center justify-center rounded-md overflow-hidden'>
          <Link href="/admin/inventory/manage" className="w-full md:w-1/2">
            <span className={`block w-full py-2 text-center font-bold text-lg md:text-2xl cursor-pointer transition rounded-none md:rounded-md
              ${pathname === "/admin/inventory/manage" ? "bg-blue-200 text-blue-500 shadow-md" : "bg-transparent text-black"}`}>
              New Media Listing
            </span>
          </Link>
          <Link href="/admin/inventory" className="w-full md:w-1/2">
            <span className={`block w-full py-2 text-center font-bold text-lg md:text-2xl cursor-pointer transition rounded-none md:rounded-md
              ${pathname === "/admin/inventory" ? "bg-blue-200 text-blue-500 shadow-md" : "bg-transparent text-black"}`}>
              View All Media Listing
            </span>
          </Link>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          {/* Header */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-800 mb-2">Media Inventory</h1>
              <p className="text-gray-600">Manage all your media listings</p>
            </div>
            <button
              className="mt-4 lg:mt-0 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors duration-200"
              onClick={handleExportWithCurrentFilters}
              disabled={filteredData.length === 0}
            >
              <MdDownloading />
              Export to Excel ({filteredData.length} records)
            </button>
          </div>

          {/* Filters */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Filters</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-3 mb-4">
              <select
                className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={selectedStatus}
                onChange={e => { setSelectedStatus(e.target.value); resetPage(); }}
              >
                <option value="">All Status</option>
                {statusOptions.map(status => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>

              <select
                className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={selectedCity}
                onChange={e => { setSelectedCity(e.target.value); resetPage(); }}
              >
                <option value="">All Cities</option>
                {cityOptions.map(city => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </select>

              <select
                className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={selectedLocality}
                onChange={e => { setSelectedLocality(e.target.value); resetPage(); }}
              >
                <option value="">All Localities</option>
                {localityOptions.map(locality => (
                  <option key={locality} value={locality}>{locality}</option>
                ))}
              </select>

              <select
                className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={selectedType}
                onChange={e => { setSelectedType(e.target.value); resetPage(); }}
              >
                <option value="">All Types</option>
                {typeOptions.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>

              <select
                className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={selectedClient}
                onChange={e => { setSelectedClient(e.target.value); resetPage(); }}
              >
                <option value="">All Clients</option>
                {clientOptions.map(client => (
                  <option key={client} value={client}>{client}</option>
                ))}
              </select>

              <select
                className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={selectedHoldBookedBy}
                onChange={e => { setSelectedHoldBookedBy(e.target.value); resetPage(); }}
              >
                <option value="">All Hold/Booked By</option>
                {holdBookedByOptions.map(holdBookedBy => (
                  <option key={holdBookedBy} value={holdBookedBy}>{holdBookedBy}</option>
                ))}
              </select>

              <input
                type="date"
                className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={selectedFromDate}
                onChange={e => { setSelectedFromDate(e.target.value); resetPage(); }}
                title="From date"
              />

              <input
                type="date"
                className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={selectedToDate}
                onChange={e => { setSelectedToDate(e.target.value); resetPage(); }}
                title="To date"
              />
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1 rounded-md text-sm transition-colors duration-200"
                onClick={() => {
                  setSelectedStatus('');
                  setSelectedCity('');
                  setSelectedType('');
                  setSelectedClient('');
                  setSelectedLocality('');
                  setSelectedHoldBookedBy('');
                  setSelectedFromDate('');
                  setSelectedToDate('');
                  resetPage();
                }}
              >
                Clear Filters
              </button>
              <button
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1 rounded-md text-sm flex items-center gap-1 transition-colors duration-200"
                onClick={() => setDateSortAsc(prev => !prev)}
              >
                Sort by Date {dateSortAsc ? "↑" : "↓"}
              </button>
            </div>
          </div>

          {/* Results Info */}
          <div className="flex justify-between items-center mb-4">
            <div className="text-sm text-gray-600">
              Showing {filteredData.length} of {data.length} records
              {(selectedStatus || selectedCity || selectedType || selectedClient || selectedLocality || selectedHoldBookedBy || selectedFromDate || selectedToDate) && (
                <span className="ml-2 text-blue-600 font-medium">(filtered)</span>
              )}
            </div>
          </div>

          {/* Table */}
          <div className="overflow-hidden rounded-lg border border-gray-200">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Client</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Code</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">City</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price/Month</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Uploaded By</th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {paginated.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="px-4 py-8 text-center text-gray-500">
                        {filteredData.length === 0 && data.length > 0 ?
                          "No records match the selected filters." :
                          "No records found."
                        }
                      </td>
                    </tr>
                  ) : (
                    paginated.map((row, i) => (
                      <tr key={i} className="hover:bg-gray-50 transition-colors duration-150">
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                              ${row.status === "Booked"
                              ? "bg-red-100 text-red-800"
                              : row.status === "Hold"
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-green-100 text-green-800"}`}>
                            {row.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900">{row.title}</td>
                        <td className="px-4 py-3 text-sm text-gray-900">{row.clientname || row.clientName || "-"}</td>
                        <td className="px-4 py-3 text-sm font-mono text-gray-900">{row.mediacode}</td>
                        <td className="px-4 py-3 text-sm text-gray-900">{row.city}</td>
                        <td className="px-4 py-3 text-sm text-gray-900">{row.type}</td>
                        <td className="px-4 py-3 text-sm font-semibold text-gray-900">₹{row.pricepermonth}</td>
                        <td className="px-4 py-3 text-xs">
                          {row.uploadedBy ? (
                            <div>
                              <div className="font-medium text-gray-900">{row.uploadedBy.name || "Unknown"}</div>
                              <div className="text-gray-500">{row.uploadedBy.email || "Unknown"}</div>
                            </div>
                          ) : (
                            <span className="text-gray-400">Not Available</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-center space-x-2">
                            <button
                              className="text-blue-600 hover:text-blue-800 transition-colors duration-150"
                              onClick={() => setViewAd(row)}
                              title="View Details"
                            >
                              <FaEye className="w-4 h-4" />
                            </button>
                            <Link href={`/admin/inventory/manage/${row.mediacode}`}>
                              <button
                                className="text-green-600 hover:text-green-800 transition-colors duration-150"
                                title="Edit"
                              >
                                <FaPen className="w-4 h-4" />
                              </button>
                            </Link>
                            <button
                              className="text-red-600 hover:text-red-800 transition-colors duration-150"
                              onClick={() => {
                                setAdToDelete(row);
                                setConfirmDelete(true);
                              }}
                              title="Delete"
                            >
                              <FaTrash className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            {/* Pagination */}
            <div className="flex justify-center items-center gap-2 py-4">
              <button
                disabled={page === 1}
                onClick={() => setPage(page - 1)}
                className="px-3 py-1 bg-gray-300 hover:bg-gray-400 disabled:opacity-50 disabled:cursor-not-allowed rounded text-xs md:text-sm"
              >
                Previous
              </button>
              <span className="text-xs md:text-sm">Page {page} of {totalPages}</span>
              <button
                disabled={page === totalPages}
                onClick={() => setPage(page + 1)}
                className="px-3 py-1 bg-gray-300 hover:bg-gray-400 disabled:opacity-50 disabled:cursor-not-allowed rounded text-xs md:text-sm"
              >
                Next
              </button>
            </div>
          </div>
        </div>

        <ExportToExcel ref={exportRef} />

        {/* Delete Confirmation Modal */}
        {confirmDelete && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-6 max-w-md w-full">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Confirm Delete</h3>
              <p className="text-gray-600 mb-6">Are you sure you want to delete this ad? This action cannot be undone.</p>
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setConfirmDelete(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors duration-150"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 transition-colors duration-150"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}

        {/* View Ad Modal */}
        {viewAd && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Media Details</h3>
                <button
                  className="text-gray-400 hover:text-gray-600 transition-colors duration-150"
                  onClick={() => setViewAd(null)}
                >
                  <span className="text-2xl">×</span>
                </button>
              </div>
              <div className="p-6">
                {viewAd.imageUrl && (
                  <img
                    src={viewAd.imageUrl}
                    alt={viewAd.title}
                    className="w-full h-48 object-cover rounded-lg mb-6"
                  />
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div><strong>Title:</strong> {viewAd.title}</div>
                  <div><strong>Media Code:</strong> {viewAd.mediacode}</div>
                  <div><strong>Status:</strong> <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium
                      ${viewAd.status === "Booked" ? "bg-red-100 text-red-800" : viewAd.status === "Hold" ? "bg-yellow-100 text-yellow-800" : "bg-green-100 text-green-800"}`}>
                    {viewAd.status}
                  </span></div>
                  <div><strong>Client Name:</strong> {viewAd.clientname || viewAd.clientName || "N/A"}</div>
                  <div><strong>City:</strong> {viewAd.city}</div>
                  {viewAd.locality && <div><strong>Locality:</strong> {viewAd.locality}</div>}
                  <div><strong>Type:</strong> {viewAd.type}</div>
                  <div><strong>Size:</strong> {viewAd.width * viewAd.height}sqft</div>
                  {viewAd.width && viewAd.height && (
                    <div><strong>Dimensions:</strong> {viewAd.width} x {viewAd.height} ft</div>
                  )}
                  {viewAd.unit && <div><strong>Units Required:</strong> {viewAd.unit}</div>}
                  {viewAd.printing && <div><strong>Printing Cost per ft:</strong> {viewAd.printing}</div>}
                  {viewAd.mounting && <div><strong>Mounting Cost per ft:</strong> {viewAd.mounting}</div>}
                  <div><strong>Lighting:</strong> {viewAd.lighting}</div>
                  <div><strong>Price per Month:</strong> ₹{viewAd.pricepermonth}</div>
                  <div><strong>Price per Day:</strong> ₹{viewAd.priceperday}</div>
                  <div><strong>Booked From:</strong> {viewAd.bookedfrom}</div>
                  <div><strong>Booked Till:</strong> {viewAd.bookedtill}</div>
                  <div><strong>Show on site:</strong> {viewAd.show ? "Yes" : "No"}</div>
                  <div><strong>Date Added:</strong> {viewAd.date ? new Date(viewAd.date).toLocaleDateString() : "N/A"}</div>
                </div>
                {viewAd.coordinates && (
                  <div className="mt-4"><strong>Coordinates:</strong> {viewAd.coordinates.lat}, {viewAd.coordinates.lng}</div>
                )}
                {viewAd.message && (
                  <div className="mt-4"><strong>Message:</strong> {viewAd.message}</div>
                )}
                {viewAd.uploadedBy && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <strong>Uploaded By:</strong> {viewAd.uploadedBy.name || "Unknown"} ({viewAd.uploadedBy.email || "Unknown"})
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminNav>
  )
}
}

export default page;