// Demo data for preview mode (no database required)

export const DEMO_PROFILES = [
  {
    id: "demo-1",
    username: "luna_dom",
    bio: "Dominante experiente, 5 anos na cena. Adoro cordas e poder. Buscando conexões autênticas com quem respeita limites.",
    city: "São Paulo",
    roleType: "dom",
    intent: ["relacionamento", "aprender"],
    photo: "https://api.dicebear.com/9.x/avataaars/svg?seed=Luna&backgroundColor=b6e3f4",
  },
  {
    id: "demo-2",
    username: "kai_switch",
    bio: "Switch versátil, curioso por natureza. Workshops são minha paixão. Vamos conversar sobre dinâmicas?",
    city: "Rio de Janeiro",
    roleType: "switch",
    intent: ["amizade", "aprender"],
    photo: "https://api.dicebear.com/9.x/avataaars/svg?seed=Kai&backgroundColor=c0aede",
  },
  {
    id: "demo-3",
    username: "velvet_sub",
    bio: "Submissa, poeta, amante de rituais. Acredito que vulnerabilidade é força. Buscando dom que valorize comunicação.",
    city: "Belo Horizonte",
    roleType: "sub",
    intent: ["relacionamento"],
    photo: "https://api.dicebear.com/9.x/avataaars/svg?seed=Velvet&backgroundColor=ffd5dc",
  },
  {
    id: "demo-4",
    username: "storm_exploring",
    bio: "Novo na cena, mente aberta. Quero aprender com segurança e sem julgamento. Me recomendem workshops!",
    city: "Curitiba",
    roleType: "exploring",
    intent: ["aprender", "amizade"],
    photo: "https://api.dicebear.com/9.x/avataaars/svg?seed=Storm&backgroundColor=d1f4d1",
  },
  {
    id: "demo-5",
    username: "raven_dom",
    bio: "Dominante sensorial. Especialidade: privação de sentidos e cera. 8 anos de experiência, DM aberto para dúvidas.",
    city: "São Paulo",
    roleType: "dom",
    intent: ["casual", "amizade"],
    photo: "https://api.dicebear.com/9.x/avataaars/svg?seed=Raven&backgroundColor=ffdfbf",
  },
  {
    id: "demo-6",
    username: "jade_switch",
    bio: "Switch que adora festas e munches. Organizadora do Munch SP. Venha conhecer a comunidade pessoalmente!",
    city: "São Paulo",
    roleType: "switch",
    intent: ["amizade", "casual"],
    photo: "https://api.dicebear.com/9.x/avataaars/svg?seed=Jade&backgroundColor=b6e3f4",
  },
];

export const DEMO_EVENTS = [
  {
    id: "evt-1",
    type: "munch",
    title: "Munch SP — Encontro mensal",
    city: "São Paulo",
    datetime: new Date(Date.now() + 7 * 86400000).toISOString(),
    priceCents: 0,
    capacity: 30,
    rsvpCount: 18,
    description: "Encontro casual em restaurante para conversar sobre a cena. Ambiente seguro, sem dress code. Venha como você é!",
    safetyInfo: "Local público, equipe de segurança presente. Código de conduta obrigatório.",
    organizer: { username: "jade_switch", organizer: { verified: true } },
  },
  {
    id: "evt-2",
    type: "workshop",
    title: "Workshop: Introdução a Shibari",
    city: "Rio de Janeiro",
    datetime: new Date(Date.now() + 14 * 86400000).toISOString(),
    priceCents: 8000,
    capacity: 15,
    rsvpCount: 12,
    description: "Aprenda os fundamentos do Shibari japonês com instrutora certificada. Cordas fornecidas. Nível: iniciante.",
    safetyInfo: "Tesoura de segurança disponível. Safeword universal: VERMELHO.",
    organizer: { username: "luna_dom", organizer: { verified: true } },
  },
  {
    id: "evt-3",
    type: "festa",
    title: "Noite Fetish — Masquerade",
    city: "São Paulo",
    datetime: new Date(Date.now() + 21 * 86400000).toISOString(),
    priceCents: 15000,
    capacity: 100,
    rsvpCount: 67,
    description: "Festa temática com dress code fetish. Áreas de play supervisionadas, lounge social e pista de dança.",
    safetyInfo: "DMs (Dungeon Monitors) em todas as áreas. Consentimento verificado antes de qualquer cena.",
    organizer: { username: "raven_dom", organizer: { verified: true } },
  },
];

export const DEMO_GROUPS = [
  {
    id: "grp-1",
    name: "Shibari Brasil",
    description: "Comunidade para praticantes e aprendizes de bondage japonês. Compartilhe técnicas, dúvidas e experiências.",
    city: "Nacional",
    moderated: true,
    memberCount: 234,
    postCount: 89,
  },
  {
    id: "grp-2",
    name: "Submissas SP",
    description: "Espaço seguro para submissas trocarem experiências, pedirem conselhos e se apoiarem mutuamente.",
    city: "São Paulo",
    moderated: true,
    memberCount: 156,
    postCount: 312,
  },
  {
    id: "grp-3",
    name: "Novatos na Cena",
    description: "Grupo acolhedor para quem está começando. Perguntas básicas são bem-vindas! Zero julgamento.",
    city: "Nacional",
    moderated: true,
    memberCount: 891,
    postCount: 1205,
  },
  {
    id: "grp-4",
    name: "Leather & Fetish RJ",
    description: "Comunidade leather do Rio de Janeiro. Eventos, encontros e cultura leather.",
    city: "Rio de Janeiro",
    moderated: false,
    memberCount: 78,
    postCount: 45,
  },
];

export const DEMO_MATCHES = [
  {
    matchId: "match-1",
    conversationId: "conv-1",
    createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
    user: { id: "demo-2", username: "kai_switch", image: null },
  },
  {
    matchId: "match-2",
    conversationId: "conv-2",
    createdAt: new Date(Date.now() - 5 * 86400000).toISOString(),
    user: { id: "demo-3", username: "velvet_sub", image: null },
  },
];

export const DEMO_MESSAGES = [
  {
    id: "msg-1",
    content: "Oi! Vi que você também curte workshops de shibari. Vai no próximo do RJ?",
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    senderId: "demo-2",
    sender: { username: "kai_switch" },
  },
  {
    id: "msg-2",
    content: "Oii! Tô pensando em ir sim! Você já fez algum curso antes?",
    createdAt: new Date(Date.now() - 80000000).toISOString(),
    senderId: "demo-me",
    sender: { username: "você" },
  },
  {
    id: "msg-3",
    content: "Fiz um intensivo ano passado, foi incrível. Posso te contar mais no munch de sábado se quiser 😊",
    createdAt: new Date(Date.now() - 70000000).toISOString(),
    senderId: "demo-2",
    sender: { username: "kai_switch" },
  },
];

export function isDemoMode(): boolean {
  return typeof window !== "undefined";
}
