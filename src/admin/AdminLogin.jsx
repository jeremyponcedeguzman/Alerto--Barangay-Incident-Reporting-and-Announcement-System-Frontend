import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "../context/AuthContext";
import { ShieldCheck, Lock, Mail, AlertCircle, ArrowLeft } from "lucide-react";
import { adminLoginSchema } from "../schemas";

export default function AdminLogin() {
  const navigate = useNavigate();
  const auth = useAuth() || {};
  const { login } = auth;

  const [errorMsg, setErrorMsg] = useState("");

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(adminLoginSchema),
    defaultValues: {
      identifier: "",
      password: "",
    },
  });

  const onSubmit = async (data) => {
    setErrorMsg("");

    const cleanId = data.identifier.trim().toLowerCase();

    if (login) {
      const result = await login(cleanId, data.password);

      if (result && result.success) {
        if (result.user?.role === "admin" || cleanId.includes("admin")) {
          navigate("/admin-approvals");
        } else {
          setErrorMsg("This account does not have administrator privileges.");
        }
      } else if (result?.isPending) {
        setErrorMsg("Your administrator account is awaiting authorization from the Head Barangay Official.");
      } else {
        setErrorMsg(result?.message || "Invalid administrative credentials.");
      }
    }
  };

  const handleQuickDemoFill = () => {
    setValue("identifier", "admin@anupul.gov", { shouldValidate: true });
    setValue("password", "admin123", { shouldValidate: true });
  };

  return (
    <div style={{
      minHeight: "100vh",
      backgroundColor: "#0b1329",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "1.5rem"
    }}>
      <div style={{
        maxWidth: "440px",
        width: "100%",
        backgroundColor: "#0f172a",
        borderRadius: "16px",
        border: "1px solid #1e293b",
        padding: "2.5rem 2rem",
        boxShadow: "0 20px 40px -15px rgba(0,0,0,0.5)",
        color: "#ffffff"
      }}>
        {/* Top Back Link */}
        <Link
          to="/"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            color: "#94a3b8",
            fontSize: "0.82rem",
            textDecoration: "none",
            marginBottom: "1.5rem"
          }}
        >
          <ArrowLeft size={16} /> Back to Live Public Map
        </Link>

        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "1.75rem" }}>
          <div style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            width: "56px",
            height: "56px",
            borderRadius: "14px",
            backgroundColor: "#ef4444",
            color: "#ffffff",
            marginBottom: "0.75rem",
            boxShadow: "0 4px 15px rgba(239, 68, 68, 0.4)"
          }}>
            <ShieldCheck size={32} />
          </div>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 800, margin: "0 0 0.35rem 0" }}>
            Operations Command Desk
          </h1>
          <p style={{ fontSize: "0.82rem", color: "#94a3b8", margin: "0 0 0.75rem 0" }}>
            Barangay Anupul • Bamban, Tarlac
          </p>
          <span style={{
            display: "inline-block",
            fontSize: "0.72rem",
            fontWeight: 700,
            color: "#ef4444",
            backgroundColor: "rgba(239, 68, 68, 0.1)",
            border: "1px solid rgba(239, 68, 68, 0.3)",
            padding: "0.2rem 0.6rem",
            borderRadius: "6px",
            textTransform: "uppercase",
            letterSpacing: "0.05em"
          }}>
            Restricted to Authorized Personnel Only
          </span>
        </div>

        {errorMsg && (
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            backgroundColor: "rgba(239, 68, 68, 0.15)",
            border: "1px solid rgba(239, 68, 68, 0.4)",
            borderRadius: "10px",
            padding: "0.75rem 1rem",
            marginBottom: "1.25rem",
            color: "#fca5a5",
            fontSize: "0.82rem"
          }}>
            <AlertCircle size={18} style={{ flexShrink: 0 }} />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Login Form with React Hook Form + Zod */}
        <form onSubmit={handleSubmit(onSubmit)} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
          <div>
            <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 700, color: "#cbd5e1", marginBottom: "0.4rem" }}>
              Official Gov Email / Username
            </label>
            <div style={{ position: "relative" }}>
              <input
                type="text"
                placeholder="admin@anupul.gov"
                {...register("identifier")}
                style={{
                  width: "100%",
                  padding: "0.75rem 0.75rem 0.75rem 2.5rem",
                  backgroundColor: "#1e293b",
                  border: errors.identifier ? "1px solid #ef4444" : "1px solid #334155",
                  borderRadius: "10px",
                  color: "#ffffff",
                  fontSize: "0.9rem",
                  outline: "none",
                  boxSizing: "border-box"
                }}
              />
              <Mail size={16} color="#64748b" style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)" }} />
            </div>
            {errors.identifier ? (
              <span style={{ fontSize: "0.74rem", color: "#ef4444", marginTop: "4px", display: "block" }}>
                {errors.identifier.message}
              </span>
            ) : (
              <span
                onClick={handleQuickDemoFill}
                style={{ fontSize: "0.72rem", color: "#38bdf8", marginTop: "4px", display: "block", cursor: "pointer", textDecoration: "underline" }}
                title="Click to auto-fill demo credentials"
              >
                Click to Auto-fill Demo: admin@anupul.gov / admin123
              </span>
            )}
          </div>

          <div>
            <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 700, color: "#cbd5e1", marginBottom: "0.4rem" }}>
              Security Password
            </label>
            <div style={{ position: "relative" }}>
              <input
                type="password"
                placeholder="••••••••"
                {...register("password")}
                style={{
                  width: "100%",
                  padding: "0.75rem 0.75rem 0.75rem 2.5rem",
                  backgroundColor: "#1e293b",
                  border: errors.password ? "1px solid #ef4444" : "1px solid #334155",
                  borderRadius: "10px",
                  color: "#ffffff",
                  fontSize: "0.9rem",
                  outline: "none",
                  boxSizing: "border-box"
                }}
              />
              <Lock size={16} color="#64748b" style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)" }} />
            </div>
            {errors.password && (
              <span style={{ fontSize: "0.74rem", color: "#ef4444", marginTop: "4px", display: "block" }}>
                {errors.password.message}
              </span>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            style={{
              padding: "0.85rem",
              backgroundColor: "#ef4444",
              color: "#ffffff",
              border: "none",
              borderRadius: "10px",
              fontWeight: 800,
              fontSize: "0.92rem",
              cursor: "pointer",
              marginTop: "0.5rem",
              transition: "background 0.2s ease"
            }}
          >
            {isSubmitting ? "Authenticating..." : "Authenticate & Open Operations Desk"}
          </button>
        </form>

        <div style={{ textAlign: "center", marginTop: "1.75rem", borderTop: "1px solid #1e293b", paddingTop: "1.25rem" }}>
          <p style={{ fontSize: "0.82rem", color: "#94a3b8", margin: 0 }}>
            New Barangay Official or Tanod Head?{" "}
            <Link to="/admin/signup" style={{ color: "#ef4444", fontWeight: 700, textDecoration: "none" }}>
              Request Official Account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
