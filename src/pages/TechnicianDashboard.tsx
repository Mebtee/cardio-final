import { useState, useEffect, useMemo } from "react";
import { useSessionValidation } from "@/hooks/useSessionValidation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { getAllRequests, getPrediction, type XrayRequest, type User } from "@/services/api";
import { Loader2, Upload, FileText, RefreshCw, Zap, CheckCircle2, Activity } from "lucide-react";
import { toast } from "sonner";
import AuthForm from "@/components/AuthForm";
import ImageUploader from "@/components/ImageUploader";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import ResultDisplay from "@/components/ResultDisplay";
import RequestFilters from "@/components/RequestFilters";
import { NotificationBell } from "@/components/NotificationBell";

const TechnicianDashboard = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  
  // Session validation hook
  useSessionValidation(user);
  const [requests, setRequests] = useState<XrayRequest[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<XrayRequest | null>(null);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<any>(null);
  const [dateFilter, setDateFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const filteredRequests = useMemo(() => {
    return requests.filter((request) => {
      const matchesDate = !dateFilter || new Date(request.created_at).toISOString().split('T')[0] === dateFilter;
      const matchesStatus = statusFilter === "all" || request.status === statusFilter;
      return matchesDate && matchesStatus;
    });
  }, [requests, dateFilter, statusFilter]);

  const clearFilters = () => {
    setDateFilter("");
    setStatusFilter("all");
  };

  useEffect(() => {
    // Check if user is already logged in via localStorage
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        if (userData.role === 'xray_technician') {
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
    }
  }, [isAuthenticated, user]);

  const fetchRequests = async () => {
    setIsLoading(true);
    try {
      const data = await getAllRequests();
      setRequests(data);
    } catch (error) {
      console.error("Error fetching requests:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAuthentication = (success: boolean, userData?: User) => {
    setIsAuthenticated(success);
    if (success && userData) {
      if (userData.role !== 'xray_technician') {
        toast.error("Access denied. This page is for X-ray technicians only.");
        setIsAuthenticated(false);
        return;
      }
      setUser(userData);
    }
  };

  const handleImageUpload = (file: File) => {
    setSelectedImage(file);
  };

  const handleUploadXray = async () => {
    if (!selectedImage || !selectedRequest) return;

    setIsUploading(true);
    try {
      const result = await getPrediction(selectedImage, selectedRequest.id);
      setUploadResult(result);
      toast.success("X-ray uploaded and analyzed successfully!");
      fetchRequests();
      setSelectedImage(null);
    } catch (error) {
      console.error("Error uploading X-ray:", error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleCloseDialog = () => {
    setSelectedRequest(null);
    setSelectedImage(null);
    setUploadResult(null);
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

  const pendingRequests = requests.filter(r => r.status === 'pending');
  const completedRequests = requests.filter(r => r.status === 'completed');

  return (
    <div className="space-y-8 pb-8">
      <header className="rounded-xl bg-gradient-to-r from-primary/10 via-accent/5 to-secondary/10 backdrop-blur border border-border/50 p-8 shadow-md">
        <div className="flex items-center justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-3 rounded-xl bg-primary/20 backdrop-blur-sm">
                <Zap className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="text-3xl font-bold gradient-text">X-ray Technician Dashboard</h1>
                <p className="text-muted-foreground text-sm">Welcome back, <span className="font-semibold text-foreground">{user?.full_name || user?.username}</span></p>
              </div>
            </div>
          </div>
          {user && <NotificationBell userId={user.id} />}
        </div>
      </header>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="group overflow-hidden border-0 shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105">
          <div className="absolute top-0 right-0 w-24 h-24 bg-amber-100/50 rounded-full -mr-8 -mt-8 group-hover:bg-amber-100 transition-colors" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
            <CardTitle className="text-sm font-semibold text-amber-700">Pending Requests</CardTitle>
            <Activity className="h-5 w-5 text-amber-600" />
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-4xl font-bold text-amber-600 mb-1">{pendingRequests.length}</div>
            <p className="text-xs text-muted-foreground">Awaiting uploads</p>
          </CardContent>
        </Card>
        
        <Card className="group overflow-hidden border-0 shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105">
          <div className="absolute top-0 right-0 w-24 h-24 bg-green-100/50 rounded-full -mr-8 -mt-8 group-hover:bg-green-100 transition-colors" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
            <CardTitle className="text-sm font-semibold text-green-700">Completed</CardTitle>
            <CheckCircle2 className="h-5 w-5 text-green-600" />
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-4xl font-bold text-green-600 mb-1">{completedRequests.length}</div>
            <p className="text-xs text-muted-foreground">Analyzed successfully</p>
          </CardContent>
        </Card>
        
        <Card className="group overflow-hidden border-0 shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105">
          <div className="absolute top-0 right-0 w-24 h-24 bg-primary/10 rounded-full -mr-8 -mt-8 group-hover:bg-primary/20 transition-colors" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
            <CardTitle className="text-sm font-semibold text-primary">Total Requests</CardTitle>
            <FileText className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-4xl font-bold text-primary mb-1">{requests.length}</div>
            <p className="text-xs text-muted-foreground">All time</p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-0 shadow-md">
        <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4">
          <div className="space-y-1">
            <CardTitle className="flex items-center gap-2 gradient-text text-xl">
              <FileText className="h-5 w-5" />
              X-ray Requests
            </CardTitle>
            <CardDescription>Process pending X-ray requests and uploads</CardDescription>
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
                {requests.length === 0 ? "No requests found." : "No requests match your filters."}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-lg border border-border/50">
              <Table>
                <TableHeader>
                  <TableRow className="border-b border-border/50 hover:bg-transparent">
                    <TableHead className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Patient Name</TableHead>
                    <TableHead className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Patient ID</TableHead>
                    <TableHead className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Doctor</TableHead>
                    <TableHead className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</TableHead>
                    <TableHead className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Request Date</TableHead>
                    <TableHead className="text-xs font-semibold text-muted-foreground uppercase tracking-wider text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRequests.map((request) => (
                    <TableRow key={request.id} className="hover:bg-muted/50 transition-colors border-b border-border/30">
                      <TableCell className="font-medium">{request.patient_name}</TableCell>
                      <TableCell className="text-muted-foreground text-sm">{request.patient_id || "N/A"}</TableCell>
                      <TableCell className="text-muted-foreground text-sm">{request.doctor_name}</TableCell>
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
                      <TableCell className="text-muted-foreground text-sm">
                        {new Date(request.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        {request.status === 'pending' && (
                          <Button
                            size="sm"
                            onClick={() => setSelectedRequest(request)}
                            className="bg-primary hover:bg-primary/90 transition-all"
                          >
                            <Upload className="h-4 w-4 mr-2" />
                            Upload
                          </Button>
                        )}
                        {request.status === 'completed' && (
                          <Badge variant="default" className="pointer-events-none">Completed</Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!selectedRequest} onOpenChange={handleCloseDialog}>
        <DialogContent className="max-w-2xl border-0 shadow-lg">
          <DialogHeader className="space-y-2">
            <DialogTitle className="text-xl gradient-text">Upload X-ray Image</DialogTitle>
            <DialogDescription>
              Upload X-ray for patient: <span className="font-semibold text-foreground">{selectedRequest?.patient_name}</span>
            </DialogDescription>
          </DialogHeader>
          
          {!uploadResult ? (
            <div className="space-y-4">
              <ImageUploader onImageUpload={handleImageUpload} isLoading={isUploading} />
              {selectedImage && (
                <Button
                  onClick={handleUploadXray}
                  disabled={isUploading}
                  className="w-full bg-primary hover:bg-primary/90 transition-all"
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Zap className="mr-2 h-4 w-4" />
                      Upload and Analyze
                    </>
                  )}
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <ResultDisplay result={uploadResult} />
              <Button 
                onClick={handleCloseDialog} 
                className="w-full bg-primary hover:bg-primary/90 transition-all"
              >
                Close
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TechnicianDashboard;
