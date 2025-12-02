import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import styles from "./selectDropdown.module.scss";

interface SelectOption {
    label: string;
    value: string | number;
}

interface SelectDropdownProps {
    id?: string;
    value: string | number;
    options: SelectOption[];
    disabled?: boolean;
    onChange: (value: string | number) => void;
    leftIconSrc?: string;
    leftText?: string;
    rightIconSrc?: string;
}

const SelectDropdown: React.FC<SelectDropdownProps> = ({
    id,
    value,
    options,
    disabled = false,
    onChange,
    leftIconSrc,
    rightIconSrc = "/images/icons/arrow-down-black.svg",
    leftText,
}) => {
    const [open, setOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement | null>(null);

    const handleToggle = () => {
        if (disabled) return;
        setOpen((prev) => !prev);
    };

    const handleSelect = (val: string | number) => {
        if (disabled) return;
        onChange(val);
        setOpen(false);
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

    return (
        <div
            ref={containerRef}
            className={`${styles.selectContainer} ${open ? styles.open : ""} ${disabled ? styles.disabled : ""}`}
            onClick={handleToggle}
        >
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

            <div className={styles.select} id={id}>
                {options.find((option) => option.value === value)?.label}
            </div>

            {rightIconSrc && (
                <Image
                    className={`${styles.rightIcon} ${open ? styles.rotate : ""}`}
                    width={20}
                    height={20}
                    src={rightIconSrc}
                    alt="select"
                />
            )}
            {open && (
                <div className={styles.options}>
                    {options.map((option) => {
                        const selected = option.value === value;
                        return (
                            <div
                                key={option.value}
                                className={`${styles.optionItem} ${selected ? styles.optionItemSelected : ""}`}
                                onClick={() => handleSelect(option.value)}
                            >
                                {selected && (
                                    <Image
                                        className={styles.checkIcon}
                                        width={16}
                                        height={16}
                                        src="/images/icons/checked.svg"
                                        alt="checked"
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


