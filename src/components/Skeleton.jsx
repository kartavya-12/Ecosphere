import './Skeleton.css';

export function Skeleton({ width = '100%', height = '20px', borderRadius = '4px', className = '' }) {
  return (
    <div 
      className={`skeleton-loader ${className}`} 
      style={{ width, height, borderRadius }}
    />
  );
}

export function CardSkeleton() {
  return (
    <div className="skeleton-card card">
      <Skeleton width="60%" height="24px" className="mb-10" />
      <Skeleton width="100%" height="16px" className="mb-5" />
      <Skeleton width="100%" height="16px" className="mb-5" />
      <Skeleton width="40%" height="16px" />
    </div>
  );
}
