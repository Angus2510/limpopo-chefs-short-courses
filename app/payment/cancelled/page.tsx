import Link from "next/link";
import { XCircle, ChefHat } from "lucide-react";

export default function PaymentCancelledPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-border px-4 py-3 flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
          <ChefHat className="w-4 h-4 text-white" />
        </div>
        <span className="text-xs font-bold uppercase tracking-widest text-primary">
          Limpopo Chefs Academy
        </span>
      </header>

      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="max-w-md w-full text-center">
          <div className="w-20 h-20 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-4">
            <XCircle className="w-10 h-10 text-destructive" />
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-2">
            Payment Not Completed
          </h1>
          <p className="text-muted-foreground mb-8">
            Your payment was cancelled or didn&apos;t go through. No charge was
            made to your card.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 bg-primary text-white rounded-[21px] px-6 py-3 text-sm font-semibold hover:bg-primary/90 transition-colors"
          >
            <ChefHat className="w-4 h-4" />
            Go Back &amp; Try Again
          </Link>
        </div>
      </div>
    </div>
  );
}
