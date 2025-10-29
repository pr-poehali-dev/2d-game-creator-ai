import { useEffect, useRef } from 'react';

interface EntityIconProps {
  color: string;
  shape: 'square' | 'circle' | 'triangle' | 'star';
  size?: number;
}

const EntityIcon = ({ color, shape, size = 32 }: EntityIconProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, 48, 48);
    ctx.fillStyle = color;
    const centerX = 24;
    const centerY = 24;

    switch (shape) {
      case 'square':
        ctx.fillRect(centerX - size / 2, centerY - size / 2, size, size);
        ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.fillRect(centerX - size / 4, centerY - size / 4, size / 8, size / 8);
        ctx.fillRect(centerX + size / 8, centerY - size / 4, size / 8, size / 8);
        break;

      case 'circle':
        ctx.beginPath();
        ctx.arc(centerX, centerY, size / 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.beginPath();
        ctx.arc(centerX - size / 6, centerY - size / 6, size / 6, 0, Math.PI * 2);
        ctx.fill();
        break;

      case 'triangle':
        ctx.beginPath();
        ctx.moveTo(centerX, centerY - size / 2);
        ctx.lineTo(centerX - size / 2, centerY + size / 2);
        ctx.lineTo(centerX + size / 2, centerY + size / 2);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.beginPath();
        ctx.moveTo(centerX - size / 8, centerY);
        ctx.lineTo(centerX, centerY - size / 6);
        ctx.lineTo(centerX + size / 8, centerY);
        ctx.closePath();
        ctx.fill();
        break;

      case 'star':
        const spikes = 5;
        const outerRadius = size / 2;
        const innerRadius = size / 4;
        let rot = Math.PI / 2 * 3;
        const step = Math.PI / spikes;
        
        ctx.beginPath();
        ctx.moveTo(centerX, centerY - outerRadius);
        
        for (let i = 0; i < spikes; i++) {
          ctx.lineTo(
            centerX + Math.cos(rot) * outerRadius,
            centerY + Math.sin(rot) * outerRadius
          );
          rot += step;
          ctx.lineTo(
            centerX + Math.cos(rot) * innerRadius,
            centerY + Math.sin(rot) * innerRadius
          );
          rot += step;
        }
        
        ctx.lineTo(centerX, centerY - outerRadius);
        ctx.closePath();
        ctx.fill();
        break;
    }
  }, [color, shape, size]);

  return <canvas ref={canvasRef} width="48" height="48" />;
};

export default EntityIcon;
