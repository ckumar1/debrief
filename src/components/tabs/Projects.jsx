import React, { useState } from 'react';

const STATUS_COLORS = {
  'IN PROGRESS': '#f59e0b',
  PENDING: '#8b5cf6',
  FUTURE: '#6b7280',
  BLOCKED: '#ef4444',
  DONE: '#22c55e',
};

export default function Projects({ projects = [] }) {
  const [expandedProject, setExpandedProject] = useState(null);
  const [expandedPhases, setExpandedPhases] = useState({});

  const toggleProject = (id) => {
    setExpandedProject(expandedProject === id ? null : id);
  };

  const togglePhase = (projectId, phaseIdx) => {
    const key = `${projectId}-${phaseIdx}`;
    setExpandedPhases((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  if (!projects.length) {
    return (
      <div style={{ color: '#334155', fontFamily: 'IBM Plex Mono', padding: 32, textAlign: 'center' }}>
        No projects found
      </div>
    );
  }

  return (
    <div style={{ fontFamily: 'IBM Plex Mono', display: 'flex', flexDirection: 'column', gap: 8 }}>
      {projects.map((project, idx) => {
        const id = project.id || idx;
        const isExpanded = expandedProject === id;
        const statusColor = STATUS_COLORS[project.status] || '#6b7280';

        return (
          <div
            key={id}
            style={{
              background: '#0d1117',
              border: '1px solid #1a2030',
              borderRadius: 8,
              overflow: 'hidden',
            }}
          >
            {/* Header */}
            <div
              onClick={() => toggleProject(id)}
              style={{
                padding: '12px 16px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 10,
              }}
            >
              <span style={{ fontSize: 13, color: '#94a3b8' }}>
                {isExpanded ? '\u25BC' : '\u25B6'}
              </span>

              {project.emoji && (
                <span style={{ fontSize: 18 }}>{project.emoji}</span>
              )}

              <span style={{ color: '#e2e8f0', fontSize: 14, fontWeight: 600, flex: 1 }}>
                {project.name}
              </span>

              <span
                style={{
                  background: statusColor + '22',
                  color: statusColor,
                  border: '1px solid ' + statusColor + '44',
                  borderRadius: 9999,
                  padding: '2px 10px',
                  fontSize: 10,
                  fontWeight: 600,
                  whiteSpace: 'nowrap',
                }}
              >
                {project.status}
              </span>

              {project.deadline && (
                <span style={{ color: '#334155', fontSize: 11, whiteSpace: 'nowrap' }}>
                  {project.deadline}
                </span>
              )}
            </div>

            {/* Expanded content */}
            {isExpanded && (
              <div style={{ padding: '0 16px 16px', borderTop: '1px solid #1a2030' }}>
                {project.summary && (
                  <p style={{ color: '#e2e8f0', fontSize: 13, margin: '12px 0 4px', lineHeight: 1.5 }}>
                    {project.summary}
                  </p>
                )}

                {project.context && (
                  <p style={{ color: '#94a3b8', fontSize: 12, margin: '4px 0 12px', lineHeight: 1.5 }}>
                    {project.context}
                  </p>
                )}

                {/* Phases */}
                {project.phases && project.phases.length > 0 && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginTop: 8 }}>
                    {project.phases.map((phase, phaseIdx) => {
                      const phaseKey = `${id}-${phaseIdx}`;
                      const phaseExpanded = expandedPhases[phaseKey];

                      return (
                        <div
                          key={phaseIdx}
                          style={{
                            background: '#07090f',
                            border: '1px solid #1a2030',
                            borderRadius: 6,
                          }}
                        >
                          <div
                            onClick={(e) => {
                              e.stopPropagation();
                              togglePhase(id, phaseIdx);
                            }}
                            style={{
                              padding: '8px 12px',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: 8,
                            }}
                          >
                            <span style={{ fontSize: 11, color: '#94a3b8' }}>
                              {phaseExpanded ? '\u25BC' : '\u25B6'}
                            </span>
                            <span
                              style={{
                                color: '#f59e0b',
                                fontSize: 11,
                                fontWeight: 700,
                                minWidth: 20,
                              }}
                            >
                              {phaseIdx + 1}.
                            </span>
                            <span style={{ color: '#e2e8f0', fontSize: 12 }}>
                              {phase.label || phase.name}
                            </span>
                          </div>

                          {phaseExpanded && phase.steps && phase.steps.length > 0 && (
                            <div style={{ padding: '0 12px 10px 40px' }}>
                              {phase.steps.map((step, stepIdx) => (
                                <div
                                  key={stepIdx}
                                  style={{
                                    color: '#94a3b8',
                                    fontSize: 11,
                                    padding: '3px 0',
                                    lineHeight: 1.4,
                                  }}
                                >
                                  <span style={{ color: '#334155', marginRight: 6 }}>{'\u2022'}</span>
                                  {step}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
