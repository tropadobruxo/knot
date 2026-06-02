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
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
