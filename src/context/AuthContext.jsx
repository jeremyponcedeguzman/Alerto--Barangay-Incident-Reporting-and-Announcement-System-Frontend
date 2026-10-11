import React, { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

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
  submittedAt: new Date().toLocaleString(),
};

export function AuthProvider({ children }) {
  const [userDatabase, setUserDatabase] = useState(() => {
    const saved = localStorage.getItem("alerto_user_database");
    if (!saved) return [DEFAULT_RESIDENT];
    try {
      const parsed = JSON.parse(saved);
      return Array.isArray(parsed) && parsed.length > 0 ? parsed : [DEFAULT_RESIDENT];
    } catch {
      return [DEFAULT_RESIDENT];
    }
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
    } else {
      localStorage.removeItem("alerto_current_user");
    }
  }, [currentUser]);

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
      id: "REG-" + Date.now(),
      ...userData,
      barangay: "Barangay Anupul",
      municipality: "Bamban",
      province: "Tarlac",
      verificationStatus: "pending",
      submittedAt: new Date().toLocaleString(),
    };

    setUserDatabase((prev) => [...prev, newResident]);
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
      verificationStatus: "pending", // Requires approval by head admin
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
        role: "admin"
      };
      setCurrentUser(adminUser);
      return { success: true, user: adminUser };
    }

    // 2. Demo Verified Resident Bypass
    if (
      (identifier.trim().toLowerCase() === "resident@gmail.com" ||
        identifier.trim() === "09171234567") &&
      password === "resident123"
    ) {
      const residentUser = {
        id: "RES-DEMO-01",
        firstName: "Juan",
        lastName: "Dela Cruz",
        email: "resident@gmail.com",
        contactNumber: "09171234567",
        sitioAddress: "Sitio Centro",
        barangay: "Barangay Anupul",
        municipality: "Bamban",
        province: "Tarlac",
        verificationStatus: "approved",
        role: "resident",
        submittedAt: new Date().toLocaleString(),
      };
      setCurrentUser(residentUser);
      return { success: true, user: residentUser };
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

    return { success: true, user };
  };

  const logout = () => {
    setCurrentUser(null);
  };

  const approveResident = (userId) => {
    const updatedDb = userDatabase.map((u) =>
      u.id === userId ? { ...u, verificationStatus: "approved" } : u
    );
    setUserDatabase(updatedDb);
    localStorage.setItem("alerto_user_database", JSON.stringify(updatedDb));

    if (currentUser && currentUser.id === userId) {
      const approvedUser = { ...currentUser, verificationStatus: "approved" };
      setCurrentUser(approvedUser);
      localStorage.setItem("alerto_current_user", JSON.stringify(approvedUser));
    }
  };

  const rejectResident = (userId, reason) => {
    const updatedDb = userDatabase.map((u) =>
      u.id === userId
        ? { ...u, verificationStatus: "rejected", rejectionReason: reason }
        : u
    );
    setUserDatabase(updatedDb);
    localStorage.setItem("alerto_user_database", JSON.stringify(updatedDb));

    if (currentUser && currentUser.id === userId) {
      const rejectedUser = {
        ...currentUser,
        verificationStatus: "rejected",
        rejectionReason: reason,
      };
      setCurrentUser(rejectedUser);
      localStorage.setItem("alerto_current_user", JSON.stringify(rejectedUser));
    }
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
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}