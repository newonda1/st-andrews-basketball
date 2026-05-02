import React, { useEffect, useState } from "react";

function imageDetails(image, index, fallbackTitle) {
  if (typeof image === "string") {
    return {
      src: image,
      alt: `${fallbackTitle} clipping ${index + 1}`,
      caption: "",
    };
  }

  return {
    src: image?.src,
    alt: image?.alt || `${fallbackTitle} clipping ${index + 1}`,
    caption: image?.caption || "",
  };
}

function RecapImageGallery({ images, title }) {
  const [activeImage, setActiveImage] = useState(null);
  const [zoom, setZoom] = useState(100);

  const normalizedImages = Array.isArray(images)
    ? images
        .map((image, index) => imageDetails(image, index, title))
        .filter((image) => image.src)
    : [];

  useEffect(() => {
    if (!activeImage) return undefined;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event) => {
      if (event.key === "Escape") setActiveImage(null);
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [activeImage]);

  const openImage = (image) => {
    setActiveImage(image);
    setZoom(200);
  };

  const closeImage = () => {
    setActiveImage(null);
    setZoom(100);
  };

  if (!normalizedImages.length) return null;

  return (
    <>
      <div className="mt-4 flex flex-wrap justify-center gap-4">
        {normalizedImages.map((image) => (
          <figure key={image.src} className="mx-auto w-full max-w-5xl space-y-2">
            <button
              type="button"
              onClick={() => openImage(image)}
              className="block w-full cursor-zoom-in rounded border border-gray-200 bg-white p-0 text-left shadow-sm transition hover:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              aria-label={`Open ${image.alt} full screen`}
            >
              <img src={image.src} alt={image.alt} className="block h-auto w-full rounded" />
            </button>
            {image.caption && (
              <figcaption className="text-center text-sm text-gray-600">
                {image.caption}
              </figcaption>
            )}
          </figure>
        ))}
      </div>

      {activeImage && (
        <div
          className="fixed inset-0 z-[100] bg-black text-white"
          role="dialog"
          aria-modal="true"
          aria-label={activeImage.alt}
        >
          <div className="fixed left-0 right-0 top-0 z-[101] flex items-center justify-between gap-3 border-b border-white/20 bg-black/90 px-3 py-2">
            <div className="min-w-0 text-sm font-semibold">
              <span className="block truncate">{activeImage.caption || activeImage.alt}</span>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <button
                type="button"
                onClick={() => setZoom((value) => Math.max(100, value - 50))}
                className="h-10 w-10 border border-white/30 text-lg font-bold"
                aria-label="Zoom out"
                title="Zoom out"
              >
                -
              </button>
              <button
                type="button"
                onClick={() => setZoom(100)}
                className="h-10 px-3 border border-white/30 text-sm font-bold"
                aria-label="Fit image"
                title="Fit image"
              >
                Fit
              </button>
              <button
                type="button"
                onClick={() => setZoom((value) => Math.min(300, value + 50))}
                className="h-10 w-10 border border-white/30 text-lg font-bold"
                aria-label="Zoom in"
                title="Zoom in"
              >
                +
              </button>
              <button
                type="button"
                onClick={closeImage}
                className="h-10 w-10 border border-white/30 text-lg font-bold"
                aria-label="Close full screen image"
                title="Close"
              >
                x
              </button>
            </div>
          </div>
          <div className="h-full overflow-auto px-3 pb-8 pt-16">
            <img
              src={activeImage.src}
              alt={activeImage.alt}
              className="mx-auto block h-auto max-w-none"
              style={{ width: `${zoom}%` }}
            />
          </div>
        </div>
      )}
    </>
  );
}

export default RecapImageGallery;
