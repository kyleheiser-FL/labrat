import React from 'react';
import { Users, Loader2, Mail, MapPin, Phone, UserCheck, XCircle, Trash2 } from 'lucide-react';
import { MemberProfile } from '../../lib/shopTypes';

interface AdminMembersPanelProps {
  adminMembersList: MemberProfile[];
  membersLoading: boolean;
  actionLoading: string | null;
  pendingApprovalCount: number;
  confirmDeleteMemberId: string | null;
  onSetMemberStatus: (memberId: string, status: 'approved' | 'blocked' | 'pending' | 'kit' | 'chinakit' | 'chinavial') => void;
  onDeleteMemberProfile: (memberId: string) => void;
  onSetConfirmDeleteMemberId: (id: string | null) => void;
}

export default function AdminMembersPanel({
  adminMembersList,
  membersLoading,
  actionLoading,
  pendingApprovalCount,
  confirmDeleteMemberId,
  onSetMemberStatus,
  onDeleteMemberProfile,
  onSetConfirmDeleteMemberId,
}: AdminMembersPanelProps) {
  const kitUpgradeCount = adminMembersList.filter(m => m.kitUpgradeRequested && m.status === 'approved').length;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-red-300 flex flex-wrap items-center gap-1.5">
          <Users className="w-5 h-5" /> Vetting &amp; Members Approval Portal
          {pendingApprovalCount > 0 && (
            <span className="ml-1 rounded-full bg-red-500/15 border border-red-500/30 px-2 py-0.5 text-[10px] font-black uppercase tracking-wide text-red-200">
              {pendingApprovalCount} pending
            </span>
          )}
          {kitUpgradeCount > 0 && (
            <span className="ml-1 rounded-full bg-amber-500/15 border border-amber-500/30 px-2 py-0.5 text-[10px] font-black uppercase tracking-wide text-amber-200">
              {kitUpgradeCount} kit request{kitUpgradeCount > 1 ? 's' : ''}
            </span>
          )}
        </h2>
        <div className="text-xs text-slate-400">
          Logged in as Administrator
        </div>
      </div>

      {membersLoading ? (
        <div className="flex flex-col items-center justify-center py-16 bg-[#0b1329] border border-[#1e293b]/70 rounded-2xl min-h-[32vh]">
          <Loader2 className="w-8 h-8 text-cyan-400 animate-spin mb-2" />
          <p className="text-slate-400 text-xs">Fetching registered accounts...</p>
        </div>
      ) : adminMembersList.length === 0 ? (
        <div className="bg-[#0b1329] border border-slate-800 rounded-2xl py-12 p-6 text-center">
          <Users className="w-12 h-12 text-slate-700 mx-auto mb-3" />
          <h3 className="text-base font-bold text-white">No pending requests</h3>
          <p className="text-slate-400 text-xs mt-1 max-w-sm mx-auto">
            There are currently no users registered in the members table.
          </p>
        </div>
      ) : (
        <div className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden divide-y divide-slate-800">
          {adminMembersList.map(member => (
            <div key={member.id} className={`p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 transition-all hover:bg-slate-900/40 ${member.kitUpgradeRequested && member.status === 'approved' ? 'border-l-2 border-amber-400/50' : ''}`}>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h4 className="text-sm font-bold text-white">{member.displayName}</h4>
                  <span className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded tracking-wide ${
                    member.status === 'approved'   ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20' :
                    member.status === 'kit'        ? 'bg-cyan-500/10 text-cyan-300 border border-cyan-500/20' :
                    member.status === 'chinakit'   ? 'bg-orange-500/10 text-orange-300 border border-orange-500/20' :
                    member.status === 'chinavial'  ? 'bg-amber-500/10 text-amber-300 border border-amber-500/20' :
                    member.status === 'blocked'    ? 'bg-red-500/10 text-red-300 border border-red-500/20' :
                                                     'bg-amber-500/10 text-amber-300 border border-amber-500/20'
                  }`}>
                    {member.status === 'kit'       ? '🇳🇴 Norway Kit' :
                     member.status === 'chinakit'  ? '🇨🇳 China Kit' :
                     member.status === 'chinavial' ? '🇨🇳 China Vial' :
                     member.status}
                  </span>
                  {member.kitUpgradeRequested && member.status === 'approved' && (
                    <span className="text-[9px] font-extrabold uppercase px-2 py-0.5 rounded tracking-wide bg-amber-400/15 text-amber-300 border border-amber-400/30 animate-pulse">
                      🔔 Wants Kit Pricing
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-400 mt-1 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-slate-500" /> {member.email}
                </p>
                <p className="text-xs text-slate-400 mt-1 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-slate-500" /> {member.shippingAddress}
                </p>
                <p className="text-xs text-slate-400 mt-1 flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-slate-500" /> {member.phone}
                </p>
                {member.pricingPreference && (
                  <p className="text-[10px] text-slate-500 mt-1.5">
                    Requested: <span className={`font-semibold ${member.pricingPreference === 'kit' ? 'text-cyan-400' : 'text-amber-400'}`}>
                      {member.pricingPreference === 'kit' ? 'Kit Pricing (10 vials)' : 'Per Vial'}
                    </span>
                  </p>
                )}
              </div>

              <div className="flex flex-col items-end gap-2 self-end md:self-center shrink-0">
                {/* Tier selector — active tier is highlighted; clicking any tier assigns it */}
                <div className="flex flex-wrap justify-end gap-1.5">
                  {([
                    { value: 'approved',  label: '🇳🇴 Norway Vial', activeClass: 'bg-emerald-500 text-slate-950 shadow shadow-emerald-500/30', inactiveClass: 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/25' },
                    { value: 'kit',       label: '🇳🇴 Norway Kit',  activeClass: 'bg-cyan-400 text-slate-950 shadow shadow-cyan-400/30',    inactiveClass: 'bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/25' },
                    { value: 'chinavial', label: '🇨🇳 China Vial',  activeClass: 'bg-orange-400 text-slate-950 shadow shadow-orange-400/30', inactiveClass: 'bg-orange-500/10 hover:bg-orange-500/20 text-orange-300 border border-orange-500/25' },
                    { value: 'chinakit',  label: '🇨🇳 China Kit',   activeClass: 'bg-amber-400 text-slate-950 shadow shadow-amber-400/30',  inactiveClass: 'bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/25' },
                  ] as const).map(tier => {
                    const isActive = member.status === tier.value;
                    const isPending = member.status === 'pending' || member.status === 'blocked';
                    return (
                      <button
                        key={tier.value}
                        onClick={() => !isActive && onSetMemberStatus(member.id, tier.value)}
                        disabled={actionLoading !== null || isActive}
                        className={`px-3 py-1.5 text-xs font-bold rounded-lg flex items-center gap-1 transition-all disabled:cursor-default ${
                          isActive
                            ? tier.activeClass + (isPending ? '' : ' ring-2 ring-offset-1 ring-offset-slate-950 ring-current/40')
                            : tier.inactiveClass + ' cursor-pointer disabled:opacity-50'
                        }`}
                      >
                        {isActive && <UserCheck className="w-3 h-3" />}
                        {tier.label}
                        {isActive && <span className="text-[9px] font-black uppercase tracking-wide opacity-75 ml-0.5">current</span>}
                        {!isActive && member.kitUpgradeRequested && tier.value === 'kit' && (
                          <span className="text-[8px] font-black uppercase tracking-wide opacity-90">requested</span>
                        )}
                      </button>
                    );
                  })}
                </div>

                <div className="flex items-center gap-1.5">
                  {member.status !== 'blocked' && (
                    <button
                      onClick={() => onSetMemberStatus(member.id, 'blocked')}
                      disabled={actionLoading !== null}
                      className="px-3 py-1.5 bg-[#10172a] hover:bg-red-500/10 hover:text-red-300 text-slate-400 text-xs font-bold rounded-lg cursor-pointer border border-slate-800 flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <XCircle className="w-3.5 h-3.5" /> Restrict
                    </button>
                  )}

                  {confirmDeleteMemberId === member.id ? (
                    <div className="flex items-center gap-1 rounded-lg border border-red-500/30 bg-red-500/10 p-1">
                      <button
                        onClick={() => onDeleteMemberProfile(member.id)}
                        disabled={actionLoading !== null}
                        className="px-2 py-1 bg-red-500 text-white text-[10px] font-black uppercase tracking-wide rounded-md cursor-pointer flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {actionLoading === `member_${member.id}_delete` ? <Loader2 className="w-3 h-3 animate-spin" /> : <Trash2 className="w-3 h-3" />}
                        Confirm
                      </button>
                      <button
                        onClick={() => onSetConfirmDeleteMemberId(null)}
                        disabled={actionLoading !== null}
                        className="px-2 py-1 text-[10px] font-bold text-slate-300 hover:text-white rounded-md cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => onSetConfirmDeleteMemberId(member.id)}
                      disabled={actionLoading !== null}
                      className="px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-300 text-xs font-bold rounded-lg cursor-pointer border border-red-500/25 flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Delete
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
