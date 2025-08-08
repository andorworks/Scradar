# Scradar.js

CSS-first scroll interaction library with progress-based animations.

[![Buy Me A Coffee](https://img.shields.io/badge/Buy%20Me%20A%20Coffee-ffdd00?style=for-the-badge&logo=buy-me-a-coffee&logoColor=black)](https://buymeacoffee.com/andorworks)
[![npm version](https://badge.fury.io/js/scradar.svg)](https://www.npmjs.com/package/scradar)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## ✨ Features

- 🎯 **CSS-first approach** - Control animations with CSS custom properties
- 📊 **Multiple progress types** - visible, fill, full, start, end
- 🎭 **Step-based animations** - Define breakpoints for staged animations
- 🔄 **Framework support** - Works with Vanilla JS, React, and Vue
- 🐛 **Debug mode** - Visual overlay for development
- 📱 **Responsive** - Breakpoint support for different screen sizes
- ⚡ **Performance** - Uses IntersectionObserver and RAF throttling

## 📦 Installation

```bash
npm install scradar
```

## 🚀 Usage

### Vanilla JavaScript
```html
<!-- ESM -->
<script type="module">
  import Scradar from 'scradar';
  const scradar = new Scradar();
</script>

<!-- UMD -->
<script src="https://unpkg.com/scradar"></script>
<script>
  const scradar = new Scradar();
</script>
```

### React
```js
import { useScradar } from 'scradar/react';

function App() {
  const scradar = useScradar({ debug: true });
  
  return (
    <div className="scradar" data-scradar='{"progressVisible": true}'>
      Content
    </div>
  );
}
```

### Vue
```html
<template>
  <div v-scradar="{ progressVisible: true }">
    Content
  </div>
</template>

<script>
import ScradarVue from 'scradar/vue';
app.use(ScradarVue);
</script>
```

## ⚙️ Options
| Option          | Type           | Default    | Description                           |
| --------------- | -------------- | ---------- | ------------------------------------- |
| ⁠`target`        | String         | '.scradar' | Target selector                       |
| ⁠`debug`         | Boolean        | false      | Enable debug overlay                  |
| ⁠`totalProgress` | Boolean        | true       | Track total scroll progress           |
| ⁠`boundary`      | Boolean/Number | false      | Boundary detection for active targets |

## 🎯 Element Options

Set options via `data-scradar` attribute:

```html
<div class="scradar" data-scradar='{"progressVisible": true, "visibleStep": [0.25, 0.5, 0.75]}'>
```

### Progress Types
| Option          | Description                      | Range                                 |
| --------------- | -------------------------------- | ------------------------------------- |
| ⁠progressVisible | Element visibility progress      | 0 (before) ~ 1 (after)                |
| ⁠progressFill    | Fill progress for large elements | -1 (before) ~ 0 (filling) ~ 1 (after) |
| ⁠progressFull    | Full coverage progress           | 0 (not full) ~ 1 (full)               |
| ⁠progressStart   | Start edge progress              | 0 ~ 1                                 |
| ⁠progressEnd     | End edge progress                | 0 ~ 1                                 |

### CSS Usage
```css
.element {
  /* Direct usage */
  opacity: var(--progress-visible);
  transform: translateY(calc((1 - var(--progress-visible)) * 100px));
  
  /* With calc() */
  scale: calc(0.5 + var(--progress-fill) * 0.5);
  
  /* With clamp() */
  opacity: clamp(0.2, var(--progress-visible), 0.8);
}

/* Keyframe animation control */
@keyframes slide {
  from { transform: translateX(-100%); }
  to { transform: translateX(0); }
}

.element {
  animation: slide 1s paused;
  animation-delay: calc(var(--progress-visible) * -1s);
}
```

### Events
```js
element.addEventListener('scrollEnter', (e) => {
  console.log('Entered from:', e.detail.from); // 'top' or 'bottom'
});

element.addEventListener('scrollExit', (e) => {
  console.log('Exited from:', e.detail.from);
});

element.addEventListener('stepChange', (e) => {
  console.log('Step changed:', e.detail.step);
});

element.addEventListener('fullIn', (e) => {
  console.log('Element fills viewport');
});
```

## 🔧 Advanced Features

### Steps
Define progress breakpoints for staged animations:
```html
<div data-scradar='{"progressVisible": true, "visibleStep": [0.25, 0.5, 0.75]}'>
```
This creates 4 steps (0-3) that change at 25%, 50%, and 75% progress.

### Peak
Create peak animations that rise and fall:
```html
<div data-scradar='{"progressVisible": true, "peak": [0, 0.5, 1]}'>
```
Progress peaks at 50% (value = 1) and returns to 0 at both ends.

### Breakpoints
Responsive options based on viewport width:
```html
<div data-scradar='{
  "progressVisible": true,
  "breakpoint": {
    "768": {"horizontal": true},
    "1024": {"progressFill": true}
  }
}'>
```

### Triggers
Create custom trigger zones:
```html
<div data-scradar='{"trigger": "20% 10%"}'>
```

### Receivers
Apply progress to other elements:
```html
<div data-scradar='{"receiver": ".other-element"}'>
```

## 🐛 Debug Mode
Enable visual debugging overlay:
```js
const scradar = new Scradar({ debug: true });
```
Toggle with `⁠Ctrl/Cmd + Shift + D`.

## 📚 API

### Constructor
```js
const scradar = new Scradar(target?, options?);
```

### Methods
| Method    | Description                       |
| --------- | --------------------------------- |
| ⁠update()  | Manually update all elements      |
| ⁠destroy() | Clean up and remove all listeners |

### Properties
| Property | Description                         |
| -------- | ----------------------------------- |
| ⁠elements | Array of tracked elements           |
| ⁠scroll   | Current scroll direction (-1, 0, 1) |
| ⁠progress | Total scroll progress (0-1)         |

### Browser Support
- Chrome/Edge 88+
- Firefox 78+
- Safari 14+
- iOS Safari 14+

Requires:
- IntersectionObserver
- CSS Custom Properties
- ES6 Modules (for ESM build)

## 💖 Sponsorship
Scradar.js is an open-source project that I'm developing and maintaining in my spare time. If you find this library useful, please consider supporting its development. Your support helps me dedicate more time to new features, improvements, and maintenance.

<a href="https://buymeacoffee.com/andorworks" target="_blank">
  <img src="https://cdn.buymeacoffee.com/buttons/v2/default-yellow.png" alt="Buy Me A Coffee" style="height: 60px !important;width: 217px !important;" >
</a>

## 📄 License
MIT © andor works

## 🤝 Contributing
Contributions are welcome! Please feel free to submit a Pull Request.
