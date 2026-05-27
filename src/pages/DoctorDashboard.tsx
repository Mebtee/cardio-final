import { useState, useEffect, useMemo } from "react";
import { useSessionValidation } from "@/hooks/useSessionValidation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { createXrayRequest, getDoctorRequests, getReferredPatients, type XrayRequest, type User, type Patient } from "@/services/api";
import { Loader2, FileText, Send, Users, Search, RefreshCw, Heart, TrendingUp } from "lucide-react";
import { toast } from "sonner";
import AuthForm from "@/components/AuthForm";
import RequestFilters from "@/components/RequestFilters";
import { NotificationBell } from "@/components/NotificationBell";

const DoctorDashboard = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  
  // Session validation hook
  useSessionValidation(user);
  const [requests, setRequests] = useState<XrayRequest[]>([]);
  const [referredPatients, setReferredPatients] = useState<Patient[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isCreating, setIsCreating] = useState<string | null>(null);
  const [dateFilter, setDateFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredRequests = useMemo(() => {
    return requests.filter((request) => {
      const matchesDate = !dateFilter || new Date(request.created_at).toISOString().split('T')[0] === dateFilter;
      const matchesStatus = statusFilter === "all" || request.status === statusFilter;
      const matchesSearch = !searchQuery || 
        request.patient_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (request.patient_id && request.patient_id.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesDate && matchesStatus && matchesSearch;
    });
  }, [requests, dateFilter, statusFilter, searchQuery]);

  const clearFilters = () => {
    setDateFilter("");
    setStatusFilter("all");
    setSearchQuery("");
  };

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        if (userData.role === 'doctor') {
          setUser(userData);
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.error("Error parsing stored user:", error);
      }
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated && user) {
      fetchRequests();
      fetchReferredPatients();
    }
  }, [isAuthenticated, user]);

  const fetchRequests = async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const data = await getDoctorRequests(user.id);
      setRequests(data);
    } catch (error) {
      console.error("Error fetching requests:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchReferredPatients = async () => {
    if (!user) return;
    try {
      const data = await getReferredPatients(user.id);
      setReferredPatients(data);
    } catch (error) {
      console.error("Error fetching referred patients:", error);
    }
  };

  const handleAuthentication = (success: boolean, userData?: User) => {
    setIsAuthenticated(success);
    if (success && userData) {
      if (userData.role !== 'doctor') {
        toast.error("Access denied. This page is for doctors only.");
        setIsAuthenticated(false);
        return;
      }
      setUser(userData);
    }
  };

  const handleCreateXrayRequest = async (patient: Patient) => {
    if (!user) return;
    
    setIsCreating(`patient-${patient.id}`);
    try {
      await createXrayRequest(
        user.id, 
        patient.patient_name, 
        patient.patient_id || undefined, 
        patient.medical_history || undefined,
        patient.id
      );
      toast.success("X-ray request created successfully");
      fetchRequests();
      fetchReferredPatients();
    } catch (error) {
      console.error("Error creating request:", error);
    } finally {
      setIsCreating(null);
    }
  };

  const handleRequestAgain = async (request: XrayRequest) => {
    if (!user) return;
    
    setIsCreating(`request-${request.id}`);
    try {
      await createXrayRequest(
        user.id, 
        request.patient_name, 
        request.patient_id || undefined,
        undefined
      );
      toast.success("New X-ray request created successfully");
      fetchRequests();
    } catch (error) {
      console.error("Error creating request:", error);
    } finally {
      setIsCreating(null);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background to-muted">
        <div className="w-full max-w-md">
          <AuthForm onAuthenticate={handleAuthentication} />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-8">
      <header className="rounded-xl bg-gradient-to-r from-primary/10 via-accent/5 to-secondary/10 backdrop-blur border border-border/50 p-8 shadow-md">
        <div className="flex items-center justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-3 rounded-xl bg-primary/20 backdrop-blur-sm">
                <Heart className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="text-3xl font-bold gradient-text">Doctor Dashboard</h1>
                <p className="text-muted-foreground text-sm">Welcome back, <span className="font-semibold text-foreground">{user?.full_name || user?.username}</span></p>
              </div>
            </div>
          </div>
          {user && <NotificationBell userId={user.id} />}
        </div>
      </header>

      <div className="grid gap-6">
        {/* Referred Patients Section */}
        <Card className="border-0 shadow-md hover:shadow-lg transition-all duration-300">
          <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4">
            <div className="space-y-1">
              <CardTitle className="flex items-center gap-2 gradient-text text-xl">
                <Users className="h-5 w-5" />
                Referred Patients
              </CardTitle>
              <CardDescription>Patients referred by general doctor - create X-ray requests</CardDescription>
            </div>
            <Button 
              variant="outline" 
              onClick={fetchReferredPatients} 
              disabled={isLoading}
              className="hover:bg-primary/10 transition-all"
            >
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
              Reload
            </Button>
          </CardHeader>
          <CardContent>
            {referredPatients.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Users className="h-12 w-12 mx-auto mb-3 opacity-30" />
                <p className="font-medium">No referred patients at this time.</p>
              </div>
            ) : (
              <div className="overflow-x-auto rounded-lg border border-border/50">
                <Table>
                  <TableHeader>
                    <TableRow className="border-b border-border/50 hover:bg-transparent">
                      <TableHead className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Patient Name</TableHead>
                      <TableHead className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Patient ID</TableHead>
                      <TableHead className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Contact</TableHead>
                      <TableHead className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Age</TableHead>
                      <TableHead className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Medical History</TableHead>
                      <TableHead className="text-xs font-semibold text-muted-foreground uppercase tracking-wider text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {referredPatients.map((patient) => (
                      <TableRow key={patient.id} className="hover:bg-muted/50 transition-colors border-b border-border/30">
                        <TableCell className="font-medium">{patient.patient_name}</TableCell>
                        <TableCell className="text-muted-foreground text-sm">{patient.patient_id || "N/A"}</TableCell>
                        <TableCell className="text-muted-foreground text-sm">{patient.contact_number || "N/A"}</TableCell>
                        <TableCell className="text-muted-foreground text-sm">{patient.age || "N/A"}</TableCell>
                        <TableCell className="max-w-xs truncate text-muted-foreground text-sm">{patient.medical_history || "N/A"}</TableCell>
                        <TableCell className="text-right">
                          <Button
                            size="sm"
                            onClick={() => handleCreateXrayRequest(patient)}
                            disabled={isCreating === `patient-${patient.id}`}
                            className="bg-primary hover:bg-primary/90 transition-all"
                          >
                            {isCreating === `patient-${patient.id}` ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Creating...
                              </>
                            ) : (
                              <>
                                <Send className="mr-2 h-4 w-4" />
                                Request
                              </>
                            )}
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Request Summary */}
        <Card className="border-0 shadow-md hover:shadow-lg transition-all duration-300">
          <CardHeader className="pb-4">
            <CardTitle className="gradient-text">Request Summary</CardTitle>
            <CardDescription>Overview of your X-ray requests</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="flex flex-col items-center justify-center p-6 bg-gradient-to-br from-primary/10 to-primary/5 rounded-lg border border-primary/20 hover:border-primary/40 transition-colors">
                <span className="text-sm font-medium text-muted-foreground">Total Requests</span>
                <span className="text-4xl font-bold mt-3 text-primary">{requests.length}</span>
              </div>
              <div className="flex flex-col items-center justify-center p-6 bg-gradient-to-br from-amber-100/30 to-amber-50/30 rounded-lg border border-amber-200/50 hover:border-amber-300/50 transition-colors">
                <span className="text-sm font-medium text-muted-foreground">Pending</span>
                <span className="text-4xl font-bold mt-3 text-amber-600">
                  {requests.filter(r => r.status === 'pending').length}
                </span>
              </div>
              <div className="flex flex-col items-center justify-center p-6 bg-gradient-to-br from-green-100/30 to-green-50/30 rounded-lg border border-green-200/50 hover:border-green-300/50 transition-colors">
                <span className="text-sm font-medium text-muted-foreground">Completed</span>
                <span className="text-4xl font-bold mt-3 text-green-600">
                  {requests.filter(r => r.status === 'completed').length}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-0 shadow-md">
        <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4">
          <div className="space-y-1">
            <CardTitle className="flex items-center gap-2 gradient-text text-xl">
              <FileText className="h-5 w-5" />
              My X-ray Requests
            </CardTitle>
            <CardDescription>View all your X-ray requests and results</CardDescription>
          </div>
          <Button 
            variant="outline" 
            onClick={fetchRequests} 
            disabled={isLoading}
            className="hover:bg-primary/10 transition-all"
          >
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
            Reload
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by patient name or ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 border-0 bg-muted/50 focus:bg-muted h-10 transition-colors"
            />
          </div>

          <RequestFilters
            dateFilter={dateFilter}
            setDateFilter={setDateFilter}
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
            onClear={clearFilters}
          />
          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : filteredRequests.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p className="font-medium">
                {requests.length === 0 
                  ? "No requests found. Create X-ray requests from referred patients above."
                  : "No requests match your filters."}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-lg border border-border/50">
              <Table>
                <TableHeader>
                  <TableRow className="border-b border-border/50 hover:bg-transparent">
                    <TableHead className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Patient Name</TableHead>
                    <TableHead className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Patient ID</TableHead>
                    <TableHead className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</TableHead>
                    <TableHead className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Result</TableHead>
                    <TableHead className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Confidence</TableHead>
                    <TableHead className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Request Date</TableHead>
                    <TableHead className="text-xs font-semibold text-muted-foreground uppercase tracking-wider text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRequests.map((request) => (
                    <TableRow key={request.id} className="hover:bg-muted/50 transition-colors border-b border-border/30">
                      <TableCell className="font-medium">{request.patient_name}</TableCell>
                      <TableCell className="text-muted-foreground text-sm">{request.patient_id || "N/A"}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            request.status === "completed"
                              ? "default"
                              : request.status === "in_progress"
                              ? "secondary"
                              : "outline"
                          }
                          className="capitalize"
                        >
                          {request.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {request.prediction ? (
                          <Badge 
                            variant={request.prediction === "positive" ? "destructive" : "default"}
                            className="capitalize"
                          >
                            {request.prediction}
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground text-sm">Pending</span>
                        )}
                      </TableCell>
                      <TableCell className="font-medium">
                        {request.confidence ? `${(request.confidence * 100).toFixed(1)}%` : "N/A"}
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {new Date(request.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleRequestAgain(request)}
                          disabled={isCreating === `request-${request.id}`}
                          className="hover:bg-primary/10 transition-all"
                        >
                          {isCreating === `request-${request.id}` ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <>
                              <RefreshCw className="mr-1 h-4 w-4" />
                              Request Again
                            </>
                          )}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default DoctorDashboard;