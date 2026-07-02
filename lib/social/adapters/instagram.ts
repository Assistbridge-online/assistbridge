/**
 * Instagram Business adapter.
 *
 * Instagram's Graph API requires that an Instagram Business (or Creator)
 * account be LINKED to a Facebook Page. Posting happens in two steps:
 *
 *   1. POST /{ig-user-id}/media?image_url=...&caption=...&is_carousel_item=false
 *      → returns { id: <creation_id> }
 *   2. POST /{ig-user-id}/media_publish?creation_id=<creation_id>
 *      → returns { id: <ig-media-id> }
 *
 * IG requires a publicly-fetchable image URL — you can't post just text.
 * The caller (composer) is responsible for ensuring imageUrl is set when
 * targeting an Instagram account.
 *
 * Token story:
 *   IG uses the same Facebook Login OAuth flow. The access token we store
 *   is the linked FB Page's access token (same as the Facebook adapter),
 *   because /me/accounts on the user token returns the linked IG business
 *   account id under fields=instagram_business_account. So this adapter
 *   piggybacks on the Facebook Pages OAuth, but lets the admin pick the
 *   IG account they want to post to.
 *
 *   For v1 we expose this as: "connect Instagram" on the accounts page,
 *   which re-uses the same FB OAuth flow but stores a separate
 *   SocialAccount row with platform=INSTAGRAM and externalId=<ig-user-id>.
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

// IG-specific scopes. instagram_basic + instagram_content_publish are
// the two we need; pages_show_list lets us find the linked IG account.
const SCOPES = [
  "pages_show_list",
  "instagram_basic",
  "instagram_content_publish",
].join(",");

export const instagramAdapter: SocialAdapter = {
  platform: "INSTAGRAM" as SocialPlatform,
  displayName: "Instagram Business",

  isConfigured() {
    // Instagram uses the same FB app credentials as the Facebook adapter.
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
        "INSTAGRAM",
        "CONFIG_MISSING",
        "FACEBOOK_APP_ID / FACEBOOK_APP_SECRET not set",
      );
    }

    // Same code->long-lived token exchange as the FB adapter.
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
        "INSTAGRAM",
        "OAUTH_EXCHANGE_FAILED",
        tokenJson.error?.message ?? "Failed to exchange code",
        tokenJson,
      );
    }
    const shortLived = tokenJson.access_token as string;

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
        "INSTAGRAM",
        "LONG_LIVED_FAILED",
        llJson.error?.message ?? "Failed to mint long-lived token",
        llJson,
      );
    }
    const longLivedUserToken = llJson.access_token as string;

    // Find a Page that has an instagram_business_account linked.
    const pagesRes = await fetch(
      `${GRAPH_API}/me/accounts?fields=id,name,access_token,instagram_business_account{id,username}&access_token=${longLivedUserToken}`,
    );
    const pagesJson = await pagesRes.json();
    if (!pagesRes.ok || !Array.isArray(pagesJson.data)) {
      throw new SocialAdapterError(
        "INSTAGRAM",
        "OAUTH_FAILED",
        pagesJson.error?.message ?? "Failed to list pages",
        pagesJson,
      );
    }
    const pageWithIg = pagesJson.data.find(
      (p: { instagram_business_account?: { id: string; username: string } }) =>
        p.instagram_business_account?.id,
    );
    if (!pageWithIg) {
      throw new SocialAdapterError(
        "INSTAGRAM",
        "NO_LINKED_IG",
        "No Instagram Business account is linked to any of your Facebook Pages. Link one in the Instagram app first.",
        pagesJson,
      );
    }

    return {
      // Store the page access token — it's what we'll use to publish on
      // behalf of the IG business account.
      accessToken: pageWithIg.access_token as string,
      externalId: pageWithIg.instagram_business_account.id as string,
      externalName: `@${pageWithIg.instagram_business_account.username}` as string,
      scopes: ["pages_show_list", "instagram_basic", "instagram_content_publish"],
      expiresInSeconds: null,
      refreshToken: null,
    };
  },

  async publish({ accessToken, text, imageUrl, link }: PublishInput): Promise<PublishResult> {
    // The externalId (IG business account user id) needs to be available.
    // For v1 we store it as the SocialAccount.externalId, and the
    // dispatcher threads it through via meta.igUserId. Fall back to a
    // /me-style discovery if not provided (not implemented for v1).
    const igUserId = (this as unknown as { _igUserId?: string })._igUserId;
    if (!igUserId) {
      throw new SocialAdapterError(
        "INSTAGRAM",
        "MISSING_IG_USER_ID",
        "Internal: IG user id missing from adapter context.",
      );
    }
    if (!imageUrl) {
      throw new SocialAdapterError(
        "INSTAGRAM",
        "IMAGE_REQUIRED",
        "Instagram posts require an image. Add one in the composer before publishing.",
      );
    }

    // Step 1: create media container
    const caption = link ? `${text}\n\n${link}` : text;
    const createRes = await fetch(`${GRAPH_API}/${igUserId}/media?` + new URLSearchParams({
      image_url: imageUrl,
      caption,
      access_token: accessToken,
    }).toString(), { method: "POST" });
    const createJson = await createRes.json();
    if (!createRes.ok || !createJson.id) {
      throw new SocialAdapterError(
        "INSTAGRAM",
        "MEDIA_CREATE_FAILED",
        createJson.error?.message ?? "Failed to create IG media container",
        createJson,
      );
    }

    // Step 2: publish container
    const publishRes = await fetch(`${GRAPH_API}/${igUserId}/media_publish?` + new URLSearchParams({
      creation_id: createJson.id,
      access_token: accessToken,
    }).toString(), { method: "POST" });
    const publishJson = await publishRes.json();
    if (!publishRes.ok || !publishJson.id) {
      throw new SocialAdapterError(
        "INSTAGRAM",
        "MEDIA_PUBLISH_FAILED",
        publishJson.error?.message ?? "Failed to publish IG media",
        publishJson,
      );
    }

    // Fetch permalink
    const permRes = await fetch(
      `${GRAPH_API}/${publishJson.id}?fields=permalink&access_token=${accessToken}`,
    );
    const permJson = await permRes.json();
    return {
      externalId: publishJson.id as string,
      externalUrl: (permJson.permalink as string) ?? "",
    };
  },
};