export function AuthMessage({ error, message }: { error?: string; message?: string }) {
  if (!error && !message) return null;
  const isError = Boolean(error);

  return (
    <p role={isError ? "alert" : "status"} className={`mb-5 rounded-xl border px-4 py-3 text-sm leading-5 ${
      isError
        ? "border-rose-200 bg-rose-50 text-rose-800"
        : "border-emerald-200 bg-emerald-50 text-emerald-800"
    }`}>
      {error ?? message}
    </p>
  );
}
