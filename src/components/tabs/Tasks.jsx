import React, { useState } from 'react';

const PRIORITY_COLORS = {
  TODAY: '#ef4444',
  TOMORROW: '#f97316',
  'THIS WEEK': '#eab308',
  UPCOMING: '#8b5cf6',
  FUTURE: '#6b7280',
};

const FILTERS = ['ALL', 'TODAY', 'TOMORROW', 'THIS WEEK', 'UPCOMING', 'FUTURE'];

export default function Tasks({ tasks = [], onToggle }) {
  const [activeFilter, setActiveFilter] = useState('ALL');
  const [expandedId, setExpandedId] = useState(null);

  const filtered = activeFilter === 'ALL'
    ? tasks
    : tasks.filter((t) => t.priority === activeFilter);

  if (!tasks.length) {
    return (
      <div style={{ color: '#334155', fontFamily: 'IBM Plex Mono', padding: 32, textAlign: 'center' }}>
        No tasks found
      </div>
    );
  }

  return (
    <div style={{ fontFamily: 'IBM Plex Mono' }}>
      {/* Filter bar */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 16 }}>
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setActiveFilter(f)}
            style={{
              background: activeFilter === f ? '#f59e0b' : '#0d1117',
              color: activeFilter === f ? '#07090f' : '#94a3b8',
              border: '1px solid ' + (activeFilter === f ? '#f59e0b' : '#1a2030'),
              borderRadius: 6,
              padding: '4px 10px',
              fontSize: 11,
              fontFamily: 'IBM Plex Mono',
              cursor: 'pointer',
              fontWeight: activeFilter === f ? 700 : 400,
            }}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Task list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        {filtered.map((task) => {
          const done = task.done || task.completed;
          const expanded = expandedId === task.id;
          return (
            <div
              key={task.id}
              style={{
                background: '#0d1117',
                border: '1px solid #1a2030',
                borderRadius: 8,
                padding: '10px 14px',
                opacity: done ? 0.5 : 1,
                cursor: 'pointer',
              }}
              onClick={() => setExpandedId(expanded ? null : task.id)}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                {/* Checkbox */}
                <input
                  type="checkbox"
                  checked={!!done}
                  onChange={(e) => {
                    e.stopPropagation();
                    onToggle && onToggle(task.id);
                  }}
                  onClick={(e) => e.stopPropagation()}
                  style={{ accentColor: '#f59e0b', cursor: 'pointer', width: 16, height: 16, flexShrink: 0 }}
                />

                {/* Priority badge */}
                {task.priority && (
                  <span
                    style={{
                      background: (PRIORITY_COLORS[task.priority] || '#6b7280') + '22',
                      color: PRIORITY_COLORS[task.priority] || '#6b7280',
                      border: '1px solid ' + (PRIORITY_COLORS[task.priority] || '#6b7280') + '44',
                      borderRadius: 9999,
                      padding: '2px 8px',
                      fontSize: 10,
                      fontWeight: 600,
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {task.priority}
                  </span>
                )}

                {/* Owner */}
                {task.owner && (
                  <span style={{ color: '#94a3b8', fontSize: 11, whiteSpace: 'nowrap' }}>
                    {task.owner}
                  </span>
                )}

                {/* Title */}
                <span
                  style={{
                    color: '#e2e8f0',
                    fontSize: 13,
                    textDecoration: done ? 'line-through' : 'none',
                    flex: 1,
                  }}
                >
                  {task.title}
                </span>

                {/* Tags */}
                {task.tags && task.tags.length > 0 && (
                  <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
                    {task.tags.map((tag, i) => (
                      <span
                        key={i}
                        style={{
                          background: '#1a2030',
                          color: '#94a3b8',
                          borderRadius: 9999,
                          padding: '1px 7px',
                          fontSize: 10,
                        }}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Expanded detail */}
              {expanded && task.detail && (
                <div style={{ color: '#94a3b8', fontSize: 12, marginTop: 8, marginLeft: 26, lineHeight: 1.5 }}>
                  {task.detail}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
