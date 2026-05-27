import { useNavigate } from "react-router-dom";
import AuthForm from "@/components/AuthForm";
import { User } from "@/services/api";
import Hero from "@/components/Hero";

const Index = () => {
  const navigate = useNavigate();

  const handleAuthenticate = (success: boolean, userData?: User) => {
    if (success && userData) {
      // Store user data in localStorage for persistence
      localStorage.setItem("user", JSON.stringify(userData));
      
      // Redirect based on role
      switch (userData.role) {
        case "admin":
          navigate("/admin");
          break;
        case "reception":
          navigate("/reception");
          break;
        case "general_doctor":
          navigate("/general-doctor");
          break;
        case "doctor":
          navigate("/doctor");
          break;
        case "xray_technician":
          navigate("/technician");
          break;
        default:
          navigate("/doctor");
      }
    }
  };

  return (
    <main className="min-h-screen flex flex-col">
      {/* Hero Section */}
      <section className="flex-1">
        <Hero />
      </section>

      {/* Login Section */}
      <section className="py-16 md:py-20 px-4 bg-gradient-to-b from-background via-background to-accent/5 border-t border-border/30">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 lg:gap-16 items-start">
            {/* Left Column - Info */}
            <div className="lg:col-span-1 space-y-6 flex flex-col justify-center">
              <div>
                <h2 className="text-2xl md:text-3xl font-bold mb-3">System Access</h2>
                <p className="text-muted-foreground">
                  Secure authentication for healthcare professionals. Each role provides customized access to the diagnostic tools and patient data.
                </p>
              </div>

              {/* Feature Highlights */}
              <div className="space-y-4 pt-4">
                {[
                  {
                    title: "Multi-Role Access",
                    desc: "Admin, Doctors, Technicians, Reception"
                  },
                  {
                    title: "Secure Authentication",
                    desc: "Industry-standard encryption protocols"
                  },
                  {
                    title: "Session Management",
                    desc: "Real-time monitoring and control"
                  }
                ].map((item, idx) => (
                  <div key={idx} className="flex gap-3">
                    <div className="flex-shrink-0 w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center mt-0.5">
                      <div className="w-2 h-2 rounded-full bg-primary"></div>
                    </div>
                    <div>
                      <p className="font-medium text-sm">{item.title}</p>
                      <p className="text-xs text-muted-foreground">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Column - Auth Form */}
            <div className="lg:col-span-2">
              <div className="bg-gradient-to-br from-card to-card/50 rounded-2xl p-8 md:p-10 border border-border/50 shadow-xl">
                <AuthForm onAuthenticate={handleAuthenticate} showResetButton={true} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Indicators Section */}
      <section className="py-12 md:py-16 px-4 border-t border-border/30">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
            {[
              { label: "HIPAA", value: "Compliant" },
              { label: "FDA", value: "Approved" },
              { label: "ISO", value: "Certified" },
              { label: "ML", value: "Deep Learning" }
            ].map((item, idx) => (
              <div key={idx} className="text-center">
                <p className="text-xs font-semibold text-primary uppercase tracking-wide mb-1">{item.label}</p>
                <p className="text-sm text-muted-foreground">{item.value}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
};

export default Index;
