import type { Vehicle } from '../types';

// Base path for vehicle images
// Images should be placed in /public/vehicles/{brand-model}/
// Example: /public/vehicles/fiat-500x/main.jpg, /public/vehicles/fiat-500x/1.jpg, etc.
const getVehicleImage = (folder: string) => `/vehicles/${folder}/main.jpg`;
const getVehicleImages = (folder: string, extraCount: number) => {
    const images = [getVehicleImage(folder)];
    for (let i = 1; i <= extraCount; i++) {
        images.push(`/vehicles/${folder}/${i}.jpg`);
    }
    return images;
};

export const vehicles: Vehicle[] = [
    // === PREMIUM / SUV ===
    {
        id: 1,
        name: 'Fiat 500X',
        brand: 'Fiat',
        model: '500X',
        year: 2024,
        category: 'SUV',
        image: getVehicleImage('fiat-500x'),
        images: getVehicleImages('fiat-500x', 2),
        transmission: 'Automatique',
        fuel: 'Essence',
        seats: 5,
        pricePerDay: 45,
        featured: true,
        features: ['CarPlay', 'Climatisation auto', 'Feux LED', 'Écran tactile', '1.4L 140ch']
    },

    // === CITADINES RÉCENTES ===
    {
        id: 2,
        name: 'Renault Clio 5',
        brand: 'Renault',
        model: 'Clio 5',
        year: 2022,
        category: 'Citadine',
        image: getVehicleImage('renault-clio5'),
        images: getVehicleImages('renault-clio5', 2),
        transmission: 'Manuelle',
        fuel: 'Essence',
        seats: 5,
        pricePerDay: 35,
        featured: true,
        features: ['CarPlay', 'Écran tactile', 'Line Assist', '1.0L 90ch']
    },
    {
        id: 3,
        name: 'Peugeot 208',
        brand: 'Peugeot',
        model: '208',
        year: 2022,
        category: 'Citadine',
        image: getVehicleImage('peugeot-208'),
        images: getVehicleImages('peugeot-208', 0),
        transmission: 'Manuelle',
        fuel: 'Essence',
        seats: 5,
        pricePerDay: 35,
        featured: true,
        features: ['Écran tactile', 'Radar de recul', '1.2L PureTech']
    },
    {
        id: 4,
        name: 'Seat Ibiza',
        brand: 'Seat',
        model: 'Ibiza',
        year: 2019,
        category: 'Citadine',
        image: getVehicleImage('seat-ibiza-2019-auto'),
        images: getVehicleImages('seat-ibiza-2019-auto', 2),
        transmission: 'Automatique',
        fuel: 'Essence',
        seats: 5,
        pricePerDay: 35,
        featured: true,
        features: ['Feux LED', 'Écran tactile', '1.6L MPI']
    },
    {
        id: 5,
        name: 'Seat Ibiza FR',
        brand: 'Seat',
        model: 'Ibiza FR',
        year: 2019,
        category: 'Citadine',
        image: getVehicleImage('seat-ibiza-fr'),
        images: getVehicleImages('seat-ibiza-fr', 2),
        transmission: 'Manuelle',
        fuel: 'Essence',
        seats: 5,
        pricePerDay: 35,
        featured: false,
        features: ['Feux LED', 'CarPlay', 'Écran tactile', '1.6L MPI']
    },
    {
        id: 6,
        name: 'Suzuki Swift',
        brand: 'Suzuki',
        model: 'Swift',
        year: 2022,
        category: 'Citadine',
        image: getVehicleImage('suzuki-swift'),
        images: getVehicleImages('suzuki-swift', 1),
        transmission: 'Automatique',
        fuel: 'Essence',
        seats: 5,
        pricePerDay: 30,
        featured: false,
        features: ['Compact', 'Économique']
    },

    // === COMPACTES ===
    {
        id: 7,
        name: 'Volkswagen Polo Star Plus',
        brand: 'Volkswagen',
        model: 'Polo Star Plus',
        year: 2019,
        category: 'Citadine',
        image: getVehicleImage('vw-polo-2019'),
        images: getVehicleImages('vw-polo-2019', 2),
        transmission: 'Manuelle',
        fuel: 'Essence',
        seats: 5,
        pricePerDay: 32,
        featured: false,
        features: ['Écran tactile', '1.6L MPI']
    },
    {
        id: 8,
        name: 'Renault Clio 4 Limited',
        brand: 'Renault',
        model: 'Clio 4 Limited 2',
        year: 2019,
        category: 'Citadine',
        image: getVehicleImage('renault-clio4-limited'),
        images: getVehicleImages('renault-clio4-limited', 1),
        transmission: 'Manuelle',
        fuel: 'Diesel',
        seats: 5,
        pricePerDay: 32,
        featured: false,
        features: ['Économique', 'Diesel']
    },
    {
        id: 9,
        name: 'Seat Ibiza Style',
        brand: 'Seat',
        model: 'Ibiza Style',
        year: 2018,
        category: 'Citadine',
        image: getVehicleImage('seat-ibiza-style'),
        images: getVehicleImages('seat-ibiza-style', 1),
        transmission: 'Manuelle',
        fuel: 'Essence',
        seats: 5,
        pricePerDay: 30,
        featured: false,
        features: ['Style', 'Économique']
    },
    {
        id: 10,
        name: 'Fiat 500 Dolce Vita',
        brand: 'Fiat',
        model: '500 Dolce Vita',
        year: 2025,
        category: 'Citadine',
        image: getVehicleImage('fiat-500-dolcevita'),
        images: getVehicleImages('fiat-500-dolcevita', 1),
        transmission: 'Manuelle',
        fuel: 'Hybride',
        seats: 4,
        pricePerDay: 30,
        featured: false,
        features: ['Hybride', '3 portes', 'Design italien']
    },
    {
        id: 11,
        name: 'Toyota Yaris',
        brand: 'Toyota',
        model: 'Yaris',
        year: 2020,
        category: 'Citadine',
        image: getVehicleImage('toyota-yaris'),
        images: getVehicleImages('toyota-yaris', 2),
        transmission: 'Automatique',
        fuel: 'Essence',
        seats: 5,
        pricePerDay: 28,
        featured: false,
        features: ['Écran tactile', 'Fiable']
    },

    // === ÉCONOMIQUES ===
    {
        id: 12,
        name: 'Renault Symbol',
        brand: 'Renault',
        model: 'Symbol',
        year: 2018,
        category: 'Berline',
        image: getVehicleImage('renault-symbol'),
        images: getVehicleImages('renault-symbol', 1),
        transmission: 'Manuelle',
        fuel: 'Essence',
        seats: 5,
        pricePerDay: 26,
        featured: false,
        features: ['Écran tactile', '1.2L 16V', 'Spacieux']
    },
    {
        id: 13,
        name: 'Seat Ibiza Sol',
        brand: 'Seat',
        model: 'Ibiza Sol',
        year: 2017,
        category: 'Citadine',
        image: getVehicleImage('seat-ibiza-sol'),
        images: getVehicleImages('seat-ibiza-sol', 0),
        transmission: 'Manuelle',
        fuel: 'Essence',
        seats: 5,
        pricePerDay: 27,
        featured: false,
        features: ['Écran tactile', '1.6L MPI']
    },
    {
        id: 14,
        name: 'Kia Picanto',
        brand: 'Kia',
        model: 'Picanto',
        year: 2019,
        category: 'Mini',
        image: getVehicleImage('kia-picanto'),
        images: getVehicleImages('kia-picanto', 0),
        transmission: 'Manuelle',
        fuel: 'Essence',
        seats: 4,
        pricePerDay: 25,
        featured: false,
        features: ['Écran tactile', 'Compact', 'Économique']
    },
    {
        id: 15,
        name: 'Volkswagen Polo Carat',
        brand: 'Volkswagen',
        model: 'Polo Carat',
        year: 2016,
        category: 'Citadine',
        image: getVehicleImage('vw-polo-carat'),
        images: getVehicleImages('vw-polo-carat', 0),
        transmission: 'Manuelle',
        fuel: 'Essence',
        seats: 5,
        pricePerDay: 28,
        featured: false,
        features: ['Écran tactile', 'Feux LED', '1.6L MPI']
    },
    {
        id: 16,
        name: 'Renault Clio 4',
        brand: 'Renault',
        model: 'Clio 4',
        year: 2016,
        category: 'Citadine',
        image: getVehicleImage('renault-clio4-2016'),
        images: getVehicleImages('renault-clio4-2016', 0),
        transmission: 'Manuelle',
        fuel: 'Essence',
        seats: 5,
        pricePerDay: 25,
        featured: false,
        features: ['1.2L 16V', 'Économique']
    },
    {
        id: 17,
        name: 'Renault Clio 4',
        brand: 'Renault',
        model: 'Clio 4',
        year: 2013,
        category: 'Citadine',
        image: getVehicleImage('renault-clio4-2013'),
        images: getVehicleImages('renault-clio4-2013', 0),
        transmission: 'Manuelle',
        fuel: 'Essence',
        seats: 5,
        pricePerDay: 22,
        featured: false,
        features: ['1.2L 16V', 'Économique']
    },

    // === BUDGET ===
    {
        id: 18,
        name: 'Nissan Micra',
        brand: 'Nissan',
        model: 'Micra',
        year: 2015,
        category: 'Mini',
        image: getVehicleImage('nissan-micra'),
        images: getVehicleImages('nissan-micra', 0),
        transmission: 'Manuelle',
        fuel: 'Essence',
        seats: 5,
        pricePerDay: 20,
        featured: false,
        features: ['Compact', 'Économique']
    },
    {
        id: 19,
        name: 'Ford Fiesta',
        brand: 'Ford',
        model: 'Fiesta',
        year: 2014,
        category: 'Citadine',
        image: getVehicleImage('ford-fiesta'),
        images: getVehicleImages('ford-fiesta', 0),
        transmission: 'Manuelle',
        fuel: 'Essence',
        seats: 5,
        pricePerDay: 20,
        featured: false,
        features: ['1.4L', 'Économique']
    }
];

export const getVehicleById = (id: number): Vehicle | undefined => {
    return vehicles.find(v => v.id === id);
};

export const getFeaturedVehicles = (): Vehicle[] => {
    return vehicles.filter(v => v.featured);
};

export const getVehiclesByCategory = (category: string): Vehicle[] => {
    return vehicles.filter(v => v.category === category);
};

export const getVehiclesByPriceRange = (min: number, max: number): Vehicle[] => {
    return vehicles.filter(v => v.pricePerDay >= min && v.pricePerDay <= max);
};

// Category definitions for filtering
export const VEHICLE_CATEGORIES = [
    'SUV',
    'Citadine',
    'Berline',
    'Compacte',
    'Mini'
] as const;

// Price ranges for filtering
export const PRICE_RANGES = [
    { label: 'Économique (≤25€)', min: 0, max: 25 },
    { label: 'Standard (26-35€)', min: 26, max: 35 },
    { label: 'Premium (36€+)', min: 36, max: 100 }
] as const;
