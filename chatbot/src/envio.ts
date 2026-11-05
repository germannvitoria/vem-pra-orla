import type { Chat, Client, GroupChat } from 'whatsapp-web.js';
import { buscarResumo } from './backend.js';
import { config } from './config.js';
import { montarMensagem } from './mensagem.js';

const esperar = (ms: number) => new Promise((r) => setTimeout(r, ms));

function intervaloAleatorio(): number {
  const { intervaloMinMs: min, intervaloMaxMs: max } = config;
  return min + Math.random() * Math.max(0, max - min);
}

// Grupos em que o número ainda participa e consegue escrever.
export async function listarGruposAtivos(client: Client): Promise<GroupChat[]> {
  const meuId = client.info.wid._serialized;
  const chats: Chat[] = await client.getChats();

  return chats.filter((chat): chat is GroupChat => {
    if (!chat.isGroup || chat.isReadOnly) return false; // isReadOnly = saiu ou foi removido
    // groupMetadata existe em runtime, mas não está nas typings da biblioteca.
    const grupo = chat as GroupChat & { groupMetadata?: { announce?: boolean } };
    // Grupo "só admins enviam mensagens" e o bot não é admin: não adianta tentar.
    if (grupo.groupMetadata?.announce) {
      const eu = grupo.participants?.find((p) => p.id._serialized === meuId);
      if (!eu?.isAdmin && !eu?.isSuperAdmin) return false;
    }
    return true;
  });
}

let enviando = false;

export async function enviarParaTodosOsGrupos(client: Client): Promise<void> {
  if (enviando) {
    console.warn('[envio] já existe um envio em andamento, ignorando.');
    return;
  }
  enviando = true;
  try {
    // Busca o resumo uma única vez: todos os grupos recebem a mesma mensagem.
    const resumo = await buscarResumo();
    const mensagem = montarMensagem(resumo, config.fuso);

    const grupos = (await listarGruposAtivos(client)).filter(
      (g) => !config.gruposIgnorados.has(g.id._serialized),
    );
    console.log(`[envio] enviando para ${grupos.length} grupo(s)...`);

    let ok = 0;
    for (const [i, grupo] of grupos.entries()) {
      try {
        await grupo.sendStateTyping();
        await esperar(1500 + Math.random() * 1500);
        await grupo.sendMessage(mensagem);
        ok++;
        console.log(`[envio] ✔ ${grupo.name}`);
      } catch (erro) {
        // Um grupo com problema não impede os demais.
        console.error(`[envio] ✖ ${grupo.name} (${grupo.id._serialized}):`, erro);
      }
      if (i < grupos.length - 1) await esperar(intervaloAleatorio());
    }
    console.log(`[envio] concluído: ${ok}/${grupos.length} grupo(s).`);
  } catch (erro) {
    console.error('[envio] não foi possível obter o resumo do backend; nada foi enviado.', erro);
  } finally {
    enviando = false;
  }
}
