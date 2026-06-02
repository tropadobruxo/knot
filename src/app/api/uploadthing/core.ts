import { createUploadthing, type FileRouter } from "uploadthing/next";
import { auth } from "@/lib/auth";

const f = createUploadthing();

export const ourFileRouter = {
  profilePhoto: f({
    image: {
      maxFileSize: "4MB",
      maxFileCount: 1,
    },
  })
    .middleware(async () => {
      const session = await auth();
      if (!session?.user) throw new Error("Não autenticado");
      return { userId: session.user.id };
    })
    .onUploadComplete(({ metadata, file }) => {
      return { url: file.ufsUrl, userId: metadata.userId };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
