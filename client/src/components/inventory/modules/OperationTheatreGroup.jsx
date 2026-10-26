import React from 'react';
import { OperationTheatreView } from '../../ot/OperationTheatreView';

/**
 * Re-exports OperationTheatreView for the Inventory module's submodule routing,
 * ensuring complete consistency and removing any outdated dummy screens.
 */
export function OperationTheatreGroup({ activeSubtab = '23.1', onNavigateSubmodule }) {
  return (
    <OperationTheatreView
      initialSubtab={activeSubtab}
      onNavigate={(sub) => {
        if (onNavigateSubmodule) {
          const clean = String(sub).replace('ot:', '').replace('submodule:', '');
          onNavigateSubmodule(clean);
        }
      }}
    />
  );
}
