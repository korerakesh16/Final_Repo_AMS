import React, { useState, useRef, useEffect } from 'react';
import {
  Users,
  UserCheck,
  UserX,
  FolderKey,
  Plus,
  Search,
  Filter,
  Eye,
  Pencil,
  Trash,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Check,
  Upload,
  FileSpreadsheet,
  Download,
  X,
  PlusCircle,
  Briefcase,
  AlertTriangle
} from 'lucide-react';
import { useAssetManager } from '../hooks/useAssetManager';
import MetricCard from '../components/MetricCard';
import Avatar from '../components/Avatar';
import ExcelImportModal from '../components/ExcelImportModal';
import AssetIconBadge from '../components/AssetIcon';
import AdminPasswordModal from '../components/AdminPasswordModal';

const Employees = () => {
  const {
    employees,
    assets,
    addEmployee,
    updateEmployee,
    deleteEmployee,
    showToast
  } = useAssetManager();

  const [passAuthModal, setPassAuthModal] = useState({ isOpen: false, title: '', actionLabel: '', onSuccess: null });

  // Search, Pagination, Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteConfirmEmp, setDeleteConfirmEmp] = useState(null);
  const [deptFilter, setDeptFilter] = useState('All');
  const [isDeptDropdownOpen, setIsDeptDropdownOpen] = useState(false);
  const deptDropdownRef = useRef(null);
  const [statusFilter, setStatusFilter] = useState('All'); // 'All' | 'Active' | 'Inactive'
  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);
  const statusDropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (deptDropdownRef.current && !deptDropdownRef.current.contains(e.target)) {
        setIsDeptDropdownOpen(false);
      }
      if (statusDropdownRef.current && !statusDropdownRef.current.contains(e.target)) {
        setIsStatusDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const [currentPage, setCurrentPage] = useState(1);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const itemsPerPage = 10;

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isDeptModalOpen, setIsDeptModalOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [employeePopup, setEmployeePopup] = useState({ isOpen: false, type: 'Active' });
  const [popupSearchTerm, setPopupSearchTerm] = useState('');
  const [formId, setFormId] = useState('');
  const [formName, setFormName] = useState('');
  const [formDept, setFormDept] = useState('IT');
  const [customDept, setCustomDept] = useState('');
  const [formDesig, setFormDesig] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formStatus, setFormStatus] = useState('Active');
  const [formRole, setFormRole] = useState('Employee');

  const standardDepartments = ["IT", "HR", "Marketing", "Sales", "Finance"];

  // Statistics calculation
  const totalEmployeesCount = employees.length;
  const activeCount = employees.filter(e => e.status === 'Active').length;
  const inactiveCount = employees.filter(e => e.status === 'Inactive').length;

  // Find unique departments list
  const departmentsList = ['All', 'IT', 'HR', 'Marketing', 'Sales', 'Finance'];
  const departmentsCount = departmentsList.length - 1; // subtract 'All'

  // Filter employees
  const filteredEmployees = employees.filter(emp => {
    const assigned = emp.status === 'Inactive' ? [] : assets.filter(a => a.assignedTo === emp.id);
    const searchString = `${emp.id} ${emp.name} ${emp.department} ${emp.designation} ${emp.email} ${emp.phone} ${emp.status} ${assigned.length} assets`.toLowerCase();
    const matchesSearch = searchString.includes(searchTerm.toLowerCase());
    const matchesDept = deptFilter === 'All' ? true : emp.department === deptFilter;
    const matchesStatus = statusFilter === 'All' ? true : emp.status === statusFilter;
    return matchesSearch && matchesDept && matchesStatus;
  });

  const totalPages = Math.ceil(filteredEmployees.length / itemsPerPage);
  const paginatedEmployees = filteredEmployees.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Form handlers
  const handleOpenAddModal = () => {
    setFormId('');
    setFormName('');
    setFormDept('IT');
    setCustomDept('');
    setFormDesig('');
    setFormEmail('');
    setFormPhone('');
    setFormStatus('Active');
    setFormRole('Employee');
    setIsAddModalOpen(true);
  };

  const handleAddSubmit = (e) => {
    e.preventDefault();
    const targetId = formId.trim().toUpperCase();

    // Validation: Check if employee ID already exists
    const idExists = employees.some(emp => emp.id.toLowerCase() === targetId.toLowerCase());
    if (idExists) {
      showToast(`Employee ID "${targetId}" already exists!`, 'error');
      return;
    }

    const finalDept = formDept === 'Other' ? (customDept.trim() || 'Other') : formDept;
    addEmployee({
      id: targetId,
      name: formName,
      department: finalDept,
      designation: formDesig,
      email: formEmail,
      phone: formPhone,
      status: formStatus,
      role: formRole
    });
    setIsAddModalOpen(false);
  };

  const handleOpenEditModal = (emp) => {
    setSelectedEmployee(emp);
    setFormName(emp.name);
    const isStandard = standardDepartments.includes(emp.department);
    setFormDept(isStandard ? emp.department : 'Other');
    setCustomDept(isStandard ? '' : emp.department);
    setFormDesig(emp.designation);
    setFormEmail(emp.email);
    setFormPhone(emp.phone);
    setFormStatus(emp.status);
    setFormRole(emp.role || 'Employee');
    setIsEditModalOpen(true);
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    const finalDept = formDept === 'Other' ? (customDept.trim() || 'Other') : formDept;
    updateEmployee({
      ...selectedEmployee,
      name: formName,
      department: finalDept,
      designation: formDesig,
      email: formEmail,
      phone: formPhone,
      status: formStatus,
      role: formRole
    });
    setIsEditModalOpen(false);
  };

  const handleOpenViewModal = (emp) => {
    setSelectedEmployee(emp);
    setIsViewModalOpen(true);
  };

  const handleDelete = () => {
    if (!deleteConfirmEmp) return;
    const targetEmp = deleteConfirmEmp;
    setDeleteConfirmEmp(null);

    setPassAuthModal({
      isOpen: true,
      title: "Confirm Delete Employee",
      actionLabel: `Delete Employee (${targetEmp.name})`,
      onSuccess: () => {
        deleteEmployee(targetEmp.id);
        showToast('Employee deleted successfully', 'success');
        setPassAuthModal({ isOpen: false, title: '', actionLabel: '', onSuccess: null });
      }
    });
  };

  // Excel Bulk Import Handler for Employees
  const handleImportEmployees = (rawRows) => {
    let successCount = 0;
    const failedRows = [];

    rawRows.forEach((row, idx) => {
      const name = row.Name || row.name || row['Employee Name'] || '';
      const email = row.Email || row.email || '';
      const department = row.Department || row.department || 'General';
      const designation = row.Designation || row.designation || 'Specialist';
      const phone = row.Phone || row.phone || '+91 98765 43210';

      if (!name) {
        failedRows.push({ row: idx + 2, reason: 'Missing Employee Name' });
        return;
      }

      // Check duplicate
      const exists = employees.some(e => e.name.toLowerCase() === String(name).toLowerCase() || (email && e.email.toLowerCase() === String(email).toLowerCase()));
      if (exists) {
        failedRows.push({ row: idx + 2, reason: `Employee "${name}" already exists.` });
        return;
      }

      addEmployee({
        name: String(name),
        email: email ? String(email) : `${String(name).toLowerCase().replace(/[^a-z]/g, '')}@company.com`,
        department: String(department),
        designation: String(designation),
        phone: String(phone),
        status: 'Active'
      });
      successCount++;
    });

    if (successCount > 0) {
      showToast(`Successfully imported ${successCount} employees from Excel!`);
    }

    return {
      totalRows: rawRows.length,
      successCount,
      failedRows
    };
  };

  const handleExportEmployees = () => {
    const headers = "Employee ID,Name,Department,Designation,Email,Phone,Status\n";
    const rows = employees.map(emp => {
      return `"${emp.id}","${emp.name}","${emp.department}","${emp.designation}","${emp.email}","${emp.phone}","${emp.status}"`;
    }).join("\n");

    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Employees_Export_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Employees list exported successfully');
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Breadcrumbs */}
      <div className="flex items-center justify-between">
        <div className="text-xs font-semibold text-slate-400">
          <span className="hover:text-slate-600 cursor-pointer">Dashboard</span>
          <span className="mx-2">&gt;</span>
          <span className="text-slate-600 font-bold">Employees</span>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard 
          icon={Users} 
          title="Total Employees" 
          value={totalEmployeesCount} 
          color="blue" 
          showLink 
          isActive={statusFilter === 'All' && deptFilter === 'All'}
          onClick={() => {
            setStatusFilter('All');
            setDeptFilter('All');
            setCurrentPage(1);
          }} 
        />
        <MetricCard 
          icon={UserCheck} 
          title="Active Employees" 
          value={activeCount} 
          color="green" 
          showLink 
          isActive={statusFilter === 'Active'}
          onClick={() => { 
            setStatusFilter('Active'); 
            setCurrentPage(1);
          }} 
        />
        <MetricCard 
          icon={UserX} 
          title="Inactive Employees" 
          value={inactiveCount} 
          color="orange" 
          showLink 
          isActive={statusFilter === 'Inactive'}
          onClick={() => { 
            setStatusFilter('Inactive'); 
            setCurrentPage(1);
          }} 
        />
        <MetricCard 
          icon={FolderKey} 
          title="Departments" 
          value={departmentsCount} 
          color="purple" 
          showLink 
          isActive={isDeptDropdownOpen || deptFilter !== 'All'}
          onClick={() => {
            setIsDeptDropdownOpen(prev => !prev);
          }} 
        />
      </div>

      {/* Employees Main Panel */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <h3 className="text-base font-bold text-slate-800">
              {deptFilter !== 'All' ? `${deptFilter} Department` : statusFilter !== 'All' ? `${statusFilter} Employees` : 'Employee List'}
            </h3>
            <span className="text-[10px] font-extrabold bg-blue-50 text-blue-700 px-2.5 py-0.5 rounded-full border border-blue-100 whitespace-nowrap shrink-0 inline-flex items-center">
              {filteredEmployees.length} Total
            </span>
            {(statusFilter !== 'All' || deptFilter !== 'All') && (
              <button
                type="button"
                onClick={() => { setStatusFilter('All'); setDeptFilter('All'); setCurrentPage(1); }}
                className="flex items-center gap-1 text-[10px] font-extrabold text-blue-600 bg-blue-50 border border-blue-200/70 px-2.5 py-0.5 rounded-full hover:bg-blue-100 transition-all cursor-pointer shadow-2xs"
              >
                <span>Clear Filter ({deptFilter !== 'All' ? deptFilter : statusFilter})</span>
                <X className="h-3 w-3 text-blue-500 hover:text-blue-700" />
              </button>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
            {/* Search */}
            <div className="relative flex-1 sm:w-64 min-w-[200px]">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Search className="h-4 w-4" />
              </span>
              <input
                type="text"
                value={searchTerm}
                onChange={e => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                placeholder="Search employees..."
                className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-xs bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
              />
            </div>

            {/* Custom Department Filter Dropdown */}
            <div className="relative" ref={deptDropdownRef}>
              <button
                type="button"
                onClick={() => setIsDeptDropdownOpen(!isDeptDropdownOpen)}
                className="flex items-center justify-between gap-1.5 px-3 py-2 border border-slate-200 rounded-xl text-xs bg-slate-50 hover:bg-slate-100 text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-bold cursor-pointer transition-all min-w-[130px]"
              >
                <span>{deptFilter === 'All' ? 'All Departments' : deptFilter}</span>
                <ChevronDown className={`h-3.5 w-3.5 text-slate-400 transition-transform ${isDeptDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {isDeptDropdownOpen && (
                <div className="absolute top-full left-0 mt-1.5 w-48 bg-white border border-slate-200/80 rounded-2xl shadow-xl py-1 z-30 animate-scale-in text-xs font-semibold text-slate-700">
                  {departmentsList.map(dept => (
                    <button
                      key={dept}
                      type="button"
                      onClick={() => {
                        setDeptFilter(dept);
                        setCurrentPage(1);
                        setIsDeptDropdownOpen(false);
                      }}
                      className={`w-full text-left px-3.5 py-2 hover:bg-slate-50 transition-colors flex items-center justify-between ${deptFilter === dept ? 'bg-blue-50/50 text-blue-600 font-bold' : ''
                        }`}
                    >
                      <span>{dept === 'All' ? 'All Departments' : dept}</span>
                      {deptFilter === dept && <Check className="h-3.5 w-3.5 text-blue-600" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Custom Status Filter Dropdown */}
            <div className="relative" ref={statusDropdownRef}>
              <button
                type="button"
                onClick={() => setIsStatusDropdownOpen(!isStatusDropdownOpen)}
                className="flex items-center justify-between gap-1.5 px-3 py-2 border border-slate-200 rounded-xl text-xs bg-slate-50 hover:bg-slate-100 text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-bold cursor-pointer transition-all min-w-[130px]"
              >
                <span>{statusFilter === 'All' ? 'All Statuses' : statusFilter === 'Active' ? 'Active Only' : 'Inactive Only'}</span>
                <ChevronDown className={`h-3.5 w-3.5 text-slate-400 transition-transform ${isStatusDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {isStatusDropdownOpen && (
                <div className="absolute top-full left-0 mt-1.5 w-48 bg-white border border-slate-200/80 rounded-2xl shadow-xl py-1 z-30 animate-scale-in text-xs font-semibold text-slate-700">
                  {['All', 'Active', 'Inactive'].map(status => (
                    <button
                      key={status}
                      type="button"
                      onClick={() => {
                        setStatusFilter(status);
                        setCurrentPage(1);
                        setIsStatusDropdownOpen(false);
                      }}
                      className={`w-full text-left px-3.5 py-2 hover:bg-slate-50 transition-colors flex items-center justify-between ${statusFilter === status ? 'bg-blue-50/50 text-blue-600 font-bold' : ''
                        }`}
                    >
                      <span>{status === 'All' ? 'All Statuses' : status === 'Active' ? 'Active Only' : 'Inactive Only'}</span>
                      {statusFilter === status && <Check className="h-3.5 w-3.5 text-blue-600" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Excel Import Trigger */}
            <div className="relative group">
              <button
                type="button"
                onClick={() => setIsImportModalOpen(true)}
                className="h-8 w-8 rounded-full border border-emerald-200 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 flex items-center justify-center transition-all cursor-pointer shadow-xs shrink-0"
              >
                <Download className="h-4 w-4 text-emerald-600" />
              </button>
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-0.5 bg-slate-800 text-white text-[10px] rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap font-bold z-30 shadow-md">
                Import Employees
              </div>
            </div>

            {/* Excel Export Trigger */}
            <div className="relative group">
              <button
                type="button"
                onClick={handleExportEmployees}
                className="h-8 w-8 rounded-full border border-slate-200 hover:bg-slate-50 text-slate-600 flex items-center justify-center transition-all cursor-pointer shadow-xs shrink-0"
              >
                <Upload className="h-4 w-4 text-slate-600" />
              </button>
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-0.5 bg-slate-800 text-white text-[10px] rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap font-bold z-30 shadow-md">
                Export Employees
              </div>
            </div>

            {/* Add Employee Trigger */}
            <div className="relative group">
              <button
                type="button"
                onClick={handleOpenAddModal}
                className="h-8 w-8 rounded-full bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center transition-all shadow-md shadow-blue-500/10 hover:scale-105 active:scale-95 cursor-pointer shrink-0"
              >
                <Plus className="h-4 w-4" />
              </button>
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-0.5 bg-slate-800 text-white text-[10px] rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap font-bold z-30 shadow-md">
                Add Employee
              </div>
            </div>
          </div>
        </div>

        {/* Employee Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                <th className="pb-3 pr-2">Employee ID</th>
                <th className="pb-3 px-3">Name</th>
                <th className="pb-3 px-3">Department</th>
                <th className="pb-3 px-3">Designation</th>
                <th className="pb-3 px-3">Email</th>
                <th className="pb-3 px-3">Phone</th>
                <th className="pb-3 px-3 text-center">Assets</th>
                <th className="pb-3 px-3 text-center">Status</th>
                <th className="pb-3 pl-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-[11px] text-slate-700 bg-white">
              {paginatedEmployees.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-slate-400">
                    No matching employees found.
                  </td>
                </tr>
              ) : (
                paginatedEmployees.map((emp) => {
                  const assignedAssets = emp.status === 'Inactive' ? [] : assets.filter(a => a.assignedTo === emp.id);
                  return (
                    <tr
                      key={emp.id}
                      onClick={() => handleOpenViewModal(emp)}
                      className="hover:bg-slate-50/50 transition-all cursor-pointer font-medium"
                    >
                      <td className="py-2.5 pr-2 font-bold text-slate-500">
                        {emp.id}
                      </td>
                      <td className="py-2.5 px-3 font-bold text-slate-800">
                        <div className="flex items-center gap-2">
                          <Avatar name={emp.name} className="h-7 w-7 rounded-xl ring-2 ring-slate-100 shrink-0" />
                          <span className="truncate max-w-[120px]" title={emp.name}>{emp.name}</span>
                        </div>
                      </td>
                      <td className="py-2.5 px-3 text-slate-600 truncate max-w-[100px]" title={emp.department}>{emp.department}</td>
                      <td className="py-2.5 px-3 text-slate-600 truncate max-w-[120px]" title={emp.designation}>{emp.designation}</td>
                      <td className="py-2.5 px-3 text-slate-500 truncate max-w-[140px]" title={emp.email}>{emp.email}</td>
                      <td className="py-2.5 px-3 text-slate-500 font-semibold whitespace-nowrap">{emp.phone}</td>
                      <td className="py-2.5 px-3 text-center" onClick={(e) => e.stopPropagation()}>
                        <span
                          onClick={(e) => { e.stopPropagation(); handleOpenViewModal(emp); }}
                          className="px-2 py-0.5 rounded-lg text-[10px] font-bold text-blue-600 bg-blue-50 cursor-pointer hover:bg-blue-100 transition-all"
                        >
                          {assignedAssets.length}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold ${emp.status === 'Active' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
                          }`}>
                          {emp.status}
                        </span>
                      </td>
                      <td className="py-2.5 pl-3 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={(e) => { e.stopPropagation(); handleOpenViewModal(emp); }}
                            className="p-1 hover:bg-slate-100 rounded-lg text-blue-600 transition-all cursor-pointer"
                            title="View"
                          >
                            <Eye className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); handleOpenEditModal(emp); }}
                            className="p-1 hover:bg-slate-100 rounded-lg text-blue-600 transition-all cursor-pointer"
                            title="Edit"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setDeleteConfirmEmp({ id: emp.id, name: emp.name });
                            }}
                            className="p-1 hover:bg-red-50 rounded-lg text-red-500 transition-all cursor-pointer"
                            title="Delete"
                          >
                            <Trash className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Active/Inactive Employees Pop-up Modal */}
      {employeePopup.isOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[2rem] border border-slate-100 shadow-2xl w-full max-w-4xl max-h-[85vh] flex flex-col overflow-hidden animate-fade-in relative">
            
            {/* Header */}
            <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className={`p-2.5 rounded-xl ${
                  employeePopup.type === 'Active' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                }`}>
                  {employeePopup.type === 'Active' ? <UserCheck className="h-5 w-5" /> : <UserX className="h-5 w-5" />}
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-800">
                    {employeePopup.type === 'Active' ? 'Active Employees' : 'Inactive Employees'}
                  </h3>
                  <p className="text-xs text-slate-400 font-semibold mt-0.5">
                    {employeePopup.type === 'Active' 
                      ? 'Current staff members registered in the organization'
                      : 'Former employees who went out of the organization (no active assets)'}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 w-full md:w-auto">
                <div className="relative flex-1 md:w-64 min-w-[200px]">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Search className="h-4 w-4" />
                  </span>
                  <input
                    type="text"
                    placeholder="Search by ID or Name..."
                    value={popupSearchTerm}
                    onChange={(e) => setPopupSearchTerm(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-xs bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-semibold"
                  />
                </div>
                <button 
                  onClick={() => setEmployeePopup({ isOpen: false, type: 'Active' })}
                  className="p-2 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-all cursor-pointer shrink-0"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Content Table */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="overflow-x-auto border border-slate-100 rounded-2xl bg-slate-50/50">
                <table className="w-full text-left border-collapse text-xs min-w-[800px]">
                  <thead>
                    <tr className="bg-slate-100 text-slate-600 font-extrabold uppercase tracking-wider border-b border-slate-100 whitespace-nowrap">
                      <th className="py-3 px-4">Employee</th>
                      <th className="py-3 px-4">Employee ID</th>
                      <th className="py-3 px-4">Department</th>
                      <th className="py-3 px-4">Designation</th>
                      <th className="py-3 px-4">Contact Info</th>
                      {employeePopup.type === 'Active' && <th className="py-3 px-4 text-center">Assigned Assets</th>}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {employees
                      .filter(emp => emp.status === employeePopup.type)
                      .filter(emp => {
                        if (!popupSearchTerm) return true;
                        const term = popupSearchTerm.toLowerCase();
                        return (
                          emp.name.toLowerCase().includes(term) ||
                          emp.id.toLowerCase().includes(term)
                        );
                      })
                      .map(emp => {
                        const assignedAssets = assets.filter(a => a.assignedTo === emp.id);
                        return (
                          <tr key={emp.id} className="hover:bg-white transition-all whitespace-nowrap">
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-3">
                                <Avatar name={emp.name} className="h-8 w-8 rounded-lg shrink-0" />
                                <span className="font-bold text-slate-800">{emp.name}</span>
                              </div>
                            </td>
                            <td className="py-3 px-4 text-slate-500 font-mono font-semibold">{emp.id}</td>
                            <td className="py-3 px-4 font-semibold text-slate-600">{emp.department}</td>
                            <td className="py-3 px-4 text-slate-500 font-semibold">{emp.designation}</td>
                            <td className="py-3 px-4">
                              <div className="text-[10px] space-y-0.5">
                                <p className="text-slate-600 font-semibold">{emp.email}</p>
                                <p className="text-slate-400 font-semibold">{emp.phone}</p>
                              </div>
                            </td>
                            {employeePopup.type === 'Active' && (
                              <td className="py-3 px-4 text-center">
                                {assignedAssets.length > 0 ? (
                                  <span className="inline-flex items-center justify-center font-bold px-2 py-0.5 rounded-md bg-blue-50 text-blue-600 border border-blue-100 text-[10px]">
                                    {assignedAssets.length} {assignedAssets.length === 1 ? 'Asset' : 'Assets'}
                                  </span>
                                ) : (
                                  <span className="text-slate-400 font-semibold text-[10px]">None</span>
                                )}
                              </td>
                            )}
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setEmployeePopup({ isOpen: false, type: 'Active' })}
                className="py-2 px-5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Departments Overview Pop-up Modal */}
      {isDeptModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[2rem] border border-slate-100 shadow-2xl w-full max-w-3xl max-h-[85vh] flex flex-col overflow-hidden animate-fade-in relative">
            {/* Header */}
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-violet-50 text-violet-600">
                  <FolderKey className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-800">Departments Overview</h3>
                  <p className="text-xs text-slate-400 font-semibold mt-0.5">
                    Department-wise employee headcount & staff distribution
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setIsDeptModalOpen(false)}
                className="p-2 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-all cursor-pointer shrink-0"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Content Table */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="overflow-x-auto border border-slate-100 rounded-2xl bg-slate-50/50">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-100 text-slate-600 font-extrabold uppercase tracking-wider border-b border-slate-100 whitespace-nowrap">
                      <th className="py-3 px-4">Department Name</th>
                      <th className="py-3 px-4 text-center">Total Staff</th>
                      <th className="py-3 px-4 text-center">Active</th>
                      <th className="py-3 px-4 text-center">Inactive</th>
                      <th className="py-3 px-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {Array.from(new Set(employees.map(e => e.department || 'General'))).concat(['IT', 'HR', 'Marketing', 'Sales', 'Finance'])
                      .filter((v, i, a) => a.indexOf(v) === i)
                      .map(dept => {
                        const deptEmps = employees.filter(e => e.department === dept);
                        const activeDept = deptEmps.filter(e => e.status === 'Active').length;
                        const inactiveDept = deptEmps.filter(e => e.status === 'Inactive').length;
                        return (
                          <tr key={dept} className="hover:bg-white transition-all">
                            <td className="py-3 px-4 font-bold text-slate-800 flex items-center gap-2">
                              <Briefcase className="h-4 w-4 text-violet-500" />
                              <span>{dept}</span>
                            </td>
                            <td className="py-3 px-4 text-center font-extrabold text-slate-700">{deptEmps.length}</td>
                            <td className="py-3 px-4 text-center">
                              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-100">
                                {activeDept}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-center">
                              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-600 border border-rose-100">
                                {inactiveDept}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-right">
                              <button
                                type="button"
                                onClick={() => {
                                  setDeptFilter(dept);
                                  setStatusFilter('All');
                                  setCurrentPage(1);
                                  setIsDeptModalOpen(false);
                                }}
                                className="px-3 py-1 bg-violet-600 hover:bg-violet-700 text-white font-bold text-[10px] rounded-lg transition-all cursor-pointer shadow-xs"
                              >
                                View Staff
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setIsDeptModalOpen(false)}
                className="py-2 px-5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

        {/* Pagination controls */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-slate-100 pt-4 text-xs font-semibold text-slate-500">
            <span>
              Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredEmployees.length)} of {filteredEmployees.length} entries
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="p-2 border border-slate-200 hover:bg-slate-50 rounded-xl disabled:opacity-40 transition-all"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              {(() => {
                const pages = [];
                const maxVisible = 5;
                if (totalPages <= maxVisible) {
                  for (let i = 1; i <= totalPages; i++) pages.push(i);
                } else {
                  pages.push(1);
                  let start = Math.max(2, currentPage - 1);
                  let end = Math.min(totalPages - 1, currentPage + 1);
                  if (currentPage <= 2) {
                    end = 4;
                  } else if (currentPage >= totalPages - 1) {
                    start = totalPages - 3;
                  }
                  if (start > 2) pages.push('...');
                  for (let i = start; i <= end; i++) pages.push(i);
                  if (end < totalPages - 1) pages.push('...');
                  pages.push(totalPages);
                }
                return pages.map((p, idx) => (
                  p === '...' ? (
                    <span key={`dots-${idx}`} className="px-2 text-slate-400 font-bold">...</span>
                  ) : (
                    <button
                      key={p}
                      onClick={() => setCurrentPage(p)}
                      className={`h-8 w-8 rounded-xl border text-xs font-bold transition-all cursor-pointer ${currentPage === p
                          ? 'bg-blue-600 border-blue-600 text-white shadow-md shadow-blue-500/20'
                          : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                        }`}
                    >
                      {p}
                    </button>
                  )
                ));
              })()}
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="p-2 border border-slate-200 hover:bg-slate-50 rounded-xl disabled:opacity-40 transition-all"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* CRUD Add Employee Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setIsAddModalOpen(false)} />
          <div className="relative bg-white border border-slate-200 w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden p-6 z-10">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
              <h3 className="font-bold text-slate-800">Add New Employee</h3>
              <button onClick={() => setIsAddModalOpen(false)} className="p-1 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleAddSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Employee ID *</label>
                  <input
                    type="text"
                    required
                    value={formId}
                    onChange={e => setFormId(e.target.value)}
                    placeholder="e.g. EMP008"
                    className="w-full p-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={e => setFormName(e.target.value)}
                    placeholder="e.g. Rahul Sharma"
                    className="w-full p-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Department *</label>
                  <select
                    value={formDept}
                    onChange={e => setFormDept(e.target.value)}
                    className="w-full p-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
                  >
                    {[...standardDepartments, "Other"].map(d => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                  {formDept === 'Other' && (
                    <input
                      type="text"
                      required
                      value={customDept}
                      onChange={e => setCustomDept(e.target.value)}
                      placeholder="Enter custom department name..."
                      className="w-full mt-2 p-2 border border-blue-200 bg-blue-50/30 rounded-xl text-xs focus:ring-2 focus:ring-blue-500/20 focus:outline-none font-semibold text-blue-900 animate-fade-in"
                    />
                  )}
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Role *</label>
                  <select
                    value={formRole}
                    onChange={e => setFormRole(e.target.value)}
                    className="w-full p-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500/20 focus:outline-none font-semibold text-slate-700"
                  >
                    <option value="Employee">Employee</option>
                    <option value="Admin">Admin</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Designation *</label>
                  <input
                    type="text"
                    required
                    value={formDesig}
                    onChange={e => setFormDesig(e.target.value)}
                    placeholder="e.g. Network Engineer"
                    className="w-full p-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Email Address *</label>
                  <input
                    type="email"
                    required
                    value={formEmail}
                    onChange={e => setFormEmail(e.target.value)}
                    placeholder="e.g. rahul@company.com"
                    className="w-full p-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Phone Number *</label>
                  <input
                    type="text"
                    required
                    value={formPhone}
                    onChange={e => setFormPhone(e.target.value)}
                    placeholder="e.g. +91 91234 56789"
                    className="w-full p-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Status</label>
                  <select
                    value={formStatus}
                    onChange={e => setFormStatus(e.target.value)}
                    className="w-full p-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-3 justify-end pt-4 border-t border-slate-100">
                <button type="button" onClick={() => setIsAddModalOpen(false)} className="px-4 py-2 text-xs font-semibold text-slate-500 hover:bg-slate-50 rounded-xl border border-slate-200">
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md shadow-blue-500/10">
                  Save Employee
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CRUD Edit Employee Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setIsEditModalOpen(false)} />
          <div className="relative bg-white border border-slate-200 w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden p-6 z-10">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
              <h3 className="font-bold text-slate-800">Edit Employee {selectedEmployee?.id}</h3>
              <button onClick={() => setIsEditModalOpen(false)} className="p-1 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1">Employee ID</label>
                  <input
                    type="text"
                    disabled
                    value={selectedEmployee?.id || ''}
                    className="w-full p-2 border border-slate-100 bg-slate-50/80 rounded-xl text-xs text-slate-400 font-semibold cursor-not-allowed focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={e => setFormName(e.target.value)}
                    className="w-full p-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Department *</label>
                  <select
                    value={formDept}
                    onChange={e => setFormDept(e.target.value)}
                    className="w-full p-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
                  >
                    {[...standardDepartments, "Other"].map(d => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                  {formDept === 'Other' && (
                    <input
                      type="text"
                      required
                      value={customDept}
                      onChange={e => setCustomDept(e.target.value)}
                      placeholder="Enter custom department name..."
                      className="w-full mt-2 p-2 border border-blue-200 bg-blue-50/30 rounded-xl text-xs focus:ring-2 focus:ring-blue-500/20 focus:outline-none font-semibold text-blue-900 animate-fade-in"
                    />
                  )}
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Role *</label>
                  <select
                    value={formRole}
                    onChange={e => setFormRole(e.target.value)}
                    className="w-full p-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500/20 focus:outline-none font-semibold text-slate-700"
                  >
                    <option value="Employee">Employee</option>
                    <option value="Admin">Admin</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Designation *</label>
                  <input
                    type="text"
                    required
                    value={formDesig}
                    onChange={e => setFormDesig(e.target.value)}
                    className="w-full p-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Email Address *</label>
                  <input
                    type="email"
                    required
                    value={formEmail}
                    onChange={e => setFormEmail(e.target.value)}
                    className="w-full p-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Phone Number *</label>
                  <input
                    type="text"
                    required
                    value={formPhone}
                    onChange={e => setFormPhone(e.target.value)}
                    className="w-full p-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Status</label>
                  <select
                    value={formStatus}
                    onChange={e => setFormStatus(e.target.value)}
                    className="w-full p-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>

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

      {/* CRUD View Employee Details Modal */}
      {isViewModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setIsViewModalOpen(false)} />
          <div className="relative bg-white border border-slate-200 w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden p-6 z-10 flex flex-col">
            <button onClick={() => setIsViewModalOpen(false)} className="absolute top-5 right-5 p-1 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700">
              <X className="h-5 w-5" />
            </button>
            <div className="flex items-center gap-4 border-b border-slate-100 pb-5 mb-5">
              <Avatar name={selectedEmployee?.name} className="h-16 w-16 rounded-2xl border border-slate-100" textSize="text-base" />
              <div>
                <h3 className="font-extrabold text-slate-800 text-base leading-tight">{selectedEmployee?.name}</h3>
                <p className="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
                  <Briefcase className="h-3 w-3" />
                  <span>{selectedEmployee?.designation} &bull; {selectedEmployee?.department}</span>
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Assigned Equipment</h4>
              <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
                {assets.filter(a => a.assignedTo === selectedEmployee?.id).length === 0 ? (
                  <p className="text-xs text-slate-400 text-center py-4 bg-slate-50 rounded-2xl border border-slate-100">
                    No active assets currently assigned to this employee.
                  </p>
                ) : (
                  assets.filter(a => a.assignedTo === selectedEmployee?.id).map(asset => (
                    <div key={asset.id} className="p-3 border border-slate-100 rounded-2xl flex items-center justify-between hover:bg-slate-50/50 transition-all">
                      <div className="flex items-center gap-3">
                        <AssetIconBadge type={asset.type} className="h-8 w-8 rounded-lg shrink-0" iconSize="h-4 w-4" />
                        <div>
                          <p className="text-xs font-bold text-slate-800">{asset.brand} {asset.model}</p>
                          <p className="text-[10px] text-slate-400 font-mono mt-0.5">{asset.id} &bull; {asset.serialNumber}</p>
                        </div>
                      </div>
                      <span className="text-[10px] bg-slate-100 text-slate-500 font-bold px-2 py-0.5 rounded-md uppercase">
                        {asset.type}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="w-full mt-6 pt-4 border-t border-slate-100 text-xs text-slate-400 space-y-2 leading-relaxed">
              <div className="flex justify-between">
                <span>Employee ID</span>
                <span className="font-bold text-slate-700">{selectedEmployee?.id}</span>
              </div>
              <div className="flex justify-between">
                <span>Email</span>
                <span className="font-bold text-slate-700">{selectedEmployee?.email}</span>
              </div>
              <div className="flex justify-between">
                <span>Phone</span>
                <span className="font-bold text-slate-700">{selectedEmployee?.phone}</span>
              </div>
              <div className="flex justify-between">
                <span>Joining Date</span>
                <span className="font-bold text-slate-700">{selectedEmployee?.joiningDate}</span>
              </div>
            </div>

            <button
              onClick={() => setIsViewModalOpen(false)}
              className="mt-6 w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-500/10 text-xs transition-all"
            >
              Close Record
            </button>
          </div>
        </div>
      )}

      {/* Custom Confirmation Modal for Deletion */}
      {deleteConfirmEmp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setDeleteConfirmEmp(null)} />
          <div className="relative bg-white border border-slate-200 w-full max-w-sm rounded-3xl shadow-2xl p-6 z-10 text-center space-y-4 animate-scale-in">
            <div className="p-3 bg-red-50 text-red-600 rounded-full w-fit mx-auto">
              <AlertTriangle className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-800 text-sm">Delete Employee Record</h3>
              <p className="text-xs text-slate-500 mt-2">Are you sure you want to delete the employee record for {deleteConfirmEmp.name}? This action cannot be undone.</p>
            </div>
            <div className="flex items-center gap-3 pt-2 text-xs">
              <button
                type="button"
                onClick={() => setDeleteConfirmEmp(null)}
                className="flex-1 py-2 border border-slate-200 rounded-xl hover:bg-slate-50 font-bold text-slate-500 transition-all cursor-pointer"
              >
                Go Back
              </button>
              <button
                type="button"
                onClick={handleDelete}
                className="flex-1 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold transition-all shadow-md shadow-red-500/10 cursor-pointer"
              >
                Delete Record
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Admin Security Password Verification Modal */}
      <AdminPasswordModal
        isOpen={passAuthModal.isOpen}
        title={passAuthModal.title}
        actionLabel={passAuthModal.actionLabel}
        onClose={() => setPassAuthModal({ isOpen: false, title: '', actionLabel: '', onSuccess: null })}
        onSuccess={passAuthModal.onSuccess || (() => { })}
      />

      {/* Excel Import Modal for Employees */}
      <ExcelImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        title="Import Employees from Excel"
        onImportData={handleImportEmployees}
        sampleColumns={["Name", "Department", "Designation", "Email", "Phone"]}
        sampleData={[
          { Name: "Sanjay Singhania", Department: "IT Operations", Designation: "Senior Systems Engineer", Email: "sanjay.s@company.com", Phone: "+91 98765 11223" },
          { Name: "Priyanka Chopra", Department: "Human Resources", Designation: "HR Lead", Email: "priyanka.c@company.com", Phone: "+91 98765 44556" }
        ]}
        templateFileName="Employees_Import_Template.xlsx"
      />
    </div>
  );
};

export default Employees;
