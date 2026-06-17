import React from 'react';
import { Link } from 'react-router-dom';
import { FiArrowLeft } from 'react-icons/fi';

const PrivacyPolicyPage = () => {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <Link to="/"
        className="flex items-center gap-2 text-primary hover:underline mb-8 text-sm">
        <FiArrowLeft size={16} /> Back to Home
      </Link>
      <h1 className="font-heading text-3xl font-bold dark:text-white mb-2">
        Privacy Policy
      </h1>
      <p className="text-gray-500 dark:text-gray-400 text-sm mb-8">
        Last updated: June 16, 2026
      </p>
      <div className="space-y-8 text-gray-600 dark:text-gray-400">
        <section>
          <h2 className="font-heading text-xl font-bold dark:text-white mb-3">
            1. Introduction
          </h2>
          <p className="leading-relaxed">
            Welcome to SkyMall. This Privacy Policy explains how we collect,
            use, and protect your information when you use our service at
            https://waabiud.github.io/skymall-frontend.
          </p>
        </section>
        <section>
          <h2 className="font-heading text-xl font-bold dark:text-white mb-3">
            2. Information We Collect
          </h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>Name, email address, and phone number when you register</li>
            <li>Delivery address when you place an order</li>
            <li>M-Pesa transaction details for payments</li>
            <li>Profile information and preferences</li>
          </ul>
        </section>
        <section>
          <h2 className="font-heading text-xl font-bold dark:text-white mb-3">
            3. How We Use Your Information
          </h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>To process and fulfill your orders</li>
            <li>To send order confirmations and updates</li>
            <li>To verify your identity via OTP</li>
            <li>To improve our services</li>
            <li>To prevent fraud and ensure security</li>
          </ul>
        </section>
        <section>
          <h2 className="font-heading text-xl font-bold dark:text-white mb-3">
            4. Google AdSense & Cookies
          </h2>
          <p className="leading-relaxed">
            We use Google AdSense to display advertisements. Google AdSense
            uses cookies to serve relevant ads. You may opt out at
            <a href="https://www.google.com/settings/ads"
              className="text-primary hover:underline ml-1" target="_blank"
              rel="noreferrer">Google Ads Settings</a>.
          </p>
        </section>
        <section>
          <h2 className="font-heading text-xl font-bold dark:text-white mb-3">
            5. Data Security
          </h2>
          <p className="leading-relaxed">
            We implement appropriate security measures including encrypted
            passwords and JWT authentication to protect your data.
          </p>
        </section>
        <section>
          <h2 className="font-heading text-xl font-bold dark:text-white mb-3">
            6. Contact Us
          </h2>
          <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4">
            <p className="font-medium dark:text-white">SkyMall Kenya</p>
            <p>Email: support@skymall.co.ke</p>
            <p>Phone: +254 700 000 000</p>
            <p>Location: Nairobi, Kenya</p>
          </div>
        </section>
      </div>
    </div>
  );
};

export default PrivacyPolicyPage;
