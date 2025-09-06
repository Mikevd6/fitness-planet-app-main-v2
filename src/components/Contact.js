import React, { useState } from 'react';
import '../styles/Contact.css';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Naam is verplicht';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'E-mailadres is verplicht';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Voer een geldig e-mailadres in';
    }

    if (!formData.subject.trim()) {
      newErrors.subject = 'Onderwerp is verplicht';
    }

    if (!formData.message.trim()) {
      newErrors.message = 'Bericht is verplicht';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      // Simuleer een API-aanroep (in een echte app zou dit naar een server gaan)
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Reset form and show success message
      setFormData({
        name: '',
        email: '',
        subject: '',
        message: ''
      });
      setSubmitSuccess(true);
      setTimeout(() => setSubmitSuccess(false), 5000); // Hide success message after 5 seconds
    } catch (error) {
      console.error('Error submitting form:', error);
      setSubmitError('Er is een fout opgetreden bij het verzenden van het formulier. Probeer het later opnieuw.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="contact-page">
      <div className="contact-content">
        <div className="section-header">
          <h1 className="section-title">Contact</h1>
          <p className="section-subtitle">Heb je vragen of feedback? Neem contact met ons op!</p>
        </div>

        {submitSuccess && (
          <div className="success-message">
            <span className="success-icon">✅</span>
            <p>Bedankt voor je bericht! We nemen zo snel mogelijk contact met je op.</p>
          </div>
        )}

        {submitError && (
          <div className="error-banner">
            <p>{submitError}</p>
            <button onClick={() => setSubmitError(null)}>Sluiten</button>
          </div>
        )}

        <form className="contact-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">Naam</label>
            <input 
              type="text" 
              id="name" 
              name="name"
              value={formData.name} 
              onChange={handleChange}
              className={errors.name ? 'error' : ''}
            />
            {errors.name && <span className="error-text">{errors.name}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="email">E-mailadres</label>
            <input 
              type="email" 
              id="email" 
              name="email"
              value={formData.email} 
              onChange={handleChange}
              className={errors.email ? 'error' : ''}
            />
            {errors.email && <span className="error-text">{errors.email}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="subject">Onderwerp</label>
            <input 
              type="text" 
              id="subject" 
              name="subject"
              value={formData.subject} 
              onChange={handleChange}
              className={errors.subject ? 'error' : ''}
            />
            {errors.subject && <span className="error-text">{errors.subject}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="message">Bericht</label>
            <textarea 
              id="message" 
              name="message"
              value={formData.message} 
              onChange={handleChange}
              rows="6"
              className={errors.message ? 'error' : ''}
            ></textarea>
            {errors.message && <span className="error-text">{errors.message}</span>}
          </div>

          <button 
            type="submit" 
            className="submit-btn"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Verzenden..." : "Verstuur Bericht"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Contact;