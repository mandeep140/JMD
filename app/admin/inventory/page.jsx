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

  // Filter states
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [selectedClient, setSelectedClient] = useState('');
  const [selectedFromDate, setSelectedFromDate] = useState('');
  const [selectedToDate, setSelectedToDate] = useState('');

  // Export popup states
  const [showExportPopup, setShowExportPopup] = useState(false);
  const [exportFromDate, setExportFromDate] = useState('');
  const [exportToDate, setExportToDate] = useState('');

  // Pagination
  const [page, setPage] = useState(1);
  const PER_PAGE = 8;
  const [dateSortAsc, setDateSortAsc] = useState(false);

  useEffect(() => {
    fetch("/api/ads")
      .then((res) => res.json())
      .then((data) => {
        setData(data || []);
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
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
        alert("Failed to delete ad.");
      }
    } catch (err) {
      alert("Error deleting ad.");
    }
    setConfirmDelete(false);
    setAdToDelete(null);
  };

  const handleExportWithDateRange = () => {
    // Use filteredData instead of all data
    if (filteredData.length === 0) {
      alert("No data to export.");
      return;
    }
    // Filter by export date range (on top of filters)
    const exportData = filteredData.filter(d => {
      if (!d.date) return false;
      const dDate = new Date(d.date).setHours(0, 0, 0, 0);
      const from = exportFromDate ? new Date(exportFromDate).setHours(0, 0, 0, 0) : null;
      const to = exportToDate ? new Date(exportToDate).setHours(0, 0, 0, 0) : null;
      if (from && dDate < from) return false;
      if (to && dDate > to) return false;
      return true;
    });

    if (exportData.length === 0) {
      alert("No data found in selected date range.");
      return;
    }
    
    // Use the new admin export API for inventory
    exportRef.current.exportData(exportData, 'inventory');
  };

  const filteredData = data.filter(d =>
    (selectedStatus ? d.status === selectedStatus : true) &&
    (selectedCity ? d.city === selectedCity : true) &&
    (selectedType ? d.type === selectedType : true) &&
    (selectedClient ? d.clientname === selectedClient : true) &&
    (
      selectedFromDate || selectedToDate
        ? (() => {
            if (!d.date) return false;
            const dDate = new Date(d.date).setHours(0, 0, 0, 0);
            const from = selectedFromDate ? new Date(selectedFromDate).setHours(0, 0, 0, 0) : null;
            const to = selectedToDate ? new Date(selectedToDate).setHours(0, 0, 0, 0) : null;
            if (from && dDate < from) return false;
            if (to && dDate > to) return false;
            return true;
          })()
        : true
    )
  );

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
  const clientOptions = Array.from(new Set(data.map(d => d.clientname).filter(Boolean)));

  if (status === "loading") {
    return (
      <AdminNav>
        <div className="w-full h-screen flex items-center justify-center text-black text-center">
          Hold on While we fetching data - JMD <br />Showa.online
        </div>
      </AdminNav>
    );
  }

  if (status === "authenticated") {
    return (
      <AdminNav>
        <div className='w-full md:h-9/10 flex flex-col items-center justify-start gap-4 p-2 md:p-6 bg-[#E9E9E9]'>
          {/* top nav */}
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

          {/* main */}
          <div className="bg-white w-full h-auto min-h-[400px] text-black rounded-lg shadow p-2 md:p-4">
            {/* Filters */}
            <div className="flex flex-wrap gap-2 mb-4">
              {/* Status filter */}
              <select
                className="border rounded px-2 py-1 text-xs md:px-3 md:py-1 md:text-sm"
                value={selectedStatus}
                onChange={e => {
                  setSelectedStatus(e.target.value);
                  setPage(1);
                }}
              >
                <option value="">Status</option>
                {statusOptions.map(status => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
              {/* City filter */}
              <select
                className="border rounded px-2 py-1 text-xs md:px-3 md:py-1 md:text-sm"
                value={selectedCity}
                onChange={e => {
                  setSelectedCity(e.target.value);
                  setPage(1);
                }}
              >
                <option value="">City</option>
                {cityOptions.map(city => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </select>
              {/* Type filter */}
              <select
                className="border rounded px-2 py-1 text-xs md:px-3 md:py-1 md:text-sm"
                value={selectedType}
                onChange={e => {
                  setSelectedType(e.target.value);
                  setPage(1);
                }}
              >
                <option value="">Type</option>
                {typeOptions.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
              {/* Client Name filter */}
              <select
                className="border rounded px-2 py-1 text-xs md:px-3 md:py-1 md:text-sm"
                value={selectedClient}
                onChange={e => {
                  setSelectedClient(e.target.value);
                  setPage(1);
                }}
              >
                <option value="">Client Name</option>
                {clientOptions.map(client => (
                  <option key={client} value={client}>{client}</option>
                ))}
              </select>
              {/* From Date filter */}
              <input
                type="date"
                className="border rounded px-2 py-1 text-xs md:px-3 md:py-1 md:text-sm"
                value={selectedFromDate}
                id="datefrom"
                title='from date'
                onChange={e => {
                  setSelectedFromDate(e.target.value);
                  setPage(1);
                }}
                placeholder="From"
              />
              {/* To Date filter */}
              <input
                type="date"
                className="border rounded px-2 py-1 text-xs md:px-3 md:py-1 md:text-sm"
                value={selectedToDate}
                title='to date'
                onChange={e => {
                  setSelectedToDate(e.target.value);
                  setPage(1);
                }}
                placeholder="To"
              />
              <button
                className="md:ml-auto md:mx-0 mx-auto border rounded px-2 py-1 text-xs md:px-3 md:py-1 md:text-sm flex items-center gap-1"
                onClick={() => setDateSortAsc(prev => !prev)}
              >
                Filter according to date added
                <span className="text-xs">{dateSortAsc ? "↑" : "↓"}</span>
              </button>
            </div>
            {/* Table */}
            <div className="overflow-x-auto flex flex-col rounded-2xl bg-[#E9E9E9]">
              <div className='w-full flex flex-col md:flex-row items-center justify-between mb-2 px-2 md:px-4 pt-2 gap-2'>
                <span className="text-base md:text-lg font-bold text-black">All Media List - JMD Advertisement </span>
                <button
                  className="mx-auto md:ml-auto md:mx-0 bg-blue-100 hover:bg-blue-200 cursor-pointer text-blue-700 px-2 py-1 md:px-3 md:py-1 rounded flex items-center gap-1 duration-200 text-xs md:text-base"
                  onClick={() => setShowExportPopup(true)}
                >
                  <span className='flex flex-row items-center justify-center text-center gap-1'>
                    <MdDownloading /> Export to Excel
                  </span>
                  <ExportToExcel ref={exportRef} />
                </button>
              </div>
              <div className="w-full overflow-x-auto">
                <table className="min-w-[700px] md:min-w-full text-xs md:text-sm">
                  <thead className="bg-gray-100 sticky top-0">
                    <tr>
                      <th className="px-2 py-2 text-left">Status</th>
                      <th className="px-2 py-2 text-left">Title</th>
                      <th className="px-2 py-2 text-left">Client Name</th>
                      <th className="px-2 py-2 text-left">Media Code</th>
                      <th className="px-2 py-2 text-left">City</th>
                      <th className="px-2 py-2 text-left">Type</th>
                      <th className="px-2 py-2 text-left">Price PM</th>
                      <th className="px-2 py-2 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginated.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="text-center py-4">No bookings found.</td>
                      </tr>
                    ) : (
                      paginated.map((row, i) => (
                        <tr key={i} className={`hover:bg-gray-50 ${i % 2 === 0 ? "bg-white" : "bg-gray-100"}`}>
                          <td className="px-2 py-2">
                            <span className={`inline-block w-3 h-3 rounded-full ${row.status === "Booked" ? "bg-red-500" : "bg-green-500"}`}></span>
                          </td>
                          <td className="px-2 py-2">{row.title}</td>
                          <td className="px-2 py-2">{row.clientname || "-"}</td>
                          <td className="px-2 py-2">{row.mediacode}</td>
                          <td className="px-2 py-2">{row.city}</td>
                          <td className="px-2 py-2">{row.type}</td>
                          <td className="px-2 py-2">{row.pricepermonth}</td>
                          <td className="px-2 py-2 text-center">
                            <div className="flex items-center justify-center gap-1">
                              <button
                                className="text-blue-600 hover:text-blue-700"
                                onClick={() => setViewAd(row)}
                                title="View"
                              >
                                <FaEye />
                              </button>
                              <Link href={`/admin/inventory/manage/${row.mediacode}`}>
                                <button
                                  className="text-green-600 hover:text-green-700"
                                  title="Edit"
                                >
                                  <FaPen />
                                </button>
                              </Link>
                              <button
                                className="text-red-600 hover:text-red-700"
                                onClick={() => {
                                  setAdToDelete(row);
                                  setConfirmDelete(true);
                                }}
                                title="Delete"
                              >
                                <FaTrash />
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

          {/* Delete Confirmation */}
          {confirmDelete && (
            <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 min-w-[300px] text-center">
                <h3 className="text-lg font-bold mb-4">Confirm Delete</h3>
                <p className="mb-4">Are you sure you want to delete this ad?</p>
                <div className="flex gap-3 justify-center">
                  <button
                    onClick={() => setConfirmDelete(false)}
                    className="px-4 py-2 bg-gray-300 hover:bg-gray-400 rounded"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDelete}
                    className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Export Date Range Popup */}
          {showExportPopup && (
            <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 min-w-[350px] text-center">
                <h3 className="text-lg font-bold mb-4">Export to Excel</h3>
                <p className="mb-4 text-sm">Select date range for export (optional)</p>
                <div className="flex flex-col gap-3 mb-4">
                  <div className="flex flex-col gap-1">
                    <label className="text-sm text-left">From Date:</label>
                    <input
                      type="date"
                      value={exportFromDate}
                      onChange={e => setExportFromDate(e.target.value)}
                      className="border rounded px-3 py-2"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-sm text-left">To Date:</label>
                    <input
                      type="date"
                      value={exportToDate}
                      onChange={e => setExportToDate(e.target.value)}
                      className="border rounded px-3 py-2"
                    />
                  </div>
                </div>
                <div className="flex gap-3 justify-center">
                  <button
                    onClick={() => {
                      setShowExportPopup(false);
                      setExportFromDate('');
                      setExportToDate('');
                    }}
                    className="px-4 py-2 bg-gray-300 hover:bg-gray-400 rounded"
                  >
                    Cancel
                  </button>
                  <button
                    className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded"
                    onClick={() => {
                      handleExportWithDateRange();
                      setShowExportPopup(false);
                    }}
                  >
                    Export
                  </button>
                </div>
              </div>
            </div>
          )}
          {/* View Ad Details Popup */}
          {viewAd && (
            <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg shadow-lg p-6 min-w-[350px] max-w-[95vw] max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-4">
                  <span className="font-bold text-lg">Media Details</span>
                  <button
                    className="text-red-500 font-bold text-lg"
                    onClick={() => setViewAd(null)}
                  >
                    ×
                  </button>
                </div>
                <div className="flex flex-col gap-2">
                  {viewAd.imageUrl && (
                    <img
                      src={viewAd.imageUrl}
                      alt={viewAd.title}
                      className="w-full max-h-56 object-cover rounded mb-2"
                    />
                  )}
                  <div><b>Title:</b> {viewAd.title}</div>
                  <div><b>Media Code:</b> {viewAd.mediacode}</div>
                  <div><b>Status:</b> {viewAd.status}</div>
                  <div><b>Client Name:</b> {viewAd.clientname}</div>
                  <div><b>City:</b> {viewAd.city}</div>
                  <div><b>Type:</b> {viewAd.type}</div>
                  <div><b>Size:</b> {viewAd.size}</div>
                  <div><b>Lighting:</b> {viewAd.lighting}</div>
                  <div><b>Price per Month:</b> {viewAd.pricepermonth}</div>
                  <div><b>Price per Day:</b> {viewAd.priceperday}</div>
                  <div><b>Booked From:</b> {viewAd.bookedfrom}</div>
                  <div><b>Booked Till:</b> {viewAd.bookedtill}</div>
                  <div><b>Show on site:</b> {viewAd.show ? "yes" : "no"}</div>
                  <div><b>Coordinates:</b> {viewAd.coordinates ? `${viewAd.coordinates.lat}, ${viewAd.coordinates.lng}` : "N/A"}</div>
                  <div><b>Message:</b> {viewAd.message}</div>
                  <div><b>Date Added:</b> {viewAd.date ? new Date(viewAd.date).toLocaleDateString() : "N/A"}</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </AdminNav>
    )
  }
}

export default page