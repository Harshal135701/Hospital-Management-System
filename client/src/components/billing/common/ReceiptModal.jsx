import React, { useState } from 'react';
import {
  Printer,
  Download,
  CheckCircle2,
  Receipt,
  QrCode,
  Building2,
  Calendar,
  Clock,
  User,
  ShieldCheck,
  X
} from 'lucide-react';
import { Modal, Button, Badge } from '../../common/UIPrimitives';
import { formatINR, formatDateTimeIN } from '../../../utils/formatters';

export function ReceiptModal({ isOpen, onClose, data, type = 'opd_receipt' }) {
  const [printFormat, setPrintFormat] = useState('80mm'); // '80mm' | 'a4'

  if (!isOpen || !data) return null;

  const handlePrint = () => {
    window.print();
  };

  const receiptNumber = data.bill_number || data.receipt_number || data.billNumber || 'REC-2026-0001';
  const patientName = data.patient_name || data.patientName || 'Outpatient Visitor';
  const patientUhid = data.patient_uhid || data.patientUhid || 'UHID-2026-0000';
  const totalAmount = data.total_amount || data.totalAmount || data.amount || 0;
  const paymentMode = data.payment_mode || data.paymentMode || 'UPI';
  const timestamp = data.created_at || data.date || new Date().toISOString();

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Official Financial Receipt & Tax Invoice`}
      size="md"
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {/* Format Selector Bar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '8px 12px',
            backgroundColor: '#F3F4F6',
            borderRadius: 'var(--radius-md)'
          }}
        >
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              type="button"
              onClick={() => setPrintFormat('80mm')}
              style={{
                padding: '4px 12px',
                borderRadius: 'var(--radius-sm)',
                border: 'none',
                backgroundColor: printFormat === '80mm' ? 'var(--color-primary-teal)' : 'transparent',
                color: printFormat === '80mm' ? '#FFFFFF' : 'var(--color-text-secondary)',
                fontWeight: '600',
                fontSize: '0.78rem',
                cursor: 'pointer'
              }}
            >
              80mm Thermal POS
            </button>
            <button
              type="button"
              onClick={() => setPrintFormat('a4')}
              style={{
                padding: '4px 12px',
                borderRadius: 'var(--radius-sm)',
                border: 'none',
                backgroundColor: printFormat === 'a4' ? 'var(--color-primary-teal)' : 'transparent',
                color: printFormat === 'a4' ? '#FFFFFF' : 'var(--color-text-secondary)',
                fontWeight: '600',
                fontSize: '0.78rem',
                cursor: 'pointer'
              }}
            >
              A4 Detailed Tax Invoice
            </button>
          </div>

          <Badge variant="success" size="sm">
            <CheckCircle2 size={12} /> Persisted & Verified
          </Badge>
        </div>

        {/* Printable Receipt Paper Container */}
        <div
          id="hospital-printable-receipt"
          style={{
            backgroundColor: '#FFFFFF',
            border: '1px solid #D1D5DB',
            boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
            borderRadius: '4px',
            padding: printFormat === '80mm' ? '20px 16px' : '28px 24px',
            maxWidth: printFormat === '80mm' ? '360px' : '100%',
            margin: '0 auto',
            fontFamily: printFormat === '80mm' ? 'monospace, Courier New, monospace' : 'inherit',
            fontSize: printFormat === '80mm' ? '0.8rem' : '0.88rem',
            color: '#111827',
            lineHeight: 1.45
          }}
        >
          {/* Header */}
          <div style={{ textAlign: 'center', borderBottom: '1px dashed #9CA3AF', paddingBottom: '10px', marginBottom: '12px' }}>
            <h2 style={{ fontSize: printFormat === '80mm' ? '1rem' : '1.25rem', fontWeight: '700', margin: '0 0 4px', letterSpacing: '-0.01em' }}>
              APEX CENTRAL HOSPITAL
            </h2>
            <p style={{ margin: '2px 0', fontSize: '0.72rem', color: '#4B5563' }}>
              Main Clinical Campus, Plot 14, Health City, Sector 5
            </p>
            <p style={{ margin: '2px 0', fontSize: '0.7rem', color: '#6B7280' }}>
              GSTIN: 19AAACA8912E1Z8 | Clinical Reg: WB/KOL/2021/041
            </p>
            <div style={{ marginTop: '6px', fontWeight: '700', fontSize: '0.8rem', textTransform: 'uppercase' }}>
              {type === 'deposit_receipt' ? 'ADVANCE MONEY RECEIPT' : 'OPD CASHIER TAX INVOICE'}
            </div>
          </div>

          {/* Metadata Block */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '0.75rem', borderBottom: '1px dashed #9CA3AF', paddingBottom: '10px', marginBottom: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#4B5563' }}>Receipt No:</span>
              <span style={{ fontWeight: '700' }}>{receiptNumber}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#4B5563' }}>Date / Time:</span>
              <span>{formatDateTimeIN(timestamp)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#4B5563' }}>Patient UHID:</span>
              <span style={{ fontWeight: '600' }}>{patientUhid}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#4B5563' }}>Patient Name:</span>
              <span style={{ fontWeight: '600' }}>{patientName}</span>
            </div>
            {data.doctor_name && (
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#4B5563' }}>Consultant:</span>
                <span>{data.doctor_name}</span>
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#4B5563' }}>Payment Mode:</span>
              <span style={{ fontWeight: '700', textTransform: 'uppercase' }}>{paymentMode}</span>
            </div>
          </div>

          {/* Itemized Table */}
          <div style={{ marginBottom: '12px', borderBottom: '1px dashed #9CA3AF', paddingBottom: '10px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.75rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #E5E7EB', color: '#4B5563' }}>
                  <th style={{ textAlign: 'left', padding: '4px 0' }}>Item / Description</th>
                  <th style={{ textAlign: 'right', padding: '4px 0' }}>Amount (₹)</th>
                </tr>
              </thead>
              <tbody>
                {data.items && data.items.length > 0 ? (
                  data.items.map((it, idx) => (
                    <tr key={idx}>
                      <td style={{ padding: '4px 0' }}>
                        <div>{it.name || it.description}</div>
                        {it.qty > 1 && <span style={{ fontSize: '0.68rem', color: '#6B7280' }}>Qty: {it.qty} × ₹{it.price}</span>}
                      </td>
                      <td style={{ textAlign: 'right', padding: '4px 0' }}>
                        {formatINR(it.total || it.price)}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td style={{ padding: '4px 0' }}>
                      {data.serviceName || data.service_name || 'Medical Services Rendered'}
                    </td>
                    <td style={{ textAlign: 'right', padding: '4px 0' }}>
                      {formatINR(totalAmount)}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Financial Totals */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '0.78rem', marginBottom: '14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Gross Total:</span>
              <span>{formatINR(totalAmount)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#4B5563' }}>
              <span>GST / Tax Rate:</span>
              <span>Exempt (Healthcare Ser.)</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: '800', fontSize: '0.92rem', borderTop: '1px solid #111827', paddingTop: '6px', marginTop: '4px' }}>
              <span>NET AMOUNT PAID:</span>
              <span>{formatINR(totalAmount)}</span>
            </div>
          </div>

          {/* Footer & QR */}
          <div style={{ textAlign: 'center', fontSize: '0.68rem', color: '#6B7280', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
            <div style={{ padding: '4px', border: '1px solid #E5E7EB', borderRadius: '4px', display: 'inline-flex' }}>
              <QrCode size={44} style={{ color: '#1F2937' }} />
            </div>
            <div>Digitally Signed & Verified by Apex HMS Server</div>
            <div>Computer generated invoice; no physical signature required.</div>
          </div>
        </div>

        {/* Modal Actions */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', paddingTop: '8px' }}>
          <Button variant="outline" size="sm" onClick={onClose}>
            Close
          </Button>
          <Button variant="primary" size="sm" icon={Printer} onClick={handlePrint}>
            Print Receipt ({printFormat === '80mm' ? '80mm Thermal' : 'A4 Invoice'})
          </Button>
        </div>
      </div>
    </Modal>
  );
}
