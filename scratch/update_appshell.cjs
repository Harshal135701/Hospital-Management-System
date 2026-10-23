const fs = require('fs');

let content = fs.readFileSync('client/src/components/layout/AppShell.jsx', 'utf8');

// 1. In click handler for isAppointmentHierarchy:
const oldClickHandler = `                    if (item.isAppointmentHierarchy) {
                      if (effectiveCollapsed) {
                        handleSelectNav('appointments');
                      } else {
                        if (currentRoute !== 'appointments' && !currentRoute.startsWith('appointments:')) {
                          handleSelectNav('appointments');
                          setExpandedSectionsManual(prev => ({ ...prev, appointments: true }));
                        } else {
                          setExpandedSectionsManual(prev => ({ ...prev, appointments: !isExpanded }));
                        }
                      }
                      return;
                    }`;

const newClickHandler = `                    if (item.isAppointmentHierarchy) {
                      if (effectiveCollapsed) {
                        handleSelectNav('appointments:3.1');
                      } else {
                        if (currentRoute !== 'appointments' && !currentRoute.startsWith('appointments:')) {
                          handleSelectNav('appointments:3.1');
                          setExpandedSectionsManual(prev => ({ ...prev, appointments: true }));
                          setExpandedAppointmentGroups(prev => ({ ...prev, '3': true }));
                        } else {
                          setExpandedSectionsManual(prev => ({ ...prev, appointments: !isExpanded }));
                        }
                      }
                      return;
                    }`;

if (content.includes(oldClickHandler)) {
  content = content.replace(oldClickHandler, newClickHandler);
  console.log('Updated click handler in AppShell.jsx');
} else if (content.includes(oldClickHandler.replace(/\n/g, '\r\n'))) {
  content = content.replace(oldClickHandler.replace(/\n/g, '\r\n'), newClickHandler.replace(/\n/g, '\r\n'));
  console.log('Updated click handler (CRLF) in AppShell.jsx');
} else {
  console.log('Old click handler pattern not found in AppShell.jsx');
}

// 2. In auto-expand effect:
const oldEffect = `        }
      }
      setExpandedSectionsManual(prev => ({ ...prev, appointments: true }));`;

const newEffect = `        }
      } else {
        setExpandedAppointmentGroups(prev => ({ ...prev, '3': true }));
      }
      setExpandedSectionsManual(prev => ({ ...prev, appointments: true }));`;

if (content.includes(oldEffect)) {
  content = content.replace(oldEffect, newEffect);
  console.log('Updated auto-expand effect in AppShell.jsx');
} else if (content.includes(oldEffect.replace(/\n/g, '\r\n'))) {
  content = content.replace(oldEffect.replace(/\n/g, '\r\n'), newEffect.replace(/\n/g, '\r\n'));
  console.log('Updated auto-expand effect (CRLF) in AppShell.jsx');
} else {
  console.log('Old auto-expand effect pattern not found in AppShell.jsx');
}

fs.writeFileSync('client/src/components/layout/AppShell.jsx', content, 'utf8');
console.log('Saved AppShell.jsx');
