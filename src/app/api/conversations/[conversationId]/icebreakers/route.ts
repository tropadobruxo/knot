import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

const GENERIC_ICEBREAKERS = [
  "Qual foi a experiencia mais marcante que voce ja teve na comunidade?",
  "Tem algum limite que voce descobriu recentemente?",
  "O que te trouxe pro universo kink?",
  "Qual evento voce mais gostou de participar?",
  "Tem algum fetiche que voce quer explorar mas nunca teve oportunidade?",
];

const INTEREST_TEMPLATES: Record<string, string[]> = {
  shibari: [
    "Vi que voce curte shibari! Qual estilo voce prefere — suspensao ou chao?",
    "Shibari e lindo. Voce pratica mais como rigger ou modelo?",
  ],
  "d/s": [
    "Como voce descobriu que curtia dinamicas D/s?",
    "Qual aspecto do D/s voce acha mais importante — confianca ou entrega?",
  ],
  "impact play": [
    "Impact play pode ser tao diverso. Voce tem preferencia por algum implemento?",
    "Qual nivel de intensidade voce curte em impact play?",
  ],
  roleplay: [
    "Roleplay e muito criativo! Qual cenario voce mais curte?",
    "Voce gosta mais de improvisar ou de planejar as cenas?",
  ],
  "sensory play": [
    "Jogo sensorial e fascinante. Cera, gelo ou vendas — qual seu favorito?",
    "Qual sensacao voce acha mais intensa em sensory play?",
  ],
  "latex/leather": [
    "Latex ou couro — qual dos dois te atrai mais?",
    "Voce usa materiais no dia a dia ou so em cenas?",
  ],
  "pet play": [
    "Pet play e uma dinamica linda. Qual animal voce se identifica?",
    "O que mais te atrai no pet play — a entrega ou a estética?",
  ],
  exhibitionism: [
    "Voce prefere festas ou contextos mais intimos?",
    "O que te atrai no exibicionismo — a adrenalina ou a conexao?",
  ],
};

const ROLE_TEMPLATES: Record<string, Record<string, string[]>> = {
  dom: {
    sub: ["Como voce gosta de negociar uma cena? Prefere conversar antes ou ir sentindo?"],
    switch: ["Voce alterna papeis com frequencia? Como decide quando trocar?"],
  },
  sub: {
    dom: ["O que voce mais valoriza num(a) dominante?"],
    switch: ["Voce ja experimentou trocar de papel? Como foi?"],
  },
  switch: {
    dom: ["Ser switch deve dar uma perspectiva unica. O que voce mais curte de cada lado?"],
    sub: ["Como switch, voce prefere um papel ou o outro depende da pessoa?"],
  },
};

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ conversationId: string }> },
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Nao autenticado." }, { status: 401 });
  }

  const { conversationId } = await params;
  const userId = session.user.id;

  const conversation = await prisma.conversation.findUnique({
    where: { id: conversationId },
    select: {
      match: {
        select: {
          userAId: true,
          userBId: true,
        },
      },
    },
  });

  if (!conversation) {
    return NextResponse.json({ error: "Conversa nao encontrada." }, { status: 404 });
  }

  const { match } = conversation;
  if (match.userAId !== userId && match.userBId !== userId) {
    return NextResponse.json({ error: "Sem permissao." }, { status: 403 });
  }

  const otherId = match.userAId === userId ? match.userBId : match.userAId;

  // Fetch both users' interests and roles
  const [me, other] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: {
        roleType: true,
        interests: { select: { interest: { select: { name: true } } } },
      },
    }),
    prisma.user.findUnique({
      where: { id: otherId },
      select: {
        roleType: true,
        interests: { select: { interest: { select: { name: true } } } },
      },
    }),
  ]);

  const suggestions: string[] = [];

  // Find shared interests and generate relevant icebreakers
  if (me && other) {
    const myInterests = new Set(me.interests.map((i) => i.interest.name.toLowerCase()));
    const theirInterests = other.interests.map((i) => i.interest.name.toLowerCase());

    for (const interest of theirInterests) {
      if (myInterests.has(interest)) {
        const templates = INTEREST_TEMPLATES[interest];
        if (templates) {
          suggestions.push(templates[Math.floor(Math.random() * templates.length)]!);
        }
      }
    }

    // Role-based icebreaker
    if (me.roleType && other.roleType) {
      const roleTemplates = ROLE_TEMPLATES[me.roleType]?.[other.roleType];
      if (roleTemplates) {
        suggestions.push(roleTemplates[Math.floor(Math.random() * roleTemplates.length)]!);
      }
    }
  }

  // Fill with generic if not enough
  const shuffled = [...GENERIC_ICEBREAKERS].sort(() => Math.random() - 0.5);
  while (suggestions.length < 3 && shuffled.length > 0) {
    suggestions.push(shuffled.pop()!);
  }

  return NextResponse.json({ suggestions: suggestions.slice(0, 3) });
}
