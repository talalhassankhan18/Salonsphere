import { checkPasswordStrength } from '@/lib/validation';

export default function PasswordStrengthMeter({ password }: { password: string }) {
  const strength = checkPasswordStrength(password);
  const strengthText = ['Very weak', 'Weak', 'Moderate', 'Strong', 'Very strong'][strength];
  const strengthColor = [
    'bg-red-500',
    'bg-orange-500',
    'bg-yellow-500',
    'bg-blue-500',
    'bg-green-500'
  ][strength];

  return (
    <div className="mt-2">
      <div className="flex gap-1 mb-1">
        {[1, 2, 3, 4].map((level) => (
          <div
            key={level}
            className={`h-1 flex-1 rounded-sm ${
              strength >= level ? strengthColor : 'bg-gray-200'
            }`}
          />
        ))}
      </div>
      <p className="text-xs text-gray-500">
        Password strength: <span className={`font-medium ${strengthColor.replace('bg', 'text')}`}>
          {strengthText}
        </span>
      </p>
    </div>
  );
}