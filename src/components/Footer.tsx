
import { Heart, Activity, Shield, Award } from "lucide-react";
import { Link } from "react-router-dom";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-border/50 bg-gradient-to-t from-accent/5 to-background">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Main Footer Content */}
        <div className="py-12 md:py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8 md:mb-12">
            {/* Brand Section */}
            <div className="lg:col-span-1 space-y-4">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-primary/80">
                  <Heart className="h-5 w-5 text-white" fill="white" />
                </div>
                <div>
                  <p className="font-bold text-foreground">HeartSight AI</p>
                  <p className="text-xs text-muted-foreground">Medical AI Platform</p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Advanced AI-powered cardiomegaly detection for healthcare professionals. Trusted by hospitals and clinics.
              </p>
              <div className="flex items-center gap-4 pt-2">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Shield className="h-4 w-4 text-primary/60" />
                  <span>HIPAA</span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Award className="h-4 w-4 text-primary/60" />
                  <span>FDA Approved</span>
                </div>
              </div>
            </div>

            {/* Medical Resources */}
            <div className="space-y-4">
              <h4 className="font-semibold text-foreground">Medical Resources</h4>
              <ul className="space-y-2.5">
                {[
                  { label: "Cardiology Guidelines", href: "https://www.heart.org/" },
                  { label: "Imaging Standards", href: "https://www.mayoclinic.org/" },
                  { label: "Clinical Research", href: "#" },
                  { label: "Documentation", href: "#" }
                ].map((link, idx) => (
                  <li key={idx}>
                    <a
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-muted-foreground hover:text-primary transition-colors duration-200 flex items-center gap-2 group"
                    >
                      <span className="h-1.5 w-1.5 rounded-full bg-primary/40 group-hover:bg-primary transition-colors"></span>
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* System Links */}
            <div className="space-y-4">
              <h4 className="font-semibold text-foreground">System</h4>
              <ul className="space-y-2.5">
                {[
                  { label: "Dashboard", href: "/" },
                  { label: "Admin Panel", href: "/admin" },
                  { label: "User Profile", href: "/profile" },
                  { label: "Help & Support", href: "#" }
                ].map((link, idx) => (
                  <li key={idx}>
                    <Link
                      to={link.href}
                      className="text-sm text-muted-foreground hover:text-primary transition-colors duration-200 flex items-center gap-2 group"
                    >
                      <span className="h-1.5 w-1.5 rounded-full bg-primary/40 group-hover:bg-primary transition-colors"></span>
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Legal */}
            <div className="space-y-4">
              <h4 className="font-semibold text-foreground">Legal</h4>
              <ul className="space-y-2.5">
                {[
                  { label: "Privacy Policy", href: "#" },
                  { label: "Terms of Service", href: "#" },
                  { label: "HIPAA Compliance", href: "#" },
                  { label: "Security", href: "#" }
                ].map((link, idx) => (
                  <li key={idx}>
                    <a
                      href={link.href}
                      className="text-sm text-muted-foreground hover:text-primary transition-colors duration-200 flex items-center gap-2 group"
                    >
                      <span className="h-1.5 w-1.5 rounded-full bg-primary/40 group-hover:bg-primary transition-colors"></span>
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-border/30"></div>
        </div>

        {/* Bottom Footer */}
        <div className="py-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            © {currentYear} HeartSight AI. All rights reserved. | Developed by Medical AI Lab
          </p>
          <div className="flex items-center gap-6">
            <a href="#" className="text-xs text-muted-foreground hover:text-primary transition-colors">
              Status
            </a>
            <a href="#" className="text-xs text-muted-foreground hover:text-primary transition-colors">
              API Docs
            </a>
            <a href="#" className="text-xs text-muted-foreground hover:text-primary transition-colors">
              Contact
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
