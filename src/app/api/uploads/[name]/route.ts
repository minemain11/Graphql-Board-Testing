import { readLocalImage } from "@/server/storage";

// (내 컴퓨터에서 실행할 때만) .local-data/uploads 에 저장된 이미지를 보여줍니다.
// 배포 환경에서는 이미지가 Vercel Blob 주소로 바로 열리기 때문에 쓰이지 않아요.
export async function GET(_request: Request, ctx: RouteContext<"/api/uploads/[name]">) {
  const { name } = await ctx.params;
  const image = await readLocalImage(name);
  if (!image) return new Response("Not Found", { status: 404 });

  return new Response(new Uint8Array(image.bytes), {
    headers: {
      "Content-Type": image.contentType,
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
