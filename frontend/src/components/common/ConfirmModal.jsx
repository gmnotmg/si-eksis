export default function ConfirmModal({ open, title, message, onConfirm, onCancel, loading, danger = true }) {
  if (!open) return null
  return (
    <div className="modal-overlay">
      <div className="modal-card max-w-sm">
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 ${danger ? 'bg-red-100' : 'bg-yellow-100'}`}>
          {danger
            ? <svg className="w-6 h-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
            : <svg className="w-6 h-6 text-yellow-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
          }
        </div>
        <h3 className="text-base font-bold text-stone-800 mb-1">{title}</h3>
        <p className="text-sm text-stone-500 mb-6">{message}</p>
        <div className="flex gap-2">
          <button onClick={onConfirm} disabled={loading}
            className={`flex-1 justify-center ${danger ? 'btn-danger' : 'btn-primary'}`}>
            {loading ? 'Memproses...' : 'Ya, Lanjutkan'}
          </button>
          <button onClick={onCancel} className="btn-secondary">Batal</button>
        </div>
      </div>
    </div>
  )
}