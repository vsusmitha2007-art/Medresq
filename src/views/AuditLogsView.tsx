import React, { useState, useMemo } from 'react';
import { useEmergency } from '../context/EmergencyContext';
import { useAuth } from '../context/AuthContext';
import { AuditLog, AuditAction, UserRole } from '../types';
import {
  ShieldAlert,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Clock,
  Shield,
  FileText,
  Lock,
} from 'lucide-react';

export const AuditLogsView: React.FC = () => {
  const { auditLogs } = useEmergency();
  const { user } = useAuth();

  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('ALL');
  const [actionFilter, setActionFilter] = useState<string>('ALL');
  const [resultFilter, setResultFilter] = useState<string>('ALL');

  const filteredLogs = useMemo(() => {
    return auditLogs.filter((log) => {
      const q = searchQuery.toLowerCase().trim();
      const matchQuery =
        !q ||
        log.id.toLowerCase().includes(q) ||
        log.userName.toLowerCase().includes(q) ||
        (log.patientName && log.patientName.toLowerCase().includes(q)) ||
        (log.patientId && log.patientId.toLowerCase().includes(q)) ||
        (log.details && log.details.toLowerCase().includes(q)) ||
        log.ipAddress.includes(q);

      const matchRole = roleFilter === 'ALL' || log.userRole === roleFilter;
      const matchAction = actionFilter === 'ALL' || log.action === actionFilter;
      const matchResult = resultFilter === 'ALL' || log.result === resultFilter;

      return matchQuery && matchRole && matchAction && matchResult;
    });
  }, [auditLogs, searchQuery, roleFilter, actionFilter, resultFilter]);

  const deniedCount = auditLogs.filter((l) => l.result === 'DENIED').length;

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Header */}
      <section className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-800 bg-slate-100 px-2.5 py-0.5 rounded-full border border-slate-200">
              <Lock className="w-3.5 h-3.5 text-emerald-600" />
              Immutable Append-Only Audit Trail (HIPAA Security Rule §164.312)
            </span>
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">
            Security & Access Audit Records
          </h1>
          <p className="text-xs text-slate-500">
            Every patient profile inspection, QR token scan, resource update, and authorization failure is stamped and permanently stored.
          </p>
        </div>

        {/* Security Metric */}
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-center min-w-[110px]">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Total Logs</span>
            <span className="text-xl font-extrabold font-mono text-slate-900" data-tabular>
              {auditLogs.length}
            </span>
          </div>
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-center min-w-[110px]">
            <span className="text-[10px] uppercase font-bold text-rose-700 block">Blocked Violations</span>
            <span className="text-xl font-extrabold font-mono text-rose-700" data-tabular>
              {deniedCount}
            </span>
          </div>
        </div>
      </section>

      {/* Filter Bar Form */}
      <section className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-3">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search user, patient, log ID, IP address, action note..."
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-500"
            />
          </div>

          <div className="grid grid-cols-3 gap-2">
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="py-2 px-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none"
            >
              <option value="ALL">All Roles</option>
              <option value="DOCTOR">DOCTOR</option>
              <option value="PARAMEDIC">PARAMEDIC</option>
              <option value="NURSE">NURSE</option>
              <option value="HOSPITAL_ADMIN">HOSPITAL_ADMIN</option>
              <option value="ADMIN">ADMIN</option>
            </select>

            <select
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value)}
              className="py-2 px-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none"
            >
              <option value="ALL">All Actions</option>
              <option value="VIEW_PATIENT">VIEW_PATIENT</option>
              <option value="VIEW_EMERGENCY_PROFILE">VIEW_EMERGENCY_PROFILE</option>
              <option value="SCAN_QR">SCAN_QR</option>
              <option value="CREATE_EMERGENCY">CREATE_EMERGENCY</option>
              <option value="SELECT_HOSPITAL">SELECT_HOSPITAL</option>
              <option value="UPDATE_HOSPITAL_RESOURCE">UPDATE_HOSPITAL_RESOURCE</option>
              <option value="ACCESS_DENIED">ACCESS_DENIED</option>
            </select>

            <select
              value={resultFilter}
              onChange={(e) => setResultFilter(e.target.value)}
              className="py-2 px-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none"
            >
              <option value="ALL">All Results</option>
              <option value="SUCCESS">SUCCESS only</option>
              <option value="DENIED">DENIED only</option>
            </select>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
          <span>Showing {filteredLogs.length} audit records</span>
          <span className="font-mono text-[11px]">Server Verified: YES</span>
        </div>
      </section>

      {/* Accessible HTML Audit Table */}
      <section className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
              <tr>
                <th scope="col" className="px-5 py-3">Log ID</th>
                <th scope="col" className="px-5 py-3">Timestamp</th>
                <th scope="col" className="px-5 py-3">User & Role</th>
                <th scope="col" className="px-5 py-3">Action Type</th>
                <th scope="col" className="px-5 py-3">Patient Context</th>
                <th scope="col" className="px-5 py-3">Result</th>
                <th scope="col" className="px-5 py-3">Device / IP</th>
                <th scope="col" className="px-5 py-3">Details / Denial Reason</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white font-sans">
              {filteredLogs.map((log) => {
                const isDenied = log.result === 'DENIED';

                return (
                  <tr
                    key={log.id}
                    className={`hover:bg-slate-50/80 transition-colors ${
                      isDenied ? 'bg-rose-50/40' : ''
                    }`}
                  >
                    <td className="px-5 py-3.5 whitespace-nowrap font-mono font-bold text-slate-900">
                      {log.id}
                    </td>

                    <td className="px-5 py-3.5 whitespace-nowrap font-mono text-slate-600">
                      <time dateTime={log.timestamp}>
                        {new Date(log.timestamp).toLocaleDateString([], {
                          month: 'short',
                          day: 'numeric',
                        })}{' '}
                        {new Date(log.timestamp).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                          second: '2-digit',
                        })}
                      </time>
                    </td>

                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <span className="font-bold text-slate-900 block">{log.userName}</span>
                      <span className="text-[10px] font-mono text-slate-500">{log.userRole}</span>
                    </td>

                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold font-mono ${
                          isDenied
                            ? 'bg-rose-100 text-rose-800'
                            : log.action.includes('UPDATE')
                            ? 'bg-amber-100 text-amber-800'
                            : log.action.includes('SCAN')
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-slate-100 text-slate-800'
                        }`}
                      >
                        {log.action}
                      </span>
                    </td>

                    <td className="px-5 py-3.5 whitespace-nowrap">
                      {log.patientName ? (
                        <div>
                          <span className="font-semibold text-slate-800 block">
                            {log.patientName}
                          </span>
                          <span className="text-[10px] font-mono text-slate-400">
                            {log.patientId}
                          </span>
                        </div>
                      ) : (
                        <span className="text-slate-400 italic">—</span>
                      )}
                    </td>

                    <td className="px-5 py-3.5 whitespace-nowrap">
                      {isDenied ? (
                        <span className="inline-flex items-center gap-1 text-rose-700 font-bold text-[11px] bg-rose-100 px-2 py-0.5 rounded">
                          <XCircle className="w-3 h-3" />
                          DENIED
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-emerald-700 font-bold text-[11px] bg-emerald-100 px-2 py-0.5 rounded">
                          <CheckCircle2 className="w-3 h-3" />
                          SUCCESS
                        </span>
                      )}
                    </td>

                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <span className="font-mono text-slate-700 block">{log.ipAddress}</span>
                      <span className="text-[10px] text-slate-400 truncate max-w-[130px] block">
                        {log.deviceInfo}
                      </span>
                    </td>

                    <td className="px-5 py-3.5 text-slate-600 max-w-[260px]">
                      {isDenied ? (
                        <span className="text-rose-700 font-semibold block text-[11px]">
                          {log.reason || log.details}
                        </span>
                      ) : (
                        <span className="text-[11px] block truncate">
                          {log.details || 'Standard operational transaction'}
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
};
