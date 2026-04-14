import { useEffect, useRef } from 'react';

export default function ScrollReveal({ children, className = '', as = 'div', ...props }) {
  const ref = useRef(null);
  const Component = as;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('active');
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <Component ref={ref} className={`scroll-reveal ${className}`} {...props}>
      {children}
    </Component>
  );
}


