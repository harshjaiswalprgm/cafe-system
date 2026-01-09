import { useEffect, useState } from "react";

/* 🔥 IMAGE FEED DATA */
const IMAGES = [
  "https://images.unsplash.com/photo-1504674900247-0877df9cc836",
  "https://images.unsplash.com/photo-1550547660-d9450f859349",
  "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4",
  "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085",
  "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38",
  "https://images.unsplash.com/photo-1521017432531-fbd92d768814",
  "https://images.unsplash.com/photo-1606755962773-d324e0a13086",
  "https://images.unsplash.com/photo-1550317138-10000687a72b",
  "https://images.unsplash.com/photo-1511920170033-f8396924c348",
  "https://images.unsplash.com/photo-1509042239860-f550ce710b93",
];

export default function ImageFeed() {
  const [images, setImages] = useState(IMAGES);
  const [fade, setFade] = useState(false);

  /* 🔄 AUTO MERGE EVERY 2s */
  useEffect(() => {
    const interval = setInterval(() => {
      setFade(true);

      setTimeout(() => {
        setImages((prev) => {
          const copy = [...prev];
          copy.push(copy.shift()); // rotate feed
          return copy;
        });
        setFade(false);
      }, 500);
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  return (
    <section className="py-28 bg-white overflow-hidden">
      {/* HEADER */}
      <div className="text-center mb-16">
        <p className="text-xs uppercase tracking-[0.35em] text-slate-400 mb-3">
          IMAGE FEED
        </p>
        <h2 className="text-4xl md:text-5xl font-black text-slate-900">
          Café Moments
        </h2>
        <p className="mt-4 text-sm text-slate-600">
          Fresh food. Fresh memories.
        </p>
      </div>

      {/* GRID */}
      <div className="max-w-7xl mx-auto px-6">
        <div
          className={`columns-2 md:columns-3 lg:columns-4 gap-6 space-y-6 transition-all duration-700 ${
            fade ? "opacity-40 scale-[0.99]" : "opacity-100 scale-100"
          }`}
        >
          {images.slice(0, 8).map((src, i) => (
            <div
              key={i}
              className="overflow-hidden rounded-3xl break-inside-avoid shadow-lg hover:shadow-2xl transition"
            >
              <img
                src={src}
                alt=""
                className="w-full object-cover hover:scale-110 transition duration-700"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
