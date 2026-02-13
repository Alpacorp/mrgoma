import React from 'react';

import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Website Legal Policies – MrGoma Tires',
  description:
    'Read the Terms & Conditions, Privacy Policy, Refund & Warranty Policy, Disclaimer, Accessibility Statement, and Contact Information for MrGoma Tires.',
};

export default function LegalPoliciesPage() {
  return (
    <main className="min-h-screen bg-black text-white">
      <div id="top" className="container mx-auto px-6 lg:px-8 py-12">
        <h1 className="text-3xl sm:text-4xl font-bold text-[#9dfb40]">Website Legal Policies – MrGoma Tires</h1>
        <p className="mt-2 text-sm text-gray-400">Last updated: Aug 26, 2025</p>
        <nav aria-label="On this page" className="mt-4">
          <ul className="flex flex-wrap gap-3 text-sm">
            <li><a href="#terms" className="text-[#9dfb40] hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-[#9dfb40] rounded px-1">Terms</a></li>
            <li><a href="#privacy" className="text-[#9dfb40] hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-[#9dfb40] rounded px-1">Privacy</a></li>
            <li><a href="#refund-warranty" className="text-[#9dfb40] hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-[#9dfb40] rounded px-1">Refund & Warranty</a></li>
            <li><a href="#disclaimer" className="text-[#9dfb40] hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-[#9dfb40] rounded px-1">Disclaimer</a></li>
            <li><a href="#accessibility" className="text-[#9dfb40] hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-[#9dfb40] rounded px-1">Accessibility</a></li>
            <li><a href="#contact" className="text-[#9dfb40] hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-[#9dfb40] rounded px-1">Contact</a></li>
          </ul>
        </nav>
        <div className="mt-6 mx-auto max-w-3xl space-y-12 text-gray-200 leading-relaxed">
          <section id="terms" className="scroll-mt-28">
            <h2 className="text-2xl font-semibold text-white border-b border-white/20 pb-2">Terms & Conditions</h2>
            <p className="mt-4">Welcome to the MrGoma Tires website. By accessing or using our website, you agree to be bound by these Terms & Conditions. Please read them carefully.</p>
            <ol className="mt-4 list-decimal pl-6 space-y-2 sm:space-y-3">
              <li>
                <strong>Services:</strong> Information provided on this site relates to our tire and automotive services in Florida. While we strive for accuracy, content may not reflect the latest service availability, pricing, or promotions.
              </li>
              <li>
                <strong>Warranty:</strong> All services and tires are backed by warranty as described on our site and at our physical locations.
              </li>
              <li>
                <strong>Limitation of Liability:</strong> MrGoma Tires is not responsible for damages arising from use of this website. All mechanical services should be performed by certified technicians at our shops.
              </li>
              <li>
                <strong>Intellectual Property:</strong> All logos, text, and images on this site are property of MrGoma Tires and may not be reproduced without permission.
                <p className="mt-2">MrGoma Tires® and associated logos are registered trademarks of Jomah Trading Inc. Unauthorized use is prohibited.</p>
              </li>
              <li>
                <strong>Governing Law:</strong> These Terms are governed by the laws of the State of Florida.
              </li>
              <li>
                <strong>Terms of Sale:</strong> Online orders are subject to product availability, pricing accuracy, and shipping limitations. We ship within the U.S. only. Risk of loss passes to the customer once the carrier takes possession. MrGoma Tires is not responsible for improper installation outside our facilities.
              </li>
            </ol>
            <p className="mt-6">
              <a href="#top" className="text-[#9dfb40] hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-[#9dfb40] rounded px-1">Back to top</a>
            </p>
          </section>

          <section id="privacy" className="scroll-mt-28">
            <h2 className="text-2xl font-semibold text-white border-b border-white/20 pb-2">Privacy Policy</h2>
            <p className="mt-4">MrGoma Tires values your privacy. This Privacy Policy explains how we collect, use, and protect your personal information.</p>
            <ol className="mt-4 list-decimal pl-6 space-y-2 sm:space-y-3">
              <li>
                <strong>Information We Collect:</strong> When you contact us, create an account, schedule service, or place an order, we may collect your name, phone number, email address, shipping/billing address, and payment details.
              </li>
              <li>
                <strong>How We Use Your Information:</strong> To process orders, ship products, provide services, respond to inquiries, improve our website, and send promotional offers (if you opt in).
              </li>
              <li>
                <strong>Data Protection:</strong> We use reasonable measures to protect your data from unauthorized access.
              </li>
              <li>
                <strong>Sharing of Information:</strong> We may share limited information with service providers (payment processors, shipping companies) as required to fulfill your order. We do not sell personal data.
              </li>
              <li>
                <strong>Cookies:</strong> Our website uses cookies and analytics tools (e.g., Google Analytics) to improve your browsing experience.
              </li>
              <li>
                <strong>Your Rights:</strong> You may request access, correction, or deletion of your personal data by contacting us.
              </li>
            </ol>
            <p className="mt-6">
              <a href="#top" className="text-[#9dfb40] hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-[#9dfb40] rounded px-1">Back to top</a>
            </p>
          </section>

          <section id="refund-warranty" className="scroll-mt-28">
            <h2 className="text-2xl font-semibold text-white border-b border-white/20 pb-2">Refund & Warranty Policy</h2>
            <ol className="mt-4 list-decimal pl-6 space-y-2 sm:space-y-3">
              <li>
                <strong>Tires:</strong> New and used tires are backed by our limited warranty covering manufacturer defects or service issues. Used &#39;like new&#39; tires are inspected and covered under warranty terms at purchase.
              </li>
              <li>
                <strong>Services:</strong> All auto services, including oil changes and repairs, are backed by our service warranty. Please retain your receipt for warranty claims.
              </li>
              <li>
                <strong>Returns & Refunds:</strong> For online tire purchases, customers may request a refund or exchange within 14 days of delivery if tires are unused and unmounted. Return shipping costs are the responsibility of the customer unless the return is due to our error or defective products.
              </li>
              <li>
                <strong>Exclusions:</strong> Refunds and warranty do not cover normal wear, road hazards, or misuse.
              </li>
              <li>
                <strong>Process:</strong> To request a refund, exchange, or warranty service, please contact your original service location with proof of purchase.
              </li>
            </ol>
            <p className="mt-6">
              <a href="#top" className="text-[#9dfb40] hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-[#9dfb40] rounded px-1">Back to top</a>
            </p>
          </section>

          <section id="disclaimer" className="scroll-mt-28">
            <h2 className="text-2xl font-semibold text-white border-b border-white/20 pb-2">Disclaimer</h2>
            <p className="mt-4">The information on this website is provided for general informational purposes only. It is not a substitute for professional mechanical advice. All vehicle services should be performed by certified technicians. MrGoma Tires makes no warranties about website accuracy and is not responsible for errors or omissions.</p>
            <p className="mt-6">
              <a href="#top" className="text-[#9dfb40] hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-[#9dfb40] rounded px-1">Back to top</a>
            </p>
          </section>

          <section id="accessibility" className="scroll-mt-28">
            <h2 className="text-2xl font-semibold text-white border-b border-white/20 pb-2">Accessibility Statement</h2>
            <p className="mt-4">MrGoma Tires is committed to making our website accessible to everyone, including people with disabilities. We continually improve accessibility and welcome feedback. If you encounter accessibility issues, please contact us for assistance.</p>
            <p className="mt-6">
              <a href="#top" className="text-[#9dfb40] hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-[#9dfb40] rounded px-1">Back to top</a>
            </p>
          </section>

          <section id="contact" className="scroll-mt-28">
            <h2 className="text-2xl font-semibold text-white border-b border-white/20 pb-2">Contact Information</h2>
            <div className="mt-4 space-y-1">
              <p>MrGoma Tires</p>
              <p>Serving Miami and Orlando, Florida</p>
              <p>Phone: [Insert Business Phone]</p>
              <p>Email: info@mrgomatires.com</p>
              <p>Website: www.mrgomatires.com</p>
            </div>
            <p className="mt-6">
              <a href="#top" className="text-[#9dfb40] hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-[#9dfb40] rounded px-1">Back to top</a>
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
