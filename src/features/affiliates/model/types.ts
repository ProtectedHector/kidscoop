/** An Amazon affiliate product attached to a story, as `convex/articles.ts` returns it. */
export interface AffiliateAd {
  article_id: number;
  product_name: string;
  asin: string;
  affiliate_url: string;
  position: number;
  active: boolean;
  image_url: string;
}
