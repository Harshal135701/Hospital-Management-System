import React from 'react';
import { PharmacyView } from '../../pharmacy/PharmacyView';

/**
 * Re-exports PharmacyView for the Inventory module's submodule routing,
 * ensuring complete consistency and removing outdated duplicate screens.
 */
export function PharmacyManagementGroup({ activeSubtab = '25.1', onNavigateSubmodule }) {
  return (
    <PharmacyView
      initialSubtab={activeSubtab}
      onNavigate={(sub) => {
        if (onNavigateSubmodule) {
          const clean = String(sub).replace('pharmacy:', '').replace('submodule:', '');
          onNavigateSubmodule(clean);
        }
      }}
    />
  );
}
