import { useCursor } from '../../hooks/useCursor';
import s from './Cursor.module.css';

export default function Cursor() {
  const { pos, ringPos, active } = useCursor();

  return (
    <>
      <div
        className={`${s.cursor} ${active ? s.active : ''}`}
        style={{ left: pos.x, top: pos.y }}
      />
      <div
        className={`${s.ring} ${active ? s.active : ''}`}
        style={{ left: ringPos.x, top: ringPos.y }}
      />
    </>
  );
}
