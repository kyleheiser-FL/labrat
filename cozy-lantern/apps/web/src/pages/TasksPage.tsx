import { useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, db } from '../firebase';
import {
  subscribeFamilyTasks, getFamilyMembers, getUser, completeTask,
  type FamilyTask, type FamilyMember,
} from '@cozy-lantern/shared';

export default function TasksPage() {
  const [tasks, setTasks] = useState<FamilyTask[]>([]);
  const [members, setMembers] = useState<FamilyMember[]>([]);
  const [uid, setUid] = useState<string | null>(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async user => {
      if (!user) return;
      setUid(user.uid);
      const profile = await getUser(db, user.uid);
      if (!profile?.familyId) return;
      const familyMembers = await getFamilyMembers(db, profile.familyId);
      setMembers(familyMembers);
      return subscribeFamilyTasks(db, profile.familyId, setTasks);
    });
    return unsub;
  }, []);

  const memberMap = Object.fromEntries(members.map(m => [m.userId, m]));
  const open = tasks.filter(t => !t.completed);
  const done = tasks.filter(t => t.completed);

  return (
    <div className="h-full overflow-y-auto bg-[#0f0f1a] p-6">
      <h2 className="text-white text-xl font-bold mb-6">Tasks</h2>

      <div className="mb-8">
        <h3 className="text-gray-400 text-sm font-semibold uppercase tracking-wider mb-3">Open ({open.length})</h3>
        {open.length === 0 && <p className="text-gray-600 text-sm">All done!</p>}
        {open.map(task => (
          <div key={task.id} className="flex items-center gap-3 bg-[#1e1e2e] rounded-xl p-4 mb-2">
            <button
              onClick={() => uid && completeTask(db, task.id, uid)}
              className="w-5 h-5 rounded-full border-2 border-gray-500 hover:border-indigo-500 flex-shrink-0 transition-colors"
            />
            <div className="flex-1">
              <p className="text-white">{task.title}</p>
              {task.assignedTo && (
                <p className="text-gray-500 text-sm mt-0.5">
                  → {memberMap[task.assignedTo]?.displayName ?? task.assignedTo}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>

      {done.length > 0 && (
        <div>
          <h3 className="text-gray-600 text-sm font-semibold uppercase tracking-wider mb-3">Completed ({done.length})</h3>
          {done.slice(0, 10).map(task => (
            <div key={task.id} className="flex items-center gap-3 opacity-50 p-2 mb-1">
              <div className="w-5 h-5 rounded-full bg-indigo-600 flex-shrink-0" />
              <p className="text-gray-400 line-through">{task.title}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
