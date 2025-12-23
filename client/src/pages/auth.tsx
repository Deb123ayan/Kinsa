import { useState } from "react";
import { useLocation } from "wouter";
import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/auth-context";
import { motion } from "framer-motion";
import { LoadingScreen } from "@/components/loading-screen";

export default function Auth() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [showLoadingScreen, setShowLoadingScreen] = useState(false);

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setShowLoadingScreen(true);
    setLoading(true);
    
    try {
      const formData = new FormData(e.currentTarget);
      const email = formData.get("email") as string;
      const password = formData.get("password") as string;
      
      await login(email, password);
      
      toast({
        title: "Welcome Back",
        description: "Successfully logged into your partner account.",
      });
      
      setLocation("/dashboard");
    } catch (error) {
      toast({
        title: "Login Failed",
        description: "Please check your credentials and try again.",
        variant: "destructive",
      });
      setShowLoadingScreen(false);
      setLoading(false);
    }
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      toast({
        title: "Account Application Received",
        description: "Our team will verify your business details within 24 hours.",
      });
    }, 1000);
  };

  if (showLoadingScreen) {
    return <LoadingScreen />;
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-20 flex justify-center items-center min-h-[80vh]">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="w-full max-w-md shadow-lg border-primary/10">
            <CardHeader className="text-center space-y-2">
              <CardTitle className="text-3xl font-serif text-primary">Partner Portal</CardTitle>
              <CardDescription>
                Access wholesale pricing, track shipments, and manage orders.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="login" className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-8">
                  <TabsTrigger value="login">Login</TabsTrigger>
                  <TabsTrigger value="register">Apply for Access</TabsTrigger>
                </TabsList>
                
                <TabsContent value="login">
                  <form onSubmit={handleLogin} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Business Email</Label>
                      <Input 
                        id="email" 
                        name="email"
                        type="email" 
                        placeholder="name@company.com" 
                        required 
                        disabled={loading}
                      />
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <Label htmlFor="password">Password</Label>
                        <a href="#" className="text-xs text-accent hover:underline">Forgot password?</a>
                      </div>
                      <Input 
                        id="password" 
                        name="password"
                        type="password" 
                        required 
                        disabled={loading}
                      />
                    </div>
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Button 
                        type="submit" 
                        className="w-full bg-primary hover:bg-primary/90" 
                        disabled={loading}
                      >
                        {loading ? "Authenticating..." : "Sign In"}
                      </Button>
                    </motion.div>
                  </form>
                </TabsContent>
                
                <TabsContent value="register">
                  <form onSubmit={handleRegister} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="firstName">First Name</Label>
                        <Input id="firstName" required />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lastName">Last Name</Label>
                        <Input id="lastName" required />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="reg-email">Business Email</Label>
                      <Input id="reg-email" type="email" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="company">Company Name</Label>
                      <Input id="company" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="iec">Import/Export License No.</Label>
                      <Input id="iec" placeholder="Optional" />
                    </div>
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Button 
                        type="submit" 
                        className="w-full bg-accent hover:bg-accent/90 text-white" 
                        disabled={loading}
                      >
                        {loading ? "Submitting..." : "Submit Application"}
                      </Button>
                    </motion.div>
                  </form>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </Layout>
  );
}
