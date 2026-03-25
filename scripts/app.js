/* ==========================================================================
   app.js — Entry point: fetch data, init modules, handle toggles
   ========================================================================== */

import { createGraph } from './graph.js';
import {
  handleNodeHover,
  handleNodeLeave,
  highlightNode,
  clearHighlight,
  clearFamilyFilter,
  buildLegend,
  getActiveFamily
} from './interactions.js';
import { initPanel, openPanel, closePanel } from './panel.js';

(async function main() {
  // Fetch data
  const response = await fetch('data/graph-data.json');
  const data = await response.json();

  // Build node map from original data (for panel lookups)
  const nodeMap = new Map(data.nodes.map(n => [n.id, n]));
  const familyMap = new Map(data.families.map(f => [f.id, f]));

  // State
  let selectedNodeId = null;
  let graph = null;

  // Create graph
  graph = createGraph(document.getElementById('graph-svg'), data, {
    onNodeClick: (d) => selectNode(d.id),
    onNodeHover: handleNodeHover,
    onNodeLeave: handleNodeLeave,
    onBackgroundClick: () => {
      if (getActiveFamily()) {
        clearFamilyFilter(graph);
      }
      deselectNode();
    }
  });

  // Init panel with navigation callback
  initPanel((targetId) => selectNode(targetId));

  // Build legend
  buildLegend(data.families, graph);

  // ---------- Node selection ----------
  function selectNode(nodeId) {
    selectedNodeId = nodeId;
    const node = nodeMap.get(nodeId);
    if (!node) return;

    highlightNode(nodeId, graph);
    openPanel(node, familyMap, graph.links, nodeMap);
  }

  function deselectNode() {
    selectedNodeId = null;
    clearHighlight(graph);
    closePanel();
  }

  // ---------- Zoom controls ----------
  const svgEl = graph.svg;
  const zoomBehavior = graph.zoom;

  document.getElementById('zoom-in').addEventListener('click', () => {
    svgEl.transition().duration(300).call(zoomBehavior.scaleBy, 1.4);
  });

  document.getElementById('zoom-out').addEventListener('click', () => {
    svgEl.transition().duration(300).call(zoomBehavior.scaleBy, 0.7);
  });

  document.getElementById('zoom-reset').addEventListener('click', () => {
    svgEl.transition().duration(500).call(zoomBehavior.transform, d3.zoomIdentity);
  });

  // ---------- Toggle authors ----------
  const toggleAuthorsBtn = document.getElementById('toggle-authors');
  let authorsVisible = true;

  toggleAuthorsBtn.addEventListener('click', () => {
    authorsVisible = !authorsVisible;
    toggleAuthorsBtn.classList.toggle('active', !authorsVisible);
    document.getElementById('graph-svg').classList.toggle('authors-hidden', !authorsVisible);
  });

  // ---------- Toggle theme ----------
  const toggleThemeBtn = document.getElementById('toggle-theme');

  // Detect initial preference
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  let isDark = prefersDark;

  // If system prefers light, start in light mode
  if (!prefersDark) {
    document.documentElement.classList.add('light-mode');
  }

  toggleThemeBtn.addEventListener('click', () => {
    isDark = !isDark;
    if (isDark) {
      document.documentElement.classList.remove('light-mode');
      document.documentElement.classList.add('dark-mode');
    } else {
      document.documentElement.classList.remove('dark-mode');
      document.documentElement.classList.add('light-mode');
    }
  });
})();
