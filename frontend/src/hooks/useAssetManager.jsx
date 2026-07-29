import React, { createContext, useContext, useState, useEffect } from 'react';

const AssetContext = createContext(null);

export const useAssetManager = () => {
  const context = useContext(AssetContext);
  if (!context) {
    throw new Error('useAssetManager must be used within an AssetProvider');
  }
  return context;
};

const API_URL = "http://localhost:8000";

export const AssetProvider = ({ children }) => {
  const [employees, setEmployees] = useState([]);
  const [assets, setAssets] = useState([]);
  const [repairs, setRepairs] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [activity, setActivity] = useState([]);
  const [categories, setCategories] = useState([]);
  const [licenses, setLicenses] = useState([]);
  const [toast, setToast] = useState(null);

  const [token, setToken] = useState(() => {
    const saved = localStorage.getItem('it_jwt_token');
    return (saved && saved !== 'undefined' && saved !== 'null') ? saved : null;
  });
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('it_current_user');
    return (saved && saved !== 'undefined' && saved !== 'null') ? JSON.parse(saved) : null;
  });

  const defaultGuidelines = {
    title: "Quadrant IT Services - Asset Policy & Usage Guidelines 2026",
    version: "v2.4",
    uploadedDate: "20 Jul 2026",
    size: "2.4 MB",
    fileName: "Quadrant_IT_Asset_Policy_2026.pdf",
    summary: "Official company policy guidelines governing hardware usage, security protocols, return policies, and maintenance procedures.",
    content: "1. All assigned hardware assets remain the property of Quadrant IT Services.\n2. Employees are responsible for physical care and security of assigned laptops, monitors, and peripherals.\n3. Any hardware fault or damage must be reported immediately via the Raise Ticket portal.\n4. Assets must be returned intact upon offboarding or department transfer.",
    downloadUrl: "#"
  };

  const [guidelines, setGuidelines] = useState(defaultGuidelines);
  const [announcements, setAnnouncements] = useState([]);

  // Toast helper
  const showToast = (message, type = 'success') => {
    setToast({ message, type });
  };

  // Toast automatic dismiss
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => {
        setToast(null);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // General HTTP Request Client
  const apiFetch = async (endpoint, method = "GET", body = null) => {
    let activeToken = token || localStorage.getItem('it_jwt_token');
    if (activeToken === "undefined" || activeToken === "null") {
      activeToken = null;
    }

    const headers = {
      "Content-Type": "application/json",
    };
    if (activeToken) {
      headers["Authorization"] = `Bearer ${activeToken}`;
    }

    const config = {
      method,
      headers,
    };
    if (body) {
      config.body = JSON.stringify(body);
    }

    try {
      const res = await fetch(`${API_URL}${endpoint}`, config);
      if (!res.ok) {
        const errData = await res.json().catch(() => ({ detail: "API request failed" }));
        const message = typeof errData.detail === 'object' ? JSON.stringify(errData.detail) : errData.detail;
        if (res.status === 401 && !endpoint.includes("/api/auth/login")) {
          localStorage.removeItem("it_jwt_token");
          localStorage.removeItem("it_current_user");
          setToken(null);
          setCurrentUser(null);
        }
        throw new Error(message || "Request failed");
      }
      if (res.status === 204) return null;
      return await res.json().catch(() => null);
    } catch (err) {
      console.error(`API Error on ${method} ${endpoint}:`, err);
      throw err;
    }
  };

  // Load all database collections
  const loadAllData = async () => {
    try {
      const [empList, assetList, repairList, licenseList, catList, annList, guideData, notifList, actList] = await Promise.all([
        apiFetch("/api/employees"),
        apiFetch("/api/assets"),
        apiFetch("/api/repairs"),
        apiFetch("/api/licenses"),
        apiFetch("/api/categories"),
        apiFetch("/api/announcements"),
        apiFetch("/api/guidelines"),
        apiFetch("/api/notifications"),
        apiFetch("/api/activity")
      ]);

      setEmployees(empList || []);
      setAssets(assetList || []);
      setRepairs(repairList || []);
      setLicenses(licenseList || []);
      setCategories(catList || []);
      setAnnouncements(annList || []);
      setGuidelines(guideData || defaultGuidelines);
      setNotifications(notifList || []);
      setActivity(actList || []);
    } catch (err) {
      console.error("Failed to load full-stack data:", err);
    }
  };

  // Sync data on token changes
  useEffect(() => {
    if (token) {
      loadAllData();
    } else {
      setEmployees([]);
      setAssets([]);
      setRepairs([]);
      setLicenses([]);
      setCategories([]);
      setAnnouncements([]);
      setGuidelines(defaultGuidelines);
      setNotifications([]);
      setActivity([]);
    }
  }, [token]);

  // Auth Operations
  const loginUser = async (username, password, role) => {
    try {
      const res = await apiFetch("/api/auth/login", "POST", { username, password, role });
      const activeJwtToken = res.access_token || res.accessToken;
      localStorage.setItem("it_jwt_token", activeJwtToken);
      localStorage.setItem("it_current_user", JSON.stringify(res.user));
      setToken(activeJwtToken);
      setCurrentUser(res.user);
      showToast(`Welcome back, ${res.user.name}!`, "success");
      return { success: true, user: res.user };
    } catch (err) {
      return { success: false, message: err.message };
    }
  };

  const logoutUser = () => {
    localStorage.removeItem("it_jwt_token");
    localStorage.removeItem("it_current_user");
    setToken(null);
    setCurrentUser(null);
    showToast("Signed out successfully", "info");
  };

  const verifyAdminPassword = (inputPassword) => {
    if (!inputPassword || !inputPassword.trim()) return false;
    const cleanPass = inputPassword.trim();
    // Double confirmation UI protection
    return cleanPass === 'admin123' || cleanPass === 'admin' || cleanPass === '123456';
  };

  // Custom Frontend Activity logging
  const logActivity = async (activityName, details, customUser = null) => {
    try {
      await apiFetch("/api/activity", "POST", { activity: activityName, details });
      // Reload activities list
      const actList = await apiFetch("/api/activity");
      setActivity(actList || []);
    } catch (err) {
      console.error("Failed to log activity:", err);
    }
  };

  // Assets CRUD
  const addAsset = async (asset) => {
    try {
      let generatedId = asset.id;
      if (!generatedId) {
        const owner = (asset.ownership || '').trim().toLowerCase();
        let prefix = 'QITS';
        if (owner.includes('dsv')) prefix = 'DSV';
        else if (owner.includes('dhl')) prefix = 'DHL';
        const existingCount = assets.filter(a => a.id && a.id.startsWith(prefix)).length;
        generatedId = `${prefix}${String(existingCount + 1).padStart(4, '0')}`;
      }

      const payload = {
        ...asset,
        id: generatedId,
        ownership: asset.ownership || "Quadrant IT Services",
        assignedTo: asset.assignedTo || null,
        status: asset.status || "Available",
        chargerSerialNumber: asset.chargerSerialNumber || (asset.type === 'Laptop' ? `CHG-SN-${String(85000000 + Math.floor(Math.random() * 1000000)).substring(0, 8)}` : 'N/A'),
        condition: asset.condition || 'Good',
        assignedDate: asset.status === 'Assigned' ? new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : 'N/A',
        image: asset.image || "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=80&h=80&fit=crop"
      };

      await apiFetch("/api/assets", "POST", payload);
      await loadAllData();
      showToast("Asset added successfully", "success");
    } catch (err) {
      showToast(err.message, "error");
    }
  };

  const updateAsset = async (updatedAsset) => {
    try {
      await apiFetch(`/api/assets/${updatedAsset.id}`, "PUT", updatedAsset);
      await loadAllData();
      showToast("Asset updated successfully", "success");
    } catch (err) {
      showToast(err.message, "error");
    }
  };

  const deleteAsset = async (id) => {
    try {
      await apiFetch(`/api/assets/${id}`, "DELETE");
      await loadAllData();
      showToast("Asset deleted successfully", "info");
    } catch (err) {
      showToast(err.message, "error");
    }
  };

  // Employees CRUD
  const addEmployee = async (emp) => {
    try {
      const nextNum = employees.length + 1;
      const payload = {
        ...emp,
        id: emp.id || `QEMP${String(nextNum).padStart(3, '0')}`,
        status: emp.status || "Active",
        avatar: emp.avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop&crop=faces"
      };

      await apiFetch("/api/employees", "POST", payload);
      await loadAllData();
      showToast("Employee record added successfully", "success");
    } catch (err) {
      showToast(err.message, "error");
    }
  };

  const updateEmployee = async (arg1, arg2) => {
    try {
      let empId, payload;
      if (typeof arg1 === 'object' && arg1 !== null) {
        empId = arg1.id;
        payload = arg1;
      } else {
        empId = arg1;
        payload = arg2 || {};
      }

      if (!empId) {
        throw new Error("Employee ID is missing.");
      }

      const res = await apiFetch(`/api/employees/${empId}`, "PUT", payload);
      await loadAllData();
      
      // Update local profile session if it's the current user
      if (currentUser && currentUser.id === empId) {
        const merged = { ...currentUser, ...res };
        setCurrentUser(merged);
        localStorage.setItem('it_current_user', JSON.stringify(merged));
      }
      showToast("Profile updated successfully", "success");
      return true;
    } catch (err) {
      showToast(err.message, "error");
      return false;
    }
  };

  const deleteEmployee = async (target) => {
    try {
      const targetId = typeof target === 'object' ? target.id : target;
      await apiFetch(`/api/employees/${targetId}`, "DELETE");
      await loadAllData();
      showToast("Employee record deleted successfully", "info");
    } catch (err) {
      showToast(err.message, "error");
    }
  };

  // Assignments & Returns
  const assignAssets = async (employeeId, assetIds, assignDate, remarks) => {
    try {
      await apiFetch("/api/assets/assign", "POST", {
        employee_id: employeeId,
        asset_ids: assetIds,
        assign_date: assignDate,
        remarks: remarks
      });
      await loadAllData();
      showToast(`Assigned ${assetIds.length} asset(s) successfully`, "success");
    } catch (err) {
      showToast(err.message, "error");
    }
  };

  const returnAssets = async (employeeId, assetIds, returnDate, returnCondition, remarks) => {
    try {
      await apiFetch("/api/assets/return", "POST", {
        employee_id: employeeId,
        asset_ids: assetIds,
        return_date: returnDate,
        condition: returnCondition,
        remarks: remarks
      });
      await loadAllData();
      showToast(`Processed return of ${assetIds.length} asset(s) successfully`, "success");
    } catch (err) {
      showToast(err.message, "error");
    }
  };

  // Repairs Operations
  const addRepair = async (repair) => {
    try {
      await apiFetch("/api/repairs", "POST", {
        asset_id: repair.assetId,
        reported_by: repair.reportedBy,
        issue: repair.issue,
        description: repair.description,
        priority: repair.priority,
        assigned_to: repair.assignedTo,
        estimated_completion: repair.estimatedCompletion
      });
      await loadAllData();
      showToast("Repair ticket successfully raised!", "success");
    } catch (err) {
      showToast(err.message, "error");
    }
  };

  const addRepairUpdate = async (repairId, status, message) => {
    try {
      await apiFetch(`/api/repairs/${repairId}/updates`, "POST", { status, message });
      await loadAllData();
      showToast("Status update added successfully", "success");
    } catch (err) {
      showToast(err.message, "error");
    }
  };

  const acceptRepair = async (repairId, adminName) => {
    try {
      await apiFetch(`/api/repairs/${repairId}/accept`, "POST");
      await loadAllData();
      showToast("Accepted support ticket", "success");
    } catch (err) {
      showToast(err.message, "error");
    }
  };

  const rejectRepair = async (repairId, adminName) => {
    try {
      await apiFetch(`/api/repairs/${repairId}/reject`, "POST");
      await loadAllData();
      showToast("Cancelled support ticket", "info");
    } catch (err) {
      showToast(err.message, "error");
    }
  };

  // Announcements Operations
  const addAnnouncement = async (newAnn) => {
    try {
      await apiFetch("/api/announcements", "POST", newAnn);
      await loadAllData();
      showToast("Announcement posted successfully", "success");
    } catch (err) {
      showToast(err.message, "error");
    }
  };

  const deleteAnnouncement = async (id) => {
    try {
      await apiFetch(`/api/announcements/${id}`, "DELETE");
      await loadAllData();
      showToast("Announcement deleted", "info");
    } catch (err) {
      showToast(err.message, "error");
    }
  };

  // Categories Operations
  const addCategory = async (categoryData) => {
    try {
      const nextNum = categories.length + 1;
      const payload = {
        ...categoryData,
        id: `CAT${String(nextNum).padStart(3, '0')}`
      };
      await apiFetch("/api/categories", "POST", payload);
      await loadAllData();
      showToast("Category added successfully", "success");
    } catch (err) {
      showToast(err.message, "error");
    }
  };

  const updateCategory = async (id, updatedData) => {
    try {
      await apiFetch(`/api/categories/${id}`, "PUT", updatedData);
      await loadAllData();
      showToast("Category updated successfully", "success");
    } catch (err) {
      showToast(err.message, "error");
    }
  };

  const deleteCategory = async (id) => {
    try {
      await apiFetch(`/api/categories/${id}`, "DELETE");
      await loadAllData();
      showToast("Category deleted successfully", "info");
    } catch (err) {
      showToast(err.message, "error");
    }
  };

  // Guidelines Operations
  const updateGuidelines = async (newGuidelines) => {
    try {
      await apiFetch("/api/guidelines", "PUT", newGuidelines);
      await loadAllData();
      showToast("IT Asset Guidelines updated successfully", "success");
    } catch (err) {
      showToast(err.message, "error");
    }
  };

  // Software Subscriptions (Licenses)
  const addLicense = async (licenseData) => {
    try {
      await apiFetch("/api/licenses", "POST", licenseData);
      await loadAllData();
      showToast(`Subscription "${licenseData.name}" added successfully!`, "success");
    } catch (err) {
      showToast(err.message, "error");
    }
  };

  const updateLicense = async (id, updatedData) => {
    try {
      await apiFetch(`/api/licenses/${id}`, "PUT", updatedData);
      await loadAllData();
      showToast("License updated successfully!", "success");
    } catch (err) {
      showToast(err.message, "error");
    }
  };

  const deleteLicense = async (id) => {
    try {
      await apiFetch(`/api/licenses/${id}`, "DELETE");
      await loadAllData();
      showToast("License subscription removed", "info");
    } catch (err) {
      showToast(err.message, "error");
    }
  };

  const triggerEmailAlert = async (id) => {
    try {
      await apiFetch(`/api/licenses/${id}/alert`, "POST");
      await loadAllData();
      showToast("Alert triggered successfully", "success");
    } catch (err) {
      showToast(err.message, "error");
    }
  };

  // Notifications Operations
  const markNotificationAsRead = async (id) => {
    try {
      await apiFetch(`/api/notifications/${id}/read`, "PUT");
      await loadAllData();
    } catch (err) {
      console.error(err);
    }
  };

  const markAllNotificationsAsRead = async () => {
    try {
      await apiFetch("/api/notifications/read-all", "PUT");
      await loadAllData();
      showToast("All notifications marked as read", "success");
    } catch (err) {
      showToast(err.message, "error");
    }
  };

  const changePassword = async (currentPassword, newPassword) => {
    try {
      await apiFetch("/api/auth/change-password", "POST", {
        current_password: currentPassword,
        new_password: newPassword
      });
      showToast("Password updated successfully!", "success");
      return true;
    } catch (err) {
      showToast(err.message, "error");
      return false;
    }
  };

  return (
    <AssetContext.Provider value={{
      employees,
      assets,
      repairs,
      notifications,
      markNotificationAsRead,
      markAllNotificationsAsRead,
      activity,
      currentUser,
      loginUser,
      logoutUser,
      verifyAdminPassword,
      changePassword,
      addAsset,
      updateAsset,
      deleteAsset,
      addEmployee,
      updateEmployee,
      deleteEmployee,
      assignAssets,
      returnAssets,
      addRepair,
      addRepairUpdate,
      acceptRepair,
      rejectRepair,
      logActivity,
      toast,
      showToast,
      guidelines,
      updateGuidelines,
      announcements,
      addAnnouncement,
      deleteAnnouncement,
      categories,
      addCategory,
      updateCategory,
      deleteCategory,
      licenses,
      addLicense,
      updateLicense,
      deleteLicense,
      triggerEmailAlert
    }}>
      {children}
    </AssetContext.Provider>
  );
};
