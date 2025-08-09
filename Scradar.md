# Scradar.js

Scradar.js는 스크롤 인터랙션을 구현하기 위해 디파이에서 자체 제작한 플러그인입니다.

이전에는 인터랙션의 많은 부분을 Javascript를 이용해서 구현했습니다. 여러가지 이유가 있지만, 브라우저 호환성 문제가 대표적일 것입니다. 하지만, 현재는 IE를 지원하지 않아도 되는 시대가 되었고, CSS에 충분한(훌륭한) 대안이 있음을 알고 있습니다. 이런 관점에서 Scradar.js는 인터랙션과 같은 시각적인 효과와 관련된 작업은 최대한 CSS에 위임하는 것을 목표로 삼고 있습니다. Scradar.js는 style 속성 및 data 속성을 업데이트 하는 방식으로 작업에 필요한 재료를 제공합니다. 그리고 우리는 이 재료를 활용하여 CSS 기반의 애니메이션을 구현할 수 있습니다.

## 스크립트 선언부

다음과 같이 사용할 수 있으며, 기본적으로 scradar라는 클래스가 부여된 엘리먼트를 추적, 관리합니다. 이 문서에서는 추적, 관리 대상이 되는 엘리먼트를 target으로 표현합니다.

```jsx
// 옵션이 있을 경우
const scradar = new Scradar({
	totalProgress: false
	boundary: true
	momentum: true
})

// 옵션이 없을 경우
const scradar = new Scradar()
```

### 플러그인 옵션

위 코드에서 파라메터를 통해 정의할 수 있는 옵션은 다음과 같습니다.

#### totalProgress

> type: `Boolean`
default: `true`
> 

전체 스크롤 진행률의 표시 여부를 결정합니다.
기본 값은 `true`로 html 요소에 `data-scradar-progress=”진행률”` 형태로 표시되며, 진행률은 0 부터 1 까지의 값으로 스크롤 최상단은 0, 더 이상 스크롤이 되지 않는 최하단은 1입니다.

#### boundary

> type: `Boolean`, `Number`
default: `false`
> 

target의 활성화/비활성화를 판정하는 기준을 정의함과 동시에, 활성화 상태의 target을 출력합니다.
주로 네비게이션에서 각 요소들의 활성화/비활성화 상태를 화면에 보여지는 컨텐츠와 동기화 시키기 위해 사용됩니다.
`true`는 `0.5`와 동일하게 작동하며, `0.5`는 화면의 중앙을 의미합니다. 즉, target이 화면의 중앙에 도달하거나 초과할 경우 해당 target은 활성화 상태로 판정됩니다.
boundary 옵션의 경우 target에도 다음과 같이 data 속성 설정이 필요합니다.

```jsx
<div class="scradar" data-scradar-title="이름1"></div>
<div class="scradar" data-scradar-title="이름2"></div>
<div class="scradar" data-scradar-title="이름3"></div>
```

활성화 상태의 target은 html 요소에 `data-scradar-target="이름"` 형태로 출력됩니다. 활성화 상태였던 target이 화면 밖으로 나가고, 활성화 상태의 다른 target이 없다면, `data-scradar-target="## 이름"`과 같이 이전 target의 타이틀 값 앞에 `#`을 붙여서 현재와 이전 상태를 구분합니다.

#### momentum(beta)

> type: `Boolean`
default: `false`
> 

맥의 관성 스크롤에 대응하여 스크롤이 새로 시작되었을 때 한번만 발생하는 이벤트를 사용할 수 있습니다.
현재는 베타 기능으로 옵션 설정과 무관하게 `window.eventListener('momentum, (event) => { ... })`와 같이 이벤트를 수신할 수 있습니다. event 객체의 detail에는 status 값이 존재하며(`event.detail.status`), 1은 정방향 스크롤, -1은 역방향 스크롤을 의미합니다.

## 마크업 선언부

 target에는 다음과 같이 data 속성을 사용하여 옵션을 지정할 수 있습니다.

```html
<div class="scradar" data-scradar="{옵션명: 값, 옵션명: 값}">
```

사용할 수 있는 옵션은 다음과 같습니다.

### 진행률(progress) 관련 옵션

진행률과 관련된 옵션명은 progress를 접두사로 사용하며 카멜 케이스(camelCase) 형태로 작성합니다. style 속성과 data 속성을 사용하여 현재 상태를 출력하며, 옵션에 대한 값은 바로 이 출력 방식을 결정하는데 사용됩니다. 기본 값은 `false`로 현재 상태를 출력하지 않으며, `true`는 style 속성을 사용하여 출력하겠다는 의미입니다. 또는 `‘data’`, `‘css’`와 같이 직접 명시할 수 있으며, 두 방식 모두를 사용하여 출력하고자 할 때는 `['data', 'css']`와 같이 배열 형태로 입력하면 됩니다.
이 진행률과 관련된 옵션은 다음과 같이 총 5개의 유형이 있습니다. 

#### progressVisible

화면 안에서 target이 이동하는 진행률을 출력합니다.

- style 속성 사용 방식: `style="--progress-visible: 진행률;"`
- data 속성 사용 방식: `data-progress-visible="진행률"`

<div class="grid grid-cols-2 gap-4 sm:grid-cols-4">

![progressVisible: 0](01_01.png)

![progressVisible: 0.3](01_02.png)

![progressVisible: 0.7](01_03.png)

![progressVisible: 1](01_04.png)

</div>

::: info
target이 화면에 진입하지 않은 상태는 0 또는 0 보다 작은 값으로 표현되며, 화면에 진입한 순간부터 값이 증가하다가 완전히 진출한 상태는 1 또는 1 보다 큰 값으로 표현됩니다.
:::

#### progressFill

화면 바깥에서 시작해 화면을 가득 채우며 관통하는 target의 이동 진행률을 출력합니다.

- style 속성 사용 방식: `style="--progress-fill: 진행률;"`
- data 속성 사용 방식: `data-progress-fill="진행률"`

<div class="grid grid-cols-2 gap-4 sm:grid-cols-4">

![progressFill: -1](02_01.png)

![progressFill: 0](02_02.png)

![progressFill: 0](02_03.png)

![progressFill: 1](02_04.png)

</div>

::: info
target이 화면에 진입하지 않은 상태는 -1로 표현되며, 화면에 진입한 순간부터 값이 증가하다가 화면을 채운 상태가 되면 0으로 고정됩니다. 이후 진출 상태에 돌입하면 값이 다시 증가하며 완전히 진출한 상태는 1로 표현됩니다.
**✓ progressFill은 target이 화면 보다 큰 경우에만 위와 같은 결과를 기대할 수 있습니다.**
:::

#### progressFull

화면 내부를 가득 채운 상태에서 target이 이동하는 진행률을 출력합니다.

- style 속성 사용 방식: `style="--progress-full: 진행률;"`
- data 속성 사용 방식: `data-progress-full="진행률"`

<div class="grid grid-cols-2 gap-4 sm:grid-cols-4">

![progressFull: 0](03_01.png)

![progressFull: 0](03_02.png)

![progressFull: 1](03_03.png)

![progressFull: 1](03_04.png)

</div>

::: info
target이 화면에 진입하지 않은 상태는 0으로 표현되며, 화면을 채우기 전까지는 변하지 않습니다. target의 시점(상단 또는 좌측)이 화면의 시점을 넘어서는 순간부터 값이 증가하며, targe의 종점(하단 또는 우측)이 화면의 종점에 맞닿았거나 넘어선 상태는 1로 표현됩니다. 즉, 완전히 진출한 상태 역시 1로 표현됩니다.
**✓ progressFull은 target이 화면 보다 큰 경우에만 위와 같은 결과를 기대할 수 있습니다.**
:::

#### progressStart

화면의 시점(상단 또는 좌측)을 target이 관통하며 이동하는 진행률을 출력합니다.

- style 속성 사용 방식: `style="--progress-start: 진행률;"`
- data 속성 사용 방식: `data-progress-start="진행률"`

<div class="grid grid-cols-2 gap-4 sm:grid-cols-4">

![progressStart: 0](04_01.png)

![progressStart: 0.5](04_02.png)

![progressStart: 1](04_03.png)

</div>

::: info
target의 시점(상단 또는 좌측)과 화면의 시점이 맞닿은 상태는 0으로 표현되며, 이를 넘어서는 순간부터 값이 증가하여 target의 종점(하단 또는 우측)이 화면의 시점에 맞닿은 상태는 1로 표현됩니다.
target의 시점이 화면의 시점에 도달하지 않은 상태는 0 보다 작은 값으로, target의 종점이 화면의 시점을 넘어선 상태는 1 보다 큰 값으로 표현됩니다.
:::

#### progressEnd

화면의 종점(하단 또는 우측)을 target이 관통하며 이동하는 진행률을 출력합니다.

- style 속성 사용 방식: `style="--progress-end: 진행률;"`
- data 속성 사용 방식: `data-progress-end="진행률"`

<div class="grid grid-cols-2 gap-4 sm:grid-cols-4">

![progressEnd: 1](05_01.png)

![progressEnd: 0.5](05_02.png)

![progressEnd: 0](05_03.png)

</div>

::: info
target의 시점(상단 또는 좌측)과 화면의 시점이 맞닿은 상태는 0으로 표현되며, 이를 넘어서는 순간부터 값이 증가하여 target의 종점(하단 또는 우측)이 화면의 시점에 맞닿은 상태는 1로 표현됩니다.
target의 시점이 화면의 시점에 도달하지 않은 상태는 0 보다 작은 값으로, target의 종점이 화면의 시점을 넘어선 상태는 1 보다 큰 값으로 표현됩니다.
:::

#### ...Step

진행률을 사용하게 되면, 이를 확장하여 별도의 기준을 부여하고 이에 따른 스텝을 구분할 수 있습니다. 이러한 기능은 step을 접미사로 사용하며 마찬가지로 카멜 케이스(camelCase) 형태로 작성합니다.
이 기능과 관련된 옵션 역시 다음과 같이 총 5개의 유형이 있습니다. 

- **visibleStep** → progressVisible의 값을 기준으로 스텝을 구분
- **fillStep** → progressFill의 값을 기준으로 스텝을 구분
- **fullStep** → progressFull의 값을 기준으로 스텝을 구분
- **startStep** → progressStart의 값을 기준으로 스텝을 구분
- **endStep** → progressEnd의 값을 기준으로 스텝을 구분

위에서 언급한 ‘별도의 기준을 부여’할 때는 Array 타입을 사용합니다. 예를 들어 다음과 같이 사용할 수 있습니다.

```html
<div class="scradar" data-scradar="{progressFill: true, fillStep: [0.25, 0.5, 0.75]}">
```

 이렇게 설정했을 경우 각 스텝은 다음과 같이 표현됩니다.

```html
<div class="scradar" data-scradar="{...}" data-step="스텝">
```

적용되는 스텝은 다음과 같습니다.

- 0: progressFill이 0.25 미만인 상태
- 1: progressFill이 0.25 이상, 0.5 미만인 상태
- 2: progressFill이 0.5 이상, 0.75 미만인 상태
- 3: progressFill이 0.75 이상인 상태

또, target에 이벤트 리스너를 등록하여 다음과 같이 이벤트를 수신할 수 있습니다.

```jsx
// 단계(step)가 변경될 때
target.addEventListener('stepChange', (e) => {
	console.log(e.detail.step) // 현재 스텝(위 예시의 경우 0~3의 값이 될 수 있음)
	console.log(e.detail.prevStep) // 변경 전 스텝
	console.log(e.detail.maxStep) // 스텝의 최대 값(위 예시의 경우 3)
})
```

#### peak

progressVisible의 값을 사용하되, 다른 기준으로 진행률을 변조하여 측정 및 사용할 수 있습니다. peak에는 start, goal, end, 이렇게 세개의 설정값이 필요하며, `peak: [start, goal, end]`와 같이 정의할 수 있습니다. progressVisible의 값이 이렇게 정의된 목표값(goal)에 도달하면 1을 출력하고, 시작값(start) 이하라면 0, 종료값(end) 이상이면 다시 0을 출력합니다.

```html
<div class="scradar" data-scradar="{progressVisible: true, peak: [0, 0.5, 1]}">
```

<div class="grid grid-cols-2 gap-4 sm:grid-cols-4">

![progressVisible: 0  
progressPeak: 0](06_01.png)

![progressVisible: 0.5  
progressPeak: 1](06_02.png)

![progressVisible: 1  
progressPeak: 0](06_03.png)

</div>

::: details 작성중...
    
### 거리(offset) 관련 옵션

#### offsetStart

화면의 시점(상단 또는 좌측)을 기준으로 하는 거리 값 사용 여부

#### offsetEnd

화면의 종점(하단 또는 우측)을 기준으로 하는 거리 값 사용 여부

### 기타 옵션

#### once

최초 활성화 시 제어 대상에서 해제 여부

```html
<div class="scradar" data-scradar="{progressVisible: true, once: true}">
```

‘in’ 또는 ‘fire’ 사용 가능

#### trigger

활성화(충돌) 여부를 판정하기 위한 대상
값은 셀렉터(String 타입) → ‘.content .trigger’

#### prefix

속성명의 고유성을 보장하기 위한 접두사

`data-scradar="{progressVisible: 'data', prefix: 'test'}"` 와 같이 옵션 사용시 다음과 같이 출력 `data-test-progress-visible="진행률"`

#### horizontal

#### breakPoint

```html
<div class="scradar" data-scradar="{progressVisible: true, breakPoint: {640: {horizontal: true}}}">
```
:::


## 기본 기능

### target 요소에 제공되는 기본 기능

옵션을 사용하지 않을 경우에도 target에는 기본적으로 다음과 같은 속성이 부여됩니다.

#### 가시 상태 판별

target이 화면에 보이거나 보이지 않는 상태를 다음과 같이 표현합니다.

```html
<!-- target이 화면에 보이지 않는 상태 -->
<div class="scradar" data-scradar="{...}" data-scradar-in="0">

<!-- target이 화면에 보이는 상태 -->
<div class="scradar" data-scradar="{...}" data-scradar-in="1">
```

또한, target에 이벤트 리스너를 등록하여 다음과 같이 이벤트를 수신할 수 있습니다.

```jsx
// 화면에서 사라질 때
target.addEventListener('scrollExit', (e) => {
	console.log(e.detail.from) // 진출 방향: 'top' 또는 'bottom'
})

// 화면에 등장할 때
target.addEventListener('scrollEnter', (e) => {
	console.log(e.detail.from) // 진입 방향: 'top' 또는 'bottom'
})
```

#### 충돌 상태 판별

target이 화면의 시점(상단 또는 좌측)에 닿았거나 닿지 않은 상태를 다음과 같이 표현합니다.

```html
<!-- target이 화면의 시점에 닿지 않은 상태 -->
<div class="scradar" data-scradar="{...}" data-scradar-enter="0">

<!-- target이 화면의 시점에 닿은 상태 -->
<div class="scradar" data-scradar="{...}" data-scradar-enter="1">
```

target이 화면의 종점(하단 또는 우측)에 닿았거나 닿지 않은 상태를 다음과 같이 표현합니다.

```html
<!-- target이 화면의 종점에 닿지 않은 상태 -->
<div class="scradar" data-scradar="{...}" data-scradar-exit="0">

<!-- target이 화면의 종점에 닿은 상태 -->
<div class="scradar" data-scradar="{...}" data-scradar-exit="1">
```

따라서 target이 화면을 가득 채웠을 때는 다음과 같이 표현됩니다.

```html
<div class="scradar" data-scradar="{...}" data-scradar-in="1" data-scradar-enter="1" data-scradar-exit="1">
```

이 경우에도 target에 이벤트 리스너를 등록하여 다음과 같이 이벤트를 수신할 수 있습니다.

```jsx
// target이 화면을 가득 채웠을 때
target.addEventListener('fullIn', (e) => {
	console.log(e.detail.from) // 진입 방향: 'top' 또는 'bottom'
})

// target이 화면을 가득 채운 상태에서 벗어났을 때
target.addEventListener('fullOut', (e) => {
	console.log(e.detail.from) // 진출 방향: 'top' 또는 'bottom'
})
```

### html 요소에 제공되는 기본 기능

옵션을 사용하지 않을 경우에도 html에는 기본적으로 다음과 같은 속성이 부여됩니다.

#### 스크롤 진행률

전체 스크롤의 진행률을 다음과 같이 표현합니다(진행률은 0 부터 1 까지의 값).

```html
<!-- 스크롤 최상단: 스크롤이 시작되지 않은 상태 -->
<html data-scradar-progress="0">

<!-- 스크롤 최하단: 스크롤이 모두 끝난 상태 -->
<html data-scradar-progress="1">
```

#### 스크롤 방향 판별

현재 스크롤의 방향을 다음과 같이 표현합니다.

```html
<!-- 정방향으로 스크롤 한 상태 -->
<html data-scradar-scroll="1">

<!-- 역방향으로 스크롤 한 상태 -->
<html data-scradar-scroll="-1">
```

## 인터랙션 구현

Scradar.js는 크게 두가지 방법으로 사용할 수 있습니다. 첫번째는 진행률(progress)의 값을 그대로 사용하는 방법이고, 두번째는 `@keyframes` 애니메이션을 활용하는 방법입니다.

### 진행률 직접 사용

```css
opacity: var(--progress-full);
```

```css
left: calc(var(--progress-full, 0) * 1px);
```

```css
transform: scale(clamp(0.2, var(--progress-fill), 0.6);
```

```css
transform: scale(min(max(0.2, var(--progress-fill)), 0.6));
```

잠시 Scradar.js에 관한 이야기에서 벗어나서 CSS의 훌륭한 기능에 대해 이야기해보겠습니다.

1. CSS의 `var()` 함수는 두번째 인수로 기본값을 정의할 수 있습니다.
위 left 예제의 경우 `--progress-full` 속성이 유효하지 않을 경우 기본값인 `0`이 사용되며 `calc()` 함수에 의해 `0px`이 결과값이 됩니다.
2. `clamp()`, `min()`, `max()`와 같은 CSS 함수를 적극 활용하세요.
    1. 이 함수들은 결과값을 예측 가능하게 만들고, 의도치 않은 오류를 줄이는데 도움이 됩니다.
    2. 이 함수들 역시 계산식(`+`, `-`, `*`, `/`)을 지원합니다. 따로 `calc()` 함수를 사용하지 않아도 됩니다.
        
        ```css
        opacity: min(1, var(--progress-full) * 2);
        ```
        

### 진행률 우회 사용

`@keyframes`를 사용하면 보다 복잡하고 정교한 애니메이션을 (비교적)쉽게 구현할 수 있고, 재사용도 가능합니다. Scradar.js는 이런 키프레임 애니메이션을 `animation-delay`에 진행률을 대입하는 방식으로 제어할 수 있습니다.

```css
@keyframes sample {
  0% {
    opacity: 1;
    transform: scale(1);
  }
  25% {
    transform: scale(1.5);
  }
  50% {
    opacity: 0;
    transform: scale(0);
  }
  100% {
    opacity: 1;
    transform: scale(1);
  }
}

.target {
	animation: sample 1s cubic-bezier(0.45, 0.05, 0.55, 0.95) forwards paused;
	animation-delay: calc(var(--progress-full) * -1s);
}
```

위 예제에서 `--progress-full`이 `0`이면 `animation-delay`는 `-0s`, 즉 `0s`가 되며 이는 sample 애니메이션의 `0%`에 해당합니다. 만약 `--progress-full`이 `1`이면 `animation-delay`는 `-1s`가 되며 이는 sample 애니메이션의 `100%`에 해당합니다.

이 것은 위 예제의 `animation-duration`이 `1s`로 정의되어 있기 때문이며, 만약 `animation-duration`이 `3s`로 정의된 경우라면 `animation-delay`의 값이 `-3s`여야 sample 애니메이션의 `100%`에 해당할 것입니다(다만, 실제 애니메이션은 `animation-duration`과 무관하게 `animation-delay`, 즉 진행률에 의해 제어되기에 굳이 `1s` 외에 다른 값을 정의할 필요는 없습니다).

구현하고자 하는 애니메이션에 따라 위 예제와는 다른 값을 사용해야 하는 경우가 있을 것입니다(`forwards` 대신에 `backwards`를 사용한다던지). 여기서는 `animation-delay`를 통해 키프레임 애니메이션을 제어할 수 있다는 점만 기억하시면 됩니다.

### 지연값(delay)과 지속값(duration)을 이용한 순차 제어

지금까지 애니메이션을 제어하는 기본적인 방법을 확인했습니다. 이번에는 이를 응용해볼 차례입니다. 여러개의 요소를 순차적으로 제어해야 하는 상황을 가정하겠습니다.

`opacity`가 `0`으로 정의된 5개의 item이 있습니다. 각 아이템은 진행률이 20% 증가하는 동안 `opcity`가 `1`로 증가합니다. 단, 동시에 변경되지 않고 순차적으로 변경됩니다. 이를 표로 정리하면 다음과 같습니다.

| 제어 대상 / 진행률 | 0% | 20% | 40% | 60% | 80% | 100% |
| --- | --- | --- | --- | --- | --- | --- |
| item1 | 0 | 1 | 1 | 1 | 1 | 1 |
| item2 | 0 | 0 | 1 | 1 | 1 | 1 |
| item3 | 0 | 0 | 0 | 1 | 1 | 1 |
| item4 | 0 | 0 | 0 | 0 | 1 | 1 |
| item5 | 0 | 0 | 0 | 0 | 0 | 1 |

이제 위 내용을 바탕으로 CSS를 작성해보겠습니다.

```css
.item1 { opacity: calc(var(--progress-full) / 0.2); }
```

```css
.item2 { opacity: calc((var(--progress-full) - 0.2) / 0.2); }
```

```css
.item1 { opacity: calc(var(--progress-full) / 0.2); }
.item2 { opacity: calc((var(--progress-full) - 0.2) / 0.2); }
.item3 { opacity: calc((var(--progress-full) - 0.4) / 0.2); }
.item4 { opacity: calc((var(--progress-full) - 0.6) / 0.2); }
.item5 { opacity: calc((var(--progress-full) - 0.8) / 0.2); }
```

위 예제의 계산식 `(progress - n1) / n2`은 결과적으로 `n1`만큼의 delay를 적용하고, `n2`만큼의 duration을 적용하게 됩니다. 물론 이로 인해 `opcity`의 결과값이 음수가 되는 경우가 발생하나, `opacity`는 음수를 `0`과 동일하게 처리하기에 신경쓸 필요는 없습니다. 그럼 음수가 유효한 `scale`의 경우는 어떨까요?

위와 비슷한 조건으로 `opacity`가 아닌 `scale`을 제어해보겠습니다. `scale`의 기본값은 `1`이고, `5`까지 확대될 수 있습니다.

```css
.item1 { transform: scale(clamp(1, var(--progress-full) / 0.2 * 5), 5); }
.item2 { transform: scale(clamp(1, (var(--progress-full) - 0.2) / 0.2 * 5), 5); }
.item3 { transform: scale(clamp(1, (var(--progress-full) - 0.4) / 0.2 * 5), 5); }
.item4 { transform: scale(clamp(1, (var(--progress-full) - 0.6) / 0.2 * 5), 5); }
.item5 { transform: scale(clamp(1, (var(--progress-full) - 0.8) / 0.2 * 5), 5); }
```

우선 `clamp()` 함수를 이용해 최소값 `1`과 최대값 `5`로 범위를 지정했습니다. 또, `--progress-full`의 최대값인 `1`을 `scale` 최대값인 `5`로 맞추기 위해 `5`를 곱했습니다. 결과적으로 위 예제에 적용된 계산식은 다음과 같습니다. `clamp(min, (progress - delay) / duration * max, max)`