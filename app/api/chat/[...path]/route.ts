import { env } from 'cloudflare:workers';
import { handleChat } from '../../../../server/chat.mjs';
export const dynamic = 'force-dynamic';
export function GET(request:Request){return handleChat(request,env.DB)}
export function POST(request:Request){return handleChat(request,env.DB)}
