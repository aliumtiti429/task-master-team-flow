
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

const Auth = () => {
  const { signIn, user, loading } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [signInData, setSignInData] = useState({
    name: '',
    password: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (user && !loading) {
      navigate('/');
    }
  }, [user, loading, navigate]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    try {
      await signIn(signInData.name, signInData.password);
      toast({
        title: "Welcome back!",
        description: "You have been signed in successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Sign in failed",
        description: error.message || "Invalid name or password",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-red-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-xl border-0">
        <CardHeader className="text-center bg-gradient-to-r from-red-600 to-red-700 text-white rounded-t-lg">
          <CardTitle className="text-2xl font-bold">Employee Portal</CardTitle>
          <CardDescription className="text-red-100">Sign in with your full name</CardDescription>
        </CardHeader>
        <CardContent className="p-8 bg-white">
          <form onSubmit={handleSignIn} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="signin-name" className="text-black font-medium">Full Name</Label>
              <Input
                id="signin-name"
                type="text"
                value={signInData.name}
                onChange={(e) => setSignInData({...signInData, name: e.target.value})}
                placeholder="Enter your full name"
                required
                className="border-gray-300 focus:border-red-500 focus:ring-red-500"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="signin-password" className="text-black font-medium">Password</Label>
              <Input
                id="signin-password"
                type="password"
                value={signInData.password}
                onChange={(e) => setSignInData({...signInData, password: e.target.value})}
                placeholder="Enter your password"
                required
                className="border-gray-300 focus:border-red-500 focus:ring-red-500"
              />
            </div>
            <Button 
              type="submit" 
              className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3" 
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>
          
          <div className="mt-6 text-center text-sm text-gray-600">
            <p>Don't have an account?</p>
            <p className="mt-1 text-gray-500">Contact your administrator to create an employee account for you.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;
