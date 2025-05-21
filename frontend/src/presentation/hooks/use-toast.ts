// src/hooks/useToast.ts
import { useCallback } from "react";
import { toaster } from "@ui/chakra/toaster";

/**
 * Toast statuses supported by Chakra UI v3+.
 * Includes "loading" for persistent toasts.
 */
export type ToastType =
  | "loading"
  | "success"
  | "error"
  | "info"
  | "warning";

/**
 * Options that can be passed to `toaster.create()` or `toaster.update()`.
 */
export interface ToastOptions {
  /** Toast ID (auto-generated if not provided). */
  id?: string;
  /** Toast type (defines icon and color). */
  type?: ToastType;
  /** Main title of the toast. */
  title?: string;
  /** Secondary text below the title. */
  description?: string;
  /** Display duration in milliseconds (default: 5000ms). */
  duration?: number;
  /** Whether the toast is dismissible by the user. */
  isClosable?: boolean;
  /** Toast placement on the screen (e.g. "top-start", "bottom-end"). */
  placement?:
    | "top"
    | "top-start"
    | "top-end"
    | "bottom"
    | "bottom-start"
    | "bottom-end";
  /** Pause the toast when the page is idle/inactive. */
  pauseOnPageIdle?: boolean;
  /**
   * Optional custom action:
   * - label: button text
   * - onClick: callback fired on click
   */
  action?: {
    label: string;
    onClick: () => void;
  };
  /**
   * Internal metadata:
   * - closable: if false, hides the close icon
   */
  meta?: {
    closable?: boolean;
  };
}

interface PromiseMessages {
  loading?: Partial<ToastOptions>;
  success?: Partial<ToastOptions>;
  error?: Partial<ToastOptions>;
}

export const useToast = (defaultOptions?: Omit<ToastOptions, "type">) => {
  // Création générique
  const showToast = useCallback(
    (
      type: ToastType,
      title: string,
      description?: string,
      options?: Omit<ToastOptions, "type" | "title" | "description">
    ) => {
      return toaster.create({
        type,
        title,
        description,
        duration: 3000,
        ...defaultOptions,
        ...options,
      });
    },
    [defaultOptions]
  );

  const showSuccess = useCallback(
    (title: string, description?: string, opts?: Omit<ToastOptions, "type" | "title" | "description">) =>
      showToast("success", title, description, opts),
    [showToast]
  );

  const showError = useCallback(
    (title: string, description?: string, opts?: Omit<ToastOptions, "type" | "title" | "description">) =>
      showToast("error", title, description, opts),
    [showToast]
  );

  const showInfo = useCallback(
    (title: string, description?: string, opts?: Omit<ToastOptions, "type" | "title" | "description">) =>
      showToast("info", title, description, opts),
    [showToast]
  );

  const showWarning = useCallback(
    (title: string, description?: string, opts?: Omit<ToastOptions, "type" | "title" | "description">) =>
      showToast("warning", title, description, opts),
    [showToast]
  );

  // Promise toast
  const showPromiseToast = useCallback(
    <T>(
      promise: Promise<T>,
      messages: PromiseMessages,
      options?: Omit<ToastOptions, "type">
    ) => {
      return toaster.promise(
        promise,
        {
          loading: { type: "loading",  ...messages.loading },
          success: { type: "success",  ...messages.success },
          error:   { type: "error",    ...messages.error },
        },
        options
      );
    },
    []
  );

  return {
    showToast,
    showSuccess,
    showError,
    showInfo,
    showWarning,
    showPromiseToast,
  };
};