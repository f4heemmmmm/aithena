"use client";

import React, { useRef, useState, useCallback } from "react";
import { Upload, X, Image as ImageIcon, AlertTriangle, Loader2 } from "lucide-react";

import { ImageUploadError, UploadedImageData } from "@/services/blogService";
import { imageCompressionService, CompressionOptions } from "@/utils/imageCompression";

interface ImageUploadProps {
    value?: string;
    filename?: string;
    contentType?: string;
    onChange: (imageData: UploadedImageData | null) => void;
    disabled?: boolean;
    error?: string;
    maxSizeBytes?: number;
    maxOriginalSizeBytes?: number;
    acceptedTypes?: string[];
    compressionOptions?: CompressionOptions;
    className?: string;
}

const ImageUpload: React.FC<ImageUploadProps> = ({
    value,
    filename,
    contentType,
    onChange,
    disabled = false,
    error,
    maxSizeBytes = 1024 * 1024,
    maxOriginalSizeBytes = 10 * 1024 * 1024,
    acceptedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"],
    compressionOptions = {
        maxWidth: 1200,
        maxHeight: 800,
        quality: 0.8,
        maxSizeBytes: 1024 * 1024
    },
    className = ""
}) => {
    const [dragOver, setDragOver] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [compressionProgress, setCompressionProgress] = useState<string>("");
    const [uploadError, setUploadError] = useState<ImageUploadError | null>(null);

    // useRef()
    const fileInputRef = useRef<HTMLInputElement>(null);

    const validateFile = useCallback((file: File): ImageUploadError | null => {
        if (file.size > maxOriginalSizeBytes) {
            return {
                type: "file_too_large",
                message: `Original file size must be less than ${Math.round(maxOriginalSizeBytes / (1024 * 1024))}MB`
            };
        }
        if (!acceptedTypes.includes(file.type)) {
            return {
                type: "invalid_type",
                message: `File type must be one of: ${acceptedTypes.map(type => type.split("/")[1]).join(", ")}`
            };
        }
        return null;
    }, [maxOriginalSizeBytes, acceptedTypes]);

    const processFile = useCallback(async (file: File): Promise<UploadedImageData> => {
        setCompressionProgress("Analyzing image...");

        const shouldCompress = imageCompressionService.shouldCompress(file, maxSizeBytes);

        if (shouldCompress) {
            setCompressionProgress("Compressing image...");

            try {
                const compressed = await imageCompressionService.compressImage(file, {
                    ...compressionOptions,
                    maxSizeBytes
                });

                setCompressionProgress(`Compressed from ${imageCompressionService.formatFileSize(compressed.originalSize)} to ${imageCompressionService.formatFileSize(compressed.size)}`);

                return {
                    base64: compressed.base64,
                    filename: compressed.filename,
                    content_type: compressed.contentType,
                    size: compressed.size,
                };
            } catch (error) {
                console.error("Compression failed:", error);
                throw new Error("Failed to compress image. Please try a smaller image.");
            }
        } else {
            setCompressionProgress("Processing image...");

            const base64File = await imageCompressionService.fileToBase64(file);

            return {
                base64: base64File,
                filename: file.name,
                content_type: file.type,
                size: file.size,
            };
        }
    }, [maxSizeBytes, compressionOptions]);

    const handleFileSelect = useCallback(async (file: File) => {
        if (disabled) {
            return;
        }

        setUploadError(null);
        setUploading(true);
        setCompressionProgress("");

        try {
            const validationError = validateFile(file);
            if (validationError) {
                setUploadError(validationError);
                return;
            }

            const imageData = await processFile(file);

            if (imageData.size > maxSizeBytes) {
                setUploadError({
                    type: "file_too_large",
                    message: `Compressed image is still too large. Please try a smaller image.`
                });
                return;
            }
            onChange(imageData);
            setCompressionProgress("");
        } catch (error) {
            console.error("Error processing file:", error);
            setUploadError({
                type: "processing_failed",
                message: error instanceof Error ? error.message : "Failed to process the image file"
            });
        } finally {
            setUploading(false);
        }
    }, [disabled, validateFile, processFile, onChange, maxSizeBytes]);

    const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            handleFileSelect(file);
        }
        e.target.value = "";
    }, [handleFileSelect]);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setDragOver(false);

        const file = e.dataTransfer.files[0];
        if (file) {
            handleFileSelect(file);
        }
    }, [handleFileSelect]);

    const handleDragOver = useCallback((e: React.DragEvent) => {
            e.preventDefault();
            if (!disabled) {
                setDragOver(true);
            }
    }, [disabled]);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
            e.preventDefault();
            setDragOver(false);
    }, []);
    
    const handleRemove = useCallback(() => {
        if (!disabled) {
            onChange(null);
            setUploadError(null);
        }
    }, [disabled, onChange]);

    const handleClick = useCallback(() => {
        if (!disabled && fileInputRef.current) {
            fileInputRef.current.click();
        }
    }, [disabled]);

    const displayError = uploadError || (error ? { type: "upload_failed" as const, message: error } : null);

    return (
        <div className = {`space-y-3 ${className}`}>
            <input
                ref = {fileInputRef}
                type = "file"
                accept = {acceptedTypes.join(",")}
                onChange = {handleInputChange}
                className = "hidden"
                disabled = {disabled}
            />

            {value ? (
                <div className = "relative group">
                    <div className = "relative border-2 border-gray-200 rounded-xl overflow-hidden bg-gray-50">
                        <img
                            src ={value}
                            alt = {filename || "Uploaded image"}
                            className = "w-full h-64 object-cover"
                        />
                        <div className = "absolute inset-0 backdrop-blur-sm pointer-events-none" />

                        <div className = "absolute inset-0 flex items-center justify-center">
                            <div className = "opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex space-x-2">
                                <button
                                    type = "button"
                                    onClick = {handleClick}
                                    disabled = {disabled || uploading}
                                    className = "p-2 bg-white rounded-full hover:bg-gray-100 transition-colors disabled:opacity-50"
                                    title = "Replace image"
                                >
                                    <Upload className = "h-5 w-5 text-gray-700" />
                                </button>
                                <button
                                    type = "button"
                                    onClick = {handleRemove}
                                    disabled = {disabled || uploading}
                                    className = "p-2 bg-white rounded-full hover:bg-gray-100 transition-colors disabled:opacity-50"
                                    title = "Remove image"
                                >
                                    <X className = "h-5 w-5 text-red-600" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <div
                    onClick = {handleClick}
                    onDrop = {handleDrop}
                    onDragOver = {handleDragOver}
                    onDragLeave = {handleDragLeave}
                    className = {`
                        border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-all duration-200
                        ${dragOver 
                            ? "border-blue-400 bg-blue-50" 
                            : "border-gray-300 hover:border-gray-400 hover:bg-gray-50"
                        }
                        ${disabled ? "opacity-50 cursor-not-allowed" : ""}
                        ${displayError ? "border-red-300 bg-red-50" : ""}
                    `}
                >
                    <div className = "flex flex-col items-center space-y-3">
                        {uploading ? (
                            <>
                                <div className = "flex items-center space-x-2">
                                    <Loader2 className = "h-6 w-6 animate-spin text-blue-600" />
                                    <div className = "text-sm text-blue-600">
                                        {compressionProgress || "Processing image..."}
                                    </div>
                                </div>
                                <p className = "text-xs text-gray-500">Please wait...</p>
                            </>
                        ) : (
                            <>
                                <div className = {`p-3 rounded-full ${displayError ? "bg-red-100" : "bg-blue-100"}`}>
                                    {displayError ? (
                                        <AlertTriangle className = {`h-8 w-8 text-red-600`} />
                                    ) : (
                                        <ImageIcon className = {`h-8 w-8 text-blue-800`} />
                                    )}
                                </div>
                                
                                <div className = "space-y-1">
                                    <p className = {`text-lg font-medium ${displayError ? "text-red-700" : "text-gray-700"}`}>
                                        {displayError ? "Upload Failed" : "Drop your image here, or browse"}
                                    </p>
                                </div>

                                <div className = "text-sm text-gray-400 space-y-1">
                                    <div> Supported: {acceptedTypes.map(type => type.split("/")[1].toUpperCase()).join(", ")} </div>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}

            {displayError && (
                <div className = "flex items-center space-x-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-3">
                    <AlertTriangle className = "h-4 w-4 flex-shrink-0" />
                    <span> {displayError.message} </span>
                </div>
            )}
        </div>
    );
};

export default ImageUpload;