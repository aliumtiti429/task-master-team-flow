
import { authService } from '@/services/authService';

export const createAdminUser = async () => {
  try {
    console.log('Creating admin user...');
    const result = await authService.createEmployee(
      'admin@company.com',
      'Admin',
      'admin',
      'Admin'
    );
    console.log('Admin user created successfully:', result);
    return result;
  } catch (error) {
    console.error('Error creating admin user:', error);
    throw error;
  }
};
