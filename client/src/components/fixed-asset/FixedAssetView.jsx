
import React, { useEffect, useState } from 'react';
import {
    Package, ClipboardList, Wrench, AlertTriangle, TrendingDown,
    Landmark, RotateCcw, CheckCircle2,
} from 'lucide-react';
import { FIXED_ASSET_SUBMODULES, ASSET_STORAGE_KEY } from './fixedAssetConstants';
import { FIXED_ASSET_SEED } from './fixedAssetMockData';
import { AssetMasterDesk } from './AssetMasterDesk';
import { ServiceContractsDesk } from './ServiceContractsDesk';
import { PreventiveMaintenanceDesk } from './PreventiveMaintenanceDesk';
import { BreakdownWorkTicketDesk } from './BreakdownWorkTicketDesk';
import { AssetDepreciationDesk } from './AssetDepreciationDesk';

const icons = {
    '14.1': Package,
    '14.2': ClipboardList,
    '14.3': Wrench,
    '14.4': AlertTriangle,
    '14.5': TrendingDown,
};

function loadAssets() {
    try {
        const saved = window.localStorage.getItem(ASSET_STORAGE_KEY);
        if (saved) {
            const parsed = JSON.parse(saved);
            if (Array.isArray(parsed)) return parsed;
        }
    } catch (error) {
        console.warn('Could not load fixed asset demo data:', error);
    }
    return FIXED_ASSET_SEED;
}

export function FixedAssetView({ initialSubtab = '14.1', onNavigate }) {
    const [activeTab, setActiveTab] = useState(initialSubtab);
    const [assets, setAssets] = useState(loadAssets);
    const [toast, setToast] = useState('');

    useEffect(() => {
        setActiveTab(initialSubtab || '14.1');
    }, [initialSubtab]);

    useEffect(() => {
        try {
            window.localStorage.setItem(ASSET_STORAGE_KEY, JSON.stringify(assets));
        } catch (error) {
            console.warn('Could not save fixed asset demo data:', error);
            setToast('Unable to save changes to browser storage.');
        }
    }, [assets]);

    const notify = (message) => {
        setToast(message);
        window.setTimeout(() => setToast(''), 2800);
    };

    const changeTab = (id) => {
        setActiveTab(id);
        onNavigate?.(`fixed-asset:${id}`);
    };

    const resetDemo = () => {
        if (!window.confirm('Restore the original Fixed Asset demo records? Your Fixed Asset changes will be lost.')) return;
        setAssets(FIXED_ASSET_SEED);
        notify('Fixed Asset demo records restored.');
    };

    const current = FIXED_ASSET_SUBMODULES.find((item) => item.id === activeTab) || FIXED_ASSET_SUBMODULES[0];

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18, minWidth: 0 }}>
            <div style={{
                background: 'linear-gradient(110deg, #E9F7F7, #F8FCFC)',
                border: '1px solid #D4EAEA', borderRadius: 12, padding: '17px 20px',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                gap: 14, flexWrap: 'wrap',
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ width: 42, height: 42, borderRadius: 11, background: '#087F8C', color: '#FFFFFF', display: 'grid', placeItems: 'center' }}>
                        <Landmark size={21} />
                    </div>
                    <div>
                        <div style={{ fontSize: 10, color: '#587780', fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase' }}>Hospital Operations / Module 14</div>
                        <h1 style={{ fontSize: 19, margin: '4px 0 0', color: '#173B49' }}>Fixed Asset Management</h1>
                    </div>
                </div>
                <button onClick={resetDemo} style={{ border: '1px solid #C9DFE1', background: '#FFFFFF', color: '#49616D', padding: '9px 12px', borderRadius: 8, display: 'inline-flex', alignItems: 'center', gap: 7, fontSize: 11, fontWeight: 700, cursor: 'pointer' }}>
                    <RotateCcw size={14} /> Reset Demo Data
                </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                <h2 style={{ margin: 0, fontSize: 21, color: '#172B3A' }}>{current.label}</h2>
                <p style={{ margin: 0, fontSize: 12, color: '#758494' }}>Manage hospital assets, service lifecycle, maintenance and financial tracking.</p>
            </div>

            <div style={{ display: 'flex', gap: 7, overflowX: 'auto', paddingBottom: 4 }}>
                {FIXED_ASSET_SUBMODULES.map((item) => {
                    const Icon = icons[item.id];
                    const active = item.id === activeTab;
                    return (
                        <button key={item.id} onClick={() => changeTab(item.id)} style={{
                            flex: '0 0 auto', display: 'inline-flex', alignItems: 'center', gap: 7,
                            padding: '10px 12px', borderRadius: 8, cursor: 'pointer',
                            border: `1px solid ${active ? '#087F8C' : '#E0E8EB'}`,
                            background: active ? '#E8F6F6' : '#FFFFFF',
                            color: active ? '#087F8C' : '#627385',
                            fontWeight: active ? 750 : 600, fontSize: 11,
                        }}>
                           <Icon size={15} /> {item.label}
                        </button>
                    );
                })}
            </div>

            {toast && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 13px', borderRadius: 8, background: '#E8F7EF', color: '#16794B', fontSize: 12 }}>
                    <CheckCircle2 size={15} /> {toast}
                </div>
            )}

            {activeTab === '14.1' ? (
                <AssetMasterDesk
                    assets={assets}
                    setAssets={setAssets}
                    onToast={notify}
                />
            ) : activeTab === '14.2' ? (
                <ServiceContractsDesk
                    assets={assets}
                    onToast={notify}
                />
            ) : activeTab === '14.3' ? (
                <PreventiveMaintenanceDesk
                    assets={assets}
                    onToast={notify}
                />
            ) : activeTab === '14.4' ? (
                <BreakdownWorkTicketDesk
                    assets={assets}
                    onToast={notify}
                />
            ) : activeTab === '14.5' ? (
                <AssetDepreciationDesk
                    assets={assets}
                    onToast={notify}
                />
            ) : (
                <div
                    style={{
                        background: '#FFFFFF',
                        border: '1px solid #E0E8EB',
                        borderRadius: 12,
                        padding: '42px 24px',
                        textAlign: 'center',
                    }}
                >
                    <Package size={30} color="#087F8C" />
                    <h3 style={{ fontSize: 16, margin: '12px 0 6px' }}>
                        {current.label}
                    </h3>
                    <p
                        style={{
                            color: '#758494',
                            fontSize: 12,
                            maxWidth: 460,
                            margin: '0 auto',
                        }}
                    >
                        This submodule is queued for implementation. We’ll build it next.
                    </p>
                </div>
            )}
        </div>
    );
}

export default FixedAssetView;
