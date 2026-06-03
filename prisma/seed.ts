import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

const connectionString = process.env["DATABASE_URL"] ?? "";
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

const INTERESTS = [
  // Dinâmicas de poder
  { name: "Dominação", category: "Dinâmicas de poder" },
  { name: "Submissão", category: "Dinâmicas de poder" },
  { name: "Switch", category: "Dinâmicas de poder" },
  { name: "D/s 24/7", category: "Dinâmicas de poder" },
  { name: "Pet play", category: "Dinâmicas de poder" },
  { name: "Serviço", category: "Dinâmicas de poder" },

  // Práticas sensoriais
  { name: "Bondage (cordas)", category: "Práticas sensoriais" },
  { name: "Bondage (couro)", category: "Práticas sensoriais" },
  { name: "Impacto", category: "Práticas sensoriais" },
  { name: "Cera", category: "Práticas sensoriais" },
  { name: "Privação sensorial", category: "Práticas sensoriais" },
  { name: "Estimulação elétrica", category: "Práticas sensoriais" },

  // Fetiches
  { name: "Latex/borracha", category: "Fetiches" },
  { name: "Couro", category: "Fetiches" },
  { name: "Pés", category: "Fetiches" },
  { name: "Uniformes", category: "Fetiches" },
  { name: "Lingerie", category: "Fetiches" },

  // Role play
  { name: "Role play", category: "Role play" },
  { name: "Age play (adultos)", category: "Role play" },
  { name: "Cenários de fantasia", category: "Role play" },
  { name: "Primal play", category: "Role play" },

  // Práticas psicológicas
  { name: "Humilhação consensual", category: "Práticas psicológicas" },
  { name: "Controle", category: "Práticas psicológicas" },
  { name: "Tease & denial", category: "Práticas psicológicas" },
  { name: "Hipnose erótica", category: "Práticas psicológicas" },

  // Educação & comunidade
  { name: "Workshops", category: "Educação & comunidade" },
  { name: "Munches", category: "Educação & comunidade" },
  { name: "Mentoria", category: "Educação & comunidade" },
  { name: "Discussões", category: "Educação & comunidade" },
  { name: "Arte kink", category: "Educação & comunidade" },
];

async function main() {
  console.log("Seeding interests...");

  for (const interest of INTERESTS) {
    await prisma.interest.upsert({
      where: { name: interest.name },
      update: { category: interest.category },
      create: interest,
    });
  }

  console.log(`Seeded ${INTERESTS.length} interests.`);

  // Seed sample profiles with photos
  console.log("Seeding sample profiles...");

  const SAMPLE_PROFILES = [
    {
      username: "luna_rope",
      email: "luna@demo.knot.app",
      bio: "Artista de shibari, explorando conexões através de cordas e confiança. SP capital.",
      city: "São Paulo",
      roleType: "dom" as const,
      intent: ["relacionamento" as const, "aprender" as const],
      photos: ["adventurer", "avataaars", "bottts"],
    },
    {
      username: "kai_switch",
      email: "kai@demo.knot.app",
      bio: "Switch versátil, curto workshops e munches. Fotógrafo nas horas vagas.",
      city: "Rio de Janeiro",
      roleType: "switch" as const,
      intent: ["amizade" as const, "casual" as const],
      photos: ["adventurer", "avataaars", "micah", "bottts"],
    },
    {
      username: "selene_sub",
      email: "selene@demo.knot.app",
      bio: "Submissa, buscando dinâmica D/s com segurança e carinho. Adoro pet play.",
      city: "Belo Horizonte",
      roleType: "sub" as const,
      intent: ["relacionamento" as const],
      photos: ["adventurer", "micah"],
    },
    {
      username: "thor_dom",
      email: "thor@demo.knot.app",
      bio: "Dominante experiente, mentor de novos praticantes. Educação e consentimento sempre.",
      city: "São Paulo",
      roleType: "dom" as const,
      intent: ["aprender" as const, "amizade" as const],
      photos: ["avataaars", "bottts", "adventurer", "micah", "personas"],
    },
    {
      username: "iris_explore",
      email: "iris@demo.knot.app",
      bio: "Curiosa e recém-chegada ao universo kink. Aqui pra aprender sem julgamentos.",
      city: "Curitiba",
      roleType: "exploring" as const,
      intent: ["aprender" as const, "amizade" as const],
      photos: ["micah", "adventurer"],
    },
    {
      username: "fenix_primal",
      email: "fenix@demo.knot.app",
      bio: "Primal play e impacto. Adoro festas e eventos presenciais. Salvador representando.",
      city: "Salvador",
      roleType: "switch" as const,
      intent: ["casual" as const, "amizade" as const],
      photos: ["adventurer", "avataaars", "bottts"],
    },
    {
      username: "maya_rope",
      email: "maya@demo.knot.app",
      bio: "Rigger e modelo de shibari. Ensino bondage seguro para iniciantes.",
      city: "Porto Alegre",
      roleType: "dom" as const,
      intent: ["aprender" as const, "relacionamento" as const],
      photos: ["micah", "adventurer", "avataaars"],
    },
    {
      username: "neo_latex",
      email: "neo@demo.knot.app",
      bio: "Fetichista por latex e couro. Designer de moda alternativa.",
      city: "São Paulo",
      roleType: "sub" as const,
      intent: ["casual" as const],
      photos: ["bottts", "adventurer"],
    },
    {
      username: "akira_zen",
      email: "akira@demo.knot.app",
      bio: "Praticante de meditação e kink consciente. Busco conexões profundas.",
      city: "Florianópolis",
      roleType: "switch" as const,
      intent: ["relacionamento" as const, "amizade" as const],
      photos: ["avataaars", "micah", "adventurer"],
    },
    {
      username: "rebel_fire",
      email: "rebel@demo.knot.app",
      bio: "DJ e organizadora de festas kink-friendly. Recife vibes.",
      city: "Recife",
      roleType: "exploring" as const,
      intent: ["amizade" as const, "casual" as const],
      photos: ["adventurer", "personas", "micah", "avataaars"],
    },
  ];

  for (const profile of SAMPLE_PROFILES) {
    const user = await prisma.user.upsert({
      where: { username: profile.username },
      update: {},
      create: {
        username: profile.username,
        email: profile.email,
        bio: profile.bio,
        city: profile.city,
        roleType: profile.roleType,
        intent: profile.intent,
        ageVerified: true,
        ageVerifiedAt: new Date(),
        status: "active",
        lastActive: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
      },
    });

    // Create photos for the profile
    for (let i = 0; i < profile.photos.length; i++) {
      const style = profile.photos[i];
      const url = `https://api.dicebear.com/9.x/${style}/svg?seed=${profile.username}_${i}`;
      await prisma.photo.upsert({
        where: { id: `seed-${profile.username}-${i}` },
        update: { url, order: i },
        create: {
          id: `seed-${profile.username}-${i}`,
          userId: user.id,
          url,
          visibility: "public",
          verified: i === 0,
          order: i,
        },
      });
    }
  }

  console.log(`Seeded ${SAMPLE_PROFILES.length} sample profiles with photos.`);
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
