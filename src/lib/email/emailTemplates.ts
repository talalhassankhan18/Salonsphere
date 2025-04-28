interface VerificationCodeTemplateParams {
  name: string;
  code: string;
}

export const verificationCodeEmailTemplate = ({ name, code }: VerificationCodeTemplateParams): string => `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #4a5568;">
    <h2 style="color: #2d3748;">Hello ${name},</h2>
    <p>Here is your SalonSphere Admin verification code:</p>
    
    <div style="text-align: center; margin: 25px 0;">
      <div style="display: inline-block; padding: 12px 24px; background-color: #f7fafc; 
            border: 1px solid #e2e8f0; border-radius: 4px; font-size: 24px; 
            letter-spacing: 2px; color: #2d3748; font-weight: bold;">
        ${code}
      </div>
    </div>
    
    <p>This code will expire in 10 minutes.</p>
    <p>If you didn't request this, please contact support immediately.</p>
  </div>
`;