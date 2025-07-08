"use client";

import React, { useRef, useState, useEffect } from "react";

interface RichTextEditorProps {
    value: string;
    onChange: (value: string) => void;
    disabled?: boolean;
    error?: string;
    placeholder?: string;
}

export const OptimizedRichTextEditor: React.FC<RichTextEditorProps> = ({ value, onChange, disabled = false, error, placeholder = "Start writing..." }) => {
    const editorRef = useRef<HTMLDivElement>(null);
    const [isPreview, setIsPreview] = useState(false);
    const [currentSize, setCurrentSize] = useState("3");
    const [currentFormat, setCurrentFormat] = useState("p");
    const [activeStates, setActiveStates] = useState<Set<string>>(new Set());

    useEffect(() => {
        if (editorRef.current && editorRef.current.innerHTML !== value) {
            editorRef.current.innerHTML = value || "";
        }
    }, [value]);



};