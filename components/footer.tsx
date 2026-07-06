import Link from "next/link";
import { Logo } from "@/components/logo";
import { NewsletterForm } from "@/components/newsletter-form";
import { siteConfig } from "@/lib/site";
import { Mail, MapPin, CheckCircle } from "lucide-react";

const socialIcons = {
  twitter: (
    <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" aria-hidden="true">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  ),
  facebook: (
    <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" aria-hidden="true">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  ),
};

const socialLinks = [
  { href: siteConfig.social.twitter, label: "X (Twitter)", icon: socialIcons.twitter },
  { href: siteConfig.social.facebook, label: "Facebook", icon: socialIcons.facebook },
];

/**
 * Inline payment-method logos. We never load these from a third-party CDN —
 * icons8 / simpleicons / brandfetch have all proven unreliable in production
 * (broken images, hotlink blocks, slow loads on the dark footer). Each logo
 * is rendered as an inline SVG so it ships with the bundle, can't 404, and
 * inherits `currentColor` where appropriate so it works on any background.
 */

type PaymentLogo = {
  name: string;
  /** Inline SVG node. Sized to fill the wrapping span. */
  svg: JSX.Element;
  /** Tailwind height class on the wrapper, e.g. "h-6". */
  h?: string;
};

const VISA_SVG = (
  <svg viewBox="0 0 80 26" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <text
      x="0"
      y="21"
      fontFamily="'Helvetica Neue', Helvetica, Arial, sans-serif"
      fontSize="26"
      fontStyle="italic"
      fontWeight="900"
      fill="#FFFFFF"
      letterSpacing="-1"
    >
      VISA
    </text>
  </svg>
);

const MASTERCARD_SVG = (
  <svg viewBox="0 0 38 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <circle cx="14" cy="12" r="8" fill="#EB001B" />
    <circle cx="24" cy="12" r="8" fill="#F79E1B" />
    <path
      d="M19 6.5a8 8 0 0 0 0 11 8 8 0 0 0 0-11z"
      fill="#FF5F00"
    />
  </svg>
);

const PAYPAL_SVG = (
  <svg viewBox="0 0 80 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <path
      d="M9.5 4h-5a1 1 0 0 0-1 .85L2 16.5a.6.6 0 0 0 .6.7h2.7a1 1 0 0 0 1-.85l.4-2.55a1 1 0 0 1 1-.85h1.95c4.05 0 6.4-1.95 7-5.85.25-1.7 0-3.05-.85-3.95C14.95 4.6 13.5 4 11.5 4H9.5zm.85 7.4c-.35 2.25-2.05 2.25-3.7 2.25h-.95l.65-4.1a.6.6 0 0 1 .6-.5h.45c1.15 0 2.25 0 2.8.65.35.4.45 1 .15 1.7z"
      fill="#FFFFFF"
    />
    <path
      d="M29 11.4h-2.7a.6.6 0 0 0-.6.5l-.15.95-.25-.35c-.65-1-2.1-1.25-3.55-1.25-3.3 0-6.15 2.5-6.7 6-.3 1.75.1 3.4 1.1 4.55.9 1.05 2.2 1.5 3.75 1.5 2.65 0 4.1-1.7 4.1-1.7l-.15.95a.6.6 0 0 0 .6.7h2.45a1 1 0 0 0 1-.85l1.45-9.3a.6.6 0 0 0-.6-.7zm-3.85 5.95c-.3 1.65-1.6 2.75-3.25 2.75-.85 0-1.5-.3-1.95-.8-.45-.55-.6-1.25-.45-2.05.3-1.65 1.6-2.8 3.25-2.8.85 0 1.5.3 1.95.85.45.55.6 1.25.45 2.05z"
      fill="#FFFFFF"
    />
    <path
      d="M42 11.4h-2.75a1 1 0 0 0-.85.45l-3.8 5.6-1.6-5.4a1 1 0 0 0-.95-.7h-2.7a.6.6 0 0 0-.6.75l3.05 8.95-2.85 4.05a.6.6 0 0 0 .5.95h2.7a1 1 0 0 0 .85-.45l9.15-13.2a.6.6 0 0 0-.55-1z"
      fill="#FFFFFF"
    />
    <path
      d="M52.5 4h-5a1 1 0 0 0-1 .85L45 16.5a.6.6 0 0 0 .6.7h2.55a.7.7 0 0 0 .7-.6l.45-2.8a1 1 0 0 1 1-.85h1.95c4.05 0 6.4-1.95 7-5.85.25-1.7 0-3.05-.85-3.95-.85-.9-2.3-1.5-4.3-1.5h-1.6zm.85 7.4c-.35 2.25-2.05 2.25-3.7 2.25h-.95l.65-4.1a.6.6 0 0 1 .6-.5h.45c1.15 0 2.25 0 2.8.65.35.4.45 1 .15 1.7z"
      fill="#FFFFFF"
    />
  </svg>
);

const PAYSTACK_SVG = (
  <svg viewBox="0 0 140 28" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    {/* Paystack lockup: solid blue square + wordmark, matching the official logo */}
    <rect x="0" y="2" width="24" height="24" rx="4" fill="#011B33" />
    <path
      d="M5 8 L5 20 L9 20 L9 12.5 L13 20 L17 20 L17 8 L13 8 L13 15.5 L9 8 Z"
      fill="#FFFFFF"
    />
    <text
      x="32"
      y="20"
      fontFamily="'Helvetica Neue', Helvetica, Arial, sans-serif"
      fontSize="20"
      fontWeight="700"
      fill="#FFFFFF"
      letterSpacing="-0.5"
    >
      paystack
    </text>
  </svg>
);

const APPLE_PAY_SVG = (
  <svg viewBox="0 0 70 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <path
      d="M7.4 12.7c0-2.05 1.65-3.05 1.75-3.1-.95-1.4-2.45-1.6-3-1.6-1.25-.15-2.5.75-3.15.75-.65 0-1.65-.7-2.7-.7-1.4 0-2.7.8-3.4 2.05-1.45 2.5-.35 6.2 1.05 8.25.7 1 1.5 2.1 2.55 2.05 1.05-.05 1.4-.65 2.65-.65 1.25 0 1.55.65 2.65.65 1.1 0 1.8-1 2.45-2 .8-1.15 1.1-2.3 1.15-2.35-.05 0-2.2-.85-2.2-3.35zM5.4 6.6c.55-.7.95-1.65.85-2.6-.8.05-1.8.55-2.4 1.2-.5.6-1 1.6-.85 2.55.95.05 1.85-.5 2.4-1.15z"
      fill="#FFFFFF"
    />
    <text
      x="22"
      y="17"
      fontFamily="'Helvetica Neue', Helvetica, Arial, sans-serif"
      fontSize="14"
      fontWeight="500"
      fill="#FFFFFF"
    >
      Pay
    </text>
  </svg>
);

const GOOGLE_PAY_SVG = (
  <svg viewBox="0 0 90 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <text
      x="22"
      y="17"
      fontFamily="'Helvetica Neue', Helvetica, Arial, sans-serif"
      fontSize="14"
      fontWeight="500"
      fill="#FFFFFF"
    >
      Pay
    </text>
    <path
      d="M3 9.5 L8.5 9.5 L8.5 14 L3 14 Z"
      fill="#4285F4"
    />
    <path
      d="M3 14 L8.5 14 L8.5 18.5 L3 18.5 Z"
      fill="#34A853"
    />
    <path
      d="M3 5 L8.5 5 L8.5 9.5 L3 9.5 Z"
      fill="#EA4335"
    />
    <path
      d="M8.5 9.5 L14 9.5 L14 14 L8.5 14 Z"
      fill="#FBBC04"
    />
    <path
      d="M8.5 5 L14 5 L14 9.5 L8.5 9.5 Z M8.5 14 L14 14 L14 18.5 L8.5 18.5 Z"
      fill="none"
    />
    <text
      x="0"
      y="22"
      fontFamily="'Product Sans', 'Helvetica Neue', Helvetica, Arial, sans-serif"
      fontSize="10"
      fontWeight="700"
      fill="#FFFFFF"
      letterSpacing="0.5"
    >
      G
    </text>
  </svg>
);

const AMEX_SVG = (
  <svg viewBox="0 0 50 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <rect x="0.5" y="0.5" width="49" height="23" rx="3" fill="#2E77BC" />
    <text
      x="25"
      y="16"
      textAnchor="middle"
      fontFamily="'Helvetica Neue', Helvetica, Arial, sans-serif"
      fontSize="11"
      fontWeight="800"
      fill="#FFFFFF"
      letterSpacing="0.5"
    >
      AMEX
    </text>
  </svg>
);

const paymentMethods: PaymentLogo[] = [
  { name: "Visa", svg: VISA_SVG, h: "h-5" },
  { name: "Mastercard", svg: MASTERCARD_SVG, h: "h-7" },
  { name: "PayPal", svg: PAYPAL_SVG, h: "h-5" },
  { name: "Paystack", svg: PAYSTACK_SVG, h: "h-6" },
  { name: "Apple Pay", svg: APPLE_PAY_SVG, h: "h-6" },
  { name: "Google Pay", svg: GOOGLE_PAY_SVG, h: "h-6" },
  { name: "American Express", svg: AMEX_SVG, h: "h-6" },
];

export function Footer() {
  return (
    <footer className="mt-24 bg-slate-900 text-slate-300">
      {/* Main footer */}
      <div className="container-x pt-16 pb-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-x-8 gap-y-12">

          {/* Brand column */}
          <div className="lg:col-span-4">
            <Logo variant="white" width={190} />
            <p className="mt-4 text-sm text-slate-400 leading-relaxed max-w-xs">
              {siteConfig.description}
            </p>
            {/* Contact info */}
            <div className="mt-6 space-y-3 text-sm">
              <a
                href={`mailto:${siteConfig.email}`}
                className="flex items-center gap-2.5 text-slate-400 hover:text-emerald-400 transition-colors"
              >
                <Mail className="h-4 w-4 shrink-0" />
                <span>{siteConfig.email}</span>
              </a>
              {siteConfig.address && (
                <span className="flex items-start gap-2.5 text-slate-400">
                  <MapPin className="h-4 w-4 shrink-0 mt-0.5" />
                  <span>{siteConfig.address}</span>
                </span>
              )}
            </div>
            {/* Social icons */}
            <div className="mt-6">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500 mb-3">Follow us</p>
              <div className="flex items-center gap-2">
                {socialLinks.filter(s => s.href).map((s) => (
                  <a
                    key={s.label}
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={s.label}
                    className="h-9 w-9 inline-flex items-center justify-center rounded-full bg-slate-800 text-slate-400 hover:bg-emerald-600 hover:text-white transition-all duration-200"
                  >
                    {s.icon}
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="lg:col-span-2">
            <h4 className="text-xs font-bold text-white uppercase tracking-[0.2em] mb-5">Platform</h4>
            <ul className="space-y-3 text-sm">
              <li><Link className="text-slate-400 hover:text-white transition-colors" href="/services">Services</Link></li>
              <li><Link className="text-slate-400 hover:text-white transition-colors" href="/how-it-works">How It Works</Link></li>
              <li><Link className="text-slate-400 hover:text-white transition-colors" href="/pricing">Pricing</Link></li>
              <li><Link className="text-slate-400 hover:text-white transition-colors" href="/experts">Browse Experts</Link></li>
              <li><Link className="text-slate-400 hover:text-white transition-colors" href="/become-an-expert">Become an Expert</Link></li>
            </ul>
          </div>

          {/* Company & Resources */}
          <div className="lg:col-span-2">
            <h4 className="text-xs font-bold text-white uppercase tracking-[0.2em] mb-5">Company</h4>
            <ul className="space-y-3 text-sm">
              <li><Link className="text-slate-400 hover:text-white transition-colors" href="/about">About Us</Link></li>
              <li><Link className="text-slate-400 hover:text-white transition-colors" href="/blog">Blog</Link></li>
              <li><Link className="text-slate-400 hover:text-white transition-colors" href="/faq">FAQ</Link></li>
              <li><Link className="text-slate-400 hover:text-white transition-colors" href="/contact">Contact</Link></li>
              <li><Link className="text-slate-400 hover:text-white transition-colors" href="/privacy">Privacy Policy</Link></li>
              <li><Link className="text-slate-400 hover:text-white transition-colors" href="/terms">Terms of Service</Link></li>
            </ul>
          </div>

          {/* Newsletter & Trust */}
          <div className="lg:col-span-4">
            <h4 className="text-xs font-bold text-white uppercase tracking-[0.2em] mb-5">Stay updated</h4>
            <p className="text-sm text-slate-400 mb-4">
              Get the latest tips, expert insights, and updates delivered to your inbox.
            </p>
            <NewsletterForm />

            {/* Trust badges */}
            <div className="mt-8">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-3">
                Secure payments
              </p>
              <div className="flex flex-nowrap items-center gap-3">
                {paymentMethods.map((pm) => (
                  <span
                    key={pm.name}
                    title={pm.name}
                    aria-label={pm.name}
                    className={`inline-flex items-center ${pm.h ?? "h-6"}`}
                  >
                    {pm.svg}
                  </span>
                ))}
              </div>
            </div>

            {/* Trust signals */}
            <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-slate-500">
              <span className="inline-flex items-center gap-1.5">
                <CheckCircle className="h-3.5 w-3.5 text-emerald-500" />
                SSL Encrypted
              </span>
              <span className="inline-flex items-center gap-1.5">
                <CheckCircle className="h-3.5 w-3.5 text-emerald-500" />
                Escrow Protection
              </span>
              <span className="inline-flex items-center gap-1.5">
                <CheckCircle className="h-3.5 w-3.5 text-emerald-500" />
                PCI Compliant
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-slate-800/50">
        <div className="container-x py-5">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
            <p>
              &copy; {new Date().getFullYear()} {siteConfig.legalName}. All rights reserved.
            </p>
            <div className="flex items-center gap-4">
              <Link href="/privacy" className="hover:text-slate-300 transition-colors">Privacy</Link>
              <Link href="/terms" className="hover:text-slate-300 transition-colors">Terms</Link>
              <Link href="/cookies" className="hover:text-slate-300 transition-colors">Cookies</Link>
              <Link href="/refund" className="hover:text-slate-300 transition-colors">Refunds</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
