"use client";

import React, { useRef, useState, useEffect, useCallback } from "react";
import { Eye, Edit3, Bold, Italic, Underline, List, ListOrdered, Link as LinkIcon, Quote, AlignLeft, AlignCenter, AlignRight, Code, Undo, Redo, ChevronDown } from "lucide-react";

interface RichTextEditorProps {
    value: string;
    onChange: (value: string) => void;
    disabled?: boolean;
    error?: string;
    placeholder?: string;
}

const COMMANDS = {
    format: [
        { key: "bold", icon: Bold, cmd: "bold", title: "Bold (Ctrl+B)" },
        { key: "italic", icon: Italic, cmd: "italic", title: "Italic (Ctrl+I)" },
        { key: "underline", icon: Underline, cmd: "underline", title: "Underline (Ctrl+U)" },
    ],
    lists: [
        { key: "bulletList", icon: List, cmd: "insertUnorderedList", title: "Bullet List" },
        { key: "orderedList", icon: ListOrdered, cmd: "insertOrderedList", title: "Numbered List" },
        { key: "quote", icon: Quote, cmd: "formatBlock", value: "blockquote", title: "Quote" },
    ],
    align: [
        { key: "alignLeft", icon: AlignLeft, cmd: "justifyLeft", title: "Align Left" },
        { key: "alignCenter", icon: AlignCenter, cmd: "justifyCenter", title: "Align Center" },
        { key: "alignRight", icon: AlignRight, cmd: "justifyRight", title: "Align Right" },
    ],
    history: [
        { key: "undo", icon: Undo, cmd: "undo", title: "Undo (Ctrl+Z)" },
        { key: "redo", icon: Redo, cmd: "redo", title: "Redo (Ctrl+Y)" },
    ]
};

const BLOCK_FORMATS = [
    { value: "p", label: "Normal" },
    { value: "h1", label: "Heading 1" },
    { value: "h2", label: "Heading 2" },
    { value: "h3", label: "Heading 3" },
    { value: "h4", label: "Heading 4" },
    { value: "blockquote", label: "Quote" },
];

const FONT_SIZES = [
    { value: "1", label: "Small" },
    { value: "3", label: "Normal" },
    { value: "4", label: "Large" },
    { value: "5", label: "X-Large" },
];

export const RichTextEditor: React.FC<RichTextEditorProps> = ({ value, onChange, disabled = false, error, placeholder = "Start writing..." }) => {
    const editorRef = useRef<HTMLDivElement>(null);
    const [isPreview, setIsPreview] = useState(false);
    const [currentSize, setCurrentSize] = useState("3");
    const [currentFormat, setCurrentFormat] = useState("p");
    const [activeStates, setActiveStates] = useState<Set<string>>(new Set());

    useEffect(() => {
        if (editorRef.current && editorRef.current.innerHTML !== value && !isPreview) {
            editorRef.current.innerHTML = value || "";
        }
    }, [value, isPreview]);

    const indentListItem = useCallback((listItem: Element) => {
        const parentList = listItem.parentNode as Element;
        const previousSibling = listItem.previousElementSibling;
        
        if (previousSibling && previousSibling.tagName.toLowerCase() === 'li') {
            // Get or create nested list in previous sibling
            let nestedList = previousSibling.querySelector('ul, ol') as HTMLElement;
            
            if (!nestedList) {
                // Create new nested list with same type as parent
                const listType = parentList.tagName.toLowerCase();
                nestedList = document.createElement(listType) as HTMLElement;
                if (nestedList.style) {
                    nestedList.style.listStyleType = listType === 'ul' ? 'circle' : 'lower-alpha';
                }
                previousSibling.appendChild(nestedList);
            }
            
            // Move current item to nested list
            nestedList.appendChild(listItem);
        }
    }, []);

    const outdentListItem = useCallback((listItem: Element) => {
        const parentList = listItem.parentNode as Element;
        const grandParentListItem = parentList?.parentNode as Element;
        const greatGrandParentList = grandParentListItem?.parentNode as Element;
        
        // Check if we're in a nested list
        if (grandParentListItem && grandParentListItem.tagName.toLowerCase() === 'li' && 
            greatGrandParentList && (greatGrandParentList.tagName.toLowerCase() === 'ul' || greatGrandParentList.tagName.toLowerCase() === 'ol')) {
            
            // Move item to parent level
            const nextSibling = grandParentListItem.nextElementSibling;
            if (nextSibling) {
                greatGrandParentList.insertBefore(listItem, nextSibling);
            } else {
                greatGrandParentList.appendChild(listItem);
            }
            
            // Clean up empty nested list
            if (parentList.children.length === 0) {
                parentList.remove();
            }
        }
    }, []);

    const updateStates = useCallback(() => {
        const states = new Set<string>();
        const checkStates = ["bold", "italic", "underline", "insertUnorderedList", "insertOrderedList"];

        checkStates.forEach(state => {
            try {
                if (document.queryCommandState(state)) {
                    states.add(state === "insertUnorderedList" ? "bulletList" :
                        state === "insertOrderedList" ? "numberedList" : state);
                }
            } catch (e) {
                // Silently handle unsupported commands
            }
        });

        try {
            const selection = window.getSelection();

            if (selection && selection.rangeCount > 0) {
                let element: Node | null = selection.getRangeAt(0).startContainer;
                if (element.nodeType === Node.TEXT_NODE) {
                    element = element.parentNode;
                }

                while (element && element !== editorRef.current) {
                    if (element.nodeType === Node.ELEMENT_NODE) {
                        const tagName = (element as Element).tagName?.toLowerCase();
                        if (tagName && ["h1", "h2", "h3", "h4", "h5", "h6", "p", "div", "blockquote"].includes(tagName)) {
                            setCurrentFormat(tagName === "div" ? "p" : tagName);
                            break;
                        }
                    }
                    element = element.parentNode;
                }
            }
            const size = document.queryCommandValue("fontSize") || "3";
            setCurrentSize(size);
        } catch (e) {
            setCurrentFormat("p");
        }
        setActiveStates(states);
    }, []); 

    const executeCommand = useCallback((cmd: string, value?: string) => {
        if (disabled) {
            return;
        }

        try {
            if (editorRef.current) {
                editorRef.current.focus();
            }
            
            setTimeout(() => {
                if (cmd === "formatBlock") {
                    const selection = window.getSelection();
                    if (selection && selection.rangeCount > 0) {
                        if (value === "p") {
                            document.execCommand("formatBlock", false, "<p>");
                        } else if (value === "blockquote") {
                            document.execCommand("formatBlock", false, "<blockquote>");
                        } else if (value?.startsWith("h")) {
                            document.execCommand("formatBlock", false, `<${value}>`);
                        }
                        setCurrentFormat(value || "p");
                    }
                } else {
                    document.execCommand(cmd, false, value);
                }
                
                if (editorRef.current) {
                    onChange(editorRef.current.innerHTML || "");
                }
                setTimeout(updateStates, 10);
            }, 10);
        } catch (e) {
            console.warn("Command failed: ", cmd, e);
        }
    }, [disabled, onChange, updateStates]);

    const handleChange = useCallback(() => {
        onChange(editorRef.current?.innerHTML || "");
        updateStates();
    }, [onChange, updateStates]);

    const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
        // Handle Tab for nested lists
        if (e.key === 'Tab') {
            const selection = window.getSelection();
            if (selection && selection.rangeCount > 0) {
                let element: Node | null = selection.getRangeAt(0).startContainer;
                if (element.nodeType === Node.TEXT_NODE) {
                    element = element.parentNode;
                }
                
                // Check if we're inside a list item
                let listItem: Element | null = null;
                let currentElement = element;
                
                while (currentElement && currentElement !== editorRef.current) {
                    if (currentElement.nodeType === Node.ELEMENT_NODE) {
                        const tagName = (currentElement as Element).tagName?.toLowerCase();
                        if (tagName === 'li') {
                            listItem = currentElement as Element;
                            break;
                        }
                    }
                    currentElement = currentElement.parentNode;
                }
                
                if (listItem) {
                    e.preventDefault();
                    
                    if (e.shiftKey) {
                        // Shift+Tab: Outdent (move to parent level)
                        outdentListItem(listItem);
                    } else {
                        // Tab: Indent (create nested list)
                        indentListItem(listItem);
                    }
                    
                    onChange(editorRef.current?.innerHTML || "");
                    setTimeout(updateStates, 10);
                    return;
                }
            }
        }

        // Existing keyboard shortcuts
        if (!e.ctrlKey && !e.metaKey) {
            return;
        }

        const shortcuts: Record<string, () => void> = {
            "b": () => executeCommand("bold"),
            "i": () => executeCommand("italic"),
            "u": () => executeCommand("underline"),
            "z": () => executeCommand(e.shiftKey ? "redo" : "undo"),
            "y": () => executeCommand("redo"),
        };

        const handler = shortcuts[e.key.toLowerCase()];
        if (handler) {
            e.preventDefault();
            handler();
        }
    }, [executeCommand, onChange, updateStates, indentListItem, outdentListItem]);

    const insertLink = useCallback(() => {
        const url = prompt("Enter URL:", "https://");
        if (url && url !== "https://") {
            const selection = window.getSelection()?.toString();
            if (selection) {
                executeCommand("createLink", url);
            } else {
                const text = prompt("Link text:", "Link") || "Link";
                executeCommand("insertHTML", `<a href="${url}" target="_blank">${text}</a>`);
            }
        }
    }, [executeCommand]);

    const insertCode = useCallback(() => {
        const selection = window.getSelection();
        if (selection?.rangeCount) {
            const text = selection.toString();
            if (text) {
                executeCommand("insertHTML", `<code>${text}</code>`);
            }
        }
    }, [executeCommand]);

    const handlePaste = useCallback((e: React.ClipboardEvent) => {
        if (disabled) {
            return;
        }
        e.preventDefault();
        const text = e.clipboardData.getData("text/plain");
        executeCommand("insertText", text);
    }, [disabled, executeCommand]);

    

    const ToolbarButton = ({ command, isActive, onClick }: { command: any; isActive?: boolean; onClick: () => void; }) => (
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
            className = {`p-2 rounded-md transition-colors ${
                isActive
                    ? "bg-blue-100 text-blue-600"
                    : "text-gray-600 hover:bg-gray-100"
            }`}
            title = {command.title}
            disabled = {disabled}
        >
            <command.icon className = "h-4 w-4" />
        </button>
    );

    const ToolbarGroup = ({ children }: { children: React.ReactNode }) => (
        <div className = "flex items-center gap-1 bg-white rounded-lg p-1 shadow-sm">
            {children}
        </div>
    );

    return (
        <div className = {`border-2 rounded-xl overflow-hidden transition-all duration-200 flex flex-col h-96 ${
            error
                ? "border-red-300 shadow-sm shadow-red-100"
                : "border-gray-200 hover:border-gray-300 focus-within:border-blu-400"
        }`}>
            <div className = "flex-shrink-0 bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200 p-3">
                <div className = "flex flex-wrap items-center gap-2">
                    <ToolbarGroup>
                        {COMMANDS.history.map(cmd => (
                            <ToolbarButton
                                key = {cmd.key}
                                command = {cmd}
                                onClick = {() => executeCommand(cmd.cmd)}
                            />
                        ))}
                    </ToolbarGroup>
                    <div className = "w-px h-6 bg-gray-300" />
                    <ToolbarGroup>
                        <select
                            value = {currentFormat}
                            onMouseDown = {(e) => e.preventDefault()}
                            onChange = {(e) => {
                                const format = e.target.value;
                                executeCommand("formatBlock", format);
                            }}
                            className = "text-sm border-0 bg-transparent px-2 py-1 rounded focus:outline-none min-w-[100px]"
                            disabled = {disabled}
                        >
                            {BLOCK_FORMATS.map(fmt => (
                                <option key = {fmt.value} value={fmt.value}> {fmt.label} </option>
                            ))}
                        </select>
                        <ChevronDown className = "h-3 w-3 text-gray-400" />
                    </ToolbarGroup>

                    <ToolbarGroup>
                        <select
                            value = {currentSize}
                            onMouseDown = {(e) => e.preventDefault()}
                            onChange = {(e) => {
                                const size = e.target.value;
                                executeCommand("fontSize", size);
                            }}
                            className = "text-sm border-0 bg-transparent px-2 py-1 rounded focus:outline-none min-w-[80px]"
                            disabled = {disabled}
                        >
                            {FONT_SIZES.map(size => (
                                <option key = {size.value} value={size.value}> {size.label} </option>
                            ))}
                        </select>
                        <ChevronDown className = "h-3 w-3 text-gray-400" />
                    </ToolbarGroup>
                    <div className = "w-px h-6 bg-gray-300" />
                    <ToolbarGroup>
                        {COMMANDS.format.map(cmd => (
                            <ToolbarButton
                                key = {cmd.key}
                                command = {cmd}
                                isActive = {activeStates.has(cmd.key)}
                                onClick = {() => executeCommand(cmd.cmd)}
                            />
                        ))}
                    </ToolbarGroup>
                    <div className = "w-px h-6 bg-gray-300" />
                    <ToolbarGroup>
                        {COMMANDS.lists.map(cmd => (
                            <ToolbarButton
                                key = {cmd.key}
                                command = {cmd}
                                isActive = {activeStates.has(cmd.key)}
                                onClick = {() => executeCommand(cmd.cmd, cmd.value)}
                            />
                        ))}
                    </ToolbarGroup>
                    <div className = "w-px h-6 bg-gray-300" />
                    <ToolbarGroup>
                        {COMMANDS.align.map(cmd => (
                            <ToolbarButton
                                key = {cmd.key}
                                command = {cmd}
                                onClick = {() => executeCommand(cmd.cmd)}
                            />
                        ))}
                    </ToolbarGroup>
                    <div className = "w-px h-6 bg-gray-300" />
                    <ToolbarGroup>
                        <ToolbarButton
                            command = {{ icon: LinkIcon, title: "Insert Link" }}
                            onClick = {insertLink}
                        />
                        <input
                            type = "color"
                            onMouseDown = {(e) => e.preventDefault()}
                            onChange = {(e) => executeCommand("foreColor", e.target.value)}
                            className = "w-8 h-8 rounded border border-gray-300 cursor-pointer"
                            title = "Text Color"
                            disabled = {disabled}
                            defaultValue = "#000000"
                        />
                        <ToolbarButton
                            command = {{ icon: Code, title: "Inline Code" }}
                            onClick = {insertCode}
                        />
                    </ToolbarGroup>
                    <div className = "w-px h-6 bg-gray-300" />
                    <button
                        type = "button"
                        onMouseDown = {(e) => e.preventDefault()}
                        onClick = {() => setIsPreview(!isPreview)}
                        className = {`flex items-center gap-2 px-3 py-2 rounded-lg transition-all ${
                            isPreview 
                                ? "bg-blue-500 text-white shadow-md" 
                                : "bg-white text-gray-600 hover:bg-gray-50 shadow-sm"
                        }`}
                        disabled = {disabled}
                    >
                        {isPreview ? <Edit3 className = "h-4 w-4" /> : <Eye className = "h-4 w-4" />}
                        <span className = "text-sm font-medium">
                            {isPreview ? "Edit" : "Preview"}
                        </span>
                    </button>
                </div>
            </div>
            <div className = "bg-white flex-1 min-h-0">
                {isPreview ? (
                    <div className = "h-full overflow-y-auto">
                        <div 
                            className = "prose max-w-none p-6 text-black"
                            dangerouslySetInnerHTML={{ 
                                __html: value || `<p class="text-gray-500 italic"> ${placeholder} </p>` 
                            }}
                        />
                    </div>
                ) : (
                    <div className = "h-full overflow-y-auto">
                        <div
                            ref = {editorRef}
                            contentEditable = {!disabled}
                            onInput = {handleChange}
                            onBlur = {handleChange}
                            onKeyDown = {handleKeyDown}
                            onFocus = {updateStates}
                            onMouseUp = {updateStates}
                            onKeyUp = {updateStates}
                            onPaste = {handlePaste}
                            className = "p-6 min-h-full outline-none text-gray-800 leading-relaxed editor-content"
                            suppressContentEditableWarning = {true}
                            data-placeholder = {placeholder}
                        />
                    </div>
                )}
            </div>

            {/* CHARACTER COUNT */}
            {!isPreview && (
                <div className = "flex-shrink-0 px-6 py-2 bg-gray-50 border-t text-xs text-gray-500">
                    {(editorRef.current?.textContent || "").length} characters
                </div>
            )}

            <style jsx global>{`
                .editor-content:empty:before {
                    content: attr(data-placeholder);
                    color: #9ca3af;
                    font-style: italic;
                    pointer-events: none;
                }
                
                /* Heading Styles - Using !important to override browser defaults */
                .editor-content h1 { 
                    font-size: 2.5em !important; 
                    font-weight: 700 !important; 
                    margin: 0.8em 0 0.4em 0 !important; 
                    line-height: 1.2 !important;
                    color: #111827 !important;
                    display: block !important;
                }
                
                .editor-content h2 { 
                    font-size: 2em !important; 
                    font-weight: 600 !important; 
                    margin: 0.7em 0 0.35em 0 !important; 
                    line-height: 1.3 !important;
                    color: #1f2937 !important;
                    display: block !important;
                }
                
                .editor-content h3 { 
                    font-size: 1.5em !important; 
                    font-weight: 600 !important; 
                    margin: 0.6em 0 0.3em 0 !important; 
                    line-height: 1.4 !important;
                    color: #374151 !important;
                    display: block !important;
                }
                
                .editor-content h4 { 
                    font-size: 1.25em !important; 
                    font-weight: 600 !important; 
                    margin: 0.5em 0 0.25em 0 !important; 
                    line-height: 1.4 !important;
                    color: #4b5563 !important;
                    display: block !important;
                }
                
                .editor-content h5 { 
                    font-size: 1.1em !important; 
                    font-weight: 600 !important; 
                    margin: 0.4em 0 0.2em 0 !important; 
                    line-height: 1.4 !important;
                    color: #6b7280 !important;
                    display: block !important;
                }
                
                .editor-content h6 { 
                    font-size: 1em !important; 
                    font-weight: 600 !important; 
                    margin: 0.3em 0 0.15em 0 !important; 
                    line-height: 1.4 !important;
                    color: #6b7280 !important;
                    display: block !important;
                }
                
                .editor-content p { 
                    font-size: 1em !important;
                    font-weight: 400 !important;
                    margin: 0.5em 0 !important; 
                    line-height: 1.6 !important;
                    color: #374151 !important;
                    display: block !important;
                }
                
                .editor-content blockquote {
                    border-left: 4px solid #3b82f6 !important;
                    padding: 1em 1.5em !important;
                    margin: 1em 0 !important;
                    background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%) !important;
                    border-radius: 0 0.5rem 0.5rem 0 !important;
                    font-style: italic !important;
                    color: #4b5563 !important;
                    display: block !important;
                    font-size: 1em !important;
                }
                
                /* Base List Styles */
                .editor-content ul { 
                    padding-left: 2em !important; 
                    margin: 1em 0 !important;
                    list-style-type: disc !important;
                    display: block !important;
                }
                
                .editor-content ol { 
                    padding-left: 2em !important; 
                    margin: 1em 0 !important;
                    list-style-type: decimal !important;
                    display: block !important;
                }
                
                /* Nested List Styles */
                .editor-content ul ul {
                    list-style-type: circle !important;
                    margin: 0.25em 0 !important;
                    padding-left: 1.5em !important;
                }

                .editor-content ul ul ul {
                    list-style-type: square !important;
                    margin: 0.25em 0 !important;
                    padding-left: 1.5em !important;
                }

                .editor-content ol ol {
                    list-style-type: lower-alpha !important;
                    margin: 0.25em 0 !important;
                    padding-left: 1.5em !important;
                }

                .editor-content ol ol ol {
                    list-style-type: lower-roman !important;
                    margin: 0.25em 0 !important;
                    padding-left: 1.5em !important;
                }
                
                .editor-content li { 
                    margin: 0.5em 0 !important; 
                    line-height: 1.6 !important; 
                    font-size: 1em !important;
                    display: list-item !important;
                    color: #374151 !important;
                }
                
                .editor-content a { 
                    color: #3b82f6 !important; 
                    text-decoration: underline !important; 
                }
                
                .editor-content code {
                    background: #f3f4f6 !important;
                    color: #dc2626 !important;
                    padding: 0.2em 0.4em !important;
                    border-radius: 0.25rem !important;
                    font-family: "SF Mono", "Monaco", "Cascadia Code", "Roboto Mono", monospace !important;
                    font-size: 0.9em !important;
                    border: 1px solid #d1d5db !important;
                }
                
                .editor-content strong, .editor-content b { 
                    font-weight: 700 !important; 
                    color: inherit !important;
                }
                
                .editor-content em, .editor-content i { 
                    font-style: italic !important; 
                    color: inherit !important;
                }
                
                .editor-content u {
                    text-decoration: underline !important;
                    color: inherit !important;
                }
                
                /* Ensure proper display for all block elements */
                .editor-content div {
                    display: block !important;
                    margin: 0.5em 0 !important;
                }
                
                /* Preview mode prose styling */
                .prose h1 { 
                    font-size: 2.5em !important; 
                    font-weight: 700 !important; 
                    margin: 0.8em 0 0.4em 0 !important; 
                    line-height: 1.2 !important;
                    color: #111827 !important;
                }
                
                .prose h2 { 
                    font-size: 2em !important; 
                    font-weight: 600 !important; 
                    margin: 0.7em 0 0.35em 0 !important; 
                    line-height: 1.3 !important;
                    color: #1f2937 !important;
                }
                
                .prose h3 { 
                    font-size: 1.5em !important; 
                    font-weight: 600 !important; 
                    margin: 0.6em 0 0.3em 0 !important; 
                    line-height: 1.4 !important;
                    color: #374151 !important;
                }
                
                .prose h4 { 
                    font-size: 1.25em !important; 
                    font-weight: 600 !important; 
                    margin: 0.5em 0 0.25em 0 !important; 
                    line-height: 1.4 !important;
                    color: #4b5563 !important;
                }
                
                .prose p { 
                    font-size: 1em !important;
                    margin: 0.5em 0 !important; 
                    line-height: 1.6 !important;
                    color: #374151 !important;
                }
                
                .prose blockquote {
                    border-left: 4px solid #3b82f6 !important;
                    padding: 1em 1.5em !important;
                    margin: 1em 0 !important;
                    background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%) !important;
                    border-radius: 0 0.5rem 0.5rem 0 !important;
                    font-style: italic !important;
                    color: #4b5563 !important;
                }
                
                /* Preview mode base lists */
                .prose ul { 
                    padding-left: 2em !important; 
                    margin: 1em 0 !important;
                    list-style-type: disc !important;
                }
                
                .prose ol { 
                    padding-left: 2em !important; 
                    margin: 1em 0 !important;
                    list-style-type: decimal !important;
                }

                /* Preview mode nested lists */
                .prose ul ul {
                    list-style-type: circle !important;
                    margin: 0.25em 0 !important;
                    padding-left: 1.5em !important;
                }

                .prose ul ul ul {
                    list-style-type: square !important;
                    margin: 0.25em 0 !important;
                    padding-left: 1.5em !important;
                }

                .prose ol ol {
                    list-style-type: lower-alpha !important;
                    margin: 0.25em 0 !important;
                    padding-left: 1.5em !important;
                }

                .prose ol ol ol {
                    list-style-type: lower-roman !important;
                    margin: 0.25em 0 !important;
                    padding-left: 1.5em !important;
                }
                
                .prose li { 
                    margin: 0.5em 0 !important; 
                    line-height: 1.6 !important;
                    display: list-item !important;
                }
                
                .prose a { 
                    color: #3b82f6 !important; 
                    text-decoration: underline !important; 
                }
                
                .prose strong, .prose b { 
                    font-weight: 700 !important; 
                }
                
                .prose em, .prose i { 
                    font-style: italic !important; 
                }
                
                .prose code {
                    background: #f3f4f6 !important;
                    color: #dc2626 !important;
                    padding: 0.2em 0.4em !important;
                    border-radius: 0.25rem !important;
                    font-family: "SF Mono", "Monaco", "Cascadia Code", "Roboto Mono", monospace !important;
                    font-size: 0.9em !important;
                    border: 1px solid #d1d5db !important;
                }
            `}</style>
        </div>
    );
};