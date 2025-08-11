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
- 📊 **Multiple progress types** - visibility, fill, cover, enter, exit
- 🎭 **Step-based animations** - Define breakpoints for staged animations
- 🎨 **Predefined animations** - 20+ ready-to-use animation patterns
- 🔄 **Framework support** - Works with Vanilla JS, React, and Vue
- 🛠️ **Developer experience** - Enhanced debugging with performance metrics
- 🐛 **Debug mode** - Visual overlay for development
- 📱 **Responsive** - Breakpoint support for different screen sizes
- ⚡ **Performance** - Optimized calculations and memory usage

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
```jsx
import { useScradar, useScradarElement, useScradarConfigs } from 'scradar/react';

// Global configurations with React hooks
function App() {
  const scradar = useScradar({ debug: true });
  
  // Global configs with reactive updates
  useScradarConfigs({
    section1: { visibility: true, visibilityStep: [0.25, 0.5, 0.75] },
    section2: (element) => ({
      visibility: true,
      once: element.classList.contains('once-only')
    })
  });
  
  return (
    <div className="scradar" data-scradar-config="section1">
      Content
    </div>
  );
}

// Individual element with reactive config
function AnimatedComponent({ isVisible }) {
  const scradarRef = useScradarElement({
    visibility: true,
    peak: isVisible ? [0, 0.5, 1] : null
  }, [isVisible]);
  
  return (
    <div ref={scradarRef} className="scradar scradar__fade-in">
      Dynamic content
    </div>
  );
}

// SPA routing support - automatically handles route changes
function PageComponent() {
  const scradar = useScradar();
  
  // Scradar automatically updates when route changes
  return (
    <div className="scradar scradar__fade-in" data-scradar="{visibility: true}">
      Page content
    </div>
  );
}
```

### Vue
```html
<template>
  <!-- Directive usage -->
  <div v-scradar="{ visibility: true }" class="scradar scradar__fade-in">
    Content
  </div>
  
  <!-- Reactive configuration -->
  <div v-scradar="scradarConfig" class="scradar scradar__fade-in">
    Dynamic content
  </div>
</template>

<script>
import { createApp } from 'vue';
import ScradarVue from 'scradar/vue';

const app = createApp(App);
app.use(ScradarVue, { debug: true });

// Global configurations
app.config.globalProperties.$scradarConfigs({
  section1: { visibility: true, visibilityStep: [0.25, 0.5, 0.75] },
  section2: (element) => ({
    visibility: true,
    once: element.classList.contains('once-only')
  })
});
</script>

<script setup>
import { ref, computed } from 'vue';
import { useScradar, useScradarConfigs } from 'scradar/vue';

// Composition API usage
const { instance, update, destroy } = useScradar({ debug: true });

// Reactive global configs
useScradarConfigs({
  section1: { visibility: true, visibilityStep: [0.25, 0.5, 0.75] }
});

// Reactive element configuration
const isVisible = ref(true);
const scradarConfig = computed(() => ({
  visibility: true,
  peak: isVisible.value ? [0, 0.5, 1] : null
}));

// Manual update when needed
const handleRouteChange = () => {
  update();
};
</script>
```

### Vue 2
```html
<template>
  <div v-scradar="{ visibility: true }" class="scradar scradar__fade-in">
    Content
  </div>
</template>

<script>
import Vue from 'vue';
import { ScradarVue2 } from 'scradar/vue';

Vue.use(ScradarVue2, { debug: true });

export default {
  mounted() {
    // Global configurations
    this.$scradarConfigs({
      section1: { visibility: true, visibilityStep: [0.25, 0.5, 0.75] }
    });
  },
  
  beforeDestroy() {
    // Cleanup
    this.$scradarCleanup();
  }
};
</script>
```

## ⚙️ Options

| Option          | Type           | Default    | Description                           |
| --------------- | -------------- | ---------- | ------------------------------------- |
| `target`        | String         | '.scradar' | Target selector                       |
| `debug`         | Boolean        | false      | Enable debug overlay                  |
| `totalProgress` | Boolean        | true       | Track total scroll progress           |
| `boundary`      | Boolean/Number | false      | Boundary detection for active targets |
| `momentum`      | Boolean        | false      | Enable momentum scroll detection      |

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
| Option       | Description                      | Range                                 | CSS Variable        | Priority |
| ------------ | -------------------------------- | ------------------------------------- | ------------------- | -------- |
| `peak`       | Peak animation progress          | 0 ~ 1 (rise and fall)                 | `--peak`            | 1st      |
| `visibility` | Element visibility progress      | 0 (before) ~ 1 (after)                | `--visibility`      | 2nd      |
| `fill`       | Fill progress for large elements | -1 (before) ~ 0 (filling) ~ 1 (after) | `--fill`            | 3rd      |
| `cover`      | Full coverage progress           | 0 (not full) ~ 1 (full)               | `--cover`           | 4th      |
| `enter`      | Start edge progress              | 0 ~ 1                                 | `--enter`           | 5th      |
| `exit`       | End edge progress                | 0 ~ 1                                 | `--exit`            | 6th      |

### Offset Options
| Option        | Type    | Default | Description                       | CSS Variable     |
| ------------- | ------- | ------- | --------------------------------- | ---------------- |
| `offsetEnter` | Boolean | false   | Distance from viewport start edge | `--offset-enter` |
| `offsetExit`  | Boolean | false   | Distance from viewport end edge   | `--offset-exit`  |

### Additional Options
| Option        | Type         | Default | Description                           |
| ------------- | ------------ | ------- | ------------------------------------- |
| `once`        | Boolean      | false   | Trigger animation only once           |
| `peak`        | Array/Object | null    | Peak animation configuration          |
| `trigger`     | String       | null    | Custom trigger zone (e.g., "20% 10%") |
| `receiver`    | String       | null    | Apply progress to other elements      |
| `delay`       | String       | null    | Animation delay                       |
| `horizontal`  | Boolean      | false   | Horizontal scroll mode                |
| `container`   | String       | null    | Custom scroll container               |
| `breakpoint`  | Object       | null    | Responsive breakpoint options         |
| `prefix`      | String       | null    | Custom prefix for CSS variables       |

## 🎯 Default Element Attributes

Scradar automatically provides these attributes to all tracked elements:

### Visibility State
```html
<!-- Element not visible in viewport -->
<div class="scradar" data-scradar-in="0">

<!-- Element visible in viewport -->  
<div class="scradar" data-scradar-in="1">
```

### Edge Collision States
```html
<!-- Element not touching viewport start edge -->
<div class="scradar" data-scradar-enter="0">

<!-- Element touching viewport start edge -->
<div class="scradar" data-scradar-enter="1">

<!-- Element not touching viewport end edge -->
<div class="scradar" data-scradar-exit="0">

<!-- Element touching viewport end edge -->
<div class="scradar" data-scradar-exit="1">

<!-- Element completely fills viewport -->
<div class="scradar" data-scradar-in="1" data-scradar-enter="1" data-scradar-exit="1">
```

### Global Scroll State
```html
<!-- Total scroll progress (0-1) -->
<html data-scradar-progress="0.5">

<!-- Scroll direction: 1 (down), -1 (up) -->
<html data-scradar-scroll="1">
```

## 🎨 CSS Usage

### Progress Priority System
Scradar automatically selects the most appropriate progress value based on priority:
1. **`--peak`** (highest priority) - Rise and fall animations
2. **`--visibility`** - Element visibility progress
3. **`--fill`** - Fill progress for large elements
4. **`--cover`** - Full coverage progress
5. **`--enter`** - Start edge progress
6. **`--exit`** (lowest priority) - End edge progress

The selected progress is available as `--progress` CSS variable.

### Direct Progress Usage
```css
.element {
  /* Use automatic priority selection */
  opacity: var(--progress);
  transform: translateY(calc((1 - var(--progress)) * 100px));
  
  /* Use specific progress types */
  opacity: var(--visibility);
  scale: calc(0.5 + var(--fill) * 0.5);
  
  /* With clamp for safety */
  opacity: clamp(0.2, var(--progress), 0.8);
  
  /* Using CSS default values */
  left: calc(var(--progress, 0) * 100px);
}
```

### Advanced CSS Techniques
```css
/* Sequential animations with delay and duration */
.item1 { opacity: calc(var(--progress) / 0.2); }
.item2 { opacity: calc((var(--progress) - 0.2) / 0.2); }
.item3 { opacity: calc((var(--progress) - 0.4) / 0.2); }
.item4 { opacity: calc((var(--progress) - 0.6) / 0.2); }
.item5 { opacity: calc((var(--progress) - 0.8) / 0.2); }

/* Scale with clamp to prevent negative values */
.item1 { transform: scale(clamp(1, var(--progress) / 0.2 * 5, 5)); }
.item2 { transform: scale(clamp(1, (var(--progress) - 0.2) / 0.2 * 5, 5)); }

/* Formula: clamp(min, (progress - delay) / duration * max, max) */

/* Force specific progress type usage */
.scradar__use-fill { --progress: var(--progress-fill); }
.scradar__use-peak { --progress: var(--progress-peak); }
.scradar__use-visibility { --progress: var(--progress-visibility); }
```

### Keyframe Animation Control
```css
@keyframes slide {
  from { transform: translateX(-100%); }
  to { transform: translateX(0); }
}

.element {
  animation: slide 1s cubic-bezier(0.45, 0.05, 0.55, 0.95) forwards paused;
  animation-delay: calc(var(--progress) * -1s);
}

/* Complex keyframe example */
@keyframes complex {
  0% { opacity: 1; transform: scale(1); }
  25% { transform: scale(1.5); }
  50% { opacity: 0; transform: scale(0); }
  100% { opacity: 1; transform: scale(1); }
}

.element {
  animation: complex 1s forwards paused;
  animation-delay: calc(var(--progress) * -1s);
}
```

### Events
```js
// Element visibility events
element.addEventListener('scrollEnter', (e) => {
  console.log('Entered from:', e.detail.from); // 'top' or 'bottom'
});

element.addEventListener('scrollExit', (e) => {
  console.log('Exited from:', e.detail.from); // 'top' or 'bottom'
});

// Full coverage events
element.addEventListener('fullIn', (e) => {
  console.log('Element fills viewport from:', e.detail.from);
});

element.addEventListener('fullOut', (e) => {
  console.log('Element no longer fills viewport from:', e.detail.from);
});

// Step-based animation events
element.addEventListener('stepChange', (e) => {
  console.log('Step changed:', e.detail.step);
  console.log('Previous step:', e.detail.prevStep);
  console.log('Max step:', e.detail.maxStep);
  console.log('Step type:', e.detail.type); // 'visibility', 'fill', etc.
});

// Progress update events
element.addEventListener('visibilityUpdate', (e) => {
  console.log('Visibility progress:', e.detail.value);
});

element.addEventListener('fillUpdate', (e) => {
  console.log('Fill progress:', e.detail.value);
});

element.addEventListener('coverUpdate', (e) => {
  console.log('Cover progress:', e.detail.value);
});

element.addEventListener('enterUpdate', (e) => {
  console.log('Enter progress:', e.detail.value);
});

element.addEventListener('exitUpdate', (e) => {
  console.log('Exit progress:', e.detail.value);
});

// Trigger collision events
element.addEventListener('collisionEnter', (e) => {
  console.log('Trigger collision started');
});

element.addEventListener('collisionExit', (e) => {
  console.log('Trigger collision ended');
});

// Global scroll events
window.addEventListener('scrollTurn', (e) => {
  console.log('Scroll direction changed:', e.detail.scroll); // 1, -1, 0
});

window.addEventListener('momentum', (e) => {
  console.log('Momentum detected:', e.detail.status); // 1 (down), -1 (up)
});
```

## 🔧 Advanced Features

## 🚀 Framework-Specific Optimizations

### React Optimizations
- **Global Instance Management**: Single Scradar instance shared across all components
- **SPA Routing Support**: Automatic updates on route changes (React Router, Next.js, etc.)
- **Performance Optimization**: Memoized options and efficient re-renders
- **Memory Leak Prevention**: Automatic cleanup when components unmount
- **Reactive Configurations**: Dynamic config updates with React hooks

### Vue Optimizations
- **Global Instance Management**: Single Scradar instance for the entire app
- **Reactive Directives**: Automatic updates when binding values change
- **Composition API Support**: Modern Vue 3 patterns with `useScradar` composables
- **Options API Support**: Traditional Vue 2/3 patterns with global properties
- **Memory Management**: Automatic cleanup with component lifecycle

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

The peak value is available as `--peak` CSS variable.

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

### Boundary Detection
Track active elements based on viewport position:
```js
const scradar = new Scradar({ boundary: true }); // Uses 0.5 (center)
// or
const scradar = new Scradar({ boundary: 0.3 }); // Custom threshold
```

Elements need `data-scradar-title` attribute:
```html
<div class="scradar" data-scradar-title="Section 1"></div>
<div class="scradar" data-scradar-title="Section 2"></div>
```

Active element is output to HTML:
```html
<html data-scradar-target="Section 1">
```

When no element is active but was previously:
```html
<html data-scradar-target="## Section 1">
```

## 🐛 Debug Mode

Enable visual debugging overlay:
```js
const scradar = new Scradar({ debug: true });
```
Toggle with `Ctrl/Cmd + Shift + D`.

## 🎨 Predefined Animations

Scradar provides 25+ CSS-only animation classes that work seamlessly with scroll progress:

### CSS Import

```css
@import 'scradar/dist/animations.css';
```

Or include in your HTML:
```html
<link rel="stylesheet" href="https://unpkg.com/scradar/dist/animations.css">
```

### Usage

Simply add CSS classes to your HTML elements:

```html
<!-- Fade in from bottom -->
<div class="scradar scradar__fade-in--up" data-scradar="{visibility: true}">
  Content fades in from bottom
</div>

<!-- Scale animation with custom distance -->
<div class="scradar scradar__scale-in" data-scradar="{visibility: true}" style="--fade-distance: 50px;">
  Custom animation distance
</div>

<!-- Parallax effect -->
<div class="scradar scradar__parallax--medium" data-scradar="{visibility: true}">
  Parallax background
</div>

<!-- Progress bar with fill -->
<div class="scradar scradar__progress-bar" data-scradar="{fill: true}">
  Progress bar
</div>
```

### Available Animation Classes

#### Fade Effects
- `.scradar__fade-in` - Simple fade in
- `.scradar__fade-in--up` - Fade in from bottom
- `.scradar__fade-in--down` - Fade in from top
- `.scradar__fade-in--left` - Fade in from left
- `.scradar__fade-in--right` - Fade in from right

#### Scale Effects
- `.scradar__scale-in` - Scale up while fading in
- `.scradar__scale-up` - Subtle scale increase

#### Parallax Effects
- `.scradar__parallax--slow` - Slow parallax movement
- `.scradar__parallax--medium` - Medium parallax movement
- `.scradar__parallax--fast` - Fast parallax movement

#### Fill-based Effects
- `.scradar__progress-bar` - Animated progress bar
- `.scradar__slide-reveal` - Slide reveal with clip-path

#### Text Effects
- `.scradar__text-reveal` - Text reveal with blend mode effect
- `.scradar__typewriter` - Typewriter text effect

#### Advanced Effects
- `.scradar__stagger--fade-in` - Staggered animations for `.scradar__stagger-item` elements (children appear sequentially with delays)
- `.scradar__rotate` - Full rotation
- `.scradar__tilt` - Subtle tilt effect
- `.scradar__color-shift` - Color hue rotation
- `.scradar__blur-in` - Blur to clear effect

#### Peak-based Effects (rise and fall)
- `.scradar__bounce` - Bounce effect (uses peak progress)
- `.scradar__pulse` - Pulse effect (uses peak progress)
- `.scradar__glow` - Glow effect (uses peak progress)

#### Trigger-based Effects (one-time animations)
- `.scradar__trigger-fade-in` - Trigger fade in animation
- `.scradar__trigger-fade-in--up` - Trigger fade in from bottom
- `.scradar__trigger-scale-in` - Trigger scale in animation
- `.scradar__trigger-bounce` - Trigger bounce animation
- `.scradar__trigger-pulse` - Trigger pulse animation
- `.scradar__trigger-glow` - Trigger glow animation

*Trigger animations activate when `data-scradar-in="1"` is set on the element or its parent.*

#### Combination Effects
- `.scradar__zoom-fade` - Zoom and fade combined
- `.scradar__slide-scale` - Slide and scale combined

### Customization with CSS Variables

Override default values using CSS variables:

```css
.my-custom-animation {
  --fade-distance: 60px;         /* Default: 30px */
  --transition-duration: 1.2s;   /* Default: 0.6s */
  --transition-easing: ease-out; /* Default: ease */
  --scale-start: 0.5;            /* Default: 0.8 */
  --parallax-medium: -80px;      /* Default: -50px */
}
```

### Utility Classes

Modify animation behavior with utility classes:

```html
<!-- Timing modifiers -->
<div class="scradar scradar__fade-in--up scradar__fast">Fast animation</div>
<div class="scradar scradar__fade-in--up scradar__slow">Slow animation</div>

<!-- Easing modifiers -->
<div class="scradar scradar__scale-in scradar__ease-out-back">Bouncy easing</div>

<!-- Distance modifiers -->
<div class="scradar scradar__fade-in--up scradar__large-distance">Large movement</div>

<!-- Progress type modifiers -->
<div class="scradar scradar__fade-in scradar__use-fill">Force fill progress</div>
<div class="scradar scradar__fade-in scradar__use-peak">Force peak progress</div>
<div class="scradar scradar__fade-in scradar__use-visibility">Force visibility progress</div>
```

### Complete Example

```html
<!DOCTYPE html>
<html>
<head>
  <link rel="stylesheet" href="https://unpkg.com/scradar/dist/scradar.css">
  <link rel="stylesheet" href="https://unpkg.com/scradar/dist/animations.css">
</head>
<body>
  <!-- Hero section with custom timing -->
  <section class="scradar scradar__fade-in--up scradar__slow" 
           data-scradar="{visibility: true}"
           style="--fade-distance: 80px;">
    <h1>Hero Title</h1>
  </section>

  <!-- Cards with stagger effect -->
  <div class="scradar scradar__stagger--fade-in" data-scradar="{visibility: true}">
    <div class="card scradar__stagger-item">Card 1</div>
    <div class="card scradar__stagger-item">Card 2</div>
    <div class="card scradar__stagger-item">Card 3</div>
  </div>

  <!-- Progress section -->
  <div class="scradar scradar__progress-bar" data-scradar="{fill: true}">
    Progress content
  </div>

  <!-- Peak animation section -->
  <div class="scradar scradar__bounce" data-scradar="{visibility: true, peak: [0, 0.5, 1]}">
    Bounce effect with peak progress
  </div>

  <!-- Trigger animation section -->
  <div class="scradar__trigger-fade-in" data-scradar-in="1">
    Triggered fade in animation
  </div>

  <script src="https://unpkg.com/scradar"></script>
  <script>
    new Scradar();
  </script>
</body>
</html>
```

## 📚 API

## 🎯 Framework-Specific Usage Examples

### React Examples

#### Basic Usage with Hooks
```jsx
import { useScradar, useScradarElement } from 'scradar/react';

function MyComponent() {
  const scradar = useScradar({ debug: true });
  const elementRef = useScradarElement({ visibility: true });
  
  return (
    <div ref={elementRef} className="scradar scradar__fade-in">
      Animated content
    </div>
  );
}
```

#### Dynamic Configuration
```jsx
function DynamicComponent({ shouldAnimate, animationType }) {
  const config = useMemo(() => ({
    visibility: true,
    peak: shouldAnimate ? [0, 0.5, 1] : null,
    [animationType]: true
  }), [shouldAnimate, animationType]);
  
  const elementRef = useScradarElement(config, [shouldAnimate, animationType]);
  
  return (
    <div ref={elementRef} className="scradar scradar__fade-in">
      Dynamic animation
    </div>
  );
}
```

#### SPA Routing with Next.js
```jsx
// pages/_app.js
import { useScradar } from 'scradar/react';

function MyApp({ Component, pageProps }) {
  const scradar = useScradar({ debug: true });
  
  return <Component {...pageProps} />;
}

// pages/about.js
export default function About() {
  return (
    <div className="scradar scradar__fade-in" data-scradar="{visibility: true}">
      About page content
    </div>
  );
}
```

### Vue Examples

#### Composition API (Vue 3)
```vue
<template>
  <div v-scradar="scradarConfig" class="scradar scradar__fade-in">
    {{ message }}
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useScradar } from 'scradar/vue';

const { instance } = useScradar({ debug: true });

const isVisible = ref(false);
const message = ref('Hello Vue!');

const scradarConfig = computed(() => ({
  visibility: true,
  peak: isVisible.value ? [0, 0.5, 1] : null
}));

// Toggle animation
const toggleAnimation = () => {
  isVisible.value = !isVisible.value;
};
</script>
```

#### Options API (Vue 2/3)
```vue
<template>
  <div v-scradar="{ visibility: true, peak: [0, 0.5, 1] }" class="scradar scradar__fade-in">
    Options API content
  </div>
</template>

<script>
export default {
  mounted() {
    this.$scradarConfigs({
      hero: { visibility: true, visibilityStep: [0.25, 0.5, 0.75] }
    });
  },
  
  beforeDestroy() {
    this.$scradarCleanup();
  }
};
</script>
```

#### Nuxt.js Integration
```js
// plugins/scradar.js
import ScradarVue from 'scradar/vue';

export default ({ app }) => {
  app.use(ScradarVue, { debug: process.env.NODE_ENV === 'development' });
};

// pages/index.vue
<template>
  <div class="scradar scradar__fade-in" data-scradar="{visibility: true}">
    Nuxt.js page
  </div>
</template>
```

### Constructor
```js
const scradar = new Scradar(target?, options?);
```

### Methods
| Method      | Description                       |
| ----------- | --------------------------------- |
| `update()`  | Manually update all elements      |
| `destroy()` | Clean up and remove all listeners |

### Properties
| Property   | Description                         |
| ---------- | ----------------------------------- |
| `elements` | Array of tracked elements           |
| `scroll`   | Current scroll direction (-1, 0, 1) |
| `progress` | Total scroll progress (0-1)         |

### Static Properties
| Property          | Description                 |
| ----------------- | --------------------------- |
| `Scradar.configs` | Global configuration object |

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
