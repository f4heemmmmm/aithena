"use client";

import { Inter, DM_Sans } from "next/font/google";
import React, { useState, useCallback } from "react";
import { MapPin, Mail, Clock, Send, CheckCircle, AlertCircle, Phone, Globe, Linkedin } from "lucide-react";

const inter = Inter({ 
    subsets: ["latin"],
    weight: ["300", "400", "500", "600", "700"]
});

const dmSans = DM_Sans({ 
    subsets: ["latin"],
    weight: ["400", "500", "600", "700"]
});

interface ContactForm {
    first_name: string;
    last_name: string;
    email: string;
    message: string;
}

interface FormErrors {
    first_name?: string;
    last_name?: string;
    email?: string;
    message?: string;
}

interface SubmissionState {
    isSubmitting: boolean;
    isSuccess: boolean;
    error: string | null;
}

interface APIErrorResponse {
    message: string | string[];
    status_code?: number;
    error?: string;
}

interface APISuccessResponse {
    success: boolean;
    message: string;
}

const ContactPage: React.FC = () => {
    const [errors, setErrors] = useState<FormErrors>({});
    const [form, setForm] = useState<ContactForm>({ first_name: "", last_name: "", email: "", message: "" });
    const [submission, setSubmission] = useState<SubmissionState>({ isSubmitting: false, isSuccess: false, error: null });

    const validateEmail = (email: string): boolean => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const validateForm = useCallback((): FormErrors => {
        const newErrors: FormErrors = {};

        if (!form.first_name.trim()) {
            newErrors.first_name = "Your first name is required";
        }
        if (!form.last_name.trim()) {
            newErrors.last_name = "Your last name is required";
        }
        if (!form.first_name.trim()) {
            newErrors.email = "Your emal address is required";
        } else if (!validateEmail(form.email)) {
            newErrors.email = "Please enter a valid email address";
        }
        if (!form.message.trim()) {
            newErrors.message = "A message is required";
        } else if (form.message.trim().length < 10) {
            newErrors.message = "Your message must be at least 10 characters long";
        }
        return newErrors;
    }, [form]);

    const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>): void => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));

        if (errors[name as keyof FormErrors]) {
            setErrors(prev => ({ ...prev, [name]: undefined }));
        }
    }, [errors]);

    const sendEmail = async (formData: ContactForm): Promise<APISuccessResponse> => {
        const API_BASE_URL: string = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
        const endpoint: string = `${API_BASE_URL}/api/contact`;
        
        try {
            const healthResponse = await fetch(`${API_BASE_URL}/api/contact/health`, {
                method: "GET",
                headers: {
                    "Accept": "application/json",
                },
            });   
            
            if (!healthResponse.ok) {
                throw new Error("Cannot connect to backend server. Please ensure it is running on port 3000");
            }
        } catch (healthError) {
            throw new Error("Cannot connect to backend server. Please ensure it is running on port 3000");
        }

        try {
            const response: Response = await fetch(endpoint, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Accept": "application/json",
                },
                body: JSON.stringify({
                    first_name: formData.first_name,
                    last_name: formData.last_name,
                    email: formData.email,
                    message: formData.message,
                }),
            });

            if (!response.ok) {
                let errorMessage: string = "Failed to send message. Please try again.";

                try {
                    const errorData: APIErrorResponse = await response.json();

                    if (response.status === 400 && errorData.message) {
                        if (Array.isArray(errorData.message)) {
                            errorMessage = errorData.message.join(", ");
                        } else {
                            errorMessage = errorData.message;
                        }
                    } else if (response.status === 429) {
                        errorMessage = "Too many requests. Please wait a moment before trying again.";
                    } else if (response.status >= 500) {
                        errorMessage = "Server error. Please try again later.";
                    }   
                } catch (parseError: unknown) {
                    errorMessage = "An unexpected error occured. Please try again.";
                }
                throw new Error(errorMessage);
            }
            const result: APISuccessResponse = await response.json();
            return result;
        } catch (networkError: unknown) {
            if (networkError instanceof Error) {
                if (networkError.message.includes("fetch") || networkError.name === "TypeError") {
                    throw new Error("Unable to connect to server. Please check if the backend is running on port 3000.");
                }
                throw networkError;
            } else {
                throw new Error("An unexpected network error occurred.");
            }
        }
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
        e.preventDefault();
        const formErrors: FormErrors = validateForm();
        setErrors(formErrors);

        if (Object.keys(formErrors).length > 0) {
            return;
        }

        setSubmission({
            isSubmitting: true,
            isSuccess: false,
            error: null
        });

        try {
            const result: APISuccessResponse = await sendEmail(form);

            setSubmission({
                isSubmitting: false,
                isSuccess: true,
                error: null
            });

            setForm({
                first_name: "",
                last_name: "", 
                email: "", 
                message: ""
            });

            setTimeout(() => {
                setSubmission(prev => ({ ...prev, isSuccess: false }));
            }, 8000);
        } catch (error: unknown) {
            const errorMessage: string = error instanceof Error 
                ? error.message 
                : "Failed to send message. Please try again.";
            
            setSubmission({
                isSubmitting: false,
                isSuccess: false,
                error: errorMessage
            });
        }
    };

    return (
        <div className = "min-h-screen bg-gray-50">
            <div className = "bg-white border-b border-gray-100">
                <div className = "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <div className = "grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 md:justify-items-center">
                        <div className = "text-center md:text-left flex flex-col w-full">
                            <h3 className = {`${dmSans.className} text-3xl font-light text-gray-900 mb-6`}> Address </h3>
                            <div className = {`${inter.className} text-gray-600 space-y-1 text-sm`}>
                                <p> 160 Robinson Road </p>
                                <p> #14-04 </p>
                                <p> Singapore Business Federation Center </p>
                            </div>
                        </div>

                        <div className = "text-center md:text-left flex flex-col w-full">
                            <h3 className = {`${dmSans.className} text-3xl font-light text-gray-900 mb-6`}> Contact </h3>
                            <div className = "space-y-3">
                                <a 
                                    href = "mailto:hello@althena.sg" 
                                    className = {`${inter.className} block text-gray-600 hover:text-blue-600 transition-colors text-sm`}
                                >
                                    hello@aithena.sg
                                </a>
                                <a 
                                    href = "https://linkedin.com/company/althena"
                                    className = {`${inter.className} inline-flex items-center text-gray-600 hover:text-blue-600 transition-colors text-sm justify-center md:justify-start`}
                                    target = "_blank"
                                    rel = "noopener noreferrer"
                                >
                                    <div className = "w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center mr-2">
                                        <Linkedin className = "w-4 h-4 text-gray-700" />
                                    </div>
                                </a>
                            </div>
                        </div>
                        <div className = "text-center md:text-left flex flex-col w-full">
                            <h3 className = {`${dmSans.className} text-3xl font-light text-gray-900 mb-6`}> Opening Hours </h3>
                            <div className = {`${inter.className} text-gray-600 space-y-2 text-sm`}>
                                <div className = "flex justify-between">
                                    <span> Monday - Friday </span>
                                    <span> 8:00 am – 8:00 pm </span>
                                </div>
                                <div className = "flex justify-between">
                                    <span> Saturday </span>
                                    <span> 9:00 am – 7:00 pm </span>
                                </div>
                                <div className = "flex justify-between">
                                    <span> Sunday </span>
                                    <span> 9:00 am – 9:00 pm </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className = "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className = "grid grid-cols-1 lg:grid-cols-2 gap-12">
                    <div>
                        <div className = "bg-white rounded-lg shadow-sm border border-gray-100 p-8">
                            <div className = "mb-8">
                                <h2 className = {`${dmSans.className} text-3xl font-thin text-gray-900 mb-3`}> Feel free to send us a message! </h2>
                                <p className = {`${inter.className} text-gray-600 text-sm`}>
                                    Fill out the form below and we'll get back to you soon.
                                </p>
                            </div>

                            {submission.isSuccess && (
                                <div className = "mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start space-x-3">
                                    <CheckCircle className = "w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                                    <div>
                                        <h4 className = {`${dmSans.className} font-medium text-green-800 mb-1`}> Message Sent Successfully! </h4>
                                        <p className = {`${inter.className} text-green-700 text-sm`}>
                                            Thank you for reaching out. We'll get back to you soon!
                                        </p>
                                    </div>
                                </div>
                            )}

                            {submission.error && (
                                <div className = "mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-3">
                                    <AlertCircle className = "w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                                    <div>
                                        <h4 className = {`${dmSans.className} font-medium text-red-800 mb-1`}> Error Sending Message </h4>
                                        <p className = {`${inter.className} text-red-700 text-sm`}> {submission.error} </p>
                                    </div>
                                </div>
                            )}

                            <form onSubmit = {handleSubmit} className = "space-y-6">
                                <div className = "grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label htmlFor = "first_name" className = {`${inter.className} block text-sm font-medium text-gray-700 mb-3`}>
                                            First Name
                                        </label>
                                        <input
                                            type = "text"
                                            id = "first_name"
                                            name = "first_name"
                                            value = {form.first_name}
                                            onChange = {handleInputChange}
                                            className = {`${inter.className} w-full px-0 py-3 border-0 border-b border-gray-300 focus:border-blue-500 focus:ring-0 focus:outline-none transition-colors bg-transparent text-gray-600 placeholder-gray-400 ${
                                                errors.first_name ? "border-red-500" : ""
                                            }`}
                                            disabled = {submission.isSubmitting}
                                            required
                                        />
                                        {errors.first_name && (
                                            <p className = {`${inter.className} mt-2 text-sm text-red-600`}> {errors.first_name} </p>
                                        )}
                                    </div>
                                    <div>
                                        <label htmlFor = "last_name" className = {`${inter.className} block text-sm font-medium text-gray-700 mb-3`}>
                                            Last Name
                                        </label>
                                        <input
                                            type = "text"
                                            id = "last_name"
                                            name = "last_name"
                                            value = {form.last_name}
                                            onChange = {handleInputChange}
                                            className = {`${inter.className} w-full px-0 py-3 border-0 border-b border-gray-300 focus:border-blue-500 focus:ring-0 focus:outline-none transition-colors bg-transparent text-gray-600 placeholder-gray-400 ${
                                                errors.last_name ? "border-red-500" : ""
                                            }`}
                                            disabled = {submission.isSubmitting}
                                            required
                                        />
                                        {errors.last_name && (
                                            <p className = {`${inter.className} mt-2 text-sm text-red-600`}> {errors.last_name} </p>
                                        )}
                                    </div>
                                </div>

                                <div>
                                    <label htmlFor = "email" className = {`${inter.className} block text-sm font-medium text-gray-700 mb-3`}>
                                        Email
                                    </label>
                                    <input
                                        type = "email"
                                        id = "email"
                                        name = "email"
                                        value = {form.email}
                                        onChange = {handleInputChange}
                                        className = {`${inter.className} w-full px-0 py-3 border-0 border-b border-gray-300 focus:border-blue-500 focus:ring-0 focus:outline-none transition-colors bg-transparent text-gray-600 placeholder-gray-400 ${
                                            errors.email ? "border-red-500" : ""
                                        }`}
                                        disabled = {submission.isSubmitting}
                                        required
                                    />
                                    {errors.email && (
                                        <p className = {`${inter.className} mt-2 text-sm text-red-600`}> {errors.email} </p>
                                    )}
                                </div>

                                <div>
                                    <label htmlFor = "message" className = {`${inter.className} block text-sm font-medium text-gray-700 mb-3`}>
                                        Your Message
                                    </label>
                                    <textarea
                                        id = "message"
                                        name = "message"
                                        rows = {5}
                                        value = {form.message}
                                        onChange = {handleInputChange}
                                        className = {`${inter.className} resize-none w-full px-0 py-3 border-0 border-b border-gray-300 focus:border-blue-500 focus:ring-0 focus:outline-none transition-colors bg-transparent text-gray-600 placeholder-gray-400 ${
                                            errors.message ? "border-red-500" : ""
                                        }`}
                                        disabled = {submission.isSubmitting}
                                        required
                                        minLength = {10}
                                    />
                                    {errors.message && (
                                        <p className = {`${inter.className} mt-2 text-sm text-red-600`}> {errors.message} </p>
                                    )}
                                </div>

                                <div className = "pt-6">
                                    <button 
                                        type = "submit"
                                        disabled = {submission.isSubmitting}
                                        className = {`${inter.className} w-full bg-gray-900 hover:bg-gray-800 text-white py-3 px-6 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2`}
                                    >
                                        {submission.isSubmitting ? (
                                            <>
                                                <div className = "w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                                <span> Sending... </span>
                                            </>
                                        ) : (
                                            <>
                                                <Send className = "w-4 h-4" />
                                                <span> Send Message </span>
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                    
                    {/* GOOGLE MAPS */}
                    <div>
                        <div className = "overflow-hidden">
                            <div className = "text-left border-b border-gray-100">
                                <h2 className = {`${dmSans.className} text-6xl text-left font-light text-gray-900 mb-5`}> Find Us! </h2>
                            </div>
                            <div className = "h-[550px] bg-white rounded-lg shadow-sm border border-gray-100 p-4">
                                <iframe
                                    src = "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3988.8193!2d103.84!3d1.278!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31da1911e0f4b5a5%3A0x4d2562ff9a6ab5d5!2s160%20Robinson%20Rd%2C%20Singapore!5e0!3m2!1sen!2ssg!4v1735862400000!5m2!1sen!2ssg"
                                    width = "100%"
                                    height = "100%"
                                    style = {{ border: 0 }}
                                    allowFullScreen
                                    loading = "lazy"
                                    referrerPolicy = "no-referrer-when-downgrade"
                                    title = "AITHENA's Office Location"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ContactPage;