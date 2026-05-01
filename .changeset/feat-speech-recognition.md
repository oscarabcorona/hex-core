---
"@hex-core/components": minor
---

feat(ai): SpeechRecognition component — Web Speech API toggle for AI Elements parity

Adds a controlled mic-toggle button that wires up the browser's `SpeechRecognition` API and emits transcript chunks via `onTranscript(text, isFinal)`. Headless on data flow — consumer keeps the text. Falls back to a disabled button when the browser lacks the API (Firefox 2026, older Safari).

```tsx
const [listening, setListening] = useState(false);
const [text, setText] = useState("");
<SpeechRecognition
  isListening={listening}
  onListeningChange={setListening}
  onTranscript={(chunk, isFinal) => {
    if (isFinal) setText((t) => t + chunk);
  }}
  lang="en-US"
/>
```

First entry in the AI Elements parity sweep — closes the Voice category gap. No new peer deps; uses the browser-native API.
