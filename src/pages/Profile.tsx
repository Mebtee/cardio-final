import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, Lock, ArrowLeft, User, Shield, Mail, UserCheck } from "lucide-react";
import { changePassword } from "@/services/api";

const Profile = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  useEffect(() => {
    document.title = "Profile - Cardiomegaly Detection System";
    
    // Get user from localStorage
    const userData = localStorage.getItem("user");
    if (userData) {
      setUser(JSON.parse(userData));
    } else {
      navigate("/");
    }
  }, [navigate]);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast({
        title: "Missing fields",
        description: "Please fill in all password fields",
        variant: "destructive",
      });
      return;
    }

    if (newPassword.length < 6) {
      toast({
        title: "Password too short",
        description: "New password must be at least 6 characters long",
        variant: "destructive",
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      toast({
        title: "Passwords don't match",
        description: "New password and confirmation don't match",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);
      await changePassword(user.id, currentPassword, newPassword);
      
      toast({
        title: "Password changed",
        description: "Your password has been updated successfully",
      });
      
      // Clear form
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error) {
      // Error handled in API service
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    // Navigate based on user role
    switch (user?.role) {
      case "admin":
        navigate("/admin");
        break;
      case "doctor":
        navigate("/doctor");
        break;
      case "xray_technician":
        navigate("/technician");
        break;
      case "reception":
        navigate("/reception");
        break;
      case "general_doctor":
        navigate("/general-doctor");
        break;
      default:
        navigate("/");
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl space-y-8">
      <Button
        variant="outline"
        onClick={handleBack}
        className="btn-medical-outline"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Dashboard
      </Button>

      {/* Profile Header */}
      <div className="medical-card p-8 bg-gradient-to-r from-primary/5 via-background to-secondary/5">
        <div className="flex items-center gap-6">
          <div className="p-4 rounded-2xl bg-primary/10">
            <User className="h-12 w-12 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold medical-heading text-primary">User Profile</h1>
            <p className="text-muted-foreground medical-subheading">
              Manage your account settings and security preferences
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        {/* User Information Card */}
        <Card className="medical-card">
          <CardHeader className="medical-card-header">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <UserCheck className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle className="medical-heading text-primary">Account Information</CardTitle>
                <CardDescription>Your profile details and role information</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="grid gap-3">
                <Label className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
                  <User className="h-4 w-4" />
                  Username
                </Label>
                <Input 
                  value={user.username} 
                  disabled 
                  className="medical-input bg-muted/30"
                />
              </div>
              
              <div className="grid gap-3">
                <Label className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
                  <Mail className="h-4 w-4" />
                  Email Address
                </Label>
                <Input 
                  value={user.email} 
                  disabled 
                  className="medical-input bg-muted/30"
                />
              </div>
              
              <div className="grid gap-3">
                <Label className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
                  <UserCheck className="h-4 w-4" />
                  Full Name
                </Label>
                <Input 
                  value={user.full_name || "Not specified"} 
                  disabled 
                  className="medical-input bg-muted/30"
                />
              </div>
              
              <div className="grid gap-3">
                <Label className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
                  <Shield className="h-4 w-4" />
                  Role & Access Level
                </Label>
                <div className="flex items-center gap-3">
                  <Input 
                    value={user.role.replace("_", " ").replace(/\b\w/g, (l: string) => l.toUpperCase())} 
                    disabled 
                    className="medical-input bg-muted/30 capitalize flex-1"
                  />
                  <div className="px-3 py-2 rounded-lg bg-secondary/10 text-secondary text-sm font-medium">
                    Active
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Change Password Card */}
        <Card className="medical-card">
          <CardHeader className="medical-card-header">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-secondary/10">
                <Lock className="h-5 w-5 text-secondary" />
              </div>
              <div>
                <CardTitle className="medical-heading text-primary">Security Settings</CardTitle>
                <CardDescription>Update your password to keep your account secure</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleChangePassword} className="space-y-6">
              <div className="grid gap-3">
                <Label htmlFor="current-password" className="text-sm font-semibold text-muted-foreground">
                  Current Password
                </Label>
                <Input
                  id="current-password"
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Enter your current password"
                  className="medical-input"
                />
              </div>
              
              <div className="grid gap-3">
                <Label htmlFor="new-password" className="text-sm font-semibold text-muted-foreground">
                  New Password
                </Label>
                <Input
                  id="new-password"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password (minimum 6 characters)"
                  className="medical-input"
                />
              </div>
              
              <div className="grid gap-3">
                <Label htmlFor="confirm-password" className="text-sm font-semibold text-muted-foreground">
                  Confirm New Password
                </Label>
                <Input
                  id="confirm-password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm your new password"
                  className="medical-input"
                />
              </div>

              <Button 
                type="submit" 
                disabled={loading} 
                className="w-full btn-medical-primary h-12 text-base font-semibold"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Updating Password...
                  </>
                ) : (
                  <>
                    <Lock className="mr-2 h-5 w-5" />
                    Update Password
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Profile;
