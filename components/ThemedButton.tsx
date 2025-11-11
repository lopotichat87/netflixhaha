import { motion } from 'framer-motion';

interface ThemedButtonProps {
  variant?: 'primary' | 'secondary' | 'accent' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  gradient?: boolean;
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
}

export default function ThemedButton({ 
  variant = 'primary', 
  size = 'md', 
  gradient = false, 
  className = '', 
  children, 
  onClick,
  disabled = false,
  type = 'button',
}: ThemedButtonProps) {
  const baseClasses = 'font-semibold rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed';
  
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  };
  
  const variantClasses = {
    primary: gradient 
      ? 'text-white shadow-lg hover:shadow-xl' 
      : 'bg-[var(--color-primary)] hover:opacity-90 text-white shadow-md hover:shadow-lg',
    secondary: 'bg-[var(--color-secondary)] hover:opacity-90 text-white shadow-md hover:shadow-lg',
    accent: 'bg-[var(--color-accent)] hover:opacity-90 text-white shadow-md hover:shadow-lg',
    outline: 'btn-outline-theme',
    ghost: 'text-[var(--color-primary)] hover:bg-[var(--color-primary)]/10',
  };
  
  const gradientStyle = gradient && variant === 'primary' 
    ? { background: 'var(--gradient-button)' } 
    : {};

  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
      style={gradientStyle}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      {children}
    </motion.button>
  );
}
