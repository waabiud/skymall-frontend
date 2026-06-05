import React from 'react';
import { Link } from 'react-router-dom';
import Logo from '../common/Logo';
import { FiMail, FiPhone, FiMapPin, FiFacebook, FiTwitter, FiInstagram } from 'react-icons/fi';

const Footer = () => {
  return (
    <footer className="bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">

          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-white font-heading font-bold text-sm">S</span>
              </div>
              <span className="font-heading font-bold text-xl dark:text-white">
                Sky<span className="text-primary">Mall</span>
              </span>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Smart Shopping Starts Here. Kenya's premier online marketplace.
            </p>
            <div className="flex items-center gap-3">
              <a href="#" className="p-2 rounded-lg bg-gray-200 dark:bg-gray-800 hover:bg-primary
                                     hover:text-white transition">
                <FiFacebook size={16} />
              </a>
              <a href="#" className="p-2 rounded-lg bg-gray-200 dark:bg-gray-800 hover:bg-primary
                                     hover:text-white transition">
                <FiTwitter size={16} />
              </a>
              <a href="#" className="p-2 rounded-lg bg-gray-200 dark:bg-gray-800 hover:bg-primary
                                     hover:text-white transition">
                <FiInstagram size={16} />
              </a>
            </div>
          </div>

          {/* Quick links */}
          <div>
            <h3 className="font-heading font-semibold mb-4 dark:text-white">Quick Links</h3>
            <ul className="space-y-2 text-sm text-gray-500 dark:text-gray-400">
              {[
                { label: 'Home',    to: '/' },
                { label: 'Shop',    to: '/shop' },
                { label: 'Orders',  to: '/orders' },
                { label: 'Wishlist',to: '/wishlist' },
              ].map((l) => (
                <li key={l.to}>
                  <Link to={l.to} className="hover:text-primary transition">{l.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Seller */}
          <div>
            <h3 className="font-heading font-semibold mb-4 dark:text-white">Sell on SkyMall</h3>
            <ul className="space-y-2 text-sm text-gray-500 dark:text-gray-400">
              {[
                { label: 'Become a Vendor', to: '/vendor/register' },
                { label: 'Vendor Dashboard',to: '/vendor' },
                { label: 'Seller Policy',   to: '/seller-policy' },
              ].map((l) => (
                <li key={l.to}>
                  <Link to={l.to} className="hover:text-primary transition">{l.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-heading font-semibold mb-4 dark:text-white">Contact</h3>
            <ul className="space-y-3 text-sm text-gray-500 dark:text-gray-400">
              <li className="flex items-center gap-2">
                <FiMail size={14} className="text-primary" />
                support@skymall.co.ke
              </li>
              <li className="flex items-center gap-2">
                <FiPhone size={14} className="text-primary" />
                +254 700 000 000
              </li>
              <li className="flex items-center gap-2">
                <FiMapPin size={14} className="text-primary" />
                Nairobi, Kenya
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-gray-200 dark:border-gray-800
                        flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-gray-400">
            © {new Date().getFullYear()} SkyMall. All rights reserved.
          </p>
          <div className="flex items-center gap-4 text-xs text-gray-400">
            <Link to="/privacy-policy" className="hover:text-primary transition">Privacy Policy</Link>
            <Link to="/terms"          className="hover:text-primary transition">Terms of Service</Link>
            <Link to="/faqs"           className="hover:text-primary transition">FAQs</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
