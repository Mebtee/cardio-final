import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSessionValidation } from "@/hooks/useSessionValidation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { registerPatient, searchPatients, getAllPatients, requestPatientEdit, getMyEditRequests, getEditRequest, submitPatientChanges, type User, type Patient, type PatientEditRequest } from "@/services/api";
import { UserPlus, Search, Users, Edit, FileText, Clock, RefreshCcw, Loader2, Clipboard } from "lucide-react";

const ReceptionDashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  
  // Session validation hook
  useSessionValidation(user);
  const [isLoading, setIsLoading] = useState(false);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  
  const [formData, setFormData] = useState({
    patient_name: "",
    contact_number: "",
    age: "",
    gender: "",
    medical_history: "",
  });
  
  const [validationErrors, setValidationErrors] = useState({
    contact_number: "",
    age: "",
  });

  const [showDuplicateDialog, setShowDuplicateDialog] = useState(false);
  const [duplicatePatient, setDuplicatePatient] = useState<Patient | null>(null);

  // Edit request states
  const [editRequests, setEditRequests] = useState<PatientEditRequest[]>([]);
  const [showEditRequestDialog, setShowEditRequestDialog] = useState(false);
  const [showEditFormDialog, setShowEditFormDialog] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [editReason, setEditReason] = useState("");
  const [currentEditRequest, setCurrentEditRequest] = useState<PatientEditRequest | null>(null);
  const [editFormData, setEditFormData] = useState({
    patient_name: "",
    contact_number: "",
    age: "",
    gender: "",
    medical_history: "",
  });
  const [editRequestsLoading, setEditRequestsLoading] = useState(false);

  // Check authentication
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const userData = JSON.parse(storedUser);
      if (userData.role === "reception") {
        setUser(userData);
        loadPatients();
      } else {
        navigate("/");
      }
    } else {
      navigate("/");
    }
  }, [navigate]);

  // Load edit requests when user is set
  useEffect(() => {
    if (user) {
      loadEditRequests();
    }
  }, [user]);

  const loadPatients = async () => {
    try {
      const data = await getAllPatients();
      setPatients(data);
    } catch (error) {
      console.error("Error loading patients:", error);
    }
  };

  const loadEditRequests = async () => {
    if (!user) return;
    try {
      setEditRequestsLoading(true);
      const data = await getMyEditRequests(user.id);
      console.log("Loaded edit requests:", data);
      setEditRequests(data);
    } catch (error) {
      console.error("Error loading edit requests:", error);
    } finally {
      setEditRequestsLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      loadPatients();
      return;
    }
    
    setIsSearching(true);
    try {
      const results = await searchPatients(searchQuery);
      setPatients(results);
    } catch (error) {
      console.error("Error searching patients:", error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    // Clear previous validation errors
    setValidationErrors(prev => ({ ...prev, [name]: "" }));
    
    // Age validation
    if (name === "age") {
      const ageValue = parseInt(value);
      if (value !== "" && (isNaN(ageValue) || ageValue < 0 || ageValue > 150)) {
        setValidationErrors(prev => ({ ...prev, age: "Age must be between 0 and 150" }));
        return; // Don't update if invalid
      }
    }
    
    // Contact number validation
    if (name === "contact_number" && value && !validatePhoneNumber(value)) {
      setValidationErrors(prev => ({ 
        ...prev, 
        contact_number: "Invalid format. Use: 09XXXXXXXX, +2519XXXXXXXX, 07XXXXXXXX, or +2517XXXXXXXX" 
      }));
    }
    
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleGenderChange = (value: string) => {
    setFormData({
      ...formData,
      gender: value,
    });
  };

  const validatePhoneNumber = (phone: string): boolean => {
    // Remove all spaces and special characters except + and numbers
    const cleanPhone = phone.replace(/\s/g, '');
    
    // Define the allowed patterns
    const patterns = [
      /^09\d{8}$/,           // 0911223344 (10 digits starting with 09)
      /^\+2519\d{8}$/,       // +251911223344 (13 digits: +251 + 9 + 8 digits)
      /^07\d{8}$/,           // 0711223344 (10 digits starting with 07)
      /^\+2517\d{8}$/        // +251711223344 (13 digits: +251 + 7 + 8 digits)
    ];
    
    return patterns.some(pattern => pattern.test(cleanPhone));
  };

  const checkForDuplicatePhone = (phoneNumber: string): Patient | null => {
    return patients.find(patient => patient.contact_number === phoneNumber) || null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.patient_name || !formData.contact_number) {
      toast.error("Please fill in required fields");
      return;
    }

    // Validate phone number format
    if (!validatePhoneNumber(formData.contact_number)) {
      toast.error("Invalid phone number format. Please use one of these formats: 0911223344, +2519112233443, 0711223344, or +251711223344");
      return;
    }

    // Validate age if provided
    if (formData.age) {
      const ageValue = parseInt(formData.age);
      if (isNaN(ageValue) || ageValue < 0 || ageValue > 150) {
        toast.error("Age must be between 0 and 150");
        return;
      }
    }

    if (!user) {
      toast.error("User not authenticated");
      return;
    }

    // Check for duplicate phone number
    const existingPatient = checkForDuplicatePhone(formData.contact_number);
    if (existingPatient) {
      setDuplicatePatient(existingPatient);
      setShowDuplicateDialog(true);
      return;
    }

    // Proceed with registration
    await registerPatientData();
  };

  const registerPatientData = async () => {
    setIsLoading(true);
    try {
      const result = await registerPatient({
        patient_name: formData.patient_name,
        contact_number: formData.contact_number,
        age: formData.age ? parseInt(formData.age) : undefined,
        gender: formData.gender as "male" | "female" | "other" | undefined,
        medical_history: formData.medical_history || undefined,
        registered_by: user!.id,
      });

      toast.success(`Patient registered successfully with ID: ${result.patient_code}`);
      
      // Reset form
      setFormData({
        patient_name: "",
        contact_number: "",
        age: "",
        gender: "",
        medical_history: "",
      });
      
      // Clear validation errors
      setValidationErrors({
        contact_number: "",
        age: "",
      });
      
      // Reload patients list
      loadPatients();
    } catch (error) {
      console.error("Error registering patient:", error);
      toast.error("Failed to register patient. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmDuplicate = async () => {
    setShowDuplicateDialog(false);
    setDuplicatePatient(null);
    await registerPatientData();
  };

  const handleCancelDuplicate = () => {
    setShowDuplicateDialog(false);
    setDuplicatePatient(null);
  };

  const handleRequestEdit = (patient: Patient) => {
    setSelectedPatient(patient);
    setEditReason("");
    setShowEditRequestDialog(true);
  };

  const handleSubmitEditRequest = async () => {
    if (!selectedPatient || !user || !editReason.trim()) {
      toast.error("Please provide a reason for the edit request");
      return;
    }

    try {
      setIsLoading(true);
      await requestPatientEdit(selectedPatient.id, user.id, editReason);
      toast.success("Edit request submitted successfully");
      setShowEditRequestDialog(false);
      setSelectedPatient(null);
      setEditReason("");
      await loadEditRequests();
    } catch (error) {
      console.error("Error submitting edit request:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditPatient = async (request: PatientEditRequest) => {
    if (request.status !== 'approved_for_edit') {
      toast.error("This request is not approved for editing yet");
      return;
    }

    try {
      const requestDetails = await getEditRequest(request.id);
      setCurrentEditRequest(requestDetails);
      
      // Pre-fill form with original data
      const originalData = requestDetails.original_data;
      setEditFormData({
        patient_name: originalData?.patient_name || "",
        contact_number: originalData?.contact_number || "",
        age: originalData?.age?.toString() || "",
        gender: originalData?.gender || "",
        medical_history: originalData?.medical_history || "",
      });
      
      setShowEditFormDialog(true);
    } catch (error) {
      console.error("Error loading edit request:", error);
    }
  };

  const handleSubmitChanges = async () => {
    if (!currentEditRequest) return;

    try {
      setIsLoading(true);
      const changes = {
        patient_name: editFormData.patient_name,
        contact_number: editFormData.contact_number,
        age: editFormData.age ? parseInt(editFormData.age) : null,
        gender: editFormData.gender,
        medical_history: editFormData.medical_history,
      };

      await submitPatientChanges(currentEditRequest.id, changes);
      toast.success("Changes submitted for final approval");
      setShowEditFormDialog(false);
      setCurrentEditRequest(null);
      await loadEditRequests();
    } catch (error) {
      console.error("Error submitting changes:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleEditGenderChange = (value: string) => {
    setEditFormData(prev => ({ ...prev, gender: value }));
  };

  if (!user) {
    return null;
  }

  return (
    <div className="space-y-8 pb-8">
      <header className="rounded-xl bg-gradient-to-r from-primary/10 via-accent/5 to-secondary/10 backdrop-blur border border-border/50 p-8 shadow-md">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-primary/20 backdrop-blur-sm">
            <Clipboard className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold gradient-text">Reception Dashboard</h1>
            <p className="text-muted-foreground text-sm">Register and manage patient records</p>
          </div>
        </div>
      </header>

      <Tabs defaultValue="register" className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-muted/30 p-1 rounded-xl border border-border/50 shadow-sm">
          <TabsTrigger value="register" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md rounded-lg transition-all duration-200 font-medium flex items-center gap-2">
            <UserPlus className="h-4 w-4" />
            Register
          </TabsTrigger>
          <TabsTrigger value="patients" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md rounded-lg transition-all duration-200 font-medium flex items-center gap-2">
            <Users className="h-4 w-4" />
            Patients
          </TabsTrigger>
          <TabsTrigger value="edit-requests" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md rounded-lg transition-all duration-200 font-medium flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Edit Requests
          </TabsTrigger>
        </TabsList>

        <TabsContent value="register" className="space-y-4 mt-6">
          <Card className="border-0 shadow-md">
            <CardHeader className="space-y-2">
              <CardTitle className="flex items-center gap-2 gradient-text text-xl">
                <UserPlus className="h-5 w-5" />
                Patient Registration
              </CardTitle>
              <CardDescription>Enter patient details to register (Patient ID will be auto-generated)</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <Label htmlFor="patient_name" className="font-semibold text-sm">Patient Name *</Label>
                    <Input
                      id="patient_name"
                      name="patient_name"
                      placeholder="Full name"
                      className="border-0 bg-muted/50 focus:bg-muted h-10 transition-colors"
                      value={formData.patient_name}
                      onChange={handleInputChange}
                      placeholder="Enter patient name"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="contact_number">Contact Number *</Label>
                    <Input
                      id="contact_number"
                      name="contact_number"
                      value={formData.contact_number}
                      onChange={handleInputChange}
                      placeholder="e.g., 0911223344 or +2519112233443"
                      required
                      className={validationErrors.contact_number ? "border-red-500" : ""}
                    />
                    {validationErrors.contact_number ? (
                      <p className="text-xs text-red-500">{validationErrors.contact_number}</p>
                    ) : (
                      <p className="text-xs text-muted-foreground">
                        Accepted formats: 09XXXXXXXX, +2519XXXXXXXX, 07XXXXXXXX, +2517XXXXXXXX
                      </p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="age">Age</Label>
                    <Input
                      id="age"
                      name="age"
                      type="number"
                      min="0"
                      max="150"
                      value={formData.age}
                      onChange={handleInputChange}
                      placeholder="Enter age (0-150)"
                      className={validationErrors.age ? "border-red-500" : ""}
                    />
                    {validationErrors.age ? (
                      <p className="text-xs text-red-500">{validationErrors.age}</p>
                    ) : (
                      <p className="text-xs text-muted-foreground">
                        Age must be between 0 and 150 years
                      </p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="gender">Gender</Label>
                    <Select onValueChange={handleGenderChange} value={formData.gender}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="medical_history">Medical History</Label>
                  <Textarea
                    id="medical_history"
                    name="medical_history"
                    value={formData.medical_history}
                    onChange={handleInputChange}
                    placeholder="Enter relevant medical history"
                    rows={4}
                  />
                </div>
                
                <Button type="submit" disabled={isLoading} className="w-full">
                  {isLoading ? "Registering..." : "Register Patient"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="patients">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Registered Patients
                </CardTitle>
                <CardDescription>Search and view all registered patients</CardDescription>
              </div>
              <Button variant="outline" onClick={loadPatients} disabled={isLoading}>
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCcw className="mr-2 h-4 w-4" />}
                Reload
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by name, patient ID, or phone number..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                    className="pl-10"
                  />
                </div>
                <Button onClick={handleSearch} disabled={isSearching}>
                  {isSearching ? "Searching..." : "Search"}
                </Button>
                <Button variant="outline" onClick={() => { setSearchQuery(""); loadPatients(); }}>
                  Clear
                </Button>
              </div>

              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Patient ID</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Contact</TableHead>
                      <TableHead>Age</TableHead>
                      <TableHead>Gender</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Registered Date</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {patients.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                          No patients found
                        </TableCell>
                      </TableRow>
                    ) : (
                      patients.map((patient) => (
                        <TableRow key={patient.id}>
                          <TableCell className="font-medium">{patient.patient_id || "-"}</TableCell>
                          <TableCell>{patient.patient_name}</TableCell>
                          <TableCell>{patient.contact_number || "-"}</TableCell>
                          <TableCell>{patient.age || "-"}</TableCell>
                          <TableCell className="capitalize">{patient.gender || "-"}</TableCell>
                          <TableCell>
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              patient.status === "registered" ? "bg-blue-100 text-blue-800" :
                              patient.status === "referred" ? "bg-yellow-100 text-yellow-800" :
                              "bg-gray-100 text-gray-800"
                            }`}>
                              {patient.status}
                            </span>
                          </TableCell>
                          <TableCell>
                            {patient.created_at ? new Date(patient.created_at).toLocaleDateString() : "-"}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button 
                              size="sm" 
                              variant="outline" 
                              onClick={() => handleRequestEdit(patient)}
                            >
                              <Edit className="h-4 w-4 mr-1" />
                              Request Edit
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
        </TabsContent>

        <TabsContent value="edit-requests">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Edit Requests
                </CardTitle>
                <CardDescription>
                  View and manage your patient edit requests. After admin approval, you can edit the patient data.
                </CardDescription>
              </div>
              <Button variant="outline" onClick={loadEditRequests}>
                <RefreshCcw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Patient</TableHead>
                      <TableHead>Reason</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Last Updated</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {editRequestsLoading ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8">
                          <div className="flex items-center justify-center">
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900 mr-2"></div>
                            Loading edit requests...
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : editRequests.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                          No edit requests found
                        </TableCell>
                      </TableRow>
                    ) : (
                      editRequests.map((request) => (
                        <TableRow key={request.id}>
                          <TableCell>
                            <div>
                              <div className="font-medium">{request.patient_name}</div>
                              <div className="text-sm text-muted-foreground">{request.patient_code || "No ID"}</div>
                            </div>
                          </TableCell>
                          <TableCell className="max-w-xs truncate">{request.request_reason}</TableCell>
                          <TableCell>
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              request.status === 'pending_approval' ? "bg-yellow-100 text-yellow-800" :
                              request.status === 'approved_for_edit' ? "bg-blue-100 text-blue-800" :
                              request.status === 'changes_submitted' ? "bg-purple-100 text-purple-800" :
                              request.status === 'approved_final' ? "bg-green-100 text-green-800" :
                              "bg-red-100 text-red-800"
                            }`}>
                              {request.status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                            </span>
                          </TableCell>
                          <TableCell>
                            {new Date(request.created_at).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            {request.final_approved_at ? new Date(request.final_approved_at).toLocaleDateString() :
                             request.submitted_at ? new Date(request.submitted_at).toLocaleDateString() :
                             request.approved_at ? new Date(request.approved_at).toLocaleDateString() :
                             new Date(request.created_at).toLocaleDateString()}
                          </TableCell>
                          <TableCell className="text-right">
                            {request.status === 'approved_for_edit' && (
                              <Button 
                                size="sm" 
                                onClick={() => handleEditPatient(request)}
                                className="bg-blue-600 hover:bg-blue-700"
                              >
                                <Edit className="h-4 w-4 mr-1" />
                                Edit Data
                              </Button>
                            )}
                            {request.status === 'pending_approval' && (
                              <span className="text-sm text-muted-foreground flex items-center justify-end">
                                <Clock className="h-4 w-4 mr-1" />
                                Waiting for approval
                              </span>
                            )}
                            {request.status === 'changes_submitted' && (
                              <span className="text-sm text-muted-foreground flex items-center justify-end">
                                <Clock className="h-4 w-4 mr-1" />
                                Awaiting final approval
                              </span>
                            )}
                            {request.status === 'approved_final' && (
                              <span className="text-sm text-green-600 flex items-center justify-end">
                                ✓ Completed
                              </span>
                            )}
                            {request.status === 'rejected' && (
                              <span className="text-sm text-red-600 flex items-center justify-end">
                                ✗ Rejected
                              </span>
                            )}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <AlertDialog open={showDuplicateDialog} onOpenChange={setShowDuplicateDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Duplicate Phone Number Detected</AlertDialogTitle>
            <AlertDialogDescription>
              A patient is already registered with this phone number: <strong>{formData.contact_number}</strong>
              <br /><br />
              <strong>Existing Patient:</strong>
              <br />
              Name: {duplicatePatient?.patient_name}
              <br />
              Patient ID: {duplicatePatient?.patient_id || "N/A"}
              <br />
              Registered: {duplicatePatient?.created_at ? new Date(duplicatePatient.created_at).toLocaleDateString() : "N/A"}
              <br /><br />
              Do you want to continue registering another patient using the same phone number?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleCancelDuplicate}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDuplicate} disabled={isLoading}>
              {isLoading ? "Registering..." : "Yes, Continue"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Edit Request Dialog */}
      <AlertDialog open={showEditRequestDialog} onOpenChange={setShowEditRequestDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Request Patient Data Edit</AlertDialogTitle>
            <AlertDialogDescription>
              You are requesting permission to edit data for patient: <strong>{selectedPatient?.patient_name}</strong>
              <br />
              Patient ID: {selectedPatient?.patient_id || "No ID"}
              <br /><br />
              Please provide a reason for this edit request:
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4">
            <Textarea
              placeholder="Enter reason for edit request..."
              value={editReason}
              onChange={(e) => setEditReason(e.target.value)}
              rows={3}
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setShowEditRequestDialog(false)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleSubmitEditRequest} disabled={isLoading || !editReason.trim()}>
              {isLoading ? "Submitting..." : "Submit Request"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Edit Form Dialog */}
      <AlertDialog open={showEditFormDialog} onOpenChange={setShowEditFormDialog}>
        <AlertDialogContent className="max-w-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Edit Patient Data</AlertDialogTitle>
            <AlertDialogDescription>
              Make the necessary changes to the patient data. These changes will be submitted for final approval.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit_patient_name">Patient Name</Label>
                <Input
                  id="edit_patient_name"
                  name="patient_name"
                  value={editFormData.patient_name}
                  onChange={handleEditFormChange}
                  placeholder="Enter patient name"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit_contact_number">Contact Number</Label>
                <Input
                  id="edit_contact_number"
                  name="contact_number"
                  value={editFormData.contact_number}
                  onChange={handleEditFormChange}
                  placeholder="Enter contact number"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit_age">Age</Label>
                <Input
                  id="edit_age"
                  name="age"
                  type="number"
                  min="0"
                  max="150"
                  value={editFormData.age}
                  onChange={handleEditFormChange}
                  placeholder="Enter age"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit_gender">Gender</Label>
                <Select onValueChange={handleEditGenderChange} value={editFormData.gender}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit_medical_history">Medical History</Label>
              <Textarea
                id="edit_medical_history"
                name="medical_history"
                value={editFormData.medical_history}
                onChange={handleEditFormChange}
                placeholder="Enter medical history"
                rows={3}
              />
            </div>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setShowEditFormDialog(false)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleSubmitChanges} disabled={isLoading}>
              {isLoading ? "Submitting..." : "Submit Changes"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ReceptionDashboard;
