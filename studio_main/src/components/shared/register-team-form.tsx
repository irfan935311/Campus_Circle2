
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import type { Team } from '@/lib/types';
import { cn } from '@/lib/utils';

const paymentMethods = [
  { 
    id: 'google-pay', 
    name: 'Google Pay', 
    logo: <GooglePayLogo className="h-6" />
  },
  { 
    id: 'phonepe', 
    name: 'PhonePe',
    logo: <PhonePeLogo className="h-8" />
  },
  { 
    id: 'paytm', 
    name: 'Paytm',
    logo: <PaytmLogo className="h-6" />
  },
];

type RegisterTeamFormProps = {
  team: Team | null;
  setOpen: (open: boolean) => void;
};

export function RegisterTeamForm({ team, setOpen }: RegisterTeamFormProps) {
  const [selectedPayment, setSelectedPayment] = useState<string | null>(null);
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPayment) {
      toast({
        variant: "destructive",
        title: "Payment method required",
        description: "Please select a payment method to continue.",
      });
      return;
    }
    
    // In a real app, you would handle the payment processing here.
    const selectedMethod = paymentMethods.find(p => p.id === selectedPayment);
    toast({
      title: "Registration Successful!",
      description: `Team "${team?.name}" has been registered using ${selectedMethod?.name}.`,
    });
    setOpen(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
        <RadioGroup onValueChange={setSelectedPayment} className="space-y-4">
            {paymentMethods.map((method) => (
                <Label 
                    key={method.id} 
                    htmlFor={method.id}
                    className={cn(
                        "flex items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground cursor-pointer",
                        selectedPayment === method.id && "border-primary"
                    )}
                >
                    {method.logo}
                    <RadioGroupItem value={method.id} id={method.id} className="sr-only" />
                </Label>
            ))}
        </RadioGroup>

        <div className="flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit">Pay & Register</Button>
        </div>
    </form>
  );
}


function GooglePayLogo(props: React.SVGProps<SVGSVGElement>) {
    return (
      <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 51.2 20.3" xmlSpace="preserve"><path d="M12.2 7.1V5.7h-3v8.5h1.5V9.4h1.4c2.2 0 3.8-1.5 3.8-3.7-.1-2.2-1.7-3.6-3.7-3.6h-3.3zM10.7 7.1h1.4c1.2 0 2.2.8 2.2 2.3s-1 2.3-2.2 2.3h-1.4V7.1z" fill="#5f6368"/><path d="M21.2 10.9c0-2.3 1.8-3.8 3.7-3.8s3.7 1.5 3.7 3.8c0 2.3-1.8 3.8-3.7 3.8s-3.7-1.4-3.7-3.8zm5.9 0c0-1.4-1-2.4-2.2-2.4s-2.2 1-2.2 2.4 1 2.4 2.2 2.4 2.2-1.1 2.2-2.4z" fill="#5f6368"/><path d="M37 9.8c0 .8.2 1.5.7 2l-2.4 2.5h1.7l1.7-1.9c.5.1 1 .2 1.5.2 2.2 0 3.3-1.5 3.3-3.7s-1.5-3.6-3.4-3.6c-1.9 0-3.1 1.4-3.1 3.5zm4.6 0c0-1.2-.8-2-1.9-2s-1.7.9-1.7 2c0 .9.6 1.6 1.4 1.7l2.2-2.2v-.5z" fill="#5f6368"/><path d="M47.1 2.2v12h-1.5V2.2h1.5z" fill="#5f6368"/><g><path d="M2.3 8.3c1.2 0 2.2-1 2.2-2.2s-1-2.2-2.2-2.2S.1 5.1.1 6.1s.9 2.2 2.2 2.2z" fill="#ea4335"/><path d="M2.3 4.3c1.2 0 2.2 1 2.2 2.2s-1 2.2-2.2 2.2S.1 7.7.1 6.5s1-2.2 2.2-2.2z" fill="#fbbc04"/><path d="M2.3.4C1 .4 0 1.4 0 2.6c0 1.1.8 2 2 2.2l2.2-2.2C4.1 1.4 3.2.4 2.3.4z" fill="#34a853"/><path d="M4.5 2.6c.1 1.2-1 2.2-2.2 2.2S.1 3.8.1 2.6C.1 1.4 1 .4 2.3.4c1.1 0 2 .8 2.2 2z" fill="#4285f4"/><path d="M2.3 8.7c-2.4 0-4.4-2-4.4-4.4s2-4.4 4.4-4.4 4.4 2 4.4 4.4-2 4.4-4.4 4.4M2.3 0C1 .1 0 1.2 0 2.6c0 1.3 1 2.4 2.3 2.4s2.3-1.1 2.3-2.4S3.6.1 2.3 0" fill="none"/></g></svg>
    )
}

function PhonePeLogo(props: React.SVGProps<SVGSVGElement>) {
    return (
        <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 110 32"><path d="M85.4.2h9.2L83.3 18.1h13.2v8.8H95v4.9h-8.8v-4.9H73V.2h9.2v13.3L85.4.2zm-22.1 0H72v26.7H63.3V.2zm-12.2 0h9.2v26.7h-9.2V.2zM21.1 27h9.2V.2h-9.2v27zM38.8.2h9.2L36.7 18.1h13.2v8.8h1.5v4.9h-8.8v-4.9H29.4V.2h9.4v13.3L38.8.2zM0 26.9h9.2V.1H0v26.8z" fill="#5f259f"></path></svg>
    )
}

function PaytmLogo(props: React.SVGProps<SVGSVGElement>) {
    return (
        <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 22"><path d="M10.8.5H0v21h3.3v-8.8h6.7c3.9 0 6.9-2.2 6.9-6C16.9 2.7 14.1.5 10.8.5m.1 9.2H3.3V3.8h7.6c2 0 3.2 1.3 3.2 3 0 1.6-1.2 2.9-3.2 2.9" fill="#00baf2"/><path d="M21.6 21.5h3.3V.5h-3.3zM34.8 21.5h11.9v-3H38.1v-5.2h7.8v-3H38.1V3.8h8.6V.8H34.8zM47.7 21.5h3.3l6.5-9.2v9.2h3.3V.5h-3.3L51 9.7V.5h-3.3z" fill="#002e6e"/></svg>
    )
}


    