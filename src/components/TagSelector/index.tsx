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
}

const TagSelector: React.FC<TagSelectorProps> = ({ tags, styleType, onChange, selectedValue }) => {

    const handleTagSelect = (value: string | number) => {
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
        <div className={getStyleClass()}>
            {
                tags.map((tag) => (
                    <button
                        key={tag.value}
                        onClick={() => handleTagSelect(tag.value)}
                        className={`${styles.tag} ${selectedValue === tag.value ? styles.selected_tag : ''}`}
                    >
                        {tag.title}
                    </button>
                ))
            }
        </div>
    );
};

export default TagSelector;