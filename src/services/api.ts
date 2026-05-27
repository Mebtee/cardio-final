
import { toast } from "sonner";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export interface PredictionResult {
  prediction: "positive" | "negative";
  confidence: number;
  timestamp: string;
  image_id: string;
  request_id?: string;
}

export interface XrayRequest {
  id: string;
  doctor_id: number;
  patient_name: string;
  patient_id?: string;
  request_notes?: string;
  status: "pending" | "completed" | "in_progress";
  created_at: string;
  doctor_name?: string;
  prediction?: "positive" | "negative";
  confidence?: number;
  result_timestamp?: string;
}

export interface User {
  id: number;
  username: string;
  email: string;
  role: "admin" | "doctor" | "xray_technician" | "reception" | "general_doctor";
  full_name?: string;
}

export interface Patient {
  id: number;
  patient_name: string;
  patient_id?: string;
  contact_number?: string;
  age?: number;
  gender?: "male" | "female" | "other";
  medical_history?: string;
  registered_by: number;
  status: "registered" | "referred" | "completed";
  referred_to?: number;
  created_at: string;
  registered_by_name?: string;
  referred_to_name?: string;
}

// Upload image and get prediction result (with request ID)
export const getPrediction = async (image: File, requestId: string): Promise<PredictionResult> => {
  try {
    const formData = new FormData();
    formData.append("image", image);
    formData.append("request_id", requestId);

    const response = await fetch(`${API_URL}/predict`, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: "An error occurred" }));
      const errorMessage = errorData.error || errorData.message || "Failed to get prediction";
      throw new Error(errorMessage);
    }

    return await response.json();
  } catch (error) {
    console.error("Error getting prediction:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to get prediction";
    toast.error(errorMessage);
    throw error;
  }
};

// Login user
export const loginUser = async (username: string, password: string): Promise<{ success: boolean; user?: User }> => {
  try {
    const response = await fetch(`${API_URL}/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, password }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: "An error occurred" }));
      throw new Error(errorData.error || "Failed to login");
    }

    return await response.json();
  } catch (error) {
    console.error("Error logging in:", error);
    toast.error(error instanceof Error ? error.message : "Failed to login");
    throw error;
  }
};

// Create X-ray request (doctor)
export const createXrayRequest = async (
  doctorId: number,
  patientName: string,
  patientId?: string,
  requestNotes?: string,
  patientDbId?: number
): Promise<{ request_id: string; message: string }> => {
  try {
    const response = await fetch(`${API_URL}/requests`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        doctor_id: doctorId,
        patient_name: patientName,
        patient_id: patientId,
        request_notes: requestNotes,
        patient_db_id: patientDbId,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: "An error occurred" }));
      throw new Error(errorData.error || "Failed to create request");
    }

    return await response.json();
  } catch (error) {
    console.error("Error creating request:", error);
    toast.error(error instanceof Error ? error.message : "Failed to create request");
    throw error;
  }
};

// Get all X-ray requests (technician)
export const getAllRequests = async (status?: string): Promise<XrayRequest[]> => {
  try {
    const url = status ? `${API_URL}/requests?status=${status}` : `${API_URL}/requests`;
    const response = await fetch(url);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: "An error occurred" }));
      throw new Error(errorData.error || "Failed to fetch requests");
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching requests:", error);
    toast.error(error instanceof Error ? error.message : "Failed to fetch requests");
    throw error;
  }
};

// Get doctor's requests with results
export const getDoctorRequests = async (doctorId: number): Promise<XrayRequest[]> => {
  try {
    const response = await fetch(`${API_URL}/doctor/requests/${doctorId}`);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: "An error occurred" }));
      throw new Error(errorData.error || "Failed to fetch requests");
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching doctor requests:", error);
    toast.error(error instanceof Error ? error.message : "Failed to fetch doctor requests");
    throw error;
  }
};

// ===================== Admin APIs =====================
export interface AdminUserPayload {
  username: string;
  email: string;
  full_name?: string;
  role: "admin" | "doctor" | "xray_technician" | "reception" | "general_doctor";
  password?: string;
  specialty?: string;
}

export interface SpecialistDoctor {
  id: number;
  username: string;
  full_name?: string;
  specialty?: string;
}

export const getAllUsers = async (): Promise<any[]> => {
  const res = await fetch(`${API_URL}/admin/users`);
  if (!res.ok) throw new Error((await res.json().catch(() => ({ error: "Failed" }))).error || "Failed to fetch users");
  return res.json();
};

export const createUser = async (payload: AdminUserPayload) => {
  const res = await fetch(`${API_URL}/admin/users`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error((await res.json().catch(() => ({ error: "Failed" }))).error || "Failed to create user");
  return res.json();
};

export const updateUser = async (id: number, payload: AdminUserPayload) => {
  const res = await fetch(`${API_URL}/admin/users/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error((await res.json().catch(() => ({ error: "Failed" }))).error || "Failed to update user");
  return res.json();
};

export const resetDefaultUsers = async () => {
  const res = await fetch(`${API_URL}/admin/users/reset-defaults`, { method: "POST" });
  if (!res.ok) throw new Error((await res.json().catch(() => ({ error: "Failed" }))).error || "Failed to reset users");
  return res.json();
};



export const banUser = async (id: number) => {
  const res = await fetch(`${API_URL}/admin/users/${id}/ban`, { method: "POST" });
  if (!res.ok) throw new Error((await res.json().catch(() => ({ error: "Failed" }))).error || "Failed to ban user");
  return res.json();
};

export const unbanUser = async (id: number) => {
  const res = await fetch(`${API_URL}/admin/users/${id}/unban`, { method: "POST" });
  if (!res.ok) throw new Error((await res.json().catch(() => ({ error: "Failed" }))).error || "Failed to unban user");
  return res.json();
};

export const getDiagnosis = async (): Promise<any[]> => {
  const res = await fetch(`${API_URL}/admin/diagnosis`);
  if (!res.ok) throw new Error((await res.json().catch(() => ({ error: "Failed" }))).error || "Failed to fetch diagnosis data");
  return res.json();
};

export const getSpecialists = async (): Promise<SpecialistDoctor[]> => {
  const res = await fetch(`${API_URL}/admin/specialists`);
  if (!res.ok) throw new Error((await res.json().catch(() => ({ error: "Failed" }))).error || "Failed to fetch specialists");
  return res.json();
};

// ===================== Patient APIs =====================
export interface PatientRegistrationPayload {
  patient_name: string;
  contact_number?: string;
  age?: number;
  gender?: "male" | "female" | "other";
  medical_history?: string;
  registered_by: number;
}

export const registerPatient = async (payload: PatientRegistrationPayload): Promise<{ message: string; patient_id: number; patient_code: string }> => {
  try {
    const response = await fetch(`${API_URL}/patients`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: "An error occurred" }));
      throw new Error(errorData.error || "Failed to register patient");
    }

    return await response.json();
  } catch (error) {
    console.error("Error registering patient:", error);
    toast.error(error instanceof Error ? error.message : "Failed to register patient");
    throw error;
  }
};

export const searchPatients = async (query: string): Promise<Patient[]> => {
  try {
    const response = await fetch(`${API_URL}/patients/search?q=${encodeURIComponent(query)}`);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: "An error occurred" }));
      throw new Error(errorData.error || "Failed to search patients");
    }

    return await response.json();
  } catch (error) {
    console.error("Error searching patients:", error);
    toast.error(error instanceof Error ? error.message : "Failed to search patients");
    throw error;
  }
};

export const getAllPatients = async (status?: string): Promise<Patient[]> => {
  try {
    const url = status ? `${API_URL}/patients?status=${status}` : `${API_URL}/patients`;
    const response = await fetch(url);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: "An error occurred" }));
      throw new Error(errorData.error || "Failed to fetch patients");
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching patients:", error);
    toast.error(error instanceof Error ? error.message : "Failed to fetch patients");
    throw error;
  }
};

export const referPatient = async (patientId: number, doctorId: number): Promise<{ message: string }> => {
  try {
    const response = await fetch(`${API_URL}/patients/${patientId}/refer`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ referred_to: doctorId }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: "An error occurred" }));
      throw new Error(errorData.error || "Failed to refer patient");
    }

    return await response.json();
  } catch (error) {
    console.error("Error referring patient:", error);
    toast.error(error instanceof Error ? error.message : "Failed to refer patient");
    throw error;
  }
};

export const getReferredPatients = async (doctorId: number): Promise<Patient[]> => {
  try {
    const response = await fetch(`${API_URL}/doctor/${doctorId}/referred-patients`);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: "An error occurred" }));
      throw new Error(errorData.error || "Failed to fetch referred patients");
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching referred patients:", error);
    toast.error(error instanceof Error ? error.message : "Failed to fetch referred patients");
    throw error;
  }
};

// ===================== Password Change API =====================
export const changePassword = async (
  userId: number,
  currentPassword: string,
  newPassword: string
): Promise<{ message: string }> => {
  try {
    const response = await fetch(`${API_URL}/user/${userId}/change-password`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        current_password: currentPassword,
        new_password: newPassword,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: "An error occurred" }));
      throw new Error(errorData.error || "Failed to change password");
    }

    return await response.json();
  } catch (error) {
    console.error("Error changing password:", error);
    toast.error(error instanceof Error ? error.message : "Failed to change password");
    throw error;
  }
};

// ===================== Password Reset APIs =====================
export const requestPasswordReset = async (email: string): Promise<{ message: string }> => {
  try {
    const response = await fetch(`${API_URL}/forgot-password`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: "An error occurred" }));
      throw new Error(errorData.error || "Failed to send reset email");
    }

    return await response.json();
  } catch (error) {
    console.error("Error requesting password reset:", error);
    throw error;
  }
};

export const verifyResetToken = async (token: string): Promise<{ valid: boolean; email?: string }> => {
  try {
    const response = await fetch(`${API_URL}/verify-reset-token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ token }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: "Invalid token" }));
      throw new Error(errorData.error || "Invalid or expired token");
    }

    return await response.json();
  } catch (error) {
    console.error("Error verifying reset token:", error);
    throw error;
  }
};

export const resetPassword = async (token: string, newPassword: string): Promise<{ message: string }> => {
  try {
    const response = await fetch(`${API_URL}/reset-password`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ token, new_password: newPassword }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: "An error occurred" }));
      throw new Error(errorData.error || "Failed to reset password");
    }

    return await response.json();
  } catch (error) {
    console.error("Error resetting password:", error);
    throw error;
  }
};

// ===================== Notification APIs =====================
export interface Notification {
  id: number;
  user_id: number;
  type: string;
  title: string;
  message: string;
  related_id?: string;
  is_read: boolean;
  created_at: string;
}

export const getNotifications = async (userId: number, unreadOnly: boolean = false): Promise<Notification[]> => {
  try {
    const url = `${API_URL}/notifications/${userId}${unreadOnly ? '?unread=true' : ''}`;
    const response = await fetch(url);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: "An error occurred" }));
      throw new Error(errorData.error || "Failed to fetch notifications");
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return [];
  }
};

export const getUnreadCount = async (userId: number): Promise<number> => {
  try {
    const response = await fetch(`${API_URL}/notifications/${userId}/count`);
    
    if (!response.ok) {
      return 0;
    }

    const data = await response.json();
    return data.count || 0;
  } catch (error) {
    console.error("Error fetching unread count:", error);
    return 0;
  }
};

export const markNotificationRead = async (notificationId: number): Promise<void> => {
  try {
    await fetch(`${API_URL}/notifications/${notificationId}/read`, {
      method: "POST",
    });
  } catch (error) {
    console.error("Error marking notification as read:", error);
  }
};

export const markAllNotificationsRead = async (userId: number): Promise<void> => {
  try {
    await fetch(`${API_URL}/notifications/user/${userId}/read-all`, {
      method: "POST",
    });
  } catch (error) {
    console.error("Error marking all notifications as read:", error);
  }
};

// ===================== Session Validation API =====================
export const validateSession = async (userId: number): Promise<{ valid: boolean; error?: string }> => {
  try {
    const response = await fetch(`${API_URL}/validate-session/${userId}`);
    
    if (response.status === 403) {
      const errorData = await response.json().catch(() => ({ error: "Session invalid" }));
      return { valid: false, error: errorData.error };
    }
    
    if (!response.ok) {
      return { valid: false, error: "Session validation failed" };
    }

    return await response.json();
  } catch (error) {
    console.error("Error validating session:", error);
    return { valid: false, error: "Network error" };
  }
};

// ===================== Patient Edit Requests API =====================
export interface PatientEditRequest {
  id: number;
  patient_id: number;
  patient_name: string;
  patient_code?: string;
  request_reason: string;
  status: 'pending_approval' | 'approved_for_edit' | 'changes_submitted' | 'approved_final' | 'rejected';
  original_data?: any;
  proposed_changes?: any;
  review_notes?: string;
  created_at: string;
  approved_at?: string;
  submitted_at?: string;
  final_approved_at?: string;
  requested_by_name?: string;
  requested_by_username?: string;
  reviewed_by_name?: string;
}

export const requestPatientEdit = async (patientId: number, requestedBy: number, reason: string): Promise<{ success: boolean; request_id: number; message: string }> => {
  try {
    const response = await fetch(`${API_URL}/patient-edits/request`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        patient_id: patientId,
        requested_by: requestedBy,
        reason: reason,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: "An error occurred" }));
      throw new Error(errorData.error || "Failed to request patient edit");
    }

    return await response.json();
  } catch (error) {
    console.error("Error requesting patient edit:", error);
    toast.error(error instanceof Error ? error.message : "Failed to request patient edit");
    throw error;
  }
};

export const getMyEditRequests = async (userId: number): Promise<PatientEditRequest[]> => {
  try {
    const response = await fetch(`${API_URL}/patient-edits/my-requests/${userId}`);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: "An error occurred" }));
      throw new Error(errorData.error || "Failed to fetch edit requests");
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching edit requests:", error);
    toast.error(error instanceof Error ? error.message : "Failed to fetch edit requests");
    throw error;
  }
};

export const getPendingEditRequests = async (): Promise<PatientEditRequest[]> => {
  try {
    const response = await fetch(`${API_URL}/patient-edits/pending`);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: "An error occurred" }));
      throw new Error(errorData.error || "Failed to fetch pending requests");
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching pending requests:", error);
    toast.error(error instanceof Error ? error.message : "Failed to fetch pending requests");
    throw error;
  }
};

export const getCompletedEditRequests = async (): Promise<PatientEditRequest[]> => {
  try {
    const response = await fetch(`${API_URL}/patient-edits/completed`);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: "An error occurred" }));
      throw new Error(errorData.error || "Failed to fetch completed requests");
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching completed requests:", error);
    toast.error(error instanceof Error ? error.message : "Failed to fetch completed requests");
    throw error;
  }
};

export const approveEditRequest = async (requestId: number, adminId: number, notes?: string): Promise<{ success: boolean; message: string }> => {
  try {
    const response = await fetch(`${API_URL}/patient-edits/${requestId}/approve`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        admin_id: adminId,
        notes: notes || "",
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: "An error occurred" }));
      throw new Error(errorData.error || "Failed to approve request");
    }

    return await response.json();
  } catch (error) {
    console.error("Error approving request:", error);
    toast.error(error instanceof Error ? error.message : "Failed to approve request");
    throw error;
  }
};

export const rejectEditRequest = async (requestId: number, adminId: number, notes?: string): Promise<{ success: boolean; message: string }> => {
  try {
    const response = await fetch(`${API_URL}/patient-edits/${requestId}/reject`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        admin_id: adminId,
        notes: notes || "",
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: "An error occurred" }));
      throw new Error(errorData.error || "Failed to reject request");
    }

    return await response.json();
  } catch (error) {
    console.error("Error rejecting request:", error);
    toast.error(error instanceof Error ? error.message : "Failed to reject request");
    throw error;
  }
};

export const submitPatientChanges = async (requestId: number, changes: any): Promise<{ success: boolean; message: string }> => {
  try {
    const response = await fetch(`${API_URL}/patient-edits/${requestId}/submit-changes`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        changes: changes,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: "An error occurred" }));
      throw new Error(errorData.error || "Failed to submit changes");
    }

    return await response.json();
  } catch (error) {
    console.error("Error submitting changes:", error);
    toast.error(error instanceof Error ? error.message : "Failed to submit changes");
    throw error;
  }
};

export const getEditRequest = async (requestId: number): Promise<PatientEditRequest> => {
  try {
    const response = await fetch(`${API_URL}/patient-edits/${requestId}`);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: "An error occurred" }));
      throw new Error(errorData.error || "Failed to fetch edit request");
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching edit request:", error);
    toast.error(error instanceof Error ? error.message : "Failed to fetch edit request");
    throw error;
  }
};

// ===================== System Overview APIs =====================
export interface SystemOverview {
  total_users: number;
  total_requests: number;
  total_diagnoses: number;
  pending_requests: number;
  completed_requests: number;
  positive_diagnoses: number;
  negative_diagnoses: number;
  users_by_role: { role: string; count: number }[];
  requests_by_date: { date: string; count: number }[];
  diagnoses_by_date: { date: string; positive: number; negative: number }[];
  system_performance: {
    avg_processing_time: number;
    success_rate: number;
    uptime_percentage: number;
  };
}

export const getSystemOverview = async (): Promise<SystemOverview> => {
  try {
    const response = await fetch(`${API_URL}/admin/system-overview`);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: "An error occurred" }));
      throw new Error(errorData.error || "Failed to fetch system overview");
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching system overview:", error);
    toast.error(error instanceof Error ? error.message : "Failed to fetch system overview");
    throw error;
  }
};

