import { useState } from 'react';
import { 
  Plus, 
  Calendar as CalendarIcon,
  Grid,
  Instagram,
  Facebook,
  Search,
  Filter,
  MoreVertical,
  Image as ImageIcon,
  Video,
  Link,
  Clock,
  MapPin,
  Users,
  X,
  Check
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Calendar } from '../components/social/Calendar';
import { format } from 'date-fns';
import type { Post, SocialAccount } from '../types/social';

interface SocialAccount {
  id: string;
  type: 'instagram' | 'facebook';
  name: string;
  username: string;
  avatar: string;
  isConnected: boolean;
}

interface Post {
  id: string;
  content: string;
  media: {
    type: 'image' | 'video' | 'carousel';
    urls: string[];
  }[];
  scheduledFor: string;
  platforms: ('instagram' | 'facebook')[];
  status: 'draft' | 'scheduled' | 'published' | 'failed';
  tags: string[];
  location?: string;
  mentions?: string[];
}

const dummyAccounts: SocialAccount[] = [
  {
    id: '1',
    type: 'instagram',
    name: 'Business Account',
    username: '@businessaccount',
    avatar: 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=100&h=100&fit=crop',
    isConnected: false
  },
  {
    id: '2',
    type: 'facebook',
    name: 'Business Page',
    username: 'Business Page',
    avatar: 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=100&h=100&fit=crop',
    isConnected: false
  }
];

const dummyPosts: Post[] = [
  {
    id: '1',
    content: '🌟 Exciting news! Check out our latest collection. #fashion #style',
    media: [
      {
        type: 'image',
        urls: ['https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=800&h=800&fit=crop']
      }
    ],
    scheduledFor: '2024-03-25T10:00:00Z',
    platforms: ['instagram', 'facebook'],
    status: 'scheduled',
    tags: ['fashion', 'style'],
    location: 'New York, NY'
  },
  {
    id: '2',
    content: '✨ Behind the scenes look at our creative process',
    media: [
      {
        type: 'carousel',
        urls: [
          'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=800&h=800&fit=crop',
          'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=800&h=800&fit=crop'
        ]
      }
    ],
    scheduledFor: '2024-03-26T15:30:00Z',
    platforms: ['instagram'],
    status: 'draft',
    tags: ['behindthescenes', 'creative']
  }
];

export function SocialMedia() {
  const [view, setView] = useState<'calendar' | 'grid'>('calendar');
  const [showConnectModal, setShowConnectModal] = useState(true);
  const [accounts, setAccounts] = useState<SocialAccount[]>(dummyAccounts);
  const [posts, setPosts] = useState<Post[]>(dummyPosts);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const handleConnect = (accountId: string) => {
    setAccounts(accounts.map(account =>
      account.id === accountId
        ? { ...account, isConnected: true }
        : account
    ));
  };

  const handleSelectPost = (post: Post) => {
    // Open edit modal
    console.log('Selected post:', post);
  };

  const handleSelectSlot = (start: Date) => {
    setSelectedDate(start);
    setShowCreateModal(true);
  };

  const handleMovePost = (post: Post, newDate: Date) => {
    setPosts(currentPosts =>
      currentPosts.map(p =>
        p.id === post.id
          ? { ...p, scheduledFor: newDate.toISOString() }
          : p
      )
    );
  };

  const anyAccountConnected = accounts.some(account => account.isConnected);

  if (!anyAccountConnected) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-3xl mx-auto px-4 py-12">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Connect Your Social Media Accounts
            </h1>
            <p className="text-lg text-gray-600 mb-8">
              To start planning and scheduling your content, connect your social media accounts first.
            </p>
            <div className="space-y-4">
              {accounts.map((account) => (
                <div
                  key={account.id}
                  className="bg-white rounded-lg shadow-sm border p-6 flex items-center justify-between"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center">
                      {account.type === 'instagram' ? (
                        <Instagram className="w-6 h-6 text-gray-600" />
                      ) : (
                        <Facebook className="w-6 h-6 text-gray-600" />
                      )}
                    </div>
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">
                        {account.name}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {account.username}
                      </p>
                    </div>
                  </div>
                  <Button onClick={() => handleConnect(account.id)}>
                    Connect Account
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b">
        <div className="p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">Social Media</h1>
              <p className="mt-1 text-sm text-gray-500">
                Plan and schedule your social media content
              </p>
            </div>
            <div className="flex items-center gap-2">
              <div className="bg-gray-100 rounded-lg p-1 flex items-center">
                <button
                  className={`p-1.5 rounded ${view === 'calendar' ? 'bg-white shadow' : 'hover:bg-white/50'}`}
                  onClick={() => setView('calendar')}
                  title="Vista Calendario"
                >
                  <CalendarIcon className="w-4 h-4" />
                </button>
                <button
                  className={`p-1.5 rounded ${view === 'grid' ? 'bg-white shadow' : 'hover:bg-white/50'}`}
                  onClick={() => setView('grid')}
                  title="Vista Cuadrícula"
                >
                  <Grid className="w-4 h-4" />
                </button>
              </div>
              <Button onClick={() => setShowCreateModal(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Nueva Publicación
              </Button>
            </div>
          </div>

          <div className="mt-4 flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="flex-1 relative max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar publicaciones..."
                className="w-full pl-10 pr-4 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-action focus:border-transparent"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button 
              variant={showFilters ? "default" : "outline"}
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="w-4 h-4 mr-2" />
              Filtros
            </Button>
          </div>

          {showFilters && (
            <div className="mt-4 p-4 bg-white rounded-lg border">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <select className="rounded-lg border-gray-300">
                  <option>Todas las plataformas</option>
                  <option>Instagram</option>
                  <option>Facebook</option>
                </select>
                <select className="rounded-lg border-gray-300">
                  <option>Todos los estados</option>
                  <option>Borrador</option>
                  <option>Programado</option>
                  <option>Publicado</option>
                </select>
                <select className="rounded-lg border-gray-300">
                  <option>Todas las fechas</option>
                  <option>Hoy</option>
                  <option>Esta semana</option>
                  <option>Este mes</option>
                </select>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Create Post Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl mx-4">
            <div className="p-4 border-b">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-medium text-gray-900">
                  Nueva Publicación
                </h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowCreateModal(false)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
            <div className="p-4">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Contenido
                    </label>
                    <textarea
                      rows={4}
                      className="w-full rounded-lg border-gray-300"
                      placeholder="Escribe tu publicación..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Hashtags
                    </label>
                    <input
                      type="text"
                      className="w-full rounded-lg border-gray-300"
                      placeholder="#hashtag"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Menciones
                    </label>
                    <input
                      type="text"
                      className="w-full rounded-lg border-gray-300"
                      placeholder="@usuario"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Ubicación
                    </label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        className="w-full pl-10 rounded-lg border-gray-300"
                        placeholder="Agregar ubicación"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Programación
                    </label>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="relative">
                        <CalendarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input
                          type="date"
                          className="w-full pl-10 rounded-lg border-gray-300"
                        />
                      </div>
                      <div className="relative">
                        <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input
                          type="time"
                          className="w-full pl-10 rounded-lg border-gray-300"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Plataformas
                    </label>
                    <div className="flex gap-2">
                      <label className="flex items-center gap-2 p-2 rounded-lg border hover:bg-gray-50 cursor-pointer">
                        <input type="checkbox" className="rounded border-gray-300" />
                        <Instagram className="w-4 h-4" />
                        <span className="text-sm">Instagram</span>
                      </label>
                      <label className="flex items-center gap-2 p-2 rounded-lg border hover:bg-gray-50 cursor-pointer">
                        <input type="checkbox" className="rounded border-gray-300" />
                        <Facebook className="w-4 h-4" />
                        <span className="text-sm">Facebook</span>
                      </label>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Multimedia
                    </label>
                    <div className="border-2 border-dashed rounded-lg p-8">
                      <div className="text-center">
                        <div className="flex justify-center mb-4">
                          <div className="p-3 rounded-full bg-gray-100">
                            <ImageIcon className="w-6 h-6 text-gray-600" />
                          </div>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">
                          Arrastra y suelta imágenes o videos aquí
                        </p>
                        <p className="text-xs text-gray-500 mb-4">
                          PNG, JPG, GIF hasta 10MB
                        </p>
                        <Button variant="outline" size="sm">
                          Seleccionar archivos
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Vista previa
                    </label>
                    <div className="aspect-square rounded-lg bg-gray-100 flex items-center justify-center">
                      <p className="text-sm text-gray-500">
                        La vista previa aparecerá aquí
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="p-4 border-t bg-gray-50 flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setShowCreateModal(false)}
              >
                Cancelar
              </Button>
              <Button>
                <Check className="w-4 h-4 mr-2" />
                Programar publicación
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="p-4 sm:p-6">
        {view === 'calendar' ? (
          <Calendar
            posts={posts}
            onSelectPost={handleSelectPost}
            onSelectSlot={handleSelectSlot}
            onMovePost={handleMovePost}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {posts.map((post) => (
              <div key={post.id} className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow">
                <div className="aspect-square relative">
                  {post.media[0] && (
                    <img
                      src={post.media[0].urls[0]}
                      alt=""
                      className="w-full h-full object-cover rounded-t-lg"
                    />
                  )}
                  <div className="absolute top-2 right-2">
                    <Button variant="ghost" size="sm" className="bg-white/90 hover:bg-white">
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="absolute bottom-2 left-2 flex gap-1">
                    {post.platforms.includes('instagram') && (
                      <div className="w-8 h-8 rounded-full bg-white/90 flex items-center justify-center">
                        <Instagram className="w-4 h-4" />
                      </div>
                    )}
                    {post.platforms.includes('facebook') && (
                      <div className="w-8 h-8 rounded-full bg-white/90 flex items-center justify-center">
                        <Facebook className="w-4 h-4" />
                      </div>
                    )}
                  </div>
                </div>
                <div className="p-4">
                  <p className="text-sm text-gray-900 mb-2">
                    {post.content}
                  </p>
                  <div className="flex flex-wrap gap-1 mb-3">
                    {post.tags.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {format(new Date(post.scheduledFor), 'MMM d, h:mm a')}
                    </div>
                    <span className={`
                      px-2 py-0.5 rounded-full text-xs font-medium
                      ${post.status === 'published' ? 'bg-green-100 text-green-800' :
                        post.status === 'scheduled' ? 'bg-blue-100 text-blue-800' :
                        post.status === 'draft' ? 'bg-gray-100 text-gray-800' :
                        'bg-red-100 text-red-800'}
                    `}>
                      {post.status.charAt(0).toUpperCase() + post.status.slice(1)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}