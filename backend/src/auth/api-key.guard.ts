import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { timingSafeEqual } from 'node:crypto';

// Protege rotas usadas por serviços internos (ex.: o bot de WhatsApp),
// que se identificam pelo header "x-api-key" em vez de um usuário logado.
@Injectable()
export class ApiKeyGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const esperado = process.env.BOT_API_KEY;
    if (!esperado) {
      throw new UnauthorizedException('BOT_API_KEY não configurada no backend');
    }

    const request = context.switchToHttp().getRequest();
    const recebido = request.headers['x-api-key'];
    if (typeof recebido !== 'string') {
      throw new UnauthorizedException('Chave de API não fornecida');
    }

    const a = Buffer.from(recebido);
    const b = Buffer.from(esperado);
    if (a.length !== b.length || !timingSafeEqual(a, b)) {
      throw new UnauthorizedException('Chave de API inválida');
    }
    return true;
  }
}
