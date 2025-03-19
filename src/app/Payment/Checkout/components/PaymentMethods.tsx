import React from 'react';
import { CreditCard, Banknote, Wallet } from 'lucide-react';

interface PaymentMethodsProps {
  selectedMethod: string | null;
  onSelect: (method: string) => void;
}

const methods = [
  { name: 'Credit/Debit Card', icon: <CreditCard /> },
  { name: 'Bank Transfer', icon: <Banknote /> },
  { name: 'Wallet', icon: <Wallet /> },
];

const PaymentMethods: React.FC<PaymentMethodsProps> = ({ selectedMethod, onSelect }) => {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-lg font-semibold text-base-content mb-4">Payment Method</h2>

      <div className="flex flex-col gap-4">
        {methods.map((method) => (
          <button
            key={method.name}
            className={`flex items-center justify-between border p-4 rounded-lg transition
              ${selectedMethod === method.name ? 'border-primary bg-primary/10' : 'border-neutral/30'}`}
            onClick={() => onSelect(method.name)}
          >
            <div className="flex items-center gap-4">
              <div className="text-primary">{method.icon}</div>
              <span className="text-sm font-medium text-base-content">{method.name}</span>
            </div>
            {selectedMethod === method.name && (
              <span className="text-success font-semibold">Selected</span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
};

export default PaymentMethods;
