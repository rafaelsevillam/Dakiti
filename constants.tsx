
import { Product, NightlifeEvent, Trend } from './types';

export const PRODUCTS: Product[] = [
  {
    id: '1',
    name: 'Grey Goose Vodka',
    category: 'Licores',
    price: 45.00,
    oldPrice: 52.00,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBjxsbz_6rdRoIhw07Fg_AxM-SPvhDykhIo730Fe1HGzfET_Wl8hZ_Hifwr0L6rboIzZIKWKAsUNqbW6d4EpM1l9ShzmR01JkdZxG4w5g4ABAIkRlFNETGcOvUaCmW-s_bK_IEIvOpmoeUg_JO2v-HeM15ba0taTNBzRGLBj-ChOF2RV4Ggbgo7RI7fmwJAHmzLJ4Uv3gayhQvKseph43RLrSfVdwfl49N_kAGWRmvVoE2NOMgnaWna536mwsOSta016-tRPZ3t_88',
    rating: 4.9,
    reviews: 120,
    description: 'Vodka francés ultra-premium elaborado con trigo fino francés y agua pura de manantial.',
    volume: '750ml',
    abv: '40%',
    origin: 'Francia'
  },
  {
    id: '2',
    name: 'Belvedere Vodka',
    category: 'Licores',
    price: 48.00,
    oldPrice: 55.00,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCSNI-qXTLKzTg96beGhW8SmAEq8bats1upCcKM1dxWPR9CTVlSApaYuuckh3YGcG1-8d9BEXyfhM_Cu61XxHvFAV9VGP6Ptj_LnWBNSXkG4elkno2pNoy9RXliHjZ9Dsq_pBFCFkLMT0SEaB1B0yVOb0rKBbmbcFhJImEu6pFvA-KnuY4CmZvRH-QFVgzQnRyX2WTJnzK-Kcjo8XpXTjxvGvj1p4iZAHB6WXNGQbWUEyuuIxvZU4mm_FiMLjGr9FW50iubLqeFlEY',
    rating: 4.9,
    reviews: 128,
    description: 'Vodka de centeno polaco súper premium con notas complejas y aterciopeladas.',
    volume: '750ml',
    abv: '40%',
    origin: 'Polonia'
  },
  {
    id: '3',
    name: 'Kit de Cócteles de Verano',
    category: 'Kits',
    price: 32.00,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCY_qIyQpx8hAcI1Iwj5mN_z6LYNk1oDwVriHlbNdGA57iT33bwLxaEPtcWqlgC1xS1u7Fqf-H9GbLxvFjL_Dd9ddnsch235SmRvHLH64KXmA1rA3qN7fSYSnPB14bus20sagsoNViahLmu5MSMndfpZXBu4X0eJ6hCsF9N8zjSJR9xbGqVhOFGdXhZMg60Dao7oEPdEmu68_zRyjkxzRdgBSkbPhxGGnA4iwiuhgb8DS0tvBt9sj6BpQEdu7dTDjSTqbASToe1H4E',
    rating: 4.7,
    reviews: 85,
    description: 'Todo lo que necesitas para preparar 4 cócteles refrescantes.',
    volume: 'Set Completo',
    abv: 'Varios',
    origin: 'Local'
  },
  {
    id: '4',
    name: 'Don Julio 1942',
    category: 'Tequila',
    price: 185.00,
    image: 'https://images.unsplash.com/photo-1516997121675-4c2d04fe116e?auto=format&fit=crop&q=80&w=800',
    rating: 5.0,
    reviews: 45,
    description: 'Celebrado en los bares de cócteles, restaurantes y clubes nocturnos más exclusivos.',
    volume: '750ml',
    abv: '40%',
    origin: 'México'
  }
];

export const CATEGORIES = [
  { id: 'all', name: 'Todos', icon: 'local_fire_department' },
  { id: 'liquor', name: 'Licores', icon: 'local_bar' },
  { id: 'kits', name: 'Kits', icon: 'auto_fix_high' },
  { id: 'wine', name: 'Vinos', icon: 'wine_bar' },
  { id: 'tables', name: 'Mesas VIP', icon: 'event_seat' },
];

export const EVENTS: NightlifeEvent[] = [
  {
    id: 'e1',
    title: 'Gala VIP Neon Nights',
    date: '2024-06-15',
    time: '22:00',
    location: 'Skyline Lounge',
    image: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&q=80&w=800',
    price: 120,
    tags: ['Exclusivo', 'Barra Libre', 'DJ Set'],
    capacity: 200,
    booked: 145
  },
  {
    id: 'e2',
    title: 'Revival Disco Retro',
    date: '2024-06-22',
    time: '21:30',
    location: 'Electric Cellar',
    image: 'https://images.unsplash.com/photo-1514525253361-b83f859b73c0?auto=format&fit=crop&q=80&w=800',
    price: 45,
    tags: ['Vibras 80s', 'Fiesta de Disfraces'],
    capacity: 150,
    booked: 89
  },
  {
    id: 'e3',
    title: 'Fiesta en Yate Solsticio de Verano',
    date: '2024-07-01',
    time: '18:00',
    location: 'Marina Bay Muelle 4',
    image: 'https://images.unsplash.com/photo-1544644026-67018c690f0d?auto=format&fit=crop&q=80&w=800',
    price: 250,
    tags: ['Lujo', 'Atardecer', 'Alta Cocina'],
    capacity: 80,
    booked: 72
  }
];

export const TRENDS: Trend[] = [
  { id: 't1', label: 'Demanda de Tequila', value: '84%', change: '+12%', isPositive: true, icon: 'trending_up' },
  { id: 't2', label: 'Gasto Promedio', value: '$142', change: '+5%', isPositive: true, icon: 'attach_money' },
  { id: 't3', label: 'Tiempos de Espera', value: '18min', change: '-4min', isPositive: true, icon: 'timer' },
  { id: 't4', label: 'Capacidad VIP', value: '92%', change: '+15%', isPositive: true, icon: 'groups' }
];
