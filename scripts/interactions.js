/* ==========================================================================
   interactions.js — Tooltip, highlight, family filter
   ========================================================================== */

const tooltip = document.getElementById('tooltip');

export function handleNodeHover(event, d, familyMap) {
  const family = familyMap.get(d.family);
  const familyName = family ? family.name : '';
  const familyColor = family ? family.color : '#888';

  const refsHtml = (d.references || []).slice(0, 3).map(r => {
    const parts = [r.author, `(${r.year})`];
    return parts.join(' ');
  }).join(' ; ');

  tooltip.innerHTML = `
    <div class="tooltip-label">${d.label}</div>
    <div class="tooltip-family" style="color: ${familyColor}">${familyName}</div>
    <div class="tooltip-desc">${truncate(d.description, 160)}</div>
    ${refsHtml ? `<div class="tooltip-refs">${refsHtml}</div>` : ''}
  `;

  tooltip.classList.add('visible');
  positionTooltip(event);
}

export function handleNodeLeave() {
  tooltip.classList.remove('visible');
}

/* ---------- Link tooltip ---------- */

const linkTypeLabels = {
  filiation: 'Filiation',
  opposition: 'Opposition',
  reformulation: 'Reformulation'
};

const linkTypeColors = {
  filiation: 'var(--text-muted)',
  opposition: '#c44',
  reformulation: '#4A90D9'
};

export function handleLinkHover(event, d, nodeMap) {
  const srcId = typeof d.source === 'object' ? d.source.id : d.source;
  const tgtId = typeof d.target === 'object' ? d.target.id : d.target;
  const srcNode = typeof d.source === 'object' ? d.source : nodeMap.get(srcId);
  const tgtNode = typeof d.target === 'object' ? d.target : nodeMap.get(tgtId);
  const srcLabel = srcNode?.label || srcId;
  const tgtLabel = tgtNode?.label || tgtId;
  const typeLabel = linkTypeLabels[d.type] || d.type;
  const typeColor = linkTypeColors[d.type] || 'var(--text-muted)';

  tooltip.innerHTML = `
    <div class="tooltip-link-type" style="color: ${typeColor}">${typeLabel}</div>
    <div class="tooltip-link-nodes">${srcLabel} &harr; ${tgtLabel}</div>
    ${d.description ? `<div class="tooltip-desc">${truncate(d.description, 200)}</div>` : ''}
  `;

  tooltip.classList.add('visible');
  positionTooltip(event);
}

export function handleLinkLeave() {
  tooltip.classList.remove('visible');
}

function positionTooltip(event) {
  const padding = 16;
  const x = event.clientX + padding;
  const y = event.clientY + padding;
  const rect = tooltip.getBoundingClientRect();

  const left = x + rect.width > window.innerWidth ? event.clientX - rect.width - padding : x;
  const top = y + rect.height > window.innerHeight ? event.clientY - rect.height - padding : y;

  tooltip.style.left = `${left}px`;
  tooltip.style.top = `${top}px`;
}

function truncate(str, len) {
  if (!str || str.length <= len) return str || '';
  return str.slice(0, len).replace(/\s+\S*$/, '') + '...';
}

/* ---------- Highlight on node click ---------- */

export function highlightNode(nodeId, graph) {
  const { nodes, links, nodeElements, linkElements, labelElements } = graph;

  // Find neighbors
  const neighborIds = new Set([nodeId]);
  links.forEach(l => {
    const sid = typeof l.source === 'object' ? l.source.id : l.source;
    const tid = typeof l.target === 'object' ? l.target.id : l.target;
    if (sid === nodeId) neighborIds.add(tid);
    if (tid === nodeId) neighborIds.add(sid);
  });

  // Add CSS class for dimming
  graph.g.classed('graph-dimmed', true);

  nodeElements.classed('highlighted', d => neighborIds.has(d.id));
  nodeElements.classed('selected', d => d.id === nodeId);
  labelElements.classed('highlighted', d => neighborIds.has(d.id));
  labelElements.classed('selected', d => d.id === nodeId);

  linkElements.classed('highlighted', d => {
    const sid = typeof d.source === 'object' ? d.source.id : d.source;
    const tid = typeof d.target === 'object' ? d.target.id : d.target;
    return (sid === nodeId || tid === nodeId);
  });

  // Boost highlighted link opacity
  linkElements.each(function (d) {
    const sid = typeof d.source === 'object' ? d.source.id : d.source;
    const tid = typeof d.target === 'object' ? d.target.id : d.target;
    if (sid === nodeId || tid === nodeId) {
      d3.select(this).attr('stroke-opacity', 0.7);
    }
  });
}

export function clearHighlight(graph) {
  const { nodeElements, linkElements, labelElements } = graph;

  graph.g.classed('graph-dimmed', false);

  nodeElements.classed('highlighted', false).classed('selected', false);
  labelElements.classed('highlighted', false).classed('selected', false);
  linkElements.classed('highlighted', false);

  // Restore default opacities
  linkElements.each(function (d) {
    const opacity = d.type === 'opposition' ? 0.35 : d.type === 'reformulation' ? 0.3 : 0.15;
    d3.select(this).attr('stroke-opacity', opacity);
  });
}

/* ---------- Family filter ---------- */

let activeFamily = null;

export function getActiveFamily() {
  return activeFamily;
}

export function filterByFamily(familyId, graph) {
  const { nodeElements, linkElements, labelElements } = graph;

  if (activeFamily === familyId) {
    // Toggle off
    activeFamily = null;
    nodeElements.style('display', null);
    linkElements.style('display', null);
    labelElements.style('display', null);
    updateLegendState(null);
    return;
  }

  activeFamily = familyId;

  nodeElements.style('display', d => d.family === familyId ? null : 'none');
  labelElements.style('display', d => d.family === familyId ? null : 'none');

  linkElements.style('display', d => {
    const src = typeof d.source === 'object' ? d.source : { family: null };
    const tgt = typeof d.target === 'object' ? d.target : { family: null };
    return (src.family === familyId && tgt.family === familyId) ? null : 'none';
  });

  updateLegendState(familyId);
}

export function clearFamilyFilter(graph) {
  activeFamily = null;
  graph.nodeElements.style('display', null);
  graph.linkElements.style('display', null);
  graph.labelElements.style('display', null);
  updateLegendState(null);
}

function updateLegendState(activeFamilyId) {
  document.querySelectorAll('.legend-family-item').forEach(el => {
    const fid = el.dataset.family;
    el.classList.toggle('active', fid === activeFamilyId);
    el.classList.toggle('dimmed', activeFamilyId !== null && fid !== activeFamilyId);
  });
}

/* ---------- Build legend ---------- */

export function buildLegend(families, graph) {
  const container = document.getElementById('legend-families');
  container.innerHTML = '';

  families.forEach(f => {
    const item = document.createElement('div');
    item.className = 'legend-family-item';
    item.dataset.family = f.id;
    item.innerHTML = `
      <span class="legend-family-dot" style="background: ${f.color}"></span>
      <span>${f.name}</span>
    `;
    item.addEventListener('click', () => filterByFamily(f.id, graph));
    container.appendChild(item);
  });
}
