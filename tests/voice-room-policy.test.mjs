import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildStageRoomPayload,
  filterStageRooms,
} from '../app/lib/voiceRoomPolicy.mjs';

test('stage channel list excludes general voice rooms', () => {
  const rooms = [
    { id: 'stage-1', room_type: 'stage', is_public: true },
    { id: 'general-1', room_type: 'general', is_public: true },
    { id: 'stage-private', room_type: 'stage', is_public: false },
  ];

  assert.deepEqual(filterStageRooms(rooms), [
    { id: 'stage-1', room_type: 'stage', is_public: true },
    { id: 'stage-private', room_type: 'stage', is_public: false },
  ]);
});

test('stage channel creation always produces a public stage payload', () => {
  assert.deepEqual(buildStageRoomPayload({ code: 'weekly-event', title: 'Weekly Event' }), {
    code: 'weekly-event',
    title: 'Weekly Event',
    is_public: true,
    room_type: 'stage',
  });
});
