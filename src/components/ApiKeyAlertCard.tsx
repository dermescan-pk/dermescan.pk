import { KeyRound } from "lucide-react";

interface ApiKeyAlertCardProps {
  message: string;
}

export function ApiKeyAlertCard({ message }: ApiKeyAlertCardProps) {
  return (
    <div
      role="alert"
      className="min-w-0 overflow-x-hidden rounded-3xl border border-[#E8C5CA] bg-[#F6ECEF] p-6 shadow-[0_12px_40px_rgba(35,24,28,0.05)]"
    >
      <div className="flex min-w-0 items-start gap-3.5">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-[#E6DCE0] bg-white text-[#B56576]">
          <KeyRound className="h-5 w-5" />
        </div>
        <div className="min-w-0 space-y-1">
          <h3 className="font-editorial text-lg font-semibold text-[#1E181A]">
            Scan Setup Needed
          </h3>
          <p className="break-words text-sm leading-relaxed text-[#5E5055]">
            {message}
          </p>
        </div>
      </div>
    </div>
  );
}
