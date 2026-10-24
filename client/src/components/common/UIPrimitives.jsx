import React from 'react';

export const Button = ({
  children,
  variant = 'primary', // 'primary', 'secondary', 'outline', 'ghost', 'danger', 'soft'
  size = 'md',        // 'sm', 'md', 'lg'
  icon: Icon,
  iconPosition = 'left',
  loading = false,
  disabled = false,
  onClick,
  type = 'button',
  className = '',
  style = {},
  ...props
}) => {
  const baseStyle = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    borderRadius: 'var(--radius-md)',
    fontWeight: '500',
    fontFamily: 'inherit',
    border: '1px solid transparent',
    cursor: disabled || loading ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.55 : 1,
    transition: 'all 0.18s cubic-bezier(0.16, 1, 0.3, 1)',
    textDecoration: 'none',
    whiteSpace: 'nowrap',
    ...style
  };

  const sizeStyles = {
    sm: { padding: '6px 12px', fontSize: 'var(--font-size-xs)' },
    md: { padding: '9px 18px', fontSize: 'var(--font-size-sm)' },
    lg: { padding: '12px 24px', fontSize: 'var(--font-size-base)' }
  }[size];

  const variantStyles = {
    primary: {
      backgroundColor: 'var(--color-primary-teal)',
      color: 'var(--color-text-inverse)',
      borderColor: 'var(--color-primary-teal)',
      boxShadow: '0 2px 6px rgba(10, 65, 116, 0.25)'
    },
    secondary: {
      backgroundColor: 'var(--color-secondary-teal)',
      color: 'var(--color-text-inverse)',
      borderColor: 'var(--color-secondary-teal)'
    },
    outline: {
      backgroundColor: 'transparent',
      color: 'var(--color-primary-teal)',
      borderColor: 'var(--color-border)',
      borderWidth: '1.5px'
    },
    soft: {
      backgroundColor: 'var(--color-bg-pale-aqua)',
      color: 'var(--color-primary-teal)',
      borderColor: 'rgba(73, 118, 159, 0.35)'
    },
    ghost: {
      backgroundColor: 'transparent',
      color: 'var(--color-text-secondary)',
      borderColor: 'transparent'
    },
    danger: {
      backgroundColor: 'var(--color-error)',
      color: 'var(--color-text-inverse)',
      borderColor: 'var(--color-error)'
    }
  }[variant];

  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      style={{ ...baseStyle, ...sizeStyles, ...variantStyles }}
      className={`ui-button ${className}`}
      {...props}
    >
      {loading ? (
        <span style={{ display: 'inline-block', animation: 'spin 1s linear infinite' }}>⟳</span>
      ) : (
        <>
          {Icon && iconPosition === 'left' && <Icon size={size === 'sm' ? 14 : 16} />}
          {children}
          {Icon && iconPosition === 'right' && <Icon size={size === 'sm' ? 14 : 16} />}
        </>
      )}
    </button>
  );
};

export const Card = ({
  children,
  title,
  subtitle,
  action,
  headerBorder = true,
  className = '',
  style = {},
  onClick,
  ...props
}) => {
  return (
    <div
      style={{
        backgroundColor: 'var(--color-bg-card)',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--color-border-subtle)',
        boxShadow: 'var(--shadow-card)',
        overflow: 'hidden',
        transition: 'transform 0.15s ease, box-shadow 0.15s ease',
        ...style
      }}
      className={`ui-card ${className}`}
      onClick={onClick}
      {...props}
    >
      {(title || subtitle || action) && (
        <div
          style={{
            padding: '18px 24px',
            borderBottom: headerBorder ? '1px solid var(--color-border-subtle)' : 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '16px'
          }}
        >
          <div>
            {title && <h3 style={{ margin: 0, fontSize: 'var(--font-size-md)', color: 'var(--color-text-primary)' }}>{title}</h3>}
            {subtitle && <p style={{ margin: '3px 0 0', fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)' }}>{subtitle}</p>}
          </div>
          {action && <div>{action}</div>}
        </div>
      )}
      <div style={{ padding: '24px' }}>
        {children}
      </div>
    </div>
  );
};

export const Badge = ({
  children,
  variant = 'default', // 'success', 'warning', 'danger', 'info', 'teal', 'gray'
  size = 'sm',
  style = {},
  ...props
}) => {
  const variantStyles = {
    success: {
      backgroundColor: 'var(--color-success-bg)',
      color: 'var(--color-success)',
      borderColor: 'var(--color-success-border)'
    },
    warning: {
      backgroundColor: 'var(--color-warning-bg)',
      color: 'var(--color-warning)',
      borderColor: 'var(--color-warning-border)'
    },
    danger: {
      backgroundColor: 'var(--color-error-bg)',
      color: 'var(--color-error)',
      borderColor: 'var(--color-error-border)'
    },
    info: {
      backgroundColor: 'var(--color-info-bg)',
      color: 'var(--color-info)',
      borderColor: 'var(--color-info-border)'
    },
    teal: {
      backgroundColor: 'var(--color-bg-pale-aqua)',
      color: 'var(--color-primary-teal)',
      borderColor: 'rgba(73, 118, 159, 0.35)'
    },
    blue: {
      backgroundColor: 'var(--color-bg-pale-aqua)',
      color: 'var(--color-primary-teal)',
      borderColor: 'rgba(73, 118, 159, 0.35)'
    },
    gray: {
      backgroundColor: '#F1F4F4',
      color: 'var(--color-text-secondary)',
      borderColor: 'var(--color-border)'
    },
    blood: {
      backgroundColor: 'var(--color-blood-bg)',
      color: 'var(--color-blood-crimson)',
      borderColor: 'var(--color-blood-border)'
    }
  }[variant] || {};

  const sizeStyles = {
    sm: { padding: '2px 8px', fontSize: '0.72rem' },
    md: { padding: '4px 12px', fontSize: '0.8125rem' }
  }[size];

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px',
        fontWeight: '600',
        borderRadius: 'var(--radius-full)',
        border: '1px solid',
        textTransform: 'uppercase',
        letterSpacing: '0.03em',
        ...variantStyles,
        ...sizeStyles,
        ...style
      }}
      {...props}
    >
      {children}
    </span>
  );
};

export const Input = ({
  label,
  error,
  helperText,
  icon: Icon,
  required = false,
  style = {},
  className = '',
  ...props
}) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', width: '100%' }}>
      {label && (
        <label style={{ fontSize: 'var(--font-size-sm)', fontWeight: '500', color: 'var(--color-text-primary)' }}>
          {label} {required && <span style={{ color: 'var(--color-error)' }}>*</span>}
        </label>
      )}
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
        {Icon && (
          <span style={{ position: 'absolute', left: '12px', color: 'var(--color-text-muted)', pointerEvents: 'none' }}>
            <Icon size={16} />
          </span>
        )}
        <input
          style={{
            width: '100%',
            padding: Icon ? '9px 12px 9px 38px' : '9px 14px',
            borderRadius: 'var(--radius-md)',
            border: `1.5px solid ${error ? 'var(--color-error)' : 'var(--color-border)'}`,
            backgroundColor: '#FFFFFF',
            fontSize: 'var(--font-size-base)',
            color: 'var(--color-text-primary)',
            transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
            ...style
          }}
          className={`ui-input ${className}`}
          {...props}
        />
      </div>
      {error && <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-error)' }}>{error}</span>}
      {helperText && !error && <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)' }}>{helperText}</span>}
    </div>
  );
};

export const Select = ({
  label,
  error,
  options = [],
  required = false,
  style = {},
  className = '',
  ...props
}) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', width: '100%' }}>
      {label && (
        <label style={{ fontSize: 'var(--font-size-sm)', fontWeight: '500', color: 'var(--color-text-primary)' }}>
          {label} {required && <span style={{ color: 'var(--color-error)' }}>*</span>}
        </label>
      )}
      <select
        style={{
          width: '100%',
          padding: '9px 14px',
          borderRadius: 'var(--radius-md)',
          border: `1.5px solid ${error ? 'var(--color-error)' : 'var(--color-border)'}`,
          backgroundColor: '#FFFFFF',
          fontSize: 'var(--font-size-base)',
          color: 'var(--color-text-primary)',
          cursor: 'pointer',
          ...style
        }}
        className={`ui-select ${className}`}
        {...props}
      >
        {options.map((opt, i) => (
          <option key={i} value={typeof opt === 'object' ? opt.value : opt}>
            {typeof opt === 'object' ? opt.label : opt}
          </option>
        ))}
      </select>
      {error && <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-error)' }}>{error}</span>}
    </div>
  );
};

export const Modal = ({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  maxWidth = '550px'
}) => {
  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(24, 50, 56, 0.45)',
        backdropFilter: 'blur(3px)',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px'
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: 'var(--radius-xl)',
          width: '100%',
          maxWidth,
          boxShadow: 'var(--shadow-modal)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          maxHeight: '90vh'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          style={{
            padding: '20px 26px',
            borderBottom: '1px solid var(--color-border-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <div>
            <h3 style={{ margin: 0, fontSize: 'var(--font-size-lg)', color: 'var(--color-text-primary)' }}>{title}</h3>
            {subtitle && <p style={{ margin: '3px 0 0', fontSize: 'var(--font-size-xs)' }}>{subtitle}</p>}
          </div>
          <button
            onClick={onClose}
            style={{
              padding: '6px',
              borderRadius: 'var(--radius-sm)',
              color: 'var(--color-text-secondary)',
              fontSize: '18px'
            }}
          >
            ✕
          </button>
        </div>
        <div style={{ padding: '24px 26px', overflowY: 'auto' }}>
          {children}
        </div>
      </div>
    </div>
  );
};

/**
 * SafeImage Component
 * Prevents broken image icons and oversized alt text by gracefully rendering
 * a clean medical placeholder or fallback URL when loading fails.
 */
export const SafeImage = ({
  src,
  fallbackSrc,
  alt = '',
  style = {},
  className = '',
  aspectRatio,
  borderRadius = 'var(--radius-md)'
}) => {
  const [imgSrc, setImgSrc] = React.useState(src);
  const [hasError, setHasError] = React.useState(false);

  React.useEffect(() => {
    setImgSrc(src);
    setHasError(false);
  }, [src]);

  const handleError = () => {
    if (!hasError && fallbackSrc && imgSrc !== fallbackSrc) {
      setImgSrc(fallbackSrc);
      setHasError(true);
    } else {
      setHasError(true);
    }
  };

  const containerStyle = {
    position: 'relative',
    overflow: 'hidden',
    borderRadius,
    backgroundColor: 'var(--color-bg-pale-aqua)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    aspectRatio: aspectRatio || undefined,
    ...style
  };

  if (hasError && !fallbackSrc) {
    return (
      <div style={containerStyle} className={className} aria-label={alt}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '4px', padding: '8px', textAlign: 'center' }}>
          <div style={{ width: '24px', height: '24px', borderRadius: '50%', backgroundColor: 'rgba(10, 65, 116, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-primary-teal)', fontWeight: '700', fontSize: '13px' }}>
            +
          </div>
          <span style={{ fontSize: '0.68rem', color: 'var(--color-primary-teal)', fontWeight: '600' }}>
            Clinical Visual
          </span>
        </div>
      </div>
    );
  }

  return (
    <div style={containerStyle} className={className}>
      <img
        src={imgSrc}
        alt={alt}
        onError={handleError}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          display: 'block'
        }}
      />
    </div>
  );
};

