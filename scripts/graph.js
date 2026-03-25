/* ==========================================================================
   graph.js — D3 force-directed simulation & SVG rendering
   ========================================================================== */

export function createGraph(container, data, { onNodeClick, onNodeHover, onNodeLeave, onBackgroundClick }) {
  const svg = d3.select(container);
  const rect = container.getBoundingClientRect();
  const width = rect.width || window.innerWidth;
  const height = rect.height || window.innerHeight;

  // Build lookup maps
  const familyMap = new Map(data.families.map(f => [f.id, f]));
  const nodeMap = new Map(data.nodes.map(n => [n.id, n]));

  // Deep-copy nodes & links so D3 can mutate them
  const nodes = data.nodes.map(n => ({ ...n }));
  const links = data.links.map(l => ({ ...l }));

  // Pre-position nodes near their family center (avoids cold-start clumping)
  const familyCentersRaw = {};
  data.families.forEach(f => {
    familyCentersRaw[f.id] = {
      x: f.center.x * width,
      y: f.center.y * height
    };
  });
  nodes.forEach(n => {
    const center = familyCentersRaw[n.family];
    if (center) {
      n.x = center.x + (Math.random() - 0.5) * 80;
      n.y = center.y + (Math.random() - 0.5) * 80;
    }
  });

  // Family centers already computed during pre-positioning
  const familyCenters = familyCentersRaw;

  // Radius scale
  const radiusConcept = d => 3 + d.weight * 1.1;
  const radiusAuthor = 4;
  const nodeRadius = d => d.type === 'author' ? radiusAuthor : radiusConcept(d);

  // ---------- Zoom ----------
  const g = svg.append('g');

  const zoom = d3.zoom()
    .scaleExtent([0.3, 5])
    .on('zoom', (event) => {
      g.attr('transform', event.transform);
    });

  svg.call(zoom);

  // Double-click on background = reset
  svg.on('dblclick.zoom', null);
  svg.on('dblclick', (event) => {
    if (event.target === svg.node()) {
      onBackgroundClick();
    }
  });

  // Click on background
  svg.on('click', (event) => {
    if (event.target === svg.node()) {
      onBackgroundClick();
    }
  });

  // ---------- Links ----------
  const linkGroup = g.append('g').attr('class', 'links');

  const linkElements = linkGroup.selectAll('line')
    .data(links)
    .join('line')
    .attr('class', d => {
      const sourceNode = nodeMap.get(typeof d.source === 'string' ? d.source : d.source.id);
      const targetNode = nodeMap.get(typeof d.target === 'string' ? d.target : d.target.id);
      const isAuthorLink = (sourceNode && sourceNode.type === 'author') || (targetNode && targetNode.type === 'author');
      return `link-line link-${d.type}${isAuthorLink ? ' link-author' : ''}`;
    })
    .attr('stroke', d => {
      if (d.type === 'opposition') return 'var(--link-opposition)';
      if (d.type === 'reformulation') return 'var(--link-reformulation)';
      return 'var(--link-filiation)';
    })
    .attr('stroke-width', d => d.type === 'opposition' ? 1.8 : 1.2)
    .attr('stroke-dasharray', d => {
      if (d.type === 'opposition') return '4,3';
      if (d.type === 'reformulation') return '8,4';
      return null;
    })
    .attr('stroke-opacity', d => {
      if (d.type === 'opposition') return 0.35;
      if (d.type === 'reformulation') return 0.3;
      return 0.15;
    });

  // ---------- Family labels ----------
  const familyLabels = g.append('g').attr('class', 'family-labels');

  familyLabels.selectAll('text')
    .data(data.families)
    .join('text')
    .attr('class', 'family-label')
    .attr('x', d => familyCenters[d.id].x)
    .attr('y', d => familyCenters[d.id].y - 30)
    .text(d => d.name);

  // ---------- Nodes ----------
  const nodeGroup = g.append('g').attr('class', 'nodes');

  // Concept nodes: circles
  const conceptNodes = nodes.filter(d => d.type === 'concept');
  const authorNodes = nodes.filter(d => d.type === 'author');

  const conceptElements = nodeGroup.selectAll('circle.node-concept')
    .data(conceptNodes)
    .join('circle')
    .attr('class', 'node-circle node-concept')
    .attr('r', nodeRadius)
    .attr('fill', d => {
      const family = familyMap.get(d.family);
      return family ? family.color : '#888';
    })
    .attr('stroke', d => {
      const family = familyMap.get(d.family);
      return family ? family.color : '#888';
    })
    .attr('stroke-width', 1.5)
    .attr('fill-opacity', 0.8)
    .style('cursor', 'pointer');

  // Author nodes: person icon
  const authorIconSize = 9;
  const authorElements = nodeGroup.selectAll('g.node-author')
    .data(authorNodes)
    .join('g')
    .attr('class', 'node-circle node-author')
    .style('cursor', 'pointer');

  // Person icon path (head + shoulders)
  authorElements.append('path')
    .attr('d', `M${-authorIconSize * 0.5},${authorIconSize * 0.45} C${-authorIconSize * 0.5},${-authorIconSize * 0.05} ${-authorIconSize * 0.25},${-authorIconSize * 0.5} 0,${-authorIconSize * 0.5} C${authorIconSize * 0.25},${-authorIconSize * 0.5} ${authorIconSize * 0.5},${-authorIconSize * 0.05} ${authorIconSize * 0.5},${authorIconSize * 0.45}`)
    .attr('fill', 'none')
    .attr('stroke', d => {
      const family = familyMap.get(d.family);
      return family ? family.color : '#888';
    })
    .attr('stroke-width', 1.3)
    .attr('stroke-linecap', 'round');

  authorElements.append('circle')
    .attr('cy', -authorIconSize * 0.35)
    .attr('r', authorIconSize * 0.22)
    .attr('fill', 'none')
    .attr('stroke', d => {
      const family = familyMap.get(d.family);
      return family ? family.color : '#888';
    })
    .attr('stroke-width', 1.3);

  // Unified selection for all node elements
  const nodeElements = nodeGroup.selectAll('.node-circle');

  // ---------- Labels ----------
  const MAX_LABEL_WIDTH = 14; // max chars per line
  const labelGroup = g.append('g').attr('class', 'labels');

  const labelElements = labelGroup.selectAll('g.label-wrap')
    .data(nodes)
    .join('g')
    .attr('class', d => {
      const base = 'node-label';
      return d.type === 'author' ? `${base} label-author` : base;
    });

  labelElements.each(function (d) {
    const g = d3.select(this);
    const lines = wrapText(d.label, MAX_LABEL_WIDTH);
    const fontSize = d.type === 'author' ? 9.5 : 10.5;
    const lineHeight = fontSize * 1.25;
    const offsetY = nodeRadius(d) + 12;

    lines.forEach((line, i) => {
      g.append('text')
        .attr('dy', offsetY + i * lineHeight)
        .attr('font-size', `${fontSize}px`)
        .attr('font-style', d.type === 'author' ? 'italic' : 'normal')
        .attr('font-weight', d.type === 'author' ? '700' : 'normal')
        .attr('fill', 'var(--text-secondary)')
        .attr('font-family', "'Inter', system-ui, sans-serif")
        .attr('text-anchor', 'middle')
        .attr('pointer-events', 'none')
        .text(line);
    });
  });

  function wrapText(text, maxChars) {
    if (text.length <= maxChars) return [text];
    const words = text.split(/\s+/);
    const lines = [];
    let current = '';
    for (const word of words) {
      if (current && (current.length + 1 + word.length) > maxChars) {
        lines.push(current);
        current = word;
      } else {
        current = current ? current + ' ' + word : word;
      }
    }
    if (current) lines.push(current);
    return lines;
  }

  // ---------- Interactions ----------
  nodeElements
    .on('mouseenter', (event, d) => onNodeHover(event, d, familyMap))
    .on('mouseleave', (event, d) => onNodeLeave(event, d))
    .on('click', (event, d) => {
      event.stopPropagation();
      onNodeLeave(event, d);
      onNodeClick(d);
    });

  // ---------- Drag ----------
  const drag = d3.drag()
    .on('start', (event, d) => {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      d.fx = d.x;
      d.fy = d.y;
    })
    .on('drag', (event, d) => {
      d.fx = event.x;
      d.fy = event.y;
    })
    .on('end', (event, d) => {
      if (!event.active) simulation.alphaTarget(0);
      d.fx = null;
      d.fy = null;
    });

  nodeElements.call(drag);

  // ---------- Simulation ----------
  const simulation = d3.forceSimulation(nodes)
    .force('link', d3.forceLink(links)
      .id(d => d.id)
      .distance(d => {
        const src = typeof d.source === 'object' ? d.source : nodeMap.get(d.source);
        const tgt = typeof d.target === 'object' ? d.target : nodeMap.get(d.target);
        if ((src && src.type === 'author') || (tgt && tgt.type === 'author')) return 35;
        return 70;
      })
      .strength(d => {
        const src = typeof d.source === 'object' ? d.source : nodeMap.get(d.source);
        const tgt = typeof d.target === 'object' ? d.target : nodeMap.get(d.target);
        if ((src && src.type === 'author') || (tgt && tgt.type === 'author')) return 0.6;
        return 0.25;
      }))
    .force('charge', d3.forceManyBody()
      .strength(d => d.type === 'author' ? -60 : -180))
    .force('x', d3.forceX(d => familyCenters[d.family]?.x || width / 2).strength(0.1))
    .force('y', d3.forceY(d => familyCenters[d.family]?.y || height / 2).strength(0.1))
    .force('collide', d3.forceCollide(d => nodeRadius(d) + 4))
    .on('tick', ticked);

  function ticked() {
    linkElements
      .attr('x1', d => d.source.x)
      .attr('y1', d => d.source.y)
      .attr('x2', d => d.target.x)
      .attr('y2', d => d.target.y);

    conceptElements
      .attr('cx', d => d.x)
      .attr('cy', d => d.y);

    authorElements
      .attr('transform', d => `translate(${d.x},${d.y})`);

    labelElements
      .attr('transform', d => `translate(${d.x},${d.y})`);
  }

  // ---------- Public API ----------
  return {
    nodes,
    links,
    nodeElements,
    linkElements,
    labelElements,
    familyMap,
    nodeMap,
    simulation,
    svg,
    g,
    zoom
  };
}
