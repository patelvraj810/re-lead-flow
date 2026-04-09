import { LeadCaptureForm } from '@/components/lead-capture-form';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function NewLeadPage() {
  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <Link href="/leads" className="inline-flex items-center gap-1.5 text-[13px] text-[#5a5e6a] hover:text-[#c9a84c] transition-colors">
        <ArrowLeft className="w-4 h-4" />
        Back to Leads
      </Link>
      <LeadCaptureForm />
    </div>
  );
}