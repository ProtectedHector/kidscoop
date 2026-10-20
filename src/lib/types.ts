export interface Article {
  id: number;
  content_id: number;
  name: string;
  language: string;
  title: string;
  content_text: string;
  lyrics: string;
  image_path: string;
  published_date: string;
  lyrics_language?: string;
}

export interface AffiliateAd {
  article_id: number;
  product_name: string;
  asin: string;
  affiliate_url: string;
  position: number;
  active: boolean;
  image_url: string;
}
