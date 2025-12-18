/**
 * SignalOne - Shared Time Range Select Component
 * 
 * Usage in Modules:
 * import { createTimeRangeSelect } from '../../shared/timeRangeSelect.js';
 * 
 * const dropdown = createTimeRangeSelect({
 *   currentRange: ctx.appState.settings?.range || '7d',
 *   onChange: (newRange) => {
 *     // Update AppState
 *     const updatedSettings = { ...ctx.appState.settings, range: newRange };
 *     window.SignalOne.AppState.settings = updatedSettings;
 *     // Reload module
 *     window.SignalOne.reloadCurrentModule();
 *   }
 * });
 * 
 * headerContainer.appendChild(dropdown);
 */

export function createTimeRangeSelect(options = {}) {
  const {
    currentRange = '7d',
    onChange = null,
    id = 'moduleTimeRangeSelect'
  } = options;
  
  const rangeOptions = [
    { value: '30d', label: '30 Tage' },
    { value: '7d', label: '7 Tage' },
    { value: '24h', label: '24 Stunden' }
  ];
  
  const container = document.createElement('div');
  container.className = 'time-range-select-container';
  
  const label = document.createElement('label');
  label.className = 'time-range-label';
  label.textContent = 'ZEITRAUM';
  label.htmlFor = id;
  
  const select = document.createElement('select');
  select.id = id;
  select.className = 'time-range-select';
  
  rangeOptions.forEach(option => {
    const optionEl = document.createElement('option');
    optionEl.value = option.value;
    optionEl.textContent = option.label;
    optionEl.selected = option.value === currentRange;
    select.appendChild(optionEl);
  });
  
  select.addEventListener('change', (e) => {
    const newRange = e.target.value;
    console.log('[TimeRangeSelect] Changed to:', newRange);
    
    if (onChange && typeof onChange === 'function') {
      onChange(newRange);
    }
  });
  
  container.appendChild(label);
  container.appendChild(select);
  
  return container;
}

/**
 * Load Time Range Select CSS
 */
export function loadTimeRangeSelectCSS() {
  if (document.getElementById('time-range-select-css')) return;
  
  const link = document.createElement('link');
  link.id = 'time-range-select-css';
  link.rel = 'stylesheet';
  link.href = '/shared/timeRangeSelect.css';
  document.head.appendChild(link);
}