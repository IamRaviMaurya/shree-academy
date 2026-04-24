// UPI payment utilities
export const generateUPIPaymentUrl = (
  upiId: string,
  amount: number,
  name: string,
  description: string
): string => {
  const params = new URLSearchParams({
    pa: upiId, // Payee address (UPI ID)
    pn: name, // Payee name
    am: amount.toString(), // Amount
    cu: 'INR', // Currency
    tn: description, // Transaction note
  });

  return `upi://pay?${params.toString()}`;
};

export const generateUPIPaymentString = (
  upiId: string,
  amount: number,
  name: string,
  description: string
): string => {
  return `UPI ID: ${upiId}\nAmount: ₹${amount}\nName: ${name}\nNote: ${description}`;
};