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

const paymentMethods: Array<
  | { name: string; src: string; h?: string; invert?: boolean }
  | { name: "Paystack"; inline: "paystack"; h?: string }
  | { name: "Apple Pay"; inline: "applepay"; h?: string }
  | { name: "Google Pay"; inline: "googlepay"; h?: string }
> = [
  { name: "Visa", src: "https://cdn.jsdelivr.net/npm/payment-icons@1.0.0/min/flat/visa.svg" },
  { name: "Mastercard", src: "https://cdn.jsdelivr.net/npm/payment-icons@1.0.0/min/flat/mastercard.svg" },
  { name: "PayPal", src: "https://cdn.jsdelivr.net/npm/payment-icons@1.0.0/min/flat/paypal.svg" },
  { name: "Paystack", inline: "paystack", h: "h-6" },
  { name: "Apple Pay", inline: "applepay", h: "h-6" },
  { name: "Google Pay", inline: "googlepay", h: "h-6" },
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
                {paymentMethods.map((pm) => {
                  if ("inline" in pm && pm.inline === "paystack") {
                    return (
                      <span
                        key={pm.name}
                        title="Paystack"
                        aria-label="Paystack"
                        className={`inline-flex items-center ${pm.h ?? "h-6"}`}
                      >
                        <svg
                          viewBox="0 0 120 24"
                          className="h-full w-auto"
                          aria-hidden="true"
                        >
                          <text
                            x="0"
                            y="18"
                            fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
                            fontSize="20"
                            fontWeight="700"
                            fill="#FFFFFF"
                            letterSpacing="-0.5"
                          >
                            paystack
                          </text>
                        </svg>
                      </span>
                    );
                  }
                  if ("inline" in pm && pm.inline === "applepay") {
                    return (
                      <span
                        key={pm.name}
                        title="Apple Pay"
                        aria-label="Apple Pay"
                        className={`inline-flex items-center ${pm.h ?? "h-6"}`}
                      >
                        <svg
                          viewBox="0 0 70 24"
                          className="h-full w-auto"
                          aria-hidden="true"
                        >
                          <g fill="#FFFFFF">
                            <path d="M11.45 8.19c.6-.75 1-1.77 1-2.79-.85 0-1.92.55-2.55 1.3-.55.65-1.05 1.72-1 2.74.95.05 1.95-.5 2.55-1.25zM12.5 11.5c-1.4 0-2.6.8-3.4.8s-1.7-.75-2.85-.75c-1.45 0-2.8.85-3.55 2.15-1.5 2.6-.4 6.45 1.1 8.55.7 1.05 1.55 2.2 2.65 2.15 1.05-.05 1.45-.7 2.7-.7 1.25 0 1.6.7 2.7.65 1.1 0 1.8-1.05 2.5-2.1.8-1.2 1.1-2.35 1.15-2.4-.05-.05-2.2-.85-2.2-3.35 0-2.1 1.7-3.1 1.8-3.15-1-1.45-2.55-1.6-3.1-1.65z" />
                            <text x="20" y="17" fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" fontSize="16" fontWeight="500">Pay</text>
                          </g>
                        </svg>
                      </span>
                    );
                  }
                  if ("inline" in pm && pm.inline === "googlepay") {
                    return (
                      <span
                        key={pm.name}
                        title="Google Pay"
                        aria-label="Google Pay"
                        className={`inline-flex items-center ${pm.h ?? "h-6"}`}
                      >
                        <svg
                          viewBox="0 0 70 24"
                          className="h-full w-auto"
                          aria-hidden="true"
                        >
                          <text
                            x="0"
                            y="17"
                            fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
                            fontSize="14"
                            fontWeight="500"
                            fill="#FFFFFF"
                            letterSpacing="-0.3"
                          >
                            G
                          </text>
                          <text
                            x="13"
                            y="17"
                            fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
                            fontSize="14"
                            fontWeight="500"
                            fill="#FFFFFF"
                            letterSpacing="-0.3"
                          >
                            Pay
                          </text>
                        </svg>
                      </span>
                    );
                  }
                  return (
                    <img
                      key={pm.name}
                      src={pm.src}
                      alt={pm.name}
                      title={pm.name}
                      className={`${pm.h ?? (pm.name === "PayPal" ? "h-4" : "h-6")} w-auto ${pm.invert ? "invert" : ""}`}
                      style={{ filter: pm.invert ? "invert(1) brightness(1.5)" : undefined }}
                      loading="lazy"
                    />
                  );
                })}
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
