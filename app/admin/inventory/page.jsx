"use client";
import React, { useEffect, useState, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import AdminNav from '@/app/component/AdminNav';
import ExportToExcel from '@/app/component/ExportToExcel';
import { FaPen, FaEye, FaTrash, FaChevronDown, FaTimes } from 'react-icons/fa';
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
  const [downloading, setDownloading] = useState(false);

  // Selection states
  const [selectedRows, setSelectedRows] = useState(new Set());
  const [selectAll, setSelectAll] = useState(false);

  // Filter states - converted to arrays for multi-select
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedState, setSelectedState] = useState('');
  const [selectedCities, setSelectedCities] = useState([]); // Multi-select
  const [selectedTypes, setSelectedTypes] = useState([]); // Multi-select
  const [selectedClient, setSelectedClient] = useState('');
  const [selectedMediaOwner, setSelectedMediaOwner] = useState([]); // Multi-select - FIXED: Changed from '' to []
  const [selectedFromDate, setSelectedFromDate] = useState('');
  const [selectedToDate, setSelectedToDate] = useState('');
  const [selectedLocalities, setSelectedLocalities] = useState([]); // Multi-select
  const [selectedHoldBookedBy, setSelectedHoldBookedBy] = useState('');
  const [selectedWidth, setSelectedWidth] = useState('');
  const [selectedHeight, setSelectedHeight] = useState('');
  const [selectedTotalArea, setSelectedTotalArea] = useState('');
  const [areaFilterHigher, setAreaFilterHigher] = useState(true); // true for higher, false for lower
  const [showExpiringAds, setShowExpiringAds] = useState(false); // New filter for expiring ads

  // Dropdown visibility states
  const [cityDropdownOpen, setCityDropdownOpen] = useState(false);
  const [localityDropdownOpen, setLocalityDropdownOpen] = useState(false);
  const [typeDropdownOpen, setTypeDropdownOpen] = useState(false);
  const [mediaOwnerDropdownOpen, setMediaOwnerDropdownOpen] = useState(false);

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
        // Remove from selected rows if it was selected
        setSelectedRows(prev => {
          const newSet = new Set(prev);
          newSet.delete(adToDelete.mediacode);
          return newSet;
        });
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

  // Selection handlers
  const handleRowSelect = (mediacode) => {
    setSelectedRows(prev => {
      const newSet = new Set(prev);
      if (newSet.has(mediacode)) {
        newSet.delete(mediacode);
      } else {
        newSet.add(mediacode);
      }
      return newSet;
    });
  };

  const handleSelectAll = (checked) => {
    setSelectAll(checked);
    if (checked) {
      setSelectedRows(new Set(filteredData.map(item => item.mediacode)));
    } else {
      setSelectedRows(new Set());
    }
  };

  // Remove individual selected item
  const handleRemoveSelected = (mediacode) => {
    setSelectedRows(prev => {
      const newSet = new Set(prev);
      newSet.delete(mediacode);
      return newSet;
    });
  };

  // Clear all selections
  const clearSelections = () => {
    setSelectedRows(new Set());
    setSelectAll(false);
  };

  // Get selected items data
  const getSelectedItemsData = () => {
    return data.filter(item => selectedRows.has(item.mediacode));
  };

  // Get data to export (selected rows or all filtered data)
  const getDataToExport = () => {
    if (selectedRows.size > 0) {
      return filteredData.filter(item => selectedRows.has(item.mediacode));
    }
    return filteredData;
  };

  const handleExportWithCurrentFilters = () => {
    setDownloading(true);
    const dataToExport = getDataToExport();

    if (dataToExport.length === 0) {
      alert("No data to export.");
      setDownloading(false);
      return;
    }

    exportRef.current.exportData(dataToExport, 'inventory');

    const filterInfo = [];
    if (selectedRows.size > 0) {
      filterInfo.push(`Selected: ${selectedRows.size} rows`);
    }
    if (selectedStatus) filterInfo.push(`Status: ${selectedStatus}`);
    if (selectedState) filterInfo.push(`State: ${selectedState}`);
    if (selectedCities.length > 0) filterInfo.push(`Cities: ${selectedCities.join(', ')}`);
    if (selectedTypes.length > 0) filterInfo.push(`Types: ${selectedTypes.join(', ')}`);
    if (selectedClient) filterInfo.push(`Client: ${selectedClient}`);
    if (selectedMediaOwner.length > 0) filterInfo.push(`Media Owner: ${selectedMediaOwner.join(', ')}`); // FIXED: Changed logic for array
    if (selectedLocalities.length > 0) filterInfo.push(`Localities: ${selectedLocalities.join(', ')}`);
    if (selectedHoldBookedBy) filterInfo.push(`Hold/Booked By: ${selectedHoldBookedBy}`);
    if (selectedFromDate) filterInfo.push(`From: ${selectedFromDate}`);
    if (selectedToDate) filterInfo.push(`To: ${selectedToDate}`);
    if (selectedTotalArea) filterInfo.push(`Total Area: ${areaFilterHigher ? '≥' : '≤'} ${selectedTotalArea} sqft`);
    if (showExpiringAds) filterInfo.push('Expiring/Expired Ads Only');

    const message = filterInfo.length > 0
      ? `Exported ${dataToExport.length} records with filters: ${filterInfo.join(', ')}`
      : `Exported all ${dataToExport.length} records`;

    alert(message);
    setDownloading(false);
  };

  const handleExportWithCurrentFiltersInPPTandExcel = async () => {
    setDownloading(true);

    let dataToExport;

    if (selectedRows.size > 0) {
      dataToExport = getSelectedItemsData();
    } else {
      dataToExport = getDataToExport();
    }

    if (dataToExport.length === 0) {
      alert("No data to export.");
      setDownloading(false);
      return;
    }

    const pptData = {
      title: `JMD Advertisement - Selected Hoardings (${dataToExport.length} items) - Admin`,
      subtitle: `Generated on ${new Date().toLocaleDateString()}`,
      ads: dataToExport
    };

    const response = await fetch('/api/generate-ppt', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(pptData),
    })

    if (response.ok) {
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `JMD_Hoardings_${new Date().toISOString().split('T')[0]}_Admin.pptx`;
      document.body.appendChild(a);
      a.click();
      a.remove();
    } else {
      console.error('Error generating PPT:', await response.text());
      alert('Error generating PPT');
    }

    const excelData = dataToExport.map(ad => ({
      ...ad,
      pricePerMonth: ad.pricepermonth,
    }))

    const excelResponse = await fetch('/api/generate-excel/user', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ ads: excelData }),
    });

    if (excelResponse.ok) {
      const blob = await excelResponse.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `JMD_Hoardings_${new Date().toISOString().split('T')[0]}_Admin.xlsx`;
      document.body.appendChild(a);
      a.click();
      a.remove();
    } else {
      console.error('Error generating Excel:', await excelResponse.text());
      alert('Error generating Excel');
    }

    const filterInfo = [];
    if (selectedRows.size > 0) {
      filterInfo.push(`Selected: ${selectedRows.size} rows`);
    }
    if (selectedStatus) filterInfo.push(`Status: ${selectedStatus}`);
    if (selectedState) filterInfo.push(`State: ${selectedState}`);
    if (selectedCities.length > 0) filterInfo.push(`Cities: ${selectedCities.join(', ')}`);
    if (selectedTypes.length > 0) filterInfo.push(`Types: ${selectedTypes.join(', ')}`);
    if (selectedClient) filterInfo.push(`Client: ${selectedClient}`);
    if (selectedMediaOwner.length > 0) filterInfo.push(`Media Owner: ${selectedMediaOwner.join(', ')}`); // FIXED: Changed logic for array
    if (selectedLocalities.length > 0) filterInfo.push(`Localities: ${selectedLocalities.join(', ')}`);
    if (selectedHoldBookedBy) filterInfo.push(`Hold/Booked By: ${selectedHoldBookedBy}`);
    if (selectedFromDate) filterInfo.push(`From: ${selectedFromDate}`);
    if (selectedToDate) filterInfo.push(`To: ${selectedToDate}`);
    if (selectedTotalArea) filterInfo.push(`Total Area: ${areaFilterHigher ? '≥' : '≤'} ${selectedTotalArea} sqft`);
    if (showExpiringAds) filterInfo.push('Expiring/Expired Ads Only');

    const message = filterInfo.length > 0
      ? `Exported ${dataToExport.length} records with filters: ${filterInfo.join(', ')}`
      : `Exported all ${dataToExport.length} records`;

    alert(message);
    setDownloading(false);
  };

  // Multi-select handlers
  const handleCityToggle = (city) => {
    setSelectedCities(prev =>
      prev.includes(city)
        ? prev.filter(c => c !== city)
        : [...prev, city]
    );
    resetPage();
  };

  const handleLocalityToggle = (locality) => {
    setSelectedLocalities(prev =>
      prev.includes(locality)
        ? prev.filter(l => l !== locality)
        : [...prev, locality]
    );
    resetPage();
  };

  const handleTypeToggle = (type) => {
    setSelectedTypes(prev =>
      prev.includes(type)
        ? prev.filter(t => t !== type)
        : [...prev, type]
    );
    resetPage();
  };

  const handleMediaOwnerToggle = (mediaOwner) => {
    setSelectedMediaOwner(prev =>
      prev.includes(mediaOwner)
        ? prev.filter(m => m !== mediaOwner)
        : [...prev, mediaOwner]
    );
    resetPage();
  };

  // Helper function to check if ad is expiring or expired and get days info
  const getAdExpiryInfo = (ad) => {
    if (!ad.bookedtill || ad.status !== 'Booked') return null;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const bookedTillDate = new Date(ad.bookedtill);
    bookedTillDate.setHours(0, 0, 0, 0);
    
    // Calculate days difference
    const timeDiff = bookedTillDate.getTime() - today.getTime();
    const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24)) + 1;

    if (daysDiff <= 0) {
      return { isExpiring: true, message: `⚠️ EXPIRED ${Math.abs(daysDiff)} days ago`, type: 'expired' };
    } else if (daysDiff <= 15) {
      return { isExpiring: true, message: `⏰ ${daysDiff} days left`, type: 'expiring' };
    }
    
    return null;
  };

  // Helper function to check if ad is expiring or expired (for filtering)
  const isAdExpiringOrExpired = (ad) => {
    const expiryInfo = getAdExpiryInfo(ad);
    return expiryInfo !== null;
  };

  // Updated filtering logic for multi-select and area filter
  const filteredData = data.filter(d => {
    if (selectedStatus && d.status !== selectedStatus) return false;
    if (selectedState && d.state !== selectedState) return false;
    if (selectedCities.length > 0 && !selectedCities.includes(d.city)) return false;
    if (selectedTypes.length > 0 && !selectedTypes.includes(d.type)) return false;
    if (selectedLocalities.length > 0 && !selectedLocalities.includes(d.locality)) return false;
    if (selectedHoldBookedBy && d.holdBookedBy !== selectedHoldBookedBy) return false;
    if (selectedMediaOwner.length > 0 && !selectedMediaOwner.includes(d.mediaOwner)) return false; // FIXED: Changed logic for array

    // New expiring ads filter
    if (showExpiringAds && !isAdExpiringOrExpired(d)) return false;

    if (selectedWidth && Number(d.width) !== Number(selectedWidth)) return false;
    if (selectedHeight && Number(d.height) !== Number(selectedHeight)) return false;

    // New area filter logic
    if (selectedTotalArea) {
      const adArea = Number(d.width) * Number(d.height);
      const filterArea = Number(selectedTotalArea);

      if (areaFilterHigher) {
        // Show ads with area >= selected area
        if (adArea < filterArea) return false;
      } else {
        // Show ads with area <= selected area
        if (adArea > filterArea) return false;
      }
    }

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

  const sortedData = [...filteredData].sort((a, b) => {
    if (!a.date || !b.date) return 0;
    return dateSortAsc
      ? new Date(a.date) - new Date(b.date)
      : new Date(b.date) - new Date(a.date);
  });

  const paginated = sortedData.slice((page - 1) * PER_PAGE, page * PER_PAGE);
  const totalPages = Math.ceil(sortedData.length / PER_PAGE);

  const statusOptions = Array.from(new Set(data.map(d => d.status).filter(Boolean)));
  const stateOptions = Array.from(new Set(data.map(d => d.state).filter(Boolean)));
  const cityOptions = Array.from(new Set(data.map(d => d.city).filter(Boolean)));
  const typeOptions = Array.from(new Set(data.map(d => d.type).filter(Boolean)));
  const clientOptions = Array.from(new Set(data.map(d => d.clientname || d.clientName).filter(Boolean)));
  const mediaOwnerOptions = Array.from(new Set(data.map(d => d.mediaOwner).filter(Boolean)));
  const localityOptions = Array.from(new Set(data.map(d => d.locality).filter(Boolean)));
  const holdBookedByOptions = Array.from(new Set(data.map(d => d.holdBookedBy).filter(Boolean)));

  const resetPage = () => {
    setPage(1);
    // Don't clear selections when filters change
  };

  // Check if current page selections affect select all
  useEffect(() => {
    const currentPageMediacodes = paginated.map(item => item.mediacode);
    const allCurrentPageSelected = currentPageMediacodes.length > 0 &&
      currentPageMediacodes.every(mediacode => selectedRows.has(mediacode));
    setSelectAll(allCurrentPageSelected);
  }, [paginated, selectedRows]);

  // MultiSelect Dropdown Component
  const MultiSelectDropdown = ({
    options,
    selectedValues,
    onToggle,
    placeholder,
    isOpen,
    setIsOpen
  }) => {
    return (
      <div className="relative">
        <button
          className="w-full border border-gray-300 rounded-md ps-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-left flex items-center justify-between"
          onClick={() => setIsOpen(!isOpen)}
          type="button"
        >
          <span className="truncate">
            {selectedValues.length === 0
              ? placeholder
              : selectedValues.length === 1
                ? selectedValues[0]
                : `${selectedValues.length} selected`
            }
          </span>
          <FaChevronDown className={`w-3 h-3 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        {isOpen && (
          <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
            <div className="p-2">
              {options.map(option => (
                <label
                  key={option}
                  className="flex items-center space-x-2 p-2 hover:bg-gray-100 rounded cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={selectedValues.includes(option)}
                    onChange={() => onToggle(option)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">{option}</span>
                </label>
              ))}
            </div>
            {selectedValues.length > 0 && (
              <div className="border-t border-gray-200 p-2">
                <button
                  onClick={() => {
                    selectedValues.forEach(val => onToggle(val));
                  }}
                  className="text-xs text-red-600 hover:text-red-800"
                >
                  Clear All
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.dropdown-container')) {
        setCityDropdownOpen(false);
        setLocalityDropdownOpen(false);
        setTypeDropdownOpen(false);
        setMediaOwnerDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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
                {selectedRows.size > 0 && (
                  <div className="mt-2 flex items-center gap-2">
                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-md text-sm font-medium">
                      {selectedRows.size} row(s) selected
                    </span>
                    <button
                      onClick={clearSelections}
                      className="text-xs text-red-600 hover:text-red-800 underline"
                    >
                      Clear Selection
                    </button>
                  </div>
                )}
              </div>
              <span className='flex items-center gap-2'>
                <button
                  className={`mt-4 lg:mt-0 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors duration-200 ${(selectedRows.size === 0 && filteredData.length === 0) || downloading ? "opacity-50 cursor-not-allowed" : ""}`}
                  onClick={handleExportWithCurrentFilters}
                  disabled={(selectedRows.size === 0 && filteredData.length === 0) || downloading}
                >
                  <MdDownloading />
                  {downloading ? "Exporting..." :
                    selectedRows.size > 0
                      ? `Export Selected to Excel (${selectedRows.size})`
                      : `Export Filtered to Excel (${filteredData.length})`
                  }
                </button>
                <button
                  className={`mt-4 lg:mt-0 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors duration-200 ${(selectedRows.size === 0 && filteredData.length === 0) || downloading ? "opacity-50 cursor-not-allowed" : ""}`}
                  onClick={handleExportWithCurrentFiltersInPPTandExcel}
                  disabled={(selectedRows.size === 0 && filteredData.length === 0) || downloading}
                >
                  <MdDownloading />
                  {downloading ? "Exporting..." :
                    selectedRows.size > 0
                      ? `Export Selected PPT & Excel (${selectedRows.size})`
                      : `Export Filtered PPT & Excel (${filteredData.length})`
                  }
                </button>
              </span>
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
                  value={selectedState}
                  onChange={e => { setSelectedState(e.target.value); resetPage(); }}
                >
                  <option value="">All States</option>
                  {stateOptions.map(state => (
                    <option key={state} value={state}>{state}</option>
                  ))}
                </select>

                {/* Multi-select Cities */}
                <div className="dropdown-container">
                  <MultiSelectDropdown
                    options={cityOptions}
                    selectedValues={selectedCities}
                    onToggle={handleCityToggle}
                    placeholder="All Cities"
                    isOpen={cityDropdownOpen}
                    setIsOpen={setCityDropdownOpen}
                  />
                </div>

                {/* Multi-select Localities */}
                <div className="dropdown-container">
                  <MultiSelectDropdown
                    options={localityOptions}
                    selectedValues={selectedLocalities}
                    onToggle={handleLocalityToggle}
                    placeholder="All Localities"
                    isOpen={localityDropdownOpen}
                    setIsOpen={setLocalityDropdownOpen}
                  />
                </div>

                {/* Multi-select Types */}
                <div className="dropdown-container">
                  <MultiSelectDropdown
                    options={typeOptions}
                    selectedValues={selectedTypes}
                    onToggle={handleTypeToggle}
                    placeholder="All Types"
                    isOpen={typeDropdownOpen}
                    setIsOpen={setTypeDropdownOpen}
                  />
                </div>

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

                {/* multi-select media owners */}
                <div className="dropdown-container">
                  <MultiSelectDropdown
                    options={mediaOwnerOptions}
                    selectedValues={selectedMediaOwner}
                    onToggle={handleMediaOwnerToggle}
                    placeholder="All Media Owners"
                    isOpen={mediaOwnerDropdownOpen}
                    setIsOpen={setMediaOwnerDropdownOpen}
                  />
                </div>

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
                  type="number"
                  className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={selectedWidth}
                  onChange={e => { setSelectedWidth(e.target.value); resetPage(); }}
                  title="Width"
                  placeholder='Width in ft'
                />

                <input
                  type="number"
                  className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={selectedHeight}
                  onChange={e => { setSelectedHeight(e.target.value); resetPage(); }}
                  title="Height"
                  placeholder='Height in ft'
                />

                {/* New Total Area Filter */}
                <div className="col-span-1 sm:col-span-2 md:col-span-3 lg:col-span-2 flex gap-2">
                  <input
                    type="number"
                    className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={selectedTotalArea}
                    onChange={e => { setSelectedTotalArea(e.target.value); resetPage(); }}
                    placeholder='Total Area in sqft'
                    title="Filter by total area (sqft)"
                  />
                  <div className="flex items-center bg-white border border-gray-300 rounded-md px-3 py-2">
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={areaFilterHigher}
                        onChange={e => { setAreaFilterHigher(e.target.checked); resetPage(); }}
                        className="sr-only"
                      />
                      <div className="relative">
                        <div className={`block w-14 h-8 rounded-full ${areaFilterHigher ? 'bg-blue-500' : 'bg-gray-300'}`}></div>
                        <div className={`absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition ${areaFilterHigher ? 'transform translate-x-6' : ''}`}></div>
                      </div>
                      <div className="ml-3 text-sm font-medium text-gray-700">
                        {areaFilterHigher ? '≥ Higher' : '≤ Lower'}
                      </div>
                    </label>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1 rounded-md text-sm transition-colors duration-200"
                  onClick={() => {
                    setSelectedStatus('');
                    setSelectedState('');
                    setSelectedCities([]);
                    setSelectedTypes([]);
                    setSelectedClient('');
                    setSelectedLocalities([]);
                    setSelectedHoldBookedBy('');
                    setSelectedMediaOwner([]); // FIXED: Changed from '' to []
                    setSelectedFromDate('');
                    setSelectedToDate('');
                    setSelectedWidth('');
                    setSelectedHeight('');
                    setSelectedTotalArea('');
                    setAreaFilterHigher(true);
                    setShowExpiringAds(false); // Reset expiring ads filter
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
                {/* New Expiring Ads Filter Button */}
                <button
                  className={`px-3 py-1 rounded-md text-sm flex items-center gap-1 transition-colors duration-200 ${
                    showExpiringAds 
                      ? "bg-red-500 text-white hover:bg-red-600" 
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                  onClick={() => {
                    setShowExpiringAds(prev => !prev);
                    resetPage();
                  }}
                  title="Show ads expiring within 15 days or already expired"
                >
                  {showExpiringAds ? "🔴" : "⏰"} Expiring/Expired Ads
                </button>
              </div>
            </div>

            {/* Results Info */}
            <div className="flex justify-between items-center mb-4">
              <div className="text-sm text-gray-600">
                Showing {filteredData.length} of {data.length} records
                {(selectedStatus || selectedState || selectedCities.length > 0 || selectedTypes.length > 0 || selectedClient || selectedLocalities.length > 0 || selectedHoldBookedBy || selectedMediaOwner.length > 0 || selectedFromDate || selectedToDate || selectedTotalArea || showExpiringAds) && (
                  <span className="ml-2 text-blue-600 font-medium">(filtered)</span>
                )}
                {selectedRows.size > 0 && (
                  <span className="ml-2 text-green-600 font-medium">• {selectedRows.size} selected</span>
                )}
              </div>
            </div>

            {/* Table */}
            <div className="overflow-hidden rounded-lg border border-gray-200">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left">
                        <input
                          type="checkbox"
                          checked={selectAll}
                          onChange={(e) => handleSelectAll(e.target.checked)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Client</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Code</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">City</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Owner</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price/Month</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Uploaded By</th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {paginated.length === 0 ? (
                      <tr>
                        <td colSpan={10} className="px-4 py-8 text-center text-gray-500">
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
                            <input
                              type="checkbox"
                              checked={selectedRows.has(row.mediacode)}
                              onChange={() => handleRowSelect(row.mediacode)}
                              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                          </td>
                          <td className="px-4 py-3 flex items-center space-x-2 flex-col">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                              ${row.status === "Booked"
                                ? "bg-red-100 text-red-800"
                                : row.status === "Hold"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : "bg-green-100 text-green-800"}`}>
                              {row.status}
                            </span>
                            <span className='text-gray-500 text-xs mt-1'>
                              {row.width} x {row.height} ft
                            </span>
                            <span className='text-blue-600 text-xs font-medium'>
                              {row.width * row.height} sqft
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-900">
                            <span>
                              {row.title}
                              <br />
                              {row.status === "Booked" && (
                                <span className='text-gray-500 text-xs'>
                                  Available on: {row.bookedtill}
                                  {(() => {
                                    const expiryInfo = getAdExpiryInfo(row);
                                    if (expiryInfo) {
                                      return (
                                        <span className={`ml-2 font-medium ${
                                          expiryInfo.type === 'expired' ? 'text-red-700' : 
                                          expiryInfo.type === 'today' ? 'text-red-600' : 
                                          'text-orange-600'
                                        }`}>
                                          {expiryInfo.message}
                                        </span>
                                      );
                                    }
                                    return null;
                                  })()}
                                </span>
                              )}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-900">{row.clientname || row.clientName || "-"}</td>
                          <td className="px-4 py-3 text-sm font-mono text-gray-900">{row.mediacode}</td>
                          <td className="px-4 py-3 text-sm text-gray-900">{row.city}</td>
                          <td className="px-4 py-3 text-sm text-gray-900">{row.mediaOwner}</td>
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

          {/* Selected Items Section */}
          {selectedRows.size > 0 && (
            <div className="bg-white rounded-lg shadow-sm p-6 mt-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-800">
                  Selected Items ({selectedRows.size})
                </h2>
                <button
                  onClick={clearSelections}
                  className="text-red-600 hover:text-red-800 text-sm underline"
                >
                  Clear All Selections
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {getSelectedItemsData().map((item) => (
                  <div
                    key={item.mediacode}
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow duration-150 relative"
                  >
                    <button
                      onClick={() => handleRemoveSelected(item.mediacode)}
                      className="absolute top-2 right-2 text-red-500 hover:text-red-700 transition-colors"
                      title="Remove from selection"
                    >
                      <FaTimes className="w-4 h-4" />
                    </button>

                    <div className="pr-6">
                      <div className="flex items-center justify-between mb-2">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium
                          ${item.status === "Booked"
                            ? "bg-red-100 text-red-800"
                            : item.status === "Hold"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-green-100 text-green-800"}`}>
                          {item.status}
                        </span>
                      </div>

                      <h3 className="font-medium text-gray-900 text-sm mb-2 truncate">
                        {item.title}
                      </h3>

                      <div className="space-y-1 text-xs text-gray-600">
                        <div><span className="font-medium">Code:</span> {item.mediacode}</div>
                        <div><span className="font-medium">City:</span> {item.city}</div>
                        <div><span className="font-medium">Size:</span> {item.width} x {item.height} ft ({item.width * item.height} sqft)</div>
                        <div><span className="font-medium">Price:</span> ₹{item.pricepermonth}/month</div>
                        {item.clientname || item.clientName ? (
                          <div><span className="font-medium">Client:</span> {item.clientname || item.clientName}</div>
                        ) : null}
                      </div>

                      <div className="mt-3 flex space-x-2">
                        <button
                          onClick={() => setViewAd(item)}
                          className="text-blue-600 hover:text-blue-800 transition-colors"
                          title="View Details"
                        >
                          <FaEye className="w-3 h-3" />
                        </button>
                        <Link href={`/admin/inventory/manage/${item.mediacode}`}>
                          <button
                            className="text-green-600 hover:text-green-800 transition-colors"
                            title="Edit"
                          >
                            <FaPen className="w-3 h-3" />
                          </button>
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {selectedRows.size > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={handleExportWithCurrentFilters}
                      disabled={downloading}
                      className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md text-sm flex items-center gap-2 transition-colors duration-200"
                    >
                      <MdDownloading />
                      Export Selected to Excel ({selectedRows.size})
                    </button>
                    <button
                      onClick={handleExportWithCurrentFiltersInPPTandExcel}
                      disabled={downloading}
                      className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md text-sm flex items-center gap-2 transition-colors duration-200"
                    >
                      <MdDownloading />
                      Export Selected PPT & Excel ({selectedRows.size})
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          <ExportToExcel ref={exportRef} />

          {/* Delete Confirmation Modal */}
          {confirmDelete && (
            <div
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
              onClick={() => setConfirmDelete(false)} // Close on backdrop click
            >
              <div
                className="bg-white rounded-lg p-6 max-w-md w-full"
                onClick={(e) => e.stopPropagation()} // Prevent closing when clicking modal content
              >
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
            <div
              className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
              onClick={() => setViewAd(null)} // Close on backdrop click
            >
              <div
                className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()} // Prevent closing when clicking modal content
              >
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
                      className="w-full h-full object-cover rounded-lg mb-6"
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