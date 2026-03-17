import React, { useMemo } from 'react';

const CATEGORY_COLORS = {
  tasks: '#ef4444',
  projects: '#f59e0b',
  decisions: '#22c55e',
  references: '#8b5cf6',
  architecture: '#06b6d4',
};

const CATEGORY_LABELS = {
  tasks: 'Tasks',
  projects: 'Projects',
  decisions: 'Decisions',
  references: 'References',
  architecture: 'Architecture',
};

const MAX_PER_CATEGORY = 5;

function extractNodes(extracted) {
  const nodes = [];

  if (extracted.tasks && Array.isArray(extracted.tasks)) {
    extracted.tasks.slice(0, MAX_PER_CATEGORY).forEach((t) => {
      nodes.push({ label: t.title || t.name || 'Task', category: 'tasks' });
    });
  }

  if (extracted.projects && Array.isArray(extracted.projects)) {
    extracted.projects.slice(0, MAX_PER_CATEGORY).forEach((p) => {
      nodes.push({ label: p.name || p.title || 'Project', category: 'projects' });
    });
  }

  if (extracted.decisions && Array.isArray(extracted.decisions)) {
    extracted.decisions.slice(0, MAX_PER_CATEGORY).forEach((d) => {
      nodes.push({ label: d.title || d.name || 'Decision', category: 'decisions' });
    });
  }

  if (extracted.references && Array.isArray(extracted.references)) {
    extracted.references.slice(0, MAX_PER_CATEGORY).forEach((r) => {
      nodes.push({ label: r.label || r.name || r.title || 'Reference', category: 'references' });
    });
  }

  if (extracted.architecture) {
    const arch = extracted.architecture;
    const archNodes = [];
    if (arch.pattern) {
      archNodes.push({ label: arch.pattern, category: 'architecture' });
    }
    if (arch.layers && Array.isArray(arch.layers)) {
      arch.layers.forEach((l) => {
        archNodes.push({ label: l.name || l.label || 'Layer', category: 'architecture' });
      });
    }
    archNodes.slice(0, MAX_PER_CATEGORY).forEach((n) => nodes.push(n));
  }

  return nodes;
}

function computePositions(nodeCount, containerWidth, containerHeight) {
  const cx = containerWidth / 2;
  const cy = containerHeight / 2;
  const positions = [];

  if (nodeCount === 0) return positions;

  // Distribute nodes across rings
  const ringCapacity = 8;
  let placed = 0;
  let ring = 1;

  while (placed < nodeCount) {
    const nodesInRing = Math.min(ringCapacity * ring, nodeCount - placed);
    const radius = 100 + ring * 90;

    for (let i = 0; i < nodesInRing; i++) {
      const angle = (2 * Math.PI * i) / nodesInRing - Math.PI / 2;
      positions.push({
        x: cx + radius * Math.cos(angle),
        y: cy + radius * Math.sin(angle),
      });
      placed++;
    }
    ring++;
  }

  return positions;
}

export default function MindMap({ extracted }) {
  const nodes = useMemo(() => (extracted ? extractNodes(extracted) : []), [extracted]);

  const title = extracted?.meta?.title || 'Meeting';
  const containerWidth = 700;
  const containerHeight = Math.max(500, 300 + nodes.length * 12);
  const cx = containerWidth / 2;
  const cy = containerHeight / 2;

  const positions = useMemo(
    () => computePositions(nodes.length, containerWidth, containerHeight),
    [nodes.length, containerWidth, containerHeight]
  );

  if (!extracted || nodes.length === 0) {
    return (
      <div style={{ color: '#334155', fontFamily: 'IBM Plex Mono', padding: 32, textAlign: 'center' }}>
        No ideas to map
      </div>
    );
  }

  // Collect active categories for legend
  const activeCategories = [...new Set(nodes.map((n) => n.category))];

  return (
    <div
      style={{
        fontFamily: 'IBM Plex Mono',
        background: '#07090f',
        minHeight: 500,
        position: 'relative',
        width: '100%',
        overflow: 'hidden',
      }}
    >
      {/* SVG lines layer */}
      <svg
        width={containerWidth}
        height={containerHeight}
        style={{
          position: 'absolute',
          top: 0,
          left: '50%',
          transform: 'translateX(-50%)',
          pointerEvents: 'none',
        }}
      >
        {nodes.map((node, idx) => {
          const pos = positions[idx];
          if (!pos) return null;
          return (
            <line
              key={idx}
              x1={cx}
              y1={cy}
              x2={pos.x}
              y2={pos.y}
              stroke={CATEGORY_COLORS[node.category]}
              strokeWidth={1.5}
              strokeOpacity={0.3}
            />
          );
        })}
      </svg>

      {/* Nodes container */}
      <div
        style={{
          position: 'relative',
          width: containerWidth,
          height: containerHeight,
          margin: '0 auto',
        }}
      >
        {/* Center node */}
        <div
          style={{
            position: 'absolute',
            left: cx,
            top: cy,
            transform: 'translate(-50%, -50%)',
            background: '#0d1117',
            border: '2px solid #f59e0b',
            borderRadius: 10,
            padding: '12px 20px',
            fontSize: 14,
            fontWeight: 700,
            color: '#f59e0b',
            maxWidth: 180,
            textAlign: 'center',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            zIndex: 2,
          }}
        >
          {title}
        </div>

        {/* Surrounding nodes */}
        {nodes.map((node, idx) => {
          const pos = positions[idx];
          if (!pos) return null;
          const color = CATEGORY_COLORS[node.category];
          return (
            <div
              key={idx}
              title={node.label}
              style={{
                position: 'absolute',
                left: pos.x,
                top: pos.y,
                transform: 'translate(-50%, -50%)',
                background: '#0d1117',
                border: '1px solid ' + color,
                borderRadius: 6,
                padding: '8px 12px',
                fontSize: 11,
                color: '#e2e8f0',
                maxWidth: 140,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                zIndex: 2,
              }}
            >
              {node.label}
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          gap: 16,
          flexWrap: 'wrap',
          padding: '16px 0',
        }}
      >
        {activeCategories.map((cat) => (
          <div
            key={cat}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              fontSize: 11,
              color: '#94a3b8',
            }}
          >
            <span
              style={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                background: CATEGORY_COLORS[cat],
                display: 'inline-block',
              }}
            />
            {CATEGORY_LABELS[cat]}
          </div>
        ))}
      </div>
    </div>
  );
}
