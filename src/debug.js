export default class ScradarDebug {
  constructor(scradar) {
    this.scradar = scradar;
    this.overlay = null;
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
          max-width: 420px;
          max-height: 80vh;
          overflow-y: auto;
          pointer-events: all;
          user-select: text;
          box-shadow: 0 4px 20px rgba(0,0,0,0.3);
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
        }
        #scradar-debug-title {
          font-weight: bold;
          font-size: 14px;
          color: #4fc3f7;
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
        .scradar-debug-target-title {
          color: #4fc3f7;
          margin-bottom: 4px;
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
      </style>
      <div id="scradar-debug-header">
        <div id="scradar-debug-title">🎯 Scradar Debug</div>
        <div id="scradar-debug-close">✕</div>
      </div>
      <div id="scradar-debug-content"></div>
    `;
    
    document.body.append(this.overlay);
    
    // Close button
    this.overlay.querySelector('#scradar-debug-close').addEventListener('click', () => {
      this.overlay.style.display = 'none';
    });
    
    // Toggle with keyboard shortcut (Ctrl/Cmd + Shift + D)
    document.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'D') {
        this.overlay.style.display = 
          this.overlay.style.display === 'none' ? 'block' : 'none';
      }
    });
    
    this.update();
  }

  update() {
    if (!this.overlay) return;
    
    const content = this.overlay.querySelector('#scradar-debug-content');
    const scrollProgress = +(document.documentElement.dataset.scradarProgress || 0);
    const scrollDirection = +(document.documentElement.dataset.scradarScroll || 0);
    const boundaryTarget = document.documentElement.dataset.scradarTarget || '-';
    
    let html = '';
    
    // Global info
    html += `
      <div class="scradar-debug-section">
        <div class="scradar-debug-label">Global</div>
        <div class="scradar-debug-progress">
          <span>Scroll Progress:</span>
          <span class="scradar-debug-value">${scrollProgress.toFixed(3)}</span>
          <span>Direction:</span>
          <span class="scradar-debug-value">${scrollDirection === 1 ? '↓ Down' : scrollDirection === -1 ? '↑ Up' : '• Stop'}</span>
          <span>Boundary Target:</span>
          <span class="scradar-debug-value">${boundaryTarget}</span>
        </div>
        <div class="scradar-debug-progress-bar">
          <div class="scradar-debug-progress-fill" style="width: ${scrollProgress * 100}%"></div>
        </div>
      </div>
    `;
    
    // Targets info
    html += '<div class="scradar-debug-section">';
    html += '<div class="scradar-debug-label">Targets</div>';
    
    this.scradar.elements.forEach((el, idx) => {
      const ctrl = el.scradar;
      if (!ctrl) return;
      
      const title = el.dataset.scradarTitle || el.className || el.tagName.toLowerCase();
      const isIn = +el.dataset.scradarIn;
      
      html += `
        <div class="scradar-debug-target">
          <div class="scradar-debug-target-title">
            #${idx + 1} ${title} ${isIn ? '🐵' : '🙈'}
          </div>
          <div class="scradar-debug-progress">
            ${ctrl.progressVisible !== undefined ? `
              <span>visible:</span>
              <span class="scradar-debug-value">${ctrl.progressVisible.toFixed(3)}</span>
            ` : ''}
            ${ctrl.progressFill !== undefined ? `
              <span>fill:</span>
              <span class="scradar-debug-value">${ctrl.progressFill.toFixed(3)}</span>
            ` : ''}
            ${ctrl.progressFull !== undefined ? `
              <span>full:</span>
              <span class="scradar-debug-value">${ctrl.progressFull.toFixed(3)}</span>
            ` : ''}
            ${ctrl.progressStart !== undefined ? `
              <span>start:</span>
              <span class="scradar-debug-value">${ctrl.progressStart.toFixed(3)}</span>
            ` : ''}
            ${ctrl.progressEnd !== undefined ? `
              <span>end:</span>
              <span class="scradar-debug-value">${ctrl.progressEnd.toFixed(3)}</span>
            ` : ''}
            ${ctrl.progressPeak !== undefined && ctrl.progressPeak !== 0 ? `
              <span>peak:</span>
              <span class="scradar-debug-value">${ctrl.progressPeak.toFixed(3)}</span>
            ` : ''}
            ${ctrl.currentVisibleStep !== null ? `
              <span>step:</span>
              <span class="scradar-debug-value">${ctrl.currentVisibleStep}</span>
            ` : ''}
          </div>
          ${ctrl.progressVisible !== undefined ? `
            <div class="scradar-debug-progress-bar">
              <div class="scradar-debug-progress-fill" style="width: ${ctrl.progressVisible * 100}%"></div>
            </div>
          ` : ''}
        </div>
      `;
    });
    
    html += '</div>';
    content.innerHTML = html;
  }

  destroy() {
    if (this.overlay) {
      this.overlay.remove();
      this.overlay = null;
    }
  }
}
