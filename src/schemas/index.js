import { z } from "zod";

/**
 * Schema for reporting or updating an emergency incident
 */
export const incidentReportSchema = z.object({
  category: z.enum(
    ["flood", "fire", "medical", "police", "accident", "hazard"],
    { required_error: "Please select an incident category" }
  ),
  severity: z.enum(["low", "medium", "high", "critical"], {
    required_error: "Please select an urgency severity level",
  }),
  title: z
    .string()
    .min(3, "Title must be at least 3 characters long")
    .max(120, "Title cannot exceed 120 characters"),
  locationName: z
    .string()
    .min(2, "Specific location name or landmark is required")
    .max(150, "Location description is too long"),
  lat: z.coerce.number(),
  lng: z.coerce.number(),
  description: z
    .string()
    .min(5, "Please provide more details about the situation (at least 5 characters)")
    .max(1000, "Description cannot exceed 1000 characters"),
  reportedBy: z.string().optional(),
  reporterContact: z.string().optional(),
  imageEvidence: z.string().optional(),
});

/**
 * Schema for resident login
 */
export const loginSchema = z.object({
  identifier: z
    .string()
    .min(1, "Email or contact number is required")
    .trim(),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters long"),
});

/**
 * Schema for resident account registration
 */
export const signupSchema = z
  .object({
    firstName: z
      .string()
      .min(2, "First name must be at least 2 characters")
      .trim(),
    lastName: z
      .string()
      .min(2, "Last name must be at least 2 characters")
      .trim(),
    contactNumber: z
      .string()
      .min(10, "Please enter a valid mobile number (e.g. 0917-123-4567)")
      .max(15, "Mobile number is too long")
      .trim(),
    sitioAddress: z
      .string()
      .min(1, "Please select your Sitio in Barangay Anupul"),
    email: z
      .string()
      .email("Please provide a valid email address")
      .trim()
      .toLowerCase(),
    password: z
      .string()
      .min(6, "Password must be at least 6 characters long"),
    confirmPassword: z
      .string()
      .min(6, "Confirm password is required"),
    isAnupulResident: z
      .boolean()
      .refine((val) => val === true, {
        message: "You must confirm that you reside or own property in Barangay Anupul",
      }),
    proofOfResidencyName: z.string().optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

/**
 * Schema for administrative login
 */
export const adminLoginSchema = z.object({
  identifier: z
    .string()
    .min(1, "Official email or username is required")
    .trim()
    .refine(
      (val) => {
        const clean = val.toLowerCase();
        return (
          clean.endsWith("@anupul.gov") ||
          clean.endsWith("@barangay.gov") ||
          clean === "admin"
        );
      },
      {
        message: "Admin portal is strictly for @anupul.gov official accounts.",
      }
    ),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters long"),
});

/**
 * Schema for emergency broadcast announcements
 */
export const announcementSchema = z.object({
  title: z
    .string()
    .min(5, "Announcement title must be at least 5 characters")
    .max(150, "Title is too long"),
  summary: z
    .string()
    .min(10, "Broadcast message must be at least 10 characters"),
  priority: z.enum(["Emergency", "Weather Advisory", "General"], {
    required_error: "Please select an alert priority level",
  }),
});
