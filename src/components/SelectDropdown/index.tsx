import React, { useEffect, useId, useRef, useState } from "react";
import Image from "next/image";
import styles from "./selectDropdown.module.scss";

interface SelectOption {
    label: string;
    value: string | number;
}

interface SelectDropdownProps {
    id?: string;
    name?: string;
    className?: string;
    required?: boolean;
    invalid?: boolean;
    ariaLabel?: string;
    ariaDescribedBy?: string;
    value: string | number;
    options: SelectOption[];
    disabled?: boolean;
    onChange: (value: string | number) => void;
    leftIconSrc?: string;
    leftText?: string;
    rightIconSrc?: string;
    placeholder?: string;
    style?: React.CSSProperties;
}

const SelectDropdown: React.FC<SelectDropdownProps> = ({
    id,
    name,
    className = '',
    required = false,
    invalid = false,
    ariaLabel,
    ariaDescribedBy,
    value,
    options,
    disabled = false,
    onChange,
    leftIconSrc,
    rightIconSrc = "/images/icons/arrow-down-black.svg",
    leftText,
    placeholder,
    style,
}) => {
    const [open, setOpen] = useState(false);
    const [activeIndex, setActiveIndex] = useState(-1);
    const containerRef = useRef<HTMLDivElement | null>(null);
    const optionsId = useId();

    const handleToggle = () => {
        if (disabled) return;
        if (!open) setActiveIndex(Math.max(0, options.findIndex(option => option.value === value)));
        setOpen((prev) => !prev);
    };

    const handleSelect = (val: string | number) => {
        if (disabled) return;
        onChange(val);
        setOpen(false);
        containerRef.current?.focus();
    };

    const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
        if (disabled) return;
        if (event.key === 'Escape' || event.key === 'Tab') {
            setOpen(false);
            if (event.key === 'Escape') event.preventDefault();
        } else if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            if (open && options[activeIndex]) handleSelect(options[activeIndex].value);
            else handleToggle();
        } else if (['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key) && options.length) {
            event.preventDefault();
            setOpen(true);
            const selectedIndex = options.findIndex(option => option.value === value);
            setActiveIndex(index => {
                if (event.key === 'Home') return 0;
                if (event.key === 'End') return options.length - 1;
                if (!open) return selectedIndex >= 0 ? selectedIndex : event.key === 'ArrowUp' ? options.length - 1 : 0;
                return Math.max(0, Math.min(options.length - 1, index + (event.key === 'ArrowDown' ? 1 : -1)));
            });
        }
    };

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    useEffect(() => {
        if (open && activeIndex >= 0) {
            document.getElementById(`${optionsId}-${activeIndex}`)?.scrollIntoView({ block: 'nearest' });
        }
    }, [open, activeIndex, optionsId]);

    const selectedOption = options.find((option) => option.value === value);
    // 当 value 为空字符串或未定义时，视为未选择
    const hasValue = value !== "" && value !== undefined && value !== null && selectedOption !== undefined;
    // 如果有选择值，显示选项标签；否则显示占位符
    const displayText = hasValue ? (selectedOption?.label || "") : (placeholder || "");

    return (
        <div
            ref={containerRef}
            id={id}
            role="combobox"
            tabIndex={disabled ? -1 : 0}
            aria-label={ariaLabel || leftText || placeholder}
            aria-describedby={ariaDescribedBy}
            aria-required={required || undefined}
            aria-invalid={invalid || undefined}
            aria-disabled={disabled}
            aria-expanded={open && !disabled}
            aria-haspopup="listbox"
            aria-controls={open && !disabled ? optionsId : undefined}
            aria-activedescendant={open && !disabled && options[activeIndex] ? `${optionsId}-${activeIndex}` : undefined}
            className={`${styles.selectContainer} ${open ? styles.open : ""} ${disabled ? styles.disabled : ""} ${hasValue ? styles.hasValue : ""} ${className}`}
            onClick={handleToggle}
            onKeyDown={handleKeyDown}
            onBlur={event => {
                if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false);
            }}
            style={style}
        >
            {name && <input type="hidden" name={name} value={value} disabled={disabled} />}
            {(leftIconSrc || leftText) && (
                <div className={styles.leftArea}>
                    {leftIconSrc && (
                        <Image
                            className={styles.leftIcon}
                            width={20}
                            height={20}
                            src={leftIconSrc}
                            alt="select"
                        />
                    )}
                    {leftText && (
                        <div className={styles.selectText}>
                            {leftText}
                        </div>
                    )}
                </div>
            )}

            <div className={styles.select}>
                {displayText}
            </div>

            {rightIconSrc && (
                <Image
                    className={`${styles.rightIcon} ${open ? styles.rotate : ""}`}
                    width={20}
                    height={20}
                    src={rightIconSrc}
                    alt=""
                />
            )}
            {open && !disabled && (
                <div className={styles.options} id={optionsId} role="listbox" aria-label={ariaLabel || leftText || placeholder} onClick={event => event.stopPropagation()}>
                    {options.map((option, index) => {
                        const selected = option.value === value;
                        return (
                            <div
                                key={option.value}
                                id={`${optionsId}-${index}`}
                                role="option"
                                aria-selected={selected}
                                className={`${styles.optionItem} ${selected ? styles.optionItemSelected : ""} ${activeIndex === index ? styles.optionItemActive : ''}`}
                                onMouseDown={event => event.preventDefault()}
                                onClick={() => handleSelect(option.value)}
                            >
                                {selected && (
                                    <Image
                                        className={styles.checkIcon}
                                        width={16}
                                        height={16}
                                        src="/images/icons/checked.svg"
                                        alt=""
                                    />
                                )}
                                <span>{option.label}</span>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default SelectDropdown;
