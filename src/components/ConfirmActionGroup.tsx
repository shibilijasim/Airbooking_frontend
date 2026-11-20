interface ConfirmActionGroupProps {
  isConfirming: boolean;
  isProcessing: boolean;
  triggerLabel: string;
  confirmLabel: string;
  processingLabel: string;
  cancelLabel?: string;
  variant?: 'emerald' | 'red';
  onStartConfirm: () => void;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmActionGroup({
  isConfirming,
  isProcessing,
  triggerLabel,
  confirmLabel,
  processingLabel,
  cancelLabel = 'Cancel',
  variant = 'red',
  onStartConfirm,
  onConfirm,
  onCancel,
}: ConfirmActionGroupProps) {
  const solidClass =
    variant === 'emerald'
      ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
      : 'bg-red-600 hover:bg-red-700 text-white';

  const outlineClass =
    variant === 'emerald'
      ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
      : 'border border-red-300 text-red-600 hover:bg-red-50';

  if (isConfirming) {
    return (
      <div className="flex items-center gap-1.5">
        <button
          type="button"
          onClick={onConfirm}
          disabled={isProcessing}
          className={`${solidClass} text-xs font-semibold px-3 py-1.5 rounded-lg disabled:opacity-50`}
        >
          {isProcessing ? processingLabel : confirmLabel}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="border border-gray-300 text-gray-700 hover:bg-gray-50 text-xs font-semibold px-2.5 py-1.5 rounded-lg"
        >
          {cancelLabel}
        </button>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={onStartConfirm}
      className={`${outlineClass} text-xs font-semibold px-3.5 py-1.5 rounded-lg transition-colors`}
    >
      {triggerLabel}
    </button>
  );
}