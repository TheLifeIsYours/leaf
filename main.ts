import { serveDir } from "jsr:@std/http@1/file-server";
import { SocketBase } from "./src/server/socket/Base.ts";

const port = 3000;

const base = new SocketBase();
Deno.serve({ port }, (req) => {
  if (req.headers.get("upgrade") != "websocket") {
    const pathname = new URL(req.url).pathname;

    if (pathname.startsWith("/")) {
      return serveDir(req, {
        fsRoot: "src/static",
      }).catch((e) => {
        console.error(e);
        return new Response("Internal server error", { status: 500 });
      });
    }

    return new Response("Not found", { status: 404 });
  }

  const { socket, response } = Deno.upgradeWebSocket(req);
  base.addListeners(socket);

  return response;
});
