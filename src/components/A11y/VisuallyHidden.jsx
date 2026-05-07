import React from 'react';

/**
 * VisuallyHidden component for screen reader only content
 * Content is hidden visually but accessible to screen readers
 */
const VisuallyHidden = ({ children, as: Component = 'span', ...props }) => {
  return (
    <Component
      {...props}
      style={{
        position: 'absolute',
        width: '1px',
        height: '1px',
        padding: 0,
        margin: '-1px',
        overflow: 'hidden',
        clip: 'rect(0, 0, 0, 0)',
        whiteSpace: 'nowrap',
        borderWidth: 0,
      }}
    >
      {children}
    </Component>
  );
};

export default VisuallyHidden;
