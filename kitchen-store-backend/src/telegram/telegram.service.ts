// import { Injectable, Logger } from '@nestjs/common';
// import fetch from 'node-fetch';
// import { HttpsProxyAgent } from 'https-proxy-agent';

// @Injectable()
// export class TelegramService {
//   private readonly logger = new Logger(TelegramService.name);
//   private readonly token = process.env.TELEGRAM_BOT_TOKEN;
//   private readonly chatId = process.env.TELEGRAM_CHAT_ID;
//   private readonly proxyUrl = process.env.HTTPS_PROXY || process.env.https_proxy;

//   async sendMessage(text: string): Promise<void> {
//     if (!this.token || !this.chatId) {
//       this.logger.warn('TELEGRAM_BOT_TOKEN или TELEGRAM_CHAT_ID не заданы');
//       return;
//     }

//     try {
//       const agent = this.proxyUrl ? new HttpsProxyAgent(this.proxyUrl) : undefined;

//       const res = await fetch(
//         `https://api.telegram.org/bot${this.token}/sendMessage`,
//         {
//           method: 'POST',
//           headers: { 'Content-Type': 'application/json' },
//           body: JSON.stringify({
//             chat_id: this.chatId,
//             text,
//             parse_mode: 'HTML',
//           }),
//           agent,
//         },
//       );
//       if (!res.ok) {
//         const body = await res.text();
//         this.logger.error(`Telegram API error: ${body}`);
//       }
//     } catch (err) {
//       this.logger.error('Ошибка отправки Telegram-сообщения', err);
//     }
//   }
// }
