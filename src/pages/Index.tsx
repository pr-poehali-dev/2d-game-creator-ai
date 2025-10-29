import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';

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

const Index = () => {
  const [activeTab, setActiveTab] = useState('generator');
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [games, setGames] = useState<Game[]>([
    {
      id: '1',
      name: 'Приключения Героя',
      description: 'Pixel-art RPG с торговцами и собиранием монет',
      thumbnail: '🏰',
      createdAt: '2025-10-25',
      entities: [
        {
          id: '1',
          name: 'Герой',
          type: 'character',
          description: 'Игровой персонаж с базовым управлением',
          sprite: '🦸',
          nodes: ['movement', 'dialog', 'inventory']
        },
        {
          id: '2',
          name: 'NPC Торговец',
          type: 'character',
          description: 'Персонаж для торговли предметами',
          sprite: '🧙',
          nodes: ['dialog', 'shop']
        },
        {
          id: '3',
          name: 'Монета',
          type: 'object',
          description: 'Собираемый объект валюты',
          sprite: '🪙',
          nodes: ['collectible']
        }
      ]
    }
  ]);
  const [library, setLibrary] = useState<GameEntity[]>([]);
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);
  const [selectedEntity, setSelectedEntity] = useState<GameEntity | null>(null);
  const { toast } = useToast();

  const generateGameFromPrompt = (prompt: string) => {
    const gameTemplates = [
      {
        keywords: ['платформер', 'прыг', 'jump'],
        name: 'Pixel Platformer',
        thumbnail: '🏃',
        entities: [
          { name: 'Герой', sprite: '🦸', type: 'character' as const, desc: 'Прыгающий персонаж', nodes: ['movement', 'jump', 'double-jump'] },
          { name: 'Платформа', sprite: '🟫', type: 'object' as const, desc: 'Твёрдая поверхность', nodes: ['collision', 'static'] },
          { name: 'Шип', sprite: '🔺', type: 'object' as const, desc: 'Опасная ловушка', nodes: ['damage', 'hazard'] },
          { name: 'Монета', sprite: '🪙', type: 'object' as const, desc: 'Собираемая валюта', nodes: ['collectible', 'score'] }
        ]
      },
      {
        keywords: ['rpg', 'приключен', 'квест'],
        name: 'Adventure Quest',
        thumbnail: '🏰',
        entities: [
          { name: 'Рыцарь', sprite: '⚔️', type: 'character' as const, desc: 'Отважный воин', nodes: ['movement', 'attack', 'inventory'] },
          { name: 'Дракон', sprite: '🐉', type: 'character' as const, desc: 'Огнедышащий босс', nodes: ['ai', 'fire-attack', 'health'] },
          { name: 'Сундук', sprite: '📦', type: 'object' as const, desc: 'Хранилище сокровищ', nodes: ['loot', 'interact'] },
          { name: 'Зелье', sprite: '🧪', type: 'object' as const, desc: 'Лечебное зелье', nodes: ['heal', 'collectible'] }
        ]
      },
      {
        keywords: ['аркад', 'arcade', 'шутер', 'shoot'],
        name: 'Space Arcade',
        thumbnail: '🚀',
        entities: [
          { name: 'Корабль', sprite: '🚀', type: 'character' as const, desc: 'Космический истребитель', nodes: ['movement', 'shoot', 'shield'] },
          { name: 'Пришелец', sprite: '👽', type: 'character' as const, desc: 'Враждебный инопланетянин', nodes: ['ai', 'shoot', 'patrol'] },
          { name: 'Астероид', sprite: '☄️', type: 'object' as const, desc: 'Летающий камень', nodes: ['damage', 'movement'] },
          { name: 'Энергия', sprite: '⚡', type: 'object' as const, desc: 'Усиление оружия', nodes: ['powerup', 'collectible'] }
        ]
      }
    ];

    const lowerPrompt = prompt.toLowerCase();
    let selectedTemplate = gameTemplates[Math.floor(Math.random() * gameTemplates.length)];
    
    for (const template of gameTemplates) {
      if (template.keywords.some(kw => lowerPrompt.includes(kw))) {
        selectedTemplate = template;
        break;
      }
    }

    return {
      name: selectedTemplate.name,
      thumbnail: selectedTemplate.thumbnail,
      entities: selectedTemplate.entities.map((e, idx) => ({
        id: `${Date.now()}-${idx}`,
        name: e.name,
        type: e.type,
        description: e.desc,
        sprite: e.sprite,
        nodes: e.nodes
      }))
    };
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast({
        title: 'Введите описание',
        description: 'Опишите какую игру вы хотите создать',
        variant: 'destructive'
      });
      return;
    }

    setIsGenerating(true);
    
    setTimeout(() => {
      const generated = generateGameFromPrompt(prompt);

      const newGame: Game = {
        id: Date.now().toString(),
        name: generated.name,
        description: prompt,
        thumbnail: generated.thumbnail,
        createdAt: new Date().toISOString().split('T')[0],
        entities: generated.entities
      };
      
      setGames([newGame, ...games]);
      setLibrary([...library, ...generated.entities]);
      setPrompt('');
      setIsGenerating(false);
      setActiveTab('games');
      
      toast({
        title: 'Игра создана!',
        description: 'Все элементы добавлены в библиотеку'
      });
    }, 2500);
  };

  const entityTypeColors = {
    character: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    object: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    behavior: 'bg-lime-500/20 text-lime-400 border-lime-500/30'
  };

  return (
    <div className="min-h-screen bg-slate-950">
      <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="text-3xl">🎮</div>
              <h1 className="text-2xl font-bold text-white">PixelForge AI</h1>
            </div>
            <nav className="flex gap-2">
              <Button variant="ghost" className="text-slate-300 hover:text-white">
                <Icon name="Home" size={18} className="mr-2" />
                Мои игры
              </Button>
              <Button variant="ghost" className="text-slate-300 hover:text-white">
                <Icon name="Users" size={18} className="mr-2" />
                Сообщество
              </Button>
            </nav>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full max-w-3xl mx-auto grid-cols-4 bg-slate-900 border border-slate-800">
            <TabsTrigger value="generator" className="data-[state=active]:bg-lime-500 data-[state=active]:text-slate-950">
              <Icon name="Sparkles" size={18} className="mr-2" />
              AI-Генератор
            </TabsTrigger>
            <TabsTrigger value="games" className="data-[state=active]:bg-lime-500 data-[state=active]:text-slate-950">
              <Icon name="Gamepad2" size={18} className="mr-2" />
              Мои игры
            </TabsTrigger>
            <TabsTrigger value="library" className="data-[state=active]:bg-lime-500 data-[state=active]:text-slate-950">
              <Icon name="Library" size={18} className="mr-2" />
              Библиотека
            </TabsTrigger>
            <TabsTrigger value="editor" className="data-[state=active]:bg-lime-500 data-[state=active]:text-slate-950">
              <Icon name="Grid3x3" size={18} className="mr-2" />
              Редактор
            </TabsTrigger>
          </TabsList>

          <TabsContent value="generator" className="mt-8">
            <div className="max-w-4xl mx-auto">
              <Card className="bg-slate-900 border-slate-800 p-8">
                <div className="text-center mb-8">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-lime-500/20 mb-4">
                    <Icon name="Sparkles" size={32} className="text-lime-500" />
                  </div>
                  <h2 className="text-3xl font-bold text-white mb-2">AI-генератор игр</h2>
                  <p className="text-slate-400">Опишите какую игру хотите создать, и AI сгенерирует готовый проект</p>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Описание игры
                    </label>
                    <Textarea
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      placeholder="Например: создай платформер где персонаж прыгает по платформам, собирает монеты и избегает врагов..."
                      className="min-h-[150px] bg-slate-950 border-slate-700 text-white placeholder:text-slate-500 resize-none"
                    />
                  </div>

                  <div className="flex gap-4">
                    <Button 
                      onClick={handleGenerate}
                      disabled={isGenerating}
                      className="flex-1 bg-lime-500 hover:bg-lime-600 text-slate-950 font-semibold h-12"
                    >
                      {isGenerating ? (
                        <>
                          <Icon name="Loader2" size={20} className="mr-2 animate-spin" />
                          Генерация...
                        </>
                      ) : (
                        <>
                          <Icon name="Sparkles" size={20} className="mr-2" />
                          Создать игру
                        </>
                      )}
                    </Button>
                  </div>

                  <div className="grid grid-cols-3 gap-4 pt-6 border-t border-slate-800">
                    <div className="text-center">
                      <div className="text-2xl mb-2">🎮</div>
                      <div className="text-sm text-slate-400">Платформеры</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl mb-2">🏰</div>
                      <div className="text-sm text-slate-400">RPG</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl mb-2">🚀</div>
                      <div className="text-sm text-slate-400">Аркады</div>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="games" className="mt-8">
            <div className="max-w-6xl mx-auto">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">Мои игры</h2>
                <Button onClick={() => setActiveTab('generator')} className="bg-lime-500 hover:bg-lime-600 text-slate-950">
                  <Icon name="Plus" size={18} className="mr-2" />
                  Создать игру
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {games.map((game) => (
                  <Card
                    key={game.id}
                    className="bg-slate-900 border-slate-800 overflow-hidden cursor-pointer hover:border-lime-500/50 transition-all group"
                    onClick={() => {
                      setSelectedGame(game);
                      setActiveTab('editor');
                    }}
                  >
                    <div className="bg-gradient-to-br from-lime-500/20 to-slate-900 p-8 flex items-center justify-center">
                      <div className="text-7xl group-hover:scale-110 transition-transform">{game.thumbnail}</div>
                    </div>
                    <div className="p-6">
                      <h3 className="text-xl font-bold text-white mb-2">{game.name}</h3>
                      <p className="text-sm text-slate-400 mb-4 line-clamp-2">{game.description}</p>
                      <div className="flex items-center justify-between text-xs text-slate-500">
                        <span>{game.entities.length} элементов</span>
                        <span>{game.createdAt}</span>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="library" className="mt-8">
            <div className="max-w-6xl mx-auto">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">Библиотека компонентов</h2>
                <Button variant="outline" className="border-slate-700 text-slate-300">
                  <Icon name="Filter" size={18} className="mr-2" />
                  Фильтры
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {library.map((entity) => (
                  <Card
                    key={entity.id}
                    className="bg-slate-900 border-slate-800 p-6 cursor-pointer hover:border-lime-500/50 transition-all"
                    onClick={() => setSelectedEntity(entity)}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="text-5xl">{entity.sprite}</div>
                      <Badge className={entityTypeColors[entity.type]}>
                        {entity.type === 'character' && 'Персонаж'}
                        {entity.type === 'object' && 'Объект'}
                        {entity.type === 'behavior' && 'Поведение'}
                      </Badge>
                    </div>
                    
                    <h3 className="text-lg font-semibold text-white mb-2">{entity.name}</h3>
                    <p className="text-sm text-slate-400 mb-4 line-clamp-2">{entity.description}</p>
                    
                    <div className="flex flex-wrap gap-2">
                      {entity.nodes.map((node) => (
                        <Badge key={node} variant="outline" className="text-xs border-slate-700 text-slate-400">
                          {node}
                        </Badge>
                      ))}
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="editor" className="mt-8">
            <div className="max-w-7xl mx-auto">
              {selectedGame ? (
                <>
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-4">
                      <Button variant="outline" onClick={() => setActiveTab('games')} className="border-slate-700">
                        <Icon name="ArrowLeft" size={18} className="mr-2" />
                        Назад
                      </Button>
                      <div>
                        <h2 className="text-2xl font-bold text-white">{selectedGame.name}</h2>
                        <p className="text-sm text-slate-400">{selectedGame.description}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" className="border-slate-700">
                        <Icon name="Play" size={18} className="mr-2" />
                        Тест
                      </Button>
                      <Button className="bg-lime-500 hover:bg-lime-600 text-slate-950">
                        <Icon name="Save" size={18} className="mr-2" />
                        Сохранить
                      </Button>
                    </div>
                  </div>
                  <div className="grid grid-cols-12 gap-6 h-[calc(100vh-300px)]">
                    <div className="col-span-9">
                      <Card className="bg-slate-900 border-slate-800 h-full p-6">
                        <h3 className="text-lg font-semibold text-white mb-4">Игровые объекты</h3>
                        <div className="grid grid-cols-2 gap-4">
                          {selectedGame.entities.map((entity) => (
                            <Card
                              key={entity.id}
                              className="bg-slate-950 border-slate-800 p-4 cursor-pointer hover:border-lime-500/50 transition-all"
                              onClick={() => setSelectedEntity(entity)}
                            >
                              <div className="flex items-center gap-4">
                                <div className="text-4xl">{entity.sprite}</div>
                                <div className="flex-1">
                                  <h4 className="font-semibold text-white mb-1">{entity.name}</h4>
                                  <p className="text-xs text-slate-400">{entity.description}</p>
                                </div>
                              </div>
                            </Card>
                          ))}
                        </div>
                      </Card>
                    </div>

                    <div className="col-span-3">
                      <Card className="bg-slate-900 border-slate-800 h-full p-6">
                        <h3 className="text-lg font-semibold text-white mb-4">Узловая система</h3>
                        {selectedEntity ? (
                          <div className="space-y-4">
                            <div className="text-4xl text-center mb-2">{selectedEntity.sprite}</div>
                            <h4 className="font-semibold text-white text-center">{selectedEntity.name}</h4>
                            
                            <div className="space-y-2 pt-4 border-t border-slate-800">
                              <p className="text-xs text-slate-400 uppercase font-medium">Подключенные узлы:</p>
                              {selectedEntity.nodes.map((node) => (
                                <div key={node} className="bg-slate-950 border border-slate-800 rounded p-3 flex items-center justify-between">
                                  <span className="text-sm text-slate-300">{node}</span>
                                  <Icon name="Link" size={16} className="text-lime-500" />
                                </div>
                              ))}
                            </div>

                            <Button className="w-full bg-lime-500 hover:bg-lime-600 text-slate-950 mt-4">
                              <Icon name="Plus" size={16} className="mr-2" />
                              Добавить узел
                            </Button>
                          </div>
                        ) : (
                          <div className="text-center text-slate-500 py-12">
                            <Icon name="MousePointer" size={48} className="mx-auto mb-3 opacity-50" />
                            <p className="text-sm">Выберите объект</p>
                          </div>
                        )}
                      </Card>
                    </div>
                  </div>
                </>
              ) : (
                <div className="grid grid-cols-12 gap-6 h-[calc(100vh-250px)]">
                  <div className="col-span-9">
                    <Card className="bg-slate-900 border-slate-800 h-full p-6">
                      <div className="flex items-center justify-center h-full">
                        <div className="text-center">
                          <div className="text-6xl mb-4">🎮</div>
                          <p className="text-slate-400 mb-4">Выберите игру из раздела "Мои игры"</p>
                          <Button onClick={() => setActiveTab('games')} className="bg-lime-500 hover:bg-lime-600 text-slate-950">
                            <Icon name="Gamepad2" size={18} className="mr-2" />
                            Перейти к играм
                          </Button>
                        </div>
                      </div>
                    </Card>
                  </div>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Index;