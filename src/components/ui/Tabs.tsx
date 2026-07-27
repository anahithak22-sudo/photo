interface Tab {
  label: string;
  value: string;
}

interface TabsProps {
  tabs: Tab[];
  value: string;
  onChange: (value: string) => void;
}

export default function Tabs({ tabs, value, onChange }: TabsProps) {
  return (
    <div className="flex gap-6 border-b border-hairline">
      {tabs.map((tab) => (
        <button
          key={tab.value}
          onClick={() => onChange(tab.value)}
          className={`-mb-px border-b-2 px-1 pb-3 font-sans text-sm transition-colors ${
            value === tab.value
              ? "border-ink text-ink"
              : "border-transparent text-pebble hover:text-stone"
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
