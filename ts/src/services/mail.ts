import { Client } from "@microsoft/microsoft-graph-client";
import { ClientSecretCredential } from "@azure/identity";
import {
  TokenCredentialAuthenticationProvider,
  type TokenCredentialAuthenticationProviderOptions,
} from "@microsoft/microsoft-graph-client/authProviders/azureTokenCredentials";

// ============================================
// TYPES
// ============================================

export interface SendMailParams {
  to: string | string[];
  subject: string;
  body: string;
  html?: boolean;
  cc?: string | string[];
  bcc?: string | string[];
  replyTo?: string;
  attachments?: Array<{
    name: string;
    contentType: string;
    content: string; // base64
  }>;
}

// ============================================
// CLIENT SETUP
// ============================================

let graphClient: Client | null = null;

function getGraphClient(): Client {
  if (graphClient) return graphClient;

  const tenantId = process.env.MSGRAPH_TENANT_ID;
  const clientId = process.env.MSGRAPH_CLIENT_ID;
  const clientSecret = process.env.MSGRAPH_CLIENT_SECRET;

  if (!tenantId || !clientId || !clientSecret) {
    throw new Error(
      "MS Graph credentials not configured. Set MSGRAPH_TENANT_ID, MSGRAPH_CLIENT_ID, MSGRAPH_CLIENT_SECRET"
    );
  }

  const credential = new ClientSecretCredential(tenantId, clientId, clientSecret);

  const authProvider = new TokenCredentialAuthenticationProvider(credential, {
    scopes: ["https://graph.microsoft.com/.default"],
  } as TokenCredentialAuthenticationProviderOptions);

  graphClient = Client.initWithMiddleware({ authProvider });
  return graphClient;
}

// ============================================
// SEND MAIL
// ============================================

export async function sendMail(params: SendMailParams): Promise<void> {
  const senderEmail = process.env.MSGRAPH_SENDER_EMAIL;
  if (!senderEmail) {
    throw new Error("MSGRAPH_SENDER_EMAIL not configured");
  }

  const client = getGraphClient();

  const toRecipients = Array.isArray(params.to) ? params.to : [params.to];
  const ccRecipients = params.cc
    ? Array.isArray(params.cc)
      ? params.cc
      : [params.cc]
    : [];
  const bccRecipients = params.bcc
    ? Array.isArray(params.bcc)
      ? params.bcc
      : [params.bcc]
    : [];

  const message: Record<string, unknown> = {
    subject: params.subject,
    body: {
      contentType: params.html ? "HTML" : "Text",
      content: params.body,
    },
    toRecipients: toRecipients.map((email) => ({
      emailAddress: { address: email },
    })),
  };

  if (ccRecipients.length > 0) {
    message.ccRecipients = ccRecipients.map((email) => ({
      emailAddress: { address: email },
    }));
  }

  if (bccRecipients.length > 0) {
    message.bccRecipients = bccRecipients.map((email) => ({
      emailAddress: { address: email },
    }));
  }

  if (params.replyTo) {
    message.replyTo = [{ emailAddress: { address: params.replyTo } }];
  }

  if (params.attachments && params.attachments.length > 0) {
    message.attachments = params.attachments.map((att) => ({
      "@odata.type": "#microsoft.graph.fileAttachment",
      name: att.name,
      contentType: att.contentType,
      contentBytes: att.content,
    }));
  }

  await client.api(`/users/${senderEmail}/sendMail`).post({
    message,
    saveToSentItems: true,
  });
}

// ============================================
// CONVENIENCE FUNCTIONS
// ============================================

export async function sendNotificationEmail(
  to: string,
  subject: string,
  body: string
): Promise<void> {
  await sendMail({
    to,
    subject: `[OpenProject] ${subject}`,
    body,
    html: true,
  });
}

export async function sendTaskAssignedEmail(
  to: string,
  taskTitle: string,
  projectName: string,
  assignerName: string,
  taskUrl: string
): Promise<void> {
  const body = `
    <div style="font-family: sans-serif; max-width: 600px;">
      <h2>You've been assigned a task</h2>
      <p><strong>${assignerName}</strong> assigned you to:</p>
      <div style="background: #f5f5f5; padding: 16px; border-radius: 8px; margin: 16px 0;">
        <h3 style="margin: 0 0 8px 0;">${taskTitle}</h3>
        <p style="margin: 0; color: #666;">in ${projectName}</p>
      </div>
      <a href="${taskUrl}" style="display: inline-block; background: #0066cc; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">
        View Task
      </a>
    </div>
  `;

  await sendMail({
    to,
    subject: `Task assigned: ${taskTitle}`,
    body,
    html: true,
  });
}

export async function sendCommentNotificationEmail(
  to: string,
  taskTitle: string,
  commenterName: string,
  commentPreview: string,
  taskUrl: string
): Promise<void> {
  const body = `
    <div style="font-family: sans-serif; max-width: 600px;">
      <h2>New comment on your task</h2>
      <p><strong>${commenterName}</strong> commented on <strong>${taskTitle}</strong>:</p>
      <div style="background: #f5f5f5; padding: 16px; border-radius: 8px; margin: 16px 0; border-left: 4px solid #0066cc;">
        <p style="margin: 0;">${commentPreview}</p>
      </div>
      <a href="${taskUrl}" style="display: inline-block; background: #0066cc; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">
        View Task
      </a>
    </div>
  `;

  await sendMail({
    to,
    subject: `New comment on: ${taskTitle}`,
    body,
    html: true,
  });
}

// ============================================
// HEALTH CHECK
// ============================================

export function isMailConfigured(): boolean {
  return !!(
    process.env.MSGRAPH_TENANT_ID &&
    process.env.MSGRAPH_CLIENT_ID &&
    process.env.MSGRAPH_CLIENT_SECRET &&
    process.env.MSGRAPH_SENDER_EMAIL
  );
}
