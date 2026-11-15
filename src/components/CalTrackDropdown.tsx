import { useEffect, useId, useRef, useState } from 'react';
import type { KeyboardEvent } from 'react';
import './CalTrackDropdown.css';

type DropdownOption = {
    value: string;
    label: string;
};

type CalTrackDropdownProps = {
    value: string;
    onChange: (value: string) => void;
    options: DropdownOption[];
    ariaLabel: string;
};

export default function CalTrackDropdown({
                                             value,
                                             onChange,
                                             options,
                                             ariaLabel,
                                         }: CalTrackDropdownProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [focusedIndex, setFocusedIndex] = useState(0);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const triggerRef = useRef<HTMLButtonElement>(null);
    const listId = useId();

    const selectedIndex = options.findIndex(
        (option) => option.value === value
    );

    const selectedOption = options[selectedIndex];

    useEffect(() => {
        if (!isOpen) return;

        const handleOutsideClick = (event: PointerEvent) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target as Node)
            ) {
                setIsOpen(false);
            }
        };

        document.addEventListener('pointerdown', handleOutsideClick);

        return () => {
            document.removeEventListener('pointerdown', handleOutsideClick);
        };
    }, [isOpen]);

    const chooseOption = (option: DropdownOption) => {
        onChange(option.value);
        setIsOpen(false);
        triggerRef.current?.focus();
    };

    const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
        if (event.key === 'Escape' && isOpen) {
            event.preventDefault();
            setIsOpen(false);
            return;
        }

        if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
            event.preventDefault();

            if (!isOpen) {
                setFocusedIndex(Math.max(selectedIndex, 0));
                setIsOpen(true);
                return;
            }

            setFocusedIndex((current) =>
                event.key === 'ArrowDown'
                    ? (current + 1) % options.length
                    : (current - 1 + options.length) % options.length
            );
        }

        if (event.key === 'Enter' && isOpen) {
            event.preventDefault();
            chooseOption(options[focusedIndex]);
        }
    };

    return (
        <div className="caltrack-dropdown" ref={dropdownRef}>
            <button
                ref={triggerRef}
                type="button"
                className={`caltrack-dropdown-trigger ${isOpen ? 'open' : ''}`}
                aria-label={ariaLabel}
                aria-haspopup="listbox"
                aria-expanded={isOpen}
                aria-controls={isOpen ? listId : undefined}
                onClick={() => {
                    setFocusedIndex(Math.max(selectedIndex, 0));
                    setIsOpen((previous) => !previous);
                }}
                onKeyDown={handleKeyDown}
            >
                <span>{selectedOption?.label ?? 'Select an option'}</span>
                <span className={`caltrack-dropdown-arrow ${isOpen ? 'up' : ''}`}>
                    ⌄
                </span>
            </button>

            {isOpen && (
                <div
                    id={listId}
                    className="caltrack-dropdown-menu"
                    role="listbox"
                    aria-label={ariaLabel}
                >
                    {options.map((option, index) => (
                        <button
                            key={option.value}
                            type="button"
                            role="option"
                            aria-selected={value === option.value}
                            className={`caltrack-dropdown-option ${
                                value === option.value ? 'selected' : ''
                            } ${focusedIndex === index ? 'focused' : ''}`}
                            onMouseEnter={() => setFocusedIndex(index)}
                            onClick={() => chooseOption(option)}
                        >
                            <span>{option.label}</span>
                            {value === option.value && (
                                <span className="caltrack-dropdown-check">✓</span>
                            )}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
