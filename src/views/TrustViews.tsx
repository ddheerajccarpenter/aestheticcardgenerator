import React, { useEffect } from 'react';
import { updatePageSEO } from '../utils/seo';
import { AdSlot } from '../components/AdSlot';
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
} from 'lucide-react';

interface TrustViewBaseProps {
  onNavigate?: (path: string) => void;
  theme?: 'dark' | 'light';
}

// --------------------------------------------------------------------------
// 1. ABOUT PAGE (/about) — Warm Nano-Textured Colophon Card
// --------------------------------------------------------------------------
export const AboutView: React.FC<TrustViewBaseProps> = ({ theme = 'dark' }) => {
  const isLight = theme === 'light';

  useEffect(() => {
    updatePageSEO({
      title: 'About — Aesthetic Card Studio',
      description:
        'Local-first card press and studio designed to format words, poetry, and aesthetic ID cards with tactile dignity.',
      canonicalPath: '/about',
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  return (
    <div className={`w-full pt-20 pb-20 transition-colors duration-200 ${isLight ? 'text-[#1a1612]' : 'text-[#efe6d5]'}`}>
      <div className="max-w-4xl mx-auto px-4 md:px-8 flex flex-col gap-8">
        <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-[#707a8a]">
          <a href="/" className="hover:underline cursor-pointer">Home</a>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className={`font-semibold ${isLight ? 'text-[#1a1612]' : 'text-white'}`}>About</span>
        </nav>

        {/* Warm Nano-Textured Colophon Card (Part 9.2) */}
        <div
          className={`p-6 sm:p-10 rounded-3xl border shadow-2xl relative overflow-hidden ${
            isLight
              ? 'bg-[#f2eadc] border-[#d8cbb7] text-[#1a1612]'
              : 'bg-[#181512] border-[#2e2620] text-[#efe6d5]'
          }`}
        >
          {/* Nano-texture grain overlay */}
          <div className="absolute inset-0 card-noise opacity-20 pointer-events-none" />

          <header className="flex flex-col gap-3 border-b pb-6 border-current/15 relative z-10">
            <span className="text-xs uppercase font-bold tracking-widest text-[#d97706] dark:text-[#fcd535] font-subheading">
              Studio Colophon &amp; Manifesto
            </span>
            <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight font-heading">
              Aesthetic Card Studio
            </h1>
            <p className="text-sm md:text-base leading-relaxed opacity-90 max-w-2xl font-body">
              An independent, local-first card press created for writers, readers, visual curators, and designers.
            </p>
          </header>

          {/* Strict 2-Column Grid Architecture (Part 9.2) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-8 relative z-10">
            {/* Column 1: Local-First Architecture */}
            <div className={`p-6 rounded-2xl border flex flex-col justify-between ${
              isLight ? 'bg-white/60 border-black/10' : 'bg-black/30 border-white/10'
            }`}>
              <div>
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#0ecb81] block mb-2">
                  01 • LOCAL-FIRST MEMORY
                </span>
                <h2 className="text-lg font-bold mb-2 font-heading">
                  Zero Cloud Uploads
                </h2>
                <p className="text-xs leading-relaxed opacity-85">
                  Your private notes, quotes, and photos never touch a remote server or AI database. All rendering is computed directly inside browser memory via Canvas, SVG, and WebGL.
                </p>
              </div>
              <div className="pt-4 mt-4 border-t border-current/10 text-[11px] font-mono opacity-70">
                100% Client-Side Privacy
              </div>
            </div>

            {/* Column 2: Archival 4K–16K Output */}
            <div className={`p-6 rounded-2xl border flex flex-col justify-between ${
              isLight ? 'bg-white/60 border-black/10' : 'bg-black/30 border-white/10'
            }`}>
              <div>
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#fcd535] block mb-2">
                  02 • PRINT-GRADE FIDELITY
                </span>
                <h2 className="text-lg font-bold mb-2 font-heading">
                  4K to 16K Ultra-HD Output
                </h2>
                <p className="text-xs leading-relaxed opacity-85">
                  Over 55 procedural paper surfaces, custom local font uploads, and offline background removal render natively at archival resolutions with zero bitmap blur.
                </p>
              </div>
              <div className="pt-4 mt-4 border-t border-current/10 text-[11px] font-mono opacity-70">
                True High-DPI Vector Export
              </div>
            </div>
          </div>

          {/* Exact Ownership Notice Replacement (Part 1.2 & 9.2) */}
          <div className="p-4 rounded-xl border border-current/20 bg-black/5 dark:bg-white/5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs relative z-10">
            <span className="font-semibold">
              Crafted independently. Questions or feedback: ddheerajcarpenter@gmail.com
            </span>
            <a
              href="mailto:ddheerajcarpenter@gmail.com?subject=Aesthetic%20Card%20Studio%20Feedback"
              className="underline font-bold text-current hover:opacity-80 shrink-0"
            >
              Contact Owner →
            </a>
          </div>
        </div>

        <AdSlot slotId="about-bottom-slot" />
      </div>
    </div>
  );
};

// --------------------------------------------------------------------------
// 2. CONTACT PAGE (/contact) — Direct Owner Contact (Part 9.3)
// --------------------------------------------------------------------------
export const ContactView: React.FC<TrustViewBaseProps> = ({ theme = 'dark' }) => {
  const isLight = theme === 'light';
  const [copiedEmail, setCopiedEmail] = React.useState(false);

  const handleCopyEmail = () => {
    navigator.clipboard.writeText('ddheerajcarpenter@gmail.com');
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2000);
  };

  useEffect(() => {
    updatePageSEO({
      title: 'Contact & Feedback — Aesthetic Card Studio',
      description:
        'Direct contact with the creator of Aesthetic Card Studio. Send questions, feature suggestions, and bug reports.',
      canonicalPath: '/contact',
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  return (
    <div className={`w-full pt-20 pb-20 transition-colors duration-200 ${isLight ? 'text-[#0f172a]' : 'text-[#f4f1ea]'}`}>
      <div className="max-w-4xl mx-auto px-4 md:px-8 flex flex-col gap-8">
        <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-[#707a8a]">
          <a href="/" className="hover:underline cursor-pointer">Home</a>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className={`font-semibold ${isLight ? 'text-[#0f172a]' : 'text-white'}`}>Contact</span>
        </nav>

        <header className="flex flex-col gap-3 border-b pb-6 border-current/15">
          <span className="text-xs uppercase font-bold tracking-widest text-[#d97706] dark:text-[#fcd535] font-subheading">
            Direct Communication
          </span>
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight font-heading">
            Contact &amp; Feedback
          </h1>
          <p className="text-sm md:text-base leading-relaxed text-[#707a8a]">
            Connect directly with the independent developer behind Aesthetic Card Studio.
          </p>
        </header>

        {/* 2-Column Contact Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Card 1: Official Email Block */}
          <div className={`p-6 sm:p-8 rounded-3xl border flex flex-col justify-between shadow-xl ${
            isLight ? 'bg-white border-[#e2e8f0]' : 'bg-[#181d24] border-[#262c36]'
          }`}>
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2.5">
                <Mail className="w-5 h-5 text-[#fcd535]" />
                <h2 className="text-base font-bold font-heading">Direct Email</h2>
              </div>
              <p className="text-xs text-[#707a8a] leading-relaxed">
                Send feedback, template requests, or bugs directly to the project owner:
              </p>
              <div className="p-3 rounded-xl bg-black/5 dark:bg-black/30 border border-current/10 font-mono text-xs font-bold text-current select-all">
                ddheerajcarpenter@gmail.com
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 pt-6">
              <a
                href="mailto:ddheerajcarpenter@gmail.com?subject=Aesthetic%20Card%20Studio%20Feedback"
                className={`flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold shadow-md cursor-pointer ${
                  isLight
                    ? 'bg-[#0f172a] text-white hover:bg-[#1e293b]'
                    : 'bg-[#fcd535] text-[#0b0e11] hover:bg-[#ffe270]'
                }`}
              >
                <Mail className="w-4 h-4" />
                <span>Send Direct Email</span>
              </a>

              <button
                onClick={handleCopyEmail}
                type="button"
                className={`inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl border text-xs font-semibold cursor-pointer transition-colors ${
                  isLight
                    ? 'bg-white border-[#cbd5e1] text-[#0f172a] hover:bg-slate-50'
                    : 'bg-[#12151b] border-[#323946] text-white hover:bg-[#1c222b]'
                }`}
              >
                {copiedEmail ? <Check className="w-3.5 h-3.5 text-[#0ecb81]" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedEmail ? 'Copied ddheerajcarpenter@gmail.com' : 'Copy Email'}</span>
              </button>
            </div>
          </div>

          {/* Card 2: GitHub & Issue Tracker */}
          <div className={`p-6 sm:p-8 rounded-3xl border flex flex-col justify-between shadow-xl ${
            isLight ? 'bg-white border-[#e2e8f0]' : 'bg-[#181d24] border-[#262c36]'
          }`}>
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2.5">
                <span className="w-2 h-2 rounded-full bg-[#0ecb81]" />
                <h2 className="text-base font-bold font-heading">Issue Tracking</h2>
              </div>
              <p className="text-xs text-[#707a8a] leading-relaxed">
                Found a rendering bug or have a suggestion? Open an issue on GitHub or browse existing templates:
              </p>
              <ul className="text-xs text-[#707a8a] flex flex-col gap-1.5 pl-4 list-disc">
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
                className={`w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border text-xs font-semibold cursor-pointer transition-colors ${
                  isLight
                    ? 'border-[#cbd5e1] hover:bg-slate-50 text-[#0f172a]'
                    : 'border-[#323946] hover:bg-[#1c222b] text-white'
                }`}
              >
                <span>Open Issue on GitHub →</span>
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
export const FaqView: React.FC<TrustViewBaseProps> = ({ theme = 'dark' }) => {
  const isLight = theme === 'light';

  useEffect(() => {
    updatePageSEO({
      title: 'Frequently Asked Questions — Aesthetic Card Studio',
      description:
        'Answers to common questions about card creation, export resolutions, local privacy, supported fonts, and browser compatibility.',
      canonicalPath: '/faq',
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const faqItems = [
    {
      q: 'Does this app send my text or photos to any server?',
      a: 'Never. The generator runs 100% on client-side browser technology. Your words, custom fonts, and exported cards never touch a database or external API.',
    },
    {
      q: 'Can I customize the typography, margins, and paper textures?',
      a: 'Yes. The Studio Editor provides full granular control over font families (Newsreader, Playfair, Inter, JetBrains Mono), optical font sizes, alignment, padding, border radius, and analog film-grain layers.',
    },
    {
      q: 'What resolution are the downloaded cards?',
      a: 'Cards are exported at crisp 2x Retina resolution (up to 2160x2160 or 2160x2700 pixels depending on aspect ratio), perfectly formatted for Instagram posts, Stories, Twitter, and print.',
    },
    {
      q: 'Can I export in different aspect ratios?',
      a: 'Yes, you can toggle between 1:1 Square, 4:5 Social Portrait, 9:16 Story/Reel, and 16:9 Landscape with a single click, and all typography reflows proportionally.',
    },
    {
      q: 'How does draft saving work if there is no database?',
      a: 'Your card state is stored locally in your browser storage (localStorage). When you reload the page, your in-progress card is restored automatically without transmitting your words anywhere.',
    },
    {
      q: 'Can I use these cards for commercial projects and book covers?',
      a: 'Yes. The cards you generate with your own text are your intellectual property. All built-in fonts are open-source and licensed under SIL Open Font License.',
    },
    {
      q: 'Why does the exported image look sharper than my screen preview?',
      a: 'During export, the rendering engine rasterizes your card at double pixel density (pixelRatio: 2) to match high-DPI smartphone displays, ensuring hairline borders and serifs never pixelate.',
    },
  ];

  return (
    <div className={`w-full pt-20 pb-16 transition-colors duration-200 ${isLight ? 'bg-[#f8fafc] text-[#0f172a]' : 'bg-[#0b0e11] text-[#e1e2e7]'}`}>
      <div className="max-w-3xl mx-auto px-4 md:px-8 flex flex-col gap-8">
        <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-[#707a8a]">
          <a href="/" className="hover:underline cursor-pointer">Home</a>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className={`font-medium ${isLight ? 'text-[#0f172a]' : 'text-white'}`}>FAQ</span>
        </nav>

        <header className="flex flex-col gap-3 border-b pb-6 border-[#262c36]/40">
          <span className="text-xs uppercase font-semibold tracking-wider text-[#d97706] dark:text-[#fcd535]">
            Knowledge Base
          </span>
          <h1 className={`text-3xl md:text-5xl font-bold tracking-tight ${isLight ? 'text-[#0f172a]' : 'text-white'}`}>
            Frequently Asked Questions
          </h1>
          <p className={`text-base leading-relaxed ${isLight ? 'text-[#475569]' : 'text-[#9ca3af]'}`}>
            Everything you need to know about typography, export settings, browser storage, and privacy.
          </p>
        </header>

        <div className="flex flex-col gap-4">
          {faqItems.map((item, idx) => (
            <div
              key={idx}
              className={`p-5 rounded-2xl border flex flex-col gap-2 ${
                isLight ? 'bg-white border-[#e2e8f0]' : 'bg-[#14171d] border-[#262c36]'
              }`}
            >
              <h2 className={`text-sm font-bold ${isLight ? 'text-[#0f172a]' : 'text-white'}`}>
                {item.q}
              </h2>
              <p className={`text-xs leading-relaxed ${isLight ? 'text-[#475569]' : 'text-[#9ca3af]'}`}>
                {item.a}
              </p>
            </div>
          ))}
        </div>

        <AdSlot slotId="faq-bottom-slot" />
      </div>
    </div>
  );
};

// --------------------------------------------------------------------------
// 4. PRIVACY POLICY (/privacy)
// --------------------------------------------------------------------------
export const PrivacyView: React.FC<TrustViewBaseProps> = ({ theme = 'dark' }) => {
  const isLight = theme === 'light';

  useEffect(() => {
    updatePageSEO({
      title: 'Privacy Policy — Aesthetic Card Studio',
      description:
        'Privacy Policy for Aesthetic Card Studio. Detailed disclosure of client-side browser processing, local storage, and future advertising disclosures.',
      canonicalPath: '/privacy',
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  return (
    <div className={`w-full pt-20 pb-16 transition-colors duration-200 ${isLight ? 'bg-[#f8fafc] text-[#0f172a]' : 'bg-[#0b0e11] text-[#e1e2e7]'}`}>
      <div className="max-w-3xl mx-auto px-4 md:px-8 flex flex-col gap-8">
        <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-[#707a8a]">
          <a href="/" className="hover:underline cursor-pointer">Home</a>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className={`font-medium ${isLight ? 'text-[#0f172a]' : 'text-white'}`}>Privacy Policy</span>
        </nav>

        <header className="flex flex-col gap-3 border-b pb-6 border-[#262c36]/40">
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-[#0ecb81]" />
            <span className="text-xs uppercase font-semibold tracking-wider text-[#0ecb81]">
              Legal Transparency
            </span>
          </div>
          <h1 className={`text-3xl md:text-5xl font-bold tracking-tight ${isLight ? 'text-[#0f172a]' : 'text-white'}`}>
            Privacy Policy
          </h1>
          <p className="text-xs font-mono text-[#707a8a]">
            Effective Date: October 2026 • [Draft Document requiring site owner verification prior to production launch]
          </p>
        </header>

        <div className="flex flex-col gap-6 text-xs md:text-sm leading-relaxed">
          <section className="flex flex-col gap-2">
            <h2 className={`text-base font-bold ${isLight ? 'text-[#0f172a]' : 'text-white'}`}>
              1. Overview of Our Client-Side Architecture
            </h2>
            <p className={isLight ? 'text-[#334155]' : 'text-[#c4c7c8]'}>
              Aesthetic Card Studio ("we", "us", or "our") operates as a client-side web application. We do not require user accounts, email addresses, passwords, or cloud database storage to provide our card generation services.
            </p>
          </section>

          <section className="flex flex-col gap-2">
            <h2 className={`text-base font-bold ${isLight ? 'text-[#0f172a]' : 'text-white'}`}>
              2. Processing of Text and Card Content
            </h2>
            <p className={isLight ? 'text-[#334155]' : 'text-[#c4c7c8]'}>
              Any text, quotes, author names, or folio metadata that you type or paste into the Studio Editor is processed strictly inside your local web browser's volatile memory. This data is never transmitted to, stored on, or processed by any remote application servers operated by us.
            </p>
          </section>

          <section className="flex flex-col gap-2">
            <h2 className={`text-base font-bold ${isLight ? 'text-[#0f172a]' : 'text-white'}`}>
              3. Local Browser Storage (localStorage)
            </h2>
            <p className={isLight ? 'text-[#334155]' : 'text-[#c4c7c8]'}>
              To prevent accidental work loss upon page refresh, our application utilizes your browser's local storage mechanism (localStorage key: <code>aesthetic_card_studio_draft</code>) to persist your active card settings locally on your machine. You may clear this draft at any time by clicking the "clear" link in the studio toolbar.
            </p>
          </section>

          <section className="flex flex-col gap-2">
            <h2 className={`text-base font-bold ${isLight ? 'text-[#0f172a]' : 'text-white'}`}>
              4. External Content Delivery Networks (CDNs)
            </h2>
            <p className={isLight ? 'text-[#334155]' : 'text-[#c4c7c8]'}>
              To render high-quality typography, our website fetches open-source web fonts from Google Fonts (Newsreader, Playfair Display, Inter, JetBrains Mono). When your browser loads these fonts, standard HTTP connection metadata (such as IP address and user-agent string) is transmitted to Google's CDN servers according to Google's standard network infrastructure practices.
            </p>
          </section>

          <section className="flex flex-col gap-2">
            <h2 className={`text-base font-bold ${isLight ? 'text-[#0f172a]' : 'text-white'}`}>
              5. Advertising Disclosures (Google AdSense Readiness)
            </h2>
            <p className={isLight ? 'text-[#334155]' : 'text-[#c4c7c8]'}>
              In the future, this website may display advertisements served by Google or other third-party advertising partners. When advertising services are enabled:
            </p>
            <ul className="flex flex-col gap-2 pl-4 list-disc text-xs text-[#707a8a]">
              <li>Third-party vendors, including Google, use cookies to serve ads based on a user's prior visits to this website or other websites.</li>
              <li>Google's use of advertising cookies enables it and its partners to serve ads to users based on their visit to our site and/or other sites on the Internet.</li>
              <li>Users may opt out of personalized advertising by visiting Google's <a href="https://www.google.com/settings/ads" target="_blank" rel="noreferrer" className="underline text-current">Ads Settings</a>.</li>
            </ul>
          </section>

          <section className="flex flex-col gap-2">
            <h2 className={`text-base font-bold ${isLight ? 'text-[#0f172a]' : 'text-white'}`}>
              6. Contact Information
            </h2>
            <p className={isLight ? 'text-[#334155]' : 'text-[#c4c7c8]'}>
              If you have any questions regarding this Privacy Policy, please contact the site maintainer at <a href="mailto:ddheerajcarpenter@gmail.com" className="text-[#3b82f6] hover:underline font-mono">ddheerajcarpenter@gmail.com</a>.
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
export const TermsView: React.FC<TrustViewBaseProps> = ({ theme = 'dark' }) => {
  const isLight = theme === 'light';

  useEffect(() => {
    updatePageSEO({
      title: 'Terms of Use — Aesthetic Card Studio',
      description:
        'Terms of use for Aesthetic Card Studio. Permitted usage, intellectual property guidelines, and liability limitations.',
      canonicalPath: '/terms',
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  return (
    <div className={`w-full pt-20 pb-16 transition-colors duration-200 ${isLight ? 'bg-[#f8fafc] text-[#0f172a]' : 'bg-[#0b0e11] text-[#e1e2e7]'}`}>
      <div className="max-w-3xl mx-auto px-4 md:px-8 flex flex-col gap-8">
        <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-[#707a8a]">
          <a href="/" className="hover:underline cursor-pointer">Home</a>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className={`font-medium ${isLight ? 'text-[#0f172a]' : 'text-white'}`}>Terms of Use</span>
        </nav>

        <header className="flex flex-col gap-3 border-b pb-6 border-[#262c36]/40">
          <span className="text-xs uppercase font-semibold tracking-wider text-[#d97706] dark:text-[#fcd535]">
            Usage Agreement
          </span>
          <h1 className={`text-3xl md:text-5xl font-bold tracking-tight ${isLight ? 'text-[#0f172a]' : 'text-white'}`}>
            Terms of Use
          </h1>
          <p className="text-xs font-mono text-[#707a8a]">
            Last Updated: October 2026
          </p>
        </header>

        <div className="flex flex-col gap-6 text-xs md:text-sm leading-relaxed">
          <section className="flex flex-col gap-2">
            <h2 className={`text-base font-bold ${isLight ? 'text-[#0f172a]' : 'text-white'}`}>
              1. Permitted Use
            </h2>
            <p className={isLight ? 'text-[#334155]' : 'text-[#c4c7c8]'}>
              Aesthetic Card Studio is provided free of charge for personal and commercial typography generation. You may use generated card graphics in social media posts, presentations, marketing materials, and publications, subject to your own rights in the underlying text content.
            </p>
          </section>

          <section className="flex flex-col gap-2">
            <h2 className={`text-base font-bold ${isLight ? 'text-[#0f172a]' : 'text-white'}`}>
              2. User Content Responsibility
            </h2>
            <p className={isLight ? 'text-[#334155]' : 'text-[#c4c7c8]'}>
              You retain full ownership of any text or quotes you input into the application. You are solely responsible for ensuring that your submitted words do not infringe on copyrights, trademarks, or third-party intellectual property rights.
            </p>
          </section>

          <section className="flex flex-col gap-2">
            <h2 className={`text-base font-bold ${isLight ? 'text-[#0f172a]' : 'text-white'}`}>
              3. Disclaimer of Warranty
            </h2>
            <p className={isLight ? 'text-[#334155]' : 'text-[#c4c7c8]'}>
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
export const CookieView: React.FC<TrustViewBaseProps> = ({ theme = 'dark' }) => {
  const isLight = theme === 'light';

  useEffect(() => {
    updatePageSEO({
      title: 'Cookie Policy — Aesthetic Card Studio',
      description:
        'Cookie Policy for Aesthetic Card Studio. Detailed explanation of browser local storage and third-party advertising cookies.',
      canonicalPath: '/cookies',
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  return (
    <div className={`w-full pt-20 pb-16 transition-colors duration-200 ${isLight ? 'bg-[#f8fafc] text-[#0f172a]' : 'bg-[#0b0e11] text-[#e1e2e7]'}`}>
      <div className="max-w-3xl mx-auto px-4 md:px-8 flex flex-col gap-8">
        <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-[#707a8a]">
          <a href="/" className="hover:underline cursor-pointer">Home</a>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className={`font-medium ${isLight ? 'text-[#0f172a]' : 'text-white'}`}>Cookie Policy</span>
        </nav>

        <header className="flex flex-col gap-3 border-b pb-6 border-[#262c36]/40">
          <div className="flex items-center gap-2">
            <Cookie className="w-4 h-4 text-[#d97706] dark:text-[#fcd535]" />
            <span className="text-xs uppercase font-semibold tracking-wider text-[#d97706] dark:text-[#fcd535]">
              Storage Practices
            </span>
          </div>
          <h1 className={`text-3xl md:text-5xl font-bold tracking-tight ${isLight ? 'text-[#0f172a]' : 'text-white'}`}>
            Cookie & Storage Policy
          </h1>
          <p className="text-xs font-mono text-[#707a8a]">
            Audited October 2026
          </p>
        </header>

        <div className="flex flex-col gap-6 text-xs md:text-sm leading-relaxed">
          <section className="flex flex-col gap-2">
            <h2 className={`text-base font-bold ${isLight ? 'text-[#0f172a]' : 'text-white'}`}>
              1. First-Party Cookies
            </h2>
            <p className={isLight ? 'text-[#334155]' : 'text-[#c4c7c8]'}>
              At present, our core application does not set first-party HTTP cookies. We utilize browser <code>localStorage</code> strictly to store your interface theme preference (dark/light) and your in-progress card draft so your work is not lost on refresh.
            </p>
          </section>

          <section className="flex flex-col gap-2">
            <h2 className={`text-base font-bold ${isLight ? 'text-[#0f172a]' : 'text-white'}`}>
              2. Third-Party Advertising Cookies
            </h2>
            <p className={isLight ? 'text-[#334155]' : 'text-[#c4c7c8]'}>
              If Google AdSense or another advertising provider is enabled in the future, third-party cookies will be placed by advertising partners to serve personalized and non-personalized advertisements based on your browsing history. You can control or disable cookies via your browser settings at any time.
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
export const AccessibilityView: React.FC<TrustViewBaseProps> = ({ theme = 'dark' }) => {
  const isLight = theme === 'light';

  useEffect(() => {
    updatePageSEO({
      title: 'Accessibility Statement — Aesthetic Card Studio',
      description:
        'Accessibility commitment for Aesthetic Card Studio. WCAG AAA touch targets, keyboard navigation, and high-contrast colorways.',
      canonicalPath: '/accessibility',
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  return (
    <div className={`w-full pt-20 pb-16 transition-colors duration-200 ${isLight ? 'bg-[#f8fafc] text-[#0f172a]' : 'bg-[#0b0e11] text-[#e1e2e7]'}`}>
      <div className="max-w-3xl mx-auto px-4 md:px-8 flex flex-col gap-8">
        <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-[#707a8a]">
          <a href="/" className="hover:underline cursor-pointer">Home</a>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className={`font-medium ${isLight ? 'text-[#0f172a]' : 'text-white'}`}>Accessibility</span>
        </nav>

        <header className="flex flex-col gap-3 border-b pb-6 border-[#262c36]/40">
          <div className="flex items-center gap-2">
            <Eye className="w-4 h-4 text-[#0ecb81]" />
            <span className="text-xs uppercase font-semibold tracking-wider text-[#0ecb81]">
              Inclusion & Standards
            </span>
          </div>
          <h1 className={`text-3xl md:text-5xl font-bold tracking-tight ${isLight ? 'text-[#0f172a]' : 'text-white'}`}>
            Accessibility Statement
          </h1>
          <p className={`text-base leading-relaxed ${isLight ? 'text-[#475569]' : 'text-[#9ca3af]'}`}>
            Our commitment to ensuring digital typography tools remain usable for all readers and creators.
          </p>
        </header>

        <div className="flex flex-col gap-6 text-xs md:text-sm leading-relaxed">
          <section className="flex flex-col gap-2">
            <h2 className={`text-base font-bold ${isLight ? 'text-[#0f172a]' : 'text-white'}`}>
              Implemented Accessibility Features
            </h2>
            <ul className="flex flex-col gap-2 pl-4 list-disc text-xs text-[#707a8a]">
              <li><strong>Keyboard Navigation:</strong> All critical workflows support keyboard shortcuts, including Command Palette (⌘K), Undo (⌘Z), Redo (⌘Shift+Z), and dialog dismissal via Escape.</li>
              <li><strong>WCAG Touch Targets:</strong> Interactive toolbar buttons and template cards maintain at least 44x44px bounding hit areas.</li>
              <li><strong>Semantic HTML Landmarks:</strong> Pages use standard HTML5 landmarks (header, nav, main, article, section, footer) for screen reader navigation.</li>
              <li><strong>Color Contrast:</strong> Both Dark (Obsidian) and Light (Daylight) modes meet WCAG AA/AAA contrast ratios for text readability.</li>
            </ul>
          </section>

          <section className="flex flex-col gap-2">
            <h2 className={`text-base font-bold ${isLight ? 'text-[#0f172a]' : 'text-white'}`}>
              Reporting Accessibility Barriers
            </h2>
            <p className={isLight ? 'text-[#334155]' : 'text-[#c4c7c8]'}>
              If you encounter any difficulty navigating or operating any control on this website, please email us at <a href="mailto:ddheerajcarpenter@gmail.com" className="text-[#3b82f6] hover:underline font-mono">ddheerajcarpenter@gmail.com</a> so we can promptly address the issue.
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
export const CreditsView: React.FC<TrustViewBaseProps> = ({ theme = 'dark' }) => {
  const isLight = theme === 'light';

  useEffect(() => {
    updatePageSEO({
      title: 'Asset & Font Credits — Aesthetic Card Studio',
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
    <div className={`w-full pt-20 pb-16 transition-colors duration-200 ${isLight ? 'bg-[#f8fafc] text-[#0f172a]' : 'bg-[#0b0e11] text-[#e1e2e7]'}`}>
      <div className="max-w-3xl mx-auto px-4 md:px-8 flex flex-col gap-8">
        <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-[#707a8a]">
          <a href="/" className="hover:underline cursor-pointer">Home</a>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className={`font-medium ${isLight ? 'text-[#0f172a]' : 'text-white'}`}>Credits</span>
        </nav>

        <header className="flex flex-col gap-3 border-b pb-6 border-[#262c36]/40">
          <div className="flex items-center gap-2">
            <Award className="w-4 h-4 text-[#d97706] dark:text-[#fcd535]" />
            <span className="text-xs uppercase font-semibold tracking-wider text-[#d97706] dark:text-[#fcd535]">
              Open Source Attributions
            </span>
          </div>
          <h1 className={`text-3xl md:text-5xl font-bold tracking-tight ${isLight ? 'text-[#0f172a]' : 'text-white'}`}>
            Asset & Font Credits
          </h1>
          <p className={`text-base leading-relaxed ${isLight ? 'text-[#475569]' : 'text-[#9ca3af]'}`}>
            Transparent attribution for all external fonts, icons, and software libraries used in this project.
          </p>
        </header>

        <div className="flex flex-col gap-4">
          {credits.map((c, idx) => (
            <div
              key={idx}
              className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-2 ${
                isLight ? 'bg-white border-[#e2e8f0]' : 'bg-[#14171d] border-[#262c36]'
              }`}
            >
              <div>
                <h2 className={`text-sm font-bold ${isLight ? 'text-[#0f172a]' : 'text-white'}`}>
                  {c.name}
                </h2>
                <p className="text-xs text-[#707a8a]">{c.purpose}</p>
              </div>
              <div className="flex items-center gap-2 text-[11px] font-mono shrink-0">
                <span className="opacity-75">{c.author}</span>
                <span className="px-1.5 py-0.5 rounded border border-current/20 text-[#0ecb81]">
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
export const NotFoundView: React.FC<TrustViewBaseProps> = ({ theme = 'dark' }) => {
  const isLight = theme === 'light';
  const currentPath = typeof window !== 'undefined' ? window.location.pathname : '/404';

  useEffect(() => {
    updatePageSEO({
      title: 'Page Not Found (404) — Aesthetic Card Studio',
      description: 'The requested page could not be found. Return to home or browse our aesthetic template gallery.',
      canonicalPath: '/404',
    });
  }, []);

  const suggestions = [
    { label: 'Homepage', path: '/', description: 'Explore templates and design system' },
    { label: 'Template Library', path: '/templates', description: 'Browse all 18 curated styles' },
    { label: 'Aesthetic ID Cards', path: '/templates/aesthetic-id-cards', description: 'Travel passes, soulmate badges & more' },
    { label: 'Card Creator', path: '/create', description: 'Open the live typesetting editor' },
    { label: 'Studio Blog', path: '/blog', description: 'Typography essays and design guides' },
    { label: 'Contact', path: '/contact', description: 'Report a broken link or bug' },
  ];

  return (
    <div className={`w-full min-h-screen pt-20 pb-20 flex flex-col transition-colors duration-200 ${
      isLight ? 'bg-[#f8fafc] text-[#0f172a]' : 'bg-[#0b0e11] text-[#e1e2e7]'
    }`}>
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-16">
        <div className={`w-full max-w-2xl rounded-3xl border shadow-2xl overflow-hidden ${
          isLight ? 'bg-white border-[#e2e8f0]' : 'bg-[#181d24] border-[#262c36]'
        }`}>
          <div className="h-1.5 w-full bg-gradient-to-r from-[#d97706] via-[#f59e0b] to-[#fcd535]" />
          <div className="p-8 md:p-12 flex flex-col items-center gap-8">
            <div className="flex flex-col items-center gap-3">
              <div className={`relative flex items-center justify-center w-24 h-24 rounded-3xl border-2 ${
                isLight ? 'bg-[#fff7ed] border-[#fed7aa]' : 'bg-[#1c1410] border-[#451a03]'
              }`}>
                <AlertTriangle className="w-12 h-12 text-[#d97706]" />
              </div>
              <span className={`text-8xl font-black tracking-tighter leading-none select-none ${
                isLight ? 'text-[#e2e8f0]' : 'text-[#1f242c]'
              }`}>
                404
              </span>
            </div>

            <div className="flex flex-col items-center gap-3 text-center max-w-md">
              <h1 className={`text-2xl md:text-3xl font-bold tracking-tight ${
                isLight ? 'text-[#0f172a]' : 'text-white'
              }`}>
                Page Not Found
              </h1>
              <p className={`text-sm leading-relaxed ${isLight ? 'text-[#475569]' : 'text-[#9ca3af]'}`}>
                The URL{' '}
                <code className={`px-1.5 py-0.5 rounded text-xs font-mono ${
                  isLight ? 'bg-[#f1f5f9] text-[#334155]' : 'bg-[#0b0e11] text-[#94a3b8]'
                }`}>
                  {currentPath}
                </code>{' '}
                does not exist or has been moved. Use the links below to navigate back to the studio.
              </p>
            </div>

            <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-3">
              {suggestions.map((s) => (
                <a
                  key={s.path}
                  href={s.path}
                  className={`p-3.5 rounded-xl border flex flex-col gap-1 transition-all group hover:-translate-y-0.5 ${
                    isLight
                      ? 'bg-[#f8fafc] border-[#e2e8f0] hover:border-[#d97706] hover:bg-white'
                      : 'bg-[#0b0e11] border-[#262c36] hover:border-[#fcd535]/40 hover:bg-[#14171d]'
                  }`}
                >
                  <span className={`text-xs font-bold group-hover:text-[#d97706] dark:group-hover:text-[#fcd535] transition-colors ${
                    isLight ? 'text-[#0f172a]' : 'text-white'
                  }`}>
                    {s.label}
                  </span>
                  <span className="text-[10px] text-[#707a8a] leading-snug">{s.description}</span>
                </a>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3 w-full">
              <a
                href="/"
                className={`w-full py-3 px-6 rounded-xl text-sm font-bold text-center cursor-pointer shadow-lg transition-all active:scale-[0.98] ${
                  isLight
                    ? 'bg-[#0f172a] text-white hover:bg-[#1e293b]'
                    : 'bg-white text-[#0b0e11] hover:bg-[#e2e2e2]'
                }`}
              >
                Back to Homepage
              </a>
              <a
                href="/create"
                className={`w-full py-3 px-6 rounded-xl text-sm font-semibold text-center cursor-pointer border transition-all active:scale-[0.98] ${
                  isLight
                    ? 'bg-white border-[#e2e8f0] text-[#0f172a] hover:border-[#d97706]'
                    : 'bg-[#181d24] border-[#262c36] text-white hover:border-[#fcd535]/40'
                }`}
              >
                Open Studio
              </a>
            </div>
          </div>
        </div>

        <div className="mt-6 flex items-center gap-2 text-xs text-[#707a8a]">
          <span className="w-2 h-2 rounded-full bg-[#0ecb81] animate-pulse" />
          <span>Studio is running normally — this URL simply does not exist</span>
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
  theme = 'dark',
  error,
  onRetry,
}) => {
  const isLight = theme === 'light';

  useEffect(() => {
    updatePageSEO({
      title: 'Something Went Wrong — Aesthetic Card Studio',
      description: 'An unexpected error occurred. Reload the page or return to the studio homepage.',
      canonicalPath: '/',
    });
  }, []);

  return (
    <div className={`w-full min-h-screen pt-20 pb-20 flex flex-col transition-colors duration-200 ${
      isLight ? 'bg-[#f8fafc] text-[#0f172a]' : 'bg-[#0b0e11] text-[#e1e2e7]'
    }`}>
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-16">
        <div className={`w-full max-w-xl rounded-3xl border shadow-2xl overflow-hidden ${
          isLight ? 'bg-white border-[#e2e8f0]' : 'bg-[#181d24] border-[#262c36]'
        }`}>
          <div className="h-1.5 w-full bg-gradient-to-r from-[#ef4444] via-[#f97316] to-[#d97706]" />
          <div className="p-8 md:p-12 flex flex-col items-center gap-8">
            <div className="flex flex-col items-center gap-3">
              <div className={`flex items-center justify-center w-24 h-24 rounded-3xl border-2 ${
                isLight ? 'bg-[#fef2f2] border-[#fecaca]' : 'bg-[#1c1010] border-[#7f1d1d]'
              }`}>
                <AlertTriangle className="w-12 h-12 text-[#ef4444]" />
              </div>
              <span className={`text-8xl font-black tracking-tighter leading-none select-none ${
                isLight ? 'text-[#e2e8f0]' : 'text-[#1f242c]'
              }`}>
                500
              </span>
            </div>

            <div className="flex flex-col items-center gap-3 text-center">
              <h1 className={`text-2xl md:text-3xl font-bold tracking-tight ${
                isLight ? 'text-[#0f172a]' : 'text-white'
              }`}>
                Something Went Wrong
              </h1>
              <p className={`text-sm leading-relaxed max-w-sm ${
                isLight ? 'text-[#475569]' : 'text-[#9ca3af]'
              }`}>
                An unexpected error crashed this page. Your data is safe — nothing was uploaded to any server. Try reloading or return to the homepage.
              </p>
            </div>

            {error && error.message && (
              <div className={`w-full p-4 rounded-xl border text-left ${
                isLight ? 'bg-[#fff1f2] border-[#fecaca]' : 'bg-[#0b0e11] border-[#7f1d1d]/40'
              }`}>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#ef4444] block mb-1.5">
                  Error Details
                </span>
                <code className="text-[11px] font-mono text-[#dc2626] dark:text-[#f87171] break-all leading-relaxed">
                  {error.message}
                </code>
              </div>
            )}

            <div className="flex flex-col sm:flex-row items-center gap-3 w-full">
              {onRetry && (
                <button
                  onClick={onRetry}
                  className={`w-full py-3 px-6 rounded-xl text-sm font-bold cursor-pointer shadow-lg transition-all active:scale-[0.98] ${
                    isLight
                      ? 'bg-[#0f172a] text-white hover:bg-[#1e293b]'
                      : 'bg-white text-[#0b0e11] hover:bg-[#e2e2e2]'
                  }`}
                >
                  Try Again
                </button>
              )}
              <a
                href="/"
                className={`w-full py-3 px-6 rounded-xl text-sm font-semibold text-center cursor-pointer border transition-all active:scale-[0.98] ${
                  onRetry
                    ? isLight
                      ? 'bg-white border-[#e2e8f0] text-[#0f172a] hover:border-[#ef4444]'
                      : 'bg-[#181d24] border-[#262c36] text-white hover:border-[#ef4444]/40'
                    : isLight
                    ? 'bg-[#0f172a] text-white hover:bg-[#1e293b]'
                    : 'bg-white text-[#0b0e11] hover:bg-[#e2e2e2]'
                }`}
              >
                Back to Homepage
              </a>
            </div>

            <p className="text-[11px] text-[#707a8a] text-center">
              If this keeps happening,{' '}
              <a href="/contact" className="underline hover:text-current">contact support</a>{' '}
              or{' '}
              <button
                onClick={() => window.location.reload()}
                className="underline cursor-pointer hover:text-current"
              >
                hard reload the page
              </button>.
            </p>
          </div>
        </div>

        <div className="mt-6 flex items-center gap-2 text-xs text-[#707a8a]">
          <span className="w-2 h-2 rounded-full bg-[#ef4444]" />
          <span>Runtime error — your card drafts and local data are unaffected</span>
        </div>
      </div>
    </div>
  );
};
