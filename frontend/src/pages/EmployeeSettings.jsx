import React, { useState, useEffect } from 'react';
import { 
  Mail, 
  Phone, 
  Briefcase, 
  User as UserIcon, 
  Calendar, 
  MapPin, 
  Pencil, 
  ShieldAlert, 
  Lock, 
  Eye, 
  EyeOff, 
  Camera, 
  Save, 
  X, 
  CheckCircle, 
  Shield,
  Info
} from 'lucide-react';
import { useAssetManager } from '../hooks/useAssetManager';
import Avatar from '../components/Avatar';

const EmployeeSettings = () => {
  const { currentUser, updateEmployee, changePassword, showToast } = useAssetManager();

  // Personal Information editing state
  const [isEditing, setIsEditing] = useState(false);
  const [fullName, setFullName] = useState(currentUser?.name || '');
  const [username, setUsername] = useState(currentUser?.username || '');
  const [email, setEmail] = useState(currentUser?.email || '');
  const [phone, setPhone] = useState(currentUser?.phone || '');
  const [dept, setDept] = useState(currentUser?.department || '');
  const [designation, setDesignation] = useState(currentUser?.designation || '');
  const [location, setLocation] = useState(currentUser?.location || 'Hyderabad, India');

  // Sync inputs with session data when loaded
  useEffect(() => {
    if (currentUser) {
      setFullName(currentUser.name);
      setUsername(currentUser.username || '');
      setEmail(currentUser.email);
      setPhone(currentUser.phone || '');
      setDept(currentUser.department || '');
      setDesignation(currentUser.designation || '');
      setLocation(currentUser.location || 'Hyderabad, India');
    }
  }, [currentUser]);

  // Change Password state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);

  // Redirect guard (must be after all hooks are declared)
  if (!currentUser) return null;

  const handleSaveChanges = (e) => {
    e.preventDefault();
    
    if (!fullName.trim() || !email.trim()) {
      showToast("Name and Email are required fields.", "error");
      return;
    }

    const updatedInfo = {
      ...currentUser,
      name: fullName.trim(),
      username: username.trim(),
      email: email.trim(),
      phone: phone.trim(),
      department: dept,
      designation: designation,
      location: location.trim()
    };

    updateEmployee(updatedInfo);
    setIsEditing(false);
    showToast("Profile information updated successfully!");
  };

  const handleCancel = () => {
    // Reset to current user state
    setFullName(currentUser.name);
    setUsername(currentUser.username || '');
    setEmail(currentUser.email);
    setPhone(currentUser.phone || '');
    setDept(currentUser.department || '');
    setDesignation(currentUser.designation || '');
    setLocation(currentUser.location || 'Hyderabad, India');
    setIsEditing(false);
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    
    if (!currentPassword) {
      showToast("Please enter your current password.", "error");
      return;
    }

    if (newPassword.length < 8) {
      showToast("New password must be at least 8 characters long.", "error");
      return;
    }

    if (newPassword !== confirmPassword) {
      showToast("New passwords do not match.", "error");
      return;
    }

    const success = await changePassword(currentPassword, newPassword);
    if (success) {
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    }
  };

  return (
    <div className="space-y-8 animate-fade-in font-sans">
      
      {/* Breadcrumbs */}
      <div className="text-xs font-semibold text-slate-400">
        <span className="hover:text-slate-600 cursor-pointer">Home</span>
        <span className="mx-2">&gt;</span>
        <span className="text-slate-600 font-bold">Settings</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* LEFT COLUMN: Profile Overview Card */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white border border-slate-200 rounded-[2rem] p-6 shadow-sm flex flex-col items-center text-center space-y-5">
            <h3 className="text-xs font-bold text-slate-800 self-start">Profile Overview</h3>
            
            {/* Avatar wrapper with edit initials */}
            <div className="relative group">
              <Avatar 
                name={currentUser.name} 
                className="h-32 w-32 rounded-full border-4 border-slate-50 shadow-md animate-fade-in" 
                textSize="text-3xl" 
              />
            </div>

            <div>
              <h4 className="text-sm font-black text-slate-800">{currentUser.name}</h4>
              <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-wider">{currentUser.designation}</p>
            </div>

            {/* Profile fields details grid */}
            <div className="w-full pt-4 border-t border-slate-100 text-left space-y-3.5 text-xs text-slate-700">
              
              {/* Field 1: Email */}
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-50 text-blue-600 rounded-xl shrink-0">
                  <Mail className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wide">Email</p>
                  <p className="text-[11px] font-semibold text-slate-700 mt-0.5 truncate">{currentUser.email}</p>
                </div>
              </div>

              {/* Field 2: Phone */}
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-50 text-blue-600 rounded-xl shrink-0">
                  <Phone className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wide">Phone</p>
                  <p className="text-[11px] font-semibold text-slate-700 mt-0.5">{currentUser.phone || '+91 98765 43210'}</p>
                </div>
              </div>

              {/* Field 3: Department */}
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-50 text-blue-600 rounded-xl shrink-0">
                  <Briefcase className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wide">Department</p>
                  <p className="text-[11px] font-semibold text-slate-700 mt-0.5">{currentUser.department || 'IT Development'}</p>
                </div>
              </div>

              {/* Field 4: Employee ID */}
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-50 text-blue-600 rounded-xl shrink-0">
                  <UserIcon className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wide">Employee ID</p>
                  <p className="text-[11px] font-semibold text-slate-700 mt-0.5">{currentUser.id}</p>
                </div>
              </div>

              {/* Field 5: Joining Date */}
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-50 text-blue-600 rounded-xl shrink-0">
                  <Calendar className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wide">Joining Date</p>
                  <p className="text-[11px] font-semibold text-slate-700 mt-0.5">{currentUser.joiningDate || '10 May 2024'}</p>
                </div>
              </div>

              {/* Field 6: Location */}
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-50 text-blue-600 rounded-xl shrink-0">
                  <MapPin className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wide">Location</p>
                  <p className="text-[11px] font-semibold text-slate-700 mt-0.5">{currentUser.location || 'Hyderabad, India'}</p>
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Personal Information & Password Modification (Span 2) */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Personal Information card */}
          <div className="bg-white border border-slate-200 rounded-[2rem] p-6 shadow-sm space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-800">Personal Information</h3>
              {!isEditing ? (
                <button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  className="flex items-center gap-1 py-1.5 px-3 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 font-bold text-[10px] uppercase tracking-wide transition-all shadow-sm"
                >
                  <Pencil className="h-3.5 w-3.5" />
                  <span>Edit</span>
                </button>
              ) : (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="flex items-center gap-1 py-1.5 px-3 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-500 font-bold text-[10px] uppercase tracking-wide transition-all"
                  >
                    <X className="h-3.5 w-3.5" />
                    <span>Cancel</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveChanges}
                    className="flex items-center gap-1 py-1.5 px-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-[10px] uppercase tracking-wide rounded-lg transition-all shadow-md shadow-blue-500/10"
                  >
                    <Save className="h-3.5 w-3.5" />
                    <span>Save Changes</span>
                  </button>
                </div>
              )}
            </div>

            {/* Input grid */}
            <form onSubmit={handleSaveChanges} className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              
              <div className="space-y-1">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider pl-1">Full Name</label>
                <input
                  type="text"
                  disabled={!isEditing}
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  className={`w-full p-2.5 border rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:outline-none font-semibold ${
                    isEditing 
                      ? 'border-slate-300 text-slate-700 bg-white' 
                      : 'border-slate-200 text-slate-500 bg-slate-50/50 cursor-not-allowed'
                  }`}
                />
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider pl-1">Username</label>
                <input
                  type="text"
                  disabled={!isEditing}
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  className={`w-full p-2.5 border rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:outline-none font-semibold ${
                    isEditing 
                      ? 'border-slate-300 text-slate-700 bg-white' 
                      : 'border-slate-200 text-slate-500 bg-slate-50/50 cursor-not-allowed'
                  }`}
                />
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider pl-1">Email Address</label>
                <input
                  type="email"
                  disabled={!isEditing}
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className={`w-full p-2.5 border rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:outline-none font-semibold ${
                    isEditing 
                      ? 'border-slate-300 text-slate-700 bg-white' 
                      : 'border-slate-200 text-slate-500 bg-slate-50/50 cursor-not-allowed'
                  }`}
                />
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider pl-1">Phone Number</label>
                <input
                  type="text"
                  disabled={!isEditing}
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  className={`w-full p-2.5 border rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:outline-none font-semibold ${
                    isEditing 
                      ? 'border-slate-300 text-slate-700 bg-white' 
                      : 'border-slate-200 text-slate-500 bg-slate-50/50 cursor-not-allowed'
                  }`}
                />
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider pl-1">Department</label>
                <select
                  disabled
                  value={dept}
                  className="w-full p-2.5 border border-slate-200 rounded-xl text-xs bg-slate-50/50 text-slate-500 font-semibold cursor-not-allowed"
                >
                  <option value={dept}>{dept}</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider pl-1">Designation</label>
                <select
                  disabled
                  value={designation}
                  className="w-full p-2.5 border border-slate-200 rounded-xl text-xs bg-slate-50/50 text-slate-500 font-semibold cursor-not-allowed"
                >
                  <option value={designation}>{designation}</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider pl-1">Employee ID</label>
                <input
                  type="text"
                  disabled
                  value={currentUser.id}
                  className="w-full p-2.5 border border-slate-200 rounded-xl text-xs bg-slate-50 text-slate-500 font-semibold cursor-not-allowed"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider pl-1">Joining Date</label>
                <input
                  type="text"
                  disabled
                  value={currentUser.joiningDate || '10 May 2024'}
                  className="w-full p-2.5 border border-slate-200 rounded-xl text-xs bg-slate-50 text-slate-450 font-semibold cursor-not-allowed"
                />
              </div>

              <div className="space-y-1 md:col-span-2">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider pl-1">Location</label>
                <input
                  type="text"
                  disabled={!isEditing}
                  value={location}
                  onChange={e => setLocation(e.target.value)}
                  className={`w-full p-2.5 border rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:outline-none font-semibold ${
                    isEditing 
                      ? 'border-slate-300 text-slate-700 bg-white' 
                      : 'border-slate-200 text-slate-500 bg-slate-50/50 cursor-not-allowed'
                  }`}
                />
              </div>

            </form>
          </div>

          {/* Change Password Card */}
          <div className="bg-white border border-slate-200 rounded-[2rem] p-6 shadow-sm space-y-5">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-blue-50 text-blue-600 rounded-xl shrink-0">
                <Shield className="h-4.5 w-4.5" />
              </div>
              <h3 className="text-xs font-bold text-slate-800">Change Password</h3>
            </div>

            <form onSubmit={handleUpdatePassword} className="space-y-4 text-xs">
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider pl-1">Current Password</label>
                  <div className="relative">
                    <input
                      type={showCurrentPass ? 'text' : 'password'}
                      value={currentPassword}
                      onChange={e => setCurrentPassword(e.target.value)}
                      placeholder="Enter current password"
                      className="w-full p-2.5 pr-9 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:outline-none text-slate-700 font-semibold"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPass(!showCurrentPass)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-450 hover:text-slate-650"
                    >
                      {showCurrentPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider pl-1">New Password</label>
                  <div className="relative">
                    <input
                      type={showNewPass ? 'text' : 'password'}
                      value={newPassword}
                      onChange={e => setNewPassword(e.target.value)}
                      placeholder="Enter new password"
                      className="w-full p-2.5 pr-9 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:outline-none text-slate-700 font-semibold"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPass(!showNewPass)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-450 hover:text-slate-650"
                    >
                      {showNewPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider pl-1">Confirm New Password</label>
                  <div className="relative">
                    <input
                      type={showConfirmPass ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={e => setConfirmPassword(e.target.value)}
                      placeholder="Confirm new password"
                      className="w-full p-2.5 pr-9 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:outline-none text-slate-700 font-semibold"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPass(!showConfirmPass)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-450 hover:text-slate-650"
                    >
                      {showConfirmPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

              </div>

              {/* Password Requirement Checklist Banner */}
              <div className="p-4 bg-blue-50/50 border border-blue-100 rounded-2xl space-y-2 text-[11px] text-blue-900 leading-normal">
                <p className="font-bold flex items-center gap-1.5">
                  <Info className="h-4 w-4 text-blue-600 shrink-0" />
                  <span>Password Requirements:</span>
                </p>
                <ul className="list-disc pl-5 text-[10px] text-blue-700/90 font-medium space-y-0.5">
                  <li>At least 8 characters long</li>
                  <li>Include uppercase and lowercase letters</li>
                  <li>Include at least one number and one special character</li>
                </ul>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  className="flex items-center gap-1.5 py-2.5 px-5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl transition-all shadow-md shadow-blue-500/10"
                >
                  <Lock className="h-4 w-4" />
                  <span>Update Password</span>
                </button>
              </div>

            </form>
          </div>

        </div>

      </div>

    </div>
  );
};

export default EmployeeSettings;
