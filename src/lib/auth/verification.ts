// @/lib/auth/verification.ts
export const generateVerificationCode = (): string => {
    // Generate a 6-digit numeric code
    return Math.floor(100000 + Math.random() * 900000).toString();
  };
  
  export const isVerificationCodeValid = (
    storedCode: string, 
    storedExpiry: Date, 
    inputCode: string
  ): boolean => {
    // Check if codes match and not expired
    return storedCode === inputCode && new Date() < new Date(storedExpiry);
  };