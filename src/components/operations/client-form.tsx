"use client";

import { useActionState } from "react";
import { saveClient, type OperationActionState } from "@/lib/operations/client-actions";

const initialState: OperationActionState = {};
type ClientValues = {
  id?: string;
  name: string;
  company_name?: string | null;
  email?: string | null;
  phone?: string | null;
  contact_person?: string | null;
  billing_details?: { notes?: string } | null;
  address?: { formatted?: string } | null;
  internal_notes?: string | null;
};

function Field({ label, name, defaultValue, type = "text", required = false, maxLength }: {
  label: string; name: string; defaultValue?: string | null; type?: string; required?: boolean; maxLength?: number;
}) {
  return <label className="block text-sm font-medium text-navy">{label}<input className="auth-input" name={name} type={type} defaultValue={defaultValue ?? ""} required={required} maxLength={maxLength} /></label>;
}

export function ClientForm({ client, compact = false }: { client?: ClientValues; compact?: boolean }) {
  const [state, action, pending] = useActionState(saveClient, initialState);
  return <form action={action} className="space-y-4">
    {client?.id && <input type="hidden" name="id" value={client.id} />}
    <div className="grid gap-4 sm:grid-cols-2">
      <Field label="Client name" name="name" defaultValue={client?.name} required maxLength={160} />
      <Field label="Company" name="companyName" defaultValue={client?.company_name} maxLength={160} />
      <Field label="Email" name="email" type="email" defaultValue={client?.email} maxLength={254} />
      <Field label="Phone" name="phone" type="tel" defaultValue={client?.phone} maxLength={40} />
      <Field label="Contact person" name="contactPerson" defaultValue={client?.contact_person} maxLength={120} />
      <Field label="Address" name="address" defaultValue={client?.address?.formatted} maxLength={1000} />
    </div>
    <label className="block text-sm font-medium text-navy">Billing details<textarea className="auth-input min-h-20 resize-y" name="billingDetails" defaultValue={client?.billing_details?.notes ?? ""} maxLength={1000} /></label>
    <label className="block text-sm font-medium text-navy">Internal notes<textarea className="auth-input min-h-20 resize-y" name="internalNotes" defaultValue={client?.internal_notes ?? ""} maxLength={2000} /></label>
    {state.error && <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-800" role="alert">{state.error}</p>}
    {state.message && <p className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-800" role="status">{state.message}</p>}
    <button className={compact ? "rounded-lg bg-navy px-4 py-2.5 text-sm font-semibold text-white hover:bg-charcoal" : "auth-submit"} type="submit" disabled={pending}>{pending ? "Saving…" : client ? "Save client" : "Create client"}</button>
  </form>;
}
