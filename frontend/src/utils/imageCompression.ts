// utils/imageCompression.ts

export interface CompressionOptions {
    maxWidth?: number;
    maxHeight?: number;
    quality?: number; // 0.1 to 1.0
    maxSizeBytes?: number;
}

export interface CompressedImageResult {
    base64: string;
    filename: string;
    contentType: string;
    size: number;
    originalSize: number;
    compressionRatio: number;
}

class ImageCompressionService {
    /**
     * Compresses an image file to reduce its size while maintaining acceptable quality
     */
    async compressImage(
        file: File, 
        options: CompressionOptions = {}
    ): Promise<CompressedImageResult> {
        const {
            maxWidth = 1200,
            maxHeight = 800,
            quality = 0.8,
            maxSizeBytes = 1024 * 1024 // 1MB default
        } = options;

        return new Promise((resolve, reject) => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            const img = new Image();

            img.onload = () => {
                try {
                    // Calculate new dimensions while maintaining aspect ratio
                    const { width, height } = this.calculateDimensions(
                        img.width, 
                        img.height, 
                        maxWidth, 
                        maxHeight
                    );

                    canvas.width = width;
                    canvas.height = height;

                    if (!ctx) {
                        throw new Error('Failed to get canvas context');
                    }

                    // Draw and compress the image
                    ctx.drawImage(img, 0, 0, width, height);

                    // Try different quality levels to meet size requirements
                    this.findOptimalQuality(canvas, file.type, quality, maxSizeBytes)
                        .then(result => {
                            const originalSize = file.size;
                            const compressedSize = this.getBase64Size(result);
                            
                            resolve({
                                base64: result,
                                filename: file.name,
                                contentType: file.type,
                                size: compressedSize,
                                originalSize,
                                compressionRatio: originalSize / compressedSize
                            });
                        })
                        .catch(reject);
                } catch (error) {
                    reject(error);
                }
            };

            img.onerror = () => {
                reject(new Error('Failed to load image'));
            };

            img.src = URL.createObjectURL(file);
        });
    }

    /**
     * Calculate optimal dimensions while maintaining aspect ratio
     */
    private calculateDimensions(
        originalWidth: number, 
        originalHeight: number, 
        maxWidth: number, 
        maxHeight: number
    ): { width: number; height: number } {
        let { width, height } = { width: originalWidth, height: originalHeight };

        // If image is smaller than max dimensions, keep original size
        if (width <= maxWidth && height <= maxHeight) {
            return { width, height };
        }

        // Calculate scaling factor
        const widthRatio = maxWidth / width;
        const heightRatio = maxHeight / height;
        const ratio = Math.min(widthRatio, heightRatio);

        return {
            width: Math.round(width * ratio),
            height: Math.round(height * ratio)
        };
    }

    /**
     * Find the optimal quality that meets size requirements
     */
    private async findOptimalQuality(
        canvas: HTMLCanvasElement, 
        mimeType: string, 
        initialQuality: number, 
        maxSizeBytes: number
    ): Promise<string> {
        let quality = initialQuality;
        let attempts = 0;
        const maxAttempts = 8;
        
        while (attempts < maxAttempts) {
            const base64 = canvas.toDataURL(mimeType, quality);
            const size = this.getBase64Size(base64);
            
            if (size <= maxSizeBytes || quality <= 0.1) {
                return base64;
            }
            
            // Reduce quality by 15% each attempt
            quality *= 0.85;
            attempts++;
        }
        
        // If still too large, try converting to JPEG if it wasn't already
        if (mimeType !== 'image/jpeg') {
            return canvas.toDataURL('image/jpeg', 0.7);
        }
        
        // Last resort - very low quality JPEG
        return canvas.toDataURL('image/jpeg', 0.3);
    }

    /**
     * Calculate the size of a base64 string in bytes
     */
    private getBase64Size(base64String: string): number {
        // Remove data URL prefix
        const base64Data = base64String.split(',')[1] || base64String;
        
        // Calculate size: base64 is ~33% larger than original binary data
        // But we need the size of the base64 string itself for transmission
        return base64String.length;
    }

    /**
     * Validate if an image needs compression
     */
    shouldCompress(file: File, maxSizeBytes: number = 1024 * 1024): boolean {
        return file.size > maxSizeBytes;
    }

    /**
     * Get image dimensions without loading the full image
     */
    async getImageDimensions(file: File): Promise<{ width: number; height: number }> {
        return new Promise((resolve, reject) => {
            const img = new Image();
            
            img.onload = () => {
                resolve({ width: img.width, height: img.height });
                URL.revokeObjectURL(img.src);
            };
            
            img.onerror = () => {
                reject(new Error('Failed to load image'));
                URL.revokeObjectURL(img.src);
            };
            
            img.src = URL.createObjectURL(file);
        });
    }

    /**
     * Convert a File to base64 without compression
     */
    async fileToBase64(file: File): Promise<string> {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            
            reader.onload = (e) => {
                const base64 = e.target?.result as string;
                if (base64) {
                    resolve(base64);
                } else {
                    reject(new Error('Failed to convert file to base64'));
                }
            };
            
            reader.onerror = () => {
                reject(new Error('Failed to read file'));
            };
            
            reader.readAsDataURL(file);
        });
    }

    /**
     * Estimate the final base64 size before processing
     */
    estimateBase64Size(fileSizeBytes: number): number {
        // Base64 encoding increases size by approximately 33%
        // Plus data URL prefix adds some overhead
        return Math.ceil(fileSizeBytes * 1.37);
    }

    /**
     * Format file size for display
     */
    formatFileSize(bytes: number): string {
        if (bytes === 0) return '0 Bytes';
        
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
}

export const imageCompressionService = new ImageCompressionService();