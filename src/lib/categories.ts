export const CATEGORY_SLUGS = [
  'historias',
  'ciencia',
  'mundo',
  'arte',
  'naturaleza',
  'espacio',
  'animales',
  'curiosidades',
] as const;

export type CategorySlug = (typeof CATEGORY_SLUGS)[number];

export const DEFAULT_CATEGORY: CategorySlug = 'curiosidades';

type CategoryCopy = {
  icon: string;
  labels: Record<string, string>;
  aliases: string[];
};

export const CATEGORY_DEFINITIONS: Record<CategorySlug, CategoryCopy> = {
  historias: {
    icon: '📚',
    labels: { es: 'Historias', en: 'Stories', fr: 'Histoires', de: 'Geschichten', it: 'Storie', pt: 'Histórias' },
    aliases: ['story', 'stories', 'historia', 'historias', 'cuento', 'cuentos'],
  },
  ciencia: {
    icon: '🔬',
    labels: { es: 'Ciencia', en: 'Science', fr: 'Science', de: 'Wissenschaft', it: 'Scienza', pt: 'Ciência' },
    aliases: ['science', 'ciencia', 'experimento', 'experimentos', 'laboratorio'],
  },
  mundo: {
    icon: '🌍',
    labels: { es: 'Mundo', en: 'World', fr: 'Monde', de: 'Welt', it: 'Mondo', pt: 'Mundo' },
    aliases: ['world', 'mundo', 'travel', 'viaje', 'viajes', 'pais', 'país'],
  },
  arte: {
    icon: '🎨',
    labels: { es: 'Arte', en: 'Art', fr: 'Art', de: 'Kunst', it: 'Arte', pt: 'Arte' },
    aliases: ['art', 'arte', 'artist', 'artista', 'music', 'musica', 'música'],
  },
  naturaleza: {
    icon: '🌱',
    labels: { es: 'Naturaleza', en: 'Nature', fr: 'Nature', de: 'Natur', it: 'Natura', pt: 'Natureza' },
    aliases: ['nature', 'naturaleza', 'plant', 'plants', 'planta', 'plantas', 'forest', 'bosque'],
  },
  espacio: {
    icon: '🚀',
    labels: { es: 'Espacio', en: 'Space', fr: 'Espace', de: 'Weltraum', it: 'Spazio', pt: 'Espaço' },
    aliases: ['space', 'espacio', 'planet', 'planeta', 'moon', 'luna', 'star', 'estrella'],
  },
  animales: {
    icon: '🐾',
    labels: { es: 'Animales', en: 'Animals', fr: 'Animaux', de: 'Tiere', it: 'Animali', pt: 'Animais' },
    aliases: ['animals', 'animal', 'animales', 'pet', 'mascota', 'bird', 'fish', 'dinosaur'],
  },
  curiosidades: {
    icon: '💡',
    labels: { es: 'Curiosidades', en: 'Curiosities', fr: 'Curiosités', de: 'Kurioses', it: 'Curiosità', pt: 'Curiosidades' },
    aliases: ['curiosity', 'curiosities', 'curiosidad', 'curiosidades', 'fact', 'facts'],
  },
};

export function isCategorySlug(value: string | null | undefined): value is CategorySlug {
  return Boolean(value && CATEGORY_SLUGS.includes(value as CategorySlug));
}

export function normalizeCategory(value: string | null | undefined): CategorySlug {
  const normalized = (value || '').trim().toLowerCase();

  if (isCategorySlug(normalized)) {
    return normalized;
  }

  const matchingEntry = CATEGORY_SLUGS.find((slug) =>
    CATEGORY_DEFINITIONS[slug].aliases.includes(normalized),
  );

  return matchingEntry || DEFAULT_CATEGORY;
}

export function getCategoryLabel(category: string | null | undefined, language: string): string {
  const slug = normalizeCategory(category);
  return CATEGORY_DEFINITIONS[slug].labels[language] || CATEGORY_DEFINITIONS[slug].labels.en || slug;
}

export function getCategoryPath(language: string, category: string): string {
  return `/${language}/${normalizeCategory(category)}`;
}
