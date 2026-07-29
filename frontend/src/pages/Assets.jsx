import React, { useState, useRef, useEffect } from 'react';
import { 
  Laptop, 
  CheckCircle, 
  AlertTriangle, 
  Wrench, 
  Trash2, 
  Plus, 
  Search, 
  Eye, 
  Pencil, 
  Trash, 
  ChevronLeft, 
  ChevronRight,
  ChevronDown,
  Check,
  Download,
  Upload,
  FileSpreadsheet,
  X,
  TrendingUp,
  Calendar
} from 'lucide-react';
import { useAssetManager } from '../hooks/useAssetManager';
import MetricCard from '../components/MetricCard';
import Avatar from '../components/Avatar';
import ExcelImportModal from '../components/ExcelImportModal';
import AssetIconBadge from '../components/AssetIcon';
import AdminPasswordModal from '../components/AdminPasswordModal';

const Assets = () => {
  const { 
    assets, 
    employees, 
    categories,
    addAsset, 
    updateAsset, 
    deleteAsset,
    showToast
  } = useAssetManager();

  const [passAuthModal, setPassAuthModal] = useState({ isOpen: false, title: '', actionLabel: '', onSuccess: null });

  // Search & Filtering states
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');
  const [scopeFilter, setScopeFilter] = useState('All');
  const [filterStartDate, setFilterStartDate] = useState('');
  const [filterEndDate, setFilterEndDate] = useState('');
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [showScopeGlass, setShowScopeGlass] = useState(false);
  const [isTypeDropdownOpen, setIsTypeDropdownOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const typeDropdownRef = useRef(null);
  const scopeRef = useRef(null);
  const formDropdownRef = useRef(null);

  // Outside click for dropdowns
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (scopeRef.current && !scopeRef.current.contains(e.target)) {
        setShowScopeGlass(false);
      }
      if (typeDropdownRef.current && !typeDropdownRef.current.contains(e.target)) {
        setIsTypeDropdownOpen(false);
      }
      if (formDropdownRef.current && !formDropdownRef.current.contains(e.target)) {
        setActiveDropdown(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Multi-select state
  const [selectedIds, setSelectedIds] = useState([]);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [isBulkDeleteOpen, setIsBulkDeleteOpen] = useState(false);

  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const categoryTypes = categories && categories.length > 0
    ? categories
    : [
        { name: 'Laptop', group: 'IT' },
        { name: 'Monitor', group: 'IT' },
        { name: 'Mouse', group: 'IT' },
        { name: 'Keyboard', group: 'IT' },
        { name: 'Headphones', group: 'IT' },
        { name: 'Printer', group: 'IT' },
        { name: 'Chairs', group: 'Non-IT' },
        { name: 'Tables', group: 'Non-IT' },
        { name: 'Whiteboards', group: 'Non-IT' },
        { name: 'Storage Cabinets', group: 'Non-IT' }
      ];

  const itCategoryList = categoryTypes.filter(c => (c.group || 'IT') === 'IT');
  const nonItCategoryList = categoryTypes.filter(c => c.group === 'Non-IT');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState(null);

  // Form states
  const [formId, setFormId] = useState('');
  const [formType, setFormType] = useState('Laptop');
  const [customType, setCustomType] = useState('');
  const [formBrand, setFormBrand] = useState('Dell');
  const [customBrand, setCustomBrand] = useState('');
  const [formModel, setFormModel] = useState('');
  const [formSerial, setFormSerial] = useState('');
  const [formStatus, setFormStatus] = useState('Available');
  const [formAssigned, setFormAssigned] = useState('');
  const [formOwnership, setFormOwnership] = useState('Quadrant IT Services');
  const [formGroup, setFormGroup] = useState('IT');
  const [formChargerSerial, setFormChargerSerial] = useState('');
  const [formCondition, setFormCondition] = useState('Good');
  const [formPurchaseDate, setFormPurchaseDate] = useState('');
  const [formAssignedDate, setFormAssignedDate] = useState('');

  const formatDateToShort = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const day = String(date.getDate()).padStart(2, '0');
    const month = months[date.getMonth()];
    const year = date.getFullYear();
    return `${day} ${month} ${year}`;
  };

  const formatDateToInput = (dateStr) => {
    if (!dateStr || dateStr === 'N/A') return '';
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return dateStr;
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const parts = dateStr.split(' ');
    if (parts.length === 3) {
      const day = String(parts[0]).padStart(2, '0');
      const monthIdx = months.indexOf(parts[1]);
      const year = parts[2];
      if (monthIdx !== -1) {
        const month = String(monthIdx + 1).padStart(2, '0');
        return `${year}-${month}-${day}`;
      }
    }
    const parsed = new Date(dateStr);
    if (!isNaN(parsed.getTime())) {
      const yyyy = parsed.getFullYear();
      const mm = String(parsed.getMonth() + 1).padStart(2, '0');
      const dd = String(parsed.getDate()).padStart(2, '0');
      return `${yyyy}-${mm}-${dd}`;
    }
    return '';
  };

  useEffect(() => {
    if (formType === 'Other') return;
    const matched = categoryTypes.find(c => c.name.toLowerCase() === formType.toLowerCase());
    if (matched && matched.group) {
      setFormGroup(matched.group);
    }
  }, [formType, categoryTypes]);

  // Statistics calculation
  const totalCount = assets.length;
  const assignedCount = assets.filter(a => a.status === 'Assigned').length;
  const availableCount = assets.filter(a => a.status === 'Available').length;
  const repairCount = assets.filter(a => a.status === 'Under Repair').length;
  const disposedCount = assets.filter(a => a.status === 'Disposed').length;

  // Filters setup (No Desktop)
  const assetTypes = ['All', ...new Set(assets.map(a => a.type))].filter(t => t !== 'Desktop');

  const getAssetScope = (asset) => {
    const matchedCat = (categories || []).find(c => c.name.toLowerCase().trim() === asset.type.toLowerCase().trim());
    if (matchedCat && matchedCat.scope) return matchedCat.scope;
    const employeeCategories = ['laptop', 'mouse', 'keyboard', 'headphones', 'mobile', 'headset'];
    return employeeCategories.some(k => asset.type.toLowerCase().includes(k)) ? 'Employee' : 'Organization';
  };

  // Filter assets list
  const filteredAssets = assets.filter(asset => {
    if (asset.type === 'Desktop') return false; // Desktop removed completely
    const owner = employees.find(e => e.id === asset.assignedTo);
    const searchString = `${asset.id} ${asset.type} ${asset.brand} ${asset.model} ${asset.serialNumber} ${asset.status} ${owner ? owner.name : ''}`.toLowerCase();
    
    const matchesSearch = searchString.includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'All' ? true : asset.type === typeFilter;
    const matchesScope = scopeFilter === 'All' 
      ? true 
      : scopeFilter === 'Assigned' 
        ? asset.status === 'Assigned' 
        : asset.status !== 'Assigned';
        
    let matchesDate = true;
    if (filterStartDate || filterEndDate) {
      if (!asset.assignedDate || asset.assignedDate === 'N/A' || asset.status !== 'Assigned') {
        matchesDate = false;
      } else {
        try {
          const inputDateStr = formatDateToInput(asset.assignedDate);
          if (inputDateStr) {
            const assignDateObj = new Date(inputDateStr);
            if (filterStartDate) {
              const start = new Date(filterStartDate);
              if (assignDateObj < start) matchesDate = false;
            }
            if (filterEndDate) {
              const end = new Date(filterEndDate);
              if (assignDateObj > end) matchesDate = false;
            }
          } else {
            matchesDate = false;
          }
        } catch (e) {
          matchesDate = false;
        }
      }
    }
    
    return matchesSearch && matchesType && matchesScope && matchesDate;
  });

  // Multi-select helpers
  const isAllSelected = filteredAssets.length > 0 && filteredAssets.every(a => selectedIds.includes(a.id));
  
  const handleSelectAll = () => {
    if (isAllSelected) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredAssets.map(a => a.id));
    }
  };

  const handleToggleSelect = (id, e) => {
    e.stopPropagation();
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleBulkDelete = () => {
    setPassAuthModal({
      isOpen: true,
      title: "Confirm Bulk Delete Assets",
      actionLabel: `Delete ${selectedIds.length} Asset(s)`,
      onSuccess: () => {
        selectedIds.forEach(id => deleteAsset(id));
        showToast(`Successfully deleted ${selectedIds.length} assets!`);
        setSelectedIds([]);
        setIsBulkDeleteOpen(false);
        setPassAuthModal({ isOpen: false, title: '', actionLabel: '', onSuccess: null });
      }
    });
  };

  // Excel Bulk Import Handler
  const handleImportAssets = (rawRows) => {
    let successCount = 0;
    const failedRows = [];

    rawRows.forEach((row, idx) => {
      const type = row.Type || row.type || row['Asset Type'] || 'Laptop';
      const brand = row.Brand || row.brand || 'Generic';
      const model = row.Model || row.model || 'Standard';
      const serialNumber = row.SerialNumber || row.serialNumber || row['Serial Number'] || row.Serial || '';
      const status = row.Status || row.status || 'Available';

      if (type === 'Desktop') return; // Skip desktops

      if (!serialNumber) {
        failedRows.push({ row: idx + 2, reason: `Missing Serial Number for item "${brand} ${model}"` });
        return;
      }

      const exists = assets.some(a => a.serialNumber.toLowerCase() === String(serialNumber).toLowerCase());
      if (exists) {
        failedRows.push({ row: idx + 2, reason: `Duplicate serial number "${serialNumber}" already exists.` });
        return;
      }

      const ownership = row.Ownership || row.ownership || row['Asset Ownership'] || 'Quadrant IT Services';

      addAsset({
        type: type,
        brand: brand,
        model: model,
        serialNumber: String(serialNumber),
        status: status,
        ownership: ownership,
        assignedTo: null,
        purchaseDate: new Date().toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' }),
        warrantyEndDate: new Date(new Date().setFullYear(new Date().getFullYear() + 3)).toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' })
      });
      successCount++;
    });

    if (successCount > 0) {
      showToast(`Successfully imported ${successCount} assets from Excel!`);
    }

    return {
      totalRows: rawRows.length,
      successCount,
      failedRows
    };
  };

  // CSV Exporter
  const handleExport = () => {
    const headers = "Asset ID,Asset Type,Brand,Model,Serial Number,Charger Serial Number,Condition,Status,Assigned To,Assigned Date,Purchase Date,Warranty End Date\n";
    const rows = filteredAssets.map(a => {
      const owner = employees.find(e => e.id === a.assignedTo);
      return `"${a.id}","${a.type}","${a.brand}","${a.model}","${a.serialNumber}","${a.chargerSerialNumber || 'N/A'}","${a.condition || 'Good'}","${a.status}","${owner ? owner.name : '-'}","${a.assignedDate || 'N/A'}","${a.purchaseDate}","${a.warrantyEndDate}"`;
    }).join("\n");
    
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `IT_Assets_Export_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const generateSuggestedId = (ownershipVal) => {
    const owner = (ownershipVal || '').trim().toLowerCase();
    let prefix = 'QITS';
    if (owner.includes('dsv')) {
      prefix = 'DSV';
    } else if (owner.includes('dhl')) {
      prefix = 'DHL';
    }
    let nextNum = assets.filter(a => a.id && a.id.toUpperCase().startsWith(prefix.toUpperCase())).length + 1;
    let newId = `${prefix}${String(nextNum).padStart(4, '0')}`;
    while (assets.some(a => a.id === newId)) {
      nextNum += 1;
      newId = `${prefix}${String(nextNum).padStart(4, '0')}`;
    }
    return newId;
  };

  // Form submit handlers
  const handleOpenAddModal = () => {
    setFormId(generateSuggestedId('Quadrant IT Services'));
    setFormType('Laptop');
    setCustomType('');
    setFormBrand('Dell');
    setCustomBrand('');
    setFormModel('');
    setFormSerial('');
    setFormStatus('Available');
    setFormAssigned('');
    setFormOwnership('Quadrant IT Services');
    setFormGroup('IT');
    setFormChargerSerial('');
    setFormCondition('Good');
    setFormPurchaseDate(new Date().toISOString().substring(0, 10));
    setFormAssignedDate('');
    setActiveDropdown(null);
    setIsAddModalOpen(true);
  };

  const handleAddSubmit = (e) => {
    e.preventDefault();
    const finalType = formType === 'Other' ? (customType.trim() || 'Other') : formType;
    const finalBrand = formBrand === 'Other' ? (customBrand.trim() || 'Other') : formBrand;
    
    const pDate = formPurchaseDate ? new Date(formPurchaseDate) : new Date();
    const pDateFormatted = formatDateToShort(formPurchaseDate) || new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    const wDate = new Date(pDate);
    wDate.setFullYear(pDate.getFullYear() + 3);
    const wDateFormatted = wDate.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

    addAsset({
      id: formId.trim(),
      type: finalType,
      brand: finalBrand,
      model: formModel,
      serialNumber: formSerial,
      status: formStatus,
      ownership: formOwnership,
      group: formGroup,
      chargerSerialNumber: formChargerSerial || 'N/A',
      condition: formCondition,
      assignedTo: formStatus === 'Assigned' && formAssigned ? formAssigned : null,
      purchaseDate: pDateFormatted,
      warrantyEndDate: wDateFormatted,
      assignedDate: formStatus === 'Assigned' 
        ? (formAssignedDate ? formatDateToShort(formAssignedDate) : new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }))
        : 'N/A'
    });
    setIsAddModalOpen(false);
    showToast('Asset added successfully');
  };

  const handleOpenEditModal = (asset, e) => {
    if (e) e.stopPropagation();
    setSelectedAsset(asset);
    
    const isStandardType = categoryTypes.some(c => c.name.toLowerCase() === asset.type.toLowerCase());
    setFormType(isStandardType ? asset.type : 'Other');
    setCustomType(isStandardType ? '' : asset.type);
    
    const standardBrands = ["Dell", "Logitech", "HP", "Apple", "Samsung", "Lenovo", "Sony", "Epson", "Herman Miller", "Steelcase", "Ikea", "Godrej", "Featherlite", "Generic"];
    const isStandardBrand = standardBrands.includes(asset.brand);
    setFormBrand(isStandardBrand ? asset.brand : 'Other');
    setCustomBrand(isStandardBrand ? '' : asset.brand);
    
    setFormModel(asset.model);
    setFormSerial(asset.serialNumber);
    setFormStatus(asset.status);
    setFormAssigned(asset.assignedTo || '');
    setFormOwnership(asset.ownership || 'Quadrant IT Services');
    setFormGroup(asset.group || 'IT');
    setFormChargerSerial(asset.chargerSerialNumber || '');
    setFormCondition(asset.condition || 'Good');
    setFormPurchaseDate(formatDateToInput(asset.purchaseDate));
    setFormAssignedDate(formatDateToInput(asset.assignedDate));
    setActiveDropdown(null);
    setIsEditModalOpen(true);
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    const finalType = formType === 'Other' ? (customType.trim() || 'Other') : formType;
    const finalBrand = formBrand === 'Other' ? (customBrand.trim() || 'Other') : formBrand;
    
    const pDate = formPurchaseDate ? new Date(formPurchaseDate) : new Date();
    const pDateFormatted = formatDateToShort(formPurchaseDate) || new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    const wDate = new Date(pDate);
    wDate.setFullYear(pDate.getFullYear() + 3);
    const wDateFormatted = wDate.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

    updateAsset({
      ...selectedAsset,
      type: finalType,
      brand: finalBrand,
      model: formModel,
      serialNumber: formSerial,
      status: formStatus,
      ownership: formOwnership,
      group: formGroup,
      chargerSerialNumber: formChargerSerial || 'N/A',
      condition: formCondition,
      purchaseDate: pDateFormatted,
      warrantyEndDate: wDateFormatted,
      assignedTo: formStatus === 'Assigned' && formAssigned ? formAssigned : null,
      assignedDate: formStatus === 'Assigned' 
        ? (formAssignedDate ? formatDateToShort(formAssignedDate) : (selectedAsset.assignedDate && selectedAsset.assignedDate !== 'N/A' ? selectedAsset.assignedDate : new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })))
        : 'N/A'
    });
    setIsEditModalOpen(false);
    showToast('Asset updated successfully');
  };

  const handleOpenViewModal = (asset) => {
    setSelectedAsset(asset);
    setIsViewModalOpen(true);
  };

  const handleDelete = () => {
    if (!deleteConfirmId) return;
    const targetAssetId = deleteConfirmId;
    setDeleteConfirmId(null);

    setPassAuthModal({
      isOpen: true,
      title: "Confirm Delete Asset",
      actionLabel: `Delete Asset (${targetAssetId})`,
      onSuccess: () => {
        deleteAsset(targetAssetId);
        showToast('Asset deleted successfully');
        setPassAuthModal({ isOpen: false, title: '', actionLabel: '', onSuccess: null });
      }
    });
  };

  return (
    <div className="space-y-6 animate-fade-in text-[11px]">
      {/* Breadcrumbs */}
      <div className="flex items-center justify-between">
        <div className="text-[11px] font-semibold text-slate-400">
          <span className="hover:text-slate-600 cursor-pointer">Dashboard</span>
          <span className="mx-2">&gt;</span>
          <span className="text-slate-600 font-bold">Assets Management</span>
        </div>
      </div>

      {/* 5 Compact Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <MetricCard icon={Laptop} title="Total Assets" value={totalCount} color="blue" linkTo="/assets" />
        <MetricCard icon={CheckCircle} title="Assigned Assets" value={assignedCount} color="green" linkTo="/assets" />
        <MetricCard icon={TrendingUp} title="Available Assets" value={availableCount} color="orange" linkTo="/assets" />
        <MetricCard icon={Wrench} title="Under Repair" value={repairCount} color="red" linkTo="/repairs" showLink />
        <MetricCard icon={Trash2} title="Disposed Assets" value={disposedCount} color="purple" linkTo="/assets" />
      </div>

      {/* Assets inventory panel */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
        {/* Controls Toolbar */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-3">
            <h3 className="text-sm font-bold text-slate-800">
              {scopeFilter === 'Assigned' ? 'Assigned Assets' : scopeFilter === 'Not Assigned' ? 'Not Assigned Assets' : 'All Assets Inventory'}
            </h3>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto">
            {/* Search */}
            <div className="relative flex-1 sm:w-56 min-w-[140px]">
              <span className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-slate-400">
                <Search className="h-3.5 w-3.5" />
              </span>
              <input
                type="text"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                placeholder="Search assets..."
                className="w-full pl-8 pr-3 py-1.5 border border-slate-200 rounded-xl text-xs bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
              />
            </div>
            
            {/* Custom Type filter Dropdown */}
            <div className="relative" ref={typeDropdownRef}>
              <button
                type="button"
                onClick={() => setIsTypeDropdownOpen(!isTypeDropdownOpen)}
                className="flex items-center justify-between gap-1.5 px-3 py-1.5 border border-slate-200 rounded-xl text-xs bg-slate-50 hover:bg-slate-100 text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-bold cursor-pointer transition-all min-w-[110px]"
              >
                <span>{typeFilter === 'All' ? 'All Types' : typeFilter}</span>
                <ChevronDown className={`h-3.5 w-3.5 text-slate-400 transition-transform ${isTypeDropdownOpen ? 'rotate-180' : ''}`} />
              </button>
              
              {isTypeDropdownOpen && (
                <div className="absolute top-full left-0 mt-1.5 w-48 bg-white border border-slate-200/80 rounded-2xl shadow-xl py-1 z-30 animate-scale-in text-xs font-semibold text-slate-700">
                  {assetTypes.map(t => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => {
                        setTypeFilter(t);
                        setIsTypeDropdownOpen(false);
                      }}
                      className={`w-full text-left px-3.5 py-2 hover:bg-slate-50 transition-colors flex items-center justify-between ${
                        typeFilter === t ? 'bg-blue-50/50 text-blue-600 font-bold' : ''
                      }`}
                    >
                      <span>{t === 'All' ? 'All Types' : t}</span>
                      {typeFilter === t && <Check className="h-3.5 w-3.5 text-blue-600" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Custom Scope filter Dropdown */}
            <div className="relative" ref={scopeRef}>
              <button
                type="button"
                onClick={() => setShowScopeGlass(!showScopeGlass)}
                className="flex items-center justify-between gap-1.5 px-3 py-1.5 border border-slate-200 rounded-xl text-xs bg-slate-50 hover:bg-slate-100 text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-bold cursor-pointer transition-all min-w-[110px]"
              >
                <span>{scopeFilter === 'All' ? 'All Scopes' : scopeFilter === 'Assigned' ? 'Assigned' : 'Not Assigned'}</span>
                <ChevronDown className={`h-3.5 w-3.5 text-slate-400 transition-transform ${showScopeGlass ? 'rotate-180' : ''}`} />
              </button>
              
              {showScopeGlass && (
                <div className="absolute top-full right-0 mt-1.5 w-48 bg-white border border-slate-200/80 rounded-2xl shadow-xl py-1 z-30 animate-scale-in text-xs font-semibold text-slate-700">
                  {[
                    { label: 'All Scopes', value: 'All' },
                    { label: 'Assigned', value: 'Assigned' },
                    { label: 'Not Assigned', value: 'Not Assigned' }
                  ].map(item => (
                    <button
                      key={item.value}
                      type="button"
                      onClick={() => {
                        setScopeFilter(item.value);
                        setShowScopeGlass(false);
                      }}
                      className={`w-full text-left px-3.5 py-2 hover:bg-slate-50 transition-colors flex items-center justify-between ${
                        scopeFilter === item.value ? 'bg-blue-50/50 text-blue-600 font-bold' : ''
                      }`}
                    >
                      <span>{item.label}</span>
                      {scopeFilter === item.value && <Check className="h-3.5 w-3.5 text-blue-600" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Date Range Filters (From/To) */}
            <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 shadow-2xs">
              <Calendar className="h-3.5 w-3.5 text-slate-400" />
              <input
                type="date"
                value={filterStartDate}
                onChange={(e) => setFilterStartDate(e.target.value)}
                placeholder="From Date"
                title="Filter by assignment start date"
                className="bg-transparent border-0 outline-none text-xs text-slate-600 focus:ring-0 p-0 cursor-pointer w-24"
              />
            </div>
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">to</span>
            <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 shadow-2xs">
              <Calendar className="h-3.5 w-3.5 text-slate-400" />
              <input
                type="date"
                value={filterEndDate}
                onChange={(e) => setFilterEndDate(e.target.value)}
                placeholder="To Date"
                title="Filter by assignment end date"
                className="bg-transparent border-0 outline-none text-xs text-slate-600 focus:ring-0 p-0 cursor-pointer w-24"
              />
            </div>
            {(filterStartDate || filterEndDate) && (
              <button
                onClick={() => {
                  setFilterStartDate('');
                  setFilterEndDate('');
                }}
                className="text-xs font-semibold text-slate-500 hover:text-slate-700 transition-all flex items-center gap-1 hover:underline cursor-pointer"
              >
                Clear
              </button>
            )}

            {/* Import Excel Trigger */}
            <div className="relative group">
              <button 
                type="button"
                onClick={() => setIsImportModalOpen(true)}
                className="h-8 w-8 rounded-full border border-emerald-200 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 flex items-center justify-center transition-all cursor-pointer shadow-xs shrink-0"
              >
                <Download className="h-4 w-4 text-emerald-600" />
              </button>
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-0.5 bg-slate-800 text-white text-[10px] rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap font-bold z-30 shadow-md">
                Import Assets
              </div>
            </div>

            {/* Export Trigger */}
            <div className="relative group">
              <button 
                type="button"
                onClick={handleExport}
                className="h-8 w-8 rounded-full border border-slate-200 hover:bg-slate-50 text-slate-600 flex items-center justify-center transition-all cursor-pointer shadow-xs shrink-0"
              >
                <Upload className="h-4 w-4 text-slate-600" />
              </button>
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-0.5 bg-slate-800 text-white text-[10px] rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap font-bold z-30 shadow-md">
                Export Assets
              </div>
            </div>

            {/* Add Asset Trigger (Circular + Button) */}
            <div className="relative group">
              <button 
                type="button"
                onClick={handleOpenAddModal}
                className="h-8 w-8 rounded-full bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center shadow-md shadow-blue-500/20 hover:scale-105 active:scale-95 transition-all cursor-pointer shrink-0"
              >
                <Plus className="h-4 w-4" />
              </button>
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-0.5 bg-slate-800 text-white text-[10px] rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap font-bold z-30 shadow-md">
                Add Asset
              </div>
            </div>
          </div>
        </div>

        {/* Bulk Actions Bar (Appears when items selected) */}
        {selectedIds.length > 0 && (
          <div className="p-3 bg-red-50/80 border border-red-200 rounded-xl flex items-center justify-between animate-fade-in">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
              <span className="font-bold text-red-800 text-xs">{selectedIds.length} asset(s) selected</span>
            </div>
            <button
              type="button"
              onClick={() => setIsBulkDeleteOpen(true)}
              className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-lg shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span>Delete Selected ({selectedIds.length})</span>
            </button>
          </div>
        )}

        {/* Endless 60vh Scrollable Inventory Table Container with Fixed Sticky Header */}
        <div className="max-h-[60vh] overflow-y-auto rounded-xl border border-slate-200/80 shadow-xs relative">
          <table className="w-full text-left border-collapse">
            <thead className="sticky top-0 bg-slate-50 z-20 shadow-xs border-b border-slate-200 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
              <tr>
                <th className="py-2.5 px-3">Asset ID</th>
                <th className="py-2.5 px-3">Asset Type / Model</th>
                <th className="py-2.5 px-3">Serial Number / Barcode</th>
                
                {/* Conditional Columns based on View */}
                {scopeFilter === 'Assigned' ? (
                  <>
                    <th className="py-2.5 px-3">Assigned To</th>
                    <th className="py-2.5 px-3">Assigned Date</th>
                  </>
                ) : scopeFilter === 'Not Assigned' ? (
                  <>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3">Purchase Date</th>
                  </>
                ) : (
                  <>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3">Assigned To</th>
                  </>
                )}
                <th className="py-2.5 px-3 text-right pr-4">Quick Actions</th>
                {/* Select All Checkbox */}
                <th className="py-2.5 px-3 w-10 text-center">
                  <input
                    type="checkbox"
                    checked={isAllSelected}
                    onChange={handleSelectAll}
                    className="rounded text-blue-600 border-slate-300 focus:ring-blue-500 cursor-pointer"
                  />
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs text-slate-700 bg-white">
              {filteredAssets.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400 font-semibold">
                    No matching assets found.
                  </td>
                </tr>
              ) : (
                filteredAssets.map((asset) => {
                  const owner = employees.find(e => e.id === asset.assignedTo);
                  const isSelected = selectedIds.includes(asset.id);

                  return (
                    <tr 
                      key={asset.id} 
                      onClick={() => handleOpenViewModal(asset)}
                      className={`group hover:bg-slate-50/80 transition-all font-medium cursor-pointer ${
                        isSelected ? 'bg-blue-50/30' : ''
                      }`}
                    >
                      {/* Asset ID */}
                      <td className="py-2.5 px-3 font-extrabold text-blue-600">
                        <div className="flex items-center gap-2">
                          <AssetIconBadge type={asset.type} className="h-6 w-6 rounded-md" iconSize="h-3.5 w-3.5" />
                          <span>{asset.id}</span>
                        </div>
                      </td>

                      {/* Asset Type / Model */}
                      <td className="py-2.5 px-3 font-bold text-slate-800">
                        <div>
                          <p className="text-xs font-bold text-slate-800">{asset.brand} {asset.model}</p>
                          <p className="text-[10px] text-slate-400 font-medium">{asset.type}</p>
                        </div>
                      </td>

                      {/* Serial Number */}
                      <td className="py-2.5 px-3 font-mono text-slate-600 text-[11px]">{asset.serialNumber}</td>

                      {/* View Specific Columns */}
                      {scopeFilter === 'Assigned' ? (
                        <>
                          <td className="py-2.5 px-3">
                            {owner ? (
                              <div className="flex items-center gap-1.5">
                                <Avatar name={owner.name} className="h-5 w-5 rounded-full" textSize="text-[7px]" />
                                <span className="font-semibold text-slate-700 truncate">{owner.name}</span>
                              </div>
                            ) : (
                              <span className="text-slate-400">-</span>
                            )}
                          </td>
                          <td className="py-2.5 px-3 text-slate-500 text-[10px] font-semibold">{asset.purchaseDate || '10 May 2024'}</td>
                        </>
                      ) : scopeFilter === 'Not Assigned' ? (
                        <>
                          <td className="py-2.5 px-3">
                            <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold whitespace-nowrap inline-block text-center border ${
                              asset.status === 'Available' ? 'bg-emerald-50 text-emerald-600 border-emerald-100/60' :
                              asset.status === 'Under Repair' ? 'bg-rose-50 text-rose-600 border-rose-100/60' :
                              'bg-slate-900 text-slate-50 border-slate-900'
                            }`}>
                              {asset.status}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-slate-500 text-[10px]">{asset.purchaseDate}</td>
                        </>
                      ) : (
                        <>
                          <td className="py-2.5 px-3">
                            <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold whitespace-nowrap inline-block text-center border ${
                              asset.status === 'Assigned' ? 'bg-blue-50 text-[#1E3A8A] border-blue-200/60' :
                              asset.status === 'Available' ? 'bg-emerald-50 text-emerald-600 border-emerald-100/60' :
                              asset.status === 'Under Repair' ? 'bg-rose-50 text-rose-600 border-rose-100/60' :
                              'bg-slate-900 text-slate-50 border-slate-900'
                            }`}>
                              {asset.status}
                            </span>
                          </td>
                          <td className="py-2.5 px-3">
                            {owner ? (
                              <div className="flex items-center gap-1.5">
                                <Avatar name={owner.name} className="h-5 w-5 rounded-full" textSize="text-[7px]" />
                                <span className="font-semibold text-slate-700 truncate">{owner.name}</span>
                              </div>
                            ) : (
                              <span className="text-slate-400">-</span>
                            )}
                          </td>
                        </>
                      )}

                      {/* Hover Actions (No heavy actions column) */}
                      <td className="py-2.5 px-3 text-right pr-4" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                          <button
                            type="button"
                            onClick={() => handleOpenViewModal(asset)}
                            className="p-1 hover:bg-blue-50 rounded-lg text-blue-600 transition-colors"
                            title="View Asset Details"
                          >
                            <Eye className="h-3.5 w-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={(e) => handleOpenEditModal(asset, e)}
                            className="p-1 hover:bg-slate-100 rounded-lg text-slate-600 transition-colors"
                            title="Edit Asset"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); setDeleteConfirmId(asset.id); }}
                            className="p-1 hover:bg-red-50 rounded-lg text-red-500 transition-colors"
                            title="Delete Asset"
                          >
                            <Trash className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>

                      {/* Checkbox */}
                      <td className="py-2.5 px-3 text-center" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={(e) => handleToggleSelect(asset.id, e)}
                          className="rounded text-blue-600 border-slate-300 focus:ring-blue-500 cursor-pointer"
                        />
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* CRUD Add Asset Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setIsAddModalOpen(false)} />
          <div className="relative bg-white border border-slate-200 w-full max-w-lg rounded-3xl shadow-2xl p-6 z-10">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
              <h3 className="font-bold text-slate-800">Add New Asset</h3>
              <button onClick={() => setIsAddModalOpen(false)} className="p-1 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form ref={formDropdownRef} onSubmit={handleAddSubmit} className="space-y-4 animate-fade-in">
              <div className="grid grid-cols-2 gap-4">
                {/* Ownership Dropdown */}
                <div className="relative">
                  <label className="block text-xs font-bold text-slate-500 mb-1">Asset Ownership *</label>
                  <button
                    type="button"
                    onClick={() => setActiveDropdown(activeDropdown === 'ownership' ? null : 'ownership')}
                    className="w-full flex items-center justify-between p-2 border border-slate-200 rounded-xl text-xs bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-left transition-all"
                  >
                    <span>{formOwnership}</span>
                    <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform ${activeDropdown === 'ownership' ? 'rotate-180' : ''}`} />
                  </button>
                  
                  {activeDropdown === 'ownership' && (
                    <div className="absolute top-full left-0 mt-1 w-full bg-white border border-slate-200 rounded-xl shadow-xl py-1 z-30 text-xs font-semibold text-slate-700">
                      {["Quadrant IT Services", "DSV", "DHL"].map(opt => (
                        <button
                          key={opt}
                          type="button"
                          onClick={() => {
                            setFormOwnership(opt);
                            setFormId(generateSuggestedId(opt));
                            setActiveDropdown(null);
                          }}
                          className={`w-full text-left px-3 py-2 hover:bg-slate-50 transition-colors flex items-center justify-between ${
                            formOwnership === opt ? 'bg-blue-50/50 text-blue-600 font-bold' : ''
                          }`}
                        >
                          <span>{opt}</span>
                          {formOwnership === opt && <Check className="h-3.5 w-3.5 text-blue-600" />}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Asset ID Input */}
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Asset ID *</label>
                  <input 
                    type="text" 
                    required 
                    value={formId} 
                    onChange={e => setFormId(e.target.value)} 
                    placeholder="e.g. QITS0266"
                    className="w-full p-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500/20 focus:outline-none font-semibold text-slate-800"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {/* Asset Type Dropdown */}
                <div className="relative">
                  <label className="block text-xs font-bold text-slate-500 mb-1">Asset Type *</label>
                  <button
                    type="button"
                    onClick={() => setActiveDropdown(activeDropdown === 'type' ? null : 'type')}
                    className="w-full flex items-center justify-between p-2 border border-slate-200 rounded-xl text-xs bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-left transition-all"
                  >
                    <span>{formType === 'Other' ? 'Other (Custom Type)' : formType}</span>
                    <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform ${activeDropdown === 'type' ? 'rotate-180' : ''}`} />
                  </button>
                  
                  {activeDropdown === 'type' && (
                    <div className="absolute top-full left-0 mt-1 w-full bg-white border border-slate-200 rounded-xl shadow-xl py-1 z-30 max-h-48 overflow-y-auto text-xs font-semibold text-slate-700">
                      {[...categoryTypes.map(c => c.name), "Other"].map(opt => (
                        <button
                          key={opt}
                          type="button"
                          onClick={() => {
                            setFormType(opt);
                            setActiveDropdown(null);
                          }}
                          className={`w-full text-left px-3 py-2 hover:bg-slate-50 transition-colors flex items-center justify-between ${
                            formType === opt ? 'bg-blue-50/50 text-blue-600 font-bold' : ''
                          }`}
                        >
                          <span>{opt === 'Other' ? 'Other (Custom Type)' : opt}</span>
                          {formType === opt && <Check className="h-3.5 w-3.5 text-blue-600" />}
                        </button>
                      ))}
                    </div>
                  )}
                  {formType === 'Other' && (
                    <input 
                      type="text" 
                      required 
                      value={customType} 
                      onChange={e => setCustomType(e.target.value)} 
                      placeholder="Enter custom asset type..."
                      className="w-full mt-2 p-2 border border-blue-200 bg-blue-50/30 rounded-xl text-xs focus:ring-2 focus:ring-blue-500/20 focus:outline-none font-semibold text-blue-900 animate-fade-in"
                    />
                  )}
                </div>

                {/* Brand Dropdown */}
                <div className="relative">
                  <label className="block text-xs font-bold text-slate-500 mb-1">Brand *</label>
                  <button
                    type="button"
                    onClick={() => setActiveDropdown(activeDropdown === 'brand' ? null : 'brand')}
                    className="w-full flex items-center justify-between p-2 border border-slate-200 rounded-xl text-xs bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-left transition-all"
                  >
                    <span>{formBrand === 'Other' ? 'Other (Custom Brand)' : formBrand}</span>
                    <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform ${activeDropdown === 'brand' ? 'rotate-180' : ''}`} />
                  </button>
                  
                  {activeDropdown === 'brand' && (
                    <div className="absolute top-full left-0 mt-1 w-full bg-white border border-slate-200 rounded-xl shadow-xl py-1 z-30 max-h-48 overflow-y-auto text-xs font-semibold text-slate-700">
                      {["Dell", "Logitech", "HP", "Apple", "Samsung", "Lenovo", "Sony", "Epson", "Herman Miller", "Steelcase", "Ikea", "Godrej", "Featherlite", "Generic", "Other"].map(opt => (
                        <button
                          key={opt}
                          type="button"
                          onClick={() => {
                            setFormBrand(opt);
                            setActiveDropdown(null);
                          }}
                          className={`w-full text-left px-3 py-2 hover:bg-slate-50 transition-colors flex items-center justify-between ${
                            formBrand === opt ? 'bg-blue-50/50 text-blue-600 font-bold' : ''
                          }`}
                        >
                          <span>{opt === 'Other' ? 'Other (Custom Brand)' : opt}</span>
                          {formBrand === opt && <Check className="h-3.5 w-3.5 text-blue-600" />}
                        </button>
                      ))}
                    </div>
                  )}
                  {formBrand === 'Other' && (
                    <input 
                      type="text" 
                      required 
                      value={customBrand} 
                      onChange={e => setCustomBrand(e.target.value)} 
                      placeholder="Enter custom brand name..."
                      className="w-full mt-2 p-2 border border-blue-200 bg-blue-50/30 rounded-xl text-xs focus:ring-2 focus:ring-blue-500/20 focus:outline-none font-semibold text-blue-900 animate-fade-in"
                    />
                  )}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Model Name *</label>
                  <input 
                    type="text" 
                    required 
                    value={formModel} 
                    onChange={e => setFormModel(e.target.value)} 
                    placeholder="e.g. Latitude 5440"
                    className="w-full p-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Serial Number / Barcode *</label>
                  <input 
                    type="text" 
                    required 
                    value={formSerial} 
                    onChange={e => setFormSerial(e.target.value)} 
                    placeholder="e.g. ABC12345"
                    className="w-full p-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {/* Asset Class Dropdown */}
                <div className="relative">
                  <label className="block text-xs font-bold text-slate-500 mb-1">Asset Class *</label>
                  <button
                    type="button"
                    onClick={() => setActiveDropdown(activeDropdown === 'group' ? null : 'group')}
                    className="w-full flex items-center justify-between p-2 border border-slate-200 rounded-xl text-xs bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-left transition-all"
                  >
                    <span>{formGroup === 'IT' ? 'IT Asset' : 'Non-IT Asset'}</span>
                    <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform ${activeDropdown === 'group' ? 'rotate-180' : ''}`} />
                  </button>
                  
                  {activeDropdown === 'group' && (
                    <div className="absolute top-full left-0 mt-1 w-full bg-white border border-slate-200 rounded-xl shadow-xl py-1 z-30 text-xs font-semibold text-slate-700">
                      {[
                        { label: 'IT Asset', value: 'IT' },
                        { label: 'Non-IT Asset', value: 'Non-IT' }
                      ].map(opt => (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => {
                            setFormGroup(opt.value);
                            setActiveDropdown(null);
                          }}
                          className={`w-full text-left px-3 py-2 hover:bg-slate-50 transition-colors flex items-center justify-between ${
                            formGroup === opt.value ? 'bg-blue-50/50 text-blue-600 font-bold' : ''
                          }`}
                        >
                          <span>{opt.label}</span>
                          {formGroup === opt.value && <Check className="h-3.5 w-3.5 text-blue-600" />}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              {/* Charger Serial (if Laptop) */}
              {formType === 'Laptop' && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1">Charger Serial Number *</label>
                    <input 
                      type="text" 
                      required 
                      value={formChargerSerial} 
                      onChange={e => setFormChargerSerial(e.target.value)} 
                      placeholder="e.g. CHG12345"
                      className="w-full p-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
                    />
                  </div>
                </div>
              )}

              {/* Condition & Purchase Date */}
              <div className="grid grid-cols-2 gap-4">
                {/* Condition Dropdown */}
                <div className="relative">
                  <label className="block text-xs font-bold text-slate-500 mb-1">Asset Condition *</label>
                  <button
                    type="button"
                    onClick={() => setActiveDropdown(activeDropdown === 'condition' ? null : 'condition')}
                    className="w-full flex items-center justify-between p-2 border border-slate-200 rounded-xl text-xs bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-left transition-all"
                  >
                    <span>{formCondition}</span>
                    <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform ${activeDropdown === 'condition' ? 'rotate-180' : ''}`} />
                  </button>
                  
                  {activeDropdown === 'condition' && (
                    <div className="absolute top-full left-0 mt-1 w-full bg-white border border-slate-200 rounded-xl shadow-xl py-1 z-30 text-xs font-semibold text-slate-700">
                      {["Good", "Working", "Poor"].map(opt => (
                        <button
                          key={opt}
                          type="button"
                          onClick={() => {
                            setFormCondition(opt);
                            setActiveDropdown(null);
                          }}
                          className={`w-full text-left px-3 py-2 hover:bg-slate-50 transition-colors flex items-center justify-between ${
                            formCondition === opt ? 'bg-blue-50/50 text-blue-600 font-bold' : ''
                          }`}
                        >
                          <span>{opt}</span>
                          {formCondition === opt && <Check className="h-3.5 w-3.5 text-blue-600" />}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Purchase Date Picker */}
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Purchase Date *</label>
                  <input 
                    type="date" 
                    required 
                    value={formPurchaseDate} 
                    onChange={e => setFormPurchaseDate(e.target.value)} 
                    className="w-full p-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
                  />
                </div>
              </div>

              {/* Status Section */}
              <div className="grid grid-cols-2 gap-4">
                {/* Initial Status Dropdown */}
                <div className="relative">
                  <label className="block text-xs font-bold text-slate-500 mb-1">Initial Status</label>
                  <button
                    type="button"
                    onClick={() => setActiveDropdown(activeDropdown === 'status' ? null : 'status')}
                    className="w-full flex items-center justify-between p-2 border border-slate-200 rounded-xl text-xs bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-left transition-all"
                  >
                    <span>{formStatus}</span>
                    <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform ${activeDropdown === 'status' ? 'rotate-180' : ''}`} />
                  </button>
                  
                  {activeDropdown === 'status' && (
                    <div className="absolute top-full left-0 mt-1 w-full bg-white border border-slate-200 rounded-xl shadow-xl py-1 z-30 text-xs font-semibold text-slate-700">
                      {["Available", "Assigned", "Under Repair", "Disposed"].map(opt => (
                        <button
                          key={opt}
                          type="button"
                          onClick={() => {
                            setFormStatus(opt);
                            setActiveDropdown(null);
                          }}
                          className={`w-full text-left px-3 py-2 hover:bg-slate-50 transition-colors flex items-center justify-between ${
                            formStatus === opt ? 'bg-blue-50/50 text-blue-600 font-bold' : ''
                          }`}
                        >
                          <span>{opt}</span>
                          {formStatus === opt && <Check className="h-3.5 w-3.5 text-blue-600" />}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Assign To Employee & Date Section */}
              {formStatus === 'Assigned' && (
                <div className="grid grid-cols-2 gap-4 animate-scale-in">
                  {/* Assign to Employee Dropdown */}
                  <div className="relative">
                    <label className="block text-xs font-bold text-slate-500 mb-1">Assign To Employee *</label>
                    <button
                      type="button"
                      onClick={() => setActiveDropdown(activeDropdown === 'assigned' ? null : 'assigned')}
                      className="w-full flex items-center justify-between p-2 border border-slate-200 rounded-xl text-xs bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-left transition-all"
                    >
                      <span>
                        {formAssigned 
                          ? `${employees.find(emp => emp.id === formAssigned)?.name || formAssigned} (${formAssigned})`
                          : 'Select Employee'}
                      </span>
                      <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform ${activeDropdown === 'assigned' ? 'rotate-180' : ''}`} />
                    </button>
                    
                    {activeDropdown === 'assigned' && (
                      <div className="absolute top-full left-0 mt-1 w-full bg-white border border-slate-200 rounded-xl shadow-xl py-1 z-30 max-h-48 overflow-y-auto text-xs font-semibold text-slate-700">
                        {employees.map(emp => (
                          <button
                            key={emp.id}
                            type="button"
                            onClick={() => {
                              setFormAssigned(emp.id);
                              setActiveDropdown(null);
                            }}
                            className={`w-full text-left px-3 py-2 hover:bg-slate-50 transition-colors flex items-center justify-between ${
                              formAssigned === emp.id ? 'bg-blue-50/50 text-blue-600 font-bold' : ''
                            }`}
                          >
                            <span>{emp.name} ({emp.id})</span>
                            {formAssigned === emp.id && <Check className="h-3.5 w-3.5 text-blue-600" />}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Assigned Date Picker */}
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1">Assigned Date</label>
                    <input 
                      type="date" 
                      value={formAssignedDate} 
                      onChange={e => setFormAssignedDate(e.target.value)} 
                      className="w-full p-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
                    />
                  </div>
                </div>
              )}
              <div className="flex gap-3 justify-end pt-4 border-t border-slate-100">
                <button type="button" onClick={() => setIsAddModalOpen(false)} className="px-4 py-2 text-xs font-semibold text-slate-500 hover:bg-slate-50 rounded-xl border border-slate-200">
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md shadow-blue-500/10">
                  Save Asset
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CRUD Edit Asset Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setIsEditModalOpen(false)} />
          <div className="relative bg-white border border-slate-200 w-full max-w-lg rounded-3xl shadow-2xl p-6 z-10">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
              <h3 className="font-bold text-slate-800">Edit Asset {selectedAsset?.id}</h3>
              <button onClick={() => setIsEditModalOpen(false)} className="p-1 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form ref={formDropdownRef} onSubmit={handleEditSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {/* Asset Type Dropdown */}
                <div className="relative">
                  <label className="block text-xs font-bold text-slate-500 mb-1">Asset Type *</label>
                  <button
                    type="button"
                    onClick={() => setActiveDropdown(activeDropdown === 'type' ? null : 'type')}
                    className="w-full flex items-center justify-between p-2 border border-slate-200 rounded-xl text-xs bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-left transition-all"
                  >
                    <span>{formType === 'Other' ? 'Other (Custom Type)' : formType}</span>
                    <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform ${activeDropdown === 'type' ? 'rotate-180' : ''}`} />
                  </button>
                  
                  {activeDropdown === 'type' && (
                    <div className="absolute top-full left-0 mt-1 w-full bg-white border border-slate-200 rounded-xl shadow-xl py-1 z-30 max-h-48 overflow-y-auto text-xs font-semibold text-slate-700">
                      {[...categoryTypes.map(c => c.name), "Other"].map(opt => (
                        <button
                          key={opt}
                          type="button"
                          onClick={() => {
                            setFormType(opt);
                            setActiveDropdown(null);
                          }}
                          className={`w-full text-left px-3 py-2 hover:bg-slate-50 transition-colors flex items-center justify-between ${
                            formType === opt ? 'bg-blue-50/50 text-blue-600 font-bold' : ''
                          }`}
                        >
                          <span>{opt === 'Other' ? 'Other (Custom Type)' : opt}</span>
                          {formType === opt && <Check className="h-3.5 w-3.5 text-blue-600" />}
                        </button>
                      ))}
                    </div>
                  )}
                  {formType === 'Other' && (
                    <input 
                      type="text" 
                      required 
                      value={customType} 
                      onChange={e => setCustomType(e.target.value)} 
                      placeholder="Enter custom asset type..."
                      className="w-full mt-2 p-2 border border-blue-200 bg-blue-50/30 rounded-xl text-xs focus:ring-2 focus:ring-blue-500/20 focus:outline-none font-semibold text-blue-900 animate-fade-in"
                    />
                  )}
                </div>

                {/* Brand Dropdown */}
                <div className="relative">
                  <label className="block text-xs font-bold text-slate-500 mb-1">Brand *</label>
                  <button
                    type="button"
                    onClick={() => setActiveDropdown(activeDropdown === 'brand' ? null : 'brand')}
                    className="w-full flex items-center justify-between p-2 border border-slate-200 rounded-xl text-xs bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-left transition-all"
                  >
                    <span>{formBrand === 'Other' ? 'Other (Custom Brand)' : formBrand}</span>
                    <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform ${activeDropdown === 'brand' ? 'rotate-180' : ''}`} />
                  </button>
                  
                  {activeDropdown === 'brand' && (
                    <div className="absolute top-full left-0 mt-1 w-full bg-white border border-slate-200 rounded-xl shadow-xl py-1 z-30 max-h-48 overflow-y-auto text-xs font-semibold text-slate-700">
                      {["Dell", "Logitech", "HP", "Apple", "Samsung", "Lenovo", "Sony", "Epson", "Herman Miller", "Steelcase", "Ikea", "Godrej", "Featherlite", "Generic", "Other"].map(opt => (
                        <button
                          key={opt}
                          type="button"
                          onClick={() => {
                            setFormBrand(opt);
                            setActiveDropdown(null);
                          }}
                          className={`w-full text-left px-3 py-2 hover:bg-slate-50 transition-colors flex items-center justify-between ${
                            formBrand === opt ? 'bg-blue-50/50 text-blue-600 font-bold' : ''
                          }`}
                        >
                          <span>{opt === 'Other' ? 'Other (Custom Brand)' : opt}</span>
                          {formBrand === opt && <Check className="h-3.5 w-3.5 text-blue-600" />}
                        </button>
                      ))}
                    </div>
                  )}
                  {formBrand === 'Other' && (
                    <input 
                      type="text" 
                      required 
                      value={customBrand} 
                      onChange={e => setCustomBrand(e.target.value)} 
                      placeholder="Enter custom brand name..."
                      className="w-full mt-2 p-2 border border-blue-200 bg-blue-50/30 rounded-xl text-xs focus:ring-2 focus:ring-blue-500/20 focus:outline-none font-semibold text-blue-900 animate-fade-in"
                    />
                  )}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Model Name *</label>
                  <input 
                    type="text" 
                    required 
                    value={formModel} 
                    onChange={e => setFormModel(e.target.value)}
                    className="w-full p-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Serial Number / Barcode *</label>
                  <input 
                    type="text" 
                    required 
                    value={formSerial} 
                    onChange={e => setFormSerial(e.target.value)}
                    className="w-full p-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {/* Ownership Dropdown */}
                <div className="relative">
                  <label className="block text-xs font-bold text-slate-500 mb-1">Asset Ownership *</label>
                  <button
                    type="button"
                    onClick={() => setActiveDropdown(activeDropdown === 'ownership' ? null : 'ownership')}
                    className="w-full flex items-center justify-between p-2 border border-slate-200 rounded-xl text-xs bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-left transition-all"
                  >
                    <span>{formOwnership}</span>
                    <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform ${activeDropdown === 'ownership' ? 'rotate-180' : ''}`} />
                  </button>
                  
                  {activeDropdown === 'ownership' && (
                    <div className="absolute top-full left-0 mt-1 w-full bg-white border border-slate-200 rounded-xl shadow-xl py-1 z-30 text-xs font-semibold text-slate-700">
                      {["Quadrant IT Services", "DSV", "DHL"].map(opt => (
                        <button
                          key={opt}
                          type="button"
                          onClick={() => {
                            setFormOwnership(opt);
                            setActiveDropdown(null);
                          }}
                          className={`w-full text-left px-3 py-2 hover:bg-slate-50 transition-colors flex items-center justify-between ${
                            formOwnership === opt ? 'bg-blue-50/50 text-blue-600 font-bold' : ''
                          }`}
                        >
                          <span>{opt}</span>
                          {formOwnership === opt && <Check className="h-3.5 w-3.5 text-blue-600" />}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                {/* Asset Class Dropdown */}
                <div className="relative">
                  <label className="block text-xs font-bold text-slate-500 mb-1">Asset Class *</label>
                  <button
                    type="button"
                    onClick={() => setActiveDropdown(activeDropdown === 'group' ? null : 'group')}
                    className="w-full flex items-center justify-between p-2 border border-slate-200 rounded-xl text-xs bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-left transition-all"
                  >
                    <span>{formGroup === 'IT' ? 'IT Asset' : 'Non-IT Asset'}</span>
                    <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform ${activeDropdown === 'group' ? 'rotate-180' : ''}`} />
                  </button>
                  
                  {activeDropdown === 'group' && (
                    <div className="absolute top-full left-0 mt-1 w-full bg-white border border-slate-200 rounded-xl shadow-xl py-1 z-30 text-xs font-semibold text-slate-700">
                      {[
                        { label: 'IT Asset', value: 'IT' },
                        { label: 'Non-IT Asset', value: 'Non-IT' }
                      ].map(opt => (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => {
                            setFormGroup(opt.value);
                            setActiveDropdown(null);
                          }}
                          className={`w-full text-left px-3 py-2 hover:bg-slate-50 transition-colors flex items-center justify-between ${
                            formGroup === opt.value ? 'bg-blue-50/50 text-blue-600 font-bold' : ''
                          }`}
                        >
                          <span>{opt.label}</span>
                          {formGroup === opt.value && <Check className="h-3.5 w-3.5 text-blue-600" />}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              {/* Charger Serial (if Laptop) */}
              {formType === 'Laptop' && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1">Charger Serial Number *</label>
                    <input 
                      type="text" 
                      required 
                      value={formChargerSerial} 
                      onChange={e => setFormChargerSerial(e.target.value)} 
                      placeholder="e.g. CHG12345"
                      className="w-full p-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
                    />
                  </div>
                </div>
              )}

              {/* Condition & Purchase Date */}
              <div className="grid grid-cols-2 gap-4">
                {/* Condition Dropdown */}
                <div className="relative">
                  <label className="block text-xs font-bold text-slate-500 mb-1">Asset Condition *</label>
                  <button
                    type="button"
                    onClick={() => setActiveDropdown(activeDropdown === 'condition' ? null : 'condition')}
                    className="w-full flex items-center justify-between p-2 border border-slate-200 rounded-xl text-xs bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-left transition-all"
                  >
                    <span>{formCondition}</span>
                    <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform ${activeDropdown === 'condition' ? 'rotate-180' : ''}`} />
                  </button>
                  
                  {activeDropdown === 'condition' && (
                    <div className="absolute top-full left-0 mt-1 w-full bg-white border border-slate-200 rounded-xl shadow-xl py-1 z-30 text-xs font-semibold text-slate-700">
                      {["Good", "Working", "Poor"].map(opt => (
                        <button
                          key={opt}
                          type="button"
                          onClick={() => {
                            setFormCondition(opt);
                            setActiveDropdown(null);
                          }}
                          className={`w-full text-left px-3 py-2 hover:bg-slate-50 transition-colors flex items-center justify-between ${
                            formCondition === opt ? 'bg-blue-50/50 text-blue-600 font-bold' : ''
                          }`}
                        >
                          <span>{opt}</span>
                          {formCondition === opt && <Check className="h-3.5 w-3.5 text-blue-600" />}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Purchase Date Picker */}
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Purchase Date *</label>
                  <input 
                    type="date" 
                    required 
                    value={formPurchaseDate} 
                    onChange={e => setFormPurchaseDate(e.target.value)} 
                    className="w-full p-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
                  />
                </div>
              </div>

              {/* Status Section */}
              <div className="grid grid-cols-2 gap-4">
                {/* Initial Status Dropdown */}
                <div className="relative">
                  <label className="block text-xs font-bold text-slate-500 mb-1">Status</label>
                  <button
                    type="button"
                    onClick={() => setActiveDropdown(activeDropdown === 'status' ? null : 'status')}
                    className="w-full flex items-center justify-between p-2 border border-slate-200 rounded-xl text-xs bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-left transition-all"
                  >
                    <span>{formStatus}</span>
                    <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform ${activeDropdown === 'status' ? 'rotate-180' : ''}`} />
                  </button>
                  
                  {activeDropdown === 'status' && (
                    <div className="absolute top-full left-0 mt-1 w-full bg-white border border-slate-200 rounded-xl shadow-xl py-1 z-30 text-xs font-semibold text-slate-700">
                      {["Available", "Assigned", "Under Repair", "Disposed"].map(opt => (
                        <button
                          key={opt}
                          type="button"
                          onClick={() => {
                            setFormStatus(opt);
                            setActiveDropdown(null);
                          }}
                          className={`w-full text-left px-3 py-2 hover:bg-slate-50 transition-colors flex items-center justify-between ${
                            formStatus === opt ? 'bg-blue-50/50 text-blue-600 font-bold' : ''
                          }`}
                        >
                          <span>{opt}</span>
                          {formStatus === opt && <Check className="h-3.5 w-3.5 text-blue-600" />}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Assign To Employee & Date Section */}
              {formStatus === 'Assigned' && (
                <div className="grid grid-cols-2 gap-4 animate-scale-in">
                  {/* Assign to Employee Dropdown */}
                  <div className="relative">
                    <label className="block text-xs font-bold text-slate-500 mb-1">Assign To Employee *</label>
                    <button
                      type="button"
                      onClick={() => setActiveDropdown(activeDropdown === 'assigned' ? null : 'assigned')}
                      className="w-full flex items-center justify-between p-2 border border-slate-200 rounded-xl text-xs bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-left transition-all"
                    >
                      <span>
                        {formAssigned 
                          ? `${employees.find(emp => emp.id === formAssigned)?.name || formAssigned} (${formAssigned})`
                          : 'Select Employee'}
                      </span>
                      <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform ${activeDropdown === 'assigned' ? 'rotate-180' : ''}`} />
                    </button>
                    
                    {activeDropdown === 'assigned' && (
                      <div className="absolute top-full left-0 mt-1 w-full bg-white border border-slate-200 rounded-xl shadow-xl py-1 z-30 max-h-48 overflow-y-auto text-xs font-semibold text-slate-700">
                        {employees.map(emp => (
                          <button
                            key={emp.id}
                            type="button"
                            onClick={() => {
                              setFormAssigned(emp.id);
                              setActiveDropdown(null);
                            }}
                            className={`w-full text-left px-3 py-2 hover:bg-slate-50 transition-colors flex items-center justify-between ${
                              formAssigned === emp.id ? 'bg-blue-50/50 text-blue-600 font-bold' : ''
                            }`}
                          >
                            <span>{emp.name} ({emp.id})</span>
                            {formAssigned === emp.id && <Check className="h-3.5 w-3.5 text-blue-600" />}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Assigned Date Picker */}
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1">Assigned Date</label>
                    <input 
                      type="date" 
                      value={formAssignedDate} 
                      onChange={e => setFormAssignedDate(e.target.value)} 
                      className="w-full p-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
                    />
                  </div>
                </div>
              )}
              <div className="flex gap-3 justify-end pt-4 border-t border-slate-100">
                <button type="button" onClick={() => setIsEditModalOpen(false)} className="px-4 py-2 text-xs font-semibold text-slate-500 hover:bg-slate-50 rounded-xl border border-slate-200">
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md shadow-blue-500/10">
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CRUD View Asset Modal */}
      {isViewModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setIsViewModalOpen(false)} />
          <div className="relative bg-white border border-slate-200 w-full max-w-md rounded-3xl shadow-2xl overflow-hidden p-6 z-10 flex flex-col items-center">
            <button onClick={() => setIsViewModalOpen(false)} className="absolute top-5 right-5 p-1 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700">
              <X className="h-5 w-5" />
            </button>
            <AssetIconBadge type={selectedAsset?.type} className="h-24 w-24 rounded-3xl mt-4" iconSize="h-12 w-12" />
            <h3 className="font-extrabold text-slate-800 text-lg mt-4">{selectedAsset?.brand} {selectedAsset?.model}</h3>
            <span className="text-xs bg-slate-100 text-slate-500 px-3 py-1 rounded-full font-bold mt-1 tracking-wide uppercase">{selectedAsset?.type}</span>

            <div className="w-full mt-6 grid grid-cols-2 gap-x-5 gap-y-3 text-[11px] text-slate-700 overflow-y-auto max-h-[45vh] pr-1">
              <div className="flex flex-col border-b border-slate-100/70 pb-1">
                <span className="font-semibold text-slate-400 text-[10px]">Asset ID</span>
                <span className="font-extrabold text-slate-800 mt-0.5">{selectedAsset?.id}</span>
              </div>
              <div className="flex flex-col border-b border-slate-100/70 pb-1">
                <span className="font-semibold text-slate-400 text-[10px]">Asset Type</span>
                <span className="font-bold text-slate-800 mt-0.5">{selectedAsset?.type}</span>
              </div>
              <div className="flex flex-col border-b border-slate-100/70 pb-1">
                <span className="font-semibold text-slate-400 text-[10px]">Asset Name</span>
                <span className="font-bold text-slate-800 mt-0.5 truncate" title={selectedAsset?.model}>{selectedAsset?.model}</span>
              </div>
              <div className="flex flex-col border-b border-slate-100/70 pb-1">
                <span className="font-semibold text-slate-400 text-[10px]">Brand</span>
                <span className="font-bold text-slate-800 mt-0.5">{selectedAsset?.brand}</span>
              </div>
              <div className="flex flex-col border-b border-slate-100/70 pb-1">
                <span className="font-semibold text-slate-400 text-[10px]">Serial Number</span>
                <span className="font-mono font-bold text-slate-800 mt-0.5 truncate" title={selectedAsset?.serialNumber}>{selectedAsset?.serialNumber}</span>
              </div>
              <div className="flex flex-col border-b border-slate-100/70 pb-1">
                <span className="font-semibold text-slate-400 text-[10px]">Charger Serial</span>
                <span className="font-mono font-bold text-slate-800 mt-0.5 truncate" title={selectedAsset?.chargerSerialNumber}>{selectedAsset?.chargerSerialNumber || 'N/A'}</span>
              </div>
              <div className="flex flex-col border-b border-slate-100/70 pb-1">
                <span className="font-semibold text-slate-400 text-[10px]">Status</span>
                <span className="mt-0.5">
                  <span className={`inline-block px-2 py-0.5 rounded-full text-[9px] font-extrabold border ${
                    selectedAsset?.status === 'Assigned' ? 'bg-blue-50 text-[#1E3A8A] border-blue-200/60' :
                    selectedAsset?.status === 'Available' ? 'bg-emerald-50 text-emerald-600 border-emerald-100/60' :
                    selectedAsset?.status === 'Under Repair' ? 'bg-rose-50 text-rose-600 border-rose-100/60' :
                    'bg-slate-900 text-slate-50 border-slate-900'
                  }`}>{selectedAsset?.status}</span>
                </span>
              </div>
              <div className="flex flex-col border-b border-slate-100/70 pb-1">
                <span className="font-semibold text-slate-400 text-[10px]">Assigned To</span>
                <span className="font-bold text-slate-800 mt-0.5 truncate" title={selectedAsset?.assignedTo ? `${employees.find(e => e.id === selectedAsset.assignedTo)?.name} (${selectedAsset.assignedTo})` : 'None'}>
                  {selectedAsset?.assignedTo 
                    ? `${employees.find(e => e.id === selectedAsset.assignedTo)?.name}`
                    : 'None'
                  }
                </span>
              </div>
              <div className="flex flex-col border-b border-slate-100/70 pb-1">
                <span className="font-semibold text-slate-400 text-[10px]">Condition</span>
                <span className="mt-0.5">
                  <span className={`inline-block px-2 py-0.5 rounded-full text-[9px] font-extrabold border ${
                    (selectedAsset?.condition || 'Good') === 'Good' ? 'bg-emerald-50 text-emerald-600 border-emerald-100/60' :
                    (selectedAsset?.condition || 'Good') === 'Working' ? 'bg-blue-50 text-blue-600 border-blue-100/60' :
                    'bg-rose-50 text-rose-600 border-rose-100/60'
                  }`}>{selectedAsset?.condition || 'Good'}</span>
                </span>
              </div>
              <div className="flex flex-col border-b border-slate-100/70 pb-1">
                <span className="font-semibold text-slate-400 text-[10px]">Purchase Date</span>
                <span className="font-bold text-slate-800 mt-0.5">{selectedAsset?.purchaseDate}</span>
              </div>
              <div className="flex flex-col border-b border-slate-100/70 pb-1">
                <span className="font-semibold text-slate-400 text-[10px]">Warranty Status</span>
                <span className="mt-0.5">
                  {(() => {
                    if (!selectedAsset || !selectedAsset.warrantyEndDate || selectedAsset.warrantyEndDate === 'N/A') {
                      return <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold border bg-slate-100 text-slate-500 border-slate-200">N/A</span>;
                    }
                    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
                    const parts = selectedAsset.warrantyEndDate.split(' ');
                    let warrantyDate = null;
                    if (parts.length === 3) {
                      const day = parseInt(parts[0]);
                      const monthIdx = months.indexOf(parts[1]);
                      const year = parseInt(parts[2]);
                      if (monthIdx !== -1 && !isNaN(day) && !isNaN(year)) {
                        warrantyDate = new Date(year, monthIdx, day);
                      }
                    } else {
                      const parsed = new Date(selectedAsset.warrantyEndDate);
                      if (!isNaN(parsed.getTime())) {
                        warrantyDate = parsed;
                      }
                    }
                    const isWarrantyActive = warrantyDate ? warrantyDate > new Date() : true;
                    return (
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold border ${
                        isWarrantyActive ? 'bg-emerald-50 text-emerald-600 border-emerald-100/60' : 'bg-rose-50 text-rose-600 border-rose-100/60'
                      }`}>{isWarrantyActive ? 'Active' : 'Expired'}</span>
                    );
                  })()}
                </span>
              </div>
              <div className="flex flex-col border-b border-slate-100/70 pb-1">
                <span className="font-semibold text-slate-400 text-[10px]">Assigned Date</span>
                <span className="font-bold text-slate-800 mt-0.5">{selectedAsset?.assignedDate || 'N/A'}</span>
              </div>
            </div>

            <button 
              onClick={() => setIsViewModalOpen(false)}
              className="mt-8 w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-500/10 text-xs transition-all"
            >
              Close Details
            </button>
          </div>
        </div>
      )}

      {/* Custom Confirmation Modal for Deletion */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setDeleteConfirmId(null)} />
          <div className="relative bg-white border border-slate-200 w-full max-w-sm rounded-3xl shadow-2xl p-6 z-10 text-center space-y-4 animate-scale-in">
            <div className="p-3 bg-red-50 text-red-600 rounded-full w-fit mx-auto">
              <AlertTriangle className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-800 text-sm">Delete Asset</h3>
              <p className="text-xs text-slate-500 mt-2">Are you sure you want to delete asset {deleteConfirmId}? This action cannot be undone.</p>
            </div>
            <div className="flex items-center gap-3 pt-2 text-xs">
              <button 
                type="button"
                onClick={() => setDeleteConfirmId(null)}
                className="flex-1 py-2 border border-slate-200 rounded-xl hover:bg-slate-50 font-bold text-slate-500 transition-all cursor-pointer"
              >
                Go Back
              </button>
              <button 
                type="button"
                onClick={handleDelete}
                className="flex-1 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold transition-all shadow-md shadow-red-500/10 cursor-pointer"
              >
                Delete Asset
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Delete Confirmation Modal */}
      {isBulkDeleteOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setIsBulkDeleteOpen(false)} />
          <div className="relative bg-white border border-slate-200 w-full max-w-sm rounded-3xl shadow-2xl p-6 z-10 text-center space-y-4 animate-scale-in">
            <div className="p-3 bg-red-50 text-red-600 rounded-full w-fit mx-auto">
              <AlertTriangle className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-800 text-sm">Bulk Delete Assets</h3>
              <p className="text-xs text-slate-500 mt-2">Are you sure you want to delete <strong>{selectedIds.length}</strong> selected assets? This action cannot be undone.</p>
            </div>
            <div className="flex items-center gap-3 pt-2 text-xs">
              <button 
                type="button"
                onClick={() => setIsBulkDeleteOpen(false)}
                className="flex-1 py-2 border border-slate-200 rounded-xl hover:bg-slate-50 font-bold text-slate-500 transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button 
                type="button"
                onClick={handleBulkDelete}
                className="flex-1 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold transition-all shadow-md shadow-red-500/10 cursor-pointer"
              >
                Confirm Delete ({selectedIds.length})
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Excel Import Modal */}
      <ExcelImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        title="Import Assets from Excel"
        onImportData={handleImportAssets}
        sampleColumns={["Type", "Brand", "Model", "SerialNumber", "Status", "Scope"]}
        sampleData={[
          { Type: "Laptop", Brand: "Dell", Model: "Latitude 5440", SerialNumber: "QITS-SN-9901", Status: "Available", Scope: "Employee" },
          { Type: "Monitor", Brand: "LG", Model: "27 Inch 4K", SerialNumber: "QITS-SN-8802", Status: "Available", Scope: "Organization" },
          { Type: "Mouse", Brand: "Logitech", Model: "MX Master 3S", SerialNumber: "QITS-SN-7703", Status: "Available", Scope: "Employee" }
        ]}
        templateFileName="Assets_Import_Template.xlsx"
      />

      {/* Admin Security Password Verification Modal */}
      <AdminPasswordModal
        isOpen={passAuthModal.isOpen}
        title={passAuthModal.title}
        actionLabel={passAuthModal.actionLabel}
        onClose={() => setPassAuthModal({ isOpen: false, title: '', actionLabel: '', onSuccess: null })}
        onSuccess={passAuthModal.onSuccess || (() => {})}
      />
    </div>
  );
};

export default Assets;
