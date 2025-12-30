
import React, { useState } from 'react';
import { EVENTS, TRENDS } from '../constants';
import { NightlifeEvent } from '../types';

const NightlifeHub: React.FC = () => {
  const [selectedEvent, setSelectedEvent] = useState<NightlifeEvent | null>(null);
  const [bookingStep, setBookingStep] = useState<'details' | 'confirm' | 'success'>('details');

  const handleBook = (event: NightlifeEvent) => {
    setSelectedEvent(event);
    setBookingStep('details');
  };

  return (
    <div className="space-y-12 animate-fade-in">
      {/* Sección de Analítica / Tendencias */}
      <section>
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-black uppercase tracking-tighter">Perspectivas del Mercado</h2>
            <p className="text-white/40 text-sm font-bold uppercase tracking-widest mt-1">Datos Nocturnos en Vivo • Tiempo Real</p>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/30 rounded-full">
            <div className="size-2 bg-primary rounded-full animate-pulse"></div>
            <span className="text-[10px] font-black uppercase tracking-widest text-primary">Pulso en Vivo</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {TRENDS.map((trend) => (
            <div key={trend.id} className="bg-surface-dark border border-surface-border p-6 rounded-[2rem] group hover:border-primary/40 transition-all">
              <div className="flex justify-between items-start mb-4">
                <div className="size-12 bg-white/5 rounded-2xl flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <span className="material-symbols-outlined text-primary">{trend.icon}</span>
                </div>
                <span className={`text-xs font-bold px-2 py-1 rounded-md ${trend.isPositive ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                  {trend.change}
                </span>
              </div>
              <p className="text-white/40 text-[10px] font-bold uppercase tracking-[0.2em] mb-1">{trend.label}</p>
              <h4 className="text-3xl font-black">{trend.value}</h4>
            </div>
          ))}
        </div>
      </section>

      {/* Sección de Eventos / Reservas */}
      <section>
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-black uppercase tracking-tighter">Próximos Eventos</h2>
            <p className="text-white/40 text-sm font-bold uppercase tracking-widest mt-1">Reserva tu lugar en la lista de invitados VIP</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {EVENTS.map((event) => (
            <div key={event.id} className="relative group bg-surface-dark rounded-[2.5rem] overflow-hidden border border-surface-border hover:border-primary/50 transition-all duration-500">
              <div className="aspect-[4/3] overflow-hidden">
                <img src={event.image} alt={event.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                <div className="absolute inset-0 bg-gradient-to-t from-surface-dark via-transparent to-transparent opacity-90"></div>
              </div>
              
              <div className="absolute top-4 left-4 flex flex-wrap gap-2">
                {event.tags.map(tag => (
                  <span key={tag} className="px-3 py-1 bg-black/40 backdrop-blur-md rounded-full text-[10px] font-bold uppercase tracking-widest border border-white/10">
                    {tag}
                  </span>
                ))}
              </div>

              <div className="p-8">
                <div className="flex items-center gap-2 text-primary text-[10px] font-bold uppercase tracking-widest mb-2">
                  <span className="material-symbols-outlined text-xs">calendar_today</span>
                  {new Date(event.date).toLocaleDateString('es-ES', { month: 'short', day: 'numeric', year: 'numeric' })} • {event.time}
                </div>
                <h3 className="text-2xl font-black mb-2">{event.title}</h3>
                <div className="flex items-center gap-2 text-white/40 text-xs mb-6">
                  <span className="material-symbols-outlined text-sm">location_on</span>
                  {event.location}
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest">Entrada Desde</p>
                    <p className="text-2xl font-black text-white">${event.price}</p>
                  </div>
                  <button 
                    onClick={() => handleBook(event)}
                    className="px-6 py-3 bg-primary text-white rounded-full font-bold text-xs uppercase tracking-widest hover:scale-105 transition-transform shadow-lg shadow-primary/20"
                  >
                    Reservar
                  </button>
                </div>

                <div className="mt-6 pt-6 border-t border-surface-border">
                  <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest mb-2">
                    <span className="text-white/40">Disponibilidad</span>
                    <span className="text-primary">{event.capacity - event.booked} cupos libres</span>
                  </div>
                  <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-primary" 
                      style={{ width: `${(event.booked / event.capacity) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Modal de Reserva */}
      {selectedEvent && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-background-dark/95 backdrop-blur-xl" onClick={() => setSelectedEvent(null)}></div>
          <div className="relative w-full max-w-lg bg-surface-dark border border-surface-border rounded-[3rem] overflow-hidden shadow-2xl animate-zoom-in">
            {bookingStep === 'details' && (
              <div className="p-10">
                <div className="flex justify-between items-start mb-8">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-primary">Reserva VIP</span>
                    <h2 className="text-3xl font-black mt-1">{selectedEvent.title}</h2>
                  </div>
                  <button onClick={() => setSelectedEvent(null)} className="text-white/40 hover:text-white">
                    <span className="material-symbols-outlined">close</span>
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-8">
                  <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                    <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest mb-1">Fecha Preferida</p>
                    <input type="date" defaultValue={selectedEvent.date} className="w-full bg-transparent border-none text-white font-bold p-0 focus:ring-0" />
                  </div>
                  <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                    <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest mb-1">Invitados</p>
                    <select className="w-full bg-transparent border-none text-white font-bold p-0 focus:ring-0">
                      {[1,2,4,6,8,10].map(n => <option key={n} value={n} className="bg-surface-dark">{n} VIPs</option>)}
                    </select>
                  </div>
                </div>

                <div className="space-y-4 mb-10">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-white/40">Servicio de Mesa VIP</span>
                    <span className="font-bold">Incluido</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-white/40">Crédito Botella Premium</span>
                    <span className="font-bold">$100.00</span>
                  </div>
                  <div className="h-px bg-surface-border"></div>
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-bold">Depósito Total</span>
                    <span className="text-2xl font-black text-primary">${selectedEvent.price + 100}</span>
                  </div>
                </div>

                <button 
                  onClick={() => setBookingStep('confirm')}
                  className="w-full py-5 bg-primary text-white rounded-full font-bold uppercase tracking-[0.2em] shadow-xl shadow-primary/20 hover:scale-[1.02] transition-transform"
                >
                  Confirmar Reserva
                </button>
              </div>
            )}

            {bookingStep === 'confirm' && (
              <div className="p-10 text-center flex flex-col items-center">
                <div className="size-20 bg-primary/20 rounded-full flex items-center justify-center text-primary mb-6">
                  <span className="material-symbols-outlined text-4xl">celebration</span>
                </div>
                <h2 className="text-3xl font-black mb-4">¡Reserva Asegurada!</h2>
                <p className="text-white/60 mb-8 leading-relaxed">
                  Tu experiencia VIP en <strong>{selectedEvent.title}</strong> está confirmada. Revisa tu correo para el pase de entrada digital.
                </p>
                <div className="w-full bg-white/5 border border-white/10 rounded-2xl p-6 mb-8 text-left">
                  <div className="flex justify-between mb-2">
                    <span className="text-[10px] text-white/40 font-bold uppercase tracking-widest">Cód Conf</span>
                    <span className="text-[10px] font-bold text-primary tracking-widest">#DKTY-8291X</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[10px] text-white/40 font-bold uppercase tracking-widest">Ubicación</span>
                    <span className="text-[10px] font-bold text-white tracking-widest uppercase">{selectedEvent.location}</span>
                  </div>
                </div>
                <button 
                  onClick={() => setSelectedEvent(null)}
                  className="w-full py-4 border border-surface-border text-white rounded-full font-bold uppercase tracking-widest hover:bg-white/5 transition-colors"
                >
                  Cerrar Panel
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NightlifeHub;
