import React from 'react';
import { Moon, Sun } from 'lucide-react';

interface FooterProps {
  onNavigate?: (path: string) => void;
  theme?: 'dark' | 'light';
}

export const Footer: React.FC<FooterProps> = ({ theme = 'dark' }) => {
  const isLight = theme === 'light';

  return (
    <footer
      className={`w-full border-t transition-colors duration-200 mt-20 ${
        isLight
          ? 'bg-[#ffffff] border-[#e2e8f0] text-[#181a20]'
          : 'bg-[#111417] border-[#262c36] text-[#e1e2e7]'
      }`}
    >
      <div className="w-full max-w-6xl mx-auto px-4 md:px-8 py-12">
        <div className={`grid grid-cols-2 md:grid-cols-4 gap-8 pb-10 border-b ${isLight ? 'border-[#e2e8f0]' : 'border-[#1f242c]'}`}>
          {/* Column 1: Product */}
          <div className="flex flex-col gap-3">
            <span className={`text-xs uppercase tracking-wider font-semibold ${isLight ? 'text-[#0f172a]' : 'text-white'}`}>
              Product
            </span>
            <ul className={`flex flex-col gap-2 text-xs ${isLight ? 'text-[#64748b]' : 'text-[#9ca3af]'}`}>
              <li>
                <a
                  href="/create"
                  className={`hover:underline transition-colors cursor-pointer text-left block ${isLight ? 'hover:text-[#0f172a]' : 'hover:text-white'}`}
                >
                  Card Creator
                </a>
              </li>
              <li>
                <a
                  href="/templates"
                  className={`hover:underline transition-colors cursor-pointer text-left block ${isLight ? 'hover:text-[#0f172a]' : 'hover:text-white'}`}
                >
                  Template Library
                </a>
              </li>
              <li>
                <a
                  href="/templates/aesthetic-text-cards"
                  className={`hover:underline transition-colors cursor-pointer text-left block ${isLight ? 'hover:text-[#0f172a]' : 'hover:text-white'}`}
                >
                  Aesthetic Text Cards
                </a>
              </li>
              <li>
                <a
                  href="/templates/quote-cards"
                  className={`hover:underline transition-colors cursor-pointer text-left block ${isLight ? 'hover:text-[#0f172a]' : 'hover:text-white'}`}
                >
                  Quote Cards
                </a>
              </li>
              <li>
                <a
                  href="/templates/journal-cards"
                  className={`hover:underline transition-colors cursor-pointer text-left block ${isLight ? 'hover:text-[#0f172a]' : 'hover:text-white'}`}
                >
                  Journal Cards
                </a>
              </li>
              <li>
                <a
                  href="/templates/aesthetic-id-cards"
                  className={`hover:underline transition-colors cursor-pointer text-left block ${isLight ? 'hover:text-[#0f172a]' : 'hover:text-white'}`}
                >
                  Aesthetic ID Cards & Badges
                </a>
              </li>
            </ul>
          </div>

          {/* Column 2: Distinct Categories */}
          <div className="flex flex-col gap-3">
            <span className={`text-xs uppercase tracking-wider font-semibold ${isLight ? 'text-[#0f172a]' : 'text-white'}`}>
              Categories
            </span>
            <ul className={`flex flex-col gap-2 text-xs ${isLight ? 'text-[#64748b]' : 'text-[#9ca3af]'}`}>
              <li>
                <a
                  href="/templates/aesthetic-id-cards"
                  className={`hover:underline transition-colors cursor-pointer text-left block font-medium ${isLight ? 'text-[#d97706] hover:text-[#0f172a]' : 'text-[#fcd535] hover:text-white'}`}
                >
                  ★ Aesthetic ID Cards
                </a>
              </li>
              <li>
                <a
                  href="/templates/book-review-cards"
                  className={`hover:underline transition-colors cursor-pointer text-left block ${isLight ? 'hover:text-[#0f172a]' : 'hover:text-white'}`}
                >
                  Book Review Cards
                </a>
              </li>
              <li>
                <a
                  href="/templates/study-note-cards"
                  className={`hover:underline transition-colors cursor-pointer text-left block ${isLight ? 'hover:text-[#0f172a]' : 'hover:text-white'}`}
                >
                  Study Note Cards
                </a>
              </li>
              <li>
                <a
                  href="/templates/scrapbook-cards"
                  className={`hover:underline transition-colors cursor-pointer text-left block ${isLight ? 'hover:text-[#0f172a]' : 'hover:text-white'}`}
                >
                  Scrapbook Text Cards
                </a>
              </li>
              <li>
                <a
                  href="/templates/minimal-cards"
                  className={`hover:underline transition-colors cursor-pointer text-left block ${isLight ? 'hover:text-[#0f172a]' : 'hover:text-white'}`}
                >
                  Minimalist Cards
                </a>
              </li>
              <li>
                <a
                  href="/templates/social-text-cards"
                  className={`hover:underline transition-colors cursor-pointer text-left block ${isLight ? 'hover:text-[#0f172a]' : 'hover:text-white'}`}
                >
                  Social Text Cards (4:5)
                </a>
              </li>
            </ul>
          </div>

          {/* Column 3: Resources & Guides */}
          <div className="flex flex-col gap-3">
            <span className={`text-xs uppercase tracking-wider font-semibold ${isLight ? 'text-[#0f172a]' : 'text-white'}`}>
              Resources
            </span>
            <ul className={`flex flex-col gap-2 text-xs ${isLight ? 'text-[#64748b]' : 'text-[#9ca3af]'}`}>
              <li>
                <a
                  href="/blog"
                  className={`hover:underline transition-colors cursor-pointer text-left block font-medium ${isLight ? 'text-[#0f172a]' : 'text-white'}`}
                >
                  Studio Blog & Articles
                </a>
              </li>
              <li>
                <a
                  href="/guides"
                  className={`hover:underline transition-colors cursor-pointer text-left block ${isLight ? 'hover:text-[#0f172a]' : 'hover:text-white'}`}
                >
                  Educational Guides
                </a>
              </li>
              <li>
                <a
                  href="/faq"
                  className={`hover:underline transition-colors cursor-pointer text-left block ${isLight ? 'hover:text-[#0f172a]' : 'hover:text-white'}`}
                >
                  FAQ & Troubleshooting
                </a>
              </li>
              <li>
                <a
                  href="/guides/how-to-make-aesthetic-text-cards"
                  className={`hover:underline transition-colors cursor-pointer text-left block ${isLight ? 'hover:text-[#0f172a]' : 'hover:text-white'}`}
                >
                  How to Make Text Cards
                </a>
              </li>
              <li>
                <a
                  href="/guides/how-to-design-quote-cards"
                  className={`hover:underline transition-colors cursor-pointer text-left block ${isLight ? 'hover:text-[#0f172a]' : 'hover:text-white'}`}
                >
                  Designing Quote Cards
                </a>
              </li>
              <li>
                <a
                  href="/guides/card-sizes-for-social-media"
                  className={`hover:underline transition-colors cursor-pointer text-left block ${isLight ? 'hover:text-[#0f172a]' : 'hover:text-white'}`}
                >
                  Social Media Card Sizes
                </a>
              </li>
              <li>
                <a
                  href="/guides/typography-and-text-readability"
                  className={`hover:underline transition-colors cursor-pointer text-left block ${isLight ? 'hover:text-[#0f172a]' : 'hover:text-white'}`}
                >
                  Typography & Readability
                </a>
              </li>
            </ul>
          </div>

          {/* Column 4: Information & Trust */}
          <div className="flex flex-col gap-3">
            <span className={`text-xs uppercase tracking-wider font-semibold ${isLight ? 'text-[#0f172a]' : 'text-white'}`}>
              Information
            </span>
            <ul className={`flex flex-col gap-2 text-xs ${isLight ? 'text-[#64748b]' : 'text-[#9ca3af]'}`}>
              <li>
                <a
                  href="/about"
                  className={`hover:underline transition-colors cursor-pointer text-left block ${isLight ? 'hover:text-[#0f172a]' : 'hover:text-white'}`}
                >
                  About the Studio
                </a>
              </li>
              <li>
                <a
                  href="/contact"
                  className={`hover:underline transition-colors cursor-pointer text-left block ${isLight ? 'hover:text-[#0f172a]' : 'hover:text-white'}`}
                >
                  Contact & Support
                </a>
              </li>
              <li>
                <a
                  href="/privacy"
                  className={`hover:underline transition-colors cursor-pointer text-left block ${isLight ? 'hover:text-[#0f172a]' : 'hover:text-white'}`}
                >
                  Privacy Policy
                </a>
              </li>
              <li>
                <a
                  href="/terms"
                  className={`hover:underline transition-colors cursor-pointer text-left block ${isLight ? 'hover:text-[#0f172a]' : 'hover:text-white'}`}
                >
                  Terms of Use
                </a>
              </li>
              <li>
                <a
                  href="/cookies"
                  className={`hover:underline transition-colors cursor-pointer text-left block ${isLight ? 'hover:text-[#0f172a]' : 'hover:text-white'}`}
                >
                  Cookie Policy
                </a>
              </li>
              <li>
                <a
                  href="/accessibility"
                  className={`hover:underline transition-colors cursor-pointer text-left block ${isLight ? 'hover:text-[#0f172a]' : 'hover:text-white'}`}
                >
                  Accessibility
                </a>
              </li>
              <li>
                <a
                  href="/credits"
                  className={`hover:underline transition-colors cursor-pointer text-left block ${isLight ? 'hover:text-[#0f172a]' : 'hover:text-white'}`}
                >
                  Asset & Font Credits
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className={`pt-6 flex flex-col md:flex-row items-center justify-between gap-4 text-xs ${isLight ? 'text-[#64748b]' : 'text-[#707a8a]'}`}>
          <div>
            © 2026 Aesthetic Card Studio. Client-side typesetting press for writers, readers, and visual curators.
          </div>
          <div className={`flex items-center gap-2 ${isLight ? 'text-[#334155]' : 'text-[#c4c7c8]'}`}>
            <span className="w-2 h-2 rounded-full bg-[#0ecb81] animate-pulse"></span>
            <span>Zero server dependencies • 100% Client-Side</span>
          </div>
          <div className="flex items-center gap-1.5">
            {isLight ? <Sun className="w-3.5 h-3.5 text-[#d97706]" /> : <Moon className="w-3.5 h-3.5 text-[#fcd535]" />}
            <span>Workspace: {isLight ? 'Daylight Light' : 'Obsidian Dark'}</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
