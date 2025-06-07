
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { createAdminUser } from '@/utils/createAdmin';
import { useToast } from '@/hooks/use-toast';

const AdminCreator = () => {
  const [isCreating, setIsCreating] = useState(false);
  const [created, setCreated] = useState(false);
  const { toast } = useToast();

  const handleCreateAdmin = async () => {
    setIsCreating(true);
    try {
      await createAdminUser();
      setCreated(true);
      toast({
        title: "Admin User Created",
        description: "You can now log in with username 'Admin' and password 'Admin'",
      });
    } catch (error: any) {
      toast({
        title: "Error Creating Admin",
        description: error.message || "Failed to create admin user",
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  if (created) {
    return (
      <Alert className="border-green-200 bg-green-50 mb-4">
        <AlertDescription className="text-green-800">
          Admin user created successfully! You can now log in with:
          <br />
          <strong>Username:</strong> Admin
          <br />
          <strong>Password:</strong> Admin
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Card className="mb-4 border-blue-200">
      <CardHeader className="bg-blue-50">
        <CardTitle className="text-blue-800">Create Admin User</CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        <Alert className="border-blue-200 bg-blue-50 mb-4">
          <AlertDescription className="text-blue-800">
            Click the button below to create an admin user so you can log in and manage employees.
          </AlertDescription>
        </Alert>
        <Button 
          onClick={handleCreateAdmin}
          disabled={isCreating}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          {isCreating ? 'Creating Admin User...' : 'Create Admin User'}
        </Button>
      </CardContent>
    </Card>
  );
};

export default AdminCreator;
