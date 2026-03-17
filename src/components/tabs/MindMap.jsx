import React, { useMemo, useRef, useState, useEffect, useCallback } from 'react';

const CATEGORY_COLORS = {
  tasks: '#ef4444',
  projects: '#f59e0b',
  decisions: '#22c55e',
  references: '#8b5cf6',
  architecture: '#06b6d4',
  context: '#64748b',
};

const CATEGORY_LABELS = {
  tasks: 'Tasks',
  projects: 'Projects',
  decisions: 'Decisions',
  references: 'References',
  architecture: 'Architecture',
  context: 'Context',
};

const FILTER_BUTTONS = ['All', 'Tasks', 'Projects', 'Decisions', 'References', 'Architecture'];

function buildGraph(extracted) {
  const nodes = [];
  const links = [];

  const title = extracted?.meta?.title || 'Meeting';
  const participants = extracted?.meta?.participants || [];

  // Root node
  nodes.push({
    id: 'root',
    label: title,
    category: 'root',
    detail: participants.length > 0 ? `Participants: ${participants.join(', ')}` : '',
    radius: 42,
  });

  const categoryItems = {};

  // Tasks
  if (extracted.tasks && Array.isArray(extracted.tasks)) {
    categoryItems.tasks = extracted.tasks;
    extracted.tasks.forEach((t, i) => {
      nodes.push({
        id: `task-${i}`,
        label: t.title || t.name || 'Task',
        category: 'tasks',
        detail: t.detail || t.description || '',
        tag: t.priority ? `P${t.priority}` : '',
        radius: 18,
      });
    });
  }

  // Projects
  if (extracted.projects && Array.isArray(extracted.projects)) {
    categoryItems.projects = extracted.projects;
    extracted.projects.forEach((p, i) => {
      nodes.push({
        id: `project-${i}`,
        label: p.name || p.title || 'Project',
        category: 'projects',
        detail: p.context || p.description || '',
        tag: p.status || '',
        radius: 20,
      });
    });
  }

  // Decisions
  if (extracted.decisions && Array.isArray(extracted.decisions)) {
    categoryItems.decisions = extracted.decisions;
    extracted.decisions.forEach((d, i) => {
      nodes.push({
        id: `decision-${i}`,
        label: d.title || d.name || 'Decision',
        category: 'decisions',
        detail: d.reason || d.description || '',
        tag: '',
        radius: 18,
      });
    });
  }

  // References
  if (extracted.references && Array.isArray(extracted.references)) {
    categoryItems.references = extracted.references;
    extracted.references.forEach((r, i) => {
      nodes.push({
        id: `reference-${i}`,
        label: r.label || r.name || r.title || 'Reference',
        category: 'references',
        detail: r.desc || r.description || r.url || '',
        tag: r.category || '',
        radius: 16,
      });
    });
  }

  // Architecture
  if (extracted.architecture) {
    const arch = extracted.architecture;
    if (arch.pattern) {
      nodes.push({
        id: 'arch-pattern',
        label: arch.pattern,
        category: 'architecture',
        detail: 'Architecture Pattern',
        tag: 'pattern',
        radius: 22,
      });
    }
    if (arch.layers && Array.isArray(arch.layers)) {
      arch.layers.forEach((l, i) => {
        nodes.push({
          id: `arch-layer-${i}`,
          label: l.name || l.label || 'Layer',
          category: 'architecture',
          detail: l.description || '',
          tag: 'layer',
          radius: 18,
        });
      });
    }
    if (arch.providers && Array.isArray(arch.providers)) {
      arch.providers.forEach((p, i) => {
        nodes.push({
          id: `arch-provider-${i}`,
          label: p.name || p.label || 'Provider',
          category: 'architecture',
          detail: p.description || '',
          tag: 'provider',
          radius: 16,
        });
      });
    }
  }

  // Cluster nodes per category
  const categories = ['tasks', 'projects', 'decisions', 'references', 'architecture'];
  categories.forEach((cat) => {
    const catNodes = nodes.filter((n) => n.category === cat);
    if (catNodes.length > 0) {
      const clusterId = `cluster-${cat}`;
      nodes.push({
        id: clusterId,
        label: CATEGORY_LABELS[cat],
        category: cat,
        detail: `${catNodes.length} items`,
        tag: '',
        radius: 28 + Math.min(catNodes.length, 5),
        isCluster: true,
      });
      links.push({ source: 'root', target: clusterId });
      catNodes.forEach((n) => {
        links.push({ source: clusterId, target: n.id });
      });
    }
  });

  // Cross-links: tasks mentioning project names
  if (categoryItems.tasks && categoryItems.projects) {
    categoryItems.tasks.forEach((t, ti) => {
      const taskText = ((t.title || '') + ' ' + (t.detail || '') + ' ' + (t.description || '')).toLowerCase();
      categoryItems.projects.forEach((p, pi) => {
        const projName = (p.name || p.title || '').toLowerCase();
        if (projName && projName.length > 2 && taskText.includes(projName)) {
          links.push({ source: `task-${ti}`, target: `project-${pi}`, crossLink: true });
        }
      });
    });
  }

  // Cross-links: decisions related to projects
  if (categoryItems.decisions && categoryItems.projects) {
    categoryItems.decisions.forEach((d, di) => {
      const decText = ((d.title || '') + ' ' + (d.reason || '') + ' ' + (d.description || '')).toLowerCase();
      categoryItems.projects.forEach((p, pi) => {
        const projName = (p.name || p.title || '').toLowerCase();
        if (projName && projName.length > 2 && decText.includes(projName)) {
          links.push({ source: `decision-${di}`, target: `project-${pi}`, crossLink: true });
        }
      });
    });
  }

  return { nodes, links };
}

function initPositions(nodes, width, height) {
  const pos = {};
  nodes.forEach((n, i) => {
    if (n.id === 'root') {
      pos[n.id] = { x: width / 2, y: height / 2, vx: 0, vy: 0 };
    } else {
      const angle = (2 * Math.PI * i) / nodes.length;
      const r = 150 + Math.random() * 100;
      pos[n.id] = {
        x: width / 2 + r * Math.cos(angle),
        y: height / 2 + r * Math.sin(angle),
        vx: 0,
        vy: 0,
      };
    }
  });
  return pos;
}

function splitLabel(label, maxChars = 16) {
  if (!label) return [''];
  if (label.includes('\n')) return label.split('\n');
  if (label.length <= maxChars) return [label];
  const words = label.split(' ');
  const lines = [];
  let current = '';
  words.forEach((w) => {
    if (current && (current + ' ' + w).length > maxChars) {
      lines.push(current);
      current = w;
    } else {
      current = current ? current + ' ' + w : w;
    }
  });
  if (current) lines.push(current);
  return lines;
}

export default function MindMap({ extracted }) {
  const containerRef = useRef(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 500 });
  const [activeFilter, setActiveFilter] = useState('All');
  const [hoveredNode, setHoveredNode] = useState(null);
  const [tooltip, setTooltip] = useState(null);
  const [transform, setTransform] = useState({ x: 0, y: 0, k: 1 });
  const [isPanning, setIsPanning] = useState(false);
  const panStart = useRef(null);
  const dragRef = useRef(null);

  const graph = useMemo(
    () => (extracted ? buildGraph(extracted) : { nodes: [], links: [] }),
    [extracted]
  );

  const { width, height } = dimensions;

  const [positions, setPositions] = useState(() =>
    initPositions(graph.nodes, 800, 500)
  );
  const posRef = useRef(positions);
  posRef.current = positions;

  // Re-initialize positions when graph changes
  useEffect(() => {
    const newPos = initPositions(graph.nodes, width, height);
    posRef.current = newPos;
    setPositions(newPos);
  }, [graph, width, height]);

  // Force simulation
  useEffect(() => {
    if (graph.nodes.length === 0) return;
    let animating = true;
    let alpha = 1;
    const alphaDecay = 0.012;
    const alphaMin = 0.001;
    const velocityDecay = 0.4;

    const nodeMap = {};
    graph.nodes.forEach((n) => { nodeMap[n.id] = n; });

    function tick() {
      if (!animating) return;
      alpha = Math.max(alpha - alphaDecay, alphaMin);

      const pos = {};
      const prev = posRef.current;
      const ids = Object.keys(prev);
      ids.forEach((id) => { pos[id] = { ...prev[id] }; });

      // Repulsion between all nodes
      for (let i = 0; i < ids.length; i++) {
        for (let j = i + 1; j < ids.length; j++) {
          const a = pos[ids[i]];
          const b = pos[ids[j]];
          const dx = b.x - a.x;
          const dy = b.y - a.y;
          const dist = Math.sqrt(dx * dx + dy * dy) || 1;
          const rA = nodeMap[ids[i]]?.radius || 20;
          const rB = nodeMap[ids[j]]?.radius || 20;
          const minDist = rA + rB + 30;
          const force = (-600 * alpha) / (dist * dist);
          const fx = (dx / dist) * force;
          const fy = (dy / dist) * force;
          a.vx -= fx;
          a.vy -= fy;
          b.vx += fx;
          b.vy += fy;

          if (dist < minDist) {
            const overlap = (minDist - dist) * 0.5;
            const ox = (dx / dist) * overlap;
            const oy = (dy / dist) * overlap;
            a.x -= ox;
            a.y -= oy;
            b.x += ox;
            b.y += oy;
          }
        }
      }

      // Attraction along links
      graph.links.forEach((link) => {
        const a = pos[link.source];
        const b = pos[link.target];
        if (!a || !b) return;
        const dx = b.x - a.x;
        const dy = b.y - a.y;
        const dist = Math.sqrt(dx * dx + dy * dy) || 1;
        const targetDist = link.crossLink ? 200 : 120;
        const strength = (dist - targetDist) * 0.03 * alpha;
        const fx = (dx / dist) * strength;
        const fy = (dy / dist) * strength;
        a.vx += fx;
        a.vy += fy;
        b.vx -= fx;
        b.vy -= fy;
      });

      // Center gravity
      const cx = width / 2;
      const cy = height / 2;
      ids.forEach((id) => {
        const p = pos[id];
        p.vx += (cx - p.x) * 0.01 * alpha;
        p.vy += (cy - p.y) * 0.01 * alpha;
      });

      // Apply velocity
      ids.forEach((id) => {
        const p = pos[id];
        if (dragRef.current && dragRef.current.id === id) {
          p.vx = 0;
          p.vy = 0;
          return;
        }
        p.vx *= (1 - velocityDecay);
        p.vy *= (1 - velocityDecay);
        p.x += p.vx;
        p.y += p.vy;
      });

      posRef.current = pos;
      setPositions(pos);

      if (alpha > alphaMin) {
        requestAnimationFrame(tick);
      }
    }

    requestAnimationFrame(tick);
    return () => { animating = false; };
  }, [graph, width, height]);

  // Resize observer
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width: w, height: h } = entry.contentRect;
        if (w > 0) setDimensions({ width: w, height: Math.max(h, 500) });
      }
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Node drag
  const handleNodeMouseDown = useCallback((e, nodeId) => {
    e.stopPropagation();
    e.preventDefault();
    dragRef.current = { id: nodeId, startX: e.clientX, startY: e.clientY };

    const handleMouseMove = (ev) => {
      if (!dragRef.current) return;
      const dx = (ev.clientX - dragRef.current.startX) / transform.k;
      const dy = (ev.clientY - dragRef.current.startY) / transform.k;
      dragRef.current.startX = ev.clientX;
      dragRef.current.startY = ev.clientY;
      setPositions((prev) => {
        const updated = { ...prev };
        const p = updated[dragRef.current.id];
        if (p) {
          updated[dragRef.current.id] = { ...p, x: p.x + dx, y: p.y + dy, vx: 0, vy: 0 };
        }
        posRef.current = updated;
        return updated;
      });
    };

    const handleMouseUp = () => {
      dragRef.current = null;
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  }, [transform.k]);

  // Pan
  const handlePanStart = useCallback((e) => {
    if (e.target.closest('[data-node]')) return;
    setIsPanning(true);
    panStart.current = { x: e.clientX - transform.x, y: e.clientY - transform.y };
  }, [transform]);

  const handlePanMove = useCallback((e) => {
    if (!isPanning || !panStart.current) return;
    setTransform((prev) => ({
      ...prev,
      x: e.clientX - panStart.current.x,
      y: e.clientY - panStart.current.y,
    }));
  }, [isPanning]);

  const handlePanEnd = useCallback(() => {
    setIsPanning(false);
    panStart.current = null;
  }, []);

  // Zoom
  const handleWheel = useCallback((e) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    setTransform((prev) => {
      const newK = Math.max(0.2, Math.min(3, prev.k * delta));
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return { ...prev, k: newK };
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;
      return {
        k: newK,
        x: mx - (mx - prev.x) * (newK / prev.k),
        y: my - (my - prev.y) * (newK / prev.k),
      };
    });
  }, []);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    el.addEventListener('wheel', handleWheel, { passive: false });
    return () => el.removeEventListener('wheel', handleWheel);
  }, [handleWheel]);

  // Filter
  const filterCategory = activeFilter === 'All' ? null : activeFilter.toLowerCase();
  const nodeOpacity = (node) => {
    if (!filterCategory) return 1;
    if (node.id === 'root') return 1;
    if (node.category === filterCategory) return 1;
    return 0.12;
  };
  const linkOpacity = (link) => {
    if (!filterCategory) return link.crossLink ? 0.25 : 0.4;
    const sNode = graph.nodes.find((n) => n.id === link.source);
    const tNode = graph.nodes.find((n) => n.id === link.target);
    if (sNode && tNode) {
      if (sNode.category === filterCategory || tNode.category === filterCategory ||
          sNode.id === 'root' || tNode.id === 'root') {
        return link.crossLink ? 0.35 : 0.6;
      }
    }
    return 0.05;
  };

  // Tooltip
  const handleNodeHover = useCallback((e, node) => {
    setHoveredNode(node.id);
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    setTooltip({
      x: e.clientX - rect.left + 12,
      y: e.clientY - rect.top - 10,
      node,
    });
  }, []);

  const handleNodeLeave = useCallback(() => {
    setHoveredNode(null);
    setTooltip(null);
  }, []);

  const title = extracted?.meta?.title || 'Meeting';
  const participants = extracted?.meta?.participants || [];

  if (!extracted || graph.nodes.length <= 1) {
    return (
      <div style={{ color: '#334155', fontFamily: 'IBM Plex Mono', padding: 32, textAlign: 'center' }}>
        No ideas to map
      </div>
    );
  }

  const activeCategories = [...new Set(
    graph.nodes.filter((n) => n.category !== 'root' && !n.isCluster).map((n) => n.category)
  )];

  return (
    <div style={{ fontFamily: 'IBM Plex Mono, monospace', background: '#0f1117', borderRadius: 8, overflow: 'hidden' }}>
      {/* Title bar */}
      <div style={{
        padding: '12px 16px',
        borderBottom: '1px solid #1a2030',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <div>
          <span style={{ color: '#e2e8f0', fontSize: 14, fontWeight: 600 }}>{title}</span>
          {participants.length > 0 && (
            <span style={{ color: '#64748b', fontSize: 12, marginLeft: 12 }}>
              {participants.join(', ')}
            </span>
          )}
        </div>
      </div>

      {/* Filter buttons */}
      <div style={{
        padding: '8px 16px',
        display: 'flex',
        gap: 6,
        flexWrap: 'wrap',
        borderBottom: '1px solid #1a2030',
      }}>
        {FILTER_BUTTONS.map((f) => {
          const isActive = activeFilter === f;
          const cat = f.toLowerCase();
          const color = CATEGORY_COLORS[cat] || '#94a3b8';
          return (
            <button
              key={f}
              onClick={() => setActiveFilter(f)}
              style={{
                background: isActive ? (f === 'All' ? '#1e293b' : color + '22') : 'transparent',
                border: `1px solid ${isActive ? (f === 'All' ? '#334155' : color) : '#1a2030'}`,
                borderRadius: 14,
                padding: '4px 12px',
                color: isActive ? (f === 'All' ? '#e2e8f0' : color) : '#64748b',
                fontSize: 11,
                fontFamily: 'IBM Plex Mono, monospace',
                cursor: 'pointer',
              }}
            >
              {f}
            </button>
          );
        })}
      </div>

      {/* SVG container */}
      <div
        ref={containerRef}
        style={{
          width: '100%',
          height: 500,
          position: 'relative',
          cursor: isPanning ? 'grabbing' : 'grab',
          overflow: 'hidden',
        }}
        onMouseDown={handlePanStart}
        onMouseMove={handlePanMove}
        onMouseUp={handlePanEnd}
        onMouseLeave={handlePanEnd}
      >
        <svg
          width={width}
          height={Math.max(height, 500)}
          style={{ display: 'block' }}
        >
          <g transform={`translate(${transform.x},${transform.y}) scale(${transform.k})`}>
            {/* Links */}
            {graph.links.map((link, i) => {
              const sp = positions[link.source];
              const tp = positions[link.target];
              if (!sp || !tp) return null;
              const sNode = graph.nodes.find((n) => n.id === link.source);
              const tNode = graph.nodes.find((n) => n.id === link.target);
              const color = CATEGORY_COLORS[tNode?.category] || CATEGORY_COLORS[sNode?.category] || '#64748b';
              const opacity = linkOpacity(link);

              const mx = (sp.x + tp.x) / 2;
              const my = (sp.y + tp.y) / 2;
              const dx = tp.x - sp.x;
              const dy = tp.y - sp.y;
              const len = Math.sqrt(dx * dx + dy * dy) || 1;
              const offset = link.crossLink ? 30 : 15;
              const cx = mx + (-dy / len) * offset;
              const cy = my + (dx / len) * offset;

              return (
                <path
                  key={`link-${i}`}
                  d={`M ${sp.x} ${sp.y} Q ${cx} ${cy} ${tp.x} ${tp.y}`}
                  fill="none"
                  stroke={color}
                  strokeWidth={link.crossLink ? 1 : 1.5}
                  strokeOpacity={opacity}
                  strokeDasharray={link.crossLink ? '4,4' : 'none'}
                />
              );
            })}

            {/* Nodes */}
            {graph.nodes.map((node) => {
              const pos = positions[node.id];
              if (!pos) return null;
              const color = node.id === 'root' ? '#f59e0b' : (CATEGORY_COLORS[node.category] || '#64748b');
              const opacity = nodeOpacity(node);
              const isHovered = hoveredNode === node.id;
              const r = node.radius;
              const lines = splitLabel(node.label);

              return (
                <g
                  key={node.id}
                  data-node={node.id}
                  transform={`translate(${pos.x},${pos.y})`}
                  style={{ opacity, cursor: 'pointer', transition: 'opacity 0.2s' }}
                  onMouseDown={(e) => handleNodeMouseDown(e, node.id)}
                  onMouseEnter={(e) => handleNodeHover(e, node)}
                  onMouseLeave={handleNodeLeave}
                >
                  {isHovered && (
                    <circle r={r + 6} fill="none" stroke={color} strokeWidth={2} strokeOpacity={0.4} />
                  )}
                  <circle
                    r={r}
                    fill={color + '22'}
                    stroke={color}
                    strokeWidth={node.id === 'root' ? 2.5 : isHovered ? 2 : 1.5}
                  />
                  {lines.map((line, li) => (
                    <text
                      key={li}
                      x={0}
                      y={li * 12 - (lines.length - 1) * 6}
                      textAnchor="middle"
                      dominantBaseline="central"
                      fill={node.id === 'root' ? '#f59e0b' : '#e2e8f0'}
                      fontSize={node.id === 'root' ? 12 : node.isCluster ? 10 : 9}
                      fontWeight={node.id === 'root' || node.isCluster ? 600 : 400}
                      fontFamily="IBM Plex Mono, monospace"
                      style={{ pointerEvents: 'none', userSelect: 'none' }}
                    >
                      {line.length > 14 ? line.slice(0, 13) + '\u2026' : line}
                    </text>
                  ))}
                </g>
              );
            })}
          </g>
        </svg>

        {/* Tooltip */}
        {tooltip && (
          <div style={{
            position: 'absolute',
            left: tooltip.x,
            top: tooltip.y,
            background: '#1e293b',
            border: '1px solid #334155',
            borderRadius: 6,
            padding: '8px 12px',
            maxWidth: 250,
            pointerEvents: 'none',
            zIndex: 10,
          }}>
            <div style={{ color: '#e2e8f0', fontSize: 12, fontWeight: 600, marginBottom: 4 }}>
              {tooltip.node.label}
            </div>
            {tooltip.node.category !== 'root' && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: tooltip.node.detail ? 4 : 0 }}>
                <span style={{
                  width: 8, height: 8, borderRadius: '50%',
                  background: CATEGORY_COLORS[tooltip.node.category] || '#64748b',
                  display: 'inline-block', flexShrink: 0,
                }} />
                <span style={{ color: '#94a3b8', fontSize: 10, textTransform: 'uppercase' }}>
                  {CATEGORY_LABELS[tooltip.node.category] || tooltip.node.category}
                  {tooltip.node.tag && ` \u00B7 ${tooltip.node.tag}`}
                </span>
              </div>
            )}
            {tooltip.node.detail && (
              <div style={{ color: '#94a3b8', fontSize: 11, lineHeight: 1.4 }}>
                {tooltip.node.detail}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Legend */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        gap: 16,
        flexWrap: 'wrap',
        padding: '12px 16px',
        borderTop: '1px solid #1a2030',
      }}>
        {activeCategories.map((cat) => (
          <div key={cat} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: '#94a3b8' }}>
            <span style={{
              width: 8, height: 8, borderRadius: '50%',
              background: CATEGORY_COLORS[cat], display: 'inline-block',
            }} />
            {CATEGORY_LABELS[cat] || cat}
          </div>
        ))}
      </div>
    </div>
  );
}
