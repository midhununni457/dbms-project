"use client";
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { useRouter } from "next/navigation";
import { useApi } from "../context/ApiContext";
import { useEffect } from "react";

export default function Home() {
  const router = useRouter();

  const features = [
    {
      title: "Secure Testing",
      description:
        "Advanced security measures ensure fair and honest examinations with real-time monitoring.",
      icon: "🔒",
    },
    {
      title: "Real-time Results",
      description:
        "Instant grading and immediate feedback help students understand their performance.",
      icon: "⚡",
    },
    {
      title: "Multi-format Questions",
      description:
        "Support for multiple choice, essay, and various question types for comprehensive testing.",
      icon: "📝",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="bg-card/50 backdrop-blur-sm border-b border-border px-4 py-4 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl font-bold text-foreground">ExamPortal</h1>
          </div>
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              onClick={() => router.push("/login")}
              className="text-foreground hover:text-primary"
            >
              Login
            </Button>
            <Button
              onClick={() => router.push("/signup")}
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              Get Started
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <div className="space-y-8">
            <h1 className="text-5xl md:text-6xl font-bold text-foreground leading-tight">
              Modern Online
              <span className="block text-primary">Examination Portal</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Transform your testing experience with our secure, feature-rich
              platform designed for educators and students. Conduct exams with
              confidence and get instant results.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button
                size="lg"
                onClick={() => router.push("/signup")}
                className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-3 text-lg"
              >
                SignUp
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={() => router.push("/login")}
                className="border-primary text-primary hover:bg-primary hover:text-primary-foreground px-8 py-3 text-lg"
              >
                Sign In
              </Button>
            </div>
          </div>
        </div>

        {/* Background decoration */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-primary/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl"></div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground mb-4">
              Everything You Need for Online Exams
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Our comprehensive platform provides all the tools necessary for
              conducting secure and efficient online examinations.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card
                key={index}
                className="hover:shadow-lg transition-all duration-300 hover:scale-105"
              >
                <CardHeader>
                  <div className="text-4xl mb-4">{feature.icon}</div>
                  <CardTitle className="text-xl text-foreground">
                    {feature.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base leading-relaxed">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
            <div className="space-y-2">
              <div className="text-4xl font-bold text-primary">10</div>
              <div className="text-muted-foreground">Students Served</div>
            </div>
            <div className="space-y-2">
              <div className="text-4xl font-bold text-primary">2</div>
              <div className="text-muted-foreground">Exams Conducted</div>
            </div>
            <div className="space-y-2">
              <div className="text-4xl font-bold text-primary">99.9%</div>
              <div className="text-muted-foreground">Uptime</div>
            </div>
            <div className="space-y-2">
              <div className="text-4xl font-bold text-primary">24/7</div>
              <div className="text-muted-foreground">Support</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-primary/5">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-foreground mb-6">
            Ready to Transform Your Testing Experience?
          </h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join thousands of educators who trust our platform for their online
            examination needs. Start your free trial today and experience the
            difference.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              onClick={() => router.push("/signup")}
              className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-3 text-lg"
            >
              Get Started Now
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="border-primary text-primary hover:bg-primary hover:text-primary-foreground px-8 py-3 text-lg"
            >
              Learn More
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-card border-t border-border py-12 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <div className="mb-8">
            <h3 className="text-2xl font-bold text-foreground mb-2">
              ExamPortal
            </h3>
            <p className="text-muted-foreground">
              Empowering education through technology
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
