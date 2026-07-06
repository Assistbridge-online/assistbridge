import Link from "next/link";
import { Logo } from "@/components/logo";
import { NewsletterForm } from "@/components/newsletter-form";
import { siteConfig } from "@/lib/site";
import { Mail, MapPin, Phone, CheckCircle } from "lucide-react";

const socialIcons = {
  twitter: (
    <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" aria-hidden="true">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  ),
  linkedin: (
    <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" aria-hidden="true">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.852 3.37-1.852 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.063 2.063 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  ),
  facebook: (
    <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" aria-hidden="true">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  ),
  instagram: (
    <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" aria-hidden="true">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
    </svg>
  ),
  youtube: (
    <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" aria-hidden="true">
      <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
    </svg>
  ),
  github: (
    <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" aria-hidden="true">
      <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
    </svg>
  ),
};

const socialLinks = [
  { href: siteConfig.social.twitter, label: "Twitter", icon: socialIcons.twitter },
  { href: siteConfig.social.linkedin, label: "LinkedIn", icon: socialIcons.linkedin },
  { href: siteConfig.social.facebook, label: "Facebook", icon: socialIcons.facebook },
  { href: siteConfig.social.instagram, label: "Instagram", icon: socialIcons.instagram },
  { href: siteConfig.social.youtube, label: "YouTube", icon: socialIcons.youtube },
];

const paymentMethods = [
  { name: "Visa", src: "https://cdn.jsdelivr.net/npm/payment-icons@1.0.0/min/flat/visa.svg" },
  { name: "Mastercard", src: "https://cdn.jsdelivr.net/npm/payment-icons@1.0.0/min/flat/mastercard.svg" },
  { name: "PayPal", src: "https://cdn.jsdelivr.net/npm/payment-icons@1.0.0/min/flat/paypal.svg" },
  { name: "Paystack", src: "https://cdn.brandfetch.io/paystack.com/idP_UAmTZL/w/512/h/106/theme/light/logo.png" },
  { name: "Apple Pay", src: "https://cdn.simpleicons.org/applepay/white" },
  { name: "Google Pay", src: "https://cdn.simpleicons.org/googlepay" },
  { name: "Amex", src: "https://cdn.jsdelivr.net/npm/payment-icons@1.0.0/min/flat/amex.svg" },
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
              {siteConfig.phone && (
                <span className="flex items-center gap-2.5 text-slate-400">
                  <Phone className="h-4 w-4 shrink-0" />
                  <span>{siteConfig.phone}</span>
                </span>
              )}
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
                  <img
                    key={pm.name}
                    src={pm.src}
                    alt={pm.name}
                    title={pm.name}
                    className={pm.name === "PayPal" ? "h-4 w-auto" : "h-6 w-auto"}
                    loading="lazy"
                  />
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
