import React from 'react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const footerLinks = [
    { name: 'Privacy Policy', href: '#' },
    { name: 'Terms of Service', href: '#' },
    { name: 'Culinary APIs', href: '#' },
    { name: 'Support', href: '#' }
  ];

  return (
    <footer className="w-full py-stack-lg px-gutter flex flex-col md:flex-row justify-between items-center gap-stack-md max-w-container-max mx-auto bg-surface-container-highest mt-auto">
      <div className="flex items-center gap-2">
        <span className="material-symbols-outlined text-on-surface" style={{ fontVariationSettings: "'FILL' 1" }}>
          restaurant
        </span>
        <span className="font-headline-sm text-headline-sm font-bold text-on-surface">CookIQ</span>
      </div>
      <p className="font-body-md text-body-md text-on-surface-variant text-center md:text-left">
        © {currentYear} CookIQ. Precision in every plate.
      </p>
      <nav className="flex flex-wrap justify-center gap-x-6 gap-y-2">
        {footerLinks.map((link, index) => (
          <a
            key={index}
            className="font-label-sm text-label-sm text-on-surface-variant hover:text-on-surface hover:underline decoration-primary underline-offset-4 transition-opacity duration-200"
            href={link.href}
          >
            {link.name}
          </a>
        ))}
      </nav>
    </footer>
  );
};

export default Footer;
