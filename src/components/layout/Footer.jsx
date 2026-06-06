import React from 'react';
import { Link } from 'react-router-dom';
import {
  FiMail, FiPhone, FiMapPin,
  FiFacebook, FiTwitter, FiInstagram, FiYoutube
} from 'react-icons/fi';
import Logo from '../common/Logo';

const Footer = () => {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-gray-50 dark:bg-gray-900 border-t border-gray-200
                       dark:border-gray-800 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">

          {/* Brand */}
          <div className="space-y-4">
            <Logo size="md" />
            <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
              Smart Shopping Starts Here. Kenya's premier online marketplace
              connecting buyers and verified vendors.
            </p>
            <div className="flex items-center gap-2">
              {[
                { icon: FiFacebook,  label: 'Facebook' },
                { icon: FiTwitter,   label: 'Twitter' },
                { icon: FiInstagram, label: 'Instagram' },
                { icon: FiYoutube,   label: 'YouTube' },
              ].map(({ icon: Icon, label }) => (
                <button key={label} aria-label={label}
                  className="w-8 h-8 rounded-lg bg-gray-200 dark:bg-gray-800 flex items-center
                             justify-center hover:bg-primary hover:text-white
                             dark:text-gray-400 transition text-gray-600">
                  <Icon size={15} />
                </button>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-heading font-semibold mb-4 dark:text-white text-sm
                           uppercase tracking-wide">
              Quick Links
            </h3>
            <ul className="space-y-2.5">
              {[
                { label: 'Home',       to: '/' },
                { label: 'Shop',       to: '/shop' },
                { label: 'My Orders',  to: '/orders' },
                { label: 'Wishlist',   to: '/wishlist' },
                { label: 'My Profile', to: '/profile' },
              ].map((l) => (
                <li key={l.to}>
                  <Link to={l.to}
                    className="text-sm text-gray-500 dark:text-gray-400 hover:text-primary
                               dark:hover:text-primary transition">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Sell */}
          <div>
            <h3 className="font-heading font-semibold mb-4 dark:text-white text-sm
                           uppercase tracking-wide">
              Sell on SkyMall
            </h3>
            <ul className="space-y-2.5">
              {[
                { label: 'Become a Vendor',  to: '/register' },
                { label: 'Vendor Dashboard', to: '/vendor' },
                { label: 'About Us',         to: '/about' },
                { label: 'FAQs',             to: '/faqs' },
                { label: 'Privacy Policy',   to: '/privacy-policy' },
              ].map((l) => (
                <li key={l.to}>
                  <Link to={l.to}
                    className="text-sm text-gray-500 dark:text-gray-400 hover:text-primary
                               dark:hover:text-primary transition">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-heading font-semibold mb-4 dark:text-white text-sm
                           uppercase tracking-wide">
              Contact Us
            </h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <FiMail size={15} className="text-primary mt-0.5 flex-shrink-0" />
                <a href="mailto:support@skymall.co.ke"
                  className="text-sm text-gray-500 dark:text-gray-400 hover:text-primary transition">
                  support@skymall.co.ke
                </a>
              </li>
              <li className="flex items-start gap-3">
                <FiPhone size={15} className="text-primary mt-0.5 flex-shrink-0" />
                <a href="tel:+254700000000"
                  className="text-sm text-gray-500 dark:text-gray-400 hover:text-primary transition">
                  +254 700 000 000
                </a>
              </li>
              <li className="flex items-start gap-3">
                <FiMapPin size={15} className="text-primary mt-0.5 flex-shrink-0" />
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  Nairobi, Kenya
                </span>
              </li>
            </ul>
            <div className="mt-4">
              <p className="text-xs text-gray-400 dark:text-gray-500 mb-2 uppercase tracking-wide">
                Accepted Payments
              </p>
              <div className="flex items-center gap-2">
                <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-bold
                                 rounded-lg">M-Pesa</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-gray-200 dark:border-gray-800
                        flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-xs text-gray-400 dark:text-gray-500">
            © {year} SkyMall. All rights reserved. Built with care in Kenya.
          </p>
          <div className="flex items-center gap-4">
            {[
              { label: 'Privacy Policy', to: '/privacy-policy' },
              { label: 'Terms',          to: '/terms' },
              { label: 'FAQs',           to: '/faqs' },
            ].map((l) => (
              <Link key={l.to} to={l.to}
                className="text-xs text-gray-400 dark:text-gray-500 hover:text-primary transition">
                {l.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
