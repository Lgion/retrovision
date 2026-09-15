import React, { useState, useEffect, useRef, useLayoutEffect } from 'react';

/**
 * GameScaleWrapper automatically scales down its children to fit within the parent element's dimensions,
 * maintaining the target design aspect ratio.
 * This prevents layout clipping, overlapping, and text overflowing on smaller viewports.
 */
export default function GameScaleWrapper({ children, designWidth = 430, defaultHeight = 850 }) {
  const outerRef = useRef(null);
  const innerRef = useRef(null);
  const [scale, setScale] = useState(1);
  const [designHeight, setDesignHeight] = useState(defaultHeight);

  // Function to measure children scrollHeight securely
  const measureHeight = () => {
    if (innerRef.current) {
      // Temporarily remove scale and height constraints to measure true natural height
      const oldTransform = innerRef.current.style.transform;
      const oldHeight = innerRef.current.style.height;
      innerRef.current.style.transform = 'none';
      innerRef.current.style.height = 'auto';
      
      const naturalHeight = innerRef.current.scrollHeight;
      
      innerRef.current.style.transform = oldTransform;
      innerRef.current.style.height = oldHeight;

      const newDesignHeight = Math.max(defaultHeight, naturalHeight);
      if (Math.abs(newDesignHeight - designHeight) > 2) {
        setDesignHeight(newDesignHeight);
      }
      return newDesignHeight;
    }
    return designHeight;
  };

  useEffect(() => {
    const handleResize = () => {
      if (!outerRef.current) return;
      const parent = outerRef.current.parentElement;
      if (!parent) return;

      const parentWidth = parent.clientWidth;
      const parentHeight = parent.clientHeight;

      const currentDesignHeight = measureHeight();

      // Compute required scale factor
      const scaleX = parentWidth / designWidth;
      const scaleY = parentHeight / currentDesignHeight;

      // Only scale down (max scale = 1) to keep design looking clean and sharp
      const newScale = Math.min(1, scaleX, scaleY);
      setScale(newScale);
    };

    const parent = outerRef.current?.parentElement;
    let resizeObserver;
    if (parent) {
      // Use ResizeObserver for accurate sizing, responsive to UI changes
      resizeObserver = new ResizeObserver(() => {
        handleResize();
      });
      resizeObserver.observe(parent);
    }

    let contentObserver;
    if (innerRef.current) {
      contentObserver = new ResizeObserver((entries) => {
        if (entries[0]) {
          const naturalHeight = Math.ceil(entries[0].contentRect.height);
          if (naturalHeight > 0) {
            setDesignHeight(Math.max(defaultHeight, naturalHeight));
          }
        }
        handleResize();
      });
      contentObserver.observe(innerRef.current);
    }

    window.addEventListener('resize', handleResize);
    // Timeout to make sure browser finished rendering initial fonts and layouts
    const timer = setTimeout(handleResize, 100);

    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(timer);
      if (resizeObserver && parent) {
        resizeObserver.unobserve(parent);
      }
      if (contentObserver && innerRef.current) {
        contentObserver.unobserve(innerRef.current);
      }
    };
  }, [designWidth, designHeight]);

  const scaledWidth = designWidth * scale;
  const scaledHeight = designHeight * scale;

  return (
    <div
      ref={outerRef}
      style={{
        width: `${scaledWidth}px`,
        height: `${scaledHeight}px`,
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        flexShrink: 0
      }}
    >
      <div
        ref={innerRef}
        style={{
          width: `${designWidth}px`,
          minHeight: `${designHeight}px`,
          position: 'absolute',
          top: 0,
          left: 0,
          transform: `scale(${scale})`,
          transformOrigin: 'top left',
          display: 'flex',
          flexDirection: 'column',
          boxSizing: 'border-box'
        }}
      >
        {children}
      </div>
    </div>
  );
}
