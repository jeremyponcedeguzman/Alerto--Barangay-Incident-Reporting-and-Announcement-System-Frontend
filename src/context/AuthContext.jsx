import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { logAuditEvent, AUDIT_CATEGORIES } from "../utils/auditLogger";
import { authApi, residentsApi, healthApi, getAuthToken } from "../api";

const AuthContext = createContext(null);

export const SITIO_LIST = [
  "Sitio Baguingit",
  "Sitio Binitagan",
  "Sitio Centro",
  "Sitio Manga",
  "Sitio Mape",
  "Sitio Pag-asa",
  "Sitio Priority",
  "Sitio San Joseph",
  "Sitio San Roque",
  "MacArthur Highway / Main Road"
];

const DEFAULT_RESIDENT = {
  id: "RES-DEMO-01",
  firstName: "Juan",
  lastName: "Dela Cruz",
  email: "resident@gmail.com",
  contactNumber: "09171234567",
  sitioAddress: "Sitio Centro",
  barangay: "Barangay Anupul",
  municipality: "Bamban",
  province: "Tarlac",
  password: "resident123",
  verificationStatus: "approved",
  role: "resident",
  submittedAt: new Date(Date.now() - 86400000).toLocaleString(),
};

const DEFAULT_ADMIN = {
  id: "ADMIN-01",
  firstName: "Barangay",
  lastName: "Official",
  email: "admin@anupul.gov",
  contactNumber: "0917-123-4567",
  officialPosition: "Barangay Operations Officer",
  barangay: "Barangay Anupul",
  municipality: "Bamban",
  province: "Tarlac",
  password: "admin123",
  verificationStatus: "approved",
  role: "admin",
  submittedAt: new Date(Date.now() - 172800000).toLocaleString(),
};

const PENDING_RESIDENT = {
  id: "RES-DEMO-02",
  firstName: "Maria",
  lastName: "Santos",
  email: "maria.santos@gmail.com",
  contactNumber: "0918-222-3333",
  sitioAddress: "Sitio Mape",
  barangay: "Barangay Anupul",
  municipality: "Bamban",
  province: "Tarlac",
  password: "password123",
  verificationStatus: "pending",
  role: "resident",
  proofOfResidencyName: "barangay_clearance_maria.jpg",
  submittedAt: new Date(Date.now() - 3600000).toLocaleString(),
};

const INITIAL_USERS = [DEFAULT_RESIDENT, DEFAULT_ADMIN, PENDING_RESIDENT];

export function AuthProvider({ children }) {
  const [userDatabase, setUserDatabase] = useState(() => {
    const saved = localStorage.getItem("alerto_user_database");
    if (!saved) return INITIAL_USERS;
    try {
      const parsed = JSON.parse(saved);
      return Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_USERS;
    } catch {
      return INITIAL_USERS;
    }
  });

  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem("alerto_current_user");
    return saved ? JSON.parse(saved) : DEFAULT_RESIDENT;
  });

  // Sync userDatabase to LocalStorage
  useEffect(() => {
    localStorage.setItem("alerto_user_database", JSON.stringify(userDatabase));
  }, [userDatabase]);

  // Sync currentUser to LocalStorage
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem("alerto_current_user", JSON.stringify(currentUser));
    } else {
      localStorage.removeItem("alerto_current_user");
    }
  }, [currentUser]);

  // Listen for storage changes across different tabs
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === "alerto_user_database" && e.newValue) {
        try {
          const updatedDb = JSON.parse(e.newValue);
          setUserDatabase(updatedDb);

          if (currentUser) {
            const matchedUser = updatedDb.find((u) => u.id === currentUser.id);
            if (matchedUser) {
              setCurrentUser(matchedUser);
            }
          }
        } catch {
          // ignore parsing error
        }
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, [currentUser]);

  // Sync backend officials and residents on mount (only when authenticated)
  const refreshUsersFromBackend = useCallback(async () => {
    try {
      const token = getAuthToken();
      if (!token) return; // Protected directory fetch requires active official/admin JWT

      const health = await healthApi.check();
      if (!health.success) return;

      const officialsRes = await authApi.getOfficials();
      const residentsRes = await residentsApi.getAll();

      const backendUsers = [];

      if (officialsRes.success && Array.isArray(officialsRes.data)) {
        officialsRes.data.forEach((off) => {
          const parts = (off.fullName || "").split(" ");
          backendUsers.push({
            id: off._id || off.id,
            firstName: parts[0] || "Official",
            lastName: parts.slice(1).join(" ") || "",
            email: off.email,
            contactNumber: off.contactNumber || "0917-123-4567",
            officialPosition: off.position || "Barangay Official",
            role: (off.role || "").toLowerCase().includes("admin") ? "admin" : "official",
            verificationStatus: "approved",
            submittedAt: new Date(off.createdAt || Date.now()).toLocaleString(),
          });
        });
      }

      if (residentsRes.success && Array.isArray(residentsRes.data)) {
        residentsRes.data.forEach((res) => {
          const parts = (res.fullName || "").split(" ");
          backendUsers.push({
            id: res._id || res.id,
            firstName: parts[0] || "Resident",
            lastName: parts.slice(1).join(" ") || "",
            email: res.email || `${res.fullName?.toLowerCase().replace(/\s+/g, ".")}@citizen.anupul.ph`,
            contactNumber: res.contactNumber || "",
            sitioAddress: res.purok || res.address || "Sitio Centro",
            role: "resident",
            verificationStatus: "approved",
            submittedAt: new Date(res.createdAt || Date.now()).toLocaleString(),
          });
        });
      }

      if (backendUsers.length > 0) {
        setUserDatabase((prev) => {
          const mergedMap = new Map();
          prev.forEach((u) => mergedMap.set(u.id, u));
          backendUsers.forEach((u) => mergedMap.set(u.id, u));
          return Array.from(mergedMap.values());
        });
      }
    } catch (err) {
      console.warn("Backend user sync note:", err.message);
    }
  }, []);

  useEffect(() => {
    refreshUsersFromBackend();
  }, [refreshUsersFromBackend]);

  const register = async (userData) => {
    const newResident = {
      id: "REG-" + Date.now(),
      ...userData,
      barangay: "Barangay Anupul",
      municipality: "Bamban",
      province: "Tarlac",
      verificationStatus: "pending",
      role: "resident",
      submittedAt: new Date().toLocaleString(),
    };

    const updated = [...userDatabase, newResident];
    setUserDatabase(updated);
    logAuditEvent({
      category: AUDIT_CATEGORIES.VERIFICATION,
      action: "New Resident Registration",
      actor: `${newResident.firstName} ${newResident.lastName}`,
      target: newResident.id,
      details: `New residency application submitted for ${newResident.sitioAddress || "Barangay Anupul"}.`,
      severity: "notice",
    });

    // Also send to backend resident directory
    try {
      await residentsApi.register({
        fullName: `${userData.firstName} ${userData.lastName}`,
        contactNumber: userData.contactNumber || "0917-123-4567",
        purok: userData.sitioAddress || "Sitio Centro",
        address: userData.sitioAddress || "Barangay Anupul",
      });
    } catch (err) {
      console.warn("Backend resident register notice:", err.message);
    }

    return true;
  };

  const registerAdmin = async (adminData) => {
    const existing = (userDatabase || []).find(
      (u) => u.email?.toLowerCase().trim() === adminData.email?.toLowerCase().trim()
    );

    if (existing) {
      return { success: false, message: "An account with this email already exists." };
    }

    const newAdmin = {
      id: "ADMIN-" + Date.now(),
      firstName: adminData.firstName,
      lastName: adminData.lastName,
      email: adminData.email,
      officialPosition: adminData.officialPosition,
      contactNumber: adminData.contactNumber || "0917-123-4567",
      barangay: "Barangay Anupul",
      municipality: "Bamban",
      province: "Tarlac",
      password: adminData.password,
      role: "admin",
      verificationStatus: "pending",
      submittedAt: new Date().toLocaleString(),
    };

    const updatedDb = [...userDatabase, newAdmin];
    setUserDatabase(updatedDb);
    logAuditEvent({
      category: AUDIT_CATEGORIES.SECURITY,
      action: "Admin Registration Request",
      actor: `${newAdmin.firstName} ${newAdmin.lastName}`,
      target: newAdmin.id,
      details: `Admin privileges requested for position: ${newAdmin.officialPosition}.`,
      severity: "warning",
    });

    // Also register on backend REST API
    try {
      await authApi.register({
        fullName: `${adminData.firstName} ${adminData.lastName}`,
        email: adminData.email,
        password: adminData.password,
        role: "Barangay Official",
        position: adminData.officialPosition || "Barangay Staff",
        contactNumber: adminData.contactNumber || "0917-123-4567",
      });
    } catch (err) {
      console.warn("Backend admin register notice:", err.message);
    }

    return { success: true };
  };

  const login = async (identifier, password) => {
    const cleanId = (identifier || "").trim().toLowerCase();

    // 1. Super Admin Pass / Bypass
    if (
      (cleanId === "admin@anupul.gov" || cleanId === "admin@barangay.gov" || cleanId === "admin") &&
      password === "admin123"
    ) {
      setCurrentUser(DEFAULT_ADMIN);
      logAuditEvent({
        category: AUDIT_CATEGORIES.SECURITY,
        action: "Admin Login Success",
        actor: "Barangay Official",
        target: "Admin Portal",
        details: "Official logged in to the Administrative Operations Center.",
        severity: "info",
      });
      return { success: true, user: DEFAULT_ADMIN };
    }

    // 2. Demo Resident Pass / Bypass
    if (
      (cleanId === "resident@gmail.com" ||
        cleanId === "09171234567" ||
        cleanId === "0917-123-4567") &&
      password === "resident123"
    ) {
      setCurrentUser(DEFAULT_RESIDENT);
      return { success: true, user: DEFAULT_RESIDENT };
    }

    // 3. Attempt Live Backend API Login (/api/auth/login)
    if (cleanId.includes("@")) {
      try {
        const apiRes = await authApi.login({ email: cleanId, password });
        if (apiRes.success && apiRes.user) {
          const names = (apiRes.user.fullName || "").split(" ");
          const liveUser = {
            id: apiRes.user.id || apiRes.user._id,
            firstName: names[0] || "Official",
            lastName: names.slice(1).join(" ") || "User",
            email: apiRes.user.email,
            contactNumber: apiRes.user.contactNumber || "0917-123-4567",
            officialPosition: apiRes.user.position || "Barangay Official",
            role: (apiRes.user.role || "").toLowerCase().includes("admin") ? "admin" : "official",
            verificationStatus: "approved",
            token: apiRes.token,
          };
          setCurrentUser(liveUser);
          logAuditEvent({
            category: AUDIT_CATEGORIES.SECURITY,
            action: "Official Login (Backend API)",
            actor: apiRes.user.fullName,
            target: apiRes.user.id,
            details: `Authenticated via REST API. Role: ${apiRes.user.role}.`,
            severity: "info",
          });
          refreshUsersFromBackend();
          return { success: true, user: liveUser };
        }
      } catch (err) {
        console.warn("Backend auth notice:", err.message);
      }
    }

    // 4. Find user in database by email or contact number (local fallback)
    const user = userDatabase.find(
      (u) =>
        (u.email && u.email.toLowerCase().trim() === cleanId) ||
        (u.contactNumber && u.contactNumber.trim() === identifier.trim())
    );

    if (!user) {
      return {
        success: false,
        message: "No account found with this email or contact number.",
      };
    }

    if (user.password !== password) {
      return {
        success: false,
        message: "Incorrect password. Please try again.",
      };
    }

    setCurrentUser(user);

    if (user.verificationStatus === "pending") {
      return {
        success: false,
        isPending: true,
        message: user.role === "admin"
          ? "Your official account is currently pending approval by the Head Barangay Official."
          : "Your residency application is still pending official approval.",
      };
    }

    if (user.verificationStatus === "rejected") {
      return {
        success: false,
        isRejected: true,
        message: "Your verification request was rejected.",
      };
    }

    logAuditEvent({
      category: AUDIT_CATEGORIES.SECURITY,
      action: "User Login",
      actor: `${user.firstName} ${user.lastName}`,
      target: user.id,
      details: `User signed in successfully. Role: ${user.role}.`,
      severity: "info",
    });

    return { success: true, user };
  };

  const logout = () => {
    if (currentUser) {
      logAuditEvent({
        category: AUDIT_CATEGORIES.SECURITY,
        action: "User Logout",
        actor: `${currentUser.firstName} ${currentUser.lastName}`,
        target: currentUser.id,
        details: "User logged out of the session.",
        severity: "info",
      });
    }
    authApi.logout();
    setCurrentUser(null);
  };

  const approveResident = (userId) => {
    const targetUser = userDatabase.find((u) => u.id === userId);
    const updatedDb = userDatabase.map((u) =>
      u.id === userId ? { ...u, verificationStatus: "approved" } : u
    );
    setUserDatabase(updatedDb);

    if (currentUser && currentUser.id === userId) {
      const approvedUser = { ...currentUser, verificationStatus: "approved" };
      setCurrentUser(approvedUser);
    }

    // Persist verification status to MongoDB
    const backendId = targetUser?._id || userId;
    residentsApi.update(backendId, { verificationStatus: "approved" }).catch((err) => {
      console.warn("Backend resident approval notice:", err.message);
    });

    logAuditEvent({
      category: AUDIT_CATEGORIES.VERIFICATION,
      action: "Resident Verification Approved",
      actor: currentUser ? `${currentUser.firstName} ${currentUser.lastName}` : "Admin",
      target: userId,
      details: `Approved verification for ${targetUser ? `${targetUser.firstName} ${targetUser.lastName}` : userId}.`,
      severity: "notice",
    });
  };

  const rejectResident = (userId, reason) => {
    const targetUser = userDatabase.find((u) => u.id === userId);
    const updatedDb = userDatabase.map((u) =>
      u.id === userId
        ? { ...u, verificationStatus: "rejected", rejectionReason: reason }
        : u
    );
    setUserDatabase(updatedDb);

    if (currentUser && currentUser.id === userId) {
      const rejectedUser = {
        ...currentUser,
        verificationStatus: "rejected",
        rejectionReason: reason,
      };
      setCurrentUser(rejectedUser);
    }

    // Persist rejection to MongoDB
    const backendId = targetUser?._id || userId;
    residentsApi.update(backendId, { verificationStatus: "rejected", rejectionReason: reason }).catch((err) => {
      console.warn("Backend resident rejection notice:", err.message);
    });

    logAuditEvent({
      category: AUDIT_CATEGORIES.VERIFICATION,
      action: "Resident Verification Rejected",
      actor: currentUser ? `${currentUser.firstName} ${currentUser.lastName}` : "Admin",
      target: userId,
      details: `Rejected ${targetUser ? `${targetUser.firstName} ${targetUser.lastName}` : userId}. Reason: ${reason}`,
      severity: "warning",
    });
  };

  const updateUserRole = (userId, newRole) => {
    const targetUser = userDatabase.find((u) => u.id === userId);
    const updatedDb = userDatabase.map((u) =>
      u.id === userId ? { ...u, role: newRole } : u
    );
    setUserDatabase(updatedDb);

    if (currentUser && currentUser.id === userId) {
      setCurrentUser({ ...currentUser, role: newRole });
    }

    const backendId = targetUser?._id || userId;
    residentsApi.update(backendId, { role: newRole }).catch((err) => {
      console.warn("Backend role update notice:", err.message);
    });

    logAuditEvent({
      category: AUDIT_CATEGORIES.STAFF,
      action: "User Role Modified",
      actor: currentUser ? `${currentUser.firstName} ${currentUser.lastName}` : "Admin",
      target: userId,
      details: `Role for ${targetUser ? `${targetUser.firstName} ${targetUser.lastName}` : userId} updated to ${newRole.toUpperCase()}.`,
      severity: "notice",
    });
  };

  const deleteUser = (userId) => {
    const targetUser = userDatabase.find((u) => u.id === userId);
    const updatedDb = userDatabase.filter((u) => u.id !== userId);
    setUserDatabase(updatedDb);

    const backendId = targetUser?._id || userId;
    residentsApi.delete(backendId).catch((err) => {
      console.warn("Backend user delete notice:", err.message);
    });

    logAuditEvent({
      category: AUDIT_CATEGORIES.SECURITY,
      action: "User Account Revoked",
      actor: currentUser ? `${currentUser.firstName} ${currentUser.lastName}` : "Admin",
      target: userId,
      details: `Account for ${targetUser ? `${targetUser.firstName} ${targetUser.lastName}` : userId} was deleted.`,
      severity: "warning",
    });
  };

  const addUser = (userData) => {
    const newUser = {
      id: (userData.role === "admin" ? "ADMIN-" : "RES-") + Date.now(),
      ...userData,
      barangay: "Barangay Anupul",
      municipality: "Bamban",
      province: "Tarlac",
      verificationStatus: userData.verificationStatus || "approved",
      submittedAt: new Date().toLocaleString(),
    };
    setUserDatabase((prev) => [...prev, newUser]);

    // Persist to MongoDB backend
    if (userData.role === "admin" || userData.role === "official") {
      authApi.register({
        fullName: `${userData.firstName} ${userData.lastName}`,
        email: userData.email,
        password: userData.password || "password123",
        role: userData.role === "admin" ? "Admin" : "Barangay Official",
        position: userData.officialPosition || "Barangay Staff",
        contactNumber: userData.contactNumber || "0917-123-4567",
      }).catch((err) => console.warn("Backend admin add notice:", err.message));
    } else {
      residentsApi.create({
        fullName: `${userData.firstName} ${userData.lastName}`,
        email: userData.email,
        contactNumber: userData.contactNumber || "0917-123-4567",
        purok: userData.sitioAddress || "Sitio Centro",
        address: userData.sitioAddress || "Barangay Anupul",
        verificationStatus: userData.verificationStatus || "approved",
        role: "resident",
      }).then((res) => {
        if (res.success && res.data) {
          setUserDatabase((prev) =>
            prev.map((u) => (u.id === newUser.id ? { ...u, _id: res.data._id } : u))
          );
        }
      }).catch((err) => console.warn("Backend resident add notice:", err.message));
    }

    logAuditEvent({
      category: AUDIT_CATEGORIES.STAFF,
      action: "User Created Manually",
      actor: currentUser ? `${currentUser.firstName} ${currentUser.lastName}` : "Admin",
      target: newUser.id,
      details: `Added new user ${newUser.firstName} ${newUser.lastName} with role ${newUser.role}.`,
      severity: "info",
    });
    return newUser;
  };

  const changePassword = async (userId, oldPassword, newPassword) => {
    const user = userDatabase.find((u) => u.id === userId);
    if (!user) {
      return { success: false, message: "User account not found." };
    }

    if (user.password && user.password !== oldPassword) {
      return { success: false, message: "Current password does not match our records." };
    }

    // Attempt live backend password update if token is present
    if (getAuthToken()) {
      try {
        const res = await authApi.changePassword({ oldPassword, newPassword });
        if (!res.success && res.error) {
          return { success: false, message: res.error };
        }
      } catch (err) {
        console.warn("Backend password change notice:", err.message);
      }
    }

    const updatedDb = userDatabase.map((u) =>
      u.id === userId ? { ...u, password: newPassword } : u
    );
    setUserDatabase(updatedDb);

    if (currentUser && currentUser.id === userId) {
      setCurrentUser({ ...currentUser, password: newPassword });
    }

    logAuditEvent({
      category: AUDIT_CATEGORIES.SECURITY,
      action: "Password Changed",
      actor: `${user.firstName} ${user.lastName}`,
      target: userId,
      details: "User password updated securely.",
      severity: "info",
    });

    return { success: true, message: "Password updated successfully." };
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        userDatabase,
        isLoggedIn: !!currentUser,
        register,
        registerAdmin,
        login,
        logout,
        approveResident,
        rejectResident,
        updateUserRole,
        deleteUser,
        addUser,
        changePassword,
        refreshUsersFromBackend,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return ctx;
}
