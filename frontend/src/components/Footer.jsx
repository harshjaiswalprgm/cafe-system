import { MapPin, Phone, Instagram, Facebook, Linkedin } from "lucide-react";

export default function Footer() {
  return (
    <footer className="relative overflow-hidden bg-[#f4f1ee] text-slate-800">
      {/* TOP BORDER */}
      <div className="h-2 bg-orange-500" />

      {/* MAIN CONTENT */}
      <div className="max-w-7xl mx-auto px-6 py-16">
        {/* GRID */}
        <div className="grid lg:grid-cols-4 gap-12 items-start">
          {/* MAP / LOCATION */}
          <div className="lg:col-span-1 space-y-4">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-orange-600">
              Visit Us
            </h3>

            <div className="rounded-2xl overflow-hidden shadow-lg border border-black/10">
              <iframe
                title="Asha Cafe Location"
                src="https://www.google.com/maps?q=Koramangala%20Bangalore&output=embed"
                className="w-full h-48"
                loading="lazy"
              />
            </div>

            <p className="text-sm flex items-center gap-2">
              <MapPin size={16} /> Koramangala, Bengaluru
            </p>

            <p className="text-sm flex items-center gap-2">
              <Phone size={16} /> +91 9XXXXXXXXX
            </p>

            {/* SOCIAL */}
            <div className="flex gap-3 pt-2">
              <a className="footer-social">
                <Instagram size={16} />
              </a>
              <a className="footer-social">
                <Facebook size={16} />
              </a>
              <a className="footer-social">
                <Linkedin size={16} />
              </a>
            </div>
          </div>

          {/* SITEMAP */}
          <div>
            <h3 className="footer-title">Sitemap</h3>
            <ul className="footer-list">
              <li>Home</li>
              <li>Menu</li>
              <li>Gallery</li>
              <li>Reviews</li>
              <li>Contact</li>
            </ul>
          </div>

          {/* SERVICES */}
          <div>
            <h3 className="footer-title">Services</h3>
            <ul className="footer-list">
              <li>Dine-in</li>
              <li>Takeaway</li>
              <li>Bulk Orders</li>
              <li>Events</li>
              <li>QR Ordering</li>
            </ul>
          </div>

          {/* ABOUT */}
          <div>
            <h3 className="footer-title">Asha Café</h3>
            <p className="text-sm leading-relaxed text-slate-600">
              A modern café experience with QR-based ordering, fresh food,
              zero waiting, and a warm community vibe.
            </p>
          </div>
        </div>

        {/* BIG BRAND */}
        <div className="relative mt-20">
          <h1 className="footer-brand">asha café</h1>
        </div>

        {/* COPYRIGHT */}
        <div className="mt-6 flex flex-col md:flex-row justify-between text-xs text-slate-500">
          <p>© {new Date().getFullYear()} Asha Café. All rights reserved.</p>
          <p>Designed with ☕ in Bengaluru</p>
        </div>
      </div>

      {/* STYLES */}
      <style>{`
        .footer-title {
          font-size: 13px;
          font-weight: 600;
          margin-bottom: 10px;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: #ea580c;
        }

        .footer-list li {
          font-size: 14px;
          margin-bottom: 8px;
          cursor: pointer;
          transition: color 0.2s ease;
        }

        .footer-list li:hover {
          color: #ea580c;
        }

        .footer-social {
          height: 36px;
          width: 36px;
          border-radius: 999px;
          background: white;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 14px rgba(0,0,0,0.08);
          transition: transform 0.25s ease, background 0.25s ease;
          cursor: pointer;
        }

        .footer-social:hover {
          transform: translateY(-3px);
          background: #fed7aa;
        }

        .footer-brand {
          font-size: clamp(4rem, 18vw, 12rem);
          font-weight: 900;
          line-height: 1;
          text-transform: lowercase;
          color: rgba(234, 88, 12, 0.9);
          letter-spacing: -0.04em;
          user-select: none;
          animation: rise 1s ease-out;
        }

        @keyframes rise {
          from {
            transform: translateY(40px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
      `}</style>
    </footer>
  );
}
