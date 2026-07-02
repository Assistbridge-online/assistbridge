/**
 * Facebook Pages adapter.
 *
 * OAuth flow (Facebook Login for Business):
 *   1. Redirect admin to /dialog/oauth with scopes including
 *      pages_show_list, pages_manage_posts, pages_read_engagement.
 *   2. Admin approves. FB redirects back with `code`.
 *   3. We exchange `code` for a short-lived user access token.
 *   4. We exchange the short-lived token for a 60-day long-lived user token.
 *   5. We list the pages the user manages with /me/accounts, and for EACH
 *      page we want to support posting to, we store the page's own
 *      long-lived access token. THIS is the token we use for publishing
 *      — it never expires as long as the user stays an admin of the page.
 *   6. For v1 we simplify: we let the admin pick ONE page from the OAuth
 *      callback, store that one SocialAccount. Multi-page support is a
 *      v2 concern.
 *
 * Publishing:
 *   - POST /{page-id}/feed with message + link. Returns post id.
 *   - GET /{post-id}?fields=permalink_url returns the public URL.
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

const GRAPH_API = "https://graph.facebook.com/v21.0";
const DIALOG_URL = "https://www.facebook.com/v21.0/dialog/oauth";

// Scopes we ask for. pages_manage_posts lets us publish; pages_show_list
// lets us enumerate managed pages; pages_read_engagement lets us pull
// the post permalink after publishing.
const SCOPES = [
  "pages_show_list",
  "pages_manage_posts",
  "pages_read_engagement",
].join(",");

export const facebookAdapter: SocialAdapter = {
  platform: "FACEBOOK" as SocialPlatform,
  displayName: "Facebook Pages",

  isConfigured() {
    return Boolean(process.env.FACEBOOK_APP_ID && process.env.FACEBOOK_APP_SECRET);
  },

  getAuthorizeUrl({ state, redirectUri }: AuthorizeUrlInput): string {
    const params = new URLSearchParams({
      client_id: process.env.FACEBOOK_APP_ID ?? "",
      redirect_uri: redirectUri,
      state,
      scope: SCOPES,
      response_type: "code",
    });
    return `${DIALOG_URL}?${params.toString()}`;
  },

  async exchangeCode(code: string, redirectUri: string): Promise<ExchangedToken> {
    const appId = process.env.FACEBOOK_APP_ID;
    const appSecret = process.env.FACEBOOK_APP_SECRET;
    if (!appId || !appSecret) {
      throw new SocialAdapterError(
        "FACEBOOK",
        "CONFIG_MISSING",
        "FACEBOOK_APP_ID / FACEBOOK_APP_SECRET not set",
      );
    }

    // Step 1: code -> short-lived user token
    const tokenRes = await fetch(
      `${GRAPH_API}/oauth/access_token?` +
        new URLSearchParams({
          client_id: appId,
          client_secret: appSecret,
          redirect_uri: redirectUri,
          code,
        }).toString(),
    );
    const tokenJson = await tokenRes.json();
    if (!tokenRes.ok || !tokenJson.access_token) {
      throw new SocialAdapterError(
        "FACEBOOK",
        "OAUTH_EXCHANGE_FAILED",
        tokenJson.error?.message ?? "Failed to exchange code",
        tokenJson,
      );
    }
    const shortLived = tokenJson.access_token as string;

    // Step 2: short-lived -> long-lived user token (60 days)
    const llRes = await fetch(
      `${GRAPH_API}/oauth/access_token?` +
        new URLSearchParams({
          grant_type: "fb_exchange_token",
          client_id: appId,
          client_secret: appSecret,
          fb_exchange_token: shortLived,
        }).toString(),
    );
    const llJson = await llRes.json();
    if (!llRes.ok || !llJson.access_token) {
      throw new SocialAdapterError(
        "FACEBOOK",
        "LONG_LIVED_FAILED",
        llJson.error?.message ?? "Failed to mint long-lived token",
        llJson,
      );
    }
    const longLivedUserToken = llJson.access_token as string;

    // Step 3: list managed pages, pick the first one (v1 = one-page-per-SocialAccount)
    const pagesRes = await fetch(
      `${GRAPH_API}/me/accounts?fields=id,name,access_token&access_token=${longLivedUserToken}`,
    );
    const pagesJson = await pagesRes.json();
    if (!pagesRes.ok || !Array.isArray(pagesJson.data) || pagesJson.data.length === 0) {
      throw new SocialAdapterError(
        "FACEBOOK",
        "NO_PAGES",
        "This Facebook account doesn't manage any Pages. Create one or grant Page access first.",
        pagesJson,
      );
    }
    const page = pagesJson.data[0];

    return {
      accessToken: page.access_token as string,
      externalId: page.id as string,
      externalName: page.name as string,
      scopes: ["pages_show_list", "pages_manage_posts", "pages_read_engagement"],
      // Page access tokens are effectively non-expiring as long as the
      // user remains an admin of the page. We don't know the actual
      // expiry, so leave it null and check on use.
      expiresInSeconds: null,
      refreshToken: null,
    };
  },

  async publish({ accessToken, text, link, imageUrl, meta }: PublishInput): Promise<PublishResult> {
    // meta?.pageId lets the caller override which page to post to when
    // the same token has access to multiple pages. For v1 the stored
    // SocialAccount already targets one specific page, so we just use
    // /me/feed which posts to whichever page the token belongs to.
    const body: Record<string, string> = { message: text, access_token: accessToken };
    if (link) body.link = link;
    if (imageUrl) {
      // Photo posts go through /photos with url=; the response shape
      // differs from /feed, so we branch.
      const photoRes = await fetch(`${GRAPH_API}/me/photos?` + new URLSearchParams({
        caption: text,
        url: imageUrl,
        access_token: accessToken,
        ...(link ? { link } : {}),
      }).toString(), { method: "POST" });
      const photoJson = await photoRes.json();
      if (!photoRes.ok || !photoJson.id) {
        throw new SocialAdapterError(
          "FACEBOOK",
          "PUBLISH_FAILED",
          photoJson.error?.message ?? "Photo publish failed",
          photoJson,
        );
      }
      const permRes = await fetch(
        `${GRAPH_API}/${photoJson.id}?fields=permalink_url&access_token=${accessToken}`,
      );
      const permJson = await permRes.json();
      return {
        externalId: photoJson.id as string,
        externalUrl: (permJson.permalink_url as string) ?? `https://facebook.com/${photoJson.id}`,
      };
    }

    const feedRes = await fetch(`${GRAPH_API}/me/feed`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const feedJson = await feedRes.json();
    if (!feedRes.ok || !feedJson.id) {
      throw new SocialAdapterError(
        "FACEBOOK",
        "PUBLISH_FAILED",
        feedJson.error?.message ?? "Feed publish failed",
        feedJson,
      );
    }
    const permRes = await fetch(
      `${GRAPH_API}/${feedJson.id}?fields=permalink_url&access_token=${accessToken}`,
    );
    const permJson = await permRes.json();
    return {
      externalId: feedJson.id as string,
      externalUrl: (permJson.permalink_url as string) ?? `https://facebook.com/${feedJson.id}`,
    };
  },
};