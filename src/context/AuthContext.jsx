import React, { createContext, useContext, useState, useEffect } from "react";

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

  useEffect(() => {
    localStorage.setItem("alerto_user_database", JSON.stringify(userDatabase));
  }, [userDatabase]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem("alerto_current_user", JSON.stringify(currentUser));
    } else {
      localStorage.removeItem("alerto_current_user");
    }
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

  const login = (identifier, password) => {
    // Check if admin login
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

    const user = userDatabase.find(
      (u) =>
        (u.email.toLowerCase() === identifier.trim().toLowerCase() ||
          u.contactNumber.trim() === identifier.trim()) &&
        u.password === password
    );

    if (!user) {
      return {
        success: false,
        message: "Invalid email/contact number or password, or no account exists.",
      };
    }

    if (user.verificationStatus === "pending") {
      setCurrentUser(user);
      return {
        success: false,
        isPending: true,
        message: "Your residency application is still pending official approval by Barangay Anupul Officials.",
      };
    }

    if (user.verificationStatus === "rejected") {
      setCurrentUser(user);
      return {
        success: false,
        isRejected: true,
        message: "Your residency verification request was rejected by Barangay Officials.",
      };
    }

    setCurrentUser(user);
    return { success: true, user };
  };

  const logout = () => {
    setCurrentUser(null);
  };

  const approveResident = (userId) => {
    setUserDatabase((prev) =>
      prev.map((u) =>
        u.id === userId ? { ...u, verificationStatus: "approved" } : u
      )
    );
    if (currentUser && currentUser.id === userId) {
      setCurrentUser((prev) => ({ ...prev, verificationStatus: "approved" }));
    }
  };

  const rejectResident = (userId, reason) => {
    setUserDatabase((prev) =>
      prev.map((u) =>
        u.id === userId
          ? { ...u, verificationStatus: "rejected", rejectionReason: reason }
          : u
      )
    );
    if (currentUser && currentUser.id === userId) {
      setCurrentUser((prev) => ({
        ...prev,
        verificationStatus: "rejected",
        rejectionReason: reason,
      }));
    }
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        userDatabase,
        isLoggedIn: !!currentUser,
        register,
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