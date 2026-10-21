/** `admin`' server-only entry file. */
import 'server-only';

export {
  ADMIN_EMAIL,
  type AffiliateInput,
  getAdminContent,
  requireAdminIdentity,
  upsertAffiliate,
} from '@/features/admin/data/admin';
