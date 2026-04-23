import React, { useState } from 'react';
import styles from './index.module.scss';

interface TagItem {
    title: string;
    value: string | number;
}

interface TagSelectorProps {
    tags: TagItem[];
    styleType: 'text' | 'outlined';
    onChange: (value: string | number) => void;
    selectedValue: string | number;
    title?: string
    loading?: boolean;
    size?: 'small' | 'medium' | 'large';
}

const TagSelector: React.FC<TagSelectorProps> = ({ tags, styleType, onChange, selectedValue, title, loading = false, size = 'medium' }) => {

    const handleTagSelect = (value: string | number) => {
        if (loading) {
            return;
        }
        onChange(value);
    };

    const getStyleClass = () => {
        switch (styleType) {
            case 'text':
                return styles.tagSelectorText;
            case 'outlined':
                return styles.tagSelectorOutlined;
            default:
                return styles.tagSelectorText;
        }
    };

    return (
        <div className={styles.tagSelectorContainer}>
            {title && (
                <div className={styles.tagSelectorTitle}>
                    {title}
                </div>
            )}
            <div className={styles.tagSelectorContent}>
                <div className={getStyleClass()}>
                    {
                        tags.map((tag) => (
                            <button
                                key={tag.value}
                                onClick={() => handleTagSelect(tag.value)}
                                style={{ '--font-size': size === 'small' ? '.0875rem' : size === 'medium' ? '0.1rem' : '0.1125rem' } as React.CSSProperties}
                                className={`${styles.tag} ${selectedValue === tag.value ? styles.selected_tag : ''}`}
                                disabled={loading}
                            >
                                {tag.title}
                            </button>
                        ))
                    }
                </div>
            </div>
        </div>
    );
};

export default TagSelector;