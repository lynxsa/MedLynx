/**
 * User Constants
 * 
 * Centralized user information for the logged-in user.
 * This would typically be loaded from secure storage or authentication service.
 */

export const CURRENT_USER = {
  name: 'Derah Manyelo',
  email: 'derah@lynxconsulting.co.za',
  phone: '+27812814265',
  title: 'Senior Health Technology Consultant',
  company: 'LYNX Consulting',
  location: 'Johannesburg, South Africa',
  joinedDate: '2024-01-15',
  // Note: Password should never be stored in plain text in production
  // This is for development/demo purposes only
  // In production, use secure authentication tokens
} as const;

export const USER_CREDENTIALS = {
  email: 'derah@lynxconsulting.co.za',
  // Password should be handled by authentication service
  // This constant is for reference only - never store passwords in code
  // password: 'Thethird300#' // DO NOT UNCOMMENT IN PRODUCTION
} as const;

export const USER_PREFERENCES = {
  language: 'en',
  theme: 'system', // 'light' | 'dark' | 'system'
  notifications: true,
  biometricAuth: true,
} as const;

// Helper functions to get user information
export const getUserDisplayName = () => CURRENT_USER.name;
export const getUserEmail = () => CURRENT_USER.email;
export const getUserPhone = () => CURRENT_USER.phone;

// Helper for greeting based on time of day
export const getGreeting = () => {
  const hour = new Date().getHours();
  const firstName = CURRENT_USER.name.split(' ')[0];
  
  if (hour < 12) {
    return `Good morning, ${firstName}`;
  } else if (hour < 17) {
    return `Good afternoon, ${firstName}`;
  } else {
    return `Good evening, ${firstName}`;
  }
};
