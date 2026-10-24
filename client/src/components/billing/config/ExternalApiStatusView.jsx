import React, { useState } from 'react';
import {
  Network,
  Activity,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Globe,
  Radio,
  Lock,
  ShieldCheck,
  Server,
  Zap,
  Info
} from 'lucide-react';
import { Card, Button, Badge, Modal } from '../../common/UIPrimitives';
import { INITIAL_EXTERNAL_APIS } from '../common/billingMockData';

export function ExternalApiStatusView() {
  const [apiList, setApiList] = useState(INITIAL_EXTERNAL_APIS);
  const [testingServiceId, setTestingServiceId] = useState(null);
  const [testResultModal, setTestResultModal] = useState(null);

  const handleTestConnection = (api) => {
    setTestingServiceId(api.id);

    // Simulate genuine network latency probe
    setTimeout(() => {
      setTestingServiceId(null);
      const latencyMs = Math.floor(120 + Math.random() * 260);
      setTestResultModal({
        name: api.name,
        endpoint: api.endpoint,
        status: api.httpStatus === 200 ? 'SUCCESS' : 'WARNING',
        statusCode: api.httpStatus,
        latencyMs,
        responseSnippet: api.httpStatus === 200
          ? `{"status":"ok","server_time":"${new Date().toISOString()}","gateway":"active","cluster":"prod-in-south"}`
          : `{"error":"upstream_timeout","gateway":"tpa_switch","latency_exceeded":true}`,
        note: 'Probed via HMS backend gateway health monitor.'
      });
    }, 900);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Module Overview Banner */}
      <div
        style={{
          padding: '16px 20px',
          backgroundColor: '#FFFFFF',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--color-border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
          boxShadow: 'var(--shadow-sm)'
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <Badge variant="teal" size="sm">Submodule 2.4</Badge>
            <h2 style={{ margin: 0, fontSize: '1.2rem', fontWeight: '700', color: 'var(--color-text-primary)' }}>
              External API & Gateway Integration Monitor
            </h2>
          </div>
          <p style={{ margin: 0, fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)' }}>
            Real-time telemetry, webhook health, latency checks, and secure masked credential oversight for third-party gateways.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          icon={RefreshCw}
          onClick={() => {
            // trigger refresh simulation
            setApiList([...INITIAL_EXTERNAL_APIS]);
          }}
        >
          Refresh Gateway Telemetry
        </Button>
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
        <Lock size={16} style={{ flexShrink: 0, color: 'var(--color-primary-teal)' }} />
        <span>
          <strong>Zero-Trust Credential Masking:</strong> Sensitive production API secrets, webhook signing keys, and private OAuth tokens are strictly obfuscated. Test connection calls originate from backend proxy probes.
        </span>
      </div>

      {/* Summary Gauges */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' }}>
        <div style={{ padding: '16px', backgroundColor: '#FFFFFF', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>
          <div style={{ fontSize: '0.72rem', fontWeight: '700', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>
            Active Gateways
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--color-success)', marginTop: '4px' }}>
            5 / 6 Operational
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--color-text-secondary)', marginTop: '2px' }}>
            Average P99 latency: 185 ms
          </div>
        </div>

        <div style={{ padding: '16px', backgroundColor: '#FFFFFF', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>
          <div style={{ fontSize: '0.72rem', fontWeight: '700', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>
            Payment Webhook Health
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--color-primary-teal)', marginTop: '4px' }}>
            99.98% Verification
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--color-text-secondary)', marginTop: '2px' }}>
            Razorpay Instant UPI QR: In Sync
          </div>
        </div>

        <div style={{ padding: '16px', backgroundColor: '#FFFFFF', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>
          <div style={{ fontSize: '0.72rem', fontWeight: '700', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>
            TPA Insurance Switch
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--color-warning)', marginTop: '4px' }}>
            Degraded (3.4% Timeout)
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--color-text-secondary)', marginTop: '2px' }}>
            MediAssist Gateway Latency Warning
          </div>
        </div>
      </div>

      {/* Gateway Telemetry Cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {apiList.map((api) => {
          const isHealthy = api.httpStatus === 200;
          return (
            <Card key={api.id}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
                <div style={{ flex: 1, minWidth: '280px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontWeight: '700', fontSize: '0.95rem', color: 'var(--color-text-primary)' }}>
                      {api.name}
                    </span>
                    <Badge variant={isHealthy ? 'success' : 'warning'} size="sm">
                      {api.status}
                    </Badge>
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--color-text-secondary)', marginTop: '4px' }}>
                    {api.purpose}
                  </div>
                  <div style={{ fontSize: '0.72rem', fontFamily: 'monospace', color: '#4B5563', marginTop: '6px' }}>
                    Endpoint: {api.endpoint}
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px' }}>
                  <Button
                    variant="outline"
                    size="sm"
                    loading={testingServiceId === api.id}
                    onClick={() => handleTestConnection(api)}
                  >
                    Ping Service Probe
                  </Button>
                  <span style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>
                    Last Check: {api.lastChecked}
                  </span>
                </div>
              </div>

              {/* Status Details Bar */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                  gap: '10px',
                  backgroundColor: '#F9FAFB',
                  padding: '10px 14px',
                  borderRadius: 'var(--radius-md)',
                  marginTop: '14px',
                  fontSize: '0.75rem'
                }}
              >
                <div>
                  <span style={{ color: 'var(--color-text-secondary)' }}>Masked Credential:</span>
                  <div style={{ fontFamily: 'monospace', fontWeight: '600' }}>{api.authKeyMasked}</div>
                </div>
                <div>
                  <span style={{ color: 'var(--color-text-secondary)' }}>Monthly Quota / Volume:</span>
                  <div style={{ fontWeight: '600' }}>{api.monthlyQuota}</div>
                </div>
                <div>
                  <span style={{ color: 'var(--color-text-secondary)' }}>Recent Telemetry Event:</span>
                  <div style={{ fontWeight: '500', color: isHealthy ? '#059669' : '#D97706' }}>
                    {api.lastEvent}
                  </div>
                </div>
                <div>
                  <span style={{ color: 'var(--color-text-secondary)' }}>Reported Error Rate:</span>
                  <div style={{ fontWeight: '700', color: isHealthy ? 'var(--color-success)' : 'var(--color-error)' }}>
                    {api.errorRate}
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Ping Result Modal */}
      <Modal
        isOpen={Boolean(testResultModal)}
        onClose={() => setTestResultModal(null)}
        title="Gateway Connection Diagnostic Report"
        size="md"
      >
        {testResultModal && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '0.82rem' }}>
            <div style={{ padding: '12px', backgroundColor: testResultModal.status === 'SUCCESS' ? '#F0FDF4' : '#FFFBEB', borderRadius: '4px', border: `1px solid ${testResultModal.status === 'SUCCESS' ? '#BBF7D0' : '#FDE68A'}` }}>
              <div style={{ fontWeight: '700', fontSize: '1rem', color: testResultModal.status === 'SUCCESS' ? '#15803D' : '#B45309' }}>
                {testResultModal.name}: HTTP {testResultModal.statusCode} {testResultModal.status}
              </div>
              <div style={{ color: '#4B5563', fontSize: '0.75rem', marginTop: '2px' }}>
                Round-Trip Latency: {testResultModal.latencyMs} ms
              </div>
            </div>

            <div>
              <div style={{ fontWeight: '600', marginBottom: '4px' }}>Target Probe URL:</div>
              <div style={{ fontFamily: 'monospace', fontSize: '0.75rem', backgroundColor: '#F3F4F6', padding: '6px 10px', borderRadius: '4px', wordBreak: 'break-all' }}>
                {testResultModal.endpoint}
              </div>
            </div>

            <div>
              <div style={{ fontWeight: '600', marginBottom: '4px' }}>Upstream Response Body:</div>
              <pre style={{ margin: 0, fontFamily: 'monospace', fontSize: '0.72rem', backgroundColor: '#1E293B', color: '#38BDF8', padding: '10px', borderRadius: '4px', overflowX: 'auto' }}>
                {testResultModal.responseSnippet}
              </pre>
            </div>

            <div style={{ fontSize: '0.72rem', color: '#6B7280' }}>
              {testResultModal.note}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '10px' }}>
              <Button variant="primary" size="sm" onClick={() => setTestResultModal(null)}>
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
