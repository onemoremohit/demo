import React from 'react';
// import './Button.css';

const Button = ({
    children,
    variant = 'primary',
    size = 'medium',
    fullWidth = false,
    disabled = false,
    onClick,
    type = 'button',
    className = ''
}) => {
    const buttonClasses = [
        'button',
        `button-${variant}`,
        `button-${size}`,
        fullWidth ? 'button-full-width' : '',
        disabled ? 'button-disabled' : '',
        className
    ].filter(Boolean).join(' ');

    return (
        <button
            type={type}
            className={buttonClasses}
            disabled={disabled}
            onClick={onClick}
        >
            {children}
        </button>
    );
};

export default Button;
