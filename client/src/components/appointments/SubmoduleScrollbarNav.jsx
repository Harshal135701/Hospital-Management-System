import React, { useRef, useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Search,
  Filter,
  Check,
  Calendar,
  Layers
} from 'lucide-react';
import { MODULE_GROUPS, SUBMODULES } from './submoduleRegistry';

export function SubmoduleScrollbarNav({
  activeSubmoduleId,
  onSelectSubmodule,
}) {
  const scrollContainerRef = useRef(null);
  const [selectedGroup, setSelectedGroup] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -320, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 320, behavior: 'smooth' });
    }
  };

  // Filter submodules by group and search query
  const filteredSubmodules = SUBMODULES.filter((sub) => {
    const matchesGroup = selectedGroup === 'all' || sub.groupId === selectedGroup;
    const matchesSearch =
      !searchQuery.trim() ||
      sub.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sub.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sub.groupName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sub.subtitle.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesGroup && matchesSearch;
  });

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        padding: '16px 20px',
        backgroundColor: 'var(--color-surface, #ffffff)',
        borderRadius: 'var(--radius-lg, 12px)',
        border: '1px solid var(--color-border, #E5E7EB)',
        boxShadow: 'var(--shadow-sm, 0 1px 3px rgba(0,0,0,0.04))',
      }}
    >
      {/* Top Filter Bar: Group Pills and Search */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
          <span
            style={{
              fontSize: '0.75rem',
              fontWeight: '700',
              textTransform: 'uppercase',
              color: 'var(--color-text-secondary, #6B7280)',
              letterSpacing: '0.5px',
              marginRight: '4px',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            <Layers size={14} /> Modules:
          </span>

          {MODULE_GROUPS.map((grp) => {
            const isActive = selectedGroup === grp.id;
            return (
              <button
                key={grp.id}
                onClick={() => setSelectedGroup(grp.id)}
                style={{
                  padding: '5px 12px',
                  borderRadius: '16px',
                  border: isActive ? '1px solid var(--color-primary-teal, #0D9488)' : '1px solid #E5E7EB',
                  backgroundColor: isActive ? 'var(--color-primary-teal, #0D9488)' : '#F9FAFB',
                  color: isActive ? '#ffffff' : '#4B5563',
                  fontSize: '0.75rem',
                  fontWeight: isActive ? '600' : '500',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.15s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                }}
              >
                <span>{grp.label}</span>
                <span
                  style={{
                    fontSize: '10px',
                    padding: '1px 5px',
                    borderRadius: '8px',
                    backgroundColor: isActive ? 'rgba(255,255,255,0.25)' : '#E5E7EB',
                    color: isActive ? '#ffffff' : '#374151',
                  }}
                >
                  {grp.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search input & scroll arrows */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ position: 'relative', width: '220px' }}>
            <Search
              size={14}
              style={{
                position: 'absolute',
                left: '10px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#9CA3AF',
              }}
            />
            <input
              type="text"
              placeholder="Search 52 submodules..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '6px 10px 6px 30px',
                borderRadius: '8px',
                border: '1px solid #D1D5DB',
                fontSize: '0.78rem',
                backgroundColor: '#F9FAFB',
              }}
            />
          </div>

          <button
            onClick={scrollLeft}
            title="Scroll left"
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              border: '1px solid #E5E7EB',
              background: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: '#4B5563',
            }}
          >
            <ChevronLeft size={16} />
          </button>
          <button
            onClick={scrollRight}
            title="Scroll right"
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              border: '1px solid #E5E7EB',
              background: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: '#4B5563',
            }}
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* Horizontal Scrollable Submodule Cards Ribbon */}
      <div
        ref={scrollContainerRef}
        style={{
          display: 'flex',
          gap: '12px',
          overflowX: 'auto',
          paddingBottom: '8px',
          scrollBehavior: 'smooth',
          scrollbarWidth: 'thin',
          scrollbarColor: 'var(--color-primary-teal, #0D9488) #F3F4F6',
        }}
      >
        {filteredSubmodules.map((sub) => {
          const isSelected = activeSubmoduleId === sub.id;
          const SubIcon = sub.icon || Calendar;

          return (
            <div
              key={sub.id}
              onClick={() => onSelectSubmodule(sub.id)}
              style={{
                minWidth: '240px',
                maxWidth: '260px',
                flexShrink: 0,
                padding: '12px 14px',
                borderRadius: '10px',
                border: isSelected
                  ? '2px solid var(--color-primary-teal, #0D9488)'
                  : '1px solid var(--color-border, #E5E7EB)',
                backgroundColor: isSelected
                  ? 'var(--color-primary-teal-light, #F0FDF4)'
                  : '#ffffff',
                boxShadow: isSelected
                  ? '0 4px 12px rgba(13, 148, 136, 0.12)'
                  : '0 1px 2px rgba(0,0,0,0.03)',
                cursor: 'pointer',
                transition: 'all 0.18s ease',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
              onMouseEnter={(e) => {
                if (!isSelected) {
                  e.currentTarget.style.borderColor = '#0D9488';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isSelected) {
                  e.currentTarget.style.borderColor = '#E5E7EB';
                  e.currentTarget.style.transform = 'translateY(0)';
                }
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <div
                    style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '8px',
                      backgroundColor: isSelected ? 'var(--color-primary-teal, #0D9488)' : '#F3F4F6',
                      color: isSelected ? '#ffffff' : '#0D9488',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <SubIcon size={15} />
                  </div>

                  <span
                    style={{
                      fontSize: '11px',
                      fontWeight: '700',
                      padding: '2px 8px',
                      borderRadius: '10px',
                      backgroundColor: isSelected ? 'rgba(13, 148, 136, 0.15)' : '#F3F4F6',
                      color: isSelected ? 'var(--color-primary-teal, #0D9488)' : '#6B7280',
                    }}
                  >
                    {sub.id}
                  </span>
                </div>

                <div
                  style={{
                    fontSize: '0.875rem',
                    fontWeight: isSelected ? '700' : '600',
                    color: isSelected ? 'var(--color-primary-teal, #0D9488)' : '#111827',
                    lineHeight: '1.25',
                    marginBottom: '4px',
                  }}
                >
                  {sub.title}
                </div>

                <div
                  style={{
                    fontSize: '0.72rem',
                    color: '#6B7280',
                    lineHeight: '1.3',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                  }}
                >
                  {sub.subtitle}
                </div>
              </div>

              <div
                style={{
                  marginTop: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  borderTop: '1px solid rgba(0,0,0,0.05)',
                  paddingTop: '6px',
                }}
              >
                <span style={{ fontSize: '0.68rem', color: '#9CA3AF', textTransform: 'uppercase', fontWeight: '600' }}>
                  {sub.badge}
                </span>

                {isSelected ? (
                  <span
                    style={{
                      fontSize: '0.72rem',
                      fontWeight: '700',
                      color: 'var(--color-primary-teal, #0D9488)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '2px',
                    }}
                  >
                    <Check size={12} /> Active
                  </span>
                ) : (
                  <span style={{ fontSize: '0.72rem', color: '#9CA3AF' }}>Open →</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
