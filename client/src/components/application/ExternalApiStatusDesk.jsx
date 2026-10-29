import React, { useState } from 'react';
import {
  Network,
  Activity,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  ShieldCheck,
  Eye,
  EyeOff,
  Edit2
} from 'lucide-react';
import { Card, Button, Badge, Modal, Input } from '../common/UIPrimitives';
import { GATEWAY_CATEGORIES, GATEWAY_STATUS_CONFIG } from './applicationConstants';
import { INITIAL_GATEWAY_INTEGRATIONS } from './applicationMockData';

export function ExternalApiStatusDesk({ onNotify }) {
  const [apiList, setApiList] = useState(INITIAL_GATEWAY_INTEGRATIONS);
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('All Gateways');
  const [testingServiceId, setTestingServiceId] = useState(null);
  const [testResultModal, setTestResultModal] = useState(null);
  const [editApiModal, setEditApiModal] = useState(null);
  const [revealedKeyIds, setRevealedKeyIds] = useState({});
  const [isRefreshingAll, setIsRefreshingAll] = useState(false);

  // Filtered APIs
  const filteredApis = apiList.filter(api => {
    if (selectedCategoryFilter === 'All Gateways') return true;
    return api.category === selectedCategoryFilter;
  });

  // Derived KPIs
  const totalGateways = apiList.length;
  const healthyCount = apiList.filter(a => a.status === 'healthy' || a.status === 'sandbox').length;
  const degradedCount = apiList.filter(a => a.status === 'degraded').length;
  const avgLatency = Math.round(
    apiList.reduce((acc, curr) => acc + (curr.latencyMs || 0), 0) / (totalGateways || 1)
  );

  // Toggle Masked Key View (safe partial reveal, keeps security intact)
  const handleToggleRevealKey = (id) => {
    setRevealedKeyIds(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  // Connection Probe
  const handleTestConnection = (api) => {
    setTestingServiceId(api.id);

    // Simulate genuine network latency probe
    const start = performance.now();
    setTimeout(() => {
      const elapsed = Math.round(performance.now() - start + (api.latencyMs > 500 ? 400 : 90));
      setTestingServiceId(null);

      const isSuccess = api.httpStatus === 200;
      const result = {
        name: api.name,
        category: api.category,
        endpoint: api.endpoint,
        status: isSuccess ? 'HEALTHY_200_OK' : 'WARNING_DEGRADED',
        httpStatus: api.httpStatus,
        measuredLatencyMs: elapsed,
        headers: {
          'server': 'nginx/1.24 (Cloud-Cluster-South-1)',
          'content-type': 'application/json; charset=utf-8',
          'x-request-id': `hms-req-${Date.now()}`,
          ...api.headers
        },
        responsePayload: api.mockResponse,
        timestamp: new Date().toISOString()
      };

      // Update last checked time in list
      setApiList(prev =>
        prev.map(item =>
          item.id === api.id
            ? { ...item, lastChecked: 'Just now', latencyMs: elapsed }
            : item
        )
      );

      setTestResultModal(result);
      if (onNotify) onNotify(`Ping probe to "${api.name}" completed in ${elapsed} ms.`);
    }, 850);
  };

  // Refresh All Telemetry
  const handleRefreshAll = () => {
    setIsRefreshingAll(true);
    setTimeout(() => {
      setApiList(prev =>
        prev.map(item => ({
          ...item,
          lastChecked: 'Just now',
          latencyMs: item.status === 'degraded'
            ? Math.floor(6500 + Math.random() * 2000)
            : Math.floor(80 + Math.random() * 150)
        }))
      );
      setIsRefreshingAll(false);
      if (onNotify) onNotify('Gateway telemetry refreshed across all 6 endpoints.');
    }, 600);
  };

  // Edit API Endpoint & Timeout
  const handleSaveApiConfig = (e) => {
    e.preventDefault();
    if (!editApiModal) return;

    setApiList(prev =>
      prev.map(a =>
        a.id === editApiModal.id
          ? {
              ...a,
              endpoint: editApiModal.endpoint,
              purpose: editApiModal.purpose
            }
          : a
      )
    );

    if (onNotify) onNotify(`Configuration for "${editApiModal.name}" updated successfully.`);
    setEditApiModal(null);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* 4 Top KPI Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
          gap: '16px'
        }}
      >
        <Card style={{ padding: '16px', display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div
            style={{
              width: '42px',
              height: '42px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'rgba(15, 118, 110, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--color-teal)'
            }}
          >
            <Network size={22} />
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Integrated Gateways
            </div>
            <div style={{ fontSize: '1.4rem', fontWeight: '700', color: 'var(--color-text-primary)' }}>
              {totalGateways} Endpoints
            </div>
          </div>
        </Card>

        <Card style={{ padding: '16px', display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div
            style={{
              width: '42px',
              height: '42px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'rgba(22, 163, 74, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#16A34A'
            }}
          >
            <CheckCircle2 size={22} />
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Healthy / Active
            </div>
            <div style={{ fontSize: '1.4rem', fontWeight: '700', color: '#16A34A' }}>
              {healthyCount} <span style={{ fontSize: '0.85rem', fontWeight: 'normal', color: 'var(--color-text-muted)' }}>/ {totalGateways}</span>
            </div>
          </div>
        </Card>

        <Card style={{ padding: '16px', display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div
            style={{
              width: '42px',
              height: '42px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'rgba(217, 119, 6, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#D97706'
            }}
          >
            <AlertTriangle size={22} />
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Degraded / Warning
            </div>
            <div style={{ fontSize: '1.4rem', fontWeight: '700', color: degradedCount > 0 ? '#D97706' : 'var(--color-text-primary)' }}>
              {degradedCount} Alert{degradedCount !== 1 ? 's' : ''}
            </div>
          </div>
        </Card>

        <Card style={{ padding: '16px', display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div
            style={{
              width: '42px',
              height: '42px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'rgba(37, 99, 235, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#2563EB'
            }}
          >
            <Activity size={22} />
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Average Latency
            </div>
            <div style={{ fontSize: '1.4rem', fontWeight: '700', color: 'var(--color-text-primary)' }}>
              {avgLatency} ms
            </div>
          </div>
        </Card>
      </div>

      {/* Security Credential Masking Notice */}
      <div
        style={{
          padding: '10px 14px',
          backgroundColor: '#F3F4F6',
          border: '1px solid #E5E7EB',
          borderRadius: 'var(--radius-md)',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          fontSize: '0.78rem',
          color: '#374151'
        }}
      >
        <ShieldCheck size={16} style={{ flexShrink: 0, color: '#0F766E' }} />
        <span>
          <strong>Credential Security Policy:</strong> All bearer keys, webhook secrets, and private RSA tokens are strictly masked in client memory. Sensitive credentials are never exposed in browser logs or network telemetry requests.
        </span>
      </div>

      {/* Toolbar & Filter */}
      <Card style={{ padding: '14px 18px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: '600', color: 'var(--color-text-secondary)' }}>
              Filter by Protocol:
            </span>
            <select
              value={selectedCategoryFilter}
              onChange={(e) => setSelectedCategoryFilter(e.target.value)}
              style={{
                padding: '6px 10px',
                fontSize: 'var(--font-size-xs)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-md)',
                backgroundColor: '#FFFFFF',
                outline: 'none'
              }}
            >
              {GATEWAY_CATEGORIES.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <Button
            variant="outline"
            size="sm"
            icon={RefreshCw}
            disabled={isRefreshingAll}
            onClick={handleRefreshAll}
          >
            {isRefreshingAll ? 'Refreshing Telemetry...' : 'Refresh Gateway Telemetry'}
          </Button>
        </div>
      </Card>

      {/* Main Integrations Table */}
      <Card style={{ padding: '0', overflow: 'hidden' }}>
        <div
          style={{
            padding: '14px 18px',
            borderBottom: '1px solid var(--color-border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: 'var(--color-bg-subtle)'
          }}
        >
          <div>
            <h3 style={{ margin: 0, fontSize: '0.92rem', fontWeight: '700', color: 'var(--color-text-primary)' }}>
              Hospital External APIs & Switch Connections ({filteredApis.length})
            </h3>
            <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>
              SMS, WhatsApp, Payment Gateways, HL7 Diagnostic Socket, ABDM, and Cashless Insurance switches.
            </p>
          </div>
          <Badge variant="teal" size="sm">SSL/TLS 1.3 Encrypted</Badge>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 'var(--font-size-xs)' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--color-border)', backgroundColor: '#FAFAFA' }}>
                <th style={{ padding: '10px 14px' }}>Gateway & Purpose</th>
                <th style={{ padding: '10px 14px' }}>Endpoint & Protocol</th>
                <th style={{ padding: '10px 14px' }}>Status & HTTP</th>
                <th style={{ padding: '10px 14px' }}>Latency & SLA</th>
                <th style={{ padding: '10px 14px' }}>Masked Credential</th>
                <th style={{ padding: '10px 14px', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredApis.map((api) => {
                const statusCfg = GATEWAY_STATUS_CONFIG[api.status] || GATEWAY_STATUS_CONFIG.not_tested;
                const StatusIcon = statusCfg.icon;
                const isTesting = testingServiceId === api.id;
                const isKeyRevealed = revealedKeyIds[api.id];

                return (
                  <tr
                    key={api.id}
                    style={{
                      borderBottom: '1px solid var(--color-border)',
                      backgroundColor: '#FFFFFF',
                      transition: 'background-color 0.15s ease'
                    }}
                  >
                    <td style={{ padding: '12px 14px', maxWidth: '280px' }}>
                      <div style={{ fontWeight: '600', color: 'var(--color-text-primary)' }}>
                        {api.name}
                      </div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--color-text-secondary)', marginTop: '2px', lineHeight: '1.3' }}>
                        {api.purpose}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '6px' }}>
                        <Badge variant="outline" size="sm" style={{ fontSize: '0.68rem', padding: '1px 6px' }}>
                          {api.category}
                        </Badge>
                        <span style={{ fontSize: '0.68rem', color: 'var(--color-text-muted)' }}>
                          Quota: {api.monthlyQuota}
                        </span>
                      </div>
                    </td>

                    <td style={{ padding: '12px 14px', maxWidth: '240px' }}>
                      <div
                        style={{
                          fontFamily: 'monospace',
                          fontSize: '0.72rem',
                          backgroundColor: '#F3F4F6',
                          padding: '4px 6px',
                          borderRadius: '4px',
                          wordBreak: 'break-all',
                          color: '#1F2937'
                        }}
                      >
                        {api.endpoint}
                      </div>
                      <div style={{ fontSize: '0.68rem', color: 'var(--color-text-muted)', marginTop: '4px' }}>
                        Checked: {api.lastChecked}
                      </div>
                    </td>

                    <td style={{ padding: '12px 14px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <StatusIcon size={14} style={{ color: statusCfg.color }} />
                        <span style={{ fontWeight: '600', color: statusCfg.color }}>
                          {statusCfg.label}
                        </span>
                      </div>
                      <div style={{ fontSize: '0.70rem', color: 'var(--color-text-muted)', marginTop: '2px' }}>
                        HTTP {api.httpStatus} | Err: {api.errorRate}
                      </div>
                    </td>

                    <td style={{ padding: '12px 14px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span
                          style={{
                            fontFamily: 'monospace',
                            fontWeight: '700',
                            fontSize: '0.82rem',
                            color: api.latencyMs > 3000 ? '#DC2626' : api.latencyMs > 500 ? '#D97706' : '#16A34A'
                          }}
                        >
                          {api.latencyMs} ms
                        </span>
                        {api.latencyMs > 3000 ? (
                          <Badge variant="red" size="sm">Degraded</Badge>
                        ) : (
                          <Badge variant="green" size="sm">Optimal</Badge>
                        )}
                      </div>
                      <div style={{ fontSize: '0.68rem', color: 'var(--color-text-muted)', marginTop: '2px' }}>
                        SLA Threshold: 3,000 ms
                      </div>
                    </td>

                    <td style={{ padding: '12px 14px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span
                          style={{
                            fontFamily: 'monospace',
                            fontSize: '0.70rem',
                            color: '#4B5563',
                            backgroundColor: '#F3F4F6',
                            padding: '3px 6px',
                            borderRadius: '4px'
                          }}
                        >
                          {isKeyRevealed ? api.authKeyMasked.replace(/•/g, 'x') : api.authKeyMasked}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleToggleRevealKey(api.id)}
                          title={isKeyRevealed ? 'Hide partial token' : 'View partial mask'}
                          style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--color-text-muted)', padding: '2px' }}
                        >
                          {isKeyRevealed ? <EyeOff size={13} /> : <Eye size={13} />}
                        </button>
                      </div>
                    </td>

                    <td style={{ padding: '12px 14px', textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '6px' }}>
                        <Button
                          variant="primary"
                          size="sm"
                          icon={Activity}
                          disabled={isTesting}
                          onClick={() => handleTestConnection(api)}
                        >
                          {isTesting ? 'Probing...' : 'Ping Probe'}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          icon={Edit2}
                          onClick={() => setEditApiModal({ ...api })}
                        />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Ping Result Diagnostic Modal */}
      {testResultModal && (
        <Modal
          isOpen={true}
          onClose={() => setTestResultModal(null)}
          title={`Diagnostic Probe: ${testResultModal.name}`}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div
              style={{
                padding: '12px 16px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: testResultModal.httpStatus === 200 ? '#F0FDF4' : '#FEF3C7',
                border: `1px solid ${testResultModal.httpStatus === 200 ? '#BBF7D0' : '#FDE68A'}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '8px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {testResultModal.httpStatus === 200 ? (
                  <CheckCircle2 size={18} style={{ color: '#16A34A' }} />
                ) : (
                  <AlertTriangle size={18} style={{ color: '#D97706' }} />
                )}
                <div>
                  <div style={{ fontWeight: '700', fontSize: '0.82rem', color: testResultModal.httpStatus === 200 ? '#166534' : '#92400E' }}>
                    {testResultModal.status}
                  </div>
                  <div style={{ fontSize: '0.70rem', color: '#6B7280' }}>
                    HTTP Status {testResultModal.httpStatus} • RTT {testResultModal.measuredLatencyMs} ms
                  </div>
                </div>
              </div>

              <Badge variant={testResultModal.httpStatus === 200 ? 'green' : 'amber'} size="sm">
                Latency: {testResultModal.measuredLatencyMs} ms
              </Badge>
            </div>

            <div>
              <div style={{ fontSize: '0.75rem', fontWeight: '600', marginBottom: '4px', color: 'var(--color-text-secondary)' }}>
                Target Endpoint:
              </div>
              <div style={{ fontFamily: 'monospace', fontSize: '0.75rem', backgroundColor: '#F8FAFC', padding: '6px 10px', borderRadius: '4px', border: '1px solid #E2E8F0' }}>
                {testResultModal.endpoint}
              </div>
            </div>

            <div>
              <div style={{ fontSize: '0.75rem', fontWeight: '600', marginBottom: '4px', color: 'var(--color-text-secondary)' }}>
                Response Headers:
              </div>
              <pre
                style={{
                  margin: 0,
                  padding: '10px',
                  backgroundColor: '#1E293B',
                  color: '#F8FAFC',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '0.70rem',
                  fontFamily: 'monospace',
                  maxHeight: '110px',
                  overflowY: 'auto'
                }}
              >
                {JSON.stringify(testResultModal.headers, null, 2)}
              </pre>
            </div>

            <div>
              <div style={{ fontSize: '0.75rem', fontWeight: '600', marginBottom: '4px', color: 'var(--color-text-secondary)' }}>
                Sanitized Payload Snippet:
              </div>
              <pre
                style={{
                  margin: 0,
                  padding: '10px',
                  backgroundColor: '#1E293B',
                  color: '#34D399',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '0.70rem',
                  fontFamily: 'monospace',
                  maxHeight: '140px',
                  overflowY: 'auto'
                }}
              >
                {JSON.stringify(testResultModal.responsePayload, null, 2)}
              </pre>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '6px' }}>
              <Button
                variant="outline"
                onClick={() => setTestResultModal(null)}
              >
                Close Diagnostic
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Edit API Modal */}
      {editApiModal && (
        <Modal
          isOpen={true}
          onClose={() => setEditApiModal(null)}
          title={`Configure Gateway: ${editApiModal.name}`}
        >
          <form onSubmit={handleSaveApiConfig} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '600', marginBottom: '4px' }}>
                Gateway Name
              </label>
              <Input
                type="text"
                value={editApiModal.name}
                disabled
                style={{ backgroundColor: '#F3F4F6', color: '#6B7280' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '600', marginBottom: '4px' }}>
                Target Endpoint URL *
              </label>
              <Input
                type="text"
                value={editApiModal.endpoint}
                onChange={(e) => setEditApiModal(prev => ({ ...prev, endpoint: e.target.value }))}
                required
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '600', marginBottom: '4px' }}>
                Purpose Description
              </label>
              <Input
                type="text"
                value={editApiModal.purpose}
                onChange={(e) => setEditApiModal(prev => ({ ...prev, purpose: e.target.value }))}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '600', marginBottom: '4px' }}>
                Masked Authentication Credential
              </label>
              <Input
                type="text"
                value={editApiModal.authKeyMasked}
                disabled
                style={{ backgroundColor: '#F3F4F6', fontFamily: 'monospace', color: '#6B7280' }}
              />
              <span style={{ fontSize: '0.68rem', color: 'var(--color-text-muted)', marginTop: '4px', display: 'block' }}>
                To rotate credentials, update production environment secrets in hospital server vault.
              </span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '10px' }}>
              <Button
                type="button"
                variant="outline"
                onClick={() => setEditApiModal(null)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
              >
                Save Endpoint Config
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
