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

/**
 * Checks whether an email is already registered in the user database.
 */
export function isEmailAlreadyRegistered(email, userDb = []) {
  if (!email || typeof email !== "string") return false;
  const clean = email.trim().toLowerCase();
  if (!clean) return false;
  return Array.isArray(userDb) && userDb.some((u) => (u?.email || "").trim().toLowerCase() === clean);
}

/**
 * Generates an authentic SVG data URI of a Barangay Residency Clearance Certificate
 * for realistic inspection by Barangay Captains and Officials.
 */
export function generateSampleCertificate(residentName = "Maria Santos", sitio = "Sitio Mape", dateStr = null) {
  const safeName = (residentName || "Resident Applicant").trim();
  const safeSitio = (sitio || "Sitio Centro").trim();
  const dateFormatted = dateStr || new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
  const hashSeed = Math.abs(safeName.split("").reduce((acc, char) => (acc << 5) - acc + char.charCodeAt(0), 0));
  const controlNo = "BA-CERT-" + ((hashSeed % 90000) + 10000);

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 1020" width="100%" height="100%">
    <defs>
      <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#ffffff"/>
        <stop offset="100%" stop-color="#fafaf9"/>
      </linearGradient>
    </defs>

    <!-- Certificate Background & Borders -->
    <rect width="800" height="1020" fill="url(#bgGrad)"/>
    <rect x="24" y="24" width="752" height="972" fill="none" stroke="#0f172a" stroke-width="3"/>
    <rect x="34" y="34" width="732" height="952" fill="none" stroke="#b45309" stroke-width="1.5" stroke-dasharray="5 3"/>
    <rect x="42" y="42" width="716" height="936" fill="none" stroke="#0f172a" stroke-width="0.75"/>

    <!-- Header Official Seals -->
    <circle cx="110" cy="115" r="42" fill="#fef3c7" stroke="#b45309" stroke-width="2"/>
    <text x="110" y="110" text-anchor="middle" font-family="serif" font-weight="bold" font-size="10" fill="#78350f">REPUBLIC</text>
    <text x="110" y="124" text-anchor="middle" font-family="serif" font-weight="bold" font-size="9" fill="#78350f">PHILIPPINES</text>
    <text x="110" y="142" text-anchor="middle" font-family="sans-serif" font-size="16">🇵🇭</text>

    <circle cx="690" cy="115" r="42" fill="#dbeafe" stroke="#1d4ed8" stroke-width="2"/>
    <text x="690" y="110" text-anchor="middle" font-family="serif" font-weight="bold" font-size="10" fill="#1e3a8a">BARANGAY</text>
    <text x="690" y="124" text-anchor="middle" font-family="serif" font-weight="bold" font-size="9" fill="#1e3a8a">ANUPUL SEAL</text>
    <text x="690" y="142" text-anchor="middle" font-family="sans-serif" font-size="16">🏛️</text>

    <!-- Heading Titles -->
    <text x="400" y="80" text-anchor="middle" font-family="Georgia, serif" font-size="13" fill="#475569" letter-spacing="2">REPUBLIC OF THE PHILIPPINES</text>
    <text x="400" y="100" text-anchor="middle" font-family="Georgia, serif" font-size="12" fill="#475569">PROVINCE OF TARLAC • MUNICIPALITY OF BAMBAN</text>
    <text x="400" y="128" text-anchor="middle" font-family="Arial, sans-serif" font-size="19" font-weight="900" fill="#0f172a" letter-spacing="1">BARANGAY ANUPUL</text>
    <text x="400" y="148" text-anchor="middle" font-family="sans-serif" font-size="11" font-weight="bold" fill="#0284c7">OFFICE OF THE SANGGUNIANG BARANGAY</text>

    <line x1="70" y1="170" x2="730" y2="170" stroke="#0f172a" stroke-width="2"/>
    <line x1="70" y1="174" x2="730" y2="174" stroke="#b45309" stroke-width="1"/>

    <!-- Document Main Title -->
    <text x="400" y="235" text-anchor="middle" font-family="Georgia, serif" font-size="24" font-weight="bold" fill="#0f172a" letter-spacing="3">BARANGAY CERTIFICATE</text>
    <text x="400" y="260" text-anchor="middle" font-family="Georgia, serif" font-size="14" font-style="italic" fill="#64748b">(CERTIFICATION OF RESIDENCY &amp; GOOD MORAL CHARACTER)</text>

    <rect x="260" y="280" width="280" height="26" rx="4" fill="#f1f5f9" stroke="#cbd5e1" stroke-width="1"/>
    <text x="400" y="297" text-anchor="middle" font-family="monospace" font-size="11" font-weight="bold" fill="#334155">CONTROL NO: ${controlNo}</text>

    <!-- Body content -->
    <text x="90" y="355" font-family="Georgia, serif" font-size="14" font-weight="bold" fill="#0f172a">TO WHOM IT MAY CONCERN:</text>

    <text x="130" y="395" font-family="Georgia, serif" font-size="14" fill="#1e293b">THIS IS TO CERTIFY that the individual named and identified below is a verified bonafide</text>
    <text x="90" y="420" font-family="Georgia, serif" font-size="14" fill="#1e293b">resident of Barangay Anupul, Municipality of Bamban, Province of Tarlac:</text>

    <!-- Resident Name & Sitio Highlights Box -->
    <rect x="90" y="450" width="620" height="95" rx="8" fill="#f8fafc" stroke="#cbd5e1" stroke-width="1.5"/>
    <text x="120" y="485" font-family="sans-serif" font-size="11" font-weight="bold" fill="#64748b">OFFICIAL RESIDENT NAME:</text>
    <text x="280" y="487" font-family="Georgia, serif" font-size="18" font-weight="900" fill="#0f172a">${safeName.toUpperCase()}</text>
    <text x="120" y="520" font-family="sans-serif" font-size="11" font-weight="bold" fill="#64748b">PHYSICAL SITIO ADDRESS:</text>
    <text x="280" y="520" font-family="sans-serif" font-size="14" font-weight="bold" fill="#0284c7">${safeSitio}, Barangay Anupul, Bamban, Tarlac</text>

    <text x="130" y="585" font-family="Georgia, serif" font-size="13.5" fill="#1e293b">Records of this office confirm that the applicant is a law-abiding citizen with good moral</text>
    <text x="90" y="610" font-family="Georgia, serif" font-size="13.5" fill="#1e293b">standing in our barangay community, with no pending criminal case or derogatory record filed</text>
    <text x="90" y="635" font-family="Georgia, serif" font-size="13.5" fill="#1e293b">before the Lupong Tagapamayapa as of the date of issuance.</text>

    <text x="130" y="680" font-family="Georgia, serif" font-size="13.5" fill="#1e293b">This certification is issued upon the request of the interested party for verification</text>
    <text x="90" y="705" font-family="Georgia, serif" font-size="13.5" fill="#1e293b">and official account approval on the ALERTO Incident Reporting &amp; Emergency System.</text>

    <text x="90" y="750" font-family="Georgia, serif" font-size="13" fill="#334155">Issued this ${dateFormatted} at Barangay Hall, Anupul, Bamban, Tarlac, Philippines.</text>

    <!-- Signatures and Official Stamp -->
    <!-- Resident Signature Section -->
    <line x1="110" y1="850" x2="310" y2="850" stroke="#0f172a" stroke-width="1.5"/>
    <text x="210" y="842" text-anchor="middle" font-family="'Brush Script MT', cursive, sans-serif" font-size="22" fill="#1e3a8a">${safeName}</text>
    <text x="210" y="870" text-anchor="middle" font-family="sans-serif" font-size="11" font-weight="bold" fill="#0f172a">RESIDENT APPLICANT</text>
    <text x="210" y="885" text-anchor="middle" font-family="sans-serif" font-size="10" fill="#64748b">Affixed Specimen Signature</text>

    <!-- Red Official Seal -->
    <g transform="translate(355, 785) rotate(-12)">
      <circle cx="45" cy="45" r="44" fill="none" stroke="#dc2626" stroke-width="2.5" stroke-dasharray="6 2"/>
      <circle cx="45" cy="45" r="38" fill="none" stroke="#dc2626" stroke-width="1"/>
      <text x="45" y="36" text-anchor="middle" font-family="sans-serif" font-weight="900" font-size="8" fill="#dc2626">BARANGAY ANUPUL</text>
      <text x="45" y="48" text-anchor="middle" font-family="sans-serif" font-weight="bold" font-size="9" fill="#dc2626">OFFICIAL SEAL</text>
      <text x="45" y="58" text-anchor="middle" font-family="sans-serif" font-size="7" fill="#dc2626">AUTHENTICATED</text>
    </g>

    <!-- Punong Barangay Signature Section -->
    <line x1="490" y1="850" x2="690" y2="850" stroke="#0f172a" stroke-width="1.5"/>
    <text x="590" y="842" text-anchor="middle" font-family="'Brush Script MT', cursive, sans-serif" font-size="22" fill="#047857">Hon. R. Manalang</text>
    <text x="590" y="870" text-anchor="middle" font-family="sans-serif" font-size="11" font-weight="bold" fill="#0f172a">HON. ROMEO MANALANG</text>
    <text x="590" y="885" text-anchor="middle" font-family="sans-serif" font-size="10" fill="#64748b">Punong Barangay (Barangay Captain)</text>

    <!-- Footer Bar -->
    <rect x="24" y="960" width="752" height="36" fill="#0f172a"/>
    <text x="400" y="983" text-anchor="middle" font-family="sans-serif" font-size="10" font-weight="600" fill="#cbd5e1" letter-spacing="1">
      BARANGAY ANUPUL CITIZEN REGISTRY • VERIFIED INHABITANT DATABASE
    </text>
  </svg>`;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

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
  proofOfResidencyName: "barangay_clearance_juan.png",
  proofOfResidencyUrl: generateSampleCertificate("Juan Dela Cruz", "Sitio Centro"),
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
  proofOfResidencyName: "barangay_clearance_maria.png",
  proofOfResidencyUrl: generateSampleCertificate("Maria Santos", "Sitio Mape"),
  submittedAt: new Date(Date.now() - 3600000).toLocaleString(),
};

const INITIAL_USERS = [DEFAULT_RESIDENT, DEFAULT_ADMIN, PENDING_RESIDENT];

export function AuthProvider({ children }) {
  const [userDatabase, setUserDatabase] = useState(() => {
    const saved = localStorage.getItem("alerto_user_database");
    if (!saved) return INITIAL_USERS;
    try {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.map((u) => {
          if (!u.proofOfResidencyUrl && u.role === "resident") {
            const fullName = `${u.firstName || ""} ${u.lastName || ""}`.trim() || "Resident Applicant";
            return {
              ...u,
              proofOfResidencyName: u.proofOfResidencyName || "barangay_clearance.png",
              proofOfResidencyUrl: generateSampleCertificate(fullName, u.sitioAddress || "Sitio Centro"),
            };
          }
          return u;
        });
      }
      return INITIAL_USERS;
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
          const fullName = res.fullName || "Resident Citizen";
          backendUsers.push({
            id: res._id || res.id,
            firstName: parts[0] || "Resident",
            lastName: parts.slice(1).join(" ") || "",
            email: res.email || `${res.fullName?.toLowerCase().replace(/\s+/g, ".")}@citizen.anupul.ph`,
            contactNumber: res.contactNumber || "",
            sitioAddress: res.purok || res.address || "Sitio Centro",
            role: "resident",
            verificationStatus: "approved",
            proofOfResidencyName: res.proofOfResidencyName || "Official_Barangay_Clearance.png",
            proofOfResidencyUrl: res.proofOfResidencyUrl || generateSampleCertificate(fullName, res.purok || "Sitio Centro"),
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
    const cleanEmail = (userData.email || "").trim().toLowerCase();

    // 1. Verify uniqueness against local database
    if (cleanEmail) {
      const existing = (userDatabase || []).find(
        (u) => (u.email || "").trim().toLowerCase() === cleanEmail
      );
      if (existing) {
        return {
          success: false,
          message: "An account with this email address already exists. Please sign in or use a different email.",
        };
      }
    }

    const fullName = `${userData.firstName} ${userData.lastName}`.trim();
    const proofUrl = userData.proofOfResidencyUrl || generateSampleCertificate(fullName, userData.sitioAddress || "Sitio Centro");
    const proofName = userData.proofOfResidencyName || "barangay_residency_clearance.png";

    // 2. Verify and persist with backend directory
    try {
      const backendRes = await residentsApi.register({
        fullName,
        contactNumber: userData.contactNumber || "0917-123-4567",
        purok: userData.sitioAddress || "Sitio Centro",
        address: userData.sitioAddress || "Barangay Anupul",
        email: cleanEmail,
        proofOfResidencyName: proofName,
        proofOfResidencyUrl: proofUrl,
      });

      if (backendRes && backendRes.success === false) {
        return {
          success: false,
          message: backendRes.message || "An account with this email address already exists.",
        };
      }
    } catch (err) {
      const errMsg = err?.response?.data?.message || err?.message || "";
      if (errMsg.toLowerCase().includes("already exists") || errMsg.toLowerCase().includes("duplicate")) {
        return {
          success: false,
          message: errMsg,
        };
      }
      console.warn("Backend resident register notice:", err.message);
    }

    const newResident = {
      id: "REG-" + Date.now(),
      ...userData,
      email: cleanEmail,
      barangay: "Barangay Anupul",
      municipality: "Bamban",
      province: "Tarlac",
      verificationStatus: "pending",
      role: "resident",
      proofOfResidencyName: proofName,
      proofOfResidencyUrl: proofUrl,
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

    return { success: true };
  };

  const registerAdmin = async (adminData) => {
    const cleanEmail = (adminData.email || "").trim().toLowerCase();

    // 1. Verify uniqueness against local database
    const existing = (userDatabase || []).find(
      (u) => (u.email || "").trim().toLowerCase() === cleanEmail
    );

    if (existing) {
      return { success: false, message: "An account with this email address already exists." };
    }

    // 2. Verify and persist with backend auth
    try {
      const res = await authApi.register({
        fullName: `${adminData.firstName} ${adminData.lastName}`,
        email: cleanEmail,
        password: adminData.password,
        role: "Barangay Official",
        position: adminData.officialPosition || "Barangay Staff",
        contactNumber: adminData.contactNumber || "0917-123-4567",
      });
      if (res && res.success === false) {
        return { success: false, message: res.message || "An account with this email already exists." };
      }
    } catch (err) {
      const errMsg = err?.response?.data?.message || err?.message || "";
      if (errMsg.toLowerCase().includes("already exists") || errMsg.toLowerCase().includes("duplicate")) {
        return { success: false, message: errMsg };
      }
      console.warn("Backend admin register notice:", err.message);
    }

    const newAdmin = {
      id: "ADMIN-" + Date.now(),
      firstName: adminData.firstName,
      lastName: adminData.lastName,
      email: cleanEmail,
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
    const cleanEmail = (userData.email || "").trim().toLowerCase();

    if (cleanEmail) {
      const existing = (userDatabase || []).find(
        (u) => (u.email || "").trim().toLowerCase() === cleanEmail
      );
      if (existing) {
        return {
          success: false,
          message: `An account with email "${cleanEmail}" already exists.`,
        };
      }
    }

    const newUser = {
      id: (userData.role === "admin" ? "ADMIN-" : "RES-") + Date.now(),
      ...userData,
      email: cleanEmail,
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
        email: cleanEmail,
        password: userData.password || "password123",
        role: userData.role === "admin" ? "Admin" : "Barangay Official",
        position: userData.officialPosition || "Barangay Staff",
        contactNumber: userData.contactNumber || "0917-123-4567",
      }).catch((err) => console.warn("Backend admin add notice:", err.message));
    } else {
      residentsApi.create({
        fullName: `${userData.firstName} ${userData.lastName}`,
        email: cleanEmail,
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
    return { success: true, user: newUser };
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
        isEmailTaken: (email) => isEmailAlreadyRegistered(email, userDatabase),
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
