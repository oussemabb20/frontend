import { useState, useCallback } from 'react';

interface NotificationConfig {
  title?: string;
  message: string;
  buttonText?: string;
}

interface UseNotificationReturn {
  isOpen: boolean;
  config: NotificationConfig | null;
  showNotification: (config: NotificationConfig) => void;
  hideNotification: () => void;
}

/**
 * Custom hook for managing notification modal state
 * 
 * @example
 * const { isOpen, config, showNotification, hideNotification } = useNotification();
 * 
 * // Show notification
 * showNotification({ message: 'Friend request sent!' });
 * 
 * // In JSX
 * <NotificationModal
 *   open={isOpen}
 *   onClose={hideNotification}
 *   {...config}
 * />
 */
export const useNotification = (): UseNotificationReturn => {
  const [isOpen, setIsOpen] = useState(false);
  const [config, setConfig] = useState<NotificationConfig | null>(null);

  const showNotification = useCallback((notificationConfig: NotificationConfig) => {
    setConfig(notificationConfig);
    setIsOpen(true);
  }, []);

  const hideNotification = useCallback(() => {
    setIsOpen(false);
    // Clear config after animation completes
    setTimeout(() => setConfig(null), 300);
  }, []);

  return {
    isOpen,
    config,
    showNotification,
    hideNotification,
  };
};
