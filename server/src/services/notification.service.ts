export interface WebhookPayload {
  title: string;
  projectName: string;
  targetUrl?: string;
  status: 'PASSED' | 'FAILED';
  highestSeverity: string;
  summary: string;
  details?: Record<string, unknown>;
}

export class NotificationService {
  /**
   * Envía un mensaje formateado a un webhook de Slack
   */
  public static async sendSlackAlert(webhookUrl: string, data: WebhookPayload): Promise<boolean> {
    const isSuccess = data.status === 'PASSED';
    const color = isSuccess ? '#22c55e' : '#ef4444';
    const emoji = isSuccess ? '✅' : '🚨';

    const payload = {
      attachments: [
        {
          color,
          blocks: [
            {
              type: 'header',
              text: {
                type: 'plain_text',
                text: `${emoji} QA-Sec Suite: Auditoría ${data.status}`,
                emoji: true,
              },
            },
            {
              type: 'section',
              fields: [
                { type: 'mrkdwn', text: `*Proyecto:*\n${data.projectName}` },
                { type: 'mrkdwn', text: `*Target:*\n${data.targetUrl || 'N/A'}` },
                { type: 'mrkdwn', text: `*Riesgo Máximo:*\n${data.highestSeverity}` },
                { type: 'mrkdwn', text: `*Resultado:*\n${data.status}` },
              ],
            },
            {
              type: 'section',
              text: {
                type: 'mrkdwn',
                text: `*Resumen:* ${data.summary}`,
              },
            },
          ],
        },
      ],
    };

    try {
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      return response.ok;
    } catch (error) {
      console.error('[!] Error enviando webhook a Slack:', error);
      return false;
    }
  }

  /**
   * Envía una tarjeta genérica (HTTP POST) para Microsoft Teams o SIEMs
   */
  public static async sendGenericWebhook(webhookUrl: string, data: WebhookPayload): Promise<boolean> {
    try {
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      return response.ok;
    } catch (error) {
      console.error('[!] Error enviando webhook genérico:', error);
      return false;
    }
  }
}