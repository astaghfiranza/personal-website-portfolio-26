import React, { useState, useEffect } from 'react';

export const LOCAL_PLACEHOLDER_PATH = '/placeholder.svg';

export interface ImageWithPlaceholderProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src?: string | null;
  alt: string;
  placeholderSrc?: string;
  className?: string;
}

/**
 * Image component with customizable local placeholder support:
 * - Uses a local placeholder from `/public` during initial loading.
 * - Replaces placeholder with the Supabase/remote image once loaded.
 * - If image is empty or fails to load, gracefully retains the placeholder.
 * - Local placeholder is never stored or uploaded to Supabase.
 */
export const ImageWithPlaceholder: React.FC<ImageWithPlaceholderProps> = ({
  src,
  alt,
  placeholderSrc = LOCAL_PLACEHOLDER_PATH,
  className = '',
  loading = 'lazy',
  onError,
  onLoad,
  style,
  ...rest
}) => {
  const [activeSrc, setActiveSrc] = useState<string>(() => (src ? placeholderSrc : placeholderSrc));
  const [isLoaded, setIsLoaded] = useState<boolean>(false);
  const [hasError, setHasError] = useState<boolean>(false);

  useEffect(() => {
    // If no valid image URL provided, stay with placeholder
    if (!src || src.trim() === '') {
      setActiveSrc(placeholderSrc);
      setIsLoaded(true);
      setHasError(true);
      return;
    }

    // Reset load states
    setIsLoaded(false);
    setHasError(false);
    setActiveSrc(placeholderSrc);

    // Preload remote image
    const img = new Image();
    img.src = src;

    img.onload = () => {
      setActiveSrc(src);
      setIsLoaded(true);
      setHasError(false);
    };

    img.onerror = () => {
      setActiveSrc(placeholderSrc);
      setIsLoaded(true);
      setHasError(true);
    };

    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [src, placeholderSrc]);

  return (
    <img
      src={activeSrc}
      alt={alt}
      loading={loading}
      className={`${className} transition-opacity duration-300 ${isLoaded ? 'opacity-100' : 'opacity-90'}`}
      style={style}
      onError={(e) => {
        if (activeSrc !== placeholderSrc) {
          setActiveSrc(placeholderSrc);
          setHasError(true);
        }
        onError?.(e);
      }}
      onLoad={(e) => {
        onLoad?.(e);
      }}
      {...rest}
    />
  );
};
