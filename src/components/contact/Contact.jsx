/* eslint-disable no-unused-vars */
/* eslint-disable react/no-unescaped-entities */
import React, { useState } from 'react';
import axios from 'axios';
import { Send, Mail, User, FileText, MessageSquare, Sun } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const Contact = () => {
    const { t } = useTranslation();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        names: '',
        email: '',
        subject: '',
        description: '',
        farmSize: '',
        interest: 'production' // Default to production interest
    });
    const [message, setMessage] = useState('');
    const [errors, setErrors] = useState({
        names: '',
        email: '',
        subject: '',
    });

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
        validateField(e.target.name, e.target.value);
    };

    const validateField = (name, value) => {
        let error = '';
        if (name === 'names' || name === 'subject') {
            if (/[^a-zA-Z\s]/.test(value)) {
                error = t('contact.errors.noSpecialChars');
            } else if (!value.trim()) {
                error = t('contact.errors.required');
            }
        } else if (name === 'email') {
            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
                error = t('contact.errors.validEmail');
            } else if (!value.trim()) {
                error = t('contact.errors.required');
            }
        }
        setErrors(prevErrors => ({
            ...prevErrors,
            [name]: error
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const hasErrors = Object.values(errors).some((error) => error);
        const hasEmptyFields = Object.values(formData).some(
            (field, key) => !field.trim() && key !== 'farmSize' // farmSize can be optional
        );
        
        if (hasErrors || hasEmptyFields) {
            setMessage(t('contact.messages.fixErrors'));
            return;
        }

        setLoading(true);
        try {
            const response = await axios.post('http://127.0.0.1:8000/contact/', formData);
            if (response.status === 200) {
                setMessage(t('contact.messages.success'));
                setFormData({
                    names: '',
                    email: '',
                    subject: '',
                    description: '',
                    farmSize: '',
                    interest: 'production'
                });
            }
        } catch (error) {
            if (error.response) {
                setMessage(error.response.data.error || t('contact.messages.failed'));
            } else {
                setMessage(t('contact.messages.failed'));
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <section className='bg-gradient-to-b from-yellow-50 to-white py-16' id="contact">
            <div className="container mx-auto px-4">
                <div className="text-center mb-12">
                    <div className="flex justify-center mb-4">
                        <Sun className="h-10 w-10 text-yellow-600" />
                    </div>
                    <h2 className='text-3xl font-bold text-yellow-800 mb-4'>
                        {t('Sunflower Solutions Inquiry')}
                    </h2>
                    <p className="text-yellow-700 max-w-2xl mx-auto">
                        {t('Connect with our smart sunflower production and marketing experts')}
                    </p>
                </div>
                
                <div className='max-w-2xl mx-auto'>
                    <div className="bg-yellow-800 rounded-lg shadow-xl overflow-hidden">
                        <div className="p-6 bg-yellow-600 text-white">
                            <h3 className="text-xl font-semibold">{t('Grow Smart, Market Smarter')}</h3>
                            <p className="text-yellow-100 mt-1">
                                {t('Get personalized advice on sunflower cultivation and market integration')}
                            </p>
                        </div>
                        
                        <form className='p-6' onSubmit={handleSubmit}>
                            {message && (
                                <div className={`mb-5 p-3 rounded ${message.includes('success') ? 'bg-green-800 text-green-100' : 'bg-yellow-800 text-yellow-100'}`}>
                                    {message}
                                </div>
                            )}
                            
                            <div className="mb-4">
                                <label className="block text-yellow-100 mb-2 font-medium">{t('Your Name')}</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <User className="h-5 w-5 text-yellow-300" />
                                    </div>
                                    <input
                                        type="text"
                                        name="names"
                                        value={formData.names}
                                        onChange={handleChange}
                                        placeholder={t('John Smith')}
                                        className='w-full p-3 pl-10 bg-yellow-700 border border-yellow-600 rounded-md text-white placeholder-yellow-200 focus:outline-none focus:ring-2 focus:ring-yellow-500'
                                    />
                                </div>
                                {errors.names && <p className="text-yellow-300 text-sm mt-1">{errors.names}</p>}
                            </div>

                            <div className="mb-4">
                                <label className="block text-yellow-100 mb-2 font-medium">{t('Email Address')}</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Mail className="h-5 w-5 text-yellow-300" />
                                    </div>
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        placeholder={t('your@email.com')}
                                        className='w-full p-3 pl-10 bg-yellow-700 border border-yellow-600 rounded-md text-white placeholder-yellow-200 focus:outline-none focus:ring-2 focus:ring-yellow-500'
                                    />
                                </div>
                                {errors.email && <p className="text-yellow-300 text-sm mt-1">{errors.email}</p>}
                            </div>

                            <div className="mb-4">
                                <label className="block text-yellow-100 mb-2 font-medium">{t('Farm Size (acres) - Optional')}</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <svg className="h-5 w-5 text-yellow-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </div>
                                    <input
                                        type="number"
                                        name="farmSize"
                                        value={formData.farmSize}
                                        onChange={handleChange}
                                        placeholder={t('e.g. 50')}
                                        className='w-full p-3 pl-10 bg-yellow-700 border border-yellow-600 rounded-md text-white placeholder-yellow-200 focus:outline-none focus:ring-2 focus:ring-yellow-500'
                                    />
                                </div>
                            </div>

                            <div className="mb-4">
                                <label className="block text-yellow-100 mb-2 font-medium">{t('I\'m interested in')}</label>
                                <div className="grid grid-cols-2 gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setFormData({...formData, interest: 'production'})}
                                        className={`p-3 rounded-md border ${formData.interest === 'production' ? 'bg-yellow-500 border-yellow-400 text-white' : 'bg-yellow-700 border-yellow-600 text-yellow-100'}`}
                                    >
                                        {t('Production')}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setFormData({...formData, interest: 'marketing'})}
                                        className={`p-3 rounded-md border ${formData.interest === 'marketing' ? 'bg-yellow-500 border-yellow-400 text-white' : 'bg-yellow-700 border-yellow-600 text-yellow-100'}`}
                                    >
                                        {t('Marketing')}
                                    </button>
                                </div>
                            </div>

                            <div className="mb-4">
                                <label className="block text-yellow-100 mb-2 font-medium">{t('Subject')}</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <FileText className="h-5 w-5 text-yellow-300" />
                                    </div>
                                    <input
                                        type="text"
                                        name="subject"
                                        value={formData.subject}
                                        onChange={handleChange}
                                        placeholder={formData.interest === 'production' ? t('e.g. Smart irrigation inquiry') : t('e.g. Market access questions')}
                                        className='w-full p-3 pl-10 bg-yellow-700 border border-yellow-600 rounded-md text-white placeholder-yellow-200 focus:outline-none focus:ring-2 focus:ring-yellow-500'
                                    />
                                </div>
                                {errors.subject && <p className="text-yellow-300 text-sm mt-1">{errors.subject}</p>}
                            </div>

                            <div className="mb-5">
                                <label className="block text-yellow-100 mb-2 font-medium">{t('Your Message')}</label>
                                <div className="relative">
                                    <div className="absolute top-3 left-3 flex items-start pointer-events-none">
                                        <MessageSquare className="h-5 w-5 text-yellow-300" />
                                    </div>
                                    <textarea
                                        rows={5}
                                        name="description"
                                        value={formData.description}
                                        onChange={handleChange}
                                        placeholder={
                                            formData.interest === 'production' 
                                            ? t('Tell us about your sunflower production needs, challenges, and goals...') 
                                            : t('Tell us about your marketing needs, target markets, and volume requirements...')
                                        }
                                        className='w-full p-3 pl-10 bg-yellow-700 border border-yellow-600 rounded-md text-white placeholder-yellow-200 focus:outline-none focus:ring-2 focus:ring-yellow-500'
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className='w-full p-3 bg-yellow-600 text-white rounded-md hover:bg-yellow-500 transition duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 disabled:opacity-50 flex items-center justify-center gap-2'
                            >
                                {loading ? (
                                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                ) : (
                                    <>
                                        <Send className="h-5 w-5" />
                                        {t('Get Sunflower Solutions')}
                                    </>
                                )}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Contact;