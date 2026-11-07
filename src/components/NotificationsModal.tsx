import React, { useState, useRef, useEffect } from 'react';
import {
  Bell,
  Heart,
  MessageCircle,
  UserPlus,
  DollarSign,
  Sparkles,
  Send,
  ArrowLeft,
  Check,
  CheckCheck,
  Search,
  Plus,
  Smile,
  Mic,
  Phone,
  Video,
  Image as ImageIcon,
  Eye,
  RefreshCw,
  Trash2,
  X,
  ChevronDown,
  ChevronUp,
  Layers,
} from 'lucide-react';
import { NotificationItem, UserProfile, StoryItem } from '../types';
import { StoriesBar } from './StoriesBar';

export interface ChatMessageItem {
  id: string;
  sender: 'me' | 'them';
  text: string;
  sticker?: string;
  isVoiceNote?: boolean;
  voiceDuration?: string;
  reaction?: string;
  seen?: boolean;
  time: string;
}

export interface DirectConversation {
  id: string;
  userId: string;
  name: string;
  handle: string;
  avatar: string;
  online: boolean;
  verified?: boolean;
  noteText?: string;
  statusText: string;
  lastTimestamp: string;
  unreadCount: number;
  messages: ChatMessageItem[];
}

const QUICK_CHAT_STICKERS = [
  { emoji: '🔥', label: 'Feu Viral' },
  { emoji: '😂', label: 'Trop Drôle' },
  { emoji: '💚', label: 'Vibe Validée' },
  { emoji: '👑', label: 'Légende' },
  { emoji: '🚀', label: 'Masterclass' },
  { emoji: '💎', label: 'Pépite' },
  { emoji: '🎉', label: 'Bravo !' },
  { emoji: '❤️', label: 'Love' },
];

const AUTO_REPLIES = [
  'Carrément !! Ta dernière vidéo tourne en boucle sur mon Pour Toi 🔥',
  'Merci beaucoup ! On fait un duo ou un LIVE ensemble très bientôt ? 🎬✨',
  'Haha j’adore la vibe ! Continue comme ça 👑',
  'Trop fort ! J’ai partagé ta vidéo à toute mon équipe 🚀',
  'Exactement ! Le nouveau filtre néon rend super bien sur TokVibe 💚',
];

const INITIAL_CONVERSATIONS: DirectConversation[] = [
  {
    id: 'conv-1',
    userId: 'creator-tokyo',
    name: 'Kenji Neo Tokyo',
    handle: 'kenjineo',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    online: true,
    verified: true,
    noteText: 'Dispo pour un LIVE 🌃',
    statusText: 'Avec plaisir ! L’étalonnage néon est incroyable.',
    lastTimestamp: 'Il y a 2 min',
    unreadCount: 0,
    messages: [
      {
        id: 'm-1',
        sender: 'them',
        text: 'Salut ! Merci pour le partage sur ma dernière vidéo cyberpunk à Tokyo 🔥',
        time: '10:42',
      },
      {
        id: 'm-2',
        sender: 'me',
        text: 'Avec plaisir ! L’étalonnage néon est incroyable.',
        seen: true,
        time: '10:45',
      },
    ],
  },
  {
    id: 'conv-2',
    userId: 'creator-dance',
    name: 'Sonia Martinez',
    handle: 'soniadance',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150',
    online: true,
    verified: true,
    noteText: 'Nouveau challenge 💃',
    statusText: 'Tu participes au nouveau défi danse ce week-end ? 🔥',
    lastTimestamp: 'Il y a 14 min',
    unreadCount: 2,
    messages: [
      {
        id: 'm-3',
        sender: 'them',
        text: 'Coucou ! J’ai vu que tu es passé sur mon profil 👀',
        time: '10:15',
      },
      {
        id: 'm-4',
        sender: 'them',
        text: 'Tu participes au nouveau défi danse ce week-end ? 🔥',
        time: '10:16',
      },
    ],
  },
  {
    id: 'conv-3',
    userId: 'creator-food',
    name: 'Chef Antoine Wok',
    handle: 'antoinewok',
    avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150',
    online: true,
    verified: true,
    noteText: 'Recette à 18h 🍜',
    statusText: 'J’ai testé ta recette de bouillon tonkotsu, un régal !',
    lastTimestamp: 'Il y a 1h',
    unreadCount: 0,
    messages: [
      {
        id: 'm-5',
        sender: 'me',
        text: 'J’ai testé ta recette de bouillon tonkotsu, un régal !',
        seen: true,
        time: 'Hier',
      },
      {
        id: 'm-6',
        sender: 'them',
        text: 'Bravo Chef ! Le secret c’est vraiment le feu très vif au wok 🔥🍜',
        time: 'Il y a 1h',
      },
    ],
  },
  {
    id: 'conv-4',
    userId: 'creator-drone',
    name: 'Lucas FPV Drone',
    handle: 'lucasfpv',
    avatar: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=150',
    online: false,
    verified: true,
    noteText: 'En tournage 4K 🦅',
    statusText: 'On se capte pour filmer des plans drones !',
    lastTimestamp: 'Hier',
    unreadCount: 1,
    messages: [
      {
        id: 'm-7',
        sender: 'them',
        text: 'On se capte pour filmer des plans drones !',
        time: 'Hier',
      },
    ],
  },
  {
    id: 'conv-5',
    userId: 'creator-streetart',
    name: 'Maya Neon Art',
    handle: 'mayaneon',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150',
    online: true,
    verified: true,
    noteText: 'Art UV ✨',
    statusText: 'Merci pour le soutien sur ma peinture fluorescente 🎨',
    lastTimestamp: 'Hier',
    unreadCount: 0,
    messages: [
      {
        id: 'm-8',
        sender: 'them',
        text: 'Merci pour le soutien sur ma peinture fluorescente 🎨',
        time: 'Hier',
      },
    ],
  },
];

interface NotificationsModalProps {
  notifications: NotificationItem[];
  currentUser?: UserProfile | null;
  liveChannels?: any[];
  onOpenLive?: (hostId?: string) => void;
  onClose: () => void;
  onSelectNotification?: (videoId?: string) => void;
  onOpenProfileVisitors?: () => void;
  onSimulatePush: () => void;
  stories: StoryItem[];
  onSelectStory: (story: StoryItem) => void;
  onCreateStory: () => void;
}

export const NotificationsModal: React.FC<NotificationsModalProps> = ({
  notifications,
  currentUser,
  liveChannels = [],
  onOpenLive,
  onSelectNotification,
  onOpenProfileVisitors,
  onSimulatePush,
  stories,
  onSelectStory,
  onCreateStory,
}) => {
  const [activeSection, setActiveSection] = useState<'messages' | 'notifications'>('messages');
  const [filter, setFilter] = useState<'all' | 'likes' | 'comments' | 'follows' | 'monetization'>('all');
  const [isGroupedByType, setIsGroupedByType] = useState<boolean>(true);
  const [expandedGroupTypes, setExpandedGroupTypes] = useState<Record<string, boolean>>({
    like: true,
    comment: false,
    follow: false,
    monetization: false,
  });
  const [followedBackSenders, setFollowedBackSenders] = useState<Record<string, boolean>>({});
  const [conversations, setConversations] = useState<DirectConversation[]>(INITIAL_CONVERSATIONS);
  const [activeConvId, setActiveConvId] = useState<string | null>(null);
  const [draftMessage, setDraftMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showStickerBar, setShowStickerBar] = useState(false);
  const [isTypingReply, setIsTypingReply] = useState(false);
  const [isRecordingVoice, setIsRecordingVoice] = useState(false);
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const [newContactName, setNewContactName] = useState('');
  const [newContactHandle, setNewContactHandle] = useState('');
  const [myNoteText, setMyNoteText] = useState('Dispo pour discuter 💬');
  const [isEditingNote, setIsEditingNote] = useState(false);
  const [activeCallMode, setActiveCallMode] = useState<'audio' | 'video' | null>(null);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const activeConversation = conversations.find((c) => c.id === activeConvId) || null;

  useEffect(() => {
    if (activeConvId) {
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 60);
    }
  }, [activeConvId, activeConversation?.messages.length, isTypingReply]);

  const [pushStatus, setPushStatus] = useState<NotificationPermission>(
    typeof window !== 'undefined' && 'Notification' in window
      ? Notification.permission
      : 'default'
  );

  const requestPushPermission = async () => {
    if ('Notification' in window) {
      try {
        const permission = await Notification.requestPermission();
        setPushStatus(permission);
        if (permission === 'granted') {
          new Notification('TOKVIBE Messages Activés !', {
            body: 'Vous recevrez les alertes de messages, likes et revenus en temps réel.',
            icon: '/favicon.ico',
          });
        }
      } catch (err) {
        console.warn('Notification permission error:', err);
      }
    }
  };

  const triggerSimulatedReply = (convId: string) => {
    setIsTypingReply(true);
    setTimeout(() => {
      const replyText = AUTO_REPLIES[Math.floor(Math.random() * AUTO_REPLIES.length)];
      const nowStr = new Date().toLocaleTimeString('fr-FR', {
        hour: '2-digit',
        minute: '2-digit',
      });
      setConversations((prev) =>
        prev.map((c) =>
          c.id === convId
            ? {
                ...c,
                statusText: replyText,
                lastTimestamp: "À l'instant",
                messages: [
                  ...c.messages,
                  {
                    id: 'msg-reply-' + Date.now(),
                    sender: 'them',
                    text: replyText,
                    time: nowStr,
                  },
                ],
              }
            : c
        )
      );
      setIsTypingReply(false);
    }, 1400);
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!draftMessage.trim() || !activeConversation) return;
    const text = draftMessage.trim();
    const targetConvId = activeConversation.id;
    setDraftMessage('');
    setShowStickerBar(false);

    const nowStr = new Date().toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit',
    });

    setConversations((prev) =>
      prev.map((c) =>
        c.id === targetConvId
          ? {
              ...c,
              statusText: `Vous : ${text}`,
              lastTimestamp: "À l'instant",
              unreadCount: 0,
              messages: [
                ...c.messages,
                {
                  id: 'msg-' + Date.now(),
                  sender: 'me',
                  text,
                  seen: true,
                  time: nowStr,
                },
              ],
            }
          : c
      )
    );

    triggerSimulatedReply(targetConvId);
  };

  const handleSendSticker = (emoji: string, label: string) => {
    if (!activeConversation) return;
    const targetConvId = activeConversation.id;
    const nowStr = new Date().toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit',
    });

    setConversations((prev) =>
      prev.map((c) =>
        c.id === targetConvId
          ? {
              ...c,
              statusText: `Vous avez envoyé un sticker ${emoji}`,
              lastTimestamp: "À l'instant",
              unreadCount: 0,
              messages: [
                ...c.messages,
                {
                  id: 'msg-stk-' + Date.now(),
                  sender: 'me',
                  text: `${emoji} ${label}`,
                  sticker: emoji,
                  seen: true,
                  time: nowStr,
                },
              ],
            }
          : c
      )
    );
    setShowStickerBar(false);
    triggerSimulatedReply(targetConvId);
  };

  const handleSendVoiceNote = () => {
    if (!activeConversation) return;
    if (!isRecordingVoice) {
      setIsRecordingVoice(true);
      return;
    }
    setIsRecordingVoice(false);
    const targetConvId = activeConversation.id;
    const nowStr = new Date().toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit',
    });

    setConversations((prev) =>
      prev.map((c) =>
        c.id === targetConvId
          ? {
              ...c,
              statusText: '🎤 Message vocal (0:06)',
              lastTimestamp: "À l'instant",
              unreadCount: 0,
              messages: [
                ...c.messages,
                {
                  id: 'msg-voice-' + Date.now(),
                  sender: 'me',
                  text: 'Message vocal TokVibe',
                  isVoiceNote: true,
                  voiceDuration: '0:06',
                  seen: true,
                  time: nowStr,
                },
              ],
            }
          : c
      )
    );
    triggerSimulatedReply(targetConvId);
  };

  const handleToggleMessageReaction = (msgId: string) => {
    if (!activeConversation) return;
    const reactions = ['❤️', '🔥', '😂', '👍'];
    setConversations((prev) =>
      prev.map((c) =>
        c.id === activeConversation.id
          ? {
              ...c,
              messages: c.messages.map((m) => {
                if (m.id !== msgId) return m;
                const nextIdx = m.reaction ? (reactions.indexOf(m.reaction) + 1) % (reactions.length + 1) : 0;
                return {
                  ...m,
                  reaction: nextIdx < reactions.length ? reactions[nextIdx] : undefined,
                };
              }),
            }
          : c
      )
    );
  };

  const handleCreateNewConversation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newContactName.trim()) return;
    const cleanHandle =
      newContactHandle.trim().replace(/^@/, '') ||
      newContactName.trim().toLowerCase().replace(/\s+/g, '_');

    const newConv: DirectConversation = {
      id: 'conv-' + Date.now(),
      userId: 'user-' + Date.now(),
      name: newContactName.trim(),
      handle: cleanHandle,
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      online: true,
      verified: true,
      statusText: 'Nouvelle conversation démarrée',
      lastTimestamp: "À l'instant",
      unreadCount: 0,
      messages: [
        {
          id: 'm-init-' + Date.now(),
          sender: 'them',
          text: `Salut ! Ravie d'échanger avec toi sur TokVibe ✨`,
          time: new Date().toLocaleTimeString('fr-FR', {
            hour: '2-digit',
            minute: '2-digit',
          }),
        },
      ],
    };

    setConversations((prev) => [newConv, ...prev]);
    setNewContactName('');
    setNewContactHandle('');
    setShowNewChatModal(false);
    setActiveConvId(newConv.id);
  };

  const filteredNotifications = notifications.filter((n) => {
    if (filter === 'all') return true;
    if (filter === 'likes') return n.type === 'like';
    if (filter === 'comments') return n.type === 'comment';
    if (filter === 'follows') return n.type === 'follow';
    if (filter === 'monetization') return n.type === 'monetization';
    return true;
  });

  // Group notifications by type (J'aime, Commentaires, Suivi, Monétisation)
  const notificationGroups = React.useMemo(() => {
    const order: Array<{
      type: NotificationItem['type'];
      label: string;
      badgeColor: string;
      borderColor: string;
    }> = [
      {
        type: 'like',
        label: "J'aime",
        badgeColor: 'bg-[#FE2C55]/20 text-[#FE2C55] border-[#FE2C55]/40',
        borderColor: 'border-[#FE2C55]/30',
      },
      {
        type: 'comment',
        label: 'Commentaires',
        badgeColor: 'bg-[#25F4EE]/20 text-[#25F4EE] border-[#25F4EE]/40',
        borderColor: 'border-[#25F4EE]/30',
      },
      {
        type: 'follow',
        label: 'Suivi & Abonnés',
        badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
        borderColor: 'border-purple-500/30',
      },
      {
        type: 'monetization',
        label: 'Monétisation',
        badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
        borderColor: 'border-emerald-500/30',
      },
    ];

    return order
      .map((meta) => {
        const items = filteredNotifications.filter((n) => n.type === meta.type);
        const unreadCount = items.filter((n) => !n.read).length;
        const uniqueSenders = Array.from(new Set(items.map((i) => i.senderName)));

        let summaryTitle = '';
        if (items.length === 1) {
          summaryTitle = `${items[0].senderName} ${items[0].text}`;
        } else if (items.length > 1) {
          const firstTwo = uniqueSenders.slice(0, 2).join(', ');
          const remainingCount = Math.max(0, items.length - 2);
          const othersSuffix =
            remainingCount > 0
              ? ` et ${remainingCount} autre${remainingCount > 1 ? 's' : ''}`
              : '';
          if (meta.type === 'like') {
            summaryTitle = `${firstTwo}${othersSuffix} ont aimé vos vidéos`;
          } else if (meta.type === 'comment') {
            summaryTitle = `${firstTwo}${othersSuffix} ont commenté vos publications`;
          } else if (meta.type === 'follow') {
            summaryTitle = `${firstTwo}${othersSuffix} ont commencé à vous suivre`;
          } else {
            summaryTitle = `${items.length} alertes de revenus crédités`;
          }
        }

        return {
          ...meta,
          items,
          unreadCount,
          summaryTitle,
          latestTimestamp: items[0]?.createdAt || '',
        };
      })
      .filter((g) => g.items.length > 0);
  }, [filteredNotifications]);

  const countsByType = React.useMemo(
    () => ({
      like: notifications.filter((n) => n.type === 'like').length,
      comment: notifications.filter((n) => n.type === 'comment').length,
      follow: notifications.filter((n) => n.type === 'follow').length,
      monetization: notifications.filter((n) => n.type === 'monetization').length,
    }),
    [notifications]
  );

  const toggleGroupExpand = (type: string) => {
    setExpandedGroupTypes((prev) => ({ ...prev, [type]: !prev[type] }));
  };

  const filteredConversations = conversations.filter(
    (c) =>
      searchQuery === '' ||
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.handle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.statusText.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalUnreadMessages = conversations.reduce((acc, c) => acc + c.unreadCount, 0);

  const getIcon = (type: NotificationItem['type']) => {
    switch (type) {
      case 'like':
        return <Heart className="w-3.5 h-3.5 fill-[#FE2C55] text-[#FE2C55]" />;
      case 'comment':
        return <MessageCircle className="w-3.5 h-3.5 fill-[#25F4EE] text-[#25F4EE]" />;
      case 'follow':
        return <UserPlus className="w-3.5 h-3.5 text-purple-400" />;
      case 'monetization':
        return <DollarSign className="w-3.5 h-3.5 text-emerald-400" />;
      default:
        return <Sparkles className="w-3.5 h-3.5 text-amber-400" />;
    }
  };

  // =====================================================================
  // ACTIVE CONVERSATION (FULL TokVibe DIRECT MESSAGE CHAT SCREEN)
  // =====================================================================
  if (activeConversation) {
    return (
      <div className="w-full h-full bg-black text-white flex flex-col overflow-hidden text-left relative">
        {/* Chat Top Bar */}
        <div className="px-3.5 py-3 bg-zinc-950 border-b border-white/10 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <button
              type="button"
              onClick={() => {
                setActiveConvId(null);
                setActiveCallMode(null);
              }}
              className="p-1.5 rounded-full bg-white/5 hover:bg-white/10 text-white transition shrink-0"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="relative shrink-0">
              <img
                src={activeConversation.avatar}
                alt={activeConversation.name}
                className="w-10 h-10 rounded-full object-cover border border-white/15"
              />
              {activeConversation.online && (
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-[#22c55e] ring-2 ring-black" />
              )}
            </div>
            <div className="min-w-0">
              <div className="text-sm font-extrabold text-white flex items-center gap-1 truncate">
                <span className="truncate">{activeConversation.name}</span>
                {activeConversation.verified && (
                  <span className="inline-flex items-center justify-center w-3.5 h-3.5 rounded-full bg-[#22c55e] text-black shrink-0">
                    <Check className="w-2.5 h-2.5 stroke-[3.5]" />
                  </span>
                )}
              </div>
              <span className="text-[10px] text-emerald-400 font-semibold block">
                {activeConversation.online
                  ? '● En ligne maintenant'
                  : `@${activeConversation.handle}`}
              </span>
            </div>
          </div>

          {/* Audio & Video Call Buttons */}
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={() => setActiveCallMode(activeCallMode === 'audio' ? null : 'audio')}
              title="Appel vocal"
              className={`p-2 rounded-full transition ${
                activeCallMode === 'audio'
                  ? 'bg-[#22c55e] text-black'
                  : 'bg-white/5 hover:bg-white/10 text-white/80'
              }`}
            >
              <Phone className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setActiveCallMode(activeCallMode === 'video' ? null : 'video')}
              title="Appel vidéo TokVibe"
              className={`p-2 rounded-full transition ${
                activeCallMode === 'video'
                  ? 'bg-[#25F4EE] text-black'
                  : 'bg-white/5 hover:bg-white/10 text-white/80'
              }`}
            >
              <Video className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Active Audio/Video Call Banner */}
        {activeCallMode && (
          <div className="px-4 py-2.5 bg-gradient-to-r from-[#2563eb] via-zinc-900 to-[#FE2C55] border-b border-white/15 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#4ade80] animate-ping" />
              <span className="text-xs font-black text-white">
                {activeCallMode === 'video' ? '📹 Appel vidéo en cours' : '📞 Appel vocal en cours'} avec{' '}
                {activeConversation.name}
              </span>
            </div>
            <button
              type="button"
              onClick={() => setActiveCallMode(null)}
              className="px-2.5 py-1 rounded-full bg-rose-600 text-white text-[10px] font-black"
            >
              Raccrocher
            </button>
          </div>
        )}

        {/* Messages Thread */}
        <div className="flex-1 overflow-y-auto no-scrollbar p-4 space-y-3">
          <div className="text-center py-2">
            <span className="px-3 py-1 rounded-full bg-zinc-900 text-white/45 text-[10px] font-semibold border border-white/5">
               Touchez un message pour ajouter une réaction ❤️ 🔥 😂
            </span>
          </div>

          {activeConversation.messages.map((m) => (
            <div
              key={m.id}
              onClick={() => handleToggleMessageReaction(m.id)}
              className={`flex flex-col cursor-pointer ${
                m.sender === 'me' ? 'items-end' : 'items-start'
              }`}
            >
              {m.sticker ? (
                <div className="relative px-4 py-3 rounded-3xl bg-zinc-900/90 border border-[#25F4EE]/40 flex flex-col items-center gap-1 shadow-lg">
                  <span className="text-4xl animate-bounce">{m.sticker}</span>
                  <span className="text-[10px] font-extrabold text-[#25F4EE]">{m.text}</span>
                  {m.reaction && (
                    <span className="absolute -bottom-2 right-2 px-1.5 py-0.2 rounded-full bg-zinc-800 border border-white/20 text-xs shadow">
                      {m.reaction}
                    </span>
                  )}
                </div>
              ) : m.isVoiceNote ? (
                <div className="relative px-4 py-2.5 rounded-2xl bg-gradient-to-r from-[#2563eb] to-[#25F4EE] text-black font-bold text-xs flex items-center gap-2.5 shadow-md">
                  <Mic className="w-4 h-4 fill-current" />
                  <div className="flex items-center gap-0.5">
                    {[10, 18, 12, 22, 16, 20, 14, 10, 18].map((h, idx) => (
                      <span
                        key={idx}
                        style={{ height: `${h}px` }}
                        className="w-1 rounded-full bg-black/75 inline-block"
                      />
                    ))}
                  </div>
                  <span className="text-[11px] font-black">{m.voiceDuration || '0:06'}</span>
                  {m.reaction && (
                    <span className="absolute -bottom-2 right-2 px-1.5 py-0.2 rounded-full bg-zinc-800 border border-white/20 text-xs text-white shadow">
                      {m.reaction}
                    </span>
                  )}
                </div>
              ) : (
                <div
                  className={`relative max-w-[78%] px-4 py-2.5 rounded-2xl text-xs leading-relaxed ${
                    m.sender === 'me'
                      ? 'bg-[#2563eb] text-white font-semibold rounded-br-sm shadow-[0_0_12px_rgba(37,99,235,0.4)]'
                      : 'bg-zinc-900 text-white border border-white/10 rounded-bl-sm'
                  }`}
                >
                  {m.text}
                  {m.reaction && (
                    <span className="absolute -bottom-2.5 right-2 px-1.5 py-0.2 rounded-full bg-zinc-800 border border-white/20 text-xs shadow">
                      {m.reaction}
                    </span>
                  )}
                </div>
              )}

              <div className="flex items-center gap-1 text-[10px] text-white/40 mt-1 px-1">
                <span>{m.sender === 'me' ? `Envoyé • ${m.time}` : m.time}</span>
                {m.sender === 'me' && m.seen && (
                  <CheckCheck className="w-3 h-3 text-[#25F4EE]" />
                )}
              </div>
            </div>
          ))}

          {isTypingReply && (
            <div className="flex items-center gap-2 text-xs text-white/50">
              <img
                src={activeConversation.avatar}
                alt={activeConversation.name}
                className="w-6 h-6 rounded-full object-cover"
              />
              <div className="px-3 py-2 rounded-2xl bg-zinc-900 border border-white/10 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#25F4EE] animate-bounce" />
                <span className="w-1.5 h-1.5 rounded-full bg-[#FE2C55] animate-bounce" />
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-bounce" />
                <span className="text-[10px] text-white/60 ml-1">écrit un message...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Sticker Quick Picker Drawer */}
        {showStickerBar && (
          <div className="px-3 py-2.5 bg-zinc-900/95 border-t border-white/10 flex items-center gap-2 overflow-x-auto no-scrollbar shrink-0">
            {QUICK_CHAT_STICKERS.map((st) => (
              <button
                key={st.label}
                type="button"
                onClick={() => handleSendSticker(st.emoji, st.label)}
                className="px-2.5 py-1.5 rounded-xl bg-black/60 hover:bg-white/10 border border-white/10 flex flex-col items-center shrink-0 transition active:scale-90"
              >
                <span className="text-xl">{st.emoji}</span>
                <span className="text-[9px] font-bold text-white/70 mt-0.5">{st.label}</span>
              </button>
            ))}
          </div>
        )}

        {/* Message Input Bar */}
        <form
          onSubmit={handleSendMessage}
          className="p-2.5 bg-zinc-950 border-t border-white/10 flex items-center gap-1.5 shrink-0 pb-20 sm:pb-3"
        >
          <button
            type="button"
            onClick={() => setShowStickerBar((v) => !v)}
            title="Envoyer un Sticker TokVibe"
            className={`p-2 rounded-full transition shrink-0 ${
              showStickerBar
                ? 'bg-[#25F4EE] text-black'
                : 'bg-zinc-900 text-white/70 hover:text-white border border-white/10'
            }`}
          >
            <Smile className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={handleSendVoiceNote}
            title="Envoyer un message vocal"
            className={`p-2 rounded-full transition shrink-0 ${
              isRecordingVoice
                ? 'bg-[#FE2C55] text-white animate-pulse'
                : 'bg-zinc-900 text-white/70 hover:text-white border border-white/10'
            }`}
          >
            <Mic className="w-4 h-4" />
          </button>

          <input
            type="text"
            value={draftMessage}
            onChange={(e) => setDraftMessage(e.target.value)}
            placeholder={
              isRecordingVoice
                ? 'Enregistrement vocal... Cliquez sur 🎤 pour envoyer'
                : `Écrire un message à @${activeConversation.handle}...`
            }
            className="flex-1 bg-zinc-900 border border-white/10 rounded-full px-4 py-2 text-xs text-white placeholder-white/40 focus:outline-none focus:border-[#25F4EE]"
          />

          <button
            type="submit"
            disabled={!draftMessage.trim()}
            className="w-9 h-9 rounded-full bg-gradient-to-r from-[#FE2C55] to-[#25F4EE] text-black font-black flex items-center justify-center disabled:opacity-30 transition active:scale-90 shrink-0 shadow-md"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    );
  }

  // =====================================================================
  // MAIN INBOX / MESSAGES LIST SCREEN
  // =====================================================================
  return (
    <div className="w-full h-full bg-black text-white flex flex-col overflow-y-auto no-scrollbar pb-24 text-left">
      {/* Top Header */}
      <div className="sticky top-0 z-30 bg-black/95 backdrop-blur-md px-4 pt-3.5 pb-2.5 border-b border-white/10">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-black text-white tracking-tight">Messages</h2>
            {totalUnreadMessages > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-[#FE2C55] text-white text-[10px] font-black">
                {totalUnreadMessages} non lus
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setShowNewChatModal(true)}
              className="text-[11px] font-extrabold px-2.5 py-1.5 rounded-full bg-[#2563eb] hover:bg-blue-500 text-white shadow-[0_0_10px_rgba(37,99,235,0.5)] active:scale-95 transition flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Nouveau</span>
            </button>
            <button
              onClick={onSimulatePush}
              className="text-[11px] font-bold px-2.5 py-1.5 rounded-full bg-zinc-900 hover:bg-zinc-800 text-[#25F4EE] border border-white/10 active:scale-95 transition flex items-center gap-1"
            >
              <Sparkles className="w-3 h-3" />
              <span>Alerte</span>
            </button>
          </div>
        </div>

        {/* Switcher: Messages Directs vs Activité */}
        <div className="flex rounded-xl bg-zinc-900 p-1 border border-white/5">
          <button
            type="button"
            onClick={() => setActiveSection('messages')}
            className={`flex-1 py-1.5 rounded-lg text-xs font-extrabold transition flex items-center justify-center gap-1.5 ${
              activeSection === 'messages'
                ? 'bg-white text-black shadow'
                : 'text-white/60 hover:text-white'
            }`}
          >
            <MessageCircle className="w-3.5 h-3.5" />
            <span>Messages directs ({conversations.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveSection('notifications')}
            className={`flex-1 py-1.5 rounded-lg text-xs font-extrabold transition flex items-center justify-center gap-1.5 ${
              activeSection === 'notifications'
                ? 'bg-white text-black shadow'
                : 'text-white/60 hover:text-white'
            }`}
          >
            <Bell className="w-3.5 h-3.5" />
            <span>Activité ({notifications.length})</span>
            {notifications.some((n) => !n.read) && (
              <span className="w-2 h-2 rounded-full bg-[#FE2C55]" />
            )}
          </button>
        </div>
      </div>

      {/* Stories / Status & Public LIVE Users Bar at the top of Inbox */}
      <div className="bg-black border-b border-white/5 py-1">
        <StoriesBar
          stories={stories}
          currentUser={currentUser || null}
          liveChannels={liveChannels}
          onOpenLive={onOpenLive}
          onSelectStory={onSelectStory}
          onCreateStory={onCreateStory}
        />
      </div>


      {/* Modal: Nouvelle conversation */}
      {showNewChatModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-xs bg-zinc-950 border border-white/15 rounded-3xl p-5 shadow-2xl space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-black text-white">Nouveau Message Direct</h3>
              <button
                type="button"
                onClick={() => setShowNewChatModal(false)}
                className="p-1 rounded-full bg-white/5 text-white/60 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleCreateNewConversation} className="space-y-3 text-xs">
              <div>
                <label className="text-white/60 block mb-1">Nom de l'ami ou créateur</label>
                <input
                  type="text"
                  required
                  value={newContactName}
                  onChange={(e) => setNewContactName(e.target.value)}
                  placeholder="Ex: Léa Vance"
                  className="w-full p-2.5 rounded-xl bg-zinc-900 border border-white/10 text-white focus:outline-none focus:border-[#25F4EE]"
                />
              </div>
              <div>
                <label className="text-white/60 block mb-1">Identifiant (@handle)</label>
                <input
                  type="text"
                  value={newContactHandle}
                  onChange={(e) => setNewContactHandle(e.target.value)}
                  placeholder="Ex: @lea_vance"
                  className="w-full p-2.5 rounded-xl bg-zinc-900 border border-white/10 text-white focus:outline-none focus:border-[#25F4EE]"
                />
              </div>
              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#2563eb] to-[#25F4EE] text-white font-black text-xs shadow-lg"
              >
                Démarrer la discussion
              </button>
            </form>
          </div>
        </div>
      )}

      {activeSection === 'messages' ? (
        <div className="flex-1 flex flex-col">
          {/* Top Stories / Notes En Ligne Strip (TokVibe Inbox Notes) */}
          <div className="px-4 pt-3 pb-2 border-b border-white/5">
            <div className="flex items-center gap-3.5 overflow-x-auto no-scrollbar pb-1">
              {/* Current User Note */}
              <button
                type="button"
                onClick={() => setIsEditingNote((v) => !v)}
                className="flex flex-col items-center shrink-0 w-16 text-center group"
              >
                <div className="relative">
                  <span className="px-1.5 py-0.5 rounded-lg bg-zinc-800 border border-white/15 text-[8px] font-bold text-[#25F4EE] block mb-1 truncate max-w-[64px]">
                    {myNoteText}
                  </span>
                  <div className="relative w-12 h-12 mx-auto">
                    <img
                      src={
                        currentUser?.photoURL ||
                        'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'
                      }
                      alt="Votre note"
                      className="w-12 h-12 rounded-full object-cover border-2 border-[#25F4EE]"
                    />
                    <span className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-[#25F4EE] text-black flex items-center justify-center font-black text-xs ring-2 ring-black">
                      +
                    </span>
                  </div>
                </div>
                <span className="text-[10px] font-bold text-white/80 mt-1 truncate w-full">
                  Votre note
                </span>
              </button>

              {/* Online Friends Notes */}
              {conversations.map((conv) => (
                <button
                  key={`note-${conv.id}`}
                  type="button"
                  onClick={() => {
                    setConversations((prev) =>
                      prev.map((c) => (c.id === conv.id ? { ...c, unreadCount: 0 } : c))
                    );
                    setActiveConvId(conv.id);
                  }}
                  className="flex flex-col items-center shrink-0 w-16 text-center group"
                >
                  <div className="relative">
                    {conv.noteText && (
                      <span className="px-1.5 py-0.5 rounded-lg bg-zinc-900 border border-white/10 text-[8px] font-semibold text-white/80 block mb-1 truncate max-w-[64px]">
                        {conv.noteText}
                      </span>
                    )}
                    <div className="relative w-12 h-12 mx-auto">
                      <img
                        src={conv.avatar}
                        alt={conv.name}
                        className="w-12 h-12 rounded-full object-cover border-2 border-emerald-400/70 group-hover:scale-105 transition"
                      />
                      {conv.online && (
                        <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-[#22c55e] ring-2 ring-black" />
                      )}
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-white/80 mt-1 truncate w-full">
                    {conv.name.split(' ')[0]}
                  </span>
                </button>
              ))}
            </div>

            {isEditingNote && (
              <div className="mt-2 flex items-center gap-1.5">
                <input
                  type="text"
                  value={myNoteText}
                  onChange={(e) => setMyNoteText(e.target.value)}
                  maxLength={28}
                  placeholder="Partager une pensée..."
                  className="flex-1 bg-zinc-900 border border-white/15 rounded-xl px-3 py-1.5 text-xs text-white"
                />
                <button
                  type="button"
                  onClick={() => setIsEditingNote(false)}
                  className="px-3 py-1.5 rounded-xl bg-[#25F4EE] text-black text-xs font-black"
                >
                  OK
                </button>
              </div>
            )}
          </div>

          {/* Search Bar */}
          <div className="px-4 py-2.5">
            <div className="relative flex items-center">
              <Search className="w-4 h-4 text-white/40 absolute left-3.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Rechercher un ami ou un message..."
                className="w-full bg-zinc-900/90 border border-white/10 rounded-xl py-2 pl-9 pr-4 text-xs text-white placeholder-white/40 focus:outline-none focus:border-[#25F4EE]"
              />
            </div>
          </div>

          {/* Quick Grouped Activity Categories Bar inside Inbox (J'aime, Commentaires, Suivi) */}
          <div className="px-2 mb-2 grid grid-cols-3 gap-1.5">
            <button
              type="button"
              onClick={() => {
                setActiveSection('notifications');
                setFilter('likes');
                setIsGroupedByType(true);
                setExpandedGroupTypes((prev) => ({ ...prev, like: true }));
              }}
              className="p-2.5 rounded-2xl bg-zinc-900/90 hover:bg-zinc-800 border border-[#FE2C55]/30 flex items-center gap-2 transition active:scale-95 cursor-pointer text-left"
            >
              <div className="w-8 h-8 rounded-full bg-[#FE2C55]/20 text-[#FE2C55] flex items-center justify-center shrink-0">
                <Heart className="w-4 h-4 fill-current" />
              </div>
              <div className="min-w-0">
                <span className="text-[11px] font-black text-white block truncate">J&apos;aime</span>
                <span className="text-[10px] text-[#FE2C55] font-bold block">
                  {countsByType.like} alertes
                </span>
              </div>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveSection('notifications');
                setFilter('comments');
                setIsGroupedByType(true);
                setExpandedGroupTypes((prev) => ({ ...prev, comment: true }));
              }}
              className="p-2.5 rounded-2xl bg-zinc-900/90 hover:bg-zinc-800 border border-[#25F4EE]/30 flex items-center gap-2 transition active:scale-95 cursor-pointer text-left"
            >
              <div className="w-8 h-8 rounded-full bg-[#25F4EE]/20 text-[#25F4EE] flex items-center justify-center shrink-0">
                <MessageCircle className="w-4 h-4 fill-current" />
              </div>
              <div className="min-w-0">
                <span className="text-[11px] font-black text-white block truncate">Commentaires</span>
                <span className="text-[10px] text-[#25F4EE] font-bold block">
                  {countsByType.comment} alertes
                </span>
              </div>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveSection('notifications');
                setFilter('follows');
                setIsGroupedByType(true);
                setExpandedGroupTypes((prev) => ({ ...prev, follow: true }));
              }}
              className="p-2.5 rounded-2xl bg-zinc-900/90 hover:bg-zinc-800 border border-purple-500/30 flex items-center gap-2 transition active:scale-95 cursor-pointer text-left"
            >
              <div className="w-8 h-8 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center shrink-0">
                <UserPlus className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <span className="text-[11px] font-black text-white block truncate">Suivi</span>
                <span className="text-[10px] text-purple-400 font-bold block">
                  {countsByType.follow} abonnés
                </span>
              </div>
            </button>
          </div>

          {/* TokVibe System Row: "Vues du profil" inside Inbox */}
          {onOpenProfileVisitors && (
            <div className="px-2 mb-1">
              <button
                type="button"
                onClick={onOpenProfileVisitors}
                className="w-full p-3 rounded-2xl bg-gradient-to-r from-[#2563eb]/20 via-zinc-900/80 to-zinc-900/40 border border-[#2563eb]/40 hover:border-[#25F4EE] transition flex items-center gap-3.5 text-left"
              >
                <div className="w-12 h-12 rounded-full bg-[#2563eb] text-white flex items-center justify-center shrink-0 shadow-[0_0_12px_rgba(37,99,235,0.6)]">
                  <Eye className="w-6 h-6" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-black text-white">Vues du profil</span>
                    <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-[#25F4EE] text-black">
                      +8 nouveaux
                    </span>
                  </div>
                  <p className="text-xs text-white/65 truncate mt-0.5">
                    Kenji Cyber, Sonia Martinez et 6 autres utilisateurs ont vu votre profil
                  </p>
                </div>
              </button>
            </div>
          )}

          {/* Direct Messages List */}
          <div className="divide-y divide-white/5 px-2">
            {filteredConversations.map((conv) => (
              <button
                key={conv.id}
                type="button"
                onClick={() => {
                  setConversations((prev) =>
                    prev.map((c) => (c.id === conv.id ? { ...c, unreadCount: 0 } : c))
                  );
                  setActiveConvId(conv.id);
                }}
                className="w-full p-3 rounded-2xl hover:bg-zinc-900/60 transition flex items-center gap-3.5 text-left active:scale-[0.99]"
              >
                <div className="relative shrink-0">
                  <img
                    src={conv.avatar}
                    alt={conv.name}
                    className="w-13 h-13 rounded-full object-cover border border-white/10"
                  />
                  {conv.online && (
                    <span className="absolute bottom-0.5 right-0.5 w-3 h-3 rounded-full bg-[#22c55e] ring-2 ring-black" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-bold text-white truncate flex items-center gap-1.5">
                      <span>{conv.name}</span>
                      {conv.verified && (
                        <span className="inline-flex items-center justify-center w-3.5 h-3.5 rounded-full bg-[#22c55e] text-black shrink-0">
                          <Check className="w-2.5 h-2.5 stroke-[3.5]" />
                        </span>
                      )}
                    </span>
                    <span className="text-[11px] text-white/40 shrink-0">
                      {conv.lastTimestamp}
                    </span>
                  </div>
                  <p
                    className={`text-xs mt-0.5 truncate ${
                      conv.unreadCount > 0
                        ? 'text-white font-extrabold'
                        : 'text-white/55 font-medium'
                    }`}
                  >
                    {conv.statusText}
                  </p>
                </div>

                {conv.unreadCount > 0 && (
                  <span className="px-2 py-0.5 rounded-full bg-[#FE2C55] text-white text-[10px] font-black shrink-0">
                    {conv.unreadCount}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      ) : (
        <>
          {/* Push Notification Banner */}
          {pushStatus !== 'granted' && (
            <div className="m-3 p-3.5 rounded-2xl bg-gradient-to-r from-zinc-900 to-zinc-800 border border-white/10 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#FE2C55]/20 text-[#FE2C55] flex items-center justify-center shrink-0">
                  <Bell className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xs font-bold text-white block">
                    Activer les notifications push
                  </span>
                  <p className="text-[10px] text-white/60 mt-0.5">
                    Ne manquez aucun message, nouveau follower ou virement.
                  </p>
                </div>
              </div>
              <button
                onClick={requestPushPermission}
                className="px-3 py-1.5 rounded-xl bg-[#FE2C55] text-white font-bold text-xs shrink-0 active:scale-95 transition shadow-md"
              >
                Activer
              </button>
            </div>
          )}

          {/* Filter Chips with Counts (Toutes, J'aime, Commentaires, Suivi, Monétisation) */}
          <div className="flex items-center gap-1.5 px-3 pt-2.5 pb-1.5 overflow-x-auto no-scrollbar">
            {[
              { id: 'all', label: `Toutes (${notifications.length})` },
              { id: 'likes', label: `J'aime (${countsByType.like})` },
              { id: 'comments', label: `Commentaires (${countsByType.comment})` },
              { id: 'follows', label: `Suivi (${countsByType.follow})` },
              { id: 'monetization', label: `Monétisation (${countsByType.monetization})` },
            ].map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setFilter(f.id as any)}
                className={`px-3 py-1.5 rounded-full text-xs font-extrabold whitespace-nowrap transition cursor-pointer ${
                  filter === f.id
                    ? 'bg-white text-black shadow'
                    : 'bg-zinc-900 text-white/65 hover:text-white border border-white/10'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Grouping Mode Toolbar */}
          <div className="px-3 py-2 flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={() => setIsGroupedByType((v) => !v)}
              className={`px-3 py-1.5 rounded-xl text-[11px] font-black flex items-center gap-1.5 border transition cursor-pointer ${
                isGroupedByType
                  ? 'bg-[#25F4EE]/15 text-[#25F4EE] border-[#25F4EE]/40'
                  : 'bg-zinc-900 text-white/70 border-white/10'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>
                {isGroupedByType
                  ? 'Mode Regroupé par Type Actif ✓'
                  : 'Activer le regroupement par type'}
              </span>
            </button>

            {isGroupedByType && (
              <button
                type="button"
                onClick={() => {
                  const allOpen =
                    expandedGroupTypes.like &&
                    expandedGroupTypes.comment &&
                    expandedGroupTypes.follow;
                  setExpandedGroupTypes({
                    like: !allOpen,
                    comment: !allOpen,
                    follow: !allOpen,
                    monetization: !allOpen,
                  });
                }}
                className="px-2.5 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-white/10 text-[11px] font-bold text-white/75 cursor-pointer"
              >
                {expandedGroupTypes.like &&
                expandedGroupTypes.comment &&
                expandedGroupTypes.follow
                  ? 'Tout replier'
                  : 'Tout déplier'}
              </button>
            )}
          </div>

          {/* Notification items: Grouped by Type (J'aime, Commentaires, Suivi) or Chronological */}
          <div className="px-3 space-y-3 pb-6">
            {filteredNotifications.length === 0 ? (
              <div className="py-16 text-center text-white/40">
                <Bell className="w-10 h-10 mx-auto mb-2 stroke-1" />
                <p className="text-xs">Aucune notification dans cette catégorie.</p>
              </div>
            ) : isGroupedByType ? (
              notificationGroups.map((group) => {
                const isExpanded = Boolean(expandedGroupTypes[group.type]);
                const previewAvatars = group.items.slice(0, 3);
                const extraCount = Math.max(0, group.items.length - 3);

                return (
                  <div
                    key={group.type}
                    className={`rounded-3xl bg-zinc-950 border ${group.borderColor} overflow-hidden shadow-lg transition`}
                  >
                    {/* Group Header (Summary Row) */}
                    <button
                      type="button"
                      onClick={() => toggleGroupExpand(group.type)}
                      className="w-full p-3.5 bg-zinc-900/80 hover:bg-zinc-900 transition flex items-center justify-between gap-3 text-left cursor-pointer"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        {/* Stacked Overlapping Avatars */}
                        <div className="relative flex items-center -space-x-2.5 shrink-0 pr-1">
                          {previewAvatars.map((notif, idx) => (
                            <img
                              key={notif.id}
                              src={notif.senderAvatar}
                              alt={notif.senderName}
                              style={{ zIndex: 10 - idx }}
                              className="w-10 h-10 rounded-full object-cover border-2 border-zinc-950 shadow"
                            />
                          ))}
                          {extraCount > 0 && (
                            <span
                              style={{ zIndex: 12 }}
                              className="w-8 h-8 rounded-full bg-zinc-800 border-2 border-zinc-950 text-[10px] font-black text-white flex items-center justify-center"
                            >
                              +{extraCount}
                            </span>
                          )}
                          <div
                            style={{ zIndex: 15 }}
                            className="absolute -bottom-1 right-0 w-5 h-5 rounded-full bg-zinc-950 border border-white/20 flex items-center justify-center shadow"
                          >
                            {getIcon(group.type)}
                          </div>
                        </div>

                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-black border ${group.badgeColor}`}
                            >
                              {group.label} ({group.items.length})
                            </span>
                            {group.unreadCount > 0 && (
                              <span className="px-2 py-0.5 rounded-full bg-[#FE2C55] text-white text-[9px] font-black">
                                {group.unreadCount} nouvelle{group.unreadCount > 1 ? 's' : ''}
                              </span>
                            )}
                          </div>
                          <p className="text-xs font-bold text-white mt-1 leading-snug line-clamp-2">
                            {group.summaryTitle}
                          </p>
                          <span className="text-[10px] text-white/45 block mt-0.5">
                            Dernière alerte : {group.latestTimestamp}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0 text-white/60">
                        {isExpanded ? (
                          <ChevronUp className="w-4 h-4 text-[#25F4EE]" />
                        ) : (
                          <ChevronDown className="w-4 h-4" />
                        )}
                      </div>
                    </button>

                    {/* Expanded Group Individual Notifications */}
                    {isExpanded && (
                      <div className="divide-y divide-white/5 bg-black/50 px-2 py-1">
                        {group.items.map((item) => {
                          const isFollowedBack = Boolean(followedBackSenders[item.id]);
                          return (
                            <div
                              key={item.id}
                              onClick={() => onSelectNotification?.(item.videoId)}
                              className="p-2.5 rounded-2xl hover:bg-zinc-900/70 transition cursor-pointer flex items-center justify-between gap-2.5"
                            >
                              <div className="flex items-center gap-2.5 min-w-0">
                                <div className="relative shrink-0">
                                  <img
                                    src={item.senderAvatar}
                                    alt={item.senderName}
                                    className="w-9 h-9 rounded-full object-cover border border-white/10"
                                  />
                                  <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-zinc-900 border border-white/20 flex items-center justify-center">
                                    {getIcon(item.type)}
                                  </div>
                                </div>

                                <div className="min-w-0">
                                  <div className="text-xs leading-snug">
                                    <span className="font-bold text-white mr-1.5">
                                      {item.senderName}
                                    </span>
                                    <span className="text-white/80">{item.text}</span>
                                  </div>
                                  <span className="text-[10px] text-white/40 mt-0.5 block">
                                    {item.createdAt}
                                  </span>
                                </div>
                              </div>

                              <div className="flex items-center gap-2 shrink-0">
                                {item.type === 'follow' && (
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setFollowedBackSenders((prev) => ({
                                        ...prev,
                                        [item.id]: !prev[item.id],
                                      }));
                                    }}
                                    data-keep-white={!isFollowedBack ? 'true' : undefined}
                                    className={`px-2.5 py-1 rounded-xl text-[10px] font-black transition cursor-pointer ${
                                      isFollowedBack
                                        ? 'bg-zinc-800 text-white/80 border border-white/15'
                                        : 'bg-[#FE2C55] text-white shadow'
                                    }`}
                                  >
                                    {isFollowedBack ? 'Abonné ✓' : 'Suivre en retour'}
                                  </button>
                                )}
                                {!item.read && (
                                  <div className="w-2 h-2 rounded-full bg-[#FE2C55] shrink-0" />
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })
            ) : (
              <div className="divide-y divide-white/5">
                {filteredNotifications.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => onSelectNotification?.(item.videoId)}
                    className="p-3 rounded-2xl hover:bg-zinc-900/60 transition cursor-pointer flex items-center gap-3 active:scale-98"
                  >
                    <div className="relative shrink-0">
                      <img
                        src={item.senderAvatar}
                        alt={item.senderName}
                        className="w-11 h-11 rounded-full object-cover border border-white/10"
                      />
                      <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-zinc-900 border border-white/20 flex items-center justify-center">
                        {getIcon(item.type)}
                      </div>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="text-xs leading-snug">
                        <span className="font-bold text-white mr-1.5">{item.senderName}</span>
                        <span className="text-white/80">{item.text}</span>
                      </div>
                      <span className="text-[10px] text-white/40 mt-1 block">
                        {item.createdAt}
                      </span>
                    </div>

                    {!item.read && (
                      <div className="w-2 h-2 rounded-full bg-[#FE2C55] shrink-0" />
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};
