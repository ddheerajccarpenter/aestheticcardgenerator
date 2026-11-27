import React, { useEffect } from 'react';
import { updatePageSEO } from '../utils/seo';
import { AdSlot } from '../components/AdSlot';
import { PRESET_TEMPLATES } from '../data/templates';
import {
  Mail,
  Cookie,
  Eye,
  Award,
  ChevronRight,
  AlertTriangle,
  Lock,
  Check,
  Copy,
  ArrowRight,
} from 'lucide-react';

interface TrustViewBaseProps {
  onNavigate?: (path: string) => void;
  theme?: 'dark' | 'light';
}

// --------------------------------------------------------------------------
// 1. ABOUT PAGE (/about): Warm Nano-Textured Colophon Card
// --------------------------------------------------------------------------
export const AboutView: React.FC<TrustViewBaseProps> = () => {

  useEffect(() => {
    updatePageSEO({
      title: 'About: Aesthetic Card Studio',
      description:
        'Local-first card press and studio designed to format words, poetry, and aesthetic ID cards in your browser.',
      canonicalPath: '/about',
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  return (
    <div className="w-full pt-8 sm:pt-12 pb-28 md:pb-20 transition-colors duration-200 text-[var(--app-text-primary)]">
      <div className="studio-container-narrow flex flex-col gap-8">
        <nav aria-label="Breadcrumb" className="studio-breadcrumb">
          <a href="/" className="cursor-pointer">Home</a>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="active">About</span>
        </nav>

        {/* Warm Nano-Textured Colophon Card */}
        <div className="studio-panel p-6 sm:p-10 shadow-2xl relative overflow-hidden">
          {/* Nano-texture grain overlay */}
          <div className="absolute inset-0 card-noise opacity-20 pointer-events-none" />

          <header className="flex flex-col gap-2 border-b pb-5 border-[var(--app-border-subtle)] relative z-10">
            <h1 className="font-brand text-3xl md:text-5xl font-medium tracking-tight font-heading">
              Aesthetic Card Studio
            </h1>
            <p className="text-sm leading-relaxed text-[var(--app-text-secondary)] max-w-xl font-body">
              Local-first browser card studio
            </p>
          </header>

          {/* Strict 2-Column Grid Architecture */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-8 relative z-10">
            {/* Column 1: Local-First Architecture */}
            <div className="p-6 rounded-2xl border border-[var(--app-border-subtle)] bg-[var(--app-surface-secondary)] flex flex-col justify-between">
              <div>
                <span className="text-xs font-mono font-medium text-[var(--app-accent)] block mb-2">
                  Local-first storage
                </span>
                <h2 className="text-lg font-medium mb-2 font-heading text-[var(--app-text-primary)]">
                  Zero cloud uploads
                </h2>
                <p className="text-xs leading-relaxed text-[var(--app-text-secondary)]">
                  Notes, quotes, and photos stay on your device. Rendering happens directly in browser memory via Canvas, SVG, and WebGL.
                </p>
              </div>
              <div className="pt-4 mt-4 border-t border-[var(--app-border-subtle)] text-xs font-mono text-[var(--app-text-muted)]">
                Client-side privacy
              </div>
            </div>

            {/* Column 2: Archival 4K–16K Output */}
            <div className="p-6 rounded-2xl border border-[var(--app-border-subtle)] bg-[var(--app-surface-secondary)] flex flex-col justify-between">
              <div>
                <span className="text-xs font-mono font-medium text-[var(--app-accent)] block mb-2">
                  Print fidelity
                </span>
                <h2 className="text-lg font-medium mb-2 font-heading text-[var(--app-text-primary)]">
                  High-DPI export
                </h2>
                <p className="text-xs leading-relaxed text-[var(--app-text-secondary)]">
                  Procedural paper finishes, custom local fonts, and offline background removal render directly at print resolution.
                </p>
              </div>
              <div className="pt-4 mt-4 border-t border-[var(--app-border-subtle)] text-xs font-mono text-[var(--app-text-muted)]">
                Vector and Retina export
              </div>
            </div>
          </div>

          {/* Ownership Notice */}
          <div className="p-4 rounded-xl border border-[var(--app-border-subtle)] bg-[var(--app-surface-secondary)] flex flex-col sm:flex-row items-center justify-between gap-3 text-[13px] relative z-10">
            <span className="font-semibold text-[var(--app-text-primary)]">
              Built independently. Questions or feedback: ddheerajcarpenter@gmail.com
            </span>
            <a
              href="mailto:ddheerajcarpenter@gmail.com?subject=Aesthetic%20Card%20Studio%20Feedback"
              className="studio-btn-ghost !p-0 !text-[13px] font-semibold underline inline-flex items-center gap-1"
            >
              <span>Email maintainer</span>
              <ArrowRight className="w-3.5 h-3.5 stroke-[1.5]" aria-hidden="true" />
            </a>
          </div>
        </div>

        <AdSlot slotId="about-bottom-slot" />
      </div>
    </div>
  );
};

// --------------------------------------------------------------------------
// 2. CONTACT PAGE (/contact) - Direct Owner Contact
// --------------------------------------------------------------------------
export const ContactView: React.FC<TrustViewBaseProps> = () => {
  const [copiedEmail, setCopiedEmail] = React.useState(false);

  const handleCopyEmail = () => {
    navigator.clipboard.writeText('ddheerajcarpenter@gmail.com');
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2000);
  };

  useEffect(() => {
    updatePageSEO({
      title: 'Contact & Feedback: Aesthetic Card Studio',
      description:
        'Direct contact with the creator of Aesthetic Card Studio. Send questions, feature suggestions, and bug reports.',
      canonicalPath: '/contact',
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  return (
    <div className="w-full pt-8 sm:pt-12 pb-28 md:pb-20 transition-colors duration-200 text-[var(--app-text-primary)]">
      <div className="studio-container-narrow flex flex-col gap-8">
        <nav aria-label="Breadcrumb" className="studio-breadcrumb">
          <a href="/" className="cursor-pointer">Home</a>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="active">Contact</span>
        </nav>

        <header className="flex flex-col gap-2 border-b pb-5 border-[var(--app-border-subtle)]">
          <h1 className="text-3xl md:text-5xl font-medium tracking-tight font-heading">
            Contact
          </h1>
        </header>

        {/* 2-Column Contact Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Card 1: Official Email Block */}
          <div className="studio-panel p-6 sm:p-8 flex flex-col justify-between shadow-xl">
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 stroke-[1.5] text-[var(--app-accent)]" />
                <h2 className="text-base font-medium font-heading text-[var(--app-text-primary)]">Direct email</h2>
              </div>
              <p className="text-xs text-[var(--app-text-secondary)] leading-relaxed">
                Send feedback, template requests, or bugs directly to the maintainer:
              </p>
              <div className="p-3 rounded-xl bg-[var(--app-surface-secondary)] border border-[var(--app-border-subtle)] font-mono text-xs font-medium text-[var(--app-text-primary)]">
                ddheerajcarpenter@gmail.com
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 pt-6">
              <a
                href="mailto:ddheerajcarpenter@gmail.com?subject=Aesthetic%20Card%20Studio%20Feedback"
                className="studio-btn-primary flex-1 !text-xs !py-2.5"
              >
                <Mail className="w-4 h-4 stroke-[1.5]" />
                <span>Send direct email</span>
              </a>

              <button
                onClick={handleCopyEmail}
                type="button"
                className="studio-btn-secondary !text-xs !py-2.5"
              >
                {copiedEmail ? <Check className="w-3.5 h-3.5 text-[var(--app-accent)]" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedEmail ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
          </div>

          {/* Card 2: GitHub & Issue Tracker */}
          <div className="studio-panel p-6 sm:p-8 flex flex-col justify-between shadow-xl">
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2.5">
                <h2 className="text-base font-medium font-heading text-[var(--app-text-primary)]">Issue tracking</h2>
              </div>
              <p className="text-xs text-[var(--app-text-secondary)] leading-relaxed">
                Found a rendering bug or have a suggestion? Open an issue on GitHub or browse existing templates:
              </p>
              <ul className="text-xs text-[var(--app-text-muted)] flex flex-col gap-1.5 pl-4 list-disc">
                <li>Include your browser and operating system.</li>
                <li>Note the aspect ratio and surface texture active.</li>
                <li>Free and open-source under MIT license.</li>
              </ul>
            </div>

            <div className="pt-6">
              <a
                href="https://github.com/ddheerajccarpenter/aestheticcardgenerator/issues"
                target="_blank"
                rel="noreferrer"
                className="studio-btn-secondary w-full min-h-[44px] !text-[13px] !py-2.5 inline-flex items-center justify-center gap-1.5"
              >
                <span>Open GitHub issues</span>
                <ArrowRight className="w-3.5 h-3.5 stroke-[1.5]" aria-hidden="true" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// --------------------------------------------------------------------------
// 3. FAQ PAGE (/faq)
// --------------------------------------------------------------------------
import { SITE_FAQ_ITEMS } from '../utils/seo';

export const FaqView: React.FC<TrustViewBaseProps> = () => {

  useEffect(() => {
    updatePageSEO({
      title: 'Frequently Asked Questions - Aesthetic Card Generator',
      description:
        'Answers to common questions about card creation, free downloads, export resolutions, local privacy, supported fonts, and browser compatibility.',
      canonicalPath: '/faq',
      jsonLd: {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: SITE_FAQ_ITEMS.map((item) => ({
          '@type': 'Question',
          name: item.q,
          acceptedAnswer: { '@type': 'Answer', text: item.a },
        })),
      },
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const faqItems = SITE_FAQ_ITEMS;

  return (
    <div className="w-full pt-8 sm:pt-12 pb-28 md:pb-20 transition-colors duration-200 text-[var(--app-text-primary)]">
      <div className="studio-container-narrow flex flex-col gap-8">
        <nav aria-label="Breadcrumb" className="studio-breadcrumb">
          <a href="/" className="cursor-pointer">Home</a>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="active">FAQ</span>
        </nav>

        <header className="flex flex-col gap-2 border-b pb-5 border-[var(--app-border-subtle)]">
          <h1 className="text-3xl md:text-5xl font-medium tracking-tight font-heading">
            FAQ
          </h1>
        </header>

        <section aria-label="FAQ list" className="flex flex-col gap-4">
          <h2 className="sr-only">Questions and Answers</h2>
          {faqItems.map((item, idx) => (
            <article
              key={idx}
              className="studio-panel p-5 flex flex-col gap-2"
            >
              <h3 className="text-sm sm:text-base font-bold leading-snug text-[var(--app-text-primary)]">
                {item.q}
              </h3>
              <p className="text-xs sm:text-sm leading-relaxed text-[var(--app-text-secondary)]">
                {item.a}
              </p>
            </article>
          ))}
        </section>

        <AdSlot slotId="faq-bottom-slot" />
      </div>
    </div>
  );
};

// --------------------------------------------------------------------------
// 4. PRIVACY POLICY (/privacy)
// --------------------------------------------------------------------------
export const PrivacyView: React.FC<TrustViewBaseProps> = () => {

  useEffect(() => {
    updatePageSEO({
      title: 'Privacy Policy: Aesthetic Card Studio',
      description:
        'Privacy Policy for Aesthetic Card Studio, including local browser storage and externally hosted fonts and interface assets.',
      canonicalPath: '/privacy',
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  return (
    <div className="w-full pt-8 sm:pt-12 pb-28 md:pb-20 transition-colors duration-200 text-[var(--app-text-primary)]">
      <div className="studio-container-narrow flex flex-col gap-8">
        <nav aria-label="Breadcrumb" className="studio-breadcrumb">
          <a href="/" className="cursor-pointer">Home</a>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="active">Privacy Policy</span>
        </nav>

        <header className="flex flex-col gap-3 border-b pb-6 border-[var(--app-border-subtle)]">
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 stroke-[1.5] text-[var(--app-accent)]" />
            <span className="text-xs font-medium text-[var(--app-accent)] font-subheading">
              Privacy
            </span>
          </div>
          <h1 className="text-3xl md:text-5xl font-medium tracking-tight font-heading">
            Privacy policy
          </h1>
          <p className="text-xs font-mono text-[var(--app-text-muted)]">
            Effective Date: October 2026 • Studio Version 3.4
          </p>
        </header>

        <div className="studio-panel p-6 sm:p-10 flex flex-col gap-6 text-xs md:text-sm leading-relaxed">
          <section className="flex flex-col gap-2">
            <h2 className="text-base font-bold font-heading text-[var(--app-text-primary)]">
              1. Overview of Our Client-Side Architecture
            </h2>
            <p className="text-[var(--app-text-secondary)]">
              Aesthetic Card Studio ("we", "us", or "our") operates as a client-side web application. We do not require user accounts, email addresses, passwords, or cloud database storage to provide our card generation services.
            </p>
          </section>

          <section className="flex flex-col gap-2">
            <h2 className="text-base font-bold font-heading text-[var(--app-text-primary)]">
              2. Processing of Text and Card Content
            </h2>
            <p className="text-[var(--app-text-secondary)]">
              Text and card artwork are processed in your browser. Drafts and preferences may be saved in browser storage so you can continue your work after a refresh. ACG does not send that design content to an ACG application server.
            </p>
          </section>

          <section className="flex flex-col gap-2">
            <h2 className="text-base font-bold font-heading text-[var(--app-text-primary)]">
              3. Local Browser Storage (localStorage)
            </h2>
            <p className="text-[var(--app-text-secondary)]">
              ACG uses localStorage for the interface theme and card drafts, sessionStorage for the selected template during navigation, and IndexedDB for locally stored custom fonts and projects. These values remain in this browser and can be cleared through the browser's site-data controls.
            </p>
          </section>

          <section className="flex flex-col gap-2">
            <h2 className="text-base font-bold font-heading text-[var(--app-text-primary)]">
              4. External Content Delivery Networks (CDNs)
            </h2>
            <p className="text-[var(--app-text-secondary)]">
              The interface and some card typefaces load from Google Fonts and CDNFONTS. The advanced editor also loads Boxicons from unpkg. When those resources load, your browser makes requests to their hosts and shares standard connection metadata such as IP address and user-agent. Locally installed or previously saved fonts can be used where available.
            </p>
          </section>

          <section className="flex flex-col gap-2">
            <h2 className="text-base font-bold font-heading text-[var(--app-text-primary)]">
              5. Analytics &amp; Google AdSense Readiness
            </h2>
            <p className="text-[var(--app-text-secondary)]">
              This build keeps Google AdSense slots disabled until a verified Publisher ID (`ca-pub-...`) is activated. When enabled in the future, Google AdSense and authorized advertising partners may use cookies or local signals to deliver relevant or non-personalized ads alongside gallery and editorial pages. Your card text, uploaded images, and custom fonts always remain local in your browser. Visitors may manage personalized ad preferences at any time via Google Ad Settings or youradchoices.com.
            </p>
          </section>

          <section className="flex flex-col gap-2">
            <h2 className="text-base font-bold font-heading text-[var(--app-text-primary)]">
              6. Contact Information
            </h2>
            <p className="text-[var(--app-text-secondary)]">
              If you have any questions regarding this Privacy Policy, please contact the site maintainer at <a href="mailto:ddheerajcarpenter@gmail.com" className="text-[var(--app-accent)] hover:underline font-mono">ddheerajcarpenter@gmail.com</a>.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

// --------------------------------------------------------------------------
// 5. TERMS OF USE (/terms)
// --------------------------------------------------------------------------
export const TermsView: React.FC<TrustViewBaseProps> = () => {
  useEffect(() => {
    updatePageSEO({
      title: 'Terms of Use: Aesthetic Card Studio',
      description:
        'Terms of use for Aesthetic Card Studio. Permitted usage, intellectual property guidelines, and liability limitations.',
      canonicalPath: '/terms',
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  return (
    <div className="w-full pt-8 sm:pt-12 pb-28 md:pb-20 transition-colors duration-200 text-[var(--app-text-primary)]">
      <div className="studio-container-narrow flex flex-col gap-8">
        <nav aria-label="Breadcrumb" className="studio-breadcrumb">
          <a href="/" className="cursor-pointer">Home</a>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="active">Terms of Use</span>
        </nav>

        <header className="flex flex-col gap-3 border-b pb-6 border-[var(--app-border-subtle)]">
          <span className="text-xs font-medium text-[var(--app-text-muted)] font-subheading block">
            Usage agreement
          </span>
          <h1 className="text-3xl md:text-5xl font-medium tracking-tight font-heading">
            Terms of use
          </h1>
          <p className="text-xs font-mono text-[var(--app-text-muted)]">
            Last Updated: October 2026
          </p>
        </header>

        <div className="studio-panel p-6 sm:p-10 flex flex-col gap-6 text-xs md:text-sm leading-relaxed">
          <section className="flex flex-col gap-2">
            <h2 className="text-base font-bold font-heading text-[var(--app-text-primary)]">
              1. Permitted Use
            </h2>
            <p className="text-[var(--app-text-secondary)]">
              Aesthetic Card Studio is provided free of charge for personal and commercial typography generation. You may use generated card graphics in social media posts, presentations, marketing materials, and publications, subject to your own rights in the underlying text content.
            </p>
          </section>

          <section className="flex flex-col gap-2">
            <h2 className="text-base font-bold font-heading text-[var(--app-text-primary)]">
              2. User Content Responsibility
            </h2>
            <p className="text-[var(--app-text-secondary)]">
              You retain full ownership of any text or quotes you input into the application. You are solely responsible for ensuring that your submitted words do not infringe on copyrights, trademarks, or third-party intellectual property rights.
            </p>
          </section>

          <section className="flex flex-col gap-2">
            <h2 className="text-base font-bold font-heading text-[var(--app-text-primary)]">
              3. Disclaimer of Warranty
            </h2>
            <p className="text-[var(--app-text-secondary)]">
              This software is provided "as is", without warranty of any kind, express or implied. We do not guarantee uninterrupted availability, error-free operation, or that local browser drafts will never be cleared by browser storage quotas.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

// --------------------------------------------------------------------------
// 6. COOKIE POLICY (/cookies)
// --------------------------------------------------------------------------
export const CookieView: React.FC<TrustViewBaseProps> = () => {
  useEffect(() => {
    updatePageSEO({
      title: 'Cookie Policy: Aesthetic Card Studio',
      description:
        'Cookie and browser-storage policy for Aesthetic Card Studio, including locally saved designs and external font resources.',
      canonicalPath: '/cookies',
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  return (
    <div className="w-full pt-8 sm:pt-12 pb-28 md:pb-20 transition-colors duration-200 text-[var(--app-text-primary)]">
      <div className="studio-container-narrow flex flex-col gap-8">
        <nav aria-label="Breadcrumb" className="studio-breadcrumb">
          <a href="/" className="cursor-pointer">Home</a>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="active">Cookie Policy</span>
        </nav>

        <header className="flex flex-col gap-3 border-b pb-6 border-[var(--app-border-subtle)]">
          <div className="flex items-center gap-2">
            <Cookie className="w-4 h-4 stroke-[1.5] text-[var(--app-accent)]" />
            <span className="text-xs font-medium text-[var(--app-text-muted)] font-subheading block">
              Storage practices
            </span>
          </div>
          <h1 className="text-3xl md:text-5xl font-medium tracking-tight font-heading">
            Cookie &amp; storage policy
          </h1>
          <p className="text-xs font-mono text-[var(--app-text-muted)]">
            Audited October 2026
          </p>
        </header>

        <div className="studio-panel p-6 sm:p-10 flex flex-col gap-6 text-xs md:text-sm leading-relaxed">
          <section className="flex flex-col gap-2">
            <h2 className="text-base font-bold font-heading text-[var(--app-text-primary)]">
              1. First-Party Cookies &amp; Local Storage
            </h2>
            <p className="text-[var(--app-text-secondary)]">
              ACG does not currently set tracking cookies. It uses localStorage, sessionStorage, and IndexedDB for theme preferences, editor drafts, selected templates, custom fonts, and locally saved projects. You can remove this data in your browser's site-data settings.
            </p>
          </section>

          <section className="flex flex-col gap-2">
            <h2 className="text-base font-bold font-heading text-[var(--app-text-primary)]">
              2. External Resources &amp; Future Advertising Cookies
            </h2>
            <p className="text-[var(--app-text-secondary)]">
              Google Fonts, CDNFONTS, and unpkg may serve fonts or icon files used by the interface, which shares standard network request headers with those hosts. In the current disabled-ad configuration, no Google AdSense scripts or ad cookies are loaded. When Google AdSense is enabled later with a verified publisher account, Google may place standard advertising and measurement cookies subject to your browser controls and Google ad personalization settings.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

// --------------------------------------------------------------------------
// 6b. EDITORIAL, PARODY & DMCA DISCLAIMER (/disclaimer): AdSense & DMCA Hub
// --------------------------------------------------------------------------
export const DisclaimerView: React.FC<TrustViewBaseProps> = () => {
  useEffect(() => {
    updatePageSEO({
      title: 'Editorial, Parody & DMCA Copyright Disclaimer: Aesthetic Card Studio',
      description:
        'Legal, artistic, and DMCA copyright disclaimer for Aesthetic Card Studio. Fictional credential layouts, parody rights, and direct rights-holder contact.',
      canonicalPath: '/disclaimer',
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  return (
    <div className="w-full pt-8 sm:pt-12 pb-28 md:pb-20 transition-colors duration-200 text-[var(--app-text-primary)]">
      <div className="studio-container-narrow flex flex-col gap-8">
        <nav aria-label="Breadcrumb" className="studio-breadcrumb">
          <a href="/" className="cursor-pointer">Home</a>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="active">Disclaimer</span>
        </nav>

        <header className="flex flex-col gap-3 border-b pb-6 border-[var(--app-border-subtle)]">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 stroke-[1.5] text-[var(--app-accent)]" />
            <h1 className="text-2xl md:text-4xl font-medium tracking-tight font-heading">
              Editorial, parody &amp; DMCA disclaimer
            </h1>
          </div>
          <p className="text-[13px] text-[var(--app-text-muted)] font-mono">
            Effective Date: October 14, 2026 • Studio License Version 3.4
          </p>
        </header>

        <div className="studio-panel p-6 sm:p-10 flex flex-col gap-8 text-sm leading-relaxed">
          <section className="flex flex-col gap-3">
            <h2 className="text-base font-semibold font-heading text-[var(--app-text-primary)]">
              1. Artistic Expression, Parody &amp; Creative Templates
            </h2>
            <p className="text-[var(--app-text-secondary)]">
              All example Aesthetic ID Card designs, vintage transit badges, fan credentials, collector cards, and literary layouts offered on Aesthetic Card Studio are original artwork compositions made for personal notes, worldbuilding, design portfolios, and personal creative projects.
            </p>
            <p className="text-[var(--app-text-secondary)]">
              These designs are <strong>NOT</strong> government-issued identity documents, official state IDs, real-world law enforcement credentials, or valid corporate security passes. They possess zero legal status and cannot be used for any official identification, impersonation, deception, or fraudulent activity.
            </p>
          </section>

          <section className="flex flex-col gap-3">
            <h2 className="text-base font-semibold font-heading text-[var(--app-text-primary)]">
              2. Fair Use &amp; Pop-Culture Homage
            </h2>
            <p className="text-[var(--app-text-secondary)]">
              Any names, pop-culture motifs, literary citations, or fictional character references (such as parody club badges or fan cards) used in preview templates fall under fair-use commentary, parody, and personal artistic critique. All referenced trademarks, intellectual properties, and artist names belong to their respective copyright holders.
            </p>
          </section>

          <section className="flex flex-col gap-3">
            <h2 className="text-base font-bold font-heading text-[var(--app-text-primary)]">
              3. User-Generated Content &amp; Local Privacy
            </h2>
            <p className="text-[var(--app-text-secondary)]">
              Aesthetic Card Studio operates 100% locally in your client web browser. Because no user-edited cards, uploaded portraits, or custom fonts are transmitted to or stored on our servers, each individual user retains full responsibility for the content they generate, download, or distribute. Users agree not to produce unlawful, defamatory, or fraudulent materials.
            </p>
          </section>

          <section className="flex flex-col gap-3">
            <h2 className="text-base font-bold font-heading text-[var(--app-text-primary)]">
              4. DMCA Notice &amp; Copyright Takedown Procedure
            </h2>
            <p className="text-[var(--app-text-secondary)]">
              Aesthetic Card Studio respects the intellectual property rights of all creators. If you are a copyright owner or authorized representative and believe that any sample template, font reference, or decorative graphic on this site infringes upon your copyright, please contact our designated Copyright Agent directly:
            </p>
            <div className="p-4 rounded-xl border border-[var(--app-border-subtle)] bg-[var(--app-surface-secondary)] flex flex-col gap-1 text-xs font-mono">
              <span className="font-bold text-[var(--app-text-primary)]">Designated DMCA Agent: Dheeraj Carpenter</span>
              <span>Email: <a href="mailto:ddheerajcarpenter@gmail.com" className="underline hover:text-[var(--app-accent)]">ddheerajcarpenter@gmail.com</a></span>
              <span>Response Window: Typically under 24 business hours</span>
            </div>
            <p className="text-[var(--app-text-secondary)]">
              Upon receiving a bona fide notification, we will immediately review the inquiry and remove or disable access to the relevant content in accordance with the Digital Millennium Copyright Act (17 U.S.C. § 512).
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

// --------------------------------------------------------------------------
// 7. ACCESSIBILITY STATEMENT (/accessibility)
// --------------------------------------------------------------------------
export const AccessibilityView: React.FC<TrustViewBaseProps> = () => {
  useEffect(() => {
    updatePageSEO({
      title: 'Accessibility Statement: Aesthetic Card Studio',
      description:
        'Accessibility commitment for Aesthetic Card Studio. WCAG AAA touch targets, keyboard navigation, and high-contrast colorways.',
      canonicalPath: '/accessibility',
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  return (
    <div className="w-full pt-8 sm:pt-12 pb-28 md:pb-20 transition-colors duration-200 text-[var(--app-text-primary)]">
      <div className="studio-container-narrow flex flex-col gap-8">
        <nav aria-label="Breadcrumb" className="studio-breadcrumb">
          <a href="/" className="cursor-pointer">Home</a>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="active">Accessibility</span>
        </nav>

        <header className="flex flex-col gap-3 border-b pb-6 border-[var(--app-border-subtle)]">
          <div className="flex items-center gap-2">
            <Eye className="w-4 h-4 stroke-[1.5] text-[var(--app-accent)]" />
            <span className="text-[13px] font-medium text-[var(--app-accent)] font-subheading">
              Standards
            </span>
          </div>
          <h1 className="text-3xl md:text-5xl font-medium tracking-tight font-heading">
            Accessibility statement
          </h1>
          <p className="text-sm md:text-base leading-relaxed text-[var(--app-text-secondary)]">
            Keyboard navigation, 44px touch targets, and WCAG AA+ contrast across both themes.
          </p>
        </header>

        <div className="studio-panel p-6 sm:p-10 flex flex-col gap-6 text-sm leading-relaxed">
          <section className="flex flex-col gap-2">
            <h2 className="text-base font-semibold font-heading text-[var(--app-text-primary)]">
              Implemented Accessibility Features
            </h2>
            <ul className="flex flex-col gap-2 pl-4 list-disc text-sm text-[var(--app-text-secondary)]">
              <li><strong>Keyboard Navigation:</strong> Critical workflows support keyboard shortcuts, including Command Palette (⌘K), Undo (⌘Z), Redo (⌘Shift+Z), skip-to-content navigation, and Escape dismissal.</li>
              <li><strong>WCAG Touch Targets:</strong> Interactive toolbar buttons and template cards maintain at least 44x44px bounding hit areas.</li>
              <li><strong>Semantic HTML Landmarks:</strong> Pages use standard HTML5 landmarks (header, nav, main, article, section, footer) for screen reader navigation.</li>
              <li><strong>Color Contrast:</strong> Both Dark (Projection Room) and Light (Archival Paper) modes meet WCAG AA/AAA contrast ratios for text readability.</li>
            </ul>
          </section>

          <section className="flex flex-col gap-2">
            <h2 className="text-base font-semibold font-heading text-[var(--app-text-primary)]">
              Reporting Accessibility Barriers
            </h2>
            <p className="text-[var(--app-text-secondary)]">
              If you encounter any difficulty navigating or operating any control on this website, please email <a href="mailto:ddheerajcarpenter@gmail.com" className="text-[var(--app-accent)] hover:underline font-mono">ddheerajcarpenter@gmail.com</a>.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

// --------------------------------------------------------------------------
// 8. ASSET & FONT CREDITS (/credits)
// --------------------------------------------------------------------------
export const CreditsView: React.FC<TrustViewBaseProps> = () => {
  useEffect(() => {
    updatePageSEO({
      title: 'Asset & Font Credits: Aesthetic Card Studio',
      description:
        'Open-source licensing and attribution credits for Google Fonts, Lucide icons, and browser libraries utilized by Aesthetic Card Studio.',
      canonicalPath: '/credits',
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const credits = [
    {
      name: 'Newsreader',
      author: 'Production Type',
      license: 'SIL Open Font License 1.1',
      purpose: 'Primary editorial serif for literature, philosophy, and classical quotes.',
    },
    {
      name: 'Playfair Display',
      author: 'Claus Eggers Sørensen',
      license: 'SIL Open Font License 1.1',
      purpose: 'High-contrast display serif for dramatic titles and poetic fragments.',
    },
    {
      name: 'Inter',
      author: 'Rasmus Andersson',
      license: 'SIL Open Font License 1.1',
      purpose: 'Humanist sans-serif for clean axioms, modern critiques, and UI controls.',
    },
    {
      name: 'JetBrains Mono',
      author: 'JetBrains',
      license: 'SIL Open Font License 1.1',
      purpose: 'Tabular monospaced typeface for study flashcards and technical metadata.',
    },
    {
      name: 'Lucide React',
      author: 'Lucide Contributors',
      license: 'ISC License',
      purpose: 'Universal UI icons and toolbar symbols.',
    },
    {
      name: 'html-to-image',
      author: 'Wufei & Contributors',
      license: 'MIT License',
      purpose: 'Client-side HTML5 DOM rasterization and high-res SVG/PNG generation.',
    },
    {
      name: 'canvas-confetti',
      author: 'Kiril Vatev',
      license: 'ISC License',
      purpose: 'Celebratory export micro-interaction.',
    },
  ];

  return (
    <div className="w-full pt-8 sm:pt-12 pb-28 md:pb-20 transition-colors duration-200 text-[var(--app-text-primary)]">
      <div className="studio-container-narrow flex flex-col gap-8">
        <nav aria-label="Breadcrumb" className="studio-breadcrumb">
          <a href="/" className="cursor-pointer">Home</a>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="active">Credits</span>
        </nav>

        <header className="flex flex-col gap-3 border-b pb-6 border-[var(--app-border-subtle)]">
          <div className="flex items-center gap-2">
            <Award className="w-4 h-4 stroke-[1.5] text-[var(--app-accent)]" />
            <span className="text-xs font-medium text-[var(--app-text-muted)] font-subheading block">
              Open source attributions
            </span>
          </div>
          <h1 className="text-3xl md:text-5xl font-medium tracking-tight font-heading">
            Asset &amp; font credits
          </h1>
          <p className="text-sm md:text-base leading-relaxed text-[var(--app-text-secondary)]">
            Transparent attribution for all external fonts, icons, and software libraries used in this project.
          </p>
        </header>

        <div className="flex flex-col gap-4">
          {credits.map((c, idx) => (
            <div
              key={idx}
              className="studio-panel p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
            >
              <div>
                <h2 className="text-sm font-semibold font-heading text-[var(--app-text-primary)]">
                  {c.name}
                </h2>
                <p className="text-[13px] text-[var(--app-text-secondary)]">{c.purpose}</p>
              </div>
              <div className="flex items-center gap-2 text-[13px] font-mono shrink-0">
                <span className="text-[var(--app-text-muted)]">{c.author}</span>
                <span className="px-2 py-0.5 rounded border border-[var(--app-border-subtle)] bg-[var(--app-surface-secondary)] text-[var(--app-accent)]">
                  {c.license}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// --------------------------------------------------------------------------
// 9. 404 NOT FOUND PAGE (/404)
// --------------------------------------------------------------------------
export const NotFoundView: React.FC<TrustViewBaseProps> = () => {
  const currentPath = typeof window !== 'undefined' ? window.location.pathname : '/404';

  useEffect(() => {
    updatePageSEO({
      title: 'Page Not Found (404): Aesthetic Card Studio',
      description: 'The requested page could not be found. Return to home or browse our aesthetic template gallery.',
      canonicalPath: '/404',
    });
  }, []);

  const suggestions = [
    { label: 'Homepage', path: '/', description: 'Browse templates and design system' },
    { label: 'Template Library', path: '/templates', description: `Browse all ${PRESET_TEMPLATES.length} card styles` },
    { label: 'Aesthetic ID Cards', path: '/templates/aesthetic-id-cards', description: 'Travel passes, badges & credentials' },
    { label: 'Card Creator', path: '/create', description: 'Open the live typesetting editor' },
    { label: 'Canvas Studio', path: '/canvas', description: 'Open layered canvas workspace' },
    { label: 'Contact', path: '/contact', description: 'Report a broken link or bug' },
  ];

  return (
    <div className="w-full min-h-screen pt-8 sm:pt-12 pb-28 md:pb-20 flex flex-col transition-colors duration-200 text-[var(--app-text-primary)]">
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-16">
        <div className="studio-panel w-full max-w-2xl overflow-hidden">
          <div className="h-0.5 w-full bg-[var(--app-accent)]/40" />
          <div className="p-8 md:p-12 flex flex-col items-center gap-8">
            <div className="flex flex-col items-center gap-3">
              <div className="flex items-center justify-center w-20 h-20 rounded-2xl border border-[var(--app-border-subtle)] bg-[var(--app-surface-secondary)]">
                <AlertTriangle className="w-10 h-10 text-[var(--app-accent)]" />
              </div>
              <span className="text-7xl md:text-8xl font-medium tracking-tight leading-none select-none tabular-nums text-[var(--app-border-strong)] font-heading">
                404
              </span>
            </div>

            <div className="flex flex-col items-center gap-3 text-center max-w-md">
              <h1 className="text-2xl md:text-3xl font-medium font-heading tracking-tight text-[var(--app-text-primary)]">
                Not found
              </h1>
              <p className="text-sm leading-relaxed text-[var(--app-text-secondary)]">
                <code className="px-1.5 py-0.5 rounded text-[13px] font-mono bg-[var(--app-surface-secondary)] text-[var(--app-text-primary)] border border-[var(--app-border-subtle)]">
                  {currentPath}
                </code>
              </p>
            </div>

            <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-3">
              {suggestions.map((s) => (
                <a
                  key={s.path}
                  href={s.path}
                  className="p-3.5 rounded-xl border border-[var(--app-border-subtle)] bg-[var(--app-surface-secondary)] flex flex-col gap-1 transition-colors group hover:border-[var(--app-accent)]"
                >
                  <span className="text-[13px] font-semibold font-heading text-[var(--app-text-primary)] group-hover:text-[var(--app-accent)] transition-colors">
                    {s.label}
                  </span>
                </a>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3 w-full">
              <a
                href="/"
                className="studio-btn-primary btn-sheen interactive-tactile min-h-[44px] w-full !py-3 !text-sm text-center"
              >
                Return home
              </a>
              <a
                href="/create"
                className="studio-btn-secondary interactive-tactile min-h-[44px] w-full !py-3 !text-sm text-center"
              >
                Create card
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// --------------------------------------------------------------------------
// 10. RUNTIME / CRASH ERROR PAGE (500-style)
// --------------------------------------------------------------------------
interface ErrorViewProps {
  theme?: 'dark' | 'light';
  error?: Error | null;
  onRetry?: () => void;
}

export const ErrorView: React.FC<ErrorViewProps> = ({
  error,
  onRetry,
}) => {
  useEffect(() => {
    updatePageSEO({
      title: 'Something Went Wrong: Aesthetic Card Studio',
      description: 'An unexpected error occurred. Reload the page or return to the studio homepage.',
      canonicalPath: '/',
    });
  }, []);

  return (
    <div className="w-full min-h-screen pt-8 sm:pt-12 pb-28 md:pb-20 flex flex-col transition-colors duration-200 text-[var(--app-text-primary)]">
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-16">
        <div className="studio-panel w-full max-w-xl overflow-hidden">
          <div className="h-1.5 w-full bg-[var(--app-accent)]" />
          <div className="p-8 md:p-12 flex flex-col items-center gap-8">
            <div className="flex flex-col items-center gap-3">
              <div className="flex items-center justify-center w-20 h-20 rounded-2xl border border-[var(--app-border-subtle)] bg-[var(--app-surface-secondary)]">
                <AlertTriangle className="w-10 h-10 text-[var(--app-accent)]" />
              </div>
              <span className="text-7xl md:text-8xl font-medium tracking-tight leading-none select-none tabular-nums text-[var(--app-border-strong)] font-heading">
                500
              </span>
            </div>

            <div className="flex flex-col items-center gap-3 text-center">
              <h1 className="text-2xl md:text-3xl font-medium font-heading tracking-tight text-[var(--app-text-primary)]">
                Something went wrong
              </h1>
              <p className="text-sm leading-relaxed max-w-sm text-[var(--app-text-secondary)]">
                An unexpected error interrupted this page. Your saved data remains on this device; reload or return to the gallery.
              </p>
            </div>

            {error && error.message && (
              <div className="w-full p-4 rounded-xl border border-[var(--app-border-subtle)] bg-[var(--app-surface-secondary)] text-left">
                <span className="text-xs font-medium text-[var(--app-accent)] block mb-1.5 font-subheading">
                  Error details
                </span>
                <code className="text-[13px] font-mono text-[var(--app-text-primary)] break-all leading-relaxed">
                  {error.message}
                </code>
              </div>
            )}

            <div className="flex flex-col sm:flex-row items-center gap-3 w-full">
              {onRetry && (
                <button
                  onClick={onRetry}
                  className="studio-btn-primary min-h-[44px] w-full !py-3 !text-sm"
                >
                  Reload page
                </button>
              )}
              <a
                href="/"
                className="studio-btn-secondary min-h-[44px] w-full !py-3 !text-sm text-center"
              >
                Return home
              </a>
            </div>

            <p className="text-[13px] text-[var(--app-text-muted)] text-center font-subheading">
              If this keeps happening,{' '}
              <a href="/contact" className="underline hover:text-[var(--app-text-primary)]">contact support</a>{' '}
              or{' '}
              <button
                onClick={() => window.location.reload()}
                className="underline cursor-pointer hover:text-[var(--app-text-primary)]"
              >
                hard reload the page
              </button>.
            </p>
          </div>
        </div>

        <div className="mt-6 text-[13px] text-[var(--app-text-muted)] font-subheading">
          <span>Runtime error: your card drafts and local data remain intact</span>
        </div>
      </div>
    </div>
  );
};
