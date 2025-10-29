import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';

interface GameEntity {
  id: string;
  name: string;
  type: 'character' | 'object' | 'behavior';
  description: string;
  sprite: string;
  nodes: string[];
}

interface Game {
  id: string;
  name: string;
  description: string;
  thumbnail: string;
  entities: GameEntity[];
  createdAt: string;
}

interface GamePreviewProps {
  game: Game;
  onClose: () => void;
}

interface GameObject {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  sprite: string;
  size: number;
  entity: GameEntity;
}

const GamePreview = ({ game, onClose }: GamePreviewProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [score, setScore] = useState(0);
  const gameObjectsRef = useRef<GameObject[]>([]);
  const animationFrameRef = useRef<number>();
  const keysRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = 800;
    canvas.height = 500;

    const initGameObjects = () => {
      const objects: GameObject[] = [];
      
      game.entities.forEach((entity, idx) => {
        const obj: GameObject = {
          id: entity.id,
          x: 100 + idx * 150,
          y: entity.type === 'character' ? 400 : 100 + Math.random() * 200,
          vx: entity.type === 'character' && idx === 0 ? 0 : (Math.random() - 0.5) * 2,
          vy: entity.type === 'object' ? Math.random() * 2 : 0,
          sprite: entity.sprite,
          size: 40,
          entity
        };
        objects.push(obj);
      });
      
      return objects;
    };

    gameObjectsRef.current = initGameObjects();

    const handleKeyDown = (e: KeyboardEvent) => {
      keysRef.current.add(e.key);
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      keysRef.current.delete(e.key);
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    const gameLoop = () => {
      if (!isPlaying) return;

      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.strokeStyle = '#1e293b';
      for (let i = 0; i < canvas.width; i += 50) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, canvas.height);
        ctx.stroke();
      }
      for (let i = 0; i < canvas.height; i += 50) {
        ctx.beginPath();
        ctx.moveTo(0, i);
        ctx.lineTo(canvas.width, i);
        ctx.stroke();
      }

      const player = gameObjectsRef.current.find(obj => obj.entity.type === 'character' && obj.entity.nodes.includes('movement'));
      
      if (player) {
        const speed = 5;
        if (keysRef.current.has('ArrowLeft') || keysRef.current.has('a')) player.vx = -speed;
        else if (keysRef.current.has('ArrowRight') || keysRef.current.has('d')) player.vx = speed;
        else player.vx *= 0.8;

        if (keysRef.current.has('ArrowUp') || keysRef.current.has('w')) player.vy = -speed;
        else if (keysRef.current.has('ArrowDown') || keysRef.current.has('s')) player.vy = speed;
        else player.vy *= 0.8;

        player.x += player.vx;
        player.y += player.vy;

        player.x = Math.max(20, Math.min(canvas.width - 20, player.x));
        player.y = Math.max(20, Math.min(canvas.height - 20, player.y));
      }

      gameObjectsRef.current.forEach((obj) => {
        if (obj === player) return;

        obj.x += obj.vx;
        obj.y += obj.vy;

        if (obj.x < 20 || obj.x > canvas.width - 20) obj.vx *= -1;
        if (obj.y < 20 || obj.y > canvas.height - 20) obj.vy *= -1;
      });

      gameObjectsRef.current.forEach((obj) => {
        if (player && obj !== player && obj.entity.nodes.includes('collectible')) {
          const dx = obj.x - player.x;
          const dy = obj.y - player.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          if (distance < 50) {
            obj.x = Math.random() * (canvas.width - 40) + 20;
            obj.y = Math.random() * (canvas.height - 40) + 20;
            setScore(prev => prev + 10);
          }
        }
      });

      gameObjectsRef.current.forEach((obj) => {
        ctx.font = `${obj.size}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(obj.sprite, obj.x, obj.y);

        if (obj === player) {
          ctx.strokeStyle = '#84cc16';
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.arc(obj.x, obj.y, obj.size / 2 + 5, 0, Math.PI * 2);
          ctx.stroke();
        }
      });

      ctx.fillStyle = '#84cc16';
      ctx.font = 'bold 24px Rubik';
      ctx.textAlign = 'left';
      ctx.fillText(`Score: ${score}`, 20, 40);

      ctx.fillStyle = '#64748b';
      ctx.font = '14px Rubik';
      ctx.fillText('WASD / Стрелки для управления', 20, canvas.height - 20);

      animationFrameRef.current = requestAnimationFrame(gameLoop);
    };

    if (isPlaying) {
      gameLoop();
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [game, isPlaying, score]);

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleRestart = () => {
    setScore(0);
    gameObjectsRef.current = [];
    setIsPlaying(true);
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-lg max-w-5xl w-full max-h-[90vh] overflow-auto">
        <div className="sticky top-0 bg-slate-900 border-b border-slate-800 p-4 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white">{game.name}</h2>
            <p className="text-sm text-slate-400">{game.description}</p>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={handlePlayPause}
              variant="outline"
              className="border-slate-700"
            >
              <Icon name={isPlaying ? 'Pause' : 'Play'} size={18} className="mr-2" />
              {isPlaying ? 'Пауза' : 'Играть'}
            </Button>
            <Button
              onClick={handleRestart}
              variant="outline"
              className="border-slate-700"
            >
              <Icon name="RotateCcw" size={18} className="mr-2" />
              Заново
            </Button>
            <Button
              onClick={onClose}
              variant="outline"
              className="border-slate-700"
            >
              <Icon name="X" size={18} />
            </Button>
          </div>
        </div>

        <div className="p-6">
          <div className="bg-slate-950 rounded-lg overflow-hidden border-2 border-slate-800 mb-6">
            <canvas
              ref={canvasRef}
              className="w-full h-auto"
              style={{ imageRendering: 'pixelated' }}
            />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {game.entities.map((entity) => (
              <div
                key={entity.id}
                className="bg-slate-950 border border-slate-800 rounded p-3"
              >
                <div className="text-3xl text-center mb-2">{entity.sprite}</div>
                <div className="text-sm font-medium text-white text-center mb-1">
                  {entity.name}
                </div>
                <div className="flex flex-wrap gap-1 justify-center">
                  {entity.nodes.slice(0, 2).map((node) => (
                    <span
                      key={node}
                      className="text-xs px-2 py-0.5 bg-lime-500/20 text-lime-400 rounded"
                    >
                      {node}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GamePreview;
