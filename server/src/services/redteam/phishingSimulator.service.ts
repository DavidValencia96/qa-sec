import type { PhishingTemplate } from '../../modules/redteam/redteam.types.js';

export class PhishingSimulatorService {
  private templates: PhishingTemplate[] = [
    {
      id: 'phish-reset-password',
      title: 'Actualización Urgente de Contraseña Corporativa',
      subject: '⚠️ Alerta de Seguridad: Restablecimiento obligatorio de credenciales',
      senderName: 'Soporte TI Corporativo',
      senderEmail: 'no-reply@security-auth-update.com',
      bodyHtml: '<p>Estimado usuario, se ha detectado un intento de acceso no autorizado. Por favor verifique su cuenta inmediatamente.</p>',
    },
    {
      id: 'phish-invoice-review',
      title: 'Factura Pendiente de Pago - Departamento Contable',
      subject: '📄 Factura Nro #84920 Vencida - Acción Requerida',
      senderName: 'Departamento de Facturación',
      senderEmail: 'billing@finance-partner-portal.com',
      bodyHtml: '<p>Adjunto encontrará la factura pendiente. Inicie sesión para revisar los detalles del pago.</p>',
    },
  ];

  public getTemplates(): PhishingTemplate[] {
    return this.templates;
  }

  public simulateCampaign(targetEmails: string[]): { simulatedCount: number } {
    // Simula la preparación y envío de la campaña de concienciación
    return {
      simulatedCount: targetEmails.length,
    };
  }
}