import { prisma } from "@/lib/prisma";

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { id } = params;

  try {
    await prisma.chatbotInteraction.delete({
      where: { id },
    });

    return new Response(JSON.stringify({ message: "Chat deleted successfully 🚀" }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error: any) {
    if (error.code === 'P2025') {
      return new Response(JSON.stringify({ message: "Chat not found 🤷‍♂️" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }
    return new Response(JSON.stringify({ message: "Internal Server Error 💥" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
