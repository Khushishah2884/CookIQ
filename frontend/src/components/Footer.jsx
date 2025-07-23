import React from 'react';
import './Footer.css';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    product: [
      { name: 'Recipe Generator', href: '#' },
      { name: 'Ingredient Predictor', href: '#' },
      { name: 'AI Chatbot', href: '#' },
      { name: 'Mobile App', href: '#' }
    ],
    company: [
      { name: 'About Us', href: '#' },
      { name: 'Careers', href: '#' },
      { name: 'Blog', href: '#' },
      { name: 'Press', href: '#' }
    ],
    support: [
      { name: 'Help Center', href: '#' },
      { name: 'Contact Us', href: '#' },
      { name: 'API Documentation', href: '#' },
      { name: 'Status', href: '#' }
    ],
    legal: [
      { name: 'Privacy Policy', href: '#' },
      { name: 'Terms of Service', href: '#' },
      { name: 'Cookie Policy', href: '#' },
      { name: 'GDPR', href: '#' }
    ]
  };

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-content">
          <div className="footer-brand">
            <div className="footer-logo">
              <span className="logo-icon">👨‍🍳</span>
              <span className="logo-text">CookIQ</span>
            </div>
            <p className="footer-description">
              Smart cooking with AI-powered recipe generation and ingredient prediction. 
              Making cooking easier, smarter, and more delicious.
            </p>
            <div className="social-links">
              <a href="#" className="social-link" aria-label="Facebook">📘</a>
              <a href="#" className="social-link" aria-label="Twitter">🐦</a>
              <a href="#" className="social-link" aria-label="Instagram">📷</a>
              <a href="#" className="social-link" aria-label="YouTube">📺</a>
            </div>
          </div>

          <div className="footer-links">
            <div className="link-group">
              <h3 className="link-group-title">Product</h3>
              <ul className="link-list">
                {footerLinks.product.map((link, index) => (
                  <li key={index}>
                    <a href={link.href} className="footer-link">{link.name}</a>
                  </li>
                ))}
              </ul>
            </div>

            <div className="link-group">
              <h3 className="link-group-title">Company</h3>
              <ul className="link-list">
                {footerLinks.company.map((link, index) => (
                  <li key={index}>
                    <a href={link.href} className="footer-link">{link.name}</a>
                  </li>
                ))}
              </ul>
            </div>

            <div className="link-group">
              <h3 className="link-group-title">Support</h3>
              <ul className="link-list">
                {footerLinks.support.map((link, index) => (
                  <li key={index}>
                    <a href={link.href} className="footer-link">{link.name}</a>
                  </li>
                ))}
              </ul>
            </div>

            <div className="link-group">
              <h3 className="link-group-title">Legal</h3>
              <ul className="link-list">
                {footerLinks.legal.map((link, index) => (
                  <li key={index}>
                    <a href={link.href} className="footer-link">{link.name}</a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <div className="footer-bottom-content">
            <p className="copyright">
              © {currentYear} CookIQ. All rights reserved.
            </p>
            <div className="footer-bottom-links">
              <span className="footer-stats">
                🍳 10K+ Recipes • 👥 50K+ Users • 🌟 95% Accuracy
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;