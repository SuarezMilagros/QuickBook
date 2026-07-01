export default function PantallaConfirmacion({ reservaData, onVerMisReservas }) {
  if (!reservaData) return null
  const { status, codigo_verificacion, reserva } = reservaData
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 max-w-md mx-auto text-center">
      <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <span className="text-green-600 text-2xl">✓</span>
      </div>
      <h2 className="text-2xl font-bold text-gray-800 mb-4">{status}</h2>
      <div className="my-5 p-4 bg-blue-50 rounded-xl border border-blue-200">
        <p className="text-xs text-blue-500 font-medium uppercase tracking-wide mb-1">Código de verificación</p>
        <p className="text-3xl font-mono font-bold text-blue-700 tracking-widest">{codigo_verificacion}</p>
      </div>
      <div className="text-left bg-gray-50 rounded-xl p-4 mb-6 space-y-2">
        {[['Cliente', reserva.cliente], ['Fecha/Hora', reserva.fecha_hora], ['Estado', reserva.estado], ['ID', `#${reserva.id}`]].map(([label, value]) => (
          <div key={label} className="flex justify-between text-sm">
            <span className="text-gray-500">{label}</span>
            <span className={`font-medium ${label === 'Estado' ? 'text-green-600' : 'text-gray-800'}`}>{value}</span>
          </div>
        ))}
      </div>
      <button onClick={onVerMisReservas} className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-colors">
        Ver mis reservas →
      </button>
    </div>
  )
}