# NotificationModal Component

A reusable notification modal component that displays messages in a styled dialog window, matching the design pattern shown in the reference image.

## Features

- Clean, modern dark theme design
- Customizable title, message, and button text
- Easy-to-use custom hook for state management
- Accessible with ARIA labels
- Smooth animations
- Responsive design

## Installation

The component is already integrated into your project. No additional installation needed.

## Basic Usage

### Method 1: Direct Component Usage

```tsx
import React, { useState } from 'react';
import NotificationModal from '@/components/NotificationModal';

function MyComponent() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button onClick={() => setOpen(true)}>
        Send Friend Request
      </button>

      <NotificationModal
        open={open}
        onClose={() => setOpen(false)}
        message="Friend request sent!"
      />
    </>
  );
}
```

### Method 2: Using the Custom Hook (Recommended)

```tsx
import React from 'react';
import NotificationModal from '@/components/NotificationModal';
import { useNotification } from '@/components/NotificationModal/useNotification';

function MyComponent() {
  const { isOpen, config, showNotification, hideNotification } = useNotification();

  const handleSendRequest = () => {
    // Your logic here
    showNotification({ message: 'Friend request sent!' });
  };

  return (
    <>
      <button onClick={handleSendRequest}>
        Send Friend Request
      </button>

      <NotificationModal
        open={isOpen}
        onClose={hideNotification}
        {...config}
      />
    </>
  );
}
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `open` | `boolean` | - | Controls modal visibility (required) |
| `onClose` | `() => void` | - | Callback when modal should close (required) |
| `title` | `string` | `'localhost:5173 says'` | Modal title text |
| `message` | `string` | - | Main message content (required) |
| `buttonText` | `string` | `'OK'` | Text for the action button |

## Examples

### Success Notification

```tsx
<NotificationModal
  open={isOpen}
  onClose={handleClose}
  title="Success"
  message="Your profile has been updated successfully!"
  buttonText="Great!"
/>
```

### Error Notification

```tsx
<NotificationModal
  open={isOpen}
  onClose={handleClose}
  title="Error"
  message="Failed to send friend request. Please try again."
  buttonText="Close"
/>
```

### Custom Title

```tsx
<NotificationModal
  open={isOpen}
  onClose={handleClose}
  title="Battle Started!"
  message="Your coding battle has begun. Good luck!"
  buttonText="Let's Go"
/>
```

### Default Browser-Style Alert

```tsx
<NotificationModal
  open={isOpen}
  onClose={handleClose}
  message="Friend request sent!"
/>
```

## Integration Examples

### In a Friend Request Feature

```tsx
import { useNotification } from '@/components/NotificationModal/useNotification';
import NotificationModal from '@/components/NotificationModal';

function FriendsList() {
  const { isOpen, config, showNotification, hideNotification } = useNotification();

  const sendFriendRequest = async (userId: string) => {
    try {
      await api.sendFriendRequest(userId);
      showNotification({ 
        message: 'Friend request sent!',
        title: 'Success'
      });
    } catch (error) {
      showNotification({ 
        message: 'Failed to send request. Please try again.',
        title: 'Error'
      });
    }
  };

  return (
    <>
      {/* Your friends list UI */}
      <NotificationModal
        open={isOpen}
        onClose={hideNotification}
        {...config}
      />
    </>
  );
}
```

### In a Battle Service

```tsx
function BattleArena() {
  const { isOpen, config, showNotification, hideNotification } = useNotification();

  const joinBattle = () => {
    // Battle logic
    showNotification({ 
      message: 'You have joined the battle!',
      title: 'Battle Arena',
      buttonText: 'Start Coding'
    });
  };

  return (
    <>
      <button onClick={joinBattle}>Join Battle</button>
      <NotificationModal
        open={isOpen}
        onClose={hideNotification}
        {...config}
      />
    </>
  );
}
```

## Styling

The component uses Material-UI's `sx` prop for styling. To customize:

1. Modify the styles in `index.tsx`
2. Or wrap with a custom theme provider
3. Or pass custom styles via props (requires extending the component)

## Accessibility

The component includes:
- ARIA labels for screen readers
- Keyboard navigation support (ESC to close)
- Focus management
- Semantic HTML structure

## Browser Compatibility

Works in all modern browsers that support:
- React 18+
- Material-UI v5+
- ES6+

## Notes

- The modal automatically centers on the screen
- Clicking outside the modal or pressing ESC will close it
- The component is fully responsive
- Animations are handled by Material-UI's Modal component
