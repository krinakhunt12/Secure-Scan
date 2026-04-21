import React from 'react';

interface Props {
  onBack?: () => void;
}

export default function TermsOfService({ onBack }: Props) {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <button onClick={onBack} className="mb-6 text-sm text-blue-400 hover:underline">← Back</button>
      <h1 className="text-2xl font-bold mb-4">Terms of Service</h1>
      <p className="text-sm text-slate-300 leading-relaxed">
        These Terms of Service govern your use of SecureScan AI. By using our services you agree
        to comply with applicable laws and not to misuse the scanning capabilities.
      </p>

      <section className="mt-6 text-sm text-slate-300">
        <h2 className="font-semibold">Acceptable Use</h2>
        <p>Users must have authorization to scan targets and must not attempt attacks or abuse.</p>

        <h2 className="mt-4 font-semibold">Liability</h2>
        <p>SecureScan AI provides informational security reports and is not liable for damages arising from their use.</p>
      </section>
    </div>
  );
}
