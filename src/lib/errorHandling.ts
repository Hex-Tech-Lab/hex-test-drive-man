/**
 * Error Handling Utilities
 * Created: 2026-01-08
 * Agent: BB
 * MVP 1.5 Phase 2: Production Error Handling
 */

export enum ErrorType {
  NETWORK = 'NETWORK',
  CAMERA = 'CAMERA',
  OCR = 'OCR',
  STORAGE = 'STORAGE',
  VALIDATION = 'VALIDATION',
  UNKNOWN = 'UNKNOWN',
}

export interface AppError {
  type: ErrorType;
  message: string;
  originalError?: Error;
  retryable: boolean;
  userMessage: string;
}

/**
 * Create app error from unknown error
 */
export function createAppError(
  error: unknown,
  type: ErrorType = ErrorType.UNKNOWN,
): AppError {
  const originalError = error instanceof Error ? error : new Error(String(error));
  
  let message = originalError.message;
  let retryable = false;
  let userMessage = 'An unexpected error occurred. Please try again.';

  // Network errors
  if (
    message.includes('fetch') ||
    message.includes('network') ||
    message.includes('NetworkError')
  ) {
    type = ErrorType.NETWORK;
    retryable = true;
    userMessage = 'Network error. Please check your connection and try again.';
  }

  // Camera errors
  if (
    message.includes('camera') ||
    message.includes('getUserMedia') ||
    message.includes('NotAllowedError') ||
    message.includes('NotFoundError')
  ) {
    type = ErrorType.CAMERA;
    retryable = false;
    userMessage = 'Camera access denied or not available. Please enable camera permissions.';
  }

  // Storage errors
  if (
    message.includes('quota') ||
    message.includes('storage') ||
    message.includes('QuotaExceededError')
  ) {
    type = ErrorType.STORAGE;
    retryable = false;
    userMessage = 'Storage quota exceeded. Please free up space and try again.';
  }

  // OCR errors
  if (message.includes('OCR') || message.includes('extraction')) {
    type = ErrorType.OCR;
    retryable = true;
    userMessage = 'Failed to extract information. Please ensure the image is clear and try again.';
  }

  return {
    type,
    message,
    originalError,
    retryable,
    userMessage,
  };
}

/**
 * Handle network error with retry logic
 */
export async function handleNetworkError<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  delayMs: number = 1000,
): Promise<T> {
  let lastError: Error | null = null;

  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      
      // Don't retry on non-network errors
      const appError = createAppError(error);
      if (appError.type !== ErrorType.NETWORK) {
        throw error;
      }

      // Wait before retry (exponential backoff)
      if (i < maxRetries - 1) {
        await new Promise((resolve) => setTimeout(resolve, delayMs * Math.pow(2, i)));
      }
    }
  }

  throw lastError || new Error('Max retries exceeded');
}

/**
 * Check camera permissions
 */
export async function checkCameraPermission(): Promise<{
  granted: boolean;
  error?: string;
}> {
  if (typeof window === 'undefined' || !navigator.mediaDevices) {
    return { granted: false, error: 'Camera not supported' };
  }

  try {
    const result = await navigator.permissions.query({ name: 'camera' as PermissionName });
    
    if (result.state === 'granted') {
      return { granted: true };
    } else if (result.state === 'denied') {
      return { granted: false, error: 'Camera permission denied' };
    } else {
      return { granted: false, error: 'Camera permission not determined' };
    }
  } catch (error) {
    // Fallback: try to access camera directly
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      stream.getTracks().forEach((track) => track.stop());
      return { granted: true };
    } catch (err) {
      return {
        granted: false,
        error: err instanceof Error ? err.message : 'Camera access failed',
      };
    }
  }
}

/**
 * Validate file size
 */
export function validateFileSize(file: File, maxSizeMB: number = 10): AppError | null {
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  
  if (file.size > maxSizeBytes) {
    return {
      type: ErrorType.VALIDATION,
      message: `File size exceeds ${maxSizeMB}MB`,
      retryable: false,
      userMessage: `File is too large. Maximum size is ${maxSizeMB}MB.`,
    };
  }

  return null;
}

/**
 * Validate file type
 */
export function validateFileType(
  file: File,
  allowedTypes: string[] = ['image/jpeg', 'image/png', 'image/jpg'],
): AppError | null {
  if (!allowedTypes.includes(file.type)) {
    return {
      type: ErrorType.VALIDATION,
      message: `Invalid file type: ${file.type}`,
      retryable: false,
      userMessage: 'Invalid file type. Please upload a JPEG or PNG image.',
    };
  }

  return null;
}

/**
 * Log error to monitoring service (Sentry)
 */
export function logError(error: AppError | Error, context?: Record<string, any>): void {
  console.error('[Error]', error, context);

  // In production, send to Sentry
  if (typeof window !== 'undefined' && (window as any).Sentry) {
    (window as any).Sentry.captureException(error, {
      extra: context,
    });
  }
}

/**
 * Get user-friendly error message
 */
export function getUserErrorMessage(error: unknown, locale: string = 'en'): string {
  const appError = createAppError(error);

  const messages = {
    en: {
      [ErrorType.NETWORK]: 'Network error. Please check your connection and try again.',
      [ErrorType.CAMERA]: 'Camera access denied. Please enable camera permissions in your browser settings.',
      [ErrorType.OCR]: 'Failed to read document. Please ensure the image is clear and try again.',
      [ErrorType.STORAGE]: 'Storage quota exceeded. Please free up space and try again.',
      [ErrorType.VALIDATION]: appError.userMessage,
      [ErrorType.UNKNOWN]: 'An unexpected error occurred. Please try again.',
    },
    ar: {
      [ErrorType.NETWORK]: 'خطأ في الشبكة. يرجى التحقق من اتصالك والمحاولة مرة أخرى.',
      [ErrorType.CAMERA]: 'تم رفض الوصول للكاميرا. يرجى تفعيل أذونات الكاميرا في إعدادات المتصفح.',
      [ErrorType.OCR]: 'فشل قراءة المستند. يرجى التأكد من وضوح الصورة والمحاولة مرة أخرى.',
      [ErrorType.STORAGE]: 'تم تجاوز حصة التخزين. يرجى تحرير مساحة والمحاولة مرة أخرى.',
      [ErrorType.VALIDATION]: appError.userMessage,
      [ErrorType.UNKNOWN]: 'حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى.',
    },
  };

  const localeMessages = messages[locale as keyof typeof messages] || messages.en;
  return localeMessages[appError.type] || localeMessages[ErrorType.UNKNOWN];
}
