import { useEffect, useState } from 'react';
import { signOut } from 'firebase/auth';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, db } from '../firebase';
import {
  getFamily, getFamilyMembers, getUser, regenerateInviteCode,
  subscribeFamilyAnnouncements,
  type Family, type FamilyMember, type FamilyAnnouncement,
} from '@cozy-lantern/shared';

export default function FamilyPage() {
  const [family, setFamily] = useState<Family | null>(null);
  const [members, setMembers] = useState<FamilyMember[]>([]);
  const [announcements, setAnnouncements] = useState<FamilyAnnouncement[]>([]);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async user => {
      if (!user) return;
      const profile = await getUser(db, user.uid);
      if (!profile?.familyId) return;

      const [fam, mems] = await Promise.all([
        getFamily(db, profile.familyId),
        getFamilyMembers(db, profile.familyId),
      ]);
      setFamily(fam);
      setMembers(mems);
      return subscribeFamilyAnnouncements(db, profile.familyId, setAnnouncements);
    });
    return unsub;
  }, []);

  async function copyCode() {
    if (!family) return;
    await navigator.clipboard.writeText(family.inviteCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="h-full overflow-y-auto bg-[#0f0f1a] p-6">
      {family && (
        <div className="mb-8">
          <h2 className="text-white text-xl font-bold mb-1">{family.name}</h2>
          <div className="flex items-center gap-3 mt-3">
            <div className="bg-[#1e1e2e] rounded-xl px-6 py-3">
              <p className="text-gray-500 text-xs mb-1">Invite Code</p>
              <p className="text-white text-2xl font-bold tracking-widest">{family.inviteCode}</p>
            </div>
            <button onClick={copyCode} className="text-indigo-400 hover:text-indigo-300 text-sm">
              {copied ? '✓ Copied' : 'Copy'}
            </button>
          </div>
        </div>
      )}

      <div className="mb-8">
        <h3 className="text-gray-400 text-sm font-semibold uppercase tracking-wider mb-3">Members ({members.length})</h3>
        {members.map(m => (
          <div key={m.userId} className="flex items-center gap-3 py-3 border-b border-[#1e1e2e]">
            <div className="w-9 h-9 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold">
              {m.displayName[0].toUpperCase()}
            </div>
            <div>
              <p className="text-white font-medium">{m.displayName}</p>
              <p className="text-gray-500 text-sm capitalize">{m.role}</p>
            </div>
          </div>
        ))}
      </div>

      {announcements.length > 0 && (
        <div className="mb-8">
          <h3 className="text-gray-400 text-sm font-semibold uppercase tracking-wider mb-3">Announcements</h3>
          {announcements.map(ann => (
            <div key={ann.id} className="bg-[#1e1e2e] rounded-xl p-4 mb-2">
              {ann.pinned && <span className="text-yellow-500 text-xs font-semibold mr-2">📌 PINNED</span>}
              <p className="text-white font-semibold">{ann.title}</p>
              <p className="text-gray-400 text-sm mt-1">{ann.body}</p>
            </div>
          ))}
        </div>
      )}

      <button
        onClick={() => signOut(auth)}
        className="text-red-400 hover:text-red-300 text-sm mt-4"
      >
        Sign Out
      </button>
    </div>
  );
}
