import React, { useState } from 'react';
import {
  Key,
  Plus,
  Search,
  Clock,
  AlertTriangle,
  CheckCircle,
  XCircle,
  X,
  Mail,
  Calendar,
  Edit2,
  Trash2,
  Bell
} from 'lucide-react';
import { useAssetManager } from '../hooks/useAssetManager';
import MetricCard from '../components/MetricCard';

const Licenses = () => {
  const {
    licenses,
    addLicense,
    updateLicense,
    deleteLicense,
    triggerEmailAlert,
    showToast
  } = useAssetManager();

  // Search and Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All'); // All | Available | Expiring Soon | Expired

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedLicense, setSelectedLicense] = useState(null);

  // Form states
  const [formName, setFormName] = useState('');
  const [formEndDate, setFormEndDate] = useState('');
  const [formAlertDays, setFormAlertDays] = useState(30);

  // Open Add Modal
  const handleOpenAddModal = () => {
    setFormName('');
    setFormEndDate('');
    setFormAlertDays(30);
    setIsAddModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEditModal = (lic) => {
    setSelectedLicense(lic);
    setFormName(lic.name);
    
    // Parse date strings back to YYYY-MM-DD for HTML input
    const parseToInputDate = (str) => {
      if (!str) return '';
      const d = new Date(str);
      return isNaN(d.getTime()) ? '' : d.toISOString().split('T')[0];
    };
    
    setFormEndDate(parseToInputDate(lic.endDate));
    setFormAlertDays(lic.alertDaysBefore || 30);
    setIsEditModalOpen(true);
  };

  // Date Formatting Helper
  const formatDateString = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    return `${String(date.getDate()).padStart(2, '0')} ${months[date.getMonth()]} ${date.getFullYear()}`;
  };

  // Handle Add Form Submission
  const handleAddSubmit = (e) => {
    e.preventDefault();
    if (!formName || !formEndDate) {
      showToast('Software Name and Expiry Date are required!', 'error');
      return;
    }

    const end = new Date(formEndDate);
    const now = new Date();
    const remainingDays = Math.ceil((end - now) / (1000 * 60 * 60 * 24));
    let status = "Available";
    if (remainingDays <= 0) {
      status = "Expired";
    } else if (remainingDays <= formAlertDays) {
      status = "Expiring Soon";
    }

    addLicense({
      name: formName,
      endDate: formatDateString(formEndDate),
      alertDaysBefore: Number(formAlertDays),
      status: status,
      // Defaults for compatibility
      vendor: "Subscription",
      licenseKey: "N/A",
      seats: 1,
      cost: "N/A",
      startDate: formatDateString(new Date()),
      adminEmail: "rakesh.reddy@company.com",
      description: "Software license subscription."
    });

    setIsAddModalOpen(false);
  };

  // Handle Edit Form Submission
  const handleEditSubmit = (e) => {
    e.preventDefault();
    if (!formName || !formEndDate) {
      showToast('Software Name and Expiry Date are required!', 'error');
      return;
    }

    const end = new Date(formEndDate);
    const now = new Date();
    const remainingDays = Math.ceil((end - now) / (1000 * 60 * 60 * 24));
    let status = "Available";
    if (remainingDays <= 0) {
      status = "Expired";
    } else if (remainingDays <= formAlertDays) {
      status = "Expiring Soon";
    }

    updateLicense(selectedLicense.id, {
      name: formName,
      endDate: formatDateString(formEndDate),
      alertDaysBefore: Number(formAlertDays),
      status: status
    });

    setIsEditModalOpen(false);
  };

  // Calculations for License Cards
  const processedLicenses = (licenses || []).map(lic => {
    const start = lic.startDate ? new Date(lic.startDate) : new Date();
    const end = new Date(lic.endDate);
    const now = new Date();
    
    const totalDays = Math.max(1, Math.ceil((end - start) / (1000 * 60 * 60 * 24)));
    const elapsedDays = Math.ceil((now - start) / (1000 * 60 * 60 * 24));
    const remainingDays = Math.ceil((end - now) / (1000 * 60 * 60 * 24));
    
    // Percent elapsed
    const elapsedPercent = Math.max(0, Math.min(100, (elapsedDays / totalDays) * 100));
    
    // Dynamic status calculation
    let calculatedStatus = "Available";
    if (remainingDays <= 0) {
      calculatedStatus = "Expired";
    } else if (remainingDays <= (lic.alertDaysBefore || 30)) {
      calculatedStatus = "Expiring Soon";
    }

    return {
      ...lic,
      status: calculatedStatus,
      remainingDays,
      elapsedPercent
    };
  });

  // Calculate Metrics
  const totalCount = processedLicenses.length;
  const availableCount = processedLicenses.filter(l => l.status === 'Available').length;
  const expiringSoonCount = processedLicenses.filter(l => l.status === 'Expiring Soon').length;
  const expiredCount = processedLicenses.filter(l => l.status === 'Expired').length;

  // Filter list
  const filteredLicenses = processedLicenses.filter(lic => {
    const matchesSearch = lic.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || lic.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex justify-between items-center select-none">
        <div>
          <h1 className="text-2xl font-black text-[#1F2937] tracking-tight">Software Subscriptions & Licenses</h1>
          <p className="text-sm text-[#6B7280]">Track corporate software purchases, seat limits, and automated expiry alerts.</p>
        </div>
        <button
          onClick={handleOpenAddModal}
          className="flex items-center gap-2 px-4 py-2 bg-[#0B2545] hover:bg-[#134074] text-white font-semibold rounded-xl shadow-sm hover:shadow transition-all duration-200 cursor-pointer transform hover:-translate-y-0.5"
        >
          <Plus className="h-4 w-4" />
          <span>Add Subscription</span>
        </button>
      </div>

      {/* KPI Metrics Dashboard */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 select-none">
        <MetricCard icon={Key} title="Total Subscriptions" value={totalCount} color="blue" linkTo="/licenses" />
        <MetricCard icon={CheckCircle} title="Available Subscriptions" value={availableCount} color="green" linkTo="/licenses" />
        <MetricCard icon={AlertTriangle} title="Expiring Soon" value={expiringSoonCount} color="orange" linkTo="/licenses" subtext="Under notice period" />
        <MetricCard icon={XCircle} title="Expired Subscriptions" value={expiredCount} color="red" linkTo="/licenses" />
      </div>

      {/* Filters & Control Bar */}
      <div className="bg-white border border-[#E6DED8] rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row gap-4 justify-between items-center select-none">
        {/* Search */}
        <div className="relative w-full sm:w-[350px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-[#9CA3AF]" />
          <input
            type="text"
            placeholder="Search software..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-[#E6DED8] rounded-xl text-sm focus:outline-none focus:border-[#3B82F6] focus:ring-1 focus:ring-[#3B82F6] transition-colors"
          />
        </div>

        {/* Filters */}
        <div className="flex border border-[#E6DED8] rounded-xl p-0.5 bg-gray-50/50 w-full sm:w-auto justify-center">
          {['All', 'Available', 'Expiring Soon', 'Expired'].map(tab => (
            <button
              key={tab}
              onClick={() => setStatusFilter(tab)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                statusFilter === tab
                  ? 'bg-white text-[#3B82F6] shadow-sm'
                  : 'text-[#6B7280] hover:text-[#3B82F6]'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Licenses */}
      {filteredLicenses.length === 0 ? (
        <div className="bg-white border border-[#E6DED8] rounded-2xl py-12 text-center select-none shadow-sm">
          <Clock className="mx-auto h-12 w-12 text-[#9CA3AF] mb-3" />
          <h3 className="text-lg font-bold text-[#1F2937]">No software subscriptions found</h3>
          <p className="text-sm text-[#6B7280] mt-1">Try adjusting your filters or add a new software license.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredLicenses.map(lic => {
            // Status colors
            let badgeBg = "bg-emerald-50 text-emerald-800 border-emerald-200"; // Dark Green
            let progColor = "bg-emerald-600";
            if (lic.status === "Expired") {
              badgeBg = "bg-red-50 text-red-800 border-red-200"; // Red
              progColor = "bg-red-600";
            } else if (lic.status === "Expiring Soon") {
              badgeBg = "bg-yellow-50 text-yellow-800 border-yellow-200"; // Yellow
              progColor = "bg-yellow-500";
            }

            return (
              <div
                key={lic.id}
                className="bg-white border border-[#E6DED8] rounded-2xl shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between overflow-hidden"
              >
                {/* Header */}
                <div className="p-5 border-b border-[#E6DED8] space-y-2 select-none">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-black tracking-wider text-[#9CA3AF] uppercase bg-gray-100 px-2 py-0.5 rounded">
                      Subscription
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${badgeBg}`}>
                      {lic.status}
                    </span>
                  </div>
                  <h3 className="font-extrabold text-[#1F2937] text-base leading-tight">
                    {lic.name}
                  </h3>
                </div>

                {/* Specs Section */}
                <div className="p-5 space-y-4 flex-grow select-none">
                  {/* Expiry Details */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center text-xs font-bold">
                      <span className="text-[#6B7280] flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5" />
                        <span>Expires {lic.endDate}</span>
                      </span>
                      <span className={lic.status === 'Expired' ? 'text-red-600' : lic.status === 'Expiring Soon' ? 'text-amber-600' : 'text-emerald-700'}>
                        {lic.status === 'Expired' ? 'Expired' : `${lic.remainingDays} days left`}
                      </span>
                    </div>
                    {/* Progress slider bar */}
                    <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${progColor}`}
                        style={{ width: `${lic.elapsedPercent}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Notification Target config */}
                  <div className="flex items-center gap-1.5 text-[10px] font-semibold text-gray-400 bg-gray-50 p-2.5 rounded-lg border border-gray-100">
                    <Bell className="h-3.5 w-3.5 shrink-0 text-[#3B82F6] animate-pulse" />
                    <span>
                      Notifies Admin <strong className="text-[#2563EB] font-bold">{lic.alertDaysBefore} days</strong> before expiry.
                    </span>
                  </div>
                </div>

                {/* Card Actions Footer */}
                <div className="p-4 bg-gray-50 border-t border-[#E6DED8] flex justify-between items-center gap-2 select-none">
                  {/* Simulate Email Notification trigger */}
                  <button
                    onClick={() => triggerEmailAlert(lic.id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-[#E6DED8] hover:border-blue-300 hover:bg-blue-50/50 text-[#2563EB] text-xs font-semibold rounded-xl shadow-xs transition-colors cursor-pointer"
                    title={`Send test email alert to Admin`}
                  >
                    <Mail className="h-3.5 w-3.5" />
                    <span>Send Expiry Alert</span>
                  </button>

                  <div className="flex gap-1.5">
                    <button
                      onClick={() => handleOpenEditModal(lic)}
                      className="p-2 bg-white hover:bg-gray-100 border border-[#E6DED8] hover:border-gray-300 text-gray-600 hover:text-gray-800 rounded-xl shadow-xs transition-colors cursor-pointer"
                      title="Edit Subscription"
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        if (window.confirm(`Are you sure you want to delete ${lic.name}?`)) {
                          deleteLicense(lic.id);
                        }
                      }}
                      className="p-2 bg-white hover:bg-red-50 border border-[#E6DED8] hover:border-red-200 text-red-500 hover:text-red-700 rounded-xl shadow-xs transition-colors cursor-pointer"
                      title="Delete Subscription"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Subscription Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4 select-none">
          <div className="bg-white border border-[#E6DED8] rounded-2xl w-full max-w-md shadow-xl overflow-hidden animate-scale-up">
            <div className="px-6 py-4 border-b border-[#E6DED8] flex justify-between items-center bg-gray-50">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-[#EEF2F6] rounded-lg">
                  <Key className="h-5 w-5 text-[#0B2545]" />
                </div>
                <h3 className="font-extrabold text-gray-900">Add Software Subscription</h3>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="p-6 space-y-4">
              <div className="space-y-4">
                {/* Software Name */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Software Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Adobe Creative Cloud"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    className="w-full px-3.5 py-2 border border-[#E6DED8] rounded-xl text-sm focus:outline-none focus:border-[#3B82F6]"
                  />
                </div>

                {/* Expiry / End Date */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Expiry / End Date *</label>
                  <input
                    type="date"
                    required
                    value={formEndDate}
                    onChange={(e) => setFormEndDate(e.target.value)}
                    className="w-full px-3.5 py-2 border border-[#E6DED8] rounded-xl text-sm focus:outline-none focus:border-[#3B82F6]"
                  />
                </div>

                {/* Alert Warning Trigger (Notify Before) */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Notify Before *</label>
                  <select
                    value={formAlertDays}
                    onChange={(e) => setFormAlertDays(Number(e.target.value))}
                    className="w-full px-3.5 py-2 border border-[#E6DED8] rounded-xl text-sm focus:outline-none focus:border-[#3B82F6] bg-white cursor-pointer"
                  >
                    <option value={7}>7 Days before expiry</option>
                    <option value={14}>14 Days before expiry</option>
                    <option value={30}>30 Days before expiry</option>
                    <option value={60}>60 Days before expiry</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 border-t border-[#E6DED8] flex justify-end gap-3 select-none">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 border border-[#E6DED8] text-[#4B5563] font-semibold rounded-xl text-sm hover:bg-gray-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#0B2545] hover:bg-[#134074] text-white font-semibold rounded-xl text-sm transition-colors cursor-pointer"
                >
                  Add Software
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Subscription Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4 select-none">
          <div className="bg-white border border-[#E6DED8] rounded-2xl w-full max-w-md shadow-xl overflow-hidden animate-scale-up">
            <div className="px-6 py-4 border-b border-[#E6DED8] flex justify-between items-center bg-gray-50">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-[#FDF2F8] rounded-lg">
                  <Edit2 className="h-5 w-5 text-[#0B2545]" />
                </div>
                <h3 className="font-extrabold text-gray-900">Edit Software Subscription</h3>
              </div>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="p-6 space-y-4">
              <div className="space-y-4">
                {/* Software Name */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Software Name *</label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    className="w-full px-3.5 py-2 border border-[#E6DED8] rounded-xl text-sm focus:outline-none focus:border-[#3B82F6]"
                  />
                </div>

                {/* Expiry / End Date */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Expiry / End Date *</label>
                  <input
                    type="date"
                    required
                    value={formEndDate}
                    onChange={(e) => setFormEndDate(e.target.value)}
                    className="w-full px-3.5 py-2 border border-[#E6DED8] rounded-xl text-sm focus:outline-none focus:border-[#3B82F6]"
                  />
                </div>

                {/* Alert Warning Trigger (Notify Before) */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Notify Before *</label>
                  <select
                    value={formAlertDays}
                    onChange={(e) => setFormAlertDays(Number(e.target.value))}
                    className="w-full px-3.5 py-2 border border-[#E6DED8] rounded-xl text-sm focus:outline-none focus:border-[#3B82F6] bg-white cursor-pointer"
                  >
                    <option value={7}>7 Days before expiry</option>
                    <option value={14}>14 Days before expiry</option>
                    <option value={30}>30 Days before expiry</option>
                    <option value={60}>60 Days before expiry</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 border-t border-[#E6DED8] flex justify-end gap-3 select-none">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 border border-[#E6DED8] text-[#4B5563] font-semibold rounded-xl text-sm hover:bg-gray-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#0B2545] hover:bg-[#134074] text-white font-semibold rounded-xl text-sm transition-colors cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Licenses;
