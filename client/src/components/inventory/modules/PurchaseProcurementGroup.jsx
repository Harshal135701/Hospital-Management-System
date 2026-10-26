import React from 'react';
import { PurchaseView } from '../../purchase/PurchaseView';

/**
 * Re-exports PurchaseView for the Inventory module's submodule routing,
 * ensuring complete consistency and removing outdated duplicate screens.
 */
export function PurchaseProcurementGroup({ activeSubtab = '26.1', onNavigateSubmodule }) {
  return (
    <PurchaseView
      initialSubtab={activeSubtab}
      onNavigate={(sub) => {
        if (onNavigateSubmodule) {
          const clean = String(sub).replace('purchase:', '').replace('submodule:', '');
          onNavigateSubmodule(clean);
        }
      }}
    />
  );
}
