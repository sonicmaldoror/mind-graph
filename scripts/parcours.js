/* ==========================================================================
   parcours.js — Navigation guidée à travers les parcours épistémiques
   ========================================================================== */

export class ParcourNavigator {
  constructor(graph, data, { onEnter, onExit }) {
    this.graph = graph;
    this.data = data;
    this.nodeMap = new Map(data.nodes.map(n => [n.id, n]));
    this.familyMap = new Map(data.families.map(f => [f.id, f]));
    this.onEnter = onEnter;
    this.onExit = onExit;

    this.active = false;
    this.currentParcours = null;
    this.currentStepIndex = 0;
    this.stepNodeIds = [];

    this._keyHandler = null;
    this._overlayGroup = null;
  }

  isActive() {
    return this.active;
  }

  start(parcoursId) {
    const parcours = this.data.parcours.find(p => p.id === parcoursId);
    if (!parcours) return;

    this.currentParcours = parcours;
    this.currentStepIndex = 0;
    this.stepNodeIds = parcours.steps.map(s => s.node);
    this.active = true;

    // Callback : fermer le panneau libre, reset filtres
    if (this.onEnter) this.onEnter();

    // Stopper la simulation pour figer les positions
    this.graph.simulation.stop();

    // Créer le groupe SVG overlay pour les lignes de parcours
    this._overlayGroup = this.graph.g.append('g').attr('class', 'parcours-overlay');

    // Activer le mode parcours sur le graphe
    this.graph.g.classed('parcours-active', true);

    // Ouvrir le panneau
    const panel = document.getElementById('detail-panel');
    panel.classList.add('open');
    panel.setAttribute('aria-hidden', 'false');

    // Afficher le bouton de sortie flottant
    const exitBtn = document.getElementById('parcours-exit');
    exitBtn.classList.add('visible');
    exitBtn.setAttribute('aria-hidden', 'false');
    this._exitBtnHandler = () => this.stop();
    exitBtn.addEventListener('click', this._exitBtnHandler);

    this._bindKeyboard();
    this._renderStep();
  }

  stop() {
    if (!this.active) return;

    this.active = false;
    this.currentParcours = null;
    this.currentStepIndex = 0;
    this.stepNodeIds = [];

    // Retirer le mode parcours
    this.graph.g.classed('parcours-active', false);

    // Nettoyer les classes sur les éléments
    this.graph.nodeElements.classed('parcours-current parcours-visited parcours-upcoming parcours-current-pulse', false);
    this.graph.labelElements.classed('parcours-current parcours-visited parcours-upcoming', false);
    this.graph.linkElements.classed('parcours-link-active', false);

    // Supprimer l'overlay
    if (this._overlayGroup) {
      this._overlayGroup.remove();
      this._overlayGroup = null;
    }

    // Fermer le panneau
    const panel = document.getElementById('detail-panel');
    panel.classList.remove('open');
    panel.setAttribute('aria-hidden', 'true');

    // Masquer le bouton de sortie flottant
    const exitBtn = document.getElementById('parcours-exit');
    exitBtn.classList.remove('visible');
    exitBtn.setAttribute('aria-hidden', 'true');
    if (this._exitBtnHandler) {
      exitBtn.removeEventListener('click', this._exitBtnHandler);
      this._exitBtnHandler = null;
    }

    this._unbindKeyboard();

    // Restaurer les opacités par défaut des liens
    this.graph.linkElements.each(function (d) {
      const opacity = d.type === 'opposition' ? 0.35 : d.type === 'reformulation' ? 0.3 : 0.15;
      d3.select(this).attr('stroke-opacity', opacity);
    });

    // Relancer la simulation doucement
    this.graph.simulation.alpha(0.1).restart();

    // Reset zoom
    this.graph.svg.transition().duration(600).call(
      this.graph.zoom.transform, d3.zoomIdentity
    );

    if (this.onExit) this.onExit();
  }

  next() {
    if (!this.active) return;
    if (this.currentStepIndex < this.currentParcours.steps.length - 1) {
      this.currentStepIndex++;
      this._renderStep();
    }
  }

  prev() {
    if (!this.active) return;
    if (this.currentStepIndex > 0) {
      this.currentStepIndex--;
      this._renderStep();
    }
  }

  _renderStep() {
    this._applyStepHighlight();
    this._drawPathLinks();
    this._renderPanelContent();
    this._panToCurrentNode();
  }

  _applyStepHighlight() {
    const currentId = this.stepNodeIds[this.currentStepIndex];
    const visited = new Set(this.stepNodeIds.slice(0, this.currentStepIndex));
    const upcoming = new Set(this.stepNodeIds.slice(this.currentStepIndex + 1));
    const allInParcours = new Set(this.stepNodeIds);

    // Nœuds
    this.graph.nodeElements
      .classed('parcours-current', d => d.id === currentId)
      .classed('parcours-current-pulse', d => d.id === currentId)
      .classed('parcours-visited', d => visited.has(d.id))
      .classed('parcours-upcoming', d => upcoming.has(d.id));

    // Labels
    this.graph.labelElements
      .classed('parcours-current', d => d.id === currentId)
      .classed('parcours-visited', d => visited.has(d.id))
      .classed('parcours-upcoming', d => upcoming.has(d.id));

    // Liens : mettre en évidence ceux entre nœuds visités consécutifs ou adjacents au courant
    const visitedWithCurrent = new Set([...visited, currentId]);

    this.graph.linkElements
      .classed('parcours-link-active', d => {
        const sid = typeof d.source === 'object' ? d.source.id : d.source;
        const tid = typeof d.target === 'object' ? d.target.id : d.target;
        return visitedWithCurrent.has(sid) && visitedWithCurrent.has(tid);
      });
  }

  _drawPathLinks() {
    if (!this._overlayGroup) return;
    this._overlayGroup.selectAll('line').remove();

    const color = this.currentParcours.color;
    const nodes = this.graph.nodes;

    // Dessiner des lignes entre étapes consécutives déjà visitées + courant
    for (let i = 0; i <= this.currentStepIndex && i < this.stepNodeIds.length - 1; i++) {
      if (i + 1 > this.currentStepIndex) break;
      const srcNode = nodes.find(n => n.id === this.stepNodeIds[i]);
      const tgtNode = nodes.find(n => n.id === this.stepNodeIds[i + 1]);
      if (srcNode && tgtNode) {
        this._overlayGroup.append('line')
          .attr('x1', srcNode.x)
          .attr('y1', srcNode.y)
          .attr('x2', tgtNode.x)
          .attr('y2', tgtNode.y)
          .attr('stroke', color);
      }
    }
  }

  _panToCurrentNode() {
    const currentId = this.stepNodeIds[this.currentStepIndex];
    const node = this.graph.nodes.find(n => n.id === currentId);
    if (!node) return;

    const svgEl = this.graph.svg.node();
    const rect = svgEl.getBoundingClientRect();
    const scale = 1.6;

    // Décalage pour compenser le panneau latéral (400px à droite sur desktop)
    const isDesktop = window.innerWidth >= 1200;
    const panelOffset = isDesktop ? 200 : 0;
    const verticalOffset = !isDesktop ? -80 : 0;

    const tx = (rect.width / 2 - panelOffset) - node.x * scale;
    const ty = (rect.height / 2 + verticalOffset) - node.y * scale;

    const transform = d3.zoomIdentity.translate(tx, ty).scale(scale);

    this.graph.svg.transition()
      .duration(600)
      .ease(d3.easeCubicInOut)
      .call(this.graph.zoom.transform, transform);
  }

  _renderPanelContent() {
    const step = this.currentParcours.steps[this.currentStepIndex];
    const node = this.nodeMap.get(step.node);
    if (!node) return;

    const family = this.familyMap.get(node.family);
    const color = this.currentParcours.color;
    const total = this.currentParcours.steps.length;
    const current = this.currentStepIndex + 1;
    const progress = (current / total) * 100;

    // Références
    const refsHtml = (node.references || []).length ? `
      <div class="panel-section-title">Références</div>
      <ul class="panel-refs">
        ${node.references.map(r => `<li>${this._formatRef(r)}</li>`).join('')}
      </ul>
    ` : '';

    // Lien SEP
    const sepHtml = node.sep_url ? `
      <a href="${node.sep_url}" target="_blank" rel="noopener" class="parcours-panel-sep">
        <span>Approfondir ce concept sur l'encyclop&eacute;die en ligne de Stanford</span>
        <span class="parcours-panel-sep-arrow">&nearr;</span>
      </a>
    ` : '';

    const panelContent = document.getElementById('panel-content');
    panelContent.innerHTML = `
      <div class="parcours-panel-header">
        <span class="parcours-panel-dot" style="background: ${color}"></span>
        <span class="parcours-panel-title">${this.currentParcours.title}</span>
        <span class="parcours-panel-step">${current}/${total}</span>
      </div>
      <div class="parcours-panel-progress">
        <div class="parcours-panel-progress-bar" style="width: ${progress}%; background: ${color}"></div>
      </div>
      ${this._getLinkTagHtml()}
      <div class="panel-badge" style="background: ${family ? family.color + '22' : '#88822'}; color: ${family ? family.color : '#888'}">
        <span class="legend-family-dot" style="background: ${family ? family.color : '#888'}; width: 8px; height: 8px"></span>
        ${family ? family.name : ''}
      </div>
      <div class="parcours-panel-node-label">${node.label}</div>
      <div class="parcours-panel-period">${step.period || ''}</div>
      <div class="parcours-panel-text">${step.text}</div>
      ${sepHtml}
      ${refsHtml}
      <div class="parcours-panel-nav">
        <button class="parcours-btn parcours-btn-prev" ${this.currentStepIndex === 0 ? 'disabled' : ''}>&larr; Précédent</button>
        <button class="parcours-btn parcours-btn-next" ${this.currentStepIndex === total - 1 ? 'disabled' : ''}>Suivant &rarr;</button>
      </div>
      <button class="parcours-btn-exit">Quitter le parcours</button>
    `;

    // Boutons nav
    panelContent.querySelector('.parcours-btn-prev')?.addEventListener('click', () => this.prev());
    panelContent.querySelector('.parcours-btn-next')?.addEventListener('click', () => this.next());
    panelContent.querySelector('.parcours-btn-exit')?.addEventListener('click', () => this.stop());

    // Scroll en haut du panneau
    document.getElementById('detail-panel').scrollTop = 0;
  }

  _getLinkTagHtml() {
    if (this.currentStepIndex === 0) return '';

    const prevId = this.stepNodeIds[this.currentStepIndex - 1];
    const currId = this.stepNodeIds[this.currentStepIndex];
    const prevNode = this.nodeMap.get(prevId);

    // Chercher un lien direct entre les deux nœuds
    const link = this.data.links.find(l => {
      const sid = typeof l.source === 'string' ? l.source : l.source.id;
      const tid = typeof l.target === 'string' ? l.target : l.target.id;
      return (sid === prevId && tid === currId) || (sid === currId && tid === prevId);
    });

    if (!link) return '';

    const labels = {
      filiation: 'Filiation',
      opposition: 'Opposition',
      reformulation: 'Reformulation'
    };

    return `
      <div class="parcours-panel-link-tag ${link.type}">
        <span class="parcours-panel-link-tag-arrow">&#8618;</span>
        ${labels[link.type] || link.type} depuis ${prevNode ? prevNode.label : prevId}
      </div>
    `;
  }

  _formatRef(ref) {
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

  _bindKeyboard() {
    this._keyHandler = (e) => {
      if (!this.active) return;
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        e.preventDefault();
        this.next();
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault();
        this.prev();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        this.stop();
      }
    };
    document.addEventListener('keydown', this._keyHandler);
  }

  _unbindKeyboard() {
    if (this._keyHandler) {
      document.removeEventListener('keydown', this._keyHandler);
      this._keyHandler = null;
    }
  }
}
