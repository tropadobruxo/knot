function layout(content: string): string {
  return `<!DOCTYPE html>
<html lang="pt-BR">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:#f4f4f5;margin:0;padding:24px;">
  <div style="max-width:480px;margin:0 auto;background:#fff;border-radius:12px;padding:32px;">
    <div style="text-align:center;margin-bottom:24px;">
      <span style="font-size:24px;font-weight:700;color:#7c3aed;">Knot</span>
    </div>
    ${content}
    <hr style="border:none;border-top:1px solid #e4e4e7;margin:24px 0;">
    <p style="font-size:12px;color:#a1a1aa;text-align:center;">
      Você recebeu este email porque tem uma conta no Knot.<br>
      Se não reconhece esta ação, ignore este email.
    </p>
  </div>
</body>
</html>`;
}

function button(text: string, url: string): string {
  return `<div style="text-align:center;margin:24px 0;">
    <a href="${url}" style="display:inline-block;background:#7c3aed;color:#fff;padding:12px 32px;border-radius:8px;text-decoration:none;font-weight:600;font-size:14px;">${text}</a>
  </div>`;
}

export function verificationEmail(username: string, token: string, baseUrl: string): string {
  const url = `${baseUrl}/api/auth/verify-email?token=${token}`;
  return layout(`
    <h2 style="color:#18181b;font-size:20px;margin:0 0 12px;">Confirme seu email</h2>
    <p style="color:#52525b;font-size:14px;line-height:1.6;">
      Olá <strong>${username}</strong>, clique no botão abaixo para confirmar seu email e ativar sua conta.
    </p>
    ${button("Confirmar email", url)}
    <p style="color:#a1a1aa;font-size:12px;">Este link expira em 24 horas.</p>
  `);
}

export function passwordResetEmail(username: string, token: string, baseUrl: string): string {
  const url = `${baseUrl}/reset-password?token=${token}`;
  return layout(`
    <h2 style="color:#18181b;font-size:20px;margin:0 0 12px;">Redefinir senha</h2>
    <p style="color:#52525b;font-size:14px;line-height:1.6;">
      Olá <strong>${username}</strong>, recebemos um pedido para redefinir sua senha.
    </p>
    ${button("Redefinir senha", url)}
    <p style="color:#a1a1aa;font-size:12px;">Este link expira em 1 hora. Se não solicitou, ignore.</p>
  `);
}

export function matchNotificationEmail(username: string, matchUsername: string, baseUrl: string): string {
  return layout(`
    <h2 style="color:#18181b;font-size:20px;margin:0 0 12px;">Novo match!</h2>
    <p style="color:#52525b;font-size:14px;line-height:1.6;">
      Olá <strong>${username}</strong>, você e <strong>${matchUsername}</strong> deram match! Comece uma conversa agora.
    </p>
    ${button("Ver matches", `${baseUrl}/matches`)}
  `);
}

export function welcomeEmail(username: string, baseUrl: string): string {
  return layout(`
    <h2 style="color:#18181b;font-size:20px;margin:0 0 12px;">Bem-vindo ao Knot!</h2>
    <p style="color:#52525b;font-size:14px;line-height:1.6;">
      Olá <strong>${username}</strong>, sua conta foi criada com sucesso. Complete seu perfil para começar a descobrir pessoas.
    </p>
    ${button("Completar perfil", `${baseUrl}/onboarding`)}
    <p style="color:#52525b;font-size:14px;line-height:1.6;">
      Lembre-se: no Knot, segurança e consentimento são prioridade. Bloqueio, denúncia e modo discreto são sempre gratuitos.
    </p>
  `);
}
