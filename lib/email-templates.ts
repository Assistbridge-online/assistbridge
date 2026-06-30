import { siteConfig } from "@/lib/site";

export function verificationEmailHtml(opts: { name: string; verifyUrl: string; siteName: string }) {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width" />
  <title>Verify your email</title>
  <style>
    body { margin:0; padding:0; background:#f8fafc; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif; color:#0f172a; }
    .wrap { max-width:560px; margin:0 auto; padding:32px 20px; }
    .card { background:#fff; border:1px solid #e2e8f0; border-radius:12px; padding:36px; }
    .brand { font-size:24px; font-weight:700; color:#1e3a8a; margin-bottom:24px; letter-spacing:-0.3px; }
    .accent { color:#06b6d4; }
    h1 { font-size:22px; margin:0 0 12px; color:#0f172a; }
    p { font-size:15px; line-height:1.6; color:#475569; margin:0 0 16px; }
    .btn { display:inline-block; background:#1e40af; color:#fff !important; text-decoration:none; padding:12px 24px; border-radius:8px; font-weight:600; font-size:15px; }
    .link { color:#1e40af; word-break:break-all; font-size:13px; }
    .small { font-size:12px; color:#94a3b8; margin-top:24px; }
  </style>
</head>
<body>
  <div class="wrap">
    <div class="card">
      <div class="brand">Assist<span class="accent">Bridge</span></div>
      <h1>Verify your email address</h1>
      <p>Hi ${opts.name},</p>
      <p>Welcome to ${opts.siteName}. Please verify your email address by clicking the button below. This link expires in 24 hours.</p>
      <p style="text-align:center; margin:28px 0;">
        <a href="${opts.verifyUrl}" class="btn">Verify email</a>
      </p>
      <p>If the button doesn't work, paste this link into your browser:</p>
      <p class="link">${opts.verifyUrl}</p>
      <p class="small">If you didn't create an account, you can safely ignore this email.</p>
    </div>
  </div>
</body>
</html>`;
}

export function passwordResetEmailHtml(opts: { name: string; resetUrl: string; siteName: string }) {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width" />
  <title>Reset your password</title>
  <style>
    body { margin:0; padding:0; background:#f8fafc; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif; color:#0f172a; }
    .wrap { max-width:560px; margin:0 auto; padding:32px 20px; }
    .card { background:#fff; border:1px solid #e2e8f0; border-radius:12px; padding:36px; }
    .brand { font-size:24px; font-weight:700; color:#1e3a8a; margin-bottom:24px; letter-spacing:-0.3px; }
    .accent { color:#06b6d4; }
    h1 { font-size:22px; margin:0 0 12px; color:#0f172a; }
    p { font-size:15px; line-height:1.6; color:#475569; margin:0 0 16px; }
    .btn { display:inline-block; background:#1e40af; color:#fff !important; text-decoration:none; padding:12px 24px; border-radius:8px; font-weight:600; font-size:15px; }
    .link { color:#1e40af; word-break:break-all; font-size:13px; }
    .small { font-size:12px; color:#94a3b8; margin-top:24px; }
  </style>
</head>
<body>
  <div class="wrap">
    <div class="card">
      <div class="brand">Assist<span class="accent">Bridge</span></div>
      <h1>Reset your password</h1>
      <p>Hi ${opts.name},</p>
      <p>We received a request to reset the password for your ${opts.siteName} account. Click the button below to choose a new password. This link expires in 1 hour.</p>
      <p style="text-align:center; margin:28px 0;">
        <a href="${opts.resetUrl}" class="btn">Reset password</a>
      </p>
      <p>If the button doesn't work, paste this link into your browser:</p>
      <p class="link">${opts.resetUrl}</p>
      <p class="small">If you didn't request a password reset, you can safely ignore this email. Your password will remain unchanged.</p>
    </div>
  </div>
</body>
</html>`;
}

export function welcomeEmailHtml(opts: { name: string; role: "CLIENT" | "EXPERT"; siteName: string; loginUrl: string }) {
  const isClient = opts.role === "CLIENT";
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width" />
  <title>Welcome to ${opts.siteName}</title>
  <style>
    body { margin:0; padding:0; background:#f8fafc; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif; color:#0f172a; }
    .wrap { max-width:560px; margin:0 auto; padding:32px 20px; }
    .card { background:#fff; border:1px solid #e2e8f0; border-radius:12px; padding:36px; }
    .brand { font-size:24px; font-weight:700; color:#1e3a8a; margin-bottom:24px; letter-spacing:-0.3px; }
    .accent { color:#06b6d4; }
    h1 { font-size:22px; margin:0 0 12px; color:#0f172a; }
    p { font-size:15px; line-height:1.6; color:#475569; margin:0 0 16px; }
    .btn { display:inline-block; background:#1e40af; color:#fff !important; text-decoration:none; padding:12px 24px; border-radius:8px; font-weight:600; font-size:15px; }
  </style>
</head>
<body>
  <div class="wrap">
    <div class="card">
      <div class="brand">Assist<span class="accent">Bridge</span></div>
      <h1>Welcome${isClient ? ". Let's find you an expert" : ". Let's get you set up"}</h1>
      <p>Hi ${opts.name},</p>
      ${isClient
        ? `<p>Your ${opts.siteName} account is ready. Submit your first request and we'll match you with a vetted expert within 24 hours.</p>
           <p style="text-align:center; margin:28px 0;">
             <a href="${opts.loginUrl}" class="btn">Sign in to get started</a>
           </p>`
        : `<p>Your ${opts.siteName} expert account is ready. Our team will review your profile and reach out within 5 business days to walk you through onboarding.</p>
           <p style="text-align:center; margin:28px 0;">
             <a href="${opts.loginUrl}" class="btn">Sign in</a>
           </p>`
      }
    </div>
  </div>
</body>
</html>`;
}

export function orderNotificationHtml(opts: { name: string; orderTitle: string; status: string; siteName: string; dashboardUrl: string }) {
  return `<!DOCTYPE html>
<html>
<body style="margin:0; padding:0; background:#f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
  <div style="max-width:560px; margin:0 auto; padding:32px 20px;">
    <div style="background:#fff; border:1px solid #e2e8f0; border-radius:12px; padding:36px;">
      <div style="font-size:24px; font-weight:700; color:#1e3a8a; margin-bottom:24px;">Assist<span style="color:#06b6d4;">Bridge</span></div>
      <h1 style="font-size:22px; margin:0 0 12px;">Order update</h1>
      <p style="font-size:15px; line-height:1.6; color:#475569;">Hi ${opts.name},</p>
      <p style="font-size:15px; line-height:1.6; color:#475569;">Your order <strong>"${opts.orderTitle}"</strong> is now <strong>${opts.status}</strong>.</p>
      <p style="text-align:center; margin:28px 0;">
        <a href="${opts.dashboardUrl}" style="display:inline-block; background:#1e40af; color:#fff; text-decoration:none; padding:12px 24px; border-radius:8px; font-weight:600;">View order</a>
      </p>
    </div>
  </div>
</body>
</html>`;
}

export const siteName = siteConfig.name;
