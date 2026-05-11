import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

interface Feature {
  id: string;
  title: string;
  description: string;
  image?: string;
  ctaText?: string;
  ctaLink?: string;
  icon?: React.ReactNode;
  tag?: string;
}

interface FeatureCardProps {
  features?: Feature[];
  autoRotate?: boolean;
  rotateInterval?: number;
}

const FeatureCard: React.FC<FeatureCardProps> = ({
  features = [],
  autoRotate = true,
  rotateInterval = 5000,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (!autoRotate || !features || features.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % features.length);
    }, rotateInterval);
    return () => clearInterval(interval);
  }, [autoRotate, features, rotateInterval]);

  if (!features || features.length === 0) return null;

  const current = features[currentIndex];

  return (
    <div
      style={{
        position: 'relative',
        borderRadius: '16px',
        overflow: 'hidden',
        background: 'linear-gradient(135deg, #FF385C 0%, #E31C5F 50%, #c13584 100%)',
        boxShadow: '0 8px 32px rgba(227, 28, 95, 0.25)',
        fontFamily: "'Circular', 'Helvetica Neue', Arial, sans-serif",
      }}
    >
      {/* Subtle dot grid overlay */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.08) 1px, transparent 1px)',
          backgroundSize: '24px 24px',
          pointerEvents: 'none',
        }}
      />

      {/* Decorative lines background */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `
            repeating-linear-gradient(45deg, rgba(255,255,255,0.03) 0px, rgba(255,255,255,0.03) 2px, transparent 2px, transparent 8px),
            repeating-linear-gradient(-45deg, rgba(255,255,255,0.03) 0px, rgba(255,255,255,0.03) 2px, transparent 2px, transparent 8px)
          `,
          pointerEvents: 'none',
        }}
      />

      {/* Soft light blobs */}
      <div
        style={{
          position: 'absolute',
          top: '-40px',
          right: '-40px',
          width: '220px',
          height: '220px',
          borderRadius: '50%',
          background: 'rgba(255,255,255,0.08)',
          filter: 'blur(40px)',
          pointerEvents: 'none',
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: '-30px',
          left: '30%',
          width: '160px',
          height: '160px',
          borderRadius: '50%',
          background: 'rgba(255,255,255,0.05)',
          filter: 'blur(30px)',
          pointerEvents: 'none',
        }}
      />

      {/* Layout: content left, image overlapping right */}
      <div style={{ display: 'flex', alignItems: 'stretch', position: 'relative', zIndex: 1 }}>

        {/* LEFT: text content */}
        <div style={{ flex: 1, padding: '28px 28px 24px 28px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: '180px' }}>
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.35, ease: 'easeInOut' }}
              style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}
            >
              {/* Tag pill */}
              {/* <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '5px',
                    background: 'rgba(255,255,255,0.18)',
                    border: '1px solid rgba(255,255,255,0.25)',
                    borderRadius: '100px',
                    padding: '3px 10px 3px 8px',
                    fontSize: '11px',
                    fontWeight: 600,
                    color: '#fff',
                    letterSpacing: '0.03em',
                    textTransform: 'uppercase',
                  }}
                >
                  {current.icon && <span style={{ opacity: 0.9 }}>{current.icon}</span>}
                  {current.tag || current.title}
                </span>
              </div> */}

              {/* Title */}
              <h2
                style={{
                  margin: 0,
                  fontSize: '20px',
                  fontWeight: 700,
                  color: '#fff',
                  lineHeight: 1.25,
                  letterSpacing: '-0.02em',
                }}
              >
                {current.title}
              </h2>

              {/* Description */}
              <p
                style={{
                  margin: 0,
                  fontSize: '13px',
                  color: 'rgba(255,255,255,0.82)',
                  lineHeight: 1.6,
                  maxWidth: '340px',
                }}
              >
                {current.description}
              </p>
            </motion.div>
          </AnimatePresence>

          {/* Bottom: CTA + dots */}
          <div style={{ marginTop: '18px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <AnimatePresence mode="wait">
              <motion.div
                key={`cta-${currentIndex}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <Link
                  to={current.ctaLink || '/dashboard'}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '7px',
                    background: '#fff',
                    color: '#222',
                    fontWeight: 600,
                    fontSize: '13px',
                    borderRadius: '8px',
                    padding: '9px 18px',
                    textDecoration: 'none',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                    transition: 'transform 0.15s, box-shadow 0.15s',
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.transform = 'translateY(-1px)';
                    (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 14px rgba(0,0,0,0.2)';
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
                    (e.currentTarget as HTMLElement).style.boxShadow = '0 2px 8px rgba(0,0,0,0.15)';
                  }}
                >
                  {current.ctaText || 'Get Started'}
                  <ArrowRight size={14} />
                </Link>
              </motion.div>
            </AnimatePresence>

            {/* Slide dots */}
            {features.length > 1 && (
              <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                {features.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentIndex(idx)}
                    aria-label={`Go to slide ${idx + 1}`}
                    style={{
                      height: '3px',
                      width: idx === currentIndex ? '24px' : '8px',
                      borderRadius: '100px',
                      background: idx === currentIndex ? '#fff' : 'rgba(255,255,255,0.35)',
                      border: 'none',
                      padding: 0,
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT: image panel - overlapping to left */}
        <div
          style={{
            width: '220px',
            flexShrink: 0,
            position: 'relative',
            overflow: 'visible',
            marginRight: '38px',
          }}
        >
          {/* Fade on left edge to blend with content */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: '-60px',
              width: 'auto',
              height: '100%',              
              zIndex: 2,
              pointerEvents: 'none'              
            }}
          />

          <AnimatePresence mode="wait">
            <motion.img
              key={`img-${currentIndex}`}
              src={current.image || '/glass.png'}
              alt={current.title}
              initial={{ opacity: 0, scale: 1.04 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.97 }}
              transition={{ duration: 0.4, ease: 'easeInOut' }}
              style={{
                width: 'calc(100%)',                
                height: '100%',
                objectFit: 'cover',
                objectPosition: 'center',
                display: 'block',
              }}
            />
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default FeatureCard;