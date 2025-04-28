import bcrypt from 'bcryptjs';

/**
 * Function to verify if the provided password matches the hashed password
 * @param {string} inputPassword - The password input by the user
 * @param {string} storedPassword - The hashed password stored in the database
 * @returns {Promise<boolean>} - Returns true if the password matches, otherwise false
 */
export async function verifyPassword(inputPassword: string, storedPassword: string): Promise<boolean> {
  try {
    // Compare the input password with the stored hashed password
    return await bcrypt.compare(inputPassword, storedPassword);
  } catch (error) {
    console.error('Error verifying password:', error);
    return false;
  }
}
