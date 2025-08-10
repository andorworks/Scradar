export default class ScradarDebug {
  constructor(scradar) {
    this.scradar = scradar;
    this.overlay = null;
    this.isCollapsed = localStorage.getItem('scradar-debug-collapsed') === 'true';
    this.isTargetsCollapsed = localStorage.getItem('scradar-targets-collapsed') === 'true';
    this.collapsedTargets = JSON.parse(localStorage.getItem('scradar-targets-individual') || '[]');
    this.isHidden = localStorage.getItem('scradar-debug-hidden') === 'true';
    this.performanceMetrics = {
      updateCount: 0,
      lastUpdateTime: 0,
      avgUpdateTime: 0,
      maxUpdateTime: 0,
      elementsCount: 0
    };
    this.init();
  }

  init() {
    if (document.getElementById('scradar-debug-overlay')) return;
    
    this.overlay = document.createElement('div');
    this.overlay.id = 'scradar-debug-overlay';
    this.overlay.innerHTML = `
      <style>
        #scradar-debug-overlay {
          position: fixed;
          top: 10px;
          right: 10px;
          z-index: 999999;
          background: rgba(0, 0, 0, 0.85);
          color: #fff;
          padding: 15px;
          border-radius: 8px;
          font-family: 'Monaco', 'Menlo', monospace;
          font-size: 12px;
          min-width: 300px;
          max-width: 420px;
          max-height: 80vh;
          overflow-y: auto;
          pointer-events: all;
          user-select: text;
          box-shadow: 0 4px 20px rgba(0,0,0,0.3);
          transition: all 0.3s ease;
        }
        #scradar-debug-overlay.collapsed {
          min-width: 300px;
          max-width: 300px;
          max-height: 60px;
          overflow: hidden;
        }
        #scradar-debug-overlay::-webkit-scrollbar {
          width: 6px;
        }
        #scradar-debug-overlay::-webkit-scrollbar-track {
          background: rgba(255,255,255,0.1);
        }
        #scradar-debug-overlay::-webkit-scrollbar-thumb {
          background: rgba(255,255,255,0.3);
          border-radius: 3px;
        }
        #scradar-debug-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 10px;
          padding-bottom: 10px;
          border-bottom: 1px solid rgba(255,255,255,0.2);
          cursor: pointer;
        }
        #scradar-debug-title {
          font-weight: bold;
          font-size: 14px;
          color: #4fc3f7;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        #scradar-debug-toggle {
          font-size: 12px;
          color: #81c784;
          transition: transform 0.3s ease;
        }
        #scradar-debug-overlay.collapsed #scradar-debug-toggle {
          transform: rotate(-90deg);
        }
        .scradar-debug-performance {
          background: rgba(76, 175, 80, 0.1);
          border: 1px solid rgba(76, 175, 80, 0.3);
          padding: 8px;
          border-radius: 4px;
          margin-bottom: 10px;
        }
        .scradar-debug-warning {
          background: rgba(255, 193, 7, 0.1);
          border: 1px solid rgba(255, 193, 7, 0.3);
          padding: 8px;
          border-radius: 4px;
          margin-bottom: 10px;
          color: #ffc107;
        }
        .scradar-debug-error {
          background: rgba(244, 67, 54, 0.1);
          border: 1px solid rgba(244, 67, 54, 0.3);
          padding: 8px;
          border-radius: 4px;
          margin-bottom: 10px;
          color: #f44336;
        }
        #scradar-debug-close {
          cursor: pointer;
          padding: 2px 8px;
          background: rgba(255,255,255,0.1);
          border-radius: 4px;
          transition: background 0.2s;
        }
        #scradar-debug-close:hover {
          background: rgba(255,255,255,0.2);
        }
        .scradar-debug-section {
          margin-bottom: 15px;
        }
        .scradar-debug-section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          cursor: pointer;
          padding: 5px 0;
          border-bottom: 1px solid rgba(255,255,255,0.1);
        }
        .scradar-debug-section-header:hover {
          background: rgba(255,255,255,0.05);
        }
        .scradar-debug-section-content {
          transition: all 0.3s ease;
          overflow: hidden;
        }
        .scradar-debug-section-content.collapsed {
          max-height: 0;
          opacity: 0;
        }
        .scradar-debug-label {
          color: #81c784;
          font-weight: bold;
          margin-bottom: 5px;
        }
        .scradar-debug-value {
          color: #ffd54f;
          font-weight: bold;
        }
        .scradar-debug-target {
          background: rgba(255,255,255,0.05);
          padding: 8px;
          margin-bottom: 8px;
          border-radius: 4px;
          border-left: 3px solid #4fc3f7;
        }
        .scradar-debug-target-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          cursor: pointer;
          margin-bottom: 4px;
        }
        .scradar-debug-target-header:hover {
          background: rgba(255,255,255,0.05);
          border-radius: 2px;
          padding: 2px;
          margin: -2px;
        }
        .scradar-debug-target-title {
          color: #4fc3f7;
          font-weight: bold;
        }
        .scradar-debug-target-toggle {
          font-size: 10px;
          color: #81c784;
          transition: transform 0.3s ease;
        }
        .scradar-debug-target-content {
          transition: all 0.3s ease;
          overflow: hidden;
        }
        .scradar-debug-target-content.collapsed {
          max-height: 0;
          opacity: 0;
        }
        .scradar-debug-progress {
          display: grid;
          grid-template-columns: auto 1fr;
          gap: 4px 8px;
          font-size: 11px;
        }
        .scradar-debug-progress-bar {
          height: 3px;
          background: rgba(255,255,255,0.1);
          border-radius: 2px;
          overflow: hidden;
          margin-top: 2px;
        }
        .scradar-debug-progress-fill {
          height: 100%;
          background: #4fc3f7;
          transition: width 0.1s;
        }
        .scradar-debug-shortcuts {
          font-size: 10px;
          color: #aaa;
          margin-top: 10px;
          padding-top: 10px;
          border-top: 1px solid rgba(255,255,255,0.1);
        }
      </style>
      <div id="scradar-debug-header">
        <div id="scradar-debug-title">
          🎯 Scradar Debug
          <span id="scradar-debug-toggle">▼</span>
        </div>
        <div id="scradar-debug-close">✕</div>
      </div>
      <div id="scradar-debug-content">
        <div class="scradar-debug-performance">
          <div class="scradar-debug-label">⚡ Performance</div>
          <div class="scradar-debug-progress">
            <span>Elements:</span>
            <span class="scradar-debug-value" id="debug-elements">-</span>
            <span>Updates:</span>
            <span class="scradar-debug-value" id="debug-updates">-</span>
            <span>Avg Update:</span>
            <span class="scradar-debug-value" id="debug-avg">-</span>
            <span>Max Update:</span>
            <span class="scradar-debug-value" id="debug-max">-</span>
          </div>
        </div>
        
        <div class="scradar-debug-section">
          <div class="scradar-debug-section-header" id="global-header">
            <div class="scradar-debug-label">🌍 Global</div>
            <span class="scradar-debug-toggle">▼</span>
          </div>
          <div class="scradar-debug-section-content" id="global-content">
            <div class="scradar-debug-progress">
              <span>Scroll Progress:</span>
              <span class="scradar-debug-value" id="debug-progress">-</span>
              <span>Direction:</span>
              <span class="scradar-debug-value" id="debug-direction">-</span>
              <span>Boundary Target:</span>
              <span class="scradar-debug-value" id="debug-target">-</span>
            </div>
            <div class="scradar-debug-progress-bar">
              <div class="scradar-debug-progress-fill" id="debug-progress-bar"></div>
            </div>
          </div>
        </div>
        
        <div class="scradar-debug-section">
          <div class="scradar-debug-section-header" id="targets-header">
            <div class="scradar-debug-label">🎯 Targets</div>
            <span class="scradar-debug-toggle">▼</span>
          </div>
          <div class="scradar-debug-section-content" id="targets-content">
            <div id="debug-targets-list"></div>
          </div>
        </div>
        
        <div class="scradar-debug-shortcuts">
          <div>⌘+Shift+D: Toggle Debug</div>
          <div>⌘+Shift+C: Toggle Collapse</div>
        </div>
      </div>
    `;
    
    document.body.append(this.overlay);
    
    // Apply saved states
    if (this.isCollapsed) {
      this.overlay.classList.add('collapsed');
      this.overlay.querySelector('#scradar-debug-toggle').textContent = '▶';
    }
    
    if (this.isTargetsCollapsed) {
      this.overlay.querySelector('#targets-content').classList.add('collapsed');
      this.overlay.querySelector('#targets-header .scradar-debug-toggle').textContent = '▶';
    }
    
    // Apply hidden state
    if (this.isHidden) {
      this.overlay.style.display = 'none';
    }
    
    // Event listeners
    this.overlay.querySelector('#scradar-debug-close').addEventListener('click', () => {
      this.overlay.style.display = 'none';
      this.isHidden = true;
      localStorage.setItem('scradar-debug-hidden', 'true');
    });
    
    this.overlay.querySelector('#scradar-debug-header').addEventListener('click', () => {
      this.toggleCollapse();
    });
    
    this.overlay.querySelector('#global-header').addEventListener('click', () => {
      this.toggleSection('global');
    });
    
    this.overlay.querySelector('#targets-header').addEventListener('click', () => {
      this.toggleSection('targets');
    });
    
    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey) {
        if (e.key === 'D') {
          this.isHidden = !this.isHidden;
          this.overlay.style.display = this.isHidden ? 'none' : 'block';
          localStorage.setItem('scradar-debug-hidden', this.isHidden);
        } else if (e.key === 'C') {
          this.toggleCollapse();
        }
      }
    });
    
    this.update();
  }

  toggleCollapse() {
    this.isCollapsed = !this.isCollapsed;
    this.overlay.classList.toggle('collapsed', this.isCollapsed);
    this.overlay.querySelector('#scradar-debug-toggle').textContent = 
      this.isCollapsed ? '▶' : '▼';
    
    // Save state
    localStorage.setItem('scradar-debug-collapsed', this.isCollapsed);
  }

  toggleSection(section) {
    const content = this.overlay.querySelector(`#${section}-content`);
    const toggle = this.overlay.querySelector(`#${section}-header .scradar-debug-toggle`);
    
    if (section === 'targets') {
      this.isTargetsCollapsed = !this.isTargetsCollapsed;
      content.classList.toggle('collapsed', this.isTargetsCollapsed);
      toggle.textContent = this.isTargetsCollapsed ? '▶' : '▼';
      localStorage.setItem('scradar-targets-collapsed', this.isTargetsCollapsed);
    } else {
      content.classList.toggle('collapsed');
      toggle.textContent = content.classList.contains('collapsed') ? '▶' : '▼';
    }
  }

  toggleTarget(targetId) {
    const targetContent = this.overlay.querySelector(`#target-${targetId}-content`);
    const targetToggle = this.overlay.querySelector(`#target-${targetId}-toggle`);
    
    const isCollapsed = targetContent.classList.contains('collapsed');
    targetContent.classList.toggle('collapsed', !isCollapsed);
    targetToggle.textContent = isCollapsed ? '▼' : '▶';
    
    // Update saved state
    if (isCollapsed) {
      this.collapsedTargets = this.collapsedTargets.filter(id => id !== targetId);
    } else {
      this.collapsedTargets.push(targetId);
    }
    localStorage.setItem('scradar-targets-individual', JSON.stringify(this.collapsedTargets));
  }

  update() {
    if (!this.overlay || this.overlay.style.display === 'none') return;
    
    // Performance tracking
    const startTime = performance.now();
    
    const scrollProgress = +(document.documentElement.dataset.scradarProgress || 0);
    const scrollDirection = +(document.documentElement.dataset.scradarScroll || 0);
    const boundaryTarget = document.documentElement.dataset.scradarTarget || '-';
    
    // Update performance metrics
    this.performanceMetrics.elementsCount = this.scradar.elements.length;
    const activeElements = this.scradar.elements.filter(el => +el.dataset.scradarIn).length;
    
    // Update performance section
    this.overlay.querySelector('#debug-elements').textContent = 
      `${this.performanceMetrics.elementsCount} (${activeElements} active)`;
    this.overlay.querySelector('#debug-updates').textContent = 
      this.performanceMetrics.updateCount;
    this.overlay.querySelector('#debug-avg').textContent = 
      `${this.performanceMetrics.avgUpdateTime.toFixed(2)}ms`;
    this.overlay.querySelector('#debug-max').textContent = 
      `${this.performanceMetrics.maxUpdateTime.toFixed(2)}ms`;
    
    // Update global section
    this.overlay.querySelector('#debug-progress').textContent = 
      scrollProgress.toFixed(3);
    this.overlay.querySelector('#debug-direction').textContent = 
      scrollDirection === 1 ? '↓ Down' : scrollDirection === -1 ? '↑ Up' : '• Stop';
    this.overlay.querySelector('#debug-target').textContent = boundaryTarget;
    this.overlay.querySelector('#debug-progress-bar').style.width = 
      `${scrollProgress * 100}%`;
    
    // Update targets section
    const targetsList = this.overlay.querySelector('#debug-targets-list');
    let targetsHtml = '';
    
    this.scradar.elements.forEach((el, idx) => {
      const ctrl = el.scradar;
      if (!ctrl) return;
      
      const targetId = `target-${idx}`;
      const title = el.dataset.scradarTitle || el.dataset.scradarConfig || el.className || el.tagName.toLowerCase();
      const isIn = +el.dataset.scradarIn;
      const isTargetCollapsed = this.collapsedTargets.includes(targetId);
      
      targetsHtml += `
        <div class="scradar-debug-target">
          <div class="scradar-debug-target-header" onclick="window.scradarDebug.toggleTarget('${targetId}')">
            <div class="scradar-debug-target-title">
              #${idx + 1} ${title} ${isIn ? '🐵' : '🙈'}
            </div>
            <span class="scradar-debug-target-toggle" id="target-${targetId}-toggle">${isTargetCollapsed ? '▶' : '▼'}</span>
          </div>
          <div class="scradar-debug-target-content" id="target-${targetId}-content" ${isTargetCollapsed ? 'class="collapsed"' : ''}>
            <div class="scradar-debug-progress">
              ${ctrl.visibility !== undefined ? `
                <span>visibility:</span>
                <span class="scradar-debug-value">${ctrl.visibility.toFixed(3)}</span>
              ` : ''}
              ${ctrl.fill !== undefined ? `
                <span>fill:</span>
                <span class="scradar-debug-value">${ctrl.fill.toFixed(3)}</span>
              ` : ''}
              ${ctrl.cover !== undefined ? `
                <span>cover:</span>
                <span class="scradar-debug-value">${ctrl.cover.toFixed(3)}</span>
              ` : ''}
              ${ctrl.enter !== undefined ? `
                <span>enter:</span>
                <span class="scradar-debug-value">${ctrl.enter.toFixed(3)}</span>
              ` : ''}
              ${ctrl.exit !== undefined ? `
                <span>exit:</span>
                <span class="scradar-debug-value">${ctrl.exit.toFixed(3)}</span>
              ` : ''}
              ${ctrl.peak !== undefined && ctrl.peak !== 0 ? `
                <span>peak:</span>
                <span class="scradar-debug-value">${ctrl.peak.toFixed(3)}</span>
              ` : ''}
              ${ctrl.currentVisibilityStep !== null ? `
                <span>step:</span>
                <span class="scradar-debug-value">${ctrl.currentVisibilityStep}</span>
              ` : ''}
            </div>
            ${ctrl.visibility !== undefined ? `
              <div class="scradar-debug-progress-bar">
                <div class="scradar-debug-progress-fill" style="width: ${ctrl.visibility * 100}%"></div>
              </div>
            ` : ''}
          </div>
        </div>
      `;
    });
    
    targetsList.innerHTML = targetsHtml;
    
    // Update performance metrics
    const endTime = performance.now();
    const updateTime = endTime - startTime;
    
    this.performanceMetrics.updateCount++;
    this.performanceMetrics.lastUpdateTime = updateTime;
    
    // Calculate running average
    this.performanceMetrics.avgUpdateTime = 
      (this.performanceMetrics.avgUpdateTime * (this.performanceMetrics.updateCount - 1) + updateTime) 
      / this.performanceMetrics.updateCount;
    
    // Track maximum update time
    if (updateTime > this.performanceMetrics.maxUpdateTime) {
      this.performanceMetrics.maxUpdateTime = updateTime;
    }
  }

  destroy() {
    if (this.overlay) {
      this.overlay.remove();
      this.overlay = null;
    }
  }
}
