import React, { createContext, useContext, useState, useEffect, useCallback } from "react";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [userDatabase, setUserDatabase] = useState(() => {
    const saved = localStorage.getItem("alerto_user_database");
    return saved ? JSON.parse(saved) : [];
  });

  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem("alerto_current_user");
    return saved ? JSON.parse(saved) : null;
  });

  // Sync userDatabase to LocalStorage
  useEffect(() => {
    localStorage.setItem("alerto_user_database", JSON.stringify(userDatabase));
  }, [userDatabase]);

  // Sync currentUser to LocalStorage
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem("alerto_current_user", JSON.stringify(currentUser));
      localStorage.setItem("user", JSON.stringify(currentUser));
    } else {
      localStorage.removeItem("alerto_current_user");
      localStorage.removeItem("user");
      localStorage.removeItem("token");
    }
  }, [currentUser]);

  // Sync resident approval status with MongoDB Atlas
  const syncLiveStatusWithBackend = useCallback(async () => {
    const stored = currentUser || JSON.parse(localStorage.getItem("alerto_current_user") || "null");
    if (!stored) return;

    const userContact = stored.contactNumber || stored.phone;
    const userEmail = stored.email;
    const queryParam = encodeURIComponent(userContact || userEmail || stored.fullName || "");

    if (!queryParam) return;

    try {
      const res = await fetch(`http://localhost:5000/api/residents?search=${queryParam}`);
      if (!res.ok) return;

      const data = await res.json();
      const residentList = Array.isArray(data) ? data : data.data || [];

      const matched = residentList.find(
        (r) =>
          (userEmail && r.email && r.email.toLowerCase() === userEmail.toLowerCase()) ||
          (userContact && r.contactNumber && r.contactNumber === userContact) ||
          (r._id && (r._id === stored._id || r._id === stored.id)) ||
          (r.id && (r.id === stored._id || r.id === stored.id))
      );

      if (matched) {
        const liveStatus = (matched.status || matched.verificationStatus || "pending").toLowerCase();
        const currentLocalStatus = (stored.verificationStatus || stored.status || "pending").toLowerCase();

        if (liveStatus !== currentLocalStatus) {
          const updatedProfile = {
            ...stored,
            ...matched,
            id: matched._id || stored.id,
            status: liveStatus,
            verificationStatus: liveStatus,
          };

          setCurrentUser(updatedProfile);
          localStorage.setItem("alerto_current_user", JSON.stringify(updatedProfile));
          localStorage.setItem("user", JSON.stringify(updatedProfile));

          // Keep userDatabase in sync
          setUserDatabase((prev) =>
            prev.map((u) =>
              u.id === updatedProfile.id || u._id === updatedProfile.id || (u.email && u.email === updatedProfile.email)
                ? { ...u, ...updatedProfile }
                : u
            )
          );
        }
      }
    } catch (err) {
      console.error("Could not sync resident live status from backend:", err);
    }
  }, [currentUser]);

  // Auto-sync status and poll every 3 seconds while pending
  useEffect(() => {
    syncLiveStatusWithBackend();

    const currentStatus = (currentUser?.verificationStatus || currentUser?.status || "").toLowerCase();

    // Only run polling while the resident is awaiting review
    if (currentUser && currentStatus === "pending") {
      const interval = setInterval(() => {
        syncLiveStatusWithBackend();
      }, 3000);

      return () => clearInterval(interval);
    }
  }, [currentUser, syncLiveStatusWithBackend]);

  // Listen for storage changes across different tabs
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === "alerto_user_database" && e.newValue) {
        const updatedDb = JSON.parse(e.newValue);
        setUserDatabase(updatedDb);

        if (currentUser) {
          const matchedUser = updatedDb.find((u) => u.id === currentUser.id);
          if (matchedUser) {
            setCurrentUser(matchedUser);
          }
        }
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, [currentUser]);

  const register = (userData) => {
    const newResident = {
      id: userData._id || userData.id || "REG-" + Date.now(),
      ...userData,
      barangay: "Barangay Anupul",
      municipality: "Bamban",
      province: "Tarlac",
      status: "pending",
      verificationStatus: "pending",
      submittedAt: new Date().toLocaleString(),
    };

    setUserDatabase((prev) => [...prev, newResident]);
    setCurrentUser(newResident);
    return true;
  };

  const registerAdmin = (adminData) => {
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
      password: adminData.password,
      role: "admin",
      status: "pending",
      verificationStatus: "pending",
      submittedAt: new Date().toLocaleString(),
    };

    const updatedDb = [...userDatabase, newAdmin];
    setUserDatabase(updatedDb);
    localStorage.setItem("alerto_user_database", JSON.stringify(updatedDb));

    return { success: true };
  };

  const login = (identifier, password) => {
    // 1. Super Admin Bypass
    if (
      identifier.trim().toLowerCase() === "admin@anupul.gov" &&
      password === "admin123"
    ) {
      const adminUser = {
        id: "ADMIN-01",
        firstName: "Barangay",
        lastName: "Official",
        email: "admin@anupul.gov",
        verificationStatus: "approved",
        status: "approved",
        role: "admin",
      };
      setCurrentUser(adminUser);
      return { success: true, user: adminUser };
    }

    const cleanIdentifier = identifier.trim().toLowerCase();

    // 2. Find user in database by email or contact number
    const user = userDatabase.find(
      (u) =>
        (u.email && u.email.toLowerCase().trim() === cleanIdentifier) ||
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

    const currentStatus = (user.status || user.verificationStatus || "pending").toLowerCase();
    const resolvedUser = { ...user, status: currentStatus, verificationStatus: currentStatus };

    setCurrentUser(resolvedUser);

    if (currentStatus === "pending") {
      return {
        success: false,
        isPending: true,
        message:
          user.role === "admin"
            ? "Your official account is currently pending approval by the Head Barangay Official."
            : "Your residency application is still pending official approval.",
      };
    }

    if (currentStatus === "rejected") {
      return {
        success: false,
        isRejected: true,
        message: "Your verification request was rejected.",
      };
    }

    return { success: true, user: resolvedUser };
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem("alerto_current_user");
    localStorage.removeItem("user");
    localStorage.removeItem("token");
  };

  const approveResident = async (userId) => {
    const updatedDb = userDatabase.map((u) =>
      u.id === userId || u._id === userId
        ? { ...u, verificationStatus: "approved", status: "approved" }
        : u
    );
    setUserDatabase(updatedDb);
    localStorage.setItem("alerto_user_database", JSON.stringify(updatedDb));

    if (currentUser && (currentUser.id === userId || currentUser._id === userId)) {
      const approvedUser = { ...currentUser, verificationStatus: "approved", status: "approved" };
      setCurrentUser(approvedUser);
      localStorage.setItem("alerto_current_user", JSON.stringify(approvedUser));
    }

    // Persist update to MongoDB
    try {
      const token = localStorage.getItem("token");
      await fetch(`http://localhost:5000/api/residents/${userId}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ status: "approved" }),
      });
    } catch (err) {
      console.error("Failed to approve resident in backend:", err);
    }
  };

  const rejectResident = async (userId, reason) => {
    const updatedDb = userDatabase.map((u) =>
      u.id === userId || u._id === userId
        ? { ...u, verificationStatus: "rejected", status: "rejected", rejectionReason: reason }
        : u
    );
    setUserDatabase(updatedDb);
    localStorage.setItem("alerto_user_database", JSON.stringify(updatedDb));

    if (currentUser && (currentUser.id === userId || currentUser._id === userId)) {
      const rejectedUser = {
        ...currentUser,
        verificationStatus: "rejected",
        status: "rejected",
        rejectionReason: reason,
      };
      setCurrentUser(rejectedUser);
      localStorage.setItem("alerto_current_user", JSON.stringify(rejectedUser));
    }

    // Persist update to MongoDB
    try {
      const token = localStorage.getItem("token");
      await fetch(`http://localhost:5000/api/residents/${userId}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ status: "rejected", rejectionReason: reason }),
      });
    } catch (err) {
      console.error("Failed to reject resident in backend:", err);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        userDatabase,
        isLoggedIn: !!currentUser,
        register,
        registerAdmin,
        login,
        logout,
        approveResident,
        rejectResident,
        refreshUser: syncLiveStatusWithBackend,
        syncLiveStatusWithBackend,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}