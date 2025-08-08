# Scradar

CSS-first scroll interaction library with progress-based animations.

[![Buy Me A Coffee](https://img.shields.io/badge/Buy%20Me%20A%20Coffee-ffdd00?style=for-the-badge&logo=buy-me-a-coffee&logoColor=black)](https://buymeacoffee.com/andorworks)
[![npm version](https://badge.fury.io/js/scradar.svg)](https://www.npmjs.com/package/scradar)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## 🤔 Why Scradar?

Scradar was born from a different perspective on scroll-based animations. While many libraries focus on script-driven animation control, we found this approach to be complex and time-consuming during development.

**Scradar's core idea is simple:**
- **Scripts focus solely on reading scroll information**
- **Animations are handled by CSS**

This approach allows you to debug and fine-tune animations in real-time using browser developer tools, making the development process much more efficient.

**Scradar** is a combination of **Scroll** and **Radar**, meaning "to observe scroll" - perfectly describing its role as a scroll observation tool.

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
import { useScradar, setScradarConfigs } from 'scradar/react';

// Global configurations (supports both static and dynamic)
setScradarConfigs({
  section1: { visibility: true, visibilityStep: [0.25, 0.5, 0.75] },
  section2: (element) => ({
    visibility: true,
    once: element.classList.contains('once-only')
  })
});

function App() {
  const scradar = useScradar({ debug: true });
  
  return (
    <div className="scradar" data-scradar-config="section1">
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

// Global configurations (supports both static and dynamic)
app.config.globalProperties.$scradarConfigs({
  section1: { visibility: true, visibilityStep: [0.25, 0.5, 0.75] },
  section2: (element) => ({
    visibility: true,
    once: element.classList.contains('once-only')
  })
});
</script>
```

## ⚙️ Options

| Option          | Type           | Default    | Description                           |
| --------------- | -------------- | ---------- | ------------------------------------- |
| ⁠`target`        | String         | '.scradar' | Target selector                       |
| ⁠`debug`         | Boolean        | false      | Enable debug overlay                  |
| ⁠`totalProgress` | Boolean        | true       | Track total scroll progress           |
| ⁠`boundary`      | Boolean/Number | false      | Boundary detection for active targets |

## 🎨 Element Configuration

Scradar supports two ways to configure elements with different priorities:

### 1. Configuration File (Highest Priority)
```html
<div class="scradar" data-scradar-config="section1">
</div>

<script>
Scradar.configs = {
  // Static configuration
  section1: {
    visibility: true,
    visibilityStep: [0.25, 0.5, 0.75]
  },
  // Dynamic configuration (function)
  section2: (element) => ({
    fill: true,
    peak: [0, 0.5, 1],
    once: element.classList.contains('once-only')
  })
};
</script>
```

### 2. Inline JSON (Lowest Priority)
```html
<div class="scradar" data-scradar="{visibility: true, visibilityStep: [0.25, 0.5, 0.75]}">
```

### Progress Types
| Option    | Description                      | Range                                 |
| --------- | -------------------------------- | ------------------------------------- |
| ⁠visibility | Element visibility progress      | 0 (before) ~ 1 (after)                |
| ⁠fill       | Fill progress for large elements | -1 (before) ~ 0 (filling) ~ 1 (after) |
| ⁠cover      | Full coverage progress           | 0 (not full) ~ 1 (full)               |
| ⁠enter      | Start edge progress              | 0 ~ 1                                 |
| ⁠exit       | End edge progress                | 0 ~ 1                                 |

### Additional Options
| Option      | Type         | Default | Description                            |
| ----------- | ------------ | ------- | -------------------------------------- |
| ⁠once        | Boolean      | false    | Trigger animation only once           |
| ⁠peak        | Array/Object | null     | Peak animation configuration          |
| ⁠trigger     | String       | null     | Custom trigger zone (e.g., "20% 10%") |
| ⁠receiver    | String       | null     | Apply progress to other elements      |
| ⁠delay       | String       | null     | Animation delay                       |
| ⁠horizontal  | Boolean      | false    | Horizontal scroll mode                |
| ⁠container   | String       | null     | Custom scroll container               |
| ⁠breakpoint  | Object       | null     | Responsive breakpoint options         |
| ⁠eventListen | String/Array | null     | Custom event listeners                |

### CSS Usage
```css
.element {
  /* Direct usage */
  opacity: var(--visibility);
  transform: translateY(calc((1 - var(--visibility)) * 100px));
  
  /* With calc() */
  scale: calc(0.5 + var(--fill) * 0.5);
  
  /* With clamp() */
  opacity: clamp(0.2, var(--visibility), 0.8);
}

/* Keyframe animation control */
@keyframes slide {
  from { transform: translateX(-100%); }
  to { transform: translateX(0); }
}

.element {
  animation: slide 1s paused;
  animation-delay: calc(var(--visibility) * -1s);
}
```

### Events
```js
// Element visibility events
element.addEventListener('scrollEnter', (e) => {
  console.log('Entered from:', e.detail.from); // 'top' or 'bottom'
});

element.addEventListener('scrollExit', (e) => {
  console.log('Exited from:', e.detail.from);
});

// Step-based animation events
element.addEventListener('stepChange', (e) => {
  console.log('Step changed:', e.detail.step);
});

// Full coverage events
element.addEventListener('fullIn', (e) => {
  console.log('Element fills viewport');
});

element.addEventListener('fullOut', (e) => {
  console.log('Element no longer fills viewport');
});

// Trigger collision events
element.addEventListener('collisionEnter', (e) => {
  console.log('Trigger collision started');
});

element.addEventListener('collisionExit', (e) => {
  console.log('Trigger collision ended');
});

// Progress update events
element.addEventListener('visibilityUpdate', (e) => {
  console.log('Visibility progress:', e.detail.value);
});

element.addEventListener('fillUpdate', (e) => {
  console.log('Fill progress:', e.detail.value);
});

// Global scroll events
window.addEventListener('scrollTurn', (e) => {
  console.log('Scroll direction changed:', e.detail.scroll); // 1, -1, 0
});

window.addEventListener('momentum', (e) => {
  console.log('Momentum detected:', e.detail.status); // 1, -1
});
```

## 🔧 Advanced Features

### Steps
Define progress breakpoints for staged animations:
```html
<div data-scradar="{visibility: true, visibilityStep: [0.25, 0.5, 0.75]}">
```
This creates 4 steps (0-3) that change at 25%, 50%, and 75% progress.

Available step options:
- `visibilityStep`: Steps for visibility progress
- `fillStep`: Steps for fill progress  
- `coverStep`: Steps for full coverage progress
- `enterStep`: Steps for start edge progress
- `exitStep`: Steps for end edge progress

### Peak
Create peak animations that rise and fall:
```html
<div data-scradar="{visibility: true, peak: [0, 0.5, 1]}">
```
Progress peaks at 50% (value = 1) and returns to 0 at both ends.

Peak configuration:
- Array format: `[start, peak, end]` (0-1 values)
- Object format: `{start: 0, peak: 0.5, end: 1}`

### Breakpoints
Responsive options based on viewport width:
```html
<div data-scradar="{visibility: true, breakpoint: {768: {horizontal: true}, 1024: {fill: true}}}">
```

Breakpoint keys are viewport widths in pixels. Options are merged with base configuration.

### Triggers
Create custom trigger zones:
```html
<div data-scradar="{trigger: '20% 10%'}">
```

Trigger format: `'top right bottom left'` (CSS margin-like syntax)
- Single value: `'20%'` (all sides)
- Two values: `'20% 10%'` (top/bottom, left/right)
- Four values: `'20% 10% 30% 15%'` (top, right, bottom, left)

### Receivers
Apply progress to other elements:
```html
<div data-scradar="{receiver: '.other-element'}">
```

Receiver accepts any valid CSS selector. Progress values are applied to both the original element and all matching receiver elements.

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
  <img src="https://cdn.buymeacoffee.com/buttons/v2/default-yellow.png" alt="Buy Me A Coffee" width="171" height="48">
</a>

## 📄 License

MIT © andor works

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
