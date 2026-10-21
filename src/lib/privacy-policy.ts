export type PrivacyPolicyCopy = {
  title: string;
  updated: string;
  intro: string;
  sections: Array<{ title: string; body: string[] }>;
};

const LAST_UPDATED = '2026-10-21';

const policies: Record<'es' | 'en', PrivacyPolicyCopy> = {
  es: {
    title: 'Política de privacidad',
    updated: `Última actualización: ${LAST_UPDATED}`,
    intro:
      'En KidZcoop (kidzcoop.app) queremos que leer, escuchar y colorear historias sea seguro para toda la familia. Esta política explica qué datos tratamos, para qué y qué derechos tienes.',
    sections: [
      {
        title: 'Qué datos tratamos',
        body: [
          'Cuenta de usuario (opcional): si inicias sesión, por ejemplo con Google, recibimos tu nombre, tu dirección de correo electrónico y tu foto de perfil. Solo usamos los permisos básicos de perfil y correo (openid, email, profile).',
          'Favoritos: si tienes cuenta, guardamos las historias que marcas como favoritas para sincronizarlas entre dispositivos. Sin cuenta, se guardan solo en tu navegador.',
          'Newsletter: si te suscribes, guardamos tu correo electrónico y el idioma elegido para enviarte novedades.',
          'Datos de uso: estadísticas agregadas y anónimas de visitas para saber qué contenidos funcionan mejor.',
        ],
      },
      {
        title: 'Para qué los usamos',
        body: [
          'Para permitirte iniciar sesión y guardar tus favoritos, enviarte la newsletter si la has solicitado y mejorar el sitio. No vendemos tus datos ni los usamos para publicidad personalizada.',
          'Los datos obtenidos de Google se usan únicamente para identificarte en KidZcoop y no se comparten con terceros salvo con los proveedores técnicos indicados abajo.',
        ],
      },
      {
        title: 'Proveedores que nos ayudan',
        body: [
          'Clerk (gestión de cuentas e inicio de sesión), Convex (base de datos), Vercel (alojamiento), Brevo (envío de la newsletter), Cloudflare Web Analytics y, en su caso, Google Analytics (estadísticas). Algunas historias incluyen enlaces de afiliado de Amazon: si compras a través de ellos, Amazon puede usar sus propias cookies según su política.',
        ],
      },
      {
        title: 'Menores',
        body: [
          'KidZcoop está pensado para que los niños lo disfruten acompañados de un adulto. Las cuentas y la suscripción a la newsletter están destinadas a madres, padres y docentes; no recogemos de forma consciente datos personales de menores.',
        ],
      },
      {
        title: 'Conservación y tus derechos',
        body: [
          'Conservamos tus datos mientras mantengas la cuenta o la suscripción. Puedes darte de baja de la newsletter desde cualquier envío y eliminar tu cuenta desde tu perfil.',
          'Puedes ejercer tus derechos de acceso, rectificación, supresión, oposición, limitación y portabilidad contactando con nosotros a través de los canales indicados en la página de contacto. También puedes reclamar ante la Agencia Española de Protección de Datos (aepd.es).',
        ],
      },
      {
        title: 'Cambios',
        body: ['Si cambiamos esta política, publicaremos la nueva versión en esta misma página indicando la fecha de actualización.'],
      },
    ],
  },
  en: {
    title: 'Privacy policy',
    updated: `Last updated: ${LAST_UPDATED}`,
    intro:
      'At KidZcoop (kidzcoop.app) we want reading, listening to and colouring stories to be safe for the whole family. This policy explains what data we process, why, and what your rights are.',
    sections: [
      {
        title: 'What data we process',
        body: [
          'User account (optional): if you sign in, for example with Google, we receive your name, email address and profile picture. We only request the basic profile and email scopes (openid, email, profile).',
          'Favorites: if you have an account, we store the stories you mark as favorites so they sync across devices. Without an account they are kept only in your browser.',
          'Newsletter: if you subscribe, we store your email address and chosen language to send you updates.',
          'Usage data: aggregated, anonymous visit statistics to understand which content works best.',
        ],
      },
      {
        title: 'How we use it',
        body: [
          'To let you sign in and keep your favorites, to send the newsletter if you asked for it, and to improve the site. We do not sell your data or use it for personalised advertising.',
          'Data obtained from Google is used only to identify you on KidZcoop and is not shared with third parties other than the technical providers listed below.',
        ],
      },
      {
        title: 'Service providers',
        body: [
          'Clerk (accounts and sign-in), Convex (database), Vercel (hosting), Brevo (newsletter delivery), Cloudflare Web Analytics and, where enabled, Google Analytics (statistics). Some stories include Amazon affiliate links: if you buy through them, Amazon may use its own cookies under its own policy.',
        ],
      },
      {
        title: 'Children',
        body: [
          'KidZcoop is designed for children to enjoy together with an adult. Accounts and newsletter subscriptions are intended for parents and teachers; we do not knowingly collect personal data from children.',
        ],
      },
      {
        title: 'Retention and your rights',
        body: [
          'We keep your data while your account or subscription is active. You can unsubscribe from the newsletter from any email and delete your account from your profile.',
          'You can exercise your rights of access, rectification, erasure, objection, restriction and portability by contacting us through the channels on the contact page. You may also lodge a complaint with your data protection authority.',
        ],
      },
      {
        title: 'Changes',
        body: ['If we change this policy, we will publish the new version on this page with its update date.'],
      },
    ],
  },
};

export function getPrivacyPolicyCopy(language: string): PrivacyPolicyCopy {
  return language === 'es' ? policies.es : policies.en;
}
