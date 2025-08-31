"use client"
import React, { useState, useEffect, useRef } from 'react';
import { FaPlus, FaEdit, FaTrash, FaEye, FaCalendar, FaRupeeSign, FaBuilding, FaList, FaFileExcel, FaSearch } from 'react-icons/fa';
import { useSession } from 'next-auth/react';

const RentAgreement = () => {
  const { data: session, status } = useSession();
  const [agreements, setAgreements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingAgreement, setEditingAgreement] = useState(null);
  const [selectedAgreement, setSelectedAgreement] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [showDetailForm, setShowDetailForm] = useState(false);
  const [editingDetail, setEditingDetail] = useState(null);
  const [fetchingAdData, setFetchingAdData] = useState(false);

  // Selection states for export
  const [selectedAgreements, setSelectedAgreements] = useState([]);
  const [isExporting, setIsExporting] = useState(false);

  // Form states - Updated with new fields
  const [formData, setFormData] = useState({
    adCode: '',
    title: '',
    rentType: 'Government', // Changed from 'Annual' to 'Government'
    height: '',
    width: '',
    owners: '',
    agreementFrom: '',
    agreementTo: '',
    annualRent: '',
    duesDate: '',
    duesAmount: '',
    expectedSales: ''
  });

  // Updated detail form with new date range fields
  const [detailFormData, setDetailFormData] = useState({
    agreementYearFrom: '',
    agreementYearTo: '',
    installationEnd: '',
    paymentPaidYearFrom: '',
    paymentPaidYearTo: '',
    paymentPaidAmount: '',
    paymentPaidDate: '',
    paymentMethod: 'Cash',
    checkNo: '',
    bank: '',
    accountPayeeName: '',
    dues: '',
    duesYear: '',
    remarks: ''
  });

  // Auto-fetch ad data when adCode changes
  const fetchAdData = async (mediaCode) => {
    if (!mediaCode.trim()) return;
    
    setFetchingAdData(true);
    try {
      const response = await fetch(`/api/ads/update?mediacode=${encodeURIComponent(mediaCode)}`);
      if (response.ok) {
        const adData = await response.json();
        setFormData(prev => ({
          ...prev,
          title: adData.title || '',
          height: adData.height || '',
          width: adData.width || ''
        }));
      } else {
        // Clear the auto-filled fields if ad not found
        setFormData(prev => ({
          ...prev,
          title: '',
          height: '',
          width: ''
        }));
      }
    } catch (error) {
      console.error('Error fetching ad data:', error);
      setFormData(prev => ({
        ...prev,
        title: '',
        height: '',
        width: ''
      }));
    } finally {
      setFetchingAdData(false);
    }
  };

  // Handle form input changes with auto-fetch for adCode
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Auto-fetch ad data when adCode changes
    if (name === 'adCode') {
      // Debounce the API call
      clearTimeout(handleFormChange.timeout);
      handleFormChange.timeout = setTimeout(() => {
        fetchAdData(value);
      }, 500);
    }
  };

  // Handle detail form input changes
  const handleDetailFormChange = (e) => {
    const { name, value } = e.target;
    setDetailFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Fetch agreements
  const fetchAgreements = async () => {
    try {
      const response = await fetch('/api/rent-agreement');
      if (response.ok) {
        const data = await response.json();
        setAgreements(data);
      }
    } catch (error) {
      console.error('Error fetching agreements:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAgreements();
  }, []);

  // Handle form submission for agreement
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const url = editingAgreement ? '/api/rent-agreement' : '/api/rent-agreement';
      const method = editingAgreement ? 'PUT' : 'POST';
      
      const submitData = editingAgreement 
        ? { ...formData, _id: editingAgreement._id }
        : formData;

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submitData)
      });

      if (response.ok) {
        fetchAgreements();
        resetForm();
        alert(editingAgreement ? 'Agreement updated successfully!' : 'Agreement created successfully!');
      } else {
        const errorData = await response.json();
        alert(`Error: ${errorData.error || 'Failed to save agreement'}`);
      }
    } catch (error) {
      console.error('Error saving agreement:', error);
      alert('Failed to save agreement');
    }
  };

  // Handle detail form submission
  const handleDetailSubmit = async (e) => {
    e.preventDefault();
    try {
      const url = `/api/rent-agreement/${selectedAgreement._id}/details`;
      const method = editingDetail ? 'PUT' : 'POST';
      
      const submitData = editingDetail 
        ? { ...detailFormData, detailId: editingDetail._id }
        : detailFormData;

      console.log('Submitting detail data:', submitData); // Debug log

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submitData)
      });

      if (response.ok) {
        const updatedAgreement = await response.json();
        setSelectedAgreement(updatedAgreement);
        fetchAgreements();
        resetDetailForm();
        alert(editingDetail ? 'Detail updated successfully!' : 'Detail added successfully!');
      } else {
        const errorData = await response.json();
        console.error('Error response:', errorData); // Debug log
        alert(`Error: ${errorData.error || 'Failed to save detail'}`);
      }
    } catch (error) {
      console.error('Error saving detail:', error);
      alert('Failed to save detail');
    }
  };

  // Delete agreement
  const handleDelete = async (id) => {
    if (confirm('Are you sure you want to delete this agreement?')) {
      try {
        const response = await fetch(`/api/rent-agreement?id=${id}`, {
          method: 'DELETE'
        });

        if (response.ok) {
          fetchAgreements();
          alert('Agreement deleted successfully!');
        }
      } catch (error) {
        console.error('Error deleting agreement:', error);
        alert('Failed to delete agreement');
      }
    }
  };

  // Delete detail
  const handleDetailDelete = async (detailId) => {
    if (confirm('Are you sure you want to delete this detail?')) {
      try {
        const response = await fetch(
          `/api/rent-agreement/${selectedAgreement._id}/details?detailId=${detailId}`,
          { method: 'DELETE' }
        );

        if (response.ok) {
          const updatedAgreement = await response.json();
          setSelectedAgreement(updatedAgreement);
          fetchAgreements();
          alert('Detail deleted successfully!');
        }
      } catch (error) {
        console.error('Error deleting detail:', error);
        alert('Failed to delete detail');
      }
    }
  };

  // Selection handlers
  const handleSelectAll = (checked) => {
    if (checked) {
      setSelectedAgreements(agreements.map(agreement => agreement._id));
    } else {
      setSelectedAgreements([]);
    }
  };

  const handleSelectAgreement = (agreementId, checked) => {
    if (checked) {
      setSelectedAgreements(prev => [...prev, agreementId]);
    } else {
      setSelectedAgreements(prev => prev.filter(id => id !== agreementId));
    }
  };

  // Export to Excel
  const handleExportExcel = async () => {
    setIsExporting(true);
    try {
      // Determine which agreements to export
      const exportData = selectedAgreements.length > 0
        ? agreements.filter(agreement => selectedAgreements.includes(agreement._id))
        : agreements;

      if (exportData.length === 0) {
        alert('No agreements selected for export');
        setIsExporting(false);
        return;
      }

      console.log(`Exporting ${exportData.length} agreements...`);

      const response = await fetch('/api/rent-agreement/export-excel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ agreements: exportData })
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = `rent_agreements_${new Date().toISOString().split('T')[0]}.xlsx`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        
        alert(`Excel file downloaded successfully! (${exportData.length} agreements exported)`);
      } else {
        const errorData = await response.json();
        console.error('Export error:', errorData);
        alert(`Error: ${errorData.error || 'Failed to export Excel file'}`);
      }
    } catch (error) {
      console.error('Error exporting to Excel:', error);
      alert('Failed to export Excel file');
    } finally {
      setIsExporting(false);
    }
  };

  // Reset forms
  const resetForm = () => {
    setFormData({
      adCode: '',
      title: '',
      rentType: 'Government', // Changed from 'Annual' to 'Government'
      height: '',
      width: '',
      owners: '',
      agreementFrom: '',
      agreementTo: '',
      annualRent: '',
      duesDate: '',
      duesAmount: '',
      expectedSales: ''
    });
    setShowForm(false);
    setEditingAgreement(null);
  };

  const resetDetailForm = () => {
    setDetailFormData({
      agreementYearFrom: '',
      agreementYearTo: '',
      installationEnd: '',
      paymentPaidYearFrom: '',
      paymentPaidYearTo: '',
      paymentPaidAmount: '',
      paymentPaidDate: '',
      paymentMethod: 'Cash',
      checkNo: '',
      bank: '',
      accountPayeeName: '',
      dues: '',
      duesYear: '',
      remarks: ''
    });
    setShowDetailForm(false);
    setEditingDetail(null);
  };

  // Edit functions
  const handleEdit = (agreement) => {
    setFormData({
      adCode: agreement.adCode || '',
      title: agreement.title || '',
      rentType: agreement.rentType || 'Annual',
      height: agreement.height || '',
      width: agreement.width || '',
      owners: agreement.owners || '',
      agreementFrom: agreement.agreementFrom ? agreement.agreementFrom.split('T')[0] : '',
      agreementTo: agreement.agreementTo ? agreement.agreementTo.split('T')[0] : '',
      annualRent: agreement.annualRent || '',
      duesDate: agreement.duesDate ? agreement.duesDate.split('T')[0] : '',
      duesAmount: agreement.duesAmount || '',
      expectedSales: agreement.expectedSales || ''
    });
    setEditingAgreement(agreement);
    setShowForm(true);
  };

  const handleDetailEdit = (detail) => {
    setDetailFormData({
      agreementYearFrom: detail.agreementYearFrom ? detail.agreementYearFrom.split('T')[0] : '',
      agreementYearTo: detail.agreementYearTo ? detail.agreementYearTo.split('T')[0] : '',
      installationEnd: detail.installationEnd || '',
      paymentPaidYearFrom: detail.paymentPaidYearFrom ? detail.paymentPaidYearFrom.split('T')[0] : '',
      paymentPaidYearTo: detail.paymentPaidYearTo ? detail.paymentPaidYearTo.split('T')[0] : '',
      paymentPaidAmount: detail.paymentPaidAmount || '',
      paymentPaidDate: detail.paymentPaidDate ? detail.paymentPaidDate.split('T')[0] : '',
      paymentMethod: detail.paymentMethod || 'Cash',
      checkNo: detail.checkNo || '',
      bank: detail.bank || '',
      accountPayeeName: detail.accountPayeeName || '',
      dues: detail.dues || '',
      duesYear: detail.duesYear ? detail.duesYear.split('T')[0] : '',
      remarks: detail.remarks || ''
    });
    setEditingDetail(detail);
    setShowDetailForm(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  if (status !== "authenticated" || !session?.user?.isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-red-600">Access denied. Admin only.</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
              <FaBuilding className="text-red-500" />
              Rent Agreement Management
            </h1>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setShowForm(true)}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
              >
                <FaPlus /> Add Agreement
              </button>
              <button
                onClick={handleExportExcel}
                disabled={isExporting}
                className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors disabled:opacity-50"
              >
                <FaFileExcel /> {isExporting ? 'Exporting...' : 'Export Excel'}
              </button>
            </div>
          </div>

          {/* Export Selection */}
          {agreements.length > 0 && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={selectedAgreements.length === agreements.length}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    className="rounded"
                  />
                  <span className="text-sm font-medium">
                    Select All ({selectedAgreements.length} selected)
                  </span>
                </label>
                {selectedAgreements.length > 0 && (
                  <span className="text-sm text-gray-600">
                    {selectedAgreements.length} of {agreements.length} agreements selected for export
                  </span>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Agreement Form Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={(e) => e.target === e.currentTarget && resetForm()}
          >
            <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <h2 className="text-2xl font-bold mb-4">
                {editingAgreement ? 'Edit Agreement' : 'Add New Agreement'}
              </h2>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Ad Code with auto-fetch */}
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Media Code <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        name="adCode"
                        value={formData.adCode}
                        onChange={handleFormChange}
                        className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-red-500"
                        placeholder="Enter media code"
                        required
                      />
                      {fetchingAdData && (
                        <div className="absolute right-2 top-2">
                          <FaSearch className="animate-spin text-gray-400" />
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Auto-fills title, height, and width from ad database
                    </p>
                  </div>

                  {/* Title (auto-filled) */}
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Title <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleFormChange}
                      className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-red-500"
                      placeholder="Title (auto-filled from ad data)"
                      required
                    />
                  </div>

                  {/* Height (auto-filled) */}
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Height (ft) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      name="height"
                      value={formData.height}
                      onChange={handleFormChange}
                      className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-red-500"
                      placeholder="Height (auto-filled)"
                      required
                    />
                  </div>

                  {/* Width (auto-filled) */}
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Width (ft) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      name="width"
                      value={formData.width}
                      onChange={handleFormChange}
                      className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-red-500"
                      placeholder="Width (auto-filled)"
                      required
                    />
                  </div>

                  {/* Rent Type */}
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Rent Type <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="rentType"
                      value={formData.rentType}
                      onChange={handleFormChange}
                      className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-red-500"
                      required
                    >
                      <option value="Government">Government</option>
                      <option value="LandLord">LandLord</option>
                    </select>
                  </div>

                  {/* Owners */}
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Owners <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="owners"
                      value={formData.owners}
                      onChange={handleFormChange}
                      className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-red-500"
                      placeholder="Owner names"
                      required
                    />
                  </div>

                  {/* Agreement From */}
                  <div>
                    <label className="block text-sm font-medium mb-1">Agreement From</label>
                    <input
                      type="date"
                      name="agreementFrom"
                      value={formData.agreementFrom}
                      onChange={handleFormChange}
                      className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-red-500"
                    />
                  </div>

                  {/* Agreement To */}
                  <div>
                    <label className="block text-sm font-medium mb-1">Agreement To</label>
                    <input
                      type="date"
                      name="agreementTo"
                      value={formData.agreementTo}
                      onChange={handleFormChange}
                      className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-red-500"
                    />
                  </div>

                  {/* Annual Rent */}
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Annual Rent <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      name="annualRent"
                      value={formData.annualRent}
                      onChange={handleFormChange}
                      className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-red-500"
                      placeholder="Annual rent amount"
                      required
                    />
                  </div>

                  {/* Dues Date */}
                  <div>
                    <label className="block text-sm font-medium mb-1">Dues Date</label>
                    <input
                      type="date"
                      name="duesDate"
                      value={formData.duesDate}
                      onChange={handleFormChange}
                      className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-red-500"
                    />
                  </div>

                  {/* Dues Amount */}
                  <div>
                    <label className="block text-sm font-medium mb-1">Dues Amount</label>
                    <input
                      type="number"
                      name="duesAmount"
                      value={formData.duesAmount}
                      onChange={handleFormChange}
                      className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-red-500"
                      placeholder="Dues amount"
                    />
                  </div>

                  {/* Expected Sales */}
                  <div>
                    <label className="block text-sm font-medium mb-1">Expected Sales</label>
                    <input
                      type="number"
                      name="expectedSales"
                      value={formData.expectedSales}
                      onChange={handleFormChange}
                      className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-red-500"
                      placeholder="Expected sales amount"
                    />
                  </div>
                </div>

                {/* Buttons */}
                <div className="flex gap-2 pt-4">
                  <button
                    type="submit"
                    className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-lg transition-colors"
                  >
                    {editingAgreement ? 'Update' : 'Create'} Agreement
                  </button>
                  <button
                    type="button"
                    onClick={resetForm}
                    className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Detail Form Modal */}
        {showDetailForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={(e) => e.target === e.currentTarget && resetDetailForm()}
          >
            <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <h2 className="text-2xl font-bold mb-4">
                {editingDetail ? 'Edit Payment Detail' : 'Add Payment Detail'}
              </h2>
              
              <form onSubmit={handleDetailSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Agreement Year From */}
                  <div>
                    <label className="block text-sm font-medium mb-1">Agreement Year From</label>
                    <input
                      type="date"
                      name="agreementYearFrom"
                      value={detailFormData.agreementYearFrom}
                      onChange={handleDetailFormChange}
                      className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-red-500"
                    />
                  </div>

                  {/* Agreement Year To */}
                  <div>
                    <label className="block text-sm font-medium mb-1">Agreement Year To</label>
                    <input
                      type="date"
                      name="agreementYearTo"
                      value={detailFormData.agreementYearTo}
                      onChange={handleDetailFormChange}
                      className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-red-500"
                    />
                  </div>

                  {/* Payment Paid Year From */}
                  <div>
                    <label className="block text-sm font-medium mb-1">Payment Paid Year From</label>
                    <input
                      type="date"
                      name="paymentPaidYearFrom"
                      value={detailFormData.paymentPaidYearFrom}
                      onChange={handleDetailFormChange}
                      className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-red-500"
                    />
                  </div>

                  {/* Payment Paid Year To */}
                  <div>
                    <label className="block text-sm font-medium mb-1">Payment Paid Year To</label>
                    <input
                      type="date"
                      name="paymentPaidYearTo"
                      value={detailFormData.paymentPaidYearTo}
                      onChange={handleDetailFormChange}
                      className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-red-500"
                    />
                  </div>

                   {/* Installation End */}
                  <div>
                    <label className="block text-sm font-medium mb-1">Installation Expense</label>
                    <input
                      type="text"
                      name="installationEnd"
                      value={detailFormData.installationEnd}
                      onChange={handleDetailFormChange}
                      className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-red-500"
                      placeholder="Installation end details"
                    />
                  </div>

                  {/* Payment Paid Amount */}
                  <div>
                    <label className="block text-sm font-medium mb-1">Payment Paid Amount</label>
                    <input
                      type="number"
                      name="paymentPaidAmount"
                      value={detailFormData.paymentPaidAmount}
                      onChange={handleDetailFormChange}
                      className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-red-500"
                      placeholder="Amount paid"
                    />
                  </div>

                  {/* Payment Paid Date */}
                  <div>
                    <label className="block text-sm font-medium mb-1">Payment Paid Date</label>
                    <input
                      type="date"
                      name="paymentPaidDate"
                      value={detailFormData.paymentPaidDate}
                      onChange={handleDetailFormChange}
                      className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-red-500"
                    />
                  </div>

                  {/* Payment Method */}
                  <div>
                    <label className="block text-sm font-medium mb-1">Payment Method</label>
                    <select
                      name="paymentMethod"
                      value={detailFormData.paymentMethod}
                      onChange={handleDetailFormChange}
                      className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-red-500"
                    >
                      <option value="Cash">Cash</option>
                      <option value="Cheque">Cheque</option>
                      <option value="DD">DD</option>
                      <option value="Bank Transfer">Bank Transfer</option>
                    </select>
                  </div>

                  {/* Check Number */}
                  <div>
                    <label className="block text-sm font-medium mb-1">Check/DD Number</label>
                    <input
                      type="text"
                      name="checkNo"
                      value={detailFormData.checkNo}
                      onChange={handleDetailFormChange}
                      className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-red-500"
                      placeholder="Check or DD number"
                    />
                  </div>

                  {/* Bank */}
                  <div>
                    <label className="block text-sm font-medium mb-1">Bank</label>
                    <input
                      type="text"
                      name="bank"
                      value={detailFormData.bank}
                      onChange={handleDetailFormChange}
                      className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-red-500"
                      placeholder="Bank name"
                    />
                  </div>

                  {/* Account Payee Name */}
                  <div>
                    <label className="block text-sm font-medium mb-1">Account Payee Name</label>
                    <input
                      type="text"
                      name="accountPayeeName"
                      value={detailFormData.accountPayeeName}
                      onChange={handleDetailFormChange}
                      className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-red-500"
                      placeholder="Account payee name"
                    />
                  </div>

                  {/* Dues */}
                  <div>
                    <label className="block text-sm font-medium mb-1">Dues</label>
                    <input
                      type="number"
                      name="dues"
                      value={detailFormData.dues}
                      onChange={handleDetailFormChange}
                      className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-red-500"
                      placeholder="Dues amount"
                    />
                  </div>

                  {/* Dues Year */}
                  <div>
                    <label className="block text-sm font-medium mb-1">Dues Year</label>
                    <input
                      type="date"
                      name="duesYear"
                      value={detailFormData.duesYear}
                      onChange={handleDetailFormChange}
                      className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-red-500"
                    />
                  </div>
                </div>

                {/* Remarks */}
                <div>
                  <label className="block text-sm font-medium mb-1">Remarks</label>
                  <textarea
                    name="remarks"
                    value={detailFormData.remarks}
                    onChange={handleDetailFormChange}
                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-red-500"
                    rows="3"
                    placeholder="Additional remarks"
                  />
                </div>

                {/* Buttons */}
                <div className="flex gap-2 pt-4">
                  <button
                    type="submit"
                    className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-lg transition-colors"
                  >
                    {editingDetail ? 'Update' : 'Add'} Detail
                  </button>
                  <button
                    type="button"
                    onClick={resetDetailForm}
                    className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Statistics Cards */}
        {agreements.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
            {/* Total Agreements */}
            <div className="bg-white rounded-lg shadow-md py-6 px-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Agreements</p>
                  <p className="text-3xl font-bold text-gray-900">{agreements.length}</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-full">
                  <FaBuilding className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </div>

            {/* Total Annual Rent */}
            <div className="bg-white rounded-lg shadow-md py-6 px-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Annual Rent</p>
                  <p className="text-3xl font-bold text-green-600">
                    ₹{agreements.reduce((total, agreement) => total + (agreement.annualRent || 0), 0).toLocaleString()}
                  </p>
                </div>
                <div className="p-3 bg-green-100 rounded-full">
                  <FaRupeeSign className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </div>

            {/* Active Agreements */}
            <div className="bg-white rounded-lg shadow-md py-6 px-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Agreements</p>
                  <p className="text-3xl font-bold text-blue-600">
                    {agreements.filter(agreement => {
                      if (!agreement.agreementTo) return true;
                      const endDate = new Date(agreement.agreementTo);
                      const today = new Date();
                      return endDate >= today;
                    }).length}
                  </p>
                </div>
                <div className="p-3 bg-blue-100 rounded-full">
                  <FaCalendar className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </div>

            {/* Total Dues */}
            <div className="bg-white rounded-lg shadow-md py-6 px-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Dues</p>
                  <p className="text-3xl font-bold text-red-600">
                    ₹{agreements.reduce((total, agreement) => total + (agreement.duesAmount || 0), 0).toLocaleString()}
                  </p>
                </div>
                <div className="p-3 bg-red-100 rounded-full">
                  <FaRupeeSign className="w-6 h-6 text-red-600" />
                </div>
              </div>
            </div>

            {/* Expiring Soon */}
            <div className="bg-white rounded-lg shadow-md py-6 px-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Expire in 15 Days</p>
                  <p className="text-3xl font-bold text-orange-600">
                    {agreements.filter(agreement => {
                      if (!agreement.agreementTo) return false;
                      const endDate = new Date(agreement.agreementTo);
                      const today = new Date();
                      const fifteenDaysFromNow = new Date(today.getTime() + (15 * 24 * 60 * 60 * 1000));
                      return endDate >= today && endDate <= fifteenDaysFromNow;
                    }).length}
                  </p>
                </div>
                <div className="p-3 bg-orange-100 rounded-full">
                  <FaCalendar className="w-6 h-6 text-orange-600" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Expiring Agreements Alert */}
        {agreements.length > 0 && (() => {
          const expiringAgreements = agreements.filter(agreement => {
            if (!agreement.agreementTo) return false;
            const endDate = new Date(agreement.agreementTo);
            const today = new Date();
            const fifteenDaysFromNow = new Date(today.getTime() + (15 * 24 * 60 * 60 * 1000));
            return endDate >= today && endDate <= fifteenDaysFromNow;
          });

          if (expiringAgreements.length > 0) {
            return (
              <div className="bg-orange-50 border-l-4 border-orange-400 p-4 mb-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <FaCalendar className="h-5 w-5 text-orange-400" />
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-orange-800">
                      Agreements Expiring Soon
                    </h3>
                    <div className="mt-2 text-sm text-orange-700">
                      <p>The following agreements will expire within the next 15 days:</p>
                      <ul className="mt-1 list-disc list-inside">
                        {expiringAgreements.map(agreement => {
                          const endDate = new Date(agreement.agreementTo);
                          const today = new Date();
                          const daysLeft = Math.ceil((endDate - today) / (1000 * 60 * 60 * 24));
                          return (
                            <li key={agreement._id}>
                              <strong>{agreement.adCode}</strong> - {agreement.title} 
                              <span className="text-orange-600 font-medium">
                                ({daysLeft === 0 ? 'Expires today' : `${daysLeft} days left`})
                              </span>
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            );
          }
          return null;
        })()}

        {/* Agreements List */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-6 border-b">
            <h2 className="text-xl font-semibold">Rent Agreements ({agreements.length})</h2>
          </div>
          
          {agreements.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <FaBuilding className="mx-auto text-6xl mb-4 text-gray-300" />
              <p className="text-xl mb-2">No rent agreements found</p>
              <p>Create your first rent agreement to get started.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="p-3 text-left">
                      <input
                        type="checkbox"
                        checked={selectedAgreements.length === agreements.length}
                        onChange={(e) => handleSelectAll(e.target.checked)}
                        className="rounded"
                      />
                    </th>
                    <th className="p-3 text-left">Media Code</th>
                    <th className="p-3 text-left">Title</th>
                    <th className="p-3 text-left">Size (ft)</th>
                    <th className="p-3 text-left">Type</th>
                    <th className="p-3 text-left">Annual Rent</th>
                    <th className="p-3 text-left">Agreement Period</th>
                    <th className="p-3 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {agreements.map((agreement) => (
                    <tr key={agreement._id} className="border-b hover:bg-gray-50">
                      <td className="p-3">
                        <input
                          type="checkbox"
                          checked={selectedAgreements.includes(agreement._id)}
                          onChange={(e) => handleSelectAgreement(agreement._id, e.target.checked)}
                          className="rounded"
                        />
                      </td>
                      <td className="p-3 font-medium">{agreement.adCode}</td>
                      <td className="p-3">{agreement.title}</td>
                      <td className="p-3">{agreement.width} x {agreement.height}</td>
                      <td className="p-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          agreement.rentType === 'Government' 
                            ? 'bg-blue-100 text-blue-800' 
                            : 'bg-green-100 text-green-800'
                        }`}>
                          {agreement.rentType}
                        </span>
                      </td>
                      <td className="p-3">₹{agreement.annualRent?.toLocaleString()}</td>
                      <td className="p-3">
                        {agreement.agreementFrom && agreement.agreementTo ? (
                          <>
                            {new Date(agreement.agreementFrom).toLocaleDateString()} - {new Date(agreement.agreementTo).toLocaleDateString()}
                          </>
                        ) : 'Not set'}
                      </td>
                      <td className="p-3">
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              setSelectedAgreement(agreement);
                              setShowDetails(true);
                            }}
                            className="text-blue-600 hover:text-blue-800 p-1"
                            title="View Details"
                          >
                            <FaEye />
                          </button>
                          <button
                            onClick={() => handleEdit(agreement)}
                            className="text-yellow-600 hover:text-yellow-800 p-1"
                            title="Edit"
                          >
                            <FaEdit />
                          </button>
                          <button
                            onClick={() => handleDelete(agreement._id)}
                            className="text-red-600 hover:text-red-800 p-1"
                            title="Delete"
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Details View Modal */}
        {showDetails && selectedAgreement && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={(e) => e.target === e.currentTarget && setShowDetails(false)}
          >
            <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold">Agreement Details - {selectedAgreement.adCode}</h2>
                <button
                  onClick={() => setShowDetails(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>

              {/* Agreement Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
                <div><strong>Title:</strong> {selectedAgreement.title}</div>
                <div><strong>Size:</strong> {selectedAgreement.width} x {selectedAgreement.height} ft</div>
                <div><strong>Type:</strong> {selectedAgreement.rentType}</div>
                <div><strong>Owners:</strong> {selectedAgreement.owners}</div>
                <div><strong>Annual Rent:</strong> ₹{selectedAgreement.annualRent?.toLocaleString()}</div>
                <div><strong>Expected Sales:</strong> ₹{selectedAgreement.expectedSales?.toLocaleString()}</div>
              </div>

              {/* Payment Details Section */}
              <div className="mb-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-semibold">Payment Details</h3>
                  <button
                    onClick={() => {setShowDetailForm(true); setShowDetails(false)}}
                    className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
                  >
                    <FaPlus /> Add Payment Detail
                  </button>
                </div>

                {selectedAgreement.moreDetails && selectedAgreement.moreDetails.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full border">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="p-2 border text-left">Agreement Period</th>
                          <th className="p-2 border text-left">Payment Period</th>
                          <th className="p-2 border text-left">Amount</th>
                          <th className="p-2 border text-left">Method</th>
                          <th className="p-2 border text-left">Date</th>
                          <th className="p-2 border text-left">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedAgreement.moreDetails.map((detail) => (
                          <tr key={detail._id} className="border-b">
                            <td className="p-2 border">
                              {detail.agreementYearFrom && detail.agreementYearTo ? (
                                <>
                                  {new Date(detail.agreementYearFrom).toLocaleDateString()} - {new Date(detail.agreementYearTo).toLocaleDateString()}
                                </>
                              ) : detail.agreementYear || 'Not set'}
                            </td>
                            <td className="p-2 border">
                              {detail.paymentPaidYearFrom && detail.paymentPaidYearTo ? (
                                <>
                                  {new Date(detail.paymentPaidYearFrom).toLocaleDateString()} - {new Date(detail.paymentPaidYearTo).toLocaleDateString()}
                                </>
                              ) : detail.paymentPaidYear || 'Not set'}
                            </td>
                            <td className="p-2 border">₹{detail.paymentPaidAmount?.toLocaleString()}</td>
                            <td className="p-2 border">{detail.paymentMethod}</td>
                            <td className="p-2 border">
                              {detail.paymentPaidDate ? new Date(detail.paymentPaidDate).toLocaleDateString() : 'Not set'}
                            </td>
                            <td className="p-2 border">
                              <div className="flex gap-2">
                                <button
                                  onClick={() => {handleDetailEdit(detail); setShowDetails(false)}}
                                  className="text-yellow-600 hover:text-yellow-800 p-1"
                                  title="Edit"
                                >
                                  <FaEdit />
                                </button>
                                <button
                                  onClick={() => handleDetailDelete(detail._id)}
                                  className="text-red-600 hover:text-red-800 p-1"
                                  title="Delete"
                                >
                                  <FaTrash />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <FaList className="mx-auto text-4xl mb-2" />
                    <p>No payment details added yet.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RentAgreement;