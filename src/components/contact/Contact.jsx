/* eslint-disable no-unused-vars */
/* eslint-disable react/no-unescaped-entities */
import React, { useState } from 'react';
import axios from 'axios';
import { Send, Mail, User, FileText, MessageSquare } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const Contact = () => {
    const { t } = useTranslation();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        names: '',
        email: '',
        subject: '',
        description: ''
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
            if (!value.endsWith('@gmail.com')) {
                error = t('contact.errors.gmailOnly');
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
        const hasEmptyFields = Object.values(formData).some((field) => !field.trim());
        
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
                    description: ''
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
        <section className='bg-white py-16' id="contact">
            <div className="container mx-auto px-4">
                <div className="text-center mb-12">
                    <h2 className='text-3xl font-bold text-green-900 mb-4'>
                        {t('Contact Us')}
                    </h2>
                    {/* <p className="text-gray-300 max-w-2xl mx-auto">
                        {t('contact.subtitle')}
                    </p> */}
                </div>
                
                <div className='max-w-2xl mx-auto'>
                    <div className="bg-green-950 rounded-lg shadow-xl overflow-hidden">
                        <div className="p-6 bg-green-700 text-white">
                            <h3 className="text-xl font-semibold">{t('Get In Touch With Us')}</h3>
                            <p className="text-gray-100 mt-1">{t('Send us message')}</p>
                        </div>
                        
                        <form className='p-6' onSubmit={handleSubmit}>
                            {message && (
                                <div className={`mb-5 p-3 rounded ${message.includes('success') ? 'bg-green-800 text-green-100' : 'bg-yellow-800 text-yellow-100'}`}>
                                    {message}
                                </div>
                            )}
                            
                            <div className="mb-4">
                                <label className="block text-gray-300 mb-2 font-medium">{t('contact.labels.name')}</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <User className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input
                                        type="text"
                                        name="names"
                                        value={formData.names}
                                        onChange={handleChange}
                                        placeholder={t('contact.placeholders.name')}
                                        className='w-full p-3 pl-10 bg-green-800 border border-green-700 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-600'
                                    />
                                </div>
                                {errors.names && <p className="text-yellow-400 text-sm mt-1">{errors.names}</p>}
                            </div>

                            <div className="mb-4">
                                <label className="block text-gray-300 mb-2 font-medium">{t('contact.labels.email')}</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Mail className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        placeholder={t('contact.placeholders.email')}
                                        className='w-full p-3 pl-10 bg-green-800 border border-green-700 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-600'
                                    />
                                </div>
                                {errors.email && <p className="text-yellow-400 text-sm mt-1">{errors.email}</p>}
                            </div>

                            <div className="mb-4">
                                <label className="block text-gray-300 mb-2 font-medium">{t('contact.labels.subject')}</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <FileText className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input
                                        type="text"
                                        name="subject"
                                        value={formData.subject}
                                        onChange={handleChange}
                                        placeholder={t('contact.placeholders.subject')}
                                        className='w-full p-3 pl-10 bg-green-800 border border-green-700 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-600'
                                    />
                                </div>
                                {errors.subject && <p className="text-yellow-400 text-sm mt-1">{errors.subject}</p>}
                            </div>

                            <div className="mb-5">
                                <label className="block text-gray-300 mb-2 font-medium">{t('contact.labels.message')}</label>
                                <div className="relative">
                                    <div className="absolute top-3 left-3 flex items-start pointer-events-none">
                                        <MessageSquare className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <textarea
                                        rows={4}
                                        name="description"
                                        value={formData.description}
                                        onChange={handleChange}
                                        placeholder={t('contact.placeholders.message')}
                                        className='w-full p-3 pl-10 bg-green-800 border border-green-700 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-600'
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className='w-full p-3 bg-green-600 text-white rounded-md hover:bg-green-700 transition duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 flex items-center justify-center gap-2'
                            >
                                {loading ? (
                                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                ) : (
                                    <>
                                        <Send className="h-5 w-5" />
                                        {t('contact.sendButton')}
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