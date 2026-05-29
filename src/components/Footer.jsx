import { useState } from 'react';

export default function Footer() {
  const [status, setStatus] = useState('idle');
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setStatus('sending');
    // Simulate send (no Supabase)
    setTimeout(() => {
      setStatus('sent');
      setForm({ name: '', email: '', subject: '', message: '' });
      setTimeout(() => setStatus('idle'), 3000);
    }, 1200);
  };

  return (
    <footer className="footer" id="contact">
      <h2 className="footer__heading">Let's Talk.</h2>

      <form className="contact-form" onSubmit={handleSubmit}>
        <div className="contact-form__group">
          <input
            className="contact-form__input"
            type="text" name="name" placeholder="Name"
            value={form.name} onChange={handleChange} required
          />
        </div>
        <div className="contact-form__group">
          <input
            className="contact-form__input"
            type="email" name="email" placeholder="Email"
            value={form.email} onChange={handleChange} required
          />
        </div>
        <div className="contact-form__group contact-form__group--full">
          <input
            className="contact-form__input"
            type="text" name="subject" placeholder="Subject"
            value={form.subject} onChange={handleChange}
          />
        </div>
        <div className="contact-form__group contact-form__group--full">
          <textarea
            className="contact-form__textarea"
            name="message" placeholder="Message"
            value={form.message} onChange={handleChange} required
          />
        </div>
        <div className="contact-form__submit">
          <button type="submit" className="pill-btn pill-btn--cta-inverted" disabled={status === 'sending'}>
            {status === 'idle' && <>Send Message <span>↗</span></>}
            {status === 'sending' && 'Sending...'}
            {status === 'sent' && 'Sent ✓'}
          </button>
        </div>
      </form>

      <div className="footer__info">
        <span>+91 84528 73370</span>
        <a href="mailto:antonyroyce2@gmail.com">antonyroyce2@gmail.com</a>
        <a href="https://github.com/royceantony9" target="_blank" rel="noopener noreferrer">github.com/royceantony9</a>
        <a href="https://linkedin.com/in/royce-antony" target="_blank" rel="noopener noreferrer">linkedin.com/in/royce-antony</a>
        <p className="footer__copyright">© 2025 Royce Antony · Built with Three.js + React</p>
      </div>
    </footer>
  );
}
