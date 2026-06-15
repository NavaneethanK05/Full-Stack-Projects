const Loader = ({ size = 24, className = '' }) => (
  <div
    className={`animate-spin rounded-full border-2 border-border border-t-mint ${className}`}
    style={{ width: size, height: size }}
  />
);

export default Loader;
