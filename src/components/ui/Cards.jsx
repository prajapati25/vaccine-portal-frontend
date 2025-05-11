// src/components/ui/Card.jsx
const Card = ({ children, className = "" }) => {
    return (
      <div className={`bg-white rounded-2xl shadow p-5 ${className}`}>
        {children}
      </div>
    );
  };
  
  const CardContent = ({ children, className = "" }) => {
    return <div className={`p-2 ${className}`}>{children}</div>;
  };
  
  export { Card, CardContent };
  