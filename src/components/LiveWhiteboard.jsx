import React, { useRef, useState, useEffect } from 'react';
import { Pencil, Eraser, Trash2, Download, X, Square, Minus, Highlighter } from 'lucide-react';

/**
 * Interactive Google Meet-style Whiteboard for LiveView.
 * Teacher draws with pen/highlighter/shapes/eraser; state syncs to students as PNG dataUrl.
 */
export const LiveWhiteboard = ({ isTeacher, whiteboardState, onSyncWhiteboard, onClose }) => {
  const canvasRef = useRef(null);
  const [tool, setTool] = useState('pen'); // pen | highlighter | eraser | line | rect
  const [color, setColor] = useState('#1e293b');
  const [lineWidth, setLineWidth] = useState(4);
  const [isDrawing, setIsDrawing] = useState(false);
  const startPosRef = useRef({ x: 0, y: 0 });
  const snapshotRef = useRef(null);

  const colors = [
    { hex: '#1e293b', label: 'أسود' },
    { hex: '#dc2626', label: 'أحمر' },
    { hex: '#2563eb', label: 'أزرق' },
    { hex: '#059669', label: 'أخضر' },
    { hex: '#d97706', label: 'برتقالي' },
    { hex: '#7c3aed', label: 'بنفسجي' }
  ];

  // Initialize white canvas background once
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    if (whiteboardState?.dataUrl) {
      const img = new Image();
      img.onload = () => ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      img.src = whiteboardState.dataUrl;
    }
  }, []);

  // Student side: re-render incoming whiteboard updates
  useEffect(() => {
    if (isTeacher || !whiteboardState?.dataUrl) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const img = new Image();
    img.onload = () => {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    };
    img.src = whiteboardState.dataUrl;
  }, [isTeacher, whiteboardState?.dataUrl, whiteboardState?.updatedAt]);

  const getCoords = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY
    };
  };

  const syncNow = () => {
    if (!isTeacher || !canvasRef.current || !onSyncWhiteboard) return;
    try {
      const dataUrl = canvasRef.current.toDataURL('image/webp', 0.72);
      onSyncWhiteboard(true, dataUrl);
    } catch {
      const dataUrl = canvasRef.current.toDataURL('image/png');
      onSyncWhiteboard(true, dataUrl);
    }
  };

  const handlePointerDown = (e) => {
    if (!isTeacher) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const pos = getCoords(e);
    startPosRef.current = pos;
    snapshotRef.current = ctx.getImageData(0, 0, canvas.width, canvas.height);
    setIsDrawing(true);

    if (tool === 'pen' || tool === 'highlighter' || tool === 'eraser') {
      ctx.beginPath();
      ctx.moveTo(pos.x, pos.y);
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.globalAlpha = tool === 'highlighter' ? 0.35 : 1;
      ctx.strokeStyle = tool === 'eraser' ? '#ffffff' : color;
      ctx.lineWidth = tool === 'eraser' ? lineWidth * 4 : tool === 'highlighter' ? lineWidth * 3 : lineWidth;
    }
  };

  const handlePointerMove = (e) => {
    if (!isTeacher || !isDrawing) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const pos = getCoords(e);

    if (tool === 'pen' || tool === 'highlighter' || tool === 'eraser') {
      ctx.lineTo(pos.x, pos.y);
      ctx.stroke();
    } else if (tool === 'line' || tool === 'rect') {
      ctx.putImageData(snapshotRef.current, 0, 0);
      ctx.beginPath();
      ctx.globalAlpha = 1;
      ctx.strokeStyle = color;
      ctx.lineWidth = lineWidth;
      ctx.lineCap = 'round';
      if (tool === 'line') {
        ctx.moveTo(startPosRef.current.x, startPosRef.current.y);
        ctx.lineTo(pos.x, pos.y);
      } else {
        ctx.rect(
          startPosRef.current.x,
          startPosRef.current.y,
          pos.x - startPosRef.current.x,
          pos.y - startPosRef.current.y
        );
      }
      ctx.stroke();
    }
  };

  const handlePointerUp = () => {
    if (!isTeacher || !isDrawing) return;
    setIsDrawing(false);
    const ctx = canvasRef.current?.getContext('2d');
    if (ctx) {
      ctx.closePath();
      ctx.globalAlpha = 1;
    }
    syncNow();
  };

  const handleClear = () => {
    if (!isTeacher) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    syncNow();
  };

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = `elm-whiteboard-${Date.now()}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  return (
    <div className="relative w-full h-full bg-white rounded-3xl overflow-hidden flex flex-col border-2 border-blue-500/40 shadow-2xl">
      {/* Top Toolbar */}
      <div className="bg-slate-900 text-white px-3 py-2 flex flex-wrap items-center justify-between gap-2 text-xs font-bold z-20">
        <div className="flex items-center gap-2">
          <span className="bg-blue-600 text-white px-2.5 py-1 rounded-lg font-black flex items-center gap-1">
            <Pencil className="w-3.5 h-3.5" />
            <span>السبورة التفاعلية</span>
          </span>
          {!isTeacher && (
            <span className="text-[11px] text-emerald-400 font-bold">بث مباشر من شاشة المعلم</span>
          )}
        </div>

        {isTeacher && (
          <div className="flex flex-wrap items-center gap-1.5">
            {[
              { id: 'pen', icon: Pencil, label: 'قلم' },
              { id: 'highlighter', icon: Highlighter, label: 'تحديد' },
              { id: 'line', icon: Minus, label: 'خط' },
              { id: 'rect', icon: Square, label: 'مربع' },
              { id: 'eraser', icon: Eraser, label: 'ممحاة' }
            ].map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setTool(item.id)}
                  title={item.label}
                  className={`px-2 py-1.5 rounded-lg flex items-center gap-1 transition-all ${
                    tool === item.id ? 'bg-blue-600 text-white' : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">{item.label}</span>
                </button>
              );
            })}

            <div className="flex items-center gap-1 bg-slate-800 px-2 py-1 rounded-lg">
              {colors.map((c) => (
                <button
                  key={c.hex}
                  type="button"
                  onClick={() => { setColor(c.hex); if (tool === 'eraser') setTool('pen'); }}
                  title={c.label}
                  className={`w-4 h-4 rounded-full border-2 transition-transform ${
                    color === c.hex && tool !== 'eraser' ? 'border-white scale-125' : 'border-transparent'
                  }`}
                  style={{ backgroundColor: c.hex }}
                />
              ))}
            </div>

            <select
              value={lineWidth}
              onChange={(e) => setLineWidth(Number(e.target.value))}
              className="bg-slate-800 text-white text-[11px] rounded-lg px-1.5 py-1 border border-slate-700"
              title="سمك الخط"
            >
              <option value={2}>رفيع</option>
              <option value={4}>متوسط</option>
              <option value={8}>عريض</option>
            </select>

            <button
              type="button"
              onClick={handleClear}
              title="مسح السبورة"
              className="bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white px-2 py-1.5 rounded-lg flex items-center gap-1 transition-all"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={handleDownload}
            title="حفظ السبورة كصورة"
            className="bg-emerald-600 hover:bg-emerald-500 text-white px-2.5 py-1.5 rounded-lg flex items-center gap-1"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">حفظ</span>
          </button>
          {isTeacher && onClose && (
            <button
              type="button"
              onClick={onClose}
              title="إغلاق السبورة والعودة للفيديو"
              className="bg-slate-700 hover:bg-rose-600 text-white px-2.5 py-1.5 rounded-lg flex items-center gap-1"
            >
              <X className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">إغلاق</span>
            </button>
          )}
        </div>
      </div>

      {/* Drawing Canvas */}
      <div className="flex-1 min-h-0 relative bg-white overflow-hidden">
        <canvas
          ref={canvasRef}
          width={1280}
          height={720}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerUp}
          className={`w-full h-full object-contain touch-none ${isTeacher ? 'cursor-crosshair' : 'cursor-default'}`}
        />
      </div>
    </div>
  );
};
