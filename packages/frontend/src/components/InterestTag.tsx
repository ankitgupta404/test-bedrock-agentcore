interface InterestTagProps {
  label: string;
  onRemove?: () => void;
  removable?: boolean;
}

export function InterestTag({ label, onRemove, removable = true }: InterestTagProps) {
  return (
    <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-medium bg-primary-100 text-primary-800 border border-primary-200">
      {label}
      {removable && onRemove && (
        <button
          onClick={onRemove}
          className="ml-1 text-primary-500 hover:text-primary-700 hover:bg-primary-200 rounded-full w-4 h-4 flex items-center justify-center transition-colors"
          aria-label={`Remove ${label}`}
        >
          ×
        </button>
      )}
    </span>
  );
}
