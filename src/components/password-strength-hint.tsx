const LEVELS = ["Weak", "Fair", "Strong"] as const;

// Advisory only: the server's one hard rule is the 8-character minimum.
function getLevel(password: string): number {
  if (password.length < 8) return 0;
  const points = [
    password.length >= 12,
    /[a-z]/.test(password) && /[A-Z]/.test(password),
    /\d/.test(password),
    /[^A-Za-z0-9]/.test(password),
  ].filter(Boolean).length;
  return points >= 3 ? 3 : points === 2 ? 2 : 1;
}

export function PasswordStrengthHint({
  id,
  password,
}: {
  id: string;
  password: string;
}) {
  const level = getLevel(password);

  return (
    <div id={id} className="mt-3">
      <div className="flex gap-1" aria-hidden>
        {LEVELS.map((name, i) => (
          <span
            key={name}
            className={`h-px flex-1 ${i < level ? "bg-foreground" : "bg-line"}`}
          />
        ))}
      </div>
      <p className="label mt-2 text-muted" aria-live="polite">
        {level === 0
          ? "Use at least 8 characters"
          : `Strength: ${LEVELS[level - 1]}`}
      </p>
    </div>
  );
}
