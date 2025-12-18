/**
 * TimeRange Handler for Dashboard
 * Manages 24h/7d/30d time range switching
 */

export const TimeRangeHandler = {
  currentRange: '7d', // default
  
  init(container, onRangeChange) {
    this.container = container;
    this.onRangeChange = onRangeChange;
    this.render();
  },
  
  render() {
    const dropdown = this.container.querySelector('.timerange-dropdown');
    if (!dropdown) return;
    
    dropdown.innerHTML = `
      <select class="timerange-select" style="
        background: rgba(255,255,255,0.05);
        border: 1px solid rgba(255,255,255,0.1);
        color: #fff;
        padding: 8px 32px 8px 12px;
        border-radius: 8px;
        font-size: 14px;
        font-weight: 500;
        cursor: pointer;
        appearance: none;
        background-image: url('data:image/svg+xml;utf8,<svg fill="white" height="24" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg"><path d="M7 10l5 5 5-5z"/></svg>');
        background-repeat: no-repeat;
        background-position: right 8px center;
        background-size: 20px;
      ">
        <option value="24h" ${this.currentRange === '24h' ? 'selected' : ''}>24 Stunden</option>
        <option value="7d" ${this.currentRange === '7d' ? 'selected' : ''}>7 Tage</option>
        <option value="30d" ${this.currentRange === '30d' ? 'selected' : ''}>30 Tage</option>
      </select>
    `;
    
    const select = dropdown.querySelector('.timerange-select');
    select.addEventListener('change', (e) => {
      this.setRange(e.target.value);
    });
  },
  
  setRange(range) {
    if (this.currentRange === range) return;
    
    this.currentRange = range;
    
    // Update UI
    const select = this.container.querySelector('.timerange-select');
    if (select) select.value = range;
    
    // Trigger callback
    if (this.onRangeChange) {
      this.onRangeChange(range);
    }
    
    // Toast notification
    if (window.SignalOne?.showToast) {
      const labels = { '24h': '24 Stunden', '7d': '7 Tage', '30d': '30 Tage' };
      window.SignalOne.showToast(`Zeitraum geändert: ${labels[range]}`, 'info');
    }
  },
  
  getRange() {
    return this.currentRange;
  }
};
