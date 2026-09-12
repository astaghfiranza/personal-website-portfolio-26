import React, { useState, useEffect } from 'react';

export const LOCAL_PLACEHOLDER_PATH = '/placeholder.svg';

export interface ImageWithPlaceholderProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src?: string | null;
  alt: string;
  fallbackSrc?: string | null;
  placeholderSrc?: string;
  className?: string;
}

/**
 * Image component with local static image & placeholder fallback architecture:
 * 1. For local assets (starting with '/'), displays the local image immediately.
 * 2. When given a remote Supabase URL with a local fallbackSrc, displays the local
 *    fallback immediately so the public frontend renders instantly without layout shift.
 * 3. Preloads the remote Supabase image in the background, smoothly transitioning to it
 *    once loaded.
 * 4. If Supabase is unavailable, empty, or fails to load, gracefully retains the local
 *    static image (or SVG placeholder).
 * 5. Stable aspect ratio and dimensions to prevent layout shifts.
 */
export const ImageWithPlaceholder: React.FC<ImageWithPlaceholderProps> = ({
  src,
  alt,
  fallbackSrc,
  placeholderSrc = LOCAL_PLACEHOLDER_PATH,
  className = '',
  loading = 'lazy',
  onError,
  onLoad,
  style,
  ...rest
}) => {
  const effectiveFallback = fallbackSrc && fallbackSrc.trim() !== '' ? fallbackSrc : placeholderSrc;

  // Determine starting source:
  // If src is already a local asset, render it immediately.
  // If src is remote, render fallbackSrc immediately while remote preloads.
  const getInitialSrc = () => {
    if (!src || src.trim() === '') {
      return effectiveFallback;
    }
    if (src.startsWith('/') || src.startsWith('data:')) {
      return src;
    }
    // Remote image: start with local fallback to avoid blocking or empty frames
    return effectiveFallback;
  };

  const [activeSrc, setActiveSrc] = useState<string>(getInitialSrc);
  const [isLoaded, setIsLoaded] = useState<boolean>(false);
  const [hasError, setHasError] = useState<boolean>(false);

  useEffect(() => {
    // If no valid image URL provided, stay with fallback
    if (!src || src.trim() === '') {
      setActiveSrc(effectiveFallback);
      setIsLoaded(true);
      setHasError(false);
      return;
    }

    // If src is a local static asset or data URL, use it immediately
    if (src.startsWith('/') || src.startsWith('data:')) {
      setActiveSrc(src);
      setIsLoaded(true);
      setHasError(false);
      return;
    }

    // If src is remote (Supabase / CDN), keep showing fallback while preloading remote image
    setHasError(false);
    setIsLoaded(false);

    const img = new Image();
    img.src = src;

    img.onload = () => {
      setActiveSrc(src);
      setIsLoaded(true);
      setHasError(false);
    };

    img.onerror = () => {
      // Remote image failed: stay with local fallback
      setActiveSrc(effectiveFallback);
      setIsLoaded(true);
      setHasError(true);
    };

    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [src, effectiveFallback]);

  return (
    <img
      src={activeSrc}
      alt={alt}
      loading={loading}
      className={`${className} transition-opacity duration-300 ${isLoaded ? 'opacity-100' : 'opacity-95'}`}
      style={style}
      onError={(e) => {
        if (activeSrc !== effectiveFallback) {
          setActiveSrc(effectiveFallback);
          setHasError(true);
        } else if (activeSrc !== placeholderSrc) {
          setActiveSrc(placeholderSrc);
          setHasError(true);
        }
        onError?.(e);
      }}
      onLoad={(e) => {
        setIsLoaded(true);
        onLoad?.(e);
      }}
      {...rest}
    />
  );
};
