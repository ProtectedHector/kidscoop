import 'server-only';
import { api } from '@convex/_generated/api';
import { unstable_cache } from 'next/cache';
import type { AffiliateAd } from '@/features/affiliates/model/types';
import { contentCacheOptions, getConvexClient } from '@/lib/server/convex';

const cachedAffiliates = unstable_cache(
  async (articleId?: number) =>
    (await getConvexClient().query(api.articles.listAffiliates, {
      ...(articleId === undefined ? {} : { externalArticleId: articleId }),
    })) as AffiliateAd[],
  ['convex-affiliates'],
  contentCacheOptions,
);

/** Active affiliate products, for one story or for all. Throws if Convex fails. */
export async function fetchAffiliateAds(articleId?: number): Promise<AffiliateAd[]> {
  return await cachedAffiliates(articleId);
}

/** Up to `limit` products for a story page. Never throws: no products is a fine answer. */
export async function getArticleAffiliateAds(articleId: number, limit = 3): Promise<AffiliateAd[]> {
  try {
    return (await fetchAffiliateAds(articleId)).slice(0, limit);
  } catch (error) {
    console.error('Error fetching affiliate ads:', error);
    return [];
  }
}
