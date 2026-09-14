export const formatPakistaniPhone = (phone: string): string => {
  // Remove all non-digits
  const cleaned = phone.replace(/\D/g, "");

  // If empty or invalid, return as is
  if (!cleaned) return phone;

  // Convert to 10-digit format (model requirement)
  if (cleaned.length >= 10) {
    return cleaned.slice(-10); // Return last 10 digits
  }

  return phone;
};

export const validatePakistaniPhone = (phone: string): boolean => {
  const cleaned = phone.replace(/\D/g, "");

  // Accept any of these formats:
  // - 10 digits (3335759985)
  // - 11 digits starting with 0 (03335759985)
  // - 12 digits starting with 92 (923335759985)
  return (
    cleaned.length === 10 ||
    (cleaned.length === 11 && cleaned.startsWith("0")) ||
    (cleaned.length === 12 && cleaned.startsWith("92"))
  );
};
