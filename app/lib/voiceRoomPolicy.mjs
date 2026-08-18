export const STAGE_ROOM_TYPE = 'stage';

export function filterStageRooms(rooms) {
  return rooms.filter((room) => room.room_type === STAGE_ROOM_TYPE);
}

export function buildStageRoomPayload({ code, title }) {
  return {
    code,
    title,
    is_public: true,
    room_type: STAGE_ROOM_TYPE,
  };
}
