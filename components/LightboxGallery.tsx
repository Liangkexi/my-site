"use client";
import { useState } from "react";
import YALightbox from "yet-another-react-lightbox";
import Thumbnails from "yet-another-react-lightbox/plugins/thumbnails";
import "yet-another-react-lightbox/styles.css";
import "yet-another-react-lightbox/plugins/thumbnails.css";

interface LightboxGalleryProps {
  photos: string[];
  title?: string;
}

export default function LightboxGallery({ photos, title }: LightboxGalleryProps) {
  const [open, setOpen] = useState(false);
  const [index, setIndex] = useState(0);

  const slides = photos.map((src) => ({ src }));

  return (
    <>
      {/* Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: 8,
        }}
      >
        {photos.map((src, i) => (
          <div
            key={i}
            onClick={() => { setIndex(i); setOpen(true); }}
            style={{
              aspectRatio: "1",
              borderRadius: 8,
              overflow: "hidden",
              cursor: "zoom-in",
              background: "var(--thumb-bg)",
              border: "1px solid var(--border)",
            }}
          >
            <img
              src={src}
              alt={`${title || "photo"} ${i + 1}`}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                display: "block",
                transition: "transform 0.2s",
              }}
              onMouseEnter={(e) => ((e.currentTarget as HTMLImageElement).style.transform = "scale(1.04)")}
              onMouseLeave={(e) => ((e.currentTarget as HTMLImageElement).style.transform = "scale(1)")}
            />
          </div>
        ))}
      </div>

      {/* Lightbox */}
      <YALightbox
        open={open}
        close={() => setOpen(false)}
        slides={slides}
        index={index}
        plugins={[Thumbnails]}
        styles={{
          container: { backgroundColor: "rgba(0,0,0,0.92)" },
        }}
      />
    </>
  );
}
