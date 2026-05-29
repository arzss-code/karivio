'use client';
import React, { useState, useEffect, useRef } from 'react';

interface EditableFieldProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
  placeholder?: string;
  multiline?: boolean;
}

export default function EditableField({ value, onChange, className = '', placeholder = 'Click to edit...', multiline = false }: EditableFieldProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [currentValue, setCurrentValue] = useState(value);
  const editableRef = useRef<HTMLDivElement | HTMLSpanElement>(null);

  useEffect(() => {
    setCurrentValue(value);
  }, [value]);

  const handleBlur = () => {
    setIsEditing(false);
    if (currentValue !== value) {
      onChange(currentValue);
    }
  };

  const handleInput = (e: React.FormEvent<HTMLElement>) => {
    setCurrentValue(e.currentTarget.textContent || '');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLElement>) => {
    if (!multiline && e.key === 'Enter') {
      e.preventDefault();
      e.currentTarget.blur();
    }
  };

  const baseClasses = `transition-colors duration-200 outline-none hover:bg-neutral-100 hover:ring-1 hover:ring-neutral-200 focus:bg-white focus:ring-2 focus:ring-blue-500/50 rounded px-1 -mx-1 empty:before:content-[attr(data-placeholder)] empty:before:text-neutral-400 ${className}`;

  if (multiline) {
    return (
      <div
        ref={editableRef as React.RefObject<HTMLDivElement>}
        contentEditable
        suppressContentEditableWarning
        onBlur={handleBlur}
        onInput={handleInput}
        onFocus={() => setIsEditing(true)}
        className={baseClasses}
        data-placeholder={placeholder}
      >
        {value}
      </div>
    );
  }

  return (
    <span
      ref={editableRef as React.RefObject<HTMLSpanElement>}
      contentEditable
      suppressContentEditableWarning
      onBlur={handleBlur}
      onInput={handleInput}
      onKeyDown={handleKeyDown}
      onFocus={() => setIsEditing(true)}
      className={baseClasses}
      data-placeholder={placeholder}
    >
      {value}
    </span>
  );
}
