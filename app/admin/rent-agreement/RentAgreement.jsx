"use client"
import React, { useState, useEffect, useRef } from 'react';
import { FaPlus, FaEdit, FaTrash, FaEye, FaCalendar, FaRupeeSign, FaBuilding, FaList, FaFileExcel } from 'react-icons/fa';
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

  // Selection states for export
  const [selectedAgreements, setSelectedAgreements] = useState([]);
  const [isExporting, setIsExporting] = useState(false);

  // Form states
  const [formData, setFormData] = useState({
    adCode: '',
    title: '',
    rentType: 'Annual',
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

  const [detailFormData, setDetailFormData] = useState({
    agreementYear: '',
    installationEnd: '',
    paymentPaidYear: '',
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
      const url = editingAgreement
        ? `/api/rent-agreement/${editingAgreement._id}`
        : '/api/rent-agreement';

      const method = editingAgreement ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        fetchAgreements();
        resetForm();
        alert(editingAgreement ? 'Agreement updated successfully!' : 'Agreement created successfully!');
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
      const url = editingDetail
        ? `/api/rent-agreement/${selectedAgreement._id}/details?detailId=${editingDetail._id}`
        : `/api/rent-agreement/${selectedAgreement._id}/details`;

      const method = editingDetail ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(detailFormData)
      });

      if (response.ok) {
        const updatedAgreement = await response.json();
        setSelectedAgreement(updatedAgreement);
        fetchAgreements();
        resetDetailForm();
        alert(editingDetail ? 'Detail updated successfully!' : 'Detail added successfully!');
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
        const response = await fetch(`/api/rent-agreement/${id}`, {
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
      const exportData = selectedAgreements.length > 0
        ? agreements.filter(agreement => selectedAgreements.includes(agreement._id))
        : agreements;

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
        a.download = `Rent_Agreements_${new Date().toISOString().split('T')[0]}.xlsx`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);

        console.log('Excel file downloaded successfully!');
      } else {
        throw new Error('Failed to generate Excel file');
      }
    } catch (error) {
      console.error('Error exporting Excel:', error);
      alert('Error generating Excel file. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  // Reset forms
  const resetForm = () => {
    setFormData({
      adCode: '', title: '', rentType: 'Annual', height: '', width: '', owners: '',
      agreementFrom: '', agreementTo: '', annualRent: '', duesDate: '', duesAmount: '', expectedSales: ''
    });
    setEditingAgreement(null);
    setShowForm(false);
  };

  const resetDetailForm = () => {
    setDetailFormData({
      agreementYear: '', installationEnd: '', paymentPaidYear: '', paymentPaidAmount: '',
      paymentPaidDate: '', paymentMethod: 'Cash', checkNo: '', bank: '', accountPayeeName: '',
      dues: '', duesYear: '', remarks: ''
    });
    setEditingDetail(null);
    setShowDetailForm(false);
  };

  // Edit functions
  const handleEdit = (agreement) => {
    setFormData({
      adCode: agreement.adCode,
      title: agreement.title,
      rentType: agreement.rentType,
      height: agreement.height,
      width: agreement.width,
      owners: agreement.owners,
      agreementFrom: agreement.agreementFrom ? new Date(agreement.agreementFrom).toISOString().split('T')[0] : '',
      agreementTo: agreement.agreementTo ? new Date(agreement.agreementTo).toISOString().split('T')[0] : '',
      annualRent: agreement.annualRent,
      duesDate: agreement.duesDate ? new Date(agreement.duesDate).toISOString().split('T')[0] : '',
      duesAmount: agreement.duesAmount || '',
      expectedSales: agreement.expectedSales || ''
    });
    setEditingAgreement(agreement);
    setShowForm(true);
  };

  const handleDetailEdit = (detail) => {
    setDetailFormData({
      agreementYear: detail.agreementYear || '',
      installationEnd: detail.installationEnd || '',
      paymentPaidYear: detail.paymentPaidYear || '',
      paymentPaidAmount: detail.paymentPaidAmount || '',
      paymentPaidDate: detail.paymentPaidDate ? new Date(detail.paymentPaidDate).toISOString().split('T')[0] : '',
      paymentMethod: detail.paymentMethod || 'Cash',
      checkNo: detail.checkNo || '',
      bank: detail.bank || '',
      accountPayeeName: detail.accountPayeeName || '',
      dues: detail.dues || '',
      duesYear: detail.duesYear ? new Date(detail.duesYear).toISOString().split('T')[0] : '',
      remarks: detail.remarks || ''
    });
    setEditingDetail(detail);
    setShowDetailForm(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (status !== "authenticated" || !session?.user?.isAdmin) {
    return (
        <div className="w-full h-full flex items-center justify-center text-black text-center">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded max-w-md">
            Access Denied. Admin privileges required.
          </div>
        </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Rent Agreement Management</h1>
            <p className="text-gray-600">Manage hoarding rent agreements and payment details</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleExportExcel}
              disabled={isExporting}
              className="bg-green-500 hover:bg-green-600 disabled:bg-green-300 text-white px-6 py-3 rounded-lg flex items-center gap-2 transition-colors"
            >
              <FaFileExcel />
              {isExporting ? 'Exporting...' : selectedAgreements.length > 0 ? `Export Selected (${selectedAgreements.length})` : 'Export All'}
            </button>
            <button
              onClick={() => setShowForm(true)}
              className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg flex items-center gap-2 transition-colors"
            >
              <FaPlus /> Add Master Data
            </button>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Total Agreements</p>
              <p className="text-2xl font-bold text-gray-800">{agreements.length}</p>
            </div>
            <FaBuilding className="text-blue-500 text-2xl" />
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Total Annual Rent</p>
              <p className="text-2xl font-bold text-green-600">
                ₹{agreements.reduce((sum, a) => sum + (a.annualRent || 0), 0).toLocaleString()}
              </p>
            </div>
            <FaRupeeSign className="text-green-500 text-2xl" />
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Active Agreements</p>
              <p className="text-2xl font-bold text-blue-600">
                {agreements.filter(a => new Date(a.agreementTo) > new Date()).length}
              </p>
            </div>
            <FaCalendar className="text-blue-500 text-2xl" />
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Total Dues</p>
              <p className="text-2xl font-bold text-red-600">
                ₹{agreements.reduce((sum, a) => sum + (a.duesAmount || 0), 0).toLocaleString()}
              </p>
            </div>
            <FaRupeeSign className="text-red-500 text-2xl" />
          </div>
        </div>
      </div>

      {/* Agreements Table */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-800">All Rent Agreements</h2>
            {agreements.length > 0 && (
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 text-sm text-gray-600">
                  <input
                    type="checkbox"
                    checked={selectedAgreements.length === agreements.length}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    className="rounded border-gray-300"
                  />
                  Select All
                </label>
                {selectedAgreements.length > 0 && (
                  <span className="text-sm text-blue-600">
                    {selectedAgreements.length} selected
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Select</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ad Code</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Owner</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Size</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Annual Rent</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Agreement Period</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {agreements.map((agreement) => {
                const isActive = new Date(agreement.agreementTo) > new Date();
                return (
                  <tr key={agreement._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={selectedAgreements.includes(agreement._id)}
                        onChange={(e) => handleSelectAgreement(agreement._id, e.target.checked)}
                        className="rounded border-gray-300"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {agreement.adCode}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {agreement.title}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {agreement.owners}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {agreement.width} x {agreement.height} ft
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ₹{agreement.annualRent?.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {agreement.agreementFrom && new Date(agreement.agreementFrom).toLocaleDateString()} -
                      {agreement.agreementTo && new Date(agreement.agreementTo).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${isActive
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                        }`}>
                        {isActive ? 'Active' : 'Expired'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => {
                            setSelectedAgreement(agreement);
                            setShowDetails(true);
                          }}
                          className="text-blue-600 hover:text-blue-800"
                          title="View Details"
                        >
                          <FaEye />
                        </button>
                        <button
                          onClick={() => handleEdit(agreement)}
                          className="text-green-600 hover:text-green-800"
                          title="Edit"
                        >
                          <FaEdit />
                        </button>
                        <button
                          onClick={() => handleDelete(agreement._id)}
                          className="text-red-600 hover:text-red-800"
                          title="Delete"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {agreements.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">No rent agreements found. Create your first agreement to get started.</p>
            </div>
          )}
        </div>
      </div>

      {/* Agreement Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                {editingAgreement ? 'Edit Agreement' : 'Add New Agreement'}
              </h3>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Ad Code*</label>
                  <input
                    type="text"
                    required
                    value={formData.adCode}
                    onChange={(e) => setFormData({ ...formData, adCode: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter unique ad code"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Title*</label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter agreement title"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Rent Type*</label>
                  <select
                    required
                    value={formData.rentType}
                    onChange={(e) => setFormData({ ...formData, rentType: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Landlord">Landlord</option>
                    <option value="Government">Government</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Owner*</label>
                  <input
                    type="text"
                    required
                    value={formData.owners}
                    onChange={(e) => setFormData({ ...formData, owners: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter owner name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Height (ft)*</label>
                  <input
                    type="number"
                    required
                    value={formData.height}
                    onChange={(e) => setFormData({ ...formData, height: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter height"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Width (ft)*</label>
                  <input
                    type="number"
                    required
                    value={formData.width}
                    onChange={(e) => setFormData({ ...formData, width: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter width"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Agreement From</label>
                  <input
                    type="date"
                    value={formData.agreementFrom}
                    onChange={(e) => setFormData({ ...formData, agreementFrom: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Agreement To</label>
                  <input
                    type="date"
                    value={formData.agreementTo}
                    onChange={(e) => setFormData({ ...formData, agreementTo: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Annual Rent*</label>
                  <input
                    type="number"
                    required
                    value={formData.annualRent}
                    onChange={(e) => setFormData({ ...formData, annualRent: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter annual rent amount"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Dues Date</label>
                  <input
                    type="date"
                    value={formData.duesDate}
                    onChange={(e) => setFormData({ ...formData, duesDate: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Dues Amount</label>
                  <input
                    type="number"
                    value={formData.duesAmount}
                    onChange={(e) => setFormData({ ...formData, duesAmount: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter dues amount"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Expected Sales</label>
                  <input
                    type="number"
                    value={formData.expectedSales}
                    onChange={(e) => setFormData({ ...formData, expectedSales: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter expected sales"
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                >
                  {editingAgreement ? 'Update Agreement' : 'Create Agreement'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Details Modal */}
      {showDetails && selectedAgreement && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900">
                Agreement Details - {selectedAgreement.adCode}
              </h3>
              <button
                onClick={() => setShowDetailForm(true)}
                className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
              >
                <FaPlus /> Renew Agreement
              </button>
            </div>

            {/* Agreement Info */}
            <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-4">
                <h4 className="font-semibold text-gray-800">Basic Information</h4>
                <div>
                  <p className="text-sm text-gray-500">Title</p>
                  <p className="font-medium">{selectedAgreement.title}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Owner</p>
                  <p className="font-medium">{selectedAgreement.owners}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Size</p>
                  <p className="font-medium">{selectedAgreement.width} x {selectedAgreement.height} ft</p>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-semibold text-gray-800">Financial Details</h4>
                <div>
                  <p className="text-sm text-gray-500">Annual Rent</p>
                  <p className="font-medium">₹{selectedAgreement.annualRent?.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Dues Amount</p>
                  <p className="font-medium">₹{selectedAgreement.duesAmount?.toLocaleString() || 0}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Expected Sales</p>
                  <p className="font-medium">₹{selectedAgreement.expectedSales?.toLocaleString() || 0}</p>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-semibold text-gray-800">Agreement Period</h4>
                <div>
                  <p className="text-sm text-gray-500">From</p>
                  <p className="font-medium">
                    {selectedAgreement.agreementFrom ? new Date(selectedAgreement.agreementFrom).toLocaleDateString() : 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">To</p>
                  <p className="font-medium">
                    {selectedAgreement.agreementTo ? new Date(selectedAgreement.agreementTo).toLocaleDateString() : 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Dues Date</p>
                  <p className="font-medium">
                    {selectedAgreement.duesDate ? new Date(selectedAgreement.duesDate).toLocaleDateString() : 'N/A'}
                  </p>
                </div>
              </div>
            </div>

            {/* Payment Details */}
            <div className="p-6 border-t border-gray-200">
              <h4 className="font-semibold text-gray-800 mb-4">Payment Details History</h4>
              {selectedAgreement.moreDetails && selectedAgreement.moreDetails.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full border border-gray-200 rounded-lg">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Year</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Method</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Bank</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {selectedAgreement.moreDetails.map((detail, index) => (
                        <tr key={index}>
                          <td className="px-4 py-3 text-sm">{detail.agreementYear}</td>
                          <td className="px-4 py-3 text-sm">₹{detail.paymentPaidAmount?.toLocaleString()}</td>
                          <td className="px-4 py-3 text-sm">
                            {detail.paymentPaidDate ? new Date(detail.paymentPaidDate).toLocaleDateString() : 'N/A'}
                          </td>
                          <td className="px-4 py-3 text-sm">{detail.paymentMethod}</td>
                          <td className="px-4 py-3 text-sm">{detail.bank || 'N/A'}</td>
                          <td className="px-4 py-3 text-sm">
                            <div className="flex space-x-2">
                              <button
                                onClick={() => handleDetailEdit(detail)}
                                className="text-blue-600 hover:text-blue-800"
                              >
                                <FaEdit />
                              </button>
                              <button
                                onClick={() => handleDetailDelete(detail._id)}
                                className="text-red-600 hover:text-red-800"
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
                <p className="text-gray-500 text-center py-8">No payment details found. Add the first payment detail to get started.</p>
              )}
            </div>

            <div className="p-6 border-t border-gray-200 flex justify-end">
              <button
                onClick={() => {
                  setShowDetails(false);
                  setSelectedAgreement(null);
                }}
                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Detail Form Modal */}
      {showDetailForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                {editingDetail ? 'Edit Payment Detail' : 'Add Payment Detail'}
              </h3>
            </div>
            <form onSubmit={handleDetailSubmit} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Agreement Year*</label>
                  <input
                    type="text"
                    required
                    value={detailFormData.agreementYear}
                    onChange={(e) => setDetailFormData({ ...detailFormData, agreementYear: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter agreement year"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Payment Paid Year</label>
                  <input
                    type="text"
                    value={detailFormData.paymentPaidYear}
                    onChange={(e) => setDetailFormData({ ...detailFormData, paymentPaidYear: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter payment year"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Payment Paid Amount*</label>
                  <input
                    type="number"
                    required
                    value={detailFormData.paymentPaidAmount}
                    onChange={(e) => setDetailFormData({ ...detailFormData, paymentPaidAmount: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter payment amount"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Payment Paid Date</label>
                  <input
                    type="date"
                    value={detailFormData.paymentPaidDate}
                    onChange={(e) => setDetailFormData({ ...detailFormData, paymentPaidDate: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Payment Method*</label>
                  <select
                    required
                    value={detailFormData.paymentMethod}
                    onChange={(e) => setDetailFormData({ ...detailFormData, paymentMethod: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Cash">Cash</option>
                    <option value="Cheque">Cheque</option>
                    <option value="Bank Transfer">Bank Transfer</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Check No</label>
                  <input
                    type="text"
                    value={detailFormData.checkNo}
                    onChange={(e) => setDetailFormData({ ...detailFormData, checkNo: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter check number"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Bank</label>
                  <input
                    type="text"
                    value={detailFormData.bank}
                    onChange={(e) => setDetailFormData({ ...detailFormData, bank: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter bank name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Account Payee Name</label>
                  <input
                    type="text"
                    value={detailFormData.accountPayeeName}
                    onChange={(e) => setDetailFormData({ ...detailFormData, accountPayeeName: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter payee name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Dues</label>
                  <input
                    type="number"
                    value={detailFormData.dues}
                    onChange={(e) => setDetailFormData({ ...detailFormData, dues: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter dues amount"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Dues Year</label>
                  <input
                    type="date"
                    value={detailFormData.duesYear}
                    onChange={(e) => setDetailFormData({ ...detailFormData, duesYear: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Installation End</label>
                  <input
                    type="text"
                    value={detailFormData.installationEnd}
                    onChange={(e) => setDetailFormData({ ...detailFormData, installationEnd: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Installation end details"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Remarks</label>
                  <textarea
                    value={detailFormData.remarks}
                    onChange={(e) => setDetailFormData({ ...detailFormData, remarks: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows="3"
                    placeholder="Enter any additional remarks"
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={resetDetailForm}
                  className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                >
                  {editingDetail ? 'Update Detail' : 'Add Detail'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default RentAgreement;