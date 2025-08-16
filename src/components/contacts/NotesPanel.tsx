import { useEffect, useMemo, useState } from "react";

type NotesPanelProps = {
  initialNotes: string;
  onSave: (notes: string) => Promise<void> | void;
};

function useDebounced<T>(value: T, delayMs: number) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(id);
  }, [value, delayMs]);
  return debounced;
}

export default function NotesPanel({ initialNotes, onSave }: NotesPanelProps) {
  const [notes, setNotes] = useState(initialNotes || "");
  const debounced = useDebounced(notes, 600);

  useEffect(() => {
    // mantener sincronizado si cambia de fuera
    setNotes(initialNotes || "");
  }, [initialNotes]);

  useEffect(() => {
    if (debounced !== initialNotes) {
      Promise.resolve(onSave(debounced));
    }
  }, [debounced]);

  const counter = useMemo(() => notes.length, [notes]);

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-lg font-semibold">Notes</h2>
        <span className="text-xs text-gray-400">{counter} chars</span>
      </div>
      <textarea
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder="Escribe notas del contacto..."
        className="w-full min-h-[160px] border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
      />
      <p className="text-xs text-gray-400 mt-2">Guardado automático</p>
    </div>
  );
}


