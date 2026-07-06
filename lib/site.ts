export const siteConfig = {
  name: "AssistBridge",
  legalName: "AssistBridge LLC",
  tagline: "Research & Technical Assistance",
  description:
    "AssistBridge connects you with vetted experts for research, technical, and academic help across every discipline — on demand.",
  url: "https://assistbridge.online",
  ogImage: "/assistbridge-logo.png",
  email: "info@assistbridge.online",
  supportEmail: "support@assistbridge.online",
  ownerEmail: "patywafula2019@gmail.com",
  phone: "+254115253169",
  whatsapp: "+254115253169",
  address: "",
  social: {
    twitter: "https://twitter.com/assistbridge",
    linkedin: "https://www.linkedin.com/company/assistbridge",
    github: "",
    facebook: "https://facebook.com/assistbridge",
    instagram: "https://instagram.com/assistbridge",
    youtube: "https://youtube.com/@assistbridge",
  },
  nav: {
    main: [
      { label: "Services", href: "/services" },
      { label: "How It Works", href: "/how-it-works" },
      { label: "Experts", href: "/experts" },
      { label: "Pricing", href: "/pricing" },
      { label: "Blog", href: "/blog" },
      { label: "Contact", href: "/contact" },
      { label: "Become an Expert", href: "/become-an-expert" },
    ],
    footer: [
      { label: "About", href: "/about" },
      { label: "Contact", href: "/contact" },
      { label: "FAQ", href: "/faq" },
      { label: "Become an Expert", href: "/become-an-expert" },
      { label: "Privacy", href: "/privacy" },
      { label: "Terms", href: "/terms" },
      { label: "Refunds", href: "/refund" },
      { label: "Cookies", href: "/cookies" },
    ],
  },
  stats: {
    disciplines: 12,
    experts: 250,
    tasksCompleted: 1200,
    countriesServed: 60,
  },
};

export type SiteConfig = typeof siteConfig;
