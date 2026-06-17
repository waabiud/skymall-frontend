import React from 'react';
import { Link } from 'react-router-dom';
import { FiArrowLeft } from 'react-icons/fi';

const TermsPage = () => {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <Link to="/"
        className="flex items-center gap-2 text-primary hover:underline mb-8 text-sm">
        <FiArrowLeft size={16} /> Back to Home
      </Link>
      <h1 className="font-heading text-3xl font-bold dark:text-white mb-2">
        Terms of Service
      </h1>
      <p className="text-gray-500 dark:text-gray-400 text-sm mb-8">
        Last updated: June 16, 2026
      </p>
      <div className="space-y-8 text-gray-600 dark:text-gray-400">
        <section>
          <h2 className="font-heading text-xl font-bold dark:text-white mb-3">
            1. Acceptance of Terms
          </h2>
          <p className="leading-relaxed">
            By using SkyMall you agree to these Terms of Service.
            If you do not agree, please do not use our platform.
          </p>
        </section>
        <section>
          <h2 className="font-heading text-xl font-bold dark:text-white mb-3">
            2. Use of Service
          </h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>You must be at least 18 years old</li>
            <li>You must provide accurate information</li>
            <li>You are responsible for account security</li>
            <li>You must not use the platform for illegal activities</li>
          </ul>
        </section>
        <section>
          <h2 className="font-heading text-xl font-bold dark:text-white mb-3">
            3. Payments
          </h2>
          <p className="leading-relaxed">
            All payments are processed via M-Pesa. Payments are non-refundable
            unless the product is not delivered or significantly differs from
            its description.
          </p>
        </section>
        <section>
          <h2 className="font-heading text-xl font-bold dark:text-white mb-3">
            4. Returns & Refunds
          </h2>
          <p className="leading-relaxed">
            Returns accepted within 7 days of delivery for defective items.
            Contact support@skymall.co.ke to initiate a return.
          </p>
        </section>
        <section>
          <h2 className="font-heading text-xl font-bold dark:text-white mb-3">
            5. Contact
          </h2>
          <p>Email: support@skymall.co.ke</p>
        </section>
      </div>
    </div>
  );
};

export default TermsPage;
