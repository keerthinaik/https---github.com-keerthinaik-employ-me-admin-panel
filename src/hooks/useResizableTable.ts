'use client'
import { useEffect } from 'react'

export function useResizableTable(tableRef: React.RefObject<HTMLTableElement>) {
  useEffect(() => {
    const table = tableRef.current
    if (!table) return

    const resizers = Array.from(table.querySelectorAll('.resizer')) as HTMLElement[];
    if (resizers.length === 0) return;
    
    const onMouseDown = (e: MouseEvent) => {
      const th = (e.target as HTMLElement).parentElement;
      if (!th) return;

      const startX = e.clientX;
      const startW = th.offsetWidth;
      (e.target as HTMLElement).classList.add('resizing');

      const onMouseMove = (e: MouseEvent) => {
        const newWidth = startW + (e.clientX - startX);
        if (newWidth > 50) { // min width 50px
          th.style.width = `${newWidth}px`;
        }
      };

      const onMouseUp = () => {
        (e.target as HTMLElement).classList.remove('resizing');
        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mouseup', onMouseUp);
        document.body.style.cursor = 'default';
        document.body.style.userSelect = 'auto';
      };

      document.addEventListener('mousemove', onMouseMove);
      document.addEventListener('mouseup', onMouseUp);
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
    };

    const listeners: { resizer: HTMLElement; handler: (e: MouseEvent) => void }[] = [];

    resizers.forEach(resizer => {
      const handler = (e: MouseEvent) => onMouseDown(e);
      resizer.addEventListener('mousedown', handler);
      listeners.push({ resizer, handler });
    });

    return () => {
      listeners.forEach(({ resizer, handler }) => {
        resizer.removeEventListener('mousedown', handler);
      });
    };
  }, [tableRef]);
}
