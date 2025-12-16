import React, { useState } from 'react';
import { ArrowLeft, Mail, User, Phone, MapPin, MessageSquare, Send, Check, AlertCircle, Upload, CreditCard, Globe, Copy, MessageCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useBookingStore } from '../../store/bookingStore';
import type { ClientInfo } from '../../types';
import { saveBooking, uploadLicensePhoto, openWhatsApp, type BookingSubmission } from '../../lib/bookingService';

export const ClientInformation: React.FC = () => {
    const {
        clientInfo,
        setClientInfo,
        previousStep,
        getTotalPrice,
        getSupplementsTotal,
        departureDate,
        returnDate,
        pickupLocation,
        customPickupLocation,
        returnLocation,
        differentReturnLocation,
        selectedVehicle,
        rentalDays,
        supplements,
        additionalDriver
    } = useBookingStore();

    const navigate = useNavigate();

    const [formData, setFormData] = useState<ClientInfo>({
        firstName: clientInfo?.firstName || '',
        lastName: clientInfo?.lastName || '',
        email: clientInfo?.email || '',
        phone: clientInfo?.phone || '',
        country: clientInfo?.country || '',
        city: clientInfo?.city || '',
        address: clientInfo?.address || '',
        dateOfBirth: clientInfo?.dateOfBirth || '',
        driverLicense: {
            documentNumber: clientInfo?.driverLicense?.documentNumber || '',
            issueDate: clientInfo?.driverLicense?.issueDate || '',
            expirationDate: clientInfo?.driverLicense?.expirationDate || '',
            photoFile: clientInfo?.driverLicense?.photoFile || null,
            photoUrl: clientInfo?.driverLicense?.photoUrl || ''
        },
        extraInformation: clientInfo?.extraInformation || '',
        notes: clientInfo?.notes || '',
        paymentMethod: clientInfo?.paymentMethod || 'cash',
        acceptedTerms: clientInfo?.acceptedTerms || false
    });

    const [errors, setErrors] = useState<{ [key: string]: string }>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [bookingReference, setBookingReference] = useState<string>('');
    const [submitError, setSubmitError] = useState<string>('');
    const [photoPreview, setPhotoPreview] = useState<string>(clientInfo?.driverLicense?.photoUrl || '');
    const [savedBookingData, setSavedBookingData] = useState<BookingSubmission | null>(null);

    const validateForm = (): boolean => {
        const newErrors: { [key: string]: string } = {};

        // Basic fields
        if (!formData.firstName.trim()) newErrors.firstName = 'Le prénom est requis';
        if (!formData.lastName.trim()) newErrors.lastName = 'Le nom de famille est requis';

        if (!formData.email.trim()) {
            newErrors.email = "L'email est requis";
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = "L'email n'est pas valide";
        }

        if (!formData.phone.trim()) {
            newErrors.phone = 'Le téléphone est requis';
        } else if (!/^[\d\s+\-()]+$/.test(formData.phone)) {
            newErrors.phone = 'Le numéro de téléphone n\'est pas valide';
        }

        if (!formData.country.trim()) newErrors.country = 'Le pays est requis';
        if (!formData.city.trim()) newErrors.city = 'La ville est requise';

        // Driver's license validation
        if (!formData.driverLicense.documentNumber.trim()) {
            newErrors.licenseNumber = 'Le numéro de permis est requis';
        }
        if (!formData.driverLicense.issueDate) {
            newErrors.licenseIssue = 'La date d\'émission est requise';
        }
        if (!formData.driverLicense.expirationDate) {
            newErrors.licenseExpiration = 'La date d\'expiration est requise';
        }

        if (!formData.acceptedTerms) {
            newErrors.acceptedTerms = 'Vous devez accepter les termes et conditions';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleInputChange = (field: keyof ClientInfo | string, value: unknown) => {
        if (field.includes('.')) {
            const [parent, child] = field.split('.');
            setFormData(prev => ({
                ...prev,
                [parent]: {
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    ...(prev as any)[parent],
                    [child]: value
                }
            }));
        } else {
            setFormData(prev => ({ ...prev, [field]: value }));
        }

        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: '' }));
        }
    };

    const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            // Validate file type
            if (!file.type.startsWith('image/')) {
                setErrors(prev => ({ ...prev, photo: 'Veuillez sélectionner une image' }));
                return;
            }

            // Create preview
            const reader = new FileReader();
            reader.onloadend = () => {
                const result = reader.result as string;
                setPhotoPreview(result);
                setFormData(prev => ({
                    ...prev,
                    driverLicense: {
                        ...prev.driverLicense,
                        photoFile: file,
                        photoUrl: result
                    }
                }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        if (!selectedVehicle) {
            setSubmitError('Veuillez sélectionner un véhicule');
            return;
        }

        setIsSubmitting(true);
        setSubmitError('');

        try {
            const totalPrice = getTotalPrice();
            const supplementsTotal = getSupplementsTotal();
            const vehicleTotal = selectedVehicle.pricePerDay * rentalDays;

            // Upload license photo if provided
            let licensePhotoUrl: string | null = null;
            if (formData.driverLicense.photoFile) {
                // Generate a temporary reference for the photo upload
                const tempRef = `temp-${Date.now()}`;
                licensePhotoUrl = await uploadLicensePhoto(formData.driverLicense.photoFile, tempRef);
            }

            // Prepare booking submission data
            const bookingData: BookingSubmission = {
                departureDate,
                returnDate,
                rentalDays,
                pickupLocation,
                customPickupLocation: customPickupLocation || undefined,
                returnLocation: returnLocation || undefined,
                differentReturnLocation,
                selectedVehicle,
                supplements,
                additionalDriver,
                clientInfo: formData,
                vehicleTotal,
                supplementsTotal,
                totalPrice,
            };

            // Save to Supabase
            const result = await saveBooking(bookingData, licensePhotoUrl);

            if (!result.success) {
                throw new Error(result.error);
            }

            // Store the booking reference
            const reference = result.data.booking_reference;

            // Navigate to thank you page with booking details
            // Using both URL params (for reliability) and state (for data)
            navigate(`/merci?ref=${reference}`, {
                state: {
                    bookingReference: reference,
                    clientName: `${formData.firstName} ${formData.lastName}`,
                    vehicleName: selectedVehicle?.name,
                    departureDate,
                    returnDate,
                    totalPrice: getTotalPrice(),
                },
                replace: true
            });

        } catch (error) {
            console.error('Error submitting booking:', error);
            setSubmitError(
                error instanceof Error
                    ? error.message
                    : 'Une erreur est survenue lors de la soumission. Veuillez réessayer.'
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    const copyBookingReference = () => {
        navigator.clipboard.writeText(bookingReference);
    };

    if (isSubmitted) {
        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white rounded-2xl shadow-2xl p-12 text-center"
            >
                <div className="mb-6">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-4">
                        <Check size={40} className="text-green-600" />
                    </div>
                    <h2 className="text-3xl font-bold text-secondary mb-2">
                        Réservation confirmée !
                    </h2>
                    <p className="text-lg text-gray-600">
                        Merci {formData.firstName} ! Votre demande de réservation a été envoyée avec succès.
                    </p>
                </div>

                {/* Booking Reference */}
                <div className="bg-gradient-to-r from-primary/10 to-primary/5 border-2 border-primary/30 rounded-xl p-6 mb-6">
                    <p className="text-sm text-gray-600 mb-2">Votre référence de réservation</p>
                    <div className="flex items-center justify-center gap-3">
                        <span className="text-2xl font-bold text-primary tracking-wider">
                            {bookingReference}
                        </span>
                        <button
                            onClick={copyBookingReference}
                            className="p-2 hover:bg-primary/10 rounded-lg transition-colors"
                            title="Copier la référence"
                        >
                            <Copy size={20} className="text-primary" />
                        </button>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                        Conservez cette référence pour le suivi de votre réservation
                    </p>
                </div>

                <div className="bg-primary/5 border border-primary/20 rounded-lg p-6 mb-6">
                    <p className="text-gray-700 mb-2">
                        Nous allons vous contacter très prochainement pour confirmer votre réservation.
                    </p>
                    <p className="text-sm text-gray-600">
                        Cliquez sur le bouton ci-dessous pour nous envoyer les détails de votre réservation via WhatsApp.
                    </p>
                </div>

                <div className="space-y-4">
                    {savedBookingData && (
                        <button
                            onClick={() => openWhatsApp(bookingReference, savedBookingData)}
                            className="w-full inline-flex items-center justify-center gap-3 bg-green-600 hover:bg-green-700 text-white font-bold py-4 px-8 rounded-lg transition-all text-lg"
                        >
                            <MessageCircle size={24} />
                            Envoyer via WhatsApp
                        </button>
                    )}

                    <p className="text-sm text-gray-600 text-center">
                        Un récapitulatif sera envoyé à <strong>{formData.email}</strong>
                    </p>

                    <button
                        onClick={() => window.location.reload()}
                        className="w-full bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold py-3 px-8 rounded-lg transition-all"
                    >
                        Nouvelle réservation
                    </button>
                </div>
            </motion.div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="space-y-8"
        >
            <div>
                <h2 className="text-3xl font-bold text-secondary mb-2">
                    Vos informations
                </h2>
                <p className="text-gray-600">
                    Dernière étape : complétez vos coordonnées
                </p>
            </div>

            <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-lg p-8 space-y-8">
                {/* Personal Information */}
                <div className="space-y-6">
                    <h3 className="text-xl font-bold text-secondary border-b pb-2">Informations personnelles</h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* First Name */}
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700 flex items-center gap-2">
                                <User size={16} className="text-primary" />
                                Prénom *
                            </label>
                            <input
                                type="text"
                                value={formData.firstName}
                                onChange={(e) => handleInputChange('firstName', e.target.value)}
                                className={`w-full px-4 py-3 rounded-lg border ${errors.firstName ? 'border-red-500' : 'border-gray-200'} focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all`}
                                placeholder="Jean"
                            />
                            {errors.firstName && (
                                <div className="flex items-center gap-2 text-red-500 text-sm">
                                    <AlertCircle size={16} />
                                    <span>{errors.firstName}</span>
                                </div>
                            )}
                        </div>

                        {/* Last Name */}
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700 flex items-center gap-2">
                                <User size={16} className="text-primary" />
                                Nom de famille *
                            </label>
                            <input
                                type="text"
                                value={formData.lastName}
                                onChange={(e) => handleInputChange('lastName', e.target.value)}
                                className={`w-full px-4 py-3 rounded-lg border ${errors.lastName ? 'border-red-500' : 'border-gray-200'} focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all`}
                                placeholder="Dupont"
                            />
                            {errors.lastName && (
                                <div className="flex items-center gap-2 text-red-500 text-sm">
                                    <AlertCircle size={16} />
                                    <span>{errors.lastName}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Email */}
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700 flex items-center gap-2">
                            <Mail size={16} className="text-primary" />
                            Email *
                        </label>
                        <input
                            type="email"
                            value={formData.email}
                            onChange={(e) => handleInputChange('email', e.target.value)}
                            className={`w-full px-4 py-3 rounded-lg border ${errors.email ? 'border-red-500' : 'border-gray-200'} focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all`}
                            placeholder="jean.dupont@example.com"
                        />
                        {errors.email && (
                            <div className="flex items-center gap-2 text-red-500 text-sm">
                                <AlertCircle size={16} />
                                <span>{errors.email}</span>
                            </div>
                        )}
                    </div>

                    {/* Phone */}
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700 flex items-center gap-2">
                            <Phone size={16} className="text-primary" />
                            Numéro de téléphone *
                        </label>
                        <input
                            type="tel"
                            value={formData.phone}
                            onChange={(e) => handleInputChange('phone', e.target.value)}
                            className={`w-full px-4 py-3 rounded-lg border ${errors.phone ? 'border-red-500' : 'border-gray-200'} focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all`}
                            placeholder="+213 555 123 456"
                        />
                        {errors.phone && (
                            <div className="flex items-center gap-2 text-red-500 text-sm">
                                <AlertCircle size={16} />
                                <span>{errors.phone}</span>
                            </div>
                        )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Country */}
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700 flex items-center gap-2">
                                <Globe size={16} className="text-primary" />
                                Pays *
                            </label>
                            <input
                                type="text"
                                value={formData.country}
                                onChange={(e) => handleInputChange('country', e.target.value)}
                                className={`w-full px-4 py-3 rounded-lg border ${errors.country ? 'border-red-500' : 'border-gray-200'} focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all`}
                                placeholder="Algérie"
                            />
                            {errors.country && (
                                <div className="flex items-center gap-2 text-red-500 text-sm">
                                    <AlertCircle size={16} />
                                    <span>{errors.country}</span>
                                </div>
                            )}
                        </div>

                        {/* City */}
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700 flex items-center gap-2">
                                <MapPin size={16} className="text-primary" />
                                Ville *
                            </label>
                            <input
                                type="text"
                                value={formData.city}
                                onChange={(e) => handleInputChange('city', e.target.value)}
                                className={`w-full px-4 py-3 rounded-lg border ${errors.city ? 'border-red-500' : 'border-gray-200'} focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all`}
                                placeholder="Oran"
                            />
                            {errors.city && (
                                <div className="flex items-center gap-2 text-red-500 text-sm">
                                    <AlertCircle size={16} />
                                    <span>{errors.city}</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Driver's License Information */}
                <div className="space-y-6">
                    <h3 className="text-xl font-bold text-secondary border-b pb-2">Permis de conduire</h3>

                    {/* License Photo Upload */}
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700 flex items-center gap-2">
                            <Upload size={16} className="text-primary" />
                            Photo du permis
                        </label>
                        <div className="flex items-center gap-4">
                            <label className="flex-1 cursor-pointer">
                                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-primary transition-colors">
                                    {photoPreview ? (
                                        <div>
                                            <img src={photoPreview} alt="License preview" className="max-h-40 mx-auto mb-2 rounded" />
                                            <p className="text-sm text-gray-600">Cliquez pour changer</p>
                                        </div>
                                    ) : (
                                        <div>
                                            <Upload size={32} className="mx-auto mb-2 text-gray-400" />
                                            <p className="text-sm text-gray-600">Cliquez pour télécharger</p>
                                        </div>
                                    )}
                                </div>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handlePhotoUpload}
                                    className="hidden"
                                />
                            </label>
                        </div>
                        {errors.photo && (
                            <div className="flex items-center gap-2 text-red-500 text-sm">
                                <AlertCircle size={16} />
                                <span>{errors.photo}</span>
                            </div>
                        )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* License Number */}
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">
                                Numéro de document *
                            </label>
                            <input
                                type="text"
                                value={formData.driverLicense.documentNumber}
                                onChange={(e) => handleInputChange('driverLicense.documentNumber', e.target.value)}
                                className={`w-full px-4 py-3 rounded-lg border ${errors.licenseNumber ? 'border-red-500' : 'border-gray-200'} focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all`}
                                placeholder="ABC123456"
                            />
                            {errors.licenseNumber && (
                                <div className="flex items-center gap-2 text-red-500 text-sm">
                                    <AlertCircle size={16} />
                                    <span>{errors.licenseNumber}</span>
                                </div>
                            )}
                        </div>

                        {/* Issue Date */}
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">
                                Date d'émission *
                            </label>
                            <input
                                type="date"
                                value={formData.driverLicense.issueDate}
                                onChange={(e) => handleInputChange('driverLicense.issueDate', e.target.value)}
                                className={`w-full px-4 py-3 rounded-lg border ${errors.licenseIssue ? 'border-red-500' : 'border-gray-200'} focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all`}
                            />
                            {errors.licenseIssue && (
                                <div className="flex items-center gap-2 text-red-500 text-sm">
                                    <AlertCircle size={16} />
                                    <span>{errors.licenseIssue}</span>
                                </div>
                            )}
                        </div>

                        {/* Expiration Date */}
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">
                                Date d'expiration *
                            </label>
                            <input
                                type="date"
                                value={formData.driverLicense.expirationDate}
                                onChange={(e) => handleInputChange('driverLicense.expirationDate', e.target.value)}
                                min={new Date().toISOString().split('T')[0]}
                                className={`w-full px-4 py-3 rounded-lg border ${errors.licenseExpiration ? 'border-red-500' : 'border-gray-200'} focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all`}
                            />
                            {errors.licenseExpiration && (
                                <div className="flex items-center gap-2 text-red-500 text-sm">
                                    <AlertCircle size={16} />
                                    <span>{errors.licenseExpiration}</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Additional Information */}
                <div className="space-y-6">
                    <h3 className="text-xl font-bold text-secondary border-b pb-2">Informations supplémentaires</h3>

                    {/* Extra Information */}
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700 flex items-center gap-2">
                            <MessageSquare size={16} className="text-primary" />
                            Informations autres que l'on devrait connaître
                        </label>
                        <textarea
                            value={formData.extraInformation}
                            onChange={(e) => handleInputChange('extraInformation', e.target.value)}
                            rows={3}
                            className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all resize-none"
                            placeholder="Toute information que nous devrions connaître..."
                        />
                    </div>
                </div>

                {/* Payment Method */}
                <div className="space-y-4">
                    <h3 className="text-xl font-bold text-secondary border-b pb-2">Mode de paiement</h3>
                    <div className="bg-gradient-to-r from-primary/5 to-primary/10 border border-primary/20 rounded-lg p-4">
                        <label className="flex items-center gap-3 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={formData.paymentMethod === 'cash'}
                                readOnly
                                className="w-5 h-5 text-primary rounded focus:ring-primary"
                            />
                            <div className="flex items-center gap-2">
                                <CreditCard size={20} className="text-primary" />
                                <span className="font-medium text-gray-700">Paiement en espèces</span>
                            </div>
                        </label>
                        <p className="text-sm text-gray-600 mt-2 ml-8">
                            Le paiement sera effectué en espèces lors de la prise en charge du véhicule
                        </p>
                    </div>
                </div>

                {/* Terms & Conditions */}
                <div className="space-y-2">
                    <label className="flex items-start gap-3 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={formData.acceptedTerms}
                            onChange={(e) => handleInputChange('acceptedTerms', e.target.checked)}
                            className={`mt-1 w-5 h-5 text-primary rounded focus:ring-primary ${errors.acceptedTerms ? 'border-red-500' : ''}`}
                        />
                        <span className="text-sm text-gray-700">
                            Oui, j'accepte les{' '}
                            <a href="#" className="text-primary hover:text-primary-hover underline">
                                termes et conditions
                            </a>{' '}
                            de location. *
                        </span>
                    </label>
                    {errors.acceptedTerms && (
                        <div className="flex items-center gap-2 text-red-500 text-sm ml-8">
                            <AlertCircle size={16} />
                            <span>{errors.acceptedTerms}</span>
                        </div>
                    )}
                </div>

                {/* WhatsApp Communication Notice */}
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <label className="flex items-start gap-3 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={true}
                            readOnly
                            className="mt-1 w-5 h-5 text-green-600 rounded focus:ring-green-500"
                        />
                        <span className="text-sm text-gray-700">
                            Je comprends que l'on communiquera avec vous via WhatsApp dans les plus brefs délais.
                        </span>
                    </label>
                </div>

                {/* Error Message */}
                {submitError && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
                        <AlertCircle size={20} className="text-red-500 flex-shrink-0 mt-0.5" />
                        <div>
                            <p className="text-red-700 font-medium">Erreur lors de la soumission</p>
                            <p className="text-red-600 text-sm">{submitError}</p>
                        </div>
                    </div>
                )}

                {/* Navigation Buttons */}
                <div className="flex gap-4 pt-4">
                    <button
                        type="button"
                        onClick={previousStep}
                        disabled={isSubmitting}
                        className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold py-4 px-6 rounded-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <ArrowLeft size={20} />
                        Retour
                    </button>
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="flex-1 bg-primary hover:bg-primary-hover text-white font-bold py-4 px-6 rounded-lg transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-primary/30 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isSubmitting ? (
                            <>
                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                <span>Sauvegarde en cours...</span>
                            </>
                        ) : (
                            <>
                                <Send size={20} />
                                <span>Confirmer la réservation</span>
                            </>
                        )}
                    </button>
                </div>

                <p className="text-xs text-gray-500 text-center">
                    * Champs obligatoires
                </p>
            </form>
        </motion.div>
    );
};
