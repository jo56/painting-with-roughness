interface RuleEditorProps {
  label: string;
  rules: number[];
  onChange: (rules: number[]) => void;
}

export function RuleEditor({ label, rules, onChange }: RuleEditorProps) {
  const numbers = [1, 2, 3, 4, 5, 6, 7, 8];

  const handleToggle = (num: number) => {
    const newRules = rules.includes(num)
      ? rules.filter((r) => r !== num)
      : [...rules, num];
    onChange(newRules.sort((a, b) => a - b));
  };

  return (
    <div style={{ marginBottom: "8px" }}>
      <label
        style={{
          fontSize: "0.9rem",
          fontWeight: "400",
          fontFamily: "monospace",
          color: "#ffffff",
          letterSpacing: "0.4px",
          display: "block",
          marginBottom: "4px",
        }}
      >
        {label}:
      </label>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "4px" }}>
        {numbers.map((num) => (
          <label
            key={num}
            style={{
              display: "flex",
              alignItems: "center",
              cursor: "pointer",
              background: "#404040",
              padding: "4px 8px",
              borderRadius: "4px",
              userSelect: "none",
            }}
          >
            <input
              type="checkbox"
              checked={rules.includes(num)}
              onChange={() => handleToggle(num)}
              style={{ marginRight: "6px", cursor: "pointer" }}
            />
            {num}
          </label>
        ))}
      </div>
    </div>
  );
}
