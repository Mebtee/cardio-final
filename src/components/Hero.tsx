
import { Heart, Zap, Shield, TrendingUp } from "lucide-react";

const Hero = () => {
  return (
    <div className="relative overflow-hidden">
      {/* Animated background gradient */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-0 -left-4 w-96 h-96 bg-primary/20 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-8 right-4 w-96 h-96 bg-secondary/20 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      {/* Hero Section */}
      <div className="relative pt-20 pb-24 md:pt-32 md:pb-40 px-4">
        <div className="max-w-6xl mx-auto">
          {/* Badge */}
          <div className="flex justify-center mb-8 md:mb-10">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 hover:border-primary/40 transition-colors duration-300">
              <Zap className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-primary">AI-Powered Medical Imaging</span>
            </div>
          </div>

          {/* Main Headline */}
          <div className="text-center mb-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text text-transparent">
              Advanced Cardiomegaly<br />Detection System
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Harness the power of advanced deep learning to detect cardiac enlargement in chest X-rays with clinical-grade accuracy. Designed for healthcare professionals who demand precision.
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16 max-w-4xl mx-auto">
            {[
              {
                icon: Zap,
                title: "Lightning Fast",
                description: "Real-time predictions in milliseconds"
              },
              {
                icon: TrendingUp,
                title: "Clinical Accuracy",
                description: "92%+ accuracy validated by radiologists"
              },
              {
                icon: Shield,
                title: "Secure & Compliant",
                description: "HIPAA compliant infrastructure"
              }
            ].map((feature, idx) => (
              <div
                key={idx}
                className="group p-6 rounded-xl bg-card border border-border/50 hover:border-primary/30 transition-all duration-300 hover:shadow-lg hover:shadow-primary/10"
              >
                <feature.icon className="h-6 w-6 text-primary mb-3 group-hover:scale-110 transition-transform duration-300" />
                <h3 className="font-semibold mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-6 md:gap-12 py-12 border-t border-b border-border/30 mb-12">
            {[
              { value: "50K+", label: "Images Analyzed" },
              { value: "92%", label: "Accuracy Rate" },
              { value: "10M+", label: "AI Parameters" }
            ].map((stat, idx) => (
              <div key={idx} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-primary mb-2">{stat.value}</div>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>

          {/* CTA Note */}
          <div className="text-center">
            <p className="text-muted-foreground mb-2">Ready to get started?</p>
            <p className="text-sm text-muted-foreground">Log in below to access the system</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;
