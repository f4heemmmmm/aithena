export interface CompressionOptions {
    maxWidth?: number;
    maxHeight?: number;
    quality?: number;
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
    private calculateDimensions(originalWidth: number, originalHeight: number, maxWidth: number, maxHeight: number): { width: number; height: number } {
        let { width, height } = { width: originalWidth, height: originalHeight };

        if (width <= maxWidth && height <= maxHeight) {
            return { width, height };
        }

        const widthRatio = maxWidth / width;
        const heightRatio = maxHeight / height;
        const ratio = Math.min(widthRatio, heightRatio);

        return {
            width: Math.round(width * ratio),
            height: Math.round(height * ratio)
        };
    }

    private getBase64Size(base64String: string): number {
        const base64Data = base64String.split(',')[1] || base64String;
        return Math.ceil(base64Data.length * 0.75);
    }

    private async findOptimalQuality(canvas: HTMLCanvasElement, mimeType: string, initialQuality: number, maxSizeBytes: number): Promise<string> {
        let quality = initialQuality;
        let attempts = 0;
        const maxAttempts = 8;

        while (attempts < maxAttempts) {
            const base64 = canvas.toDataURL(mimeType, quality);
            const size = this.getBase64Size(base64);
            
            if (size <= maxSizeBytes || quality <= 0.1) {
                return base64;
            }
            
            quality *= 0.85;
            attempts++;
        }

        if (mimeType !== "image/jpeg") {
            return canvas.toDataURL("image/jpeg", 0.7);
        }

        return canvas.toDataURL("image/jpeg", 0.3);
    }

    shouldCompress(file: File, maxSizeBytes: number = 1024 * 1024): boolean {
        return file.size > maxSizeBytes;
    }

    estimateBase64Size(fileSizeBytes: number): number {
        return Math.ceil(fileSizeBytes * 1.33);
    }

    formatFileSize(bytes: number): string {
        if (bytes === 0) {
            return "0 Bytes";
        }
        const k = 1024;
        const sizes = ["Bytes", "KB", "MB", "GB"];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
    }

    async compressImage(file: File, options: CompressionOptions = {}): Promise<CompressedImageResult> {
        const { maxWidth = 1200, maxHeight = 800, quality = 0.8, maxSizeBytes = 1024 * 1024 } = options;
        
        return new Promise((resolve, reject) => {
            const canvas = document.createElement("canvas");
            const context = canvas.getContext("2d");
            const image = new Image();

            image.onload = async () => {
                try {
                    const { width, height } = this.calculateDimensions(
                        image.width,
                        image.height,
                        maxWidth,
                        maxHeight
                    );
                    
                    canvas.width = width;
                    canvas.height = height;

                    if (!context) {
                        throw new Error("Failed to get canvas context");
                    }

                    context.imageSmoothingEnabled = true;
                    context.imageSmoothingQuality = 'high';
                    context.drawImage(image, 0, 0, width, height);

                    try {
                        const result = await this.findOptimalQuality(canvas, file.type, quality, maxSizeBytes);
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
                    } catch (compressionError) {
                        reject(compressionError);
                    }
                } catch (error) {
                    reject(error);
                } finally {
                    URL.revokeObjectURL(image.src);
                }
            };

            image.onerror = () => {
                URL.revokeObjectURL(image.src);
                reject(new Error("Failed to load image"));
            };

            image.src = URL.createObjectURL(file);
        });
    }

    async getImageDimensions(file: File): Promise<{ width: number, height: number }> {
        return new Promise((resolve, reject) => {
            const image = new Image();

            image.onload = () => {
                resolve({ width: image.width, height: image.height });
                URL.revokeObjectURL(image.src);
            };

            image.onerror = () => {
                URL.revokeObjectURL(image.src);
                reject(new Error("Failed to load image"));
            };

            image.src = URL.createObjectURL(file);
        });
    }

    async fileToBase64(file: File): Promise<string> {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();

            reader.onload = (e) => {
                const base64 = e.target?.result as string;
                if (base64) {
                    resolve(base64);
                } else {
                    reject(new Error("Failed to convert file to base64"));
                }
            };

            reader.onerror = () => {
                reject(new Error("Failed to read file"));
            };

            reader.readAsDataURL(file);
        });
    }
}

export const imageCompressionService = new ImageCompressionService();
export default imageCompressionService;