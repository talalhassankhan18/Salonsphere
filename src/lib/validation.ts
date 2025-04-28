export const validatePhone = (phone: string): boolean => {
  if (!phone) {
    console.log("Phone validation failed: Empty input"); // Debug log
    return false;
  }

  // Remove spaces, dashes, parentheses, and any non-digit/non-+ characters
  const cleanedPhone = phone.replace(/[^+\d]/g, "");

  // Accept +92, 0, or no prefix followed by 9+ digits
  const phoneRegex = /^(\+92|0)?\d{9,}$/;

  console.log("Validating phone:", phone, "Cleaned:", cleanedPhone, "Result:", phoneRegex.test(cleanedPhone)); // Debug log

  return phoneRegex.test(cleanedPhone);
};

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePassword = (password: string): boolean => {
  const minLength = 8;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumber = /\d/.test(password);
  return password.length >= minLength && hasUpperCase && hasLowerCase && hasNumber;
};

export const validateUsername = (username: string): boolean => {
  const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
  return usernameRegex.test(username);
};