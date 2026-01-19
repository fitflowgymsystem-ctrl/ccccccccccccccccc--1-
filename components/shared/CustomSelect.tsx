import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { ChevronDown, Check } from 'lucide-react';

interface Option {
    label: string;
    value: string | number;
    icon?: React.ReactNode;
}

interface CustomSelectProps {
    value: string | number;
    options: Option[];
    onChange: (value: any) => void;
    placeholder?: string;
    label?: string;
    className?: string;
    disabled?: boolean;
}

export const CustomSelect: React.FC<CustomSelectProps> = ({ value, options, onChange, placeholder, label, className = "", disabled }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [coords, setCoords] = useState({ top: 0, left: 0, width: 0 });
    const containerRef = useRef<HTMLDivElement>(null);
    const buttonRef = useRef<HTMLButtonElement>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const selectedOption = options.find(opt => opt.value === value);

    const updateCoords = () => {
        if (buttonRef.current) {
            const rect = buttonRef.current.getBoundingClientRect();
            setCoords({
                top: rect.bottom + window.scrollY,
                left: rect.left + window.scrollX,
                width: rect.width
            });
        }
    };

    useEffect(() => {
        if (isOpen) {
            updateCoords();
            window.addEventListener('scroll', updateCoords, true);
            window.addEventListener('resize', updateCoords);
        }
        return () => {
            window.removeEventListener('scroll', updateCoords, true);
            window.removeEventListener('resize', updateCoords);
        };
    }, [isOpen]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as Node;
            if (
                containerRef.current && !containerRef.current.contains(target) &&
                dropdownRef.current && !dropdownRef.current.contains(target)
            ) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSelect = (option: Option) => {
        if (disabled) return;
        onChange(option.value);
        setIsOpen(false);
    };

    return (
        <div className={`relative w-full ${className}`} ref={containerRef}>
            {label && (
                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest ps-1 mb-1">
                    {label}
                </label>
            )}
            <button
                ref={buttonRef}
                type="button"
                disabled={disabled}
                onClick={() => setIsOpen(!isOpen)}
                className={`w-full px-3 py-2 bg-white dark:bg-slate-950 border dark:border-slate-700 rounded-lg text-sm font-bold flex items-center justify-between outline-none focus:ring-1 focus:ring-blue-500 shadow-sm transition-all ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:border-gray-300 dark:hover:border-slate-600'}`}
            >
                <div className="flex items-center gap-2 truncate">
                    {selectedOption?.icon}
                    <span className="truncate">{selectedOption?.label || placeholder || 'Select...'}</span>
                </div>
                <ChevronDown size={14} className={`text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {isOpen && !disabled && createPortal(
                <div
                    ref={dropdownRef}
                    className="fixed z-[9999] mt-1 bg-white dark:bg-slate-900 border dark:border-slate-700 rounded-xl shadow-2xl overflow-hidden animate-scale-in origin-top"
                    style={{
                        top: coords.top - window.scrollY,
                        left: coords.left - window.scrollX,
                        width: coords.width
                    }}
                >
                    <div className="max-h-96 overflow-y-auto no-scrollbar py-1">
                        {options.length > 0 ? options.map((option) => (
                            <button
                                key={option.value}
                                type="button"
                                onClick={() => handleSelect(option)}
                                className={`w-full px-3 py-2.5 text-sm text-start flex items-center justify-between gap-2 hover:bg-blue-50/50 dark:hover:bg-blue-900/10 transition-colors ${value === option.value ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-black' : 'text-gray-700 dark:text-gray-300'}`}
                            >
                                <div className="flex items-center gap-2 truncate text-start">
                                    {option.icon}
                                    <span className="truncate">{option.label}</span>
                                </div>
                                {value === option.value && <Check size={14} />}
                            </button>
                        )) : (
                            <div className="px-3 py-2 text-xs text-gray-400 italic text-center">No options available</div>
                        )}
                    </div>
                </div>,
                document.body
            )}
        </div>
    );
};
