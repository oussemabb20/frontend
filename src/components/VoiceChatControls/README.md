# Voice Chat Components

## Overview

Complete voice chat system for 1v1 battles using WebRTC technology.

## Components

### 1. VoiceChatControls

Pre-built UI component with all controls.

```tsx
import VoiceChatControls from '@/components/VoiceChatControls';

<VoiceChatControls
  battleId="battle-123"
  userId="user-456"
  autoConnect={true}
  onPeerJoined={(userId) => console.log('Peer joined:', userId)}
  onPeerLeft={(userId) => console.log('Peer left:', userId)}
/>
```

**Features:**
- Connect/Disconnect button
- Mute/Unmute toggle
- Connection status indicator
- Error display

### 2. VoiceChatDiagram

Educational component showing how voice chat works.

```tsx
import VoiceChatDiagram from '@/components/VoiceChatDiagram';

<VoiceChatDiagram />
```

**Use Cases:**
- Documentation pages
- Help sections
- Onboarding tutorials

## Props

### VoiceChatControls Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `battleId` | `string` | Yes | - | Unique battle identifier |
| `userId` | `string` | Yes | - | Current user identifier |
| `autoConnect` | `boolean` | No | `false` | Auto-connect on mount |
| `onPeerJoined` | `(userId: string) => void` | No | - | Callback when peer joins |
| `onPeerLeft` | `(userId: string) => void` | No | - | Callback when peer leaves |

## Styling

### Customize Colors

```tsx
// Edit VoiceChatControls/index.tsx

// Connect button
backgroundColor: '#00aa00'  // Green

// Disconnect button
backgroundColor: '#cc0000'  // Red

// Mute button
backgroundColor: '#ff6b6b'  // Light red

// Unmute button
backgroundColor: '#4a90e2'  // Blue
```

### Customize Size

```tsx
<IconButton
  sx={{
    width: 56,
    height: 56,
    // ... other styles
  }}
>
```

## Integration Examples

### Example 1: In Battle Arena

```tsx
import React from 'react';
import VoiceChatControls from '@/components/VoiceChatControls';
import { useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';

function BattleArena() {
  const { battleId } = useParams();
  const userId = useSelector(state => state.auth.user.id);

  return (
    <div className="battle-arena">
      <div className="battle-header">
        <h1>Battle Arena</h1>
        
        {/* Voice Chat Controls */}
        <VoiceChatControls
          battleId={battleId}
          userId={userId}
          autoConnect={true}
          onPeerJoined={(peerId) => {
            console.log('Opponent joined voice');
          }}
        />
      </div>
      
      {/* Battle content */}
    </div>
  );
}
```

### Example 2: With Notifications

```tsx
import { useNotification } from '@/components/NotificationModal/useNotification';

function BattleWithNotifications() {
  const { showNotification } = useNotification();

  return (
    <VoiceChatControls
      battleId={battleId}
      userId={userId}
      onPeerJoined={(peerId) => {
        showNotification({
          message: 'Opponent joined voice chat!',
          title: 'Voice Chat',
        });
      }}
      onPeerLeft={(peerId) => {
        showNotification({
          message: 'Opponent left voice chat',
          title: 'Voice Chat',
        });
      }}
    />
  );
}
```

### Example 3: Conditional Rendering

```tsx
function ConditionalVoiceChat() {
  const [showVoice, setShowVoice] = useState(false);

  return (
    <div>
      <button onClick={() => setShowVoice(!showVoice)}>
        Toggle Voice Chat
      </button>
      
      {showVoice && (
        <VoiceChatControls
          battleId={battleId}
          userId={userId}
        />
      )}
    </div>
  );
}
```

## Advanced Usage

### Access Internal State

Use the `useVoiceChat` hook directly:

```tsx
import { useVoiceChat } from '@/hooks/useVoiceChat';

function AdvancedVoiceChat() {
  const {
    isConnected,
    isMuted,
    connectionState,
    remoteStream,
    connect,
    disconnect,
    toggleMute,
    error,
  } = useVoiceChat({
    battleId: 'battle-123',
    userId: 'user-456',
  });

  // Custom UI based on state
  return (
    <div>
      <p>Connected: {isConnected ? 'Yes' : 'No'}</p>
      <p>Muted: {isMuted ? 'Yes' : 'No'}</p>
      <p>State: {connectionState}</p>
      
      {/* Custom controls */}
    </div>
  );
}
```

### Monitor Audio Levels

```tsx
import { useEffect, useRef } from 'react';

function VoiceWithLevels() {
  const { remoteStream } = useVoiceChat({ battleId, userId });
  const [audioLevel, setAudioLevel] = useState(0);

  useEffect(() => {
    if (!remoteStream) return;

    const audioContext = new AudioContext();
    const analyser = audioContext.createAnalyser();
    const source = audioContext.createMediaStreamSource(remoteStream);
    source.connect(analyser);

    const dataArray = new Uint8Array(analyser.frequencyBinCount);

    const checkLevel = () => {
      analyser.getByteFrequencyData(dataArray);
      const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
      setAudioLevel(average);
      requestAnimationFrame(checkLevel);
    };

    checkLevel();

    return () => {
      audioContext.close();
    };
  }, [remoteStream]);

  return (
    <div>
      <VoiceChatControls battleId={battleId} userId={userId} />
      <div>Audio Level: {audioLevel.toFixed(0)}</div>
    </div>
  );
}
```

## Troubleshooting

### Component not rendering

**Check:**
1. Props are passed correctly
2. battleId and userId are valid
3. No console errors

### No audio

**Check:**
1. Microphone permission granted
2. Both users are connected
3. Mic is not muted
4. Browser supports WebRTC

### Styling issues

**Solution:**
1. Check Material-UI theme
2. Verify sx prop syntax
3. Use browser dev tools to inspect

## Browser Support

- ✅ Chrome 56+
- ✅ Firefox 44+
- ✅ Safari 11+
- ✅ Edge 79+

## Performance

- Lightweight: ~50KB gzipped
- Low CPU usage
- Minimal memory footprint
- Hardware accelerated when available

## Accessibility

- Keyboard navigation support
- ARIA labels
- Screen reader friendly
- High contrast mode compatible

## Testing

```tsx
import { render, screen, fireEvent } from '@testing-library/react';
import VoiceChatControls from './index';

test('renders connect button', () => {
  render(
    <VoiceChatControls
      battleId="test-battle"
      userId="test-user"
    />
  );
  
  const connectButton = screen.getByTitle('Connect Voice Chat');
  expect(connectButton).toBeInTheDocument();
});

test('toggles mute state', async () => {
  const { getByTitle } = render(
    <VoiceChatControls
      battleId="test-battle"
      userId="test-user"
    />
  );
  
  // Connect first
  const connectButton = getByTitle('Connect Voice Chat');
  fireEvent.click(connectButton);
  
  // Wait for connection
  await waitFor(() => {
    const muteButton = getByTitle('Mute Microphone');
    expect(muteButton).toBeInTheDocument();
  });
  
  // Toggle mute
  const muteButton = getByTitle('Mute Microphone');
  fireEvent.click(muteButton);
  
  // Check unmute button appears
  const unmuteButton = getByTitle('Unmute Microphone');
  expect(unmuteButton).toBeInTheDocument();
});
```

## License

Part of ByteBattle project.
