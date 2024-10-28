interface PlayerUpdateEvent {
  id: string;
  click: boolean;
  pos: { x: number; y: number };
  offset: { x: number; y: number };
}
