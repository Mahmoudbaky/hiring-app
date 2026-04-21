interface SwitchProps {
  on: boolean;
  onChange: (v: boolean) => void;
}

export function DSwitch({ on, onChange }: SwitchProps) {
  return (
    <button
      type="button"
      className="switch"
      data-on={String(on)}
      onClick={() => onChange(!on)}
      aria-pressed={on}
    />
  );
}
