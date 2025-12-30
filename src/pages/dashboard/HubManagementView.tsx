import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';

interface HubEvent {
    id: string;
    title: string;
    date: string;
    time: string;
    location: string;
    price: number;
    image_url: string;
    capacity: number;
    booked: number;
    tags: string[];
    order: number;
}

interface HubTrend {
    id: string;
    label: string;
    value: string;
    change: string;
    is_positive: boolean;
    icon: string;
    order: number;
}

const HubManagementView: React.FC = () => {
    const [events, setEvents] = useState<HubEvent[]>([]);
    const [loading, setLoading] = useState(true);

    // Forms
    const [editingEvent, setEditingEvent] = useState<HubEvent | null>(null);
    const [isAddingEvent, setIsAddingEvent] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        const { data: evRes } = await supabase
            .from('hub_events')
            .select('*')
            .order('order', { ascending: true });

        if (evRes) setEvents(evRes);
        setLoading(false);
    };

    const handleSaveEvent = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const data = {
            title: formData.get('title') as string,
            date: formData.get('date') as string,
            time: formData.get('time') as string,
            location: formData.get('location') as string,
            price: parseFloat(formData.get('price') as string),
            image_url: formData.get('image_url') as string,
            capacity: parseInt(formData.get('capacity') as string),
            booked: parseInt(formData.get('booked') as string),
            tags: (formData.get('tags') as string).split(',').map(t => t.trim()),
            order: parseInt(formData.get('order') as string),
        };

        if (editingEvent) {
            await supabase.from('hub_events').update(data).eq('id', editingEvent.id);
        } else {
            await supabase.from('hub_events').insert([data]);
        }
        setEditingEvent(null);
        setIsAddingEvent(false);
        fetchData();
    };

    const handleDeleteEvent = async (id: string) => {
        if (confirm('¿Eliminar evento?')) {
            await supabase.from('hub_events').delete().eq('id', id);
            fetchData();
        }
    };

    return (
        <div className="p-8">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-black uppercase tracking-tight">VIP Hub Management</h1>
                    <p className="text-white/40 text-xs font-bold uppercase tracking-widest">Control de Eventos Exclusivos</p>
                </div>
            </div>

            <div>
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-primary italic uppercase tracking-widest">Listado de Eventos</h2>
                    <button onClick={() => setIsAddingEvent(true)} className="bg-primary text-background-dark font-black px-6 py-2 rounded-lg text-xs hover:scale-105 transition-transform">+ Nuevo Evento</button>
                </div>

                {(isAddingEvent || editingEvent) && (
                    <div className="bg-surface-dark p-6 rounded-2xl border border-primary/20 mb-8 animate-fade-in shadow-2xl">
                        <h3 className="text-lg font-bold mb-4">{editingEvent ? 'Editar Evento' : 'Nuevo Evento'}</h3>
                        <form onSubmit={handleSaveEvent} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            <input name="title" defaultValue={editingEvent?.title} placeholder="Título" className="bg-background-dark border border-white/5 p-3 rounded-lg text-sm" required />
                            <input name="location" defaultValue={editingEvent?.location} placeholder="Ubicación" className="bg-background-dark border border-white/5 p-3 rounded-lg text-sm" required />
                            <input name="date" type="date" defaultValue={editingEvent?.date} className="bg-background-dark border border-white/5 p-3 rounded-lg text-sm" required />
                            <input name="time" defaultValue={editingEvent?.time} placeholder="Hora (ej: 22:00)" className="bg-background-dark border border-white/5 p-3 rounded-lg text-sm" required />
                            <input name="price" type="number" defaultValue={editingEvent?.price} placeholder="Precio" className="bg-background-dark border border-white/5 p-3 rounded-lg text-sm" required />
                            <input name="image_url" defaultValue={editingEvent?.image_url} placeholder="URL Imagen" className="bg-background-dark border border-white/5 p-3 rounded-lg text-sm" />
                            <input name="capacity" type="number" defaultValue={editingEvent?.capacity} placeholder="Capacidad" className="bg-background-dark border border-white/5 p-3 rounded-lg text-sm" required />
                            <input name="booked" type="number" defaultValue={editingEvent?.booked} placeholder="Reservados" className="bg-background-dark border border-white/5 p-3 rounded-lg text-sm" required />
                            <input name="tags" defaultValue={editingEvent?.tags.join(', ')} placeholder="Tags (separados por coma)" className="bg-background-dark border border-white/5 p-3 rounded-lg text-sm" />
                            <input name="order" type="number" defaultValue={editingEvent?.order} placeholder="Orden" className="bg-background-dark border border-white/5 p-3 rounded-lg text-sm" />

                            <div className="col-span-full flex gap-4 mt-2">
                                <button type="submit" className="bg-primary text-background-dark font-black px-6 py-2 rounded-lg text-xs hover:bg-primary/80">Guardar Evento</button>
                                <button type="button" onClick={() => { setIsAddingEvent(false); setEditingEvent(null); }} className="text-white/40 text-xs font-bold uppercase hover:text-white transition-colors">Cancelar</button>
                            </div>
                        </form>
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {loading ? (
                        [1, 2, 3, 4].map(i => <div key={i} className="h-32 bg-white/5 animate-pulse rounded-2xl"></div>)
                    ) : (
                        events.map(event => (
                            <div key={event.id} className="bg-surface-dark border border-white/5 p-5 rounded-2xl flex gap-4 group hover:border-primary/30 transition-all">
                                <div className="size-24 rounded-xl overflow-hidden flex-shrink-0 bg-background-dark">
                                    <img src={event.image_url} className="w-full h-full object-cover transition-transform group-hover:scale-110" alt={event.title} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h3 className="font-bold truncate text-white group-hover:text-primary transition-colors">{event.title}</h3>
                                            <p className="text-white/40 text-[10px] font-bold uppercase">{event.location} • {event.date}</p>
                                        </div>
                                        <div className="flex gap-2">
                                            <button onClick={() => setEditingEvent(event)} className="text-white/20 hover:text-primary transition-colors">
                                                <span className="material-symbols-outlined text-lg">edit</span>
                                            </button>
                                            <button onClick={() => handleDeleteEvent(event.id)} className="text-white/20 hover:text-red-500 transition-colors">
                                                <span className="material-symbols-outlined text-lg">delete</span>
                                            </button>
                                        </div>
                                    </div>
                                    <div className="mt-2 flex items-center gap-4">
                                        <div>
                                            <p className="text-[9px] text-white/40 uppercase font-bold">Precio</p>
                                            <p className="text-sm font-black text-primary">${event.price}</p>
                                        </div>
                                        <div>
                                            <p className="text-[9px] text-white/40 uppercase font-bold">Resv/Cap</p>
                                            <p className="text-sm font-black text-white">{event.booked}/{event.capacity}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default HubManagementView;
