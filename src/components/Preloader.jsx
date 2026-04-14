import { useState, useEffect } from 'react';

export default function Preloader() {
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setHidden(true), 800);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div id="preloader" className={hidden ? 'hidden' : ''}>
      <div className="preloader-content">
        <div className="preloader-silhouette"></div>
        <h1 className="preloader-text">EcoSphere</h1>
      </div>
    </div>
  );
}
