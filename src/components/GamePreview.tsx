import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import EntityIcon from './EntityIcon';

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
  color: string;
  shape: 'square' | 'circle' | 'triangle' | 'star';
}

const GamePreview = ({ game, onClose }: GamePreviewProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [score, setScore] = useState(0);
  const gameObjectsRef = useRef<GameObject[]>([]);
  const animationFrameRef = useRef<number>();
  const keysRef = useRef<Set<string>>(new Set());
  const [touchDirection, setTouchDirection] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = 800;
    canvas.height = 500;

    const getColorForEntity = (entity: GameEntity, idx: number): string => {
      const colors = ['#84cc16', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6'];
      
      if (entity.nodes.includes('movement')) return '#84cc16';
      if (entity.nodes.includes('ai') || entity.nodes.includes('attack')) return '#ef4444';
      if (entity.nodes.includes('collectible')) return '#f59e0b';
      if (entity.nodes.includes('heal')) return '#ec4899';
      
      return colors[idx % colors.length];
    };

    const getShapeForEntity = (entity: GameEntity): 'square' | 'circle' | 'triangle' | 'star' => {
      if (entity.type === 'character') {
        if (entity.nodes.includes('movement')) return 'square';
        if (entity.nodes.includes('ai')) return 'triangle';
        return 'square';
      }
      if (entity.nodes.includes('collectible')) return 'star';
      if (entity.nodes.includes('heal')) return 'circle';
      if (entity.nodes.includes('damage')) return 'triangle';
      return 'circle';
    };

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
          size: 32,
          entity,
          color: getColorForEntity(entity, idx),
          shape: getShapeForEntity(entity)
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
        
        if (touchDirection.x !== 0 || touchDirection.y !== 0) {
          player.vx = touchDirection.x * speed;
          player.vy = touchDirection.y * speed;
        } else {
          if (keysRef.current.has('ArrowLeft') || keysRef.current.has('a')) player.vx = -speed;
          else if (keysRef.current.has('ArrowRight') || keysRef.current.has('d')) player.vx = speed;
          else player.vx *= 0.8;

          if (keysRef.current.has('ArrowUp') || keysRef.current.has('w')) player.vy = -speed;
          else if (keysRef.current.has('ArrowDown') || keysRef.current.has('s')) player.vy = speed;
          else player.vy *= 0.8;
        }

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

      const drawShape = (obj: GameObject) => {
        ctx.save();
        ctx.fillStyle = obj.color;
        ctx.strokeStyle = obj === player ? '#ffffff' : obj.color;
        ctx.lineWidth = obj === player ? 3 : 2;

        switch (obj.shape) {
          case 'square':
            ctx.fillRect(obj.x - obj.size / 2, obj.y - obj.size / 2, obj.size, obj.size);
            if (obj === player) {
              ctx.strokeRect(obj.x - obj.size / 2, obj.y - obj.size / 2, obj.size, obj.size);
            }
            
            ctx.fillStyle = '#0f172a';
            ctx.fillRect(obj.x - obj.size / 4, obj.y - obj.size / 4, obj.size / 8, obj.size / 8);
            ctx.fillRect(obj.x + obj.size / 8, obj.y - obj.size / 4, obj.size / 8, obj.size / 8);
            break;

          case 'circle':
            ctx.beginPath();
            ctx.arc(obj.x, obj.y, obj.size / 2, 0, Math.PI * 2);
            ctx.fill();
            if (obj === player) ctx.stroke();
            
            ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
            ctx.beginPath();
            ctx.arc(obj.x - obj.size / 6, obj.y - obj.size / 6, obj.size / 6, 0, Math.PI * 2);
            ctx.fill();
            break;

          case 'triangle':
            ctx.beginPath();
            ctx.moveTo(obj.x, obj.y - obj.size / 2);
            ctx.lineTo(obj.x - obj.size / 2, obj.y + obj.size / 2);
            ctx.lineTo(obj.x + obj.size / 2, obj.y + obj.size / 2);
            ctx.closePath();
            ctx.fill();
            if (obj === player) ctx.stroke();
            
            ctx.fillStyle = '#0f172a';
            ctx.beginPath();
            ctx.moveTo(obj.x - obj.size / 8, obj.y);
            ctx.lineTo(obj.x, obj.y - obj.size / 6);
            ctx.lineTo(obj.x + obj.size / 8, obj.y);
            ctx.closePath();
            ctx.fill();
            break;

          case 'star':
            const spikes = 5;
            const outerRadius = obj.size / 2;
            const innerRadius = obj.size / 4;
            let rot = Math.PI / 2 * 3;
            const step = Math.PI / spikes;

            ctx.beginPath();
            ctx.moveTo(obj.x, obj.y - outerRadius);
            
            for (let i = 0; i < spikes; i++) {
              ctx.lineTo(
                obj.x + Math.cos(rot) * outerRadius,
                obj.y + Math.sin(rot) * outerRadius
              );
              rot += step;
              ctx.lineTo(
                obj.x + Math.cos(rot) * innerRadius,
                obj.y + Math.sin(rot) * innerRadius
              );
              rot += step;
            }
            
            ctx.lineTo(obj.x, obj.y - outerRadius);
            ctx.closePath();
            ctx.fill();
            if (obj === player) ctx.stroke();
            break;
        }

        ctx.restore();
      };

      gameObjectsRef.current.forEach((obj) => {
        drawShape(obj);
      });

      ctx.fillStyle = '#84cc16';
      ctx.font = 'bold 24px Rubik';
      ctx.textAlign = 'left';
      ctx.fillText(`Score: ${score}`, 20, 40);

      ctx.fillStyle = '#64748b';
      ctx.font = '14px Rubik';
      ctx.fillText('Используй джойстик для управления', 20, canvas.height - 20);

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

  const handleJoystickMove = (x: number, y: number) => {
    setTouchDirection({ x, y });
  };

  const handleJoystickEnd = () => {
    setTouchDirection({ x: 0, y: 0 });
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
            {game.entities.map((entity, idx) => {
              const obj = gameObjectsRef.current.find(o => o.entity.id === entity.id);
              return (
                <div
                  key={entity.id}
                  className="bg-slate-950 border border-slate-800 rounded p-3"
                >
                  <div className="flex items-center justify-center mb-3">
                    {obj ? (
                      <EntityIcon color={obj.color} shape={obj.shape} size={32} />
                    ) : (
                      <div className="w-12 h-12 bg-slate-800 rounded" />
                    )}
                  </div>
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
              );
            })}
          </div>

          <VirtualJoystick
            onMove={handleJoystickMove}
            onEnd={handleJoystickEnd}
          />
        </div>
      </div>
    </div>
  );
};

interface VirtualJoystickProps {
  onMove: (x: number, y: number) => void;
  onEnd: () => void;
}

const VirtualJoystick = ({ onMove, onEnd }: VirtualJoystickProps) => {
  const joystickRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);

  const handleStart = (clientX: number, clientY: number) => {
    setIsDragging(true);
  };

  const handleMove = (clientX: number, clientY: number) => {
    if (!isDragging || !joystickRef.current) return;

    const rect = joystickRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const deltaX = clientX - centerX;
    const deltaY = clientY - centerY;

    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    const maxDistance = 40;

    let x = deltaX;
    let y = deltaY;

    if (distance > maxDistance) {
      x = (deltaX / distance) * maxDistance;
      y = (deltaY / distance) * maxDistance;
    }

    setPosition({ x, y });

    const normalizedX = x / maxDistance;
    const normalizedY = y / maxDistance;
    onMove(normalizedX, normalizedY);
  };

  const handleEnd = () => {
    setIsDragging(false);
    setPosition({ x: 0, y: 0 });
    onEnd();
  };

  return (
    <div className="fixed bottom-8 left-8 z-50 md:hidden">
      <div
        ref={joystickRef}
        className="relative w-32 h-32 bg-slate-800/50 rounded-full border-2 border-slate-700 backdrop-blur-sm"
        onTouchStart={(e) => {
          e.preventDefault();
          handleStart(e.touches[0].clientX, e.touches[0].clientY);
        }}
        onTouchMove={(e) => {
          e.preventDefault();
          handleMove(e.touches[0].clientX, e.touches[0].clientY);
        }}
        onTouchEnd={(e) => {
          e.preventDefault();
          handleEnd();
        }}
        onMouseDown={(e) => {
          handleStart(e.clientX, e.clientY);
        }}
        onMouseMove={(e) => {
          if (isDragging) {
            handleMove(e.clientX, e.clientY);
          }
        }}
        onMouseUp={handleEnd}
        onMouseLeave={handleEnd}
      >
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-12 h-12 bg-slate-700 rounded-full" />
        </div>
        <div
          className="absolute top-1/2 left-1/2 w-10 h-10 bg-lime-500 rounded-full -translate-x-1/2 -translate-y-1/2 transition-transform"
          style={{
            transform: `translate(calc(-50% + ${position.x}px), calc(-50% + ${position.y}px))`
          }}
        />
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <Icon name="Move" size={24} className="text-slate-600" />
        </div>
      </div>
    </div>
  );
};

export default GamePreview;