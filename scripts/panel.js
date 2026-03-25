/* ==========================================================================
   panel.js — Detail panel (description + bibliography)
   ========================================================================== */

const panel = document.getElementById('detail-panel');
const panelContent = document.getElementById('panel-content');
const panelClose = document.getElementById('panel-close');

let onNavigateToNode = null;

export function initPanel(navigateCallback) {
  onNavigateToNode = navigateCallback;
  panelClose.addEventListener('click', closePanel);
}

export function openPanel(node, familyMap, links, nodeMap) {
  const family = familyMap.get(node.family);
  const familyName = family ? family.name : '';
  const familyColor = family ? family.color : '#888';

  // Find connections
  const connections = [];
  links.forEach(l => {
    const sid = typeof l.source === 'object' ? l.source.id : l.source;
    const tid = typeof l.target === 'object' ? l.target.id : l.target;
    if (sid === node.id) {
      const target = typeof l.target === 'object' ? l.target : nodeMap.get(tid);
      if (target) connections.push({ node: target, type: l.type, description: l.description, direction: 'to' });
    } else if (tid === node.id) {
      const source = typeof l.source === 'object' ? l.source : nodeMap.get(sid);
      if (source) connections.push({ node: source, type: l.type, description: l.description, direction: 'from' });
    }
  });

  const connectionsHtml = connections.length ? `
    <div class="panel-connections">
      <div class="panel-section-title">Connexions</div>
      ${connections.map(c => `
        <div class="panel-connection" data-node-id="${c.node.id}">
          <span class="panel-connection-type ${c.type}">${formatLinkType(c.type)}</span>
          <span>
            <strong>${c.node.label}</strong>
            ${c.description ? `<br><span style="font-size:12px;color:var(--text-muted)">${c.description}</span>` : ''}
          </span>
        </div>
      `).join('')}
    </div>
  ` : '';

  const refsHtml = (node.references || []).length ? `
    <div class="panel-section-title">R&eacute;f&eacute;rences</div>
    <ul class="panel-refs">
      ${node.references.map(r => `<li>${formatReference(r)}</li>`).join('')}
    </ul>
  ` : '';

  panelContent.innerHTML = `
    <div class="panel-badge" style="background: ${familyColor}22; color: ${familyColor}">
      <span class="legend-family-dot" style="background: ${familyColor}; width: 8px; height: 8px"></span>
      ${familyName}
    </div>
    <div class="panel-label">${node.label}</div>
    <div class="panel-type">
      ${node.type === 'author' ? 'Auteur' : 'Concept'}
      ${node.period ? ` &middot; <span class="panel-period">${node.period}</span>` : ''}
    </div>
    <div class="panel-description">${node.description || ''}</div>
    ${connectionsHtml}
    ${refsHtml}
  `;

  // Connection click handlers
  panelContent.querySelectorAll('.panel-connection').forEach(el => {
    el.addEventListener('click', () => {
      const targetId = el.dataset.nodeId;
      if (onNavigateToNode) onNavigateToNode(targetId);
    });
  });

  panel.classList.add('open');
  panel.setAttribute('aria-hidden', 'false');
}

export function closePanel() {
  panel.classList.remove('open');
  panel.setAttribute('aria-hidden', 'true');
}

function formatLinkType(type) {
  const labels = {
    filiation: 'filiation',
    opposition: 'opposition',
    reformulation: 'reformul.'
  };
  return labels[type] || type;
}

function formatReference(ref) {
  let html = `<span class="ref-year">${ref.year}</span> &mdash; `;
  html += `${ref.author} `;
  html += `<span class="ref-title">${ref.title}</span>`;

  const details = [];
  if (ref.journal) details.push(ref.journal);
  if (ref.volume) details.push(ref.volume);
  if (ref.pages) details.push(`p. ${ref.pages}`);
  if (ref.publisher) details.push(ref.publisher);
  if (ref.in) details.push(`in ${ref.in}`);

  if (details.length) {
    html += `<br><span class="ref-detail">${details.join(', ')}</span>`;
  }

  return html;
}
