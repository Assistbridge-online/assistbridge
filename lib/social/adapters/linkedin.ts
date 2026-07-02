/**
 * LinkedIn adapter.
 *
 * LinkedIn OAuth flow:
 *   1. Redirect admin to /oauth/v2/authorization with response_type=code
 *      and scope=openid profile email w_member_social (for personal posts)
 *      or w_organization_social + r_organization_social (for company pages).
 *   2. Admin approves. LinkedIn redirects back with `code`.
 *   3. We POST to /oauth/v2/accessToken with the code to get an access
 *      token (valid for 60 days) + refresh token.
 *   4. For company pages, we need r_organization_social + w_organization_social
 *      and we need r_basicprofile to enumerate orgs the user admins. For
 *      v1 we assume the admin connects ONE organization (urn:li:organization:ID).
 *   5. To publish: POST /rest/posts with author=urn:li:person:ID (personal)
 *      or author=urn:li:organization:ID + author UGC-style payload.
 *
 * LinkedIn API has been through several API generations. We target the
 * "Marketing Developer Platform" REST API (community management endpoint).
 * Approval for `w_member_social` is typically instant; `w_organization_social`
 * requires manual LinkedIn review (1-2 weeks). Start with personal posts
 * via w_member_social — that gets the admin posting today, and they can
 * add a company page once LinkedIn approves the org scope.
 */
import type { SocialPlatform } from "@prisma/client";
import {
  type AuthorizeUrlInput,
  type ExchangedToken,
  type PublishInput,
  type PublishResult,
  SocialAdapterError,
  type SocialAdapter,
} from "../adapter";

const AUTH_URL = "https://www.linkedin.com/oauth/v2/authorization";
const TOKEN_URL = "https://www.linkedin.com/oauth/v2/accessToken";
const API_BASE = "https://api.linkedin.com/v2";
const REST_BASE = "https://api.linkedin.com/rest";

// v1 scopes. Add rw_organization_social / r_organization_social once
// the admin's app is approved for company page posting.
const SCOPES = ["openid", "profile", "email", "w_member_social"].join(" ");

export const linkedinAdapter: SocialAdapter = {
  platform: "LINKEDIN" as SocialPlatform,
  displayName: "LinkedIn",

  isConfigured() {
    return Boolean(process.env.LINKEDIN_CLIENT_ID && process.env.LINKEDIN_CLIENT_SECRET);
  },

  getAuthorizeUrl({ state, redirectUri }: AuthorizeUrlInput): string {
    const params = new URLSearchParams({
      response_type: "code",
      client_id: process.env.LINKEDIN_CLIENT_ID ?? "",
      redirect_uri: redirectUri,
      state,
      scope: SCOPES,
    });
    return `${AUTH_URL}?${params.toString()}`;
  },

  async exchangeCode(code: string, redirectUri: string): Promise<ExchangedToken> {
    const clientId = process.env.LINKEDIN_CLIENT_ID;
    const clientSecret = process.env.LINKEDIN_CLIENT_SECRET;
    if (!clientId || !clientSecret) {
      throw new SocialAdapterError(
        "LINKEDIN",
        "CONFIG_MISSING",
        "LINKEDIN_CLIENT_ID / LINKEDIN_CLIENT_SECRET not set",
      );
    }

    const body = new URLSearchParams({
      grant_type: "authorization_code",
      code,
      redirect_uri: redirectUri,
      client_id: clientId,
      client_secret: clientSecret,
    });
    const tokenRes = await fetch(TOKEN_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body,
    });
    const tokenJson = await tokenRes.json();
    if (!tokenRes.ok || !tokenJson.access_token) {
      throw new SocialAdapterError(
        "LINKEDIN",
        "OAUTH_EXCHANGE_FAILED",
        tokenJson.error_description ?? tokenJson.error ?? "Failed to exchange code",
        tokenJson,
      );
    }

    // Fetch the member's profile to get their person URN (used as author)
    // and display name.
    const meRes = await fetch(`${API_BASE}/userinfo`, {
      headers: { Authorization: `Bearer ${tokenJson.access_token}` },
    });
    const meJson = await meRes.json();
    if (!meRes.ok || !meJson.sub) {
      throw new SocialAdapterError(
        "LINKEDIN",
        "PROFILE_FETCH_FAILED",
        "Failed to fetch LinkedIn profile after auth",
        meJson,
      );
    }

    return {
      accessToken: tokenJson.access_token as string,
      refreshToken: (tokenJson.refresh_token as string) ?? null,
      expiresInSeconds: (tokenJson.expires_in as number) ?? 5184000, // 60d default
      externalId: meJson.sub as string, // OIDC subject = person URN without "urn:li:person:" prefix
      externalName: (meJson.name as string) ?? (meJson.email as string) ?? "LinkedIn member",
      scopes: SCOPES.split(" "),
    };
  },

  async refresh(refreshToken: string): Promise<{ accessToken: string; expiresInSeconds: number }> {
    const clientId = process.env.LINKEDIN_CLIENT_ID;
    const clientSecret = process.env.LINKEDIN_CLIENT_SECRET;
    if (!clientId || !clientSecret) {
      throw new SocialAdapterError("LINKEDIN", "CONFIG_MISSING", "LinkedIn creds not set");
    }
    const body = new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: refreshToken,
      client_id: clientId,
      client_secret: clientSecret,
    });
    const res = await fetch(TOKEN_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body,
    });
    const json = await res.json();
    if (!res.ok || !json.access_token) {
      throw new SocialAdapterError(
        "LINKEDIN",
        "REFRESH_FAILED",
        json.error_description ?? "Failed to refresh LinkedIn token",
        json,
      );
    }
    return {
      accessToken: json.access_token as string,
      expiresInSeconds: (json.expires_in as number) ?? 5184000,
    };
  },

  async publish({ accessToken, text, link, imageUrl, meta }: PublishInput): Promise<PublishResult> {
    // LinkedIn's REST /rest/posts requires:
    //   - author URN: "urn:li:person:{id}" (where id = externalId from OAuth)
    //   - For text-only posts: commentary + (optionally) content.article
    //   - For image posts: content.media with id of an uploaded asset
    // We keep v1 to TEXT posts (the most common case for blog-share).
    // Image support requires a two-step upload flow which we'll add later.
    const personUrn = `urn:li:person:${(meta?.externalId as string) ?? ""}`;
    if (!personUrn) {
      throw new SocialAdapterError("LINKEDIN", "MISSING_AUTHOR", "LinkedIn person URN missing");
    }

    const commentary = link ? `${text}\n\n${link}` : text;
    const payload: Record<string, unknown> = {
      author: personUrn,
      lifecycleState: "PUBLISHED",
      specificContent: {
        "com.linkedin.ugc.ShareContent": {
          shareCommentary: { text: commentary },
          shareMediaCategory: "NONE",
        },
      },
      visibility: { "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC" },
    };

    if (imageUrl) {
      payload.specificContent = {
        "com.linkedin.ugc.ShareContent": {
          shareCommentary: { text: commentary },
          shareMediaCategory: "ARTICLE",
          media: [
            {
              status: "READY",
              originalUrl: link ?? imageUrl,
              title: { text: text.slice(0, 200) },
            },
          ],
        },
      };
    }

    const res = await fetch(`${REST_BASE}/posts`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
        "LinkedIn-Version": "202405",
        "X-Restli-Protocol-Version": "2.0.0",
      },
      body: JSON.stringify(payload),
    });

    // LinkedIn returns 201 Created with an `x-restli-id` header containing
    // the post URN. Some errors come back as JSON.
    const postUrn = res.headers.get("x-restli-id");
    if (res.status === 201 && postUrn) {
      return {
        externalId: postUrn,
        externalUrl: `https://www.linkedin.com/feed/update/${encodeURIComponent(postUrn)}`,
      };
    }

    let errJson: unknown = null;
    try { errJson = await res.json(); } catch { /* not JSON */ }
    throw new SocialAdapterError(
      "LINKEDIN",
      "PUBLISH_FAILED",
      `LinkedIn returned ${res.status}`,
      errJson,
    );
  },
};