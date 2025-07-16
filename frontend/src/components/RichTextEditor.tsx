"use client";

import React, { JSX, useCallback, useEffect, useState } from "react";
import { Bold, Italic, Underline as UnderlineIcon, List, ListOrdered, Quote, AlignLeft, AlignCenter, AlignRight, Link as LinkIcon, Code as CodeIcon, Undo, Redo, Eye, Edit3, ChevronDown, Type, Strikethrough, Subscript, Superscript, RotateCcw } from "lucide-react";

import Code from "@tiptap/extension-code";
import Link from "@tiptap/extension-link";
import Color from "@tiptap/extension-color";
import StarterKit from "@tiptap/starter-kit";
import { EditorView } from "@tiptap/pm/view";
import ListItem from "@tiptap/extension-list-item";
import Underline from "@tiptap/extension-underline";
import TextStyle from "@tiptap/extension-text-style";
import TextAlign from "@tiptap/extension-text-align";
import CharacterCount from "@tiptap/extension-character-count";
import { useEditor, EditorContent, Editor } from "@tiptap/react";

interface RichTextEditorProps {
    value: string;
    onChange: (value: string) => void;
    disabled?: boolean;
    error?: string;
    placeholder?: string;
    className?: string;
    minHeight?: number;
}

interface BlockFormat {
    value: string;
    label: string;
    level?: number | null;
}

interface DropdownProps {
    isOpen: boolean;
    onToggle: () => void;
    currentLabel: string;
    options: BlockFormat[];
    onSelect: (format: BlockFormat) => void;
    disabled?: boolean;
}

const BLOCK_FORMATS: BlockFormat[] = [
    { value: "paragraph", label: "Normal", level: null },
    { value: "heading", label: "Heading 1", level: 1 },
    { value: "heading", label: "Heading 2", level: 2 },
    { value: "heading", label: "Heading 3", level: 3 },
    { value: "heading", label: "Heading 4", level: 4 },
    { value: "blockquote", label: "Quote", level: null },
];

const FormatDropdown: React.FC<DropdownProps> = ({ isOpen, onToggle, currentLabel, options, onSelect, disabled }) => {
    const dropdownRef = React.useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                if (isOpen) {
                    onToggle();
                }
            };
            document.addEventListener("mousedown", handleClickOutside);
            return () => document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isOpen, onToggle]);

    return (
        <div className = "relative" ref = {dropdownRef}>
            <button
                type = "button"
                onMouseDown = {(e) => {
                    e.preventDefault();
                }}
                onClick = {(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onToggle();
                }}
                disabled = {disabled}
                className = "flex items-center gap-2 px-3 py-2 text-sm border-0 bg-transparent rounded focus:outline-none min-w-[120px] cursor-pointer text-gray-800 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
                <Type className = "h-4 w-4" />
                <span> {currentLabel} </span>
                <ChevronDown className = {`h-3 w-3 text-gray-400 transition-transform ${isOpen ? "rotate-180" : ""}`} />
            </button>

            {isOpen && (
                <div className = "absolute top-full left-0 mt-1 w-full bg-white border border-gray-200 rounded-md shadow-lg z-50 max-h-60 overflow-y-auto">
                    {options.map((format) => (
                        <button
                            key = {`${format.value}-${format.level || "none"}`}
                            type = "button"
                            onMouseDown = {(e) => {
                                e.preventDefault();
                            }}
                            onClick = {(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                onSelect(format);
                                onToggle();
                            }}
                            className = "w-full text-left px-3 py-2 text-sm hover:bg-gray-50 transition-colors border-none bg-transparent cursor-pointer text-gray-800"
                        >
                            {format.label}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

export const RichTextEditor: React.FC<RichTextEditorProps> = ({ value, onChange, disabled = false, error, placeholder = "Start writing...", className = "", minHeight = 300 }) => {
    const [isPreview, setIsPreview] = useState(false);
    const [currentColor, setCurrentColor] = useState("#000000");
    const [isFormatDropdownOpen, setIsFormatDropdownOpen] = useState(false);

    const editor: Editor | null = useEditor({
        extensions: [
            StarterKit.configure({
                heading: {
                    levels: [1, 2, 3, 4],
                },
                listItem: false,
                bulletList: {
                    HTMLAttributes: {
                        class: "bullet-list",
                    },
                },
                orderedList: {
                    HTMLAttributes: {
                        class: "ordered-list",
                    },
                },
            }),
            ListItem.configure({
                HTMLAttributes: {
                    class: "list-item",
                },
            }),
            TextStyle,
            Color,
            TextAlign.configure({
                types: ["heading", "paragraph"],
            }),
            Link.configure({
                openOnClick: false,
                HTMLAttributes: {
                    class: "text-blue-600 underline cursor-pointer hover:text-blue-800",
                },
            }),
            Underline,
            Code.configure({
                HTMLAttributes: {
                    class: "bg-gray-100 text-red-600 px-1 py-0.5 rounded text-sm font-mono border border-gray-200",
                },
            }),
        ],
        content: value,
        editable: !disabled && !isPreview,
        onUpdate: ({ editor }) => {
            const html = editor.getHTML();
            onChange(html);
        },
        editorProps: {
            attributes: {
                class: `prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none min-h-full p-6 text-gray-800 leading-relaxed`,
                "data-placeholder": placeholder,
                style: `min-height: ${minHeight}px`,
            },
            handleKeyDown: (view: EditorView, event: globalThis.KeyboardEvent): boolean => {
                if (event.key === "Tab") {
                    event.preventDefault();

                    if (event.shiftKey) {
                        if (editor?.commands.liftListItem("listItem")) {
                            return true;
                        }
                    }
                }
                return false;
            },
        },
    });

    useEffect(() => {
        if (editor && value !== editor.getHTML()) {
            editor.commands.setContent(value, false);
        }
    }, [value, editor]);

    useEffect(() => {
        if (!editor) {
            return;
        }

        const updateColor = (): void => {
            const color: string | undefined = editor.getAttributes("textStyle").color;
            if (color) {
                setCurrentColor(color);
            } else {
                setCurrentColor("#000000");
            }
        };
        
        editor.on("selectionUpdate", updateColor);
        editor.on("transaction", updateColor);

        return () => {
            editor.off("selectionUpdate", updateColor);
            editor.off("transaction", updateColor);
        }
    }, [editor]);

    const setLink = useCallback((): void => {
        if (!editor) {
            return;
        }

        const previousURL: string = editor.getAttributes("link").href || "";
        if (previousURL) {
            const action = window.confirm("Link already exists. Click OK to edit, Cancel to remove");
            if (!action) {
                editor.chain().focus().extendMarkRange("link").unsetLink().run();
                return;
            }
        }

        const url: string | null = window.prompt("Enter URL: ", previousURL);
        if (url === null) {
            return;
        }
        if (url === "") {
            editor.chain().focus().extendMarkRange("link").unsetLink().run();
            return;
        }

        const finalURL: string = url.startsWith("http://") || url.startsWith("https://") || url.startsWith("mailto:") ? url: `https://${url}`;
        editor.chain().focus().extendMarkRange("link").setLink({ href: finalURL }).run();
    }, [editor]);

    const toggleCode = useCallback((): void => {
        if (!editor) {
            return;
        }
        editor.chain().focus().toggleCode().run();
    }, [editor]);

    const setFormat = useCallback((format: BlockFormat): void => {
        if (!editor) {
            return;
        }
        editor.chain().focus();
        if (format.value === "paragraph") {
            editor.chain().focus().setParagraph().run();
        } else if (format.value === "heading" && format.level) {
            editor.chain().focus().setHeading({ level: format.level as 1 | 2 | 3 | 4 }).run();
        } else if (format.value === "blockquote") {
            editor.chain().focus().setBlockquote().run();
        }
    }, [editor]);

    const getCurrentFormat = useCallback((): BlockFormat => {
        if (!editor) {
            return { value: "paragraph", label: "Normal" }
        }
        if (editor.isActive("heading", { level: 1 })) {
            return { value: "heading", label: "Heading 1", level: 1 };
        }
        if (editor.isActive("heading", { level: 2 })) {
            return { value: "heading", label: "Heading 2", level: 2 };
        }
        if (editor.isActive("heading", { level: 3 })) {
            return { value: "heading", label: "Heading 3", level: 3 };
        }
        if (editor.isActive("heading", { level: 4 })) {
            return { value: "heading", label: "Heading 4", level: 4 };
        }
        if (editor.isActive("blockquote")) {
            return { value: "blockquote", label: "Quote" };
        }
        return { value: "paragraph", label: "Normal" };
    }, [editor]);

    const clearFormatting = useCallback((): void => {
        if (!editor) {
            return;
        }
        editor.chain().focus().clearNodes().unsetAllMarks().run();
    }, [editor]);

    if (!editor) {
        return (
            <div className = "flex items-center justify-center h-32 bg-gray-50 rounded-lg">
                <div className = "text-gray-500"> Loading editor... </div>
            </div>
        );
    }

    const ToolbarButton = ({ onClick, isActive = false, disabled: buttonDisabled = false, title, children, className: buttonClassName = ""}: {
        onClick: () => void;
        isActive?: boolean;
        disabled?: boolean;
        title: string;
        children: React.ReactNode;
        className?: string;
    }): JSX.Element => (
        <button
            type = "button"
            onMouseDown = {(e) => {
                e.preventDefault();
            }}
            onClick = {(e) => {
                e.preventDefault();
                e.stopPropagation();
                onClick();
            }}
            disabled = {disabled || buttonDisabled}
            title = {title}
            className = {`p-2 rounded-md transition-all duration-150 ${
                isActive
                    ? "bg-blue-100 text-blue-600 shadow-sm"
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-800"
            } ${disabled || buttonDisabled ? "opacity-50 cursor-not-allowed" : "active:scale-95"} ${buttonClassName}`}
        >
            {children}
        </button>
    );

    const ToolbarGroup = ({ children }: { children: React.ReactNode }): JSX.Element => (
        <div className = "flex items-center gap-1 bg-white rounded-lg p-1 shadow-sm border border-gray-100">
            {children}
        </div>
    );

    const currentFormat: BlockFormat = getCurrentFormat();
    const characterCount: number = editor?.storage.characterCount?.characters() || 0;
    const wordCount: number = editor?.storage.characterCount?.words() || 0;

    return (
        <div 
            className = {`border-2 rounded-xl overflow-hidden transition-all duration-200 flex flex-col ${
            error
                ? "border-red-300 shadow-sm shadow-red-100"
                : "border-gray-200 hover:border-gray-300 focus-within:border-blue-400"
            } ${className}`}
            style = {{ height: minHeight + 150 }}
        >
            <div className = "flex-shrink-0 bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200 p-3">
                <div className = "flex flex-wrap items-center gap-2">
                    <ToolbarGroup>
                        <ToolbarButton
                            onClick = {() => editor.chain().focus().undo().run()}
                            disabled = {!editor.can().undo()}
                            title = "Undo (Ctrl + Z)"
                        >
                            <Undo className = "h-4 w-4" />
                        </ToolbarButton>
                        <ToolbarButton
                            onClick = {() => editor.chain().focus().redo().run()}
                            disabled = {!editor.can().redo()}
                            title = "Redo (Ctrl + Y)"
                        >
                            <Redo className = "h-4 w-4" />
                        </ToolbarButton>
                    </ToolbarGroup>

                    <div className = "w-px h-6 bg-gray-300" />

                    <ToolbarGroup>
                        <FormatDropdown
                            isOpen = {isFormatDropdownOpen}
                            onToggle = {() => setIsFormatDropdownOpen(!isFormatDropdownOpen)}
                            currentLabel = {currentFormat.label}
                            options = {BLOCK_FORMATS}
                            onSelect = {setFormat}
                            disabled = {disabled}
                        />
                    </ToolbarGroup>

                    <div className = "w-px h-6 bg-gray-300" />

                    <ToolbarGroup>
                        <ToolbarButton
                            onClick = {() => editor.chain().focus().toggleBold().run()}
                            isActive = {editor.isActive("bold")}
                            title = "Bold (Ctrl + B)"
                        >
                            <Bold className = "h-4 w-4" />
                        </ToolbarButton>
                        <ToolbarButton
                            onClick = {() => editor.chain().focus().toggleItalic().run()}
                            isActive = {editor.isActive("italic")}
                            title = "Italic (Ctrl + I)"
                        >
                            <Italic className = "h-4 w-4" />
                        </ToolbarButton>
                        <ToolbarButton
                            onClick = {() => editor.chain().focus().toggleUnderline().run()}
                            isActive = {editor.isActive("underline")}
                            title = "Underline (Ctrl + U)"
                        >
                            <UnderlineIcon className = "h-4 w-4" />
                        </ToolbarButton>
                        <ToolbarButton
                            onClick = {() => editor.chain().focus().toggleStrike().run()}
                            isActive = {editor.isActive("strike")}
                            title = "Strikethrough"
                        >
                            <Strikethrough className = "h-4 w-4" />
                        </ToolbarButton>
                    </ToolbarGroup>

                    <div className = "w-px h-6 bg-gray-300" />

                    <ToolbarGroup>
                        <ToolbarButton
                            onClick = {() => editor.chain().focus().toggleBulletList().run()}
                            isActive = {editor.isActive("bulletList")}
                            title = "Bullet List (Tab to indent, Shift + Tab to outdent"
                        >
                            <List className = "h-4 w-4" />
                        </ToolbarButton>
                        <ToolbarButton
                            onClick = {() => editor.chain().focus().toggleOrderedList().run()}
                            isActive = {editor.isActive("orderedList")}
                            title = "Numbered List"
                        >
                            <ListOrdered className = "h-4 w-4" />
                        </ToolbarButton>
                        <ToolbarButton
                            onClick = { () => {
                                if (editor) {
                                    editor.chain().focus().toggleBlockquote().run();
                                }
                            }}
                            isActive = {editor?.isActive("blockquote") || false}
                            title = "Quote Block"
                        >
                            <Quote className = "h-4 w-4" />
                        </ToolbarButton>
                    </ToolbarGroup>

                    <div className = "w-px h-6 bg-gray-300" />

                    <ToolbarGroup>
                        <ToolbarButton
                            onClick = {() => editor.chain().focus().setTextAlign("left").run()}
                            isActive = {editor.isActive({ textAligh: "left" })}
                            title = "Align Left"
                        >
                            <AlignLeft className = "h-4 w-4" />
                        </ToolbarButton>
                        <ToolbarButton
                            onClick = {() => editor.chain().focus().setTextAlign("center").run()}
                            isActive = {editor.isActive({ textAligh: "center" })}
                            title = "Align Center"
                        >
                            <AlignCenter className = "h-4 w-4" />
                        </ToolbarButton>
                        <ToolbarButton
                            onClick = {() => editor.chain().focus().setTextAlign("right").run()}
                            isActive = {editor.isActive({ textAligh: "right" })}
                            title = "Align Right"
                        >
                            <AlignRight className = "h-4 w-4" />
                        </ToolbarButton>
                    </ToolbarGroup>

                    <div className = "w-px h-6 bg-gray-300" />

                    <ToolbarGroup>
                        <ToolbarButton
                            onClick = {setLink}
                            isActive = {editor.isActive("link")}
                            title = "Insert Link"
                        >
                            <LinkIcon className = "h-4 w-4" />
                        </ToolbarButton>
                        <input
                            type = "color"
                            value = {currentColor}
                            onMouseDown = {(e) => {
                                e.preventDefault();
                            }}
                            onChange = {(e) => {
                                e.preventDefault();
                                const color = e.target.value;
                                setCurrentColor(color);
                                if (editor) {
                                    editor.chain().focus().setColor(color).run();
                                }
                            }}
                            className = "w-8 h-8 rounded border border-gray-300 cursor-pointer bg-transparent hover:border-gray-400 transition-colors"
                            title = "Text Color"
                            disabled = {disabled}
                        />
                        <ToolbarButton
                            onClick = {toggleCode}
                            isActive = {editor.isActive("code")}
                            title = "Inline Code"
                        >
                            <CodeIcon className = "h-4 w-4" />
                        </ToolbarButton>
                        <ToolbarButton
                            onClick = {clearFormatting}
                            title = "Clear Formatting"
                        >
                            <RotateCcw className = "h-4 w-4" />
                        </ToolbarButton>
                    </ToolbarGroup>

                    <div className = "w-px h-6 bg-gray-300" />

                    <button
                        type = "button"
                        onMouseDown = {(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setIsPreview(!isPreview);
                        }}
                        className = {`flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-150 ${
                            isPreview 
                                ? "bg-blue-500 text-white shadow-md hover:bg-blue-600" 
                                : "bg-white text-gray-600 hover:bg-gray-50 shadow-sm border border-gray-200"
                        } active:scale-95`}
                        disabled = {disabled}
                    >
                        {isPreview ? <Edit3 className = "h-4 w-4" /> : <Eye className = "h-4 w-4" />}
                        <span className = "text-sm font-semibold">
                            {isPreview ? "Edit" : "Preview"}
                        </span>
                    </button>
                </div>
            </div>

            <div className = "bg-white flex-1 min-h-0 relative">
                {isPreview ? (
                    <div className = "h-full overflow-y-auto">
                        <div
                            className = "prose max-w-none p-6 text-black leading-relaxed"
                            dangerouslySetInnerHTML = {{ 
                                __html: value || `<p class="text-gray-500 italic"> ${placeholder} </p>` 
                            }}
                        />
                    </div>
                ) : (
                    <div className = "h-full overflow-y-auto">
                        <EditorContent
                            editor = {editor}
                            className = "h-full"
                        />
                    </div>
                )}
            </div>

            <div className = "flex-shrink-0 flex items-center justify-between px-6 py-2 bg-gray-50 border-t text-xs text-gray-500">
                <div className = "flex items-center gap-4">
                    <span> {characterCount} characters </span>
                    <span> {wordCount} words </span>
                </div>
            </div>

            <style jsx global> {`
                .ProseMirror {
                outline: none;
                min-height: ${minHeight}px;
                }
                
                .ProseMirror p.is-editor-empty:first-child::before {
                content: attr(data-placeholder);
                float: left;
                color: #9ca3af;
                pointer-events: none;
                height: 0;
                }

                .ProseMirror h1 {
                font-size: 2.5em !important;
                font-weight: 700 !important;
                margin: 0.8em 0 0.4em 0 !important;
                line-height: 1.2 !important;
                color: #111827 !important;
                }

                .ProseMirror h2 {
                font-size: 2em !important;
                font-weight: 600 !important;
                margin: 0.7em 0 0.35em 0 !important;
                line-height: 1.3 !important;
                color: #1f2937 !important;
                }

                .ProseMirror h3 {
                font-size: 1.5em !important;
                font-weight: 600 !important;
                margin: 0.6em 0 0.3em 0 !important;
                line-height: 1.4 !important;
                color: #374151 !important;
                }

                .ProseMirror h4 {
                font-size: 1.25em !important;
                font-weight: 600 !important;
                margin: 0.5em 0 0.25em 0 !important;
                line-height: 1.4 !important;
                color: #4b5563 !important;
                }

                .ProseMirror p {
                margin: 0.5em 0 !important;
                line-height: 1.6 !important;
                color: #374151 !important;
                }

                .ProseMirror blockquote {
                border-left: 4px solid #3b82f6 !important;
                padding: 1em 1.5em !important;
                margin: 1.5em 0 !important;
                background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%) !important;
                border-radius: 0 0.5rem 0.5rem 0 !important;
                font-style: italic !important;
                color: #4b5563 !important;
                position: relative !important;
                }

                .ProseMirror blockquote::before {
                content: '"' !important;
                font-size: 4em !important;
                color: #cbd5e1 !important;
                position: absolute !important;
                top: -0.2em !important;
                left: 0.3em !important;
                font-family: Georgia, serif !important;
                line-height: 1 !important;
                }

                .ProseMirror blockquote p {
                margin: 0.5em 0 !important;
                position: relative !important;
                z-index: 1 !important;
                }

                /* Enhanced nested bullet list styles */
                .ProseMirror ul {
                padding-left: 1.5em !important;
                margin: 1em 0 !important;
                list-style: none !important;
                }

                .ProseMirror ul li {
                position: relative !important;
                margin: 0.5em 0 !important;
                line-height: 1.6 !important;
                padding-left: 1.5em !important;
                }

                /* Level 1: Filled circle (bullet) */
                .ProseMirror ul li::before {
                content: "•" !important;
                position: absolute !important;
                left: 0 !important;
                top: 0 !important;
                color: #374151 !important;
                font-weight: bold !important;
                font-size: 1.2em !important;
                line-height: 1.3 !important;
                }

                /* Level 2: Filled square */
                .ProseMirror ul ul li::before {
                content: "▪" !important;
                font-size: 1em !important;
                top: 0.1em !important;
                }

                /* Level 3: Hollow circle */
                .ProseMirror ul ul ul li::before {
                content: "◦" !important;
                font-size: 1.1em !important;
                top: 0.05em !important;
                }

                /* Level 4+: Small filled circle */
                .ProseMirror ul ul ul ul li::before {
                content: "‣" !important;
                font-size: 1em !important;
                top: 0.1em !important;
                }

                .ProseMirror ol {
                padding-left: 1.5em !important;
                margin: 1em 0 !important;
                list-style-type: decimal !important;
                }

                .ProseMirror ol li {
                margin: 0.5em 0 !important;
                line-height: 1.6 !important;
                padding-left: 0.5em !important;
                }

                .ProseMirror strong {
                font-weight: 700 !important;
                }

                .ProseMirror em {
                font-style: italic !important;
                }

                .ProseMirror u {
                text-decoration: underline !important;
                }

                .ProseMirror s {
                text-decoration: line-through !important;
                }

                .ProseMirror a {
                color: #3b82f6 !important;
                text-decoration: underline !important;
                cursor: pointer !important;
                transition: color 0.15s ease !important;
                }

                .ProseMirror a:hover {
                color: #1d4ed8 !important;
                }

                .ProseMirror code {
                background: #f3f4f6 !important;
                color: #dc2626 !important;
                padding: 0.2em 0.4em !important;
                border-radius: 0.25rem !important;
                font-family: "SF Mono", "Monaco", "Cascadia Code", "Roboto Mono", monospace !important;
                font-size: 0.9em !important;
                border: 1px solid #d1d5db !important;
                }

                .ProseMirror [data-text-align="left"] {
                text-align: left !important;
                }

                .ProseMirror [data-text-align="center"] {
                text-align: center !important;
                }

                .ProseMirror [data-text-align="right"] {
                text-align: right !important;
                }

                /* Focus styles */
                .ProseMirror:focus {
                outline: none !important;
                }

                /* Selection styles */
                .ProseMirror ::selection {
                background: #bfdbfe !important;
                }

                /* Placeholder styles */
                .ProseMirror .is-empty::before {
                content: attr(data-placeholder) !important;
                float: left !important;
                color: #9ca3af !important;
                pointer-events: none !important;
                height: 0 !important;
                }
            `} </style>
        </div>
    );
};