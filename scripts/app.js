/* ==========================================================================
   app.js — Entry point: fetch data, init modules, handle toggles
   ========================================================================== */

import { createGraph } from './graph.js?v=1.2';
import {
  handleNodeHover,
  handleNodeLeave,
  handleLinkHover,
  handleLinkLeave,
  highlightNode,
  clearHighlight,
  clearFamilyFilter,
  buildLegend,
  getActiveFamily
} from './interactions.js?v=1.2';
import { initPanel, openPanel, closePanel } from './panel.js?v=1.2';
import { ParcourNavigator } from './parcours.js?v=1.2';

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
  let parcourNav = null;
  let linkTooltipsEnabled = true;

  // Create graph
  graph = createGraph(document.getElementById('graph-svg'), data, {
    onNodeClick: (d) => {
      if (parcourNav && parcourNav.isActive()) return;
      selectNode(d.id);
    },
    onNodeHover: handleNodeHover,
    onNodeLeave: handleNodeLeave,
    onLinkHover: (event, d, nodeMap) => {
      if (linkTooltipsEnabled) handleLinkHover(event, d, nodeMap);
    },
    onLinkLeave: (event, d) => {
      if (linkTooltipsEnabled) handleLinkLeave(event, d);
    },
    onBackgroundClick: () => {
      if (parcourNav && parcourNav.isActive()) {
        parcourNav.stop();
        return;
      }
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

  // ---------- Panel close in parcours mode ----------
  document.getElementById('panel-close').addEventListener('click', () => {
    if (parcourNav && parcourNav.isActive()) {
      parcourNav.stop();
    }
  });

  // ---------- Parcours épistémiques ----------
  parcourNav = new ParcourNavigator(graph, data, {
    onEnter: () => {
      deselectNode();
      clearFamilyFilter(graph);
    },
    onExit: () => {}
  });

  // ---------- Toggle link tooltips ----------
  const linkTooltipCheckbox = document.querySelector('#toggle-link-tooltips input');
  linkTooltipCheckbox.addEventListener('change', () => {
    linkTooltipsEnabled = linkTooltipCheckbox.checked;
  });

  // Populate parcours menu
  const parcoursMenu = document.getElementById('parcours-menu');
  const parcoursToggle = document.getElementById('parcours-toggle');

  if (data.parcours && data.parcours.length) {
    data.parcours.forEach(p => {
      const item = document.createElement('div');
      item.className = 'parcours-menu-item';
      item.innerHTML = `
        <span class="parcours-menu-dot" style="background: ${p.color}"></span>
        <div>
          <div class="parcours-menu-title">${p.title}</div>
          <div class="parcours-menu-subtitle">${p.subtitle}</div>
        </div>
      `;
      item.addEventListener('click', () => {
        parcoursMenu.classList.remove('open');
        parcoursToggle.classList.remove('active');
        parcourNav.start(p.id);
      });
      parcoursMenu.appendChild(item);
    });
  }

  // Toggle parcours dropdown
  parcoursToggle.addEventListener('click', () => {
    if (parcourNav.isActive()) {
      parcourNav.stop();
      return;
    }
    parcoursMenu.classList.toggle('open');
    parcoursToggle.classList.toggle('active');
  });

  // Close dropdown on outside click
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.parcours-dropdown')) {
      parcoursMenu.classList.remove('open');
      parcoursToggle.classList.remove('active');
    }
  });

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
