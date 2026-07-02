/**
 * Common interface every platform adapter must implement.
 *
 * The dispatcher (lib/social/dispatch.ts) talks only to this interface,
 * so adding a new platform is "implement SocialAdapter + register it in
 * ADAPTERS" — nothing else changes.
 *
 * Token lifecycle:
 *  - getAuthorizeUrl() returns the URL we redirect the admin to so they
 *    can grant permission. `state` is opaque to the adapter; it's how
 *    the callback route recovers which platform + which admin started
 *    the flow.
 *  - exchangeCode() runs once on the OAuth callback, exchanges the code
 *    for an access token, and tells us which account the admin granted.
 *  - publish() actually creates the post on the platform.
 *  - refresh() is optional. Most modern long-lived tokens don't expire
 *    often, but LinkedIn's tokens do (~60 days), so refresh() matters
 *    there.
 */
import type { SocialPlatform } from "@prisma/client";

export interface AuthorizeUrlInput {
  /** Random CSRF token. Adapter should round-trip this in `state`. */
  state: string;
  /** Where the platform redirects back to. The adapter appends `?code=...`. */
  redirectUri: string;
}

export interface ExchangedToken {
  accessToken: string;
  refreshToken?: string | null;
  expiresInSeconds?: number | null;
  /** Platform-specific stable id of the connected account/page/org. */
  externalId: string;
  /** Human-readable name to show in the admin UI. */
  externalName: string;
  /** Granted scopes (space-separated string for storage). */
  scopes: string[];
}

export interface PublishInput {
  accessToken: string;
  /** The post copy. Adapter may apply platform-specific length limits. */
  text: string;
  /** Canonical URL — appended where supported (FB, LinkedIn). */
  link?: string | null;
  /** Public image URL — uploaded where supported (IG requires this). */
  imageUrl?: string | null;
  /** Adapter-specific metadata (e.g. which FB page to post to). */
  meta?: Record<string, unknown>;
}

export interface PublishResult {
  externalId: string;
  externalUrl: string;
}

export interface SocialAdapter {
  platform: SocialPlatform;
  /** Display name shown in admin UI ("Facebook Pages"). */
  displayName: string;
  /** True if all required env vars are present. Lets the UI grey out "Connect" gracefully. */
  isConfigured(): boolean;
  getAuthorizeUrl(input: AuthorizeUrlInput): string;
  exchangeCode(code: string, redirectUri: string): Promise<ExchangedToken>;
  publish(input: PublishInput): Promise<PublishResult>;
  refresh?(refreshToken: string): Promise<{ accessToken: string; expiresInSeconds: number }>;
}

/**
 * Generic platform error so the dispatcher can log uniformly. Adapters
 * throw this with the platform's own error code/message preserved.
 */
export class SocialAdapterError extends Error {
  constructor(
    public readonly platform: SocialPlatform,
    public readonly code: string,
    message: string,
    public readonly cause?: unknown,
  ) {
    super(message);
    this.name = "SocialAdapterError";
  }
}