import { useEffect, useState } from 'react';
import { Map, AdvancedMarker, InfoWindow } from '@vis.gl/react-google-maps';
import { onAuthStateChanged } from 'firebase/auth';
import { formatDistanceToNow } from 'date-fns';
import { auth, db } from '../firebase';
import {
  subscribeToLocations, getFamilyMembers, getUser, classifyMovement,
  type LiveLocation, type FamilyMember,
} from '@cozy-lantern/shared';

export default function MapPage() {
  const [locations, setLocations] = useState<LiveLocation[]>([]);
  const [members, setMembers] = useState<FamilyMember[]>([]);
  const [selectedUid, setSelectedUid] = useState<string | null>(null);
  const memberMap = Object.fromEntries(members.map(m => [m.userId, m]));

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async user => {
      if (!user) return;
      const profile = await getUser(db, user.uid);
      if (!profile?.familyId) return;

      const familyMembers = await getFamilyMembers(db, profile.familyId);
      setMembers(familyMembers);

      const uids = familyMembers.map(m => m.userId);
      return subscribeToLocations(db, uids, setLocations);
    });
    return unsub;
  }, []);

  const selectedLoc = locations.find(l => l.userId === selectedUid);
  const selectedMember = selectedUid ? memberMap[selectedUid] : null;

  return (
    <div className="h-full w-full">
      <Map
        defaultCenter={{ lat: 37.78825, lng: -122.4324 }}
        defaultZoom={12}
        mapId="cozy-lantern-map"
        style={{ width: '100%', height: '100%' }}
      >
        {locations.map(loc => {
          const member = memberMap[loc.userId];
          if (!member) return null;
          const movement = classifyMovement(loc.speed);
          const color = movement === 'driving' ? '#059669'
            : movement === 'walking' ? '#d97706'
            : '#4f46e5';

          return (
            <AdvancedMarker
              key={loc.userId}
              position={{ lat: loc.lat, lng: loc.lng }}
              onClick={() => setSelectedUid(loc.userId)}
            >
              <div
                className="flex items-center justify-center w-10 h-10 rounded-full border-2 border-white text-white font-bold text-base cursor-pointer shadow-lg"
                style={{ backgroundColor: color }}
                title={member.displayName}
              >
                {member.displayName[0].toUpperCase()}
              </div>
            </AdvancedMarker>
          );
        })}

        {selectedUid && selectedLoc && selectedMember && (
          <InfoWindow
            position={{ lat: selectedLoc.lat, lng: selectedLoc.lng }}
            onCloseClick={() => setSelectedUid(null)}
          >
            <div className="p-2 min-w-[140px]">
              <p className="font-bold text-gray-900">{selectedMember.displayName}</p>
              {selectedLoc.address && (
                <p className="text-sm text-gray-600 mt-1">{selectedLoc.address}</p>
              )}
              <p className="text-xs text-gray-400 mt-1">
                {formatDistanceToNow(selectedLoc.timestamp, { addSuffix: true })}
              </p>
              {selectedLoc.batteryLevel >= 0 && (
                <p className="text-xs text-gray-400">🔋 {selectedLoc.batteryLevel}%</p>
              )}
            </div>
          </InfoWindow>
        )}
      </Map>
    </div>
  );
}
