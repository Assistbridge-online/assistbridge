import { getPublishedPosts } from "@/lib/content";
import { siteConfig } from "@/lib/site";

export async function GET() {
  const posts = await getPublishedPosts();
  const base = siteConfig.url;

  const items = posts
    .map(
      (p) => `
    <entry>
      <id>${base}/blog/${p.slug}</id>
      <title>${escapeXml(p.title)}</title>
      <link href="${base}/blog/${p.slug}"/>
      <updated>${p.publishedAt ? new Date(p.publishedAt).toISOString() : new Date().toISOString()}</updated>
      <summary type="html">${escapeXml(p.excerpt ?? "")}</summary>
      <author><name>AssistBridge</name></author>
    </entry>`
    )
    .join("\n");

  const xml = `<?xml version="1.0" encoding="utf-8"?>
<feed xmlns="http://www.w3.org/2005/Atom">
  <title>${escapeXml(siteConfig.name)} Blog</title>
  <link href="${base}/feed.xml" rel="self"/>
  <link href="${base}/blog"/>
  <updated>${posts[0]?.publishedAt ? new Date(posts[0].publishedAt).toISOString() : new Date().toISOString()}</updated>
  <id>${base}/blog</id>
  ${items}
</feed>`;

  return new Response(xml, {
    headers: { "Content-Type": "application/atom+xml; charset=utf-8" },
  });
}

function escapeXml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}
