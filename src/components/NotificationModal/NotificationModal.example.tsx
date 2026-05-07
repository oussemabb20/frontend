import React, { useState } from 'react';
import NotificationModal from './index.js';
import { Button } from '@mui/material';

/**
 * Example usage of NotificationModal component
 * This demonstrates how to integrate the notification modal in your application
 */
const NotificationModalExample: React.FC = () => {
  const [open, setOpen] = useState(false);

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  return (
    <div>
      {/* Trigger button */}
      <Button onClick={handleOpen} variant="contained">
        Send Friend Request
      </Button>

      {/* Notification Modal */}
      <NotificationModal
        open={open}
        onClose={handleClose}
        message="Friend request sent!"
      />
    </div>
  );
};

export default NotificationModalExample;

/**
 * Usage Examples:
 * 
 * 1. Basic usage with default title:
 * <NotificationModal
 *   open={isOpen}
 *   onClose={handleClose}
 *   message="Friend request sent!"
 * />
 * 
 * 2. Custom title and button text:
 * <NotificationModal
 *   open={isOpen}
 *   onClose={handleClose}
 *   title="Success"
 *   message="Your action was completed successfully!"
 *   buttonText="Got it"
 * />
 * 
 * 3. Error notification:
 * <NotificationModal
 *   open={isOpen}
 *   onClose={handleClose}
 *   title="Error"
 *   message="Something went wrong. Please try again."
 *   buttonText="Close"
 * />
 */
