import { useEffect } from 'react';
import { db } from '../firebase';
import { subscribeToLocations } from '@cozy-lantern/shared';
import { useFamilyStore } from '../store/familyStore';
import { useLocationStore } from '../store/locationStore';

export function useFamilyLocations() {
  const members = useFamilyStore(s => s.members);
  const { setMemberLocation, removeMemberLocation, clearLocations } = useLocationStore();

  useEffect(() => {
    if (!members.length) {
      clearLocations();
      return;
    }
    const uids = members.map(m => m.userId);
    const unsub = subscribeToLocations(db, uids, locations => {
      const seen = new Set(locations.map(l => l.userId));
      locations.forEach(loc => setMemberLocation(loc.userId, loc));
      // Remove stale entries for members who have no location doc
      uids.forEach(uid => {
        if (!seen.has(uid)) removeMemberLocation(uid);
      });
    });
    return unsub;
  }, [members]);
}
