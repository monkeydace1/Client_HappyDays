import type { Vehicle } from '../types';

export const vehicles: Vehicle[] = [
    {
        id: 1,
        name: 'Renault Clio 5',
        brand: 'Renault',
        model: 'Clio 5',
        category: 'Citadine',
        image: 'https://images.unsplash.com/photo-1621007947382-bb3c3968e3bb?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
        transmission: 'Manuelle',
        fuel: 'Essence',
        seats: 5,
        pricePerDay: 35,
        featured: true
    },
    {
        id: 2,
        name: 'Dacia Sandero Stepway',
        brand: 'Dacia',
        model: 'Sandero Stepway',
        category: 'Citadine',
        image: 'https://images.unsplash.com/photo-1621007947382-bb3c3968e3bb?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
        transmission: 'Manuelle',
        fuel: 'Essence',
        seats: 5,
        pricePerDay: 40,
        featured: true
    },
    {
        id: 3,
        name: 'Peugeot 208',
        brand: 'Peugeot',
        model: '208',
        category: 'Citadine',
        image: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
        transmission: 'Automatique',
        fuel: 'Essence',
        seats: 5,
        pricePerDay: 45,
        featured: true
    },
    {
        id: 4,
        name: 'Hyundai Tucson',
        brand: 'Hyundai',
        model: 'Tucson',
        category: 'SUV',
        image: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
        transmission: 'Automatique',
        fuel: 'Diesel',
        seats: 5,
        pricePerDay: 80,
        featured: true
    },
    {
        id: 5,
        name: 'Volkswagen Golf',
        brand: 'Volkswagen',
        model: 'Golf',
        category: 'Compacte',
        image: 'https://images.unsplash.com/photo-1621007947382-bb3c3968e3bb?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
        transmission: 'Automatique',
        fuel: 'Essence',
        seats: 5,
        pricePerDay: 50,
        featured: false
    },
    {
        id: 6,
        name: 'Toyota Corolla',
        brand: 'Toyota',
        model: 'Corolla',
        category: 'Berline',
        image: 'https://images.unsplash.com/photo-1621007947382-bb3c3968e3bb?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
        transmission: 'Automatique',
        fuel: 'Hybride',
        seats: 5,
        pricePerDay: 60,
        featured: false
    }
];

export const getVehicleById = (id: number): Vehicle | undefined => {
    return vehicles.find(v => v.id === id);
};

export const getFeaturedVehicles = (): Vehicle[] => {
    return vehicles.filter(v => v.featured);
};
