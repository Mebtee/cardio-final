import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useSessionValidation } from "@/hooks/useSessionValidation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { getAllPatients, referPatient, getSpecialists, type User, type Patient, type SpecialistDoctor } from "@/services/api";
import { Users, UserCheck, RefreshCw, Loader2, Heart, ArrowRight } from "lucide-react";
import RequestFilters from "@/components/RequestFilters";
import { NotificationBell } from "@/components/NotificationBell";

const GeneralDoctorDashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  
  // Session validation hook
  useSessionValidation(user);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [specialists, setSpecialists] = useState<SpecialistDoctor[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [referringPatientId, setReferringPatientId] = useState<number | null>(null);
  const [dateFilter, setDateFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  
  // Dialog state for specialist selection
  const [referDialogOpen, setReferDialogOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [selectedSpecialistId, setSelectedSpecialistId] = useState<string>("");

  const patientStatusOptions = [
    { value: "all", label: "All Status" },
    { value: "registered", label: "Registered" },
    { value: "referred", label: "Referred" },
    { value: "completed", label: "Completed" },
  ];

  const filteredPatients = useMemo(() => {
    return patients.filter((patient) => {
      const matchesDate = !dateFilter || (patient.created_at && new Date(patient.created_at).toISOString().split('T')[0] === dateFilter);
      const matchesStatus = statusFilter === "all" || patient.status === statusFilter;
      return matchesDate && matchesStatus;
    });
  }, [patients, dateFilter, statusFilter]);

  const clearFilters = () => {
    setDateFilter("");
    setStatusFilter("all");
  };

  // Check authentication
  useEffect(() => {
    try {
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        const userData = JSON.parse(storedUser);
        if (userData.role === "general_doctor") {
          setUser(userData);
          fetchData();
        } else {
          toast.error("Access denied. This page is for general doctors only.");
          navigate("/");
        }
      } else {
        toast.error("Please log in to access this page.");
        navigate("/");
      }
    } catch (error) {
      console.error("Error checking authentication:", error);
      toast.error("Authentication error. Please log in again.");
      navigate("/");
    }
  }, [navigate]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [patientsData, specialistsData] = await Promise.all([
        getAllPatients("registered"),
        getSpecialists()
      ]);
      setPatients(patientsData || []);
      setSpecialists(specialistsData || []);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to load data. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const openReferDialog = (patient: Patient) => {
    setSelectedPatient(patient);
    setSelectedSpecialistId("");
    setReferDialogOpen(true);
  };

  const handleReferPatient = async () => {
    if (!selectedPatient || !selectedSpecialistId) {
      toast.error("Please select a specialist doctor");
      return;
    }
    
    setReferringPatientId(selectedPatient.id);
    try {
      await referPatient(selectedPatient.id, parseInt(selectedSpecialistId));
      toast.success("Patient referred to specialist successfully");
      setReferDialogOpen(false);
      setSelectedPatient(null);
      setSelectedSpecialistId("");
      fetchData(); // Refresh the list
    } catch (error) {
      console.error("Error referring patient:", error);
    } finally {
      setReferringPatientId(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "registered":
        return <Badge variant="secondary">Registered</Badge>;
      case "referred":
        return <Badge variant="default">Referred</Badge>;
      case "completed":
        return <Badge variant="outline">Completed</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  if (!user) {
    return (
      <main className="flex items-center justify-center min-h-[70vh] bg-gradient-to-b from-background to-muted/20">
        <div className="text-center space-y-6 p-8">
          <div className="relative mx-auto mb-4">
            <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full"></div>
            <Loader2 className="h-16 w-16 animate-spin text-primary mx-auto relative" />
          </div>
          <div className="space-y-2">
            <p className="text-lg font-semibold text-foreground">Loading Dashboard</p>
            <p className="text-muted-foreground">Fetching patient records...</p>
          </div>
        </div>
      </main>
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
                <h1 className="text-3xl font-bold gradient-text">General Doctor Dashboard</h1>
                <p className="text-muted-foreground text-sm">Review and refer patients to specialists</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {user && <NotificationBell userId={user.id} />}
            <Button 
              onClick={fetchData} 
              variant="outline" 
              size="sm"
              className="hover:bg-primary/10 transition-all"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>
      </header>

      <Card className="border-0 shadow-md">
        <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4">
          <div className="space-y-1">
            <CardTitle className="flex items-center gap-2 gradient-text text-xl">
              <Users className="h-5 w-5" />
              Registered Patients
            </CardTitle>
            <CardDescription>Patients waiting for consultation and referral</CardDescription>
          </div>
          <Button 
            variant="outline" 
            onClick={fetchData} 
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
            statusOptions={patientStatusOptions}
          />
          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : filteredPatients.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Users className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p className="font-medium">
                {patients.length === 0 ? "No registered patients" : "No patients match your filters"}
              </p>
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
                    <TableHead className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Gender</TableHead>
                    <TableHead className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</TableHead>
                    <TableHead className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Registered By</TableHead>
                    <TableHead className="text-xs font-semibold text-muted-foreground uppercase tracking-wider text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPatients.map((patient) => (
                    <TableRow key={patient.id} className="hover:bg-muted/50 transition-colors border-b border-border/30">
                      <TableCell className="font-medium">{patient.patient_name}</TableCell>
                      <TableCell className="text-muted-foreground text-sm">{patient.patient_id || "-"}</TableCell>
                      <TableCell className="text-muted-foreground text-sm">{patient.contact_number || "-"}</TableCell>
                      <TableCell className="text-muted-foreground text-sm">{patient.age || "-"}</TableCell>
                      <TableCell className="capitalize text-muted-foreground text-sm">{patient.gender || "-"}</TableCell>
                      <TableCell>{getStatusBadge(patient.status)}</TableCell>
                      <TableCell className="text-muted-foreground text-sm">{patient.registered_by_name || "-"}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          size="sm"
                          onClick={() => openReferDialog(patient)}
                          disabled={patient.status === "referred"}
                          className={patient.status === "referred" ? "opacity-50 cursor-not-allowed" : "bg-primary hover:bg-primary/90 transition-all"}
                        >
                          <UserCheck className="h-4 w-4 mr-2" />
                          {patient.status === "referred" ? "Referred" : "Refer"}
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

      {/* Refer to Specialist Dialog */}
      <Dialog open={referDialogOpen} onOpenChange={setReferDialogOpen}>
        <DialogContent className="border-0 shadow-lg">
          <DialogHeader className="space-y-2">
            <DialogTitle className="text-xl gradient-text">Refer Patient to Specialist</DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-4">
            {selectedPatient && (
              <div className="p-4 rounded-lg bg-muted/50 border border-border/50">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Patient Information</p>
                <p className="text-sm font-semibold text-foreground mt-2">
                  {selectedPatient.patient_name}
                  {selectedPatient.patient_id && <span className="text-muted-foreground ml-2">({selectedPatient.patient_id})</span>}
                </p>
              </div>
            )}
            <div className="space-y-2">
              <label className="text-sm font-semibold">Select Specialist Doctor</label>
              <Select value={selectedSpecialistId} onValueChange={setSelectedSpecialistId}>
                <SelectTrigger className="border-0 bg-muted/50 h-10">
                  <SelectValue placeholder="Choose a specialist..." />
                </SelectTrigger>
                <SelectContent className="bg-background border">
                  {specialists.length === 0 ? (
                    <SelectItem value="none" disabled>No specialists available</SelectItem>
                  ) : (
                    specialists.map((specialist) => (
                      <SelectItem key={specialist.id} value={specialist.id.toString()}>
                        <div className="flex items-center gap-2">
                          <span>{specialist.full_name || specialist.username}</span>
                          {specialist.specialty && (
                            <Badge variant="secondary" className="text-xs">
                              {specialist.specialty}
                            </Badge>
                          )}
                        </div>
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setReferDialogOpen(false)} className="hover:bg-muted">
              Cancel
            </Button>
            <Button 
              onClick={handleReferPatient} 
              disabled={!selectedSpecialistId || referringPatientId === selectedPatient?.id}
              className="bg-primary hover:bg-primary/90 transition-all"
            >
              {referringPatientId === selectedPatient?.id ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Referring...
                </>
              ) : (
                <>
                  <ArrowRight className="mr-2 h-4 w-4" />
                  Refer Patient
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default GeneralDoctorDashboard;
