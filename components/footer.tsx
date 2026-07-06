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
