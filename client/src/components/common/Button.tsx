// src/components/common/Button.tsx
import React, { type ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'success';
    size?: 'sm' | 'md' | 'lg';
    isLoading?: boolean;
    fullWidth?: boolean;
    icon?: React.ReactNode;
    iconPosition?: 'left' | 'right';
}

const Button: React.FC<ButtonProps> = ({
                                           children,
                                           variant = 'primary',
                                           size = 'md',
                                           isLoading = false,
                                           fullWidth = false,
                                           icon,
                                           iconPosition = 'left',
                                           className = '',
                                           disabled,
                                           ...props
                                       }) => {
    // Define base classes
    const baseClasses = 'inline-flex items-center justify-center font-medium rounded-md focus:outline-none transition-colors duration-200';

    // Define variant classes
    const variantClasses = {
        primary: 'bg-primary text-white hover:bg-primary-dark focus:ring-2 focus:ring-primary focus:ring-offset-2',
        secondary: 'bg-secondary text-white hover:bg-secondary-light focus:ring-2 focus:ring-secondary focus:ring-offset-2',
        outline: 'border border-current text-primary hover:bg-primary-light hover:text-white focus:ring-2 focus:ring-primary focus:ring-offset-2',
        danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-2 focus:ring-red-500 focus:ring-offset-2',
        success: 'bg-green-600 text-white hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2',
    };

    // Define size classes
    const sizeClasses = {
        sm: 'text-xs px-2.5 py-1.5',
        md: 'text-sm px-4 py-2',
        lg: 'text-base px-6 py-3',
    };

    // Define width classes
    const widthClasses = fullWidth ? 'w-full' : '';

    // Define disabled classes
    const disabledClasses = (disabled || isLoading) ? 'opacity-70 cursor-not-allowed' : '';

    // Combine classes
    const buttonClasses = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${widthClasses} ${disabledClasses} ${className}`;

    return (
        <button className={buttonClasses} disabled={disabled || isLoading} {...props}>
            {isLoading && (
                <svg
                    className={`animate-spin h-5 w-5 ${children ? 'mr-2' : ''}`}
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                >
                    <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                    />
                    <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                </svg>
            )}

            {!isLoading && icon && iconPosition === 'left' && <span className="mr-2">{icon}</span>}
            {children}
            {!isLoading && icon && iconPosition === 'right' && <span className="ml-2">{icon}</span>}
        </button>
    );
};

export default Button;