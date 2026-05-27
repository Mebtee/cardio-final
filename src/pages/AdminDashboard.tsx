import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSessionValidation } from "@/hooks/useSessionValidation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, Plus, RefreshCcw, Save, Search, Download, Filter, Ban, UserCheck, Activity, Users, FileText, TrendingUp, Clock, AlertTriangle } from "lucide-react";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, LineChart, Line, ResponsiveContainer } from "recharts";
import { Checkbox } from "@/components/ui/checkbox";
import { z } from "zod";
import { cn } from "@/lib/utils";
import {
  getAllUsers,
  createUser,
  updateUser,
  resetDefaultUsers,
  banUser,
  unbanUser,
  getDiagnosis,
  validateSession,
  getPendingEditRequests,
  getCompletedEditRequests,
  approveEditRequest,
  rejectEditRequest,
  getEditRequest,
  getSystemOverview,
  User,
  PatientEditRequest,
  SystemOverview
} from "@/services/api";

// Types
interface AdminUser {
  id: number;
  username: string;
  email: string;
  role: "admin" | "doctor" | "xray_technician" | "reception" | "general_doctor";
  full_name?: string;
  specialty?: string;
  created_at?: string;
  is_banned?: boolean;
}

interface DiagnosisRow {
  prediction_id: string;
  request_id: string;
  patient_name: string;
  patient_id?: string;
  status: string;
  created_at: string;
  filename: string;
  prediction: "positive" | "negative";
  confidence: number;
  timestamp: string;
  doctor_name: string;
  doctor_id: number;
}

const userSchema = z.object({
  username: z.string().trim().min(3).max(50),
  email: z.string().trim().email().max(100),
  full_name: z.string().trim().max(100).nullable().optional().transform(val => val || undefined),
  role: z.enum(["admin", "doctor", "xray_technician", "reception", "general_doctor"]),
  password: z.string().trim().min(6).max(255).nullable().optional().transform(val => val || undefined),
  specialty: z.string().trim().max(100).nullable().optional().transform(val => val || undefined),
});

function useSeo(title: string, description: string) {
  useEffect(() => {
    document.title = title;
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute("content", description);
    else {
      const tag = document.createElement("meta");
      tag.setAttribute("name", "description");
      tag.setAttribute("content", description);
      document.head.appendChild(tag);
    }
    // canonical
    const linkId = "canonical-link";
    let canonical = document.getElementById(linkId) as HTMLLinkElement | null;
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.id = linkId;
      canonical.rel = "canonical";
      document.head.appendChild(canonical);
    }
    canonical.href = window.location.href;
  }, [title, description]);
}

const MEDICAL_COLORS = ['#2563eb', '#0d9488', '#64748b', '#3b82f6', '#06b6d4'];

function OverviewTab() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [overview, setOverview] = useState<SystemOverview | null>(null);

  const loadOverview = async () => {
    try {
      setLoading(true);
      const data = await getSystemOverview();
      setOverview(data);
    } catch (error) {
      console.error("Error loading overview:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOverview();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!overview) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-muted-foreground">
            Failed to load system overview data
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with refresh button */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-2">
        <div className="space-y-1">
          <h2 className="text-3xl font-bold gradient-text">System Overview</h2>
          <p className="text-muted-foreground">Monitor system usage, performance, and health metrics</p>
        </div>
        <Button 
          variant="outline" 
          onClick={loadOverview} 
          disabled={loading}
          className="hover:bg-primary/10 transition-all duration-200"
        >
          {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCcw className="mr-2 h-4 w-4" />}
          Refresh
        </Button>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="group overflow-hidden border-0 shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105">
          <div className="absolute top-0 right-0 w-24 h-24 bg-primary/10 rounded-full -mr-8 -mt-8 group-hover:bg-primary/20 transition-colors" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 relative z-10">
            <CardTitle className="text-sm font-semibold text-primary">Total Users</CardTitle>
            <div className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
              <Users className="h-5 w-5 text-primary" />
            </div>
          </CardHeader>
          <CardContent className="pt-2 relative z-10">
            <div className="text-3xl font-bold text-primary mb-1">{overview.total_users}</div>
            <p className="text-xs text-muted-foreground">Active system users</p>
          </CardContent>
        </Card>

        <Card className="group overflow-hidden border-0 shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105">
          <div className="absolute top-0 right-0 w-24 h-24 bg-secondary/10 rounded-full -mr-8 -mt-8 group-hover:bg-secondary/20 transition-colors" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 relative z-10">
            <CardTitle className="text-sm font-semibold text-secondary">Total Requests</CardTitle>
            <div className="p-2 rounded-lg bg-secondary/10 group-hover:bg-secondary/20 transition-colors">
              <FileText className="h-5 w-5 text-secondary" />
            </div>
          </CardHeader>
          <CardContent className="pt-2 relative z-10">
            <div className="text-3xl font-bold text-secondary mb-1">{overview.total_requests}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-amber-600 font-medium">{overview.pending_requests}</span> pending, 
              <span className="text-green-600 font-medium ml-1">{overview.completed_requests}</span> completed
            </p>
          </CardContent>
        </Card>

        <Card className="group overflow-hidden border-0 shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105">
          <div className="absolute top-0 right-0 w-24 h-24 bg-primary/10 rounded-full -mr-8 -mt-8 group-hover:bg-primary/20 transition-colors" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 relative z-10">
            <CardTitle className="text-sm font-semibold text-primary">Total Diagnoses</CardTitle>
            <div className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
              <Activity className="h-5 w-5 text-primary" />
            </div>
          </CardHeader>
          <CardContent className="pt-2 relative z-10">
            <div className="text-3xl font-bold text-primary mb-1">{overview.total_diagnoses}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-red-600 font-medium">{overview.positive_diagnoses}</span> positive, 
              <span className="text-green-600 font-medium ml-1">{overview.negative_diagnoses}</span> negative
            </p>
          </CardContent>
        </Card>

        <Card className="group overflow-hidden border-0 shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105">
          <div className="absolute top-0 right-0 w-24 h-24 bg-secondary/10 rounded-full -mr-8 -mt-8 group-hover:bg-secondary/20 transition-colors" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 relative z-10">
            <CardTitle className="text-sm font-semibold text-secondary">System Performance</CardTitle>
            <div className="p-2 rounded-lg bg-secondary/10 group-hover:bg-secondary/20 transition-colors">
              <TrendingUp className="h-5 w-5 text-secondary" />
            </div>
          </CardHeader>
          <CardContent className="pt-2 relative z-10">
            <div className="text-3xl font-bold text-secondary mb-1">{overview.system_performance.success_rate}%</div>
            <p className="text-xs text-muted-foreground">Success rate</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Users by Role Pie Chart */}
        <Card className="border-0 shadow-md hover:shadow-lg transition-all duration-300">
          <CardHeader className="pb-3">
            <CardTitle className="gradient-text">Users by Role</CardTitle>
            <CardDescription>Distribution of user roles in the system</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={overview.users_by_role}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ role, count, percent }) => `${role}: ${count} (${(percent * 100).toFixed(0)}%)`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                  nameKey="role"
                >
                  {overview.users_by_role.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={MEDICAL_COLORS[index % MEDICAL_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Diagnosis Distribution Pie Chart */}
        <Card className="border-0 shadow-md hover:shadow-lg transition-all duration-300">
          <CardHeader className="pb-3">
            <CardTitle className="gradient-text">Diagnosis Distribution</CardTitle>
            <CardDescription>Positive vs Negative diagnoses</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={[
                    { name: 'Positive', value: overview.positive_diagnoses, color: '#ef4444' },
                    { name: 'Negative', value: overview.negative_diagnoses, color: '#0d9488' }
                  ]}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value, percent }) => `${name}: ${value} (${(percent * 100).toFixed(0)}%)`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  <Cell fill="#ef4444" />
                  <Cell fill="#0d9488" />
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Request Trends Line Chart */}
      <Card className="border-0 shadow-md hover:shadow-lg transition-all duration-300">
        <CardHeader className="pb-3">
          <CardTitle className="gradient-text">Request Trends (Last 30 Days)</CardTitle>
          <CardDescription>Daily X-ray request volume</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={overview.requests_by_date}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.1)" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip 
                contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', border: 'none', borderRadius: '8px', color: '#fff' }}
              />
              <Legend />
              <Line type="monotone" dataKey="count" stroke="#2563eb" strokeWidth={3} dot={{ fill: '#2563eb', r: 5 }} activeDot={{ r: 7 }} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Diagnosis Trends Bar Chart */}
      <Card className="border-0 shadow-md hover:shadow-lg transition-all duration-300">
        <CardHeader className="pb-3">
          <CardTitle className="gradient-text">Diagnosis Trends (Last 30 Days)</CardTitle>
          <CardDescription>Daily positive vs negative diagnoses</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={overview.diagnoses_by_date}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.1)" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip 
                contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', border: 'none', borderRadius: '8px', color: '#fff' }}
              />
              <Legend />
              <Bar dataKey="positive" fill="#ef4444" name="Positive" radius={[8, 8, 0, 0]} />
              <Bar dataKey="negative" fill="#0d9488" name="Negative" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Performance Metrics */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-0 shadow-md hover:shadow-lg transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Processing Time</CardTitle>
            <Clock className="h-5 w-5 text-primary/60" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{overview.system_performance.avg_processing_time} min</div>
            <p className="text-xs text-muted-foreground mt-1">Average time to process requests</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md hover:shadow-lg transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <TrendingUp className="h-5 w-5 text-secondary/60" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-secondary">{overview.system_performance.success_rate}%</div>
            <p className="text-xs text-muted-foreground mt-1">Completed vs total requests</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md hover:shadow-lg transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Uptime</CardTitle>
            <Activity className="h-5 w-5 text-green-600/60" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{overview.system_performance.uptime_percentage}%</div>
            <p className="text-xs text-muted-foreground mt-1">System availability</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function UsersTab({ currentUser }: { currentUser: User | null }) {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState<AdminUser | null>(null);
  const [form, setForm] = useState<Partial<AdminUser> & { password?: string }>({ role: "doctor" });
  
  // Ban confirmation dialog
  const [showBanDialog, setShowBanDialog] = useState(false);
  const [userToBan, setUserToBan] = useState<AdminUser | null>(null);

  const showSpecialty = form.role === "doctor";

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return users.filter(
      (u) =>
        u.username.toLowerCase().includes(q) ||
        (u.email?.toLowerCase().includes(q) ?? false) ||
        (u.full_name?.toLowerCase().includes(q) ?? false)
    );
  }, [users, query]);

  const load = async () => {
    try {
      setLoading(true);
      const data = await getAllUsers();
      setUsers(data);
    } catch (e) {
      // toast handled in api
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleOpenCreate = () => {
    setEditing(null);
    setForm({ role: "doctor" });
    setOpen(true);
  };

  const handleOpenEdit = (user: AdminUser) => {
    setEditing(user);
    setForm({ 
      ...user,
      full_name: user.full_name || "",
      specialty: user.specialty || "",
      password: "" // Always start with empty password for editing
    });
    setOpen(true);
  };

  const submit = async () => {
    // Prepare form data with proper null/undefined handling
    const formData = {
      ...form,
      full_name: form.full_name?.trim() || undefined,
      specialty: form.specialty?.trim() || undefined,
      password: form.password?.trim() || undefined
    };

    const parsed = userSchema.safeParse(formData);
    if (!parsed.success) {
      const msg = parsed.error.issues[0]?.message || "Please fix form errors";
      toast({ title: "Invalid data", description: msg, variant: "destructive" });
      return;
    }
    
    try {
      setSaving(true);
      if (editing) {
        await updateUser(editing.id, {
          username: parsed.data.username,
          email: parsed.data.email,
          full_name: parsed.data.full_name,
          role: parsed.data.role,
          password: parsed.data.password,
          specialty: parsed.data.role === "doctor" ? parsed.data.specialty : undefined,
        });
        toast({ title: "User updated" });
      } else {
        await createUser({
          username: parsed.data.username,
          email: parsed.data.email,
          full_name: parsed.data.full_name,
          role: parsed.data.role,
          password: parsed.data.password || "admin123",
          specialty: parsed.data.role === "doctor" ? parsed.data.specialty : undefined,
        });
        toast({ title: "User created" });
      }
      setOpen(false);
      setForm({ role: "doctor" });
      await load();
    } catch (e) {
      // errors handled in api
    } finally {
      setSaving(false);
    }
  };

  const handleBanUser = (user: AdminUser) => {
    setUserToBan(user);
    setShowBanDialog(true);
  };

  const confirmBanUser = async () => {
    if (!userToBan || !currentUser) return;
    
    try {
      setSaving(true);
      
      // Check session before performing critical action
      const sessionCheck = await validateSession(currentUser.id);
      if (!sessionCheck.valid) {
        toast({ title: "Session expired", description: sessionCheck.error || "Please log in again", variant: "destructive" });
        localStorage.removeItem("user");
        navigate("/");
        return;
      }
      
      if (userToBan.is_banned) {
        await unbanUser(userToBan.id);
        toast({ title: "User unbanned", description: `${userToBan.username} has been unbanned` });
      } else {
        await banUser(userToBan.id);
        toast({ title: "User banned", description: `${userToBan.username} has been banned` });
      }
      setShowBanDialog(false);
      setUserToBan(null);
      await load();
    } catch (e) {
      // errors handled in api
    } finally {
      setSaving(false);
    }
  };

  const resetDefaults = async () => {
    try {
      setSaving(true);
      await resetDefaultUsers();
      await load();
      toast({ title: "Default users reset", description: "Try logging in with admin123." });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card className="border-0 shadow-md">
      <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4">
        <div className="space-y-1">
          <CardTitle className="gradient-text text-2xl">Manage Users</CardTitle>
          <CardDescription>Create, update, and manage system users and roles</CardDescription>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button 
            variant="outline" 
            onClick={load} 
            disabled={loading}
            className="hover:bg-primary/10 transition-all duration-200"
          >
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCcw className="mr-2 h-4 w-4" />}
            Reload
          </Button>
          <Button 
            variant="secondary" 
            onClick={resetDefaults} 
            disabled={saving}
            className="hover:scale-105 transition-transform"
          >
            {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCcw className="mr-2 h-4 w-4" />}
            Reset Defaults
          </Button>
          <Button 
            onClick={handleOpenCreate}
            className="bg-primary hover:bg-primary/90 transition-all duration-200"
          >
            <Plus className="mr-2 h-4 w-4" /> New User
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              className="pl-10 h-10 border-0 bg-muted/50 focus:bg-muted transition-colors" 
              placeholder="Search users by name, email..." 
              value={query} 
              onChange={(e) => setQuery(e.target.value)} 
            />
          </div>
          <Button 
            variant="outline" 
            onClick={load}
            className="whitespace-nowrap hover:bg-primary/10"
          >
            <RefreshCcw className="h-4 w-4" />
          </Button>
        </div>
        <div className="overflow-x-auto rounded-lg border border-border/50">
          <Table>
            <TableHeader>
              <TableRow className="border-b border-border/50 hover:bg-transparent">
                <TableHead className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Username</TableHead>
                <TableHead className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Full name</TableHead>
                <TableHead className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Email</TableHead>
                <TableHead className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Role</TableHead>
                <TableHead className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</TableHead>
                <TableHead className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Created</TableHead>
                <TableHead className="text-xs font-semibold text-muted-foreground uppercase tracking-wider text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    <Loader2 className="mr-2 inline h-5 w-5 animate-spin text-primary" /> Loading users...
                  </TableCell>
                </TableRow>
              ) : filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    No users found
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((u) => (
                  <TableRow key={u.id} className="hover:bg-muted/50 transition-colors border-b border-border/30">
                    <TableCell className="font-medium">{u.username}</TableCell>
                    <TableCell className="text-muted-foreground">{u.full_name || "-"}</TableCell>
                    <TableCell className="text-muted-foreground text-sm">{u.email}</TableCell>
                    <TableCell>
                      <div className="capitalize text-sm">
                        <span className="px-2 py-1 rounded-full bg-primary/10 text-primary font-medium">
                          {u.role.replace("_", " ")}
                        </span>
                        {u.role === "doctor" && u.specialty && (
                          <p className="text-xs text-muted-foreground mt-1">({u.specialty})</p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold inline-block ${
                        u.is_banned 
                          ? "bg-destructive/10 text-destructive" 
                          : "bg-green-100/50 text-green-700"
                      }`}>
                        {u.is_banned ? "Banned" : "Active"}
                      </span>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {u.created_at ? new Date(u.created_at).toLocaleDateString() : "-"}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex gap-2 justify-end">
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={() => handleOpenEdit(u)}
                          className="hover:bg-primary/10 transition-colors"
                        >
                          Edit
                        </Button>
                        <Button 
                          size="sm" 
                          variant={u.is_banned ? "default" : "secondary"}
                          onClick={() => handleBanUser(u)}
                          className="hover:scale-105 transition-transform"
                        >
                          {u.is_banned ? <UserCheck className="h-4 w-4" /> : <Ban className="h-4 w-4" />}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="border-0 shadow-lg">
          <DialogHeader className="space-y-2">
            <DialogTitle className="text-xl gradient-text">
              {editing ? "Edit User" : "Create New User"}
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-5 py-4">
            <div className="grid gap-2">
              <Label className="font-semibold text-sm">Username</Label>
              <Input 
                className="border-0 bg-muted/50 focus:bg-muted h-10"
                value={form.username || ""} 
                onChange={(e) => setForm((f) => ({ ...f, username: e.target.value }))} 
              />
            </div>
            <div className="grid gap-2">
              <Label className="font-semibold text-sm">Email</Label>
              <Input 
                type="email" 
                className="border-0 bg-muted/50 focus:bg-muted h-10"
                value={form.email || ""} 
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} 
              />
            </div>
            <div className="grid gap-2">
              <Label className="font-semibold text-sm">Full name</Label>
              <Input 
                className="border-0 bg-muted/50 focus:bg-muted h-10"
                value={form.full_name || ""} 
                onChange={(e) => setForm((f) => ({ ...f, full_name: e.target.value }))} 
              />
            </div>
            <div className="grid gap-2">
              <Label className="font-semibold text-sm">Role</Label>
              <Select value={form.role} onValueChange={(v) => setForm((f) => ({ ...f, role: v as AdminUser["role"] }))}>
                <SelectTrigger className="border-0 bg-muted/50 h-10">
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="doctor">Doctor</SelectItem>
                  <SelectItem value="xray_technician">X-ray Technician</SelectItem>
                  <SelectItem value="reception">Reception</SelectItem>
                  <SelectItem value="general_doctor">General Doctor</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {showSpecialty && (
              <div className="grid gap-2">
                <Label className="font-semibold text-sm">Specialty</Label>
                <Input 
                  placeholder="e.g., Cardiology, Radiology"
                  className="border-0 bg-muted/50 focus:bg-muted h-10"
                  value={form.specialty || ""} 
                  onChange={(e) => setForm((f) => ({ ...f, specialty: e.target.value }))} 
                />
              </div>
            )}
            <div className="grid gap-2">
              <Label className="font-semibold text-sm">{editing ? "New password (optional)" : "Password"}</Label>
              <Input 
                type="password" 
                className="border-0 bg-muted/50 focus:bg-muted h-10"
                value={form.password || ""} 
                onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))} 
              />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button onClick={() => setOpen(false)} variant="outline" className="hover:bg-muted">
              Cancel
            </Button>
            <Button 
              onClick={submit} 
              disabled={saving}
              className="bg-primary hover:bg-primary/90 transition-all"
            >
              {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Ban/Unban User Confirmation Dialog */}
      <AlertDialog open={showBanDialog} onOpenChange={setShowBanDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {userToBan?.is_banned ? "Unban User" : "Ban User"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to {userToBan?.is_banned ? "unban" : "ban"} user <strong>{userToBan?.username}</strong>?
              <br /><br />
              {userToBan?.is_banned 
                ? "This user will regain access to the system and be able to log in."
                : "This user will be prevented from logging into the system."
              }
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setShowBanDialog(false)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmBanUser} 
              disabled={saving}
              className={userToBan?.is_banned ? "" : "bg-destructive text-destructive-foreground hover:bg-destructive/90"}
            >
              {saving ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : userToBan?.is_banned ? (
                <UserCheck className="mr-2 h-4 w-4" />
              ) : (
                <Ban className="mr-2 h-4 w-4" />
              )}
              {userToBan?.is_banned ? "Unban User" : "Ban User"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}

function DiagnosisTab() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState<DiagnosisRow[]>([]);
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
  const [showFilters, setShowFilters] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [minConfidence, setMinConfidence] = useState(0);
  const [maxConfidence, setMaxConfidence] = useState(100);
  const [predictionFilter, setPredictionFilter] = useState("all");

  const load = async () => {
    try {
      setLoading(true);
      const data = await getDiagnosis();
      setRows(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const filteredRows = useMemo(() => {
    return rows.filter((r) => {
      const createdDate = new Date(r.created_at);
      const confidencePercent = r.confidence * 100;

      if (startDate && createdDate < new Date(startDate)) return false;
      if (endDate && createdDate > new Date(endDate + "T23:59:59")) return false;
      if (confidencePercent < minConfidence || confidencePercent > maxConfidence) return false;
      if (predictionFilter !== "all" && r.prediction !== predictionFilter) return false;

      return true;
    });
  }, [rows, startDate, endDate, minConfidence, maxConfidence, predictionFilter]);

  const toggleSelectAll = () => {
    if (selectedRows.size === filteredRows.length) {
      setSelectedRows(new Set());
    } else {
      setSelectedRows(new Set(filteredRows.map((r) => r.prediction_id)));
    }
  };

  const toggleSelectRow = (id: string) => {
    const newSet = new Set(selectedRows);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setSelectedRows(newSet);
  };

  const downloadSingleImage = async (row: DiagnosisRow) => {
    try {
      // Use prediction_id to fetch the image from the backend
      const response = await fetch(`http://localhost:5000/uploads/${row.prediction_id}`);
      if (!response.ok) throw new Error("Image not found");
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${row.request_id}_${row.patient_name}_${row.filename}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast({ title: "Image downloaded" });
    } catch (error) {
      toast({ title: "Download failed", description: "Could not download image", variant: "destructive" });
    }
  };

  const downloadBulkImages = async () => {
    if (selectedRows.size === 0) {
      toast({ title: "No images selected", description: "Please select images to download", variant: "destructive" });
      return;
    }

    try {
      const selectedData = filteredRows.filter((r) => selectedRows.has(r.prediction_id));
      
      for (const row of selectedData) {
        await downloadSingleImage(row);
        await new Promise(resolve => setTimeout(resolve, 500)); // Delay between downloads
      }
      
      toast({ title: "Bulk download complete", description: `Downloaded ${selectedRows.size} images` });
    } catch (error) {
      toast({ title: "Bulk download failed", variant: "destructive" });
    }
  };

  const clearFilters = () => {
    setStartDate("");
    setEndDate("");
    setMinConfidence(0);
    setMaxConfidence(100);
    setPredictionFilter("all");
  };

  return (
    <Card className="border-0 shadow-md">
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-1">
            <CardTitle className="gradient-text text-2xl">Diagnosis Data</CardTitle>
            <CardDescription>All saved predictions linked to X-ray requests</CardDescription>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button 
              variant="outline" 
              onClick={load} 
              disabled={loading}
              className="hover:bg-primary/10 transition-all"
            >
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCcw className="mr-2 h-4 w-4" />}
              Reload
            </Button>
            <Button 
              variant="outline" 
              onClick={() => setShowFilters(!showFilters)}
              className="hover:bg-primary/10 transition-all"
            >
              <Filter className="mr-2 h-4 w-4" />
              {showFilters ? "Hide" : "Show"} Filters
            </Button>
            <Button 
              onClick={downloadBulkImages} 
              disabled={selectedRows.size === 0}
              className="bg-primary hover:bg-primary/90 transition-all"
            >
              <Download className="mr-2 h-4 w-4" />
              Download ({selectedRows.size})
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {showFilters && (
          <Card className="border-0 bg-muted/30 p-4">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
              <div className="space-y-2">
                <Label className="text-xs font-semibold">Start Date</Label>
                <Input 
                  type="date" 
                  className="border-0 bg-background h-9"
                  value={startDate} 
                  onChange={(e) => setStartDate(e.target.value)} 
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-semibold">End Date</Label>
                <Input 
                  type="date" 
                  className="border-0 bg-background h-9"
                  value={endDate} 
                  onChange={(e) => setEndDate(e.target.value)} 
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-semibold">Prediction</Label>
                <Select value={predictionFilter} onValueChange={setPredictionFilter}>
                  <SelectTrigger className="border-0 bg-background h-9">
                    <SelectValue placeholder="Filter" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Predictions</SelectItem>
                    <SelectItem value="positive">Positive</SelectItem>
                    <SelectItem value="negative">Negative</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-semibold">Confidence: {minConfidence}% - {maxConfidence}%</Label>
                <div className="flex gap-2 items-center">
                  <Input 
                    type="number" 
                    min="0" 
                    max="100" 
                    className="w-16 border-0 bg-background h-9"
                    value={minConfidence}
                    onChange={(e) => setMinConfidence(Number(e.target.value))}
                  />
                  <span className="text-muted-foreground text-xs">to</span>
                  <Input 
                    type="number" 
                    min="0" 
                    max="100" 
                    className="w-16 border-0 bg-background h-9"
                    value={maxConfidence}
                    onChange={(e) => setMaxConfidence(Number(e.target.value))}
                  />
                </div>
              </div>
              <div className="flex items-end">
                <Button 
                  variant="outline" 
                  onClick={clearFilters} 
                  className="w-full hover:bg-muted"
                >
                  Clear
                </Button>
              </div>
            </div>
            <div className="mt-3 text-xs text-muted-foreground font-medium">
              Showing <span className="text-primary">{filteredRows.length}</span> of <span className="text-primary">{rows.length}</span> results
            </div>
          </Card>
        )}

        <div className="overflow-x-auto rounded-lg border border-border/50">
          <Table>
            <TableHeader>
              <TableRow className="border-b border-border/50 hover:bg-transparent">
                <TableHead className="w-12"></TableHead>
                <TableHead className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Request</TableHead>
                <TableHead className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Patient</TableHead>
                <TableHead className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Doctor</TableHead>
                <TableHead className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Prediction</TableHead>
                <TableHead className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Confidence</TableHead>
                <TableHead className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Created</TableHead>
                <TableHead className="text-xs font-semibold text-muted-foreground uppercase tracking-wider text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8">
                    <Loader2 className="mr-2 inline h-5 w-5 animate-spin text-primary" /> Loading...
                  </TableCell>
                </TableRow>
              ) : filteredRows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                    No diagnostic data found
                  </TableCell>
                </TableRow>
              ) : (
                filteredRows.map((r) => (
                  <TableRow key={r.prediction_id} className="hover:bg-muted/50 transition-colors border-b border-border/30">
                    <TableCell>
                      <Checkbox 
                        checked={selectedRows.has(r.prediction_id)}
                        onCheckedChange={() => toggleSelectRow(r.prediction_id)}
                      />
                    </TableCell>
                    <TableCell className="font-medium text-sm">{r.request_id}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{r.patient_name}{r.patient_id ? ` (${r.patient_id})` : ""}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{r.doctor_name}</TableCell>
                    <TableCell className="text-sm font-semibold">
                      <span className={cn(
                        "px-2 py-1 rounded-full text-xs",
                        r.prediction === "positive" 
                          ? "bg-destructive/10 text-destructive" 
                          : "bg-green-100/50 text-green-700"
                      )}>
                        {r.prediction}
                      </span>
                    </TableCell>
                    <TableCell className="text-sm font-medium">{(r.confidence * 100).toFixed(1)}%</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{new Date(r.created_at).toLocaleDateString()}</TableCell>
                    <TableCell className="text-right">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => downloadSingleImage(r)}
                        className="hover:bg-primary/10 transition-colors"
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}

function EditRequestsTab() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("pending");
  const [loading, setLoading] = useState(true);
  const [pendingRequests, setPendingRequests] = useState<PatientEditRequest[]>([]);
  const [completedRequests, setCompletedRequests] = useState<PatientEditRequest[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<PatientEditRequest | null>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setCurrentUser(JSON.parse(storedUser));
    }
    loadEditRequests();
  }, []);

  const loadEditRequests = async () => {
    try {
      setLoading(true);
      const [pendingData, completedData] = await Promise.all([
        getPendingEditRequests(),
        getCompletedEditRequests()
      ]);
      setPendingRequests(pendingData);
      setCompletedRequests(completedData);
    } catch (error) {
      console.error("Error loading edit requests:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (requestId: number) => {
    if (!currentUser) return;
    
    try {
      await approveEditRequest(requestId, currentUser.id);
      toast({ title: "Request approved", description: "The edit request has been approved" });
      await loadEditRequests();
    } catch (error) {
      console.error("Error approving request:", error);
    }
  };

  const handleReject = async (requestId: number) => {
    if (!currentUser) return;
    
    try {
      await rejectEditRequest(requestId, currentUser.id, "Request rejected by admin");
      toast({ title: "Request rejected", description: "The edit request has been rejected" });
      await loadEditRequests();
    } catch (error) {
      console.error("Error rejecting request:", error);
    }
  };

  const handleViewDetails = async (request: PatientEditRequest) => {
    try {
      // Get full request details including original and proposed data
      const fullRequest = await getEditRequest(request.id);
      setSelectedRequest(fullRequest);
      setShowDetailsDialog(true);
    } catch (error) {
      console.error("Error loading request details:", error);
      toast({ title: "Error", description: "Failed to load request details", variant: "destructive" });
    }
  };

  const currentRequests = activeTab === "pending" ? pendingRequests : completedRequests;

  return (
    <>
      <Card className="medical-card">
        <CardHeader className="medical-card-header">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle className="medical-heading text-primary">Patient Edit Requests</CardTitle>
              <CardDescription>Review and manage patient data edit requests</CardDescription>
            </div>
            <Button variant="outline" onClick={loadEditRequests} disabled={loading} className="btn-medical-outline">
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCcw className="mr-2 h-4 w-4" />}
              Reload
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Sub-tabs for Pending and Completed */}
          <div className="mb-6">
            <div className="flex space-x-1 bg-muted/50 p-1 rounded-lg">
              <button
                onClick={() => setActiveTab("pending")}
                className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
                  activeTab === "pending"
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground hover:bg-background/50"
                }`}
              >
                Pending ({pendingRequests.length})
              </button>
              <button
                onClick={() => setActiveTab("completed")}
                className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
                  activeTab === "completed"
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground hover:bg-background/50"
                }`}
              >
                Completed ({completedRequests.length})
              </button>
            </div>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Patient</TableHead>
                  <TableHead>Requested By</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead>Status</TableHead>
                  {activeTab === "completed" && <TableHead>Reviewed By</TableHead>}
                  <TableHead>{activeTab === "pending" ? "Created" : "Completed"}</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={activeTab === "completed" ? 7 : 6} className="text-center">
                      <Loader2 className="mr-2 inline h-4 w-4 animate-spin" /> Loading requests...
                    </TableCell>
                  </TableRow>
                ) : currentRequests.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={activeTab === "completed" ? 7 : 6} className="text-center text-muted-foreground">
                      No {activeTab} edit requests
                    </TableCell>
                  </TableRow>
                ) : (
                  currentRequests.map((request) => (
                    <TableRow key={request.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{request.patient_name}</div>
                          <div className="text-sm text-muted-foreground">{request.patient_code || "No ID"}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{request.requested_by_name}</div>
                          <div className="text-sm text-muted-foreground">@{request.requested_by_username}</div>
                        </div>
                      </TableCell>
                      <TableCell className="max-w-xs">
                        <div className="truncate" title={request.request_reason}>
                          {request.request_reason}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          request.status === 'pending_approval' ? "status-pending" :
                          request.status === 'changes_submitted' ? "bg-purple-50 text-purple-700 border border-purple-200" :
                          request.status === 'approved_final' ? "status-completed" :
                          request.status === 'rejected' ? "bg-red-50 text-red-700 border border-red-200" :
                          "bg-gray-50 text-gray-700 border border-gray-200"
                        }`}>
                          {request.status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </span>
                      </TableCell>
                      {activeTab === "completed" && (
                        <TableCell>
                          <div className="text-sm">
                            {request.reviewed_by_name || "System"}
                          </div>
                        </TableCell>
                      )}
                      <TableCell>
                        {activeTab === "pending" ? (
                          request.submitted_at ? new Date(request.submitted_at).toLocaleDateString() :
                          new Date(request.created_at).toLocaleDateString()
                        ) : (
                          request.final_approved_at ? new Date(request.final_approved_at).toLocaleDateString() :
                          new Date(request.created_at).toLocaleDateString()
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex gap-2 justify-end">
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleViewDetails(request)}
                            className="btn-medical-outline"
                          >
                            View Details
                          </Button>
                          {activeTab === "pending" && (
                            <>
                              <Button 
                                size="sm" 
                                onClick={() => handleApprove(request.id)}
                                className="btn-medical-primary"
                              >
                                Approve
                              </Button>
                              <Button 
                                size="sm" 
                                variant="destructive"
                                onClick={() => handleReject(request.id)}
                              >
                                Reject
                              </Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* View Details Dialog */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Patient Edit Request Details</DialogTitle>
        </DialogHeader>
        {selectedRequest && (
          <div className="space-y-6">
            {/* Request Information */}
            <div className="grid grid-cols-2 gap-4 p-6 bg-gradient-to-r from-muted/30 to-accent/10 rounded-xl border">
              <div>
                <h4 className="font-semibold text-sm text-primary mb-1">Patient</h4>
                <p className="font-medium text-lg">{selectedRequest.patient_name}</p>
                <p className="text-sm text-muted-foreground">{selectedRequest.patient_code || "No ID"}</p>
              </div>
              <div>
                <h4 className="font-semibold text-sm text-primary mb-1">Requested By</h4>
                <p className="font-medium text-lg">{selectedRequest.requested_by_name}</p>
                <p className="text-sm text-muted-foreground">@{selectedRequest.requested_by_username}</p>
              </div>
              <div>
                <h4 className="font-semibold text-sm text-primary mb-1">Reason</h4>
                <p className="text-sm">{selectedRequest.request_reason}</p>
              </div>
              <div>
                <h4 className="font-semibold text-sm text-primary mb-1">Status</h4>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  selectedRequest.status === 'pending_approval' ? "status-pending" :
                  selectedRequest.status === 'changes_submitted' ? "bg-purple-50 text-purple-700 border border-purple-200" :
                  selectedRequest.status === 'approved_final' ? "status-completed" :
                  selectedRequest.status === 'rejected' ? "bg-red-50 text-red-700 border border-red-200" :
                  "bg-gray-50 text-gray-700 border border-gray-200"
                }`}>
                  {selectedRequest.status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </span>
              </div>
              {selectedRequest.reviewed_by_name && (
                <div>
                  <h4 className="font-semibold text-sm text-primary mb-1">Reviewed By</h4>
                  <p className="font-medium">{selectedRequest.reviewed_by_name}</p>
                </div>
              )}
              {selectedRequest.review_notes && (
                <div>
                  <h4 className="font-semibold text-sm text-primary mb-1">Review Notes</h4>
                  <p className="text-sm">{selectedRequest.review_notes}</p>
                </div>
              )}
            </div>

            {/* Data Comparison */}
            {selectedRequest.original_data && selectedRequest.proposed_changes && (
              <div>
                <h3 className="text-lg font-semibold mb-4">Data Changes</h3>
                <div className="space-y-4">
                  {Object.keys(selectedRequest.proposed_changes).map((field) => {
                    const originalValue = selectedRequest.original_data?.[field];
                    const proposedValue = selectedRequest.proposed_changes?.[field];
                    const hasChanged = originalValue !== proposedValue;
                    
                    return (
                      <div key={field} className={`p-3 rounded-lg border ${hasChanged ? 'bg-yellow-50 border-yellow-200' : 'bg-gray-50 border-gray-200'}`}>
                        <h4 className="font-medium text-sm text-gray-700 mb-2 capitalize">
                          {field.replace('_', ' ')}
                          {hasChanged && <span className="ml-2 text-xs bg-yellow-200 text-yellow-800 px-2 py-1 rounded">CHANGED</span>}
                        </h4>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-xs text-gray-500 mb-1">Original</p>
                            <p className={`p-2 rounded ${hasChanged ? 'bg-red-100 text-red-800' : 'bg-gray-100'}`}>
                              {originalValue || <span className="text-gray-400 italic">Empty</span>}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 mb-1">Proposed</p>
                            <p className={`p-2 rounded ${hasChanged ? 'bg-green-100 text-green-800' : 'bg-gray-100'}`}>
                              {proposedValue || <span className="text-gray-400 italic">Empty</span>}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Timeline */}
            <div>
              <h3 className="text-lg font-semibold mb-4 medical-heading text-primary">Timeline</h3>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-4 h-4 bg-blue-500 rounded-full flex-shrink-0"></div>
                  <div className="flex-1">
                    <p className="font-medium">Request Created</p>
                    <p className="text-sm text-muted-foreground">{new Date(selectedRequest.created_at).toLocaleString()}</p>
                  </div>
                </div>
                {selectedRequest.approved_at && (
                  <div className="flex items-center gap-4">
                    <div className="w-4 h-4 bg-green-500 rounded-full flex-shrink-0"></div>
                    <div className="flex-1">
                      <p className="font-medium">Approved for Editing</p>
                      <p className="text-sm text-muted-foreground">{new Date(selectedRequest.approved_at).toLocaleString()}</p>
                      {selectedRequest.reviewed_by_name && (
                        <p className="text-xs text-muted-foreground">by {selectedRequest.reviewed_by_name}</p>
                      )}
                    </div>
                  </div>
                )}
                {selectedRequest.submitted_at && (
                  <div className="flex items-center gap-4">
                    <div className="w-4 h-4 bg-purple-500 rounded-full flex-shrink-0"></div>
                    <div className="flex-1">
                      <p className="font-medium">Changes Submitted</p>
                      <p className="text-sm text-muted-foreground">{new Date(selectedRequest.submitted_at).toLocaleString()}</p>
                    </div>
                  </div>
                )}
                {selectedRequest.final_approved_at && (
                  <div className="flex items-center gap-4">
                    <div className={`w-4 h-4 rounded-full flex-shrink-0 ${
                      selectedRequest.status === 'approved_final' ? 'bg-green-600' : 'bg-red-500'
                    }`}></div>
                    <div className="flex-1">
                      <p className="font-medium">
                        {selectedRequest.status === 'approved_final' ? 'Changes Approved & Applied' : 'Request Rejected'}
                      </p>
                      <p className="text-sm text-muted-foreground">{new Date(selectedRequest.final_approved_at).toLocaleString()}</p>
                      {selectedRequest.reviewed_by_name && (
                        <p className="text-xs text-muted-foreground">by {selectedRequest.reviewed_by_name}</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
        <DialogFooter>
          <Button variant="outline" onClick={() => setShowDetailsDialog(false)} className="btn-medical-outline">
            Close
          </Button>
          {selectedRequest && selectedRequest.status === 'changes_submitted' && (
            <div className="flex gap-2">
              <Button 
                variant="destructive"
                onClick={() => {
                  setShowDetailsDialog(false);
                  handleReject(selectedRequest.id);
                }}
              >
                Reject Changes
              </Button>
              <Button 
                onClick={() => {
                  setShowDetailsDialog(false);
                  handleApprove(selectedRequest.id);
                }}
                className="btn-medical-primary"
              >
                Approve Changes
              </Button>
            </div>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
    </>
  );
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  
  // Session validation hook
  useSessionValidation(currentUser);

  useSeo("Admin | Cardiomegaly Detection System", "Admin dashboard for managing users and diagnosis data in Cardiomegaly Detection System");

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (!storedUser) {
      toast({ title: "Access denied", description: "Please login first", variant: "destructive" });
      navigate("/");
      return;
    }
    try {
      const user: User = JSON.parse(storedUser);
      if (user.role !== "admin") {
        toast({ title: "Access denied", description: "Admin access required", variant: "destructive" });
        navigate("/");
        return;
      }
      setCurrentUser(user);
      setIsAuthorized(true);
    } catch {
      navigate("/");
    }
  }, [navigate, toast]);

  if (!isAuthorized) {
    return (
      <main className="flex items-center justify-center min-h-[70vh] bg-gradient-to-b from-background to-muted/20">
        <div className="text-center space-y-6 p-8">
          <div className="relative mx-auto mb-4">
            <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full"></div>
            <Loader2 className="h-16 w-16 animate-spin text-primary mx-auto relative" />
          </div>
          <div className="space-y-2">
            <p className="text-lg font-semibold text-foreground">Verifying Admin Access</p>
            <p className="text-muted-foreground">Authenticating your credentials...</p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="space-y-8 pb-8">
      <header className="rounded-xl bg-gradient-to-r from-primary/10 via-accent/5 to-secondary/10 backdrop-blur border border-border/50 p-8 shadow-md">
        <div className="flex items-center gap-4 mb-6">
          <div className="p-3 rounded-xl bg-primary/20 backdrop-blur-sm">
            <Activity className="h-8 w-8 text-primary" />
          </div>
          <div className="flex-1">
            <h1 className="text-4xl font-bold gradient-text">Admin Dashboard</h1>
            <p className="text-muted-foreground text-sm">
              System administration, monitoring and control center
            </p>
          </div>
        </div>
        <div className="flex items-center gap-6 text-sm flex-wrap">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-muted-foreground font-medium">System Status: <span className="text-green-600">Online</span></span>
          </div>
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-primary/60" />
            <span className="text-muted-foreground font-medium">Admin: <span className="text-primary font-semibold">{currentUser?.full_name || currentUser?.username}</span></span>
          </div>
        </div>
      </header>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4 bg-muted/30 p-1 rounded-xl border border-border/50 shadow-sm">
          <TabsTrigger 
            value="overview" 
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md rounded-lg transition-all duration-200 font-medium"
          >
            Overview
          </TabsTrigger>
          <TabsTrigger 
            value="users"
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md rounded-lg transition-all duration-200 font-medium"
          >
            Users
          </TabsTrigger>
          <TabsTrigger 
            value="diagnosis"
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md rounded-lg transition-all duration-200 font-medium"
          >
            Diagnosis Data
          </TabsTrigger>
          <TabsTrigger 
            value="edit-requests"
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md rounded-lg transition-all duration-200 font-medium"
          >
            Edit Requests
          </TabsTrigger>
        </TabsList>
        <div className="mt-8 space-y-6 fade-in">
          <TabsContent value="overview" className="space-y-6 slide-in-from-bottom-4">
            <OverviewTab />
          </TabsContent>
          <TabsContent value="users" className="space-y-6 slide-in-from-bottom-4">
            <UsersTab currentUser={currentUser} />
          </TabsContent>
          <TabsContent value="diagnosis" className="space-y-6 slide-in-from-bottom-4">
            <DiagnosisTab />
          </TabsContent>
          <TabsContent value="edit-requests" className="space-y-6 slide-in-from-bottom-4">
            <EditRequestsTab />
          </TabsContent>
        </div>
      </Tabs>
    </main>
  );
}
