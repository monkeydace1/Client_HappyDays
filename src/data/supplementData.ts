import type { Supplement, ChildSeat, Insurance } from '../types';

export const childSeats: ChildSeat[] = [
    {
        id: 'child_seat_baby',
        type: 'child_seat',
        seatType: 'baby',
        name: 'Siège bébé (0-1 an)',
        description: 'Pour les enfants de 0 à 13 kg',
        pricePerDay: 5,
        quantity: 0
    },
    {
        id: 'child_seat_toddler',
        type: 'child_seat',
        seatType: 'toddler',
        name: 'Siège enfant (1-4 ans)',
        description: 'Pour les enfants de 9 à 18 kg',
        pricePerDay: 5,
        quantity: 0
    },
    {
        id: 'child_seat_booster',
        type: 'child_seat',
        seatType: 'booster',
        name: 'Rehausseur (4-12 ans)',
        description: 'Pour les enfants de 15 à 36 kg',
        pricePerDay: 3,
        quantity: 0
    }
];

export const insuranceOptions: Insurance[] = [
    {
        id: 'insurance_basic',
        type: 'insurance',
        coverageLevel: 'basic',
        name: 'Assurance de base',
        description: 'Couverture minimum requise par la loi',
        pricePerDay: 0,
        coverageDetails: [
            'Responsabilité civile',
            'Franchise: 1000€',
            'Pas de protection vol'
        ]
    },
    {
        id: 'insurance_standard',
        type: 'insurance',
        coverageLevel: 'standard',
        name: 'Assurance standard',
        description: 'Protection complète recommandée',
        pricePerDay: 12,
        coverageDetails: [
            'Responsabilité civile',
            'Franchise réduite: 500€',
            'Protection vol incluse',
            'Bris de glace'
        ]
    },
    {
        id: 'insurance_premium',
        type: 'insurance',
        coverageLevel: 'premium',
        name: 'Assurance premium',
        description: 'Couverture maximale sans souci',
        pricePerDay: 20,
        coverageDetails: [
            'Responsabilité civile',
            'Franchise: 0€',
            'Protection vol et incendie',
            'Bris de glace',
            'Dommages au conducteur',
            'Assistance 24/7'
        ]
    }
];

export const additionalDriverSupplement: Supplement = {
    id: 'additional_driver',
    type: 'additional_driver',
    name: 'Conducteur supplémentaire',
    description: 'Autorisation pour un deuxième conducteur',
    pricePerDay: 8
};
