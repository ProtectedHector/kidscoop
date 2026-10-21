import translations from '@/translations/translations.json';

/** Every UI string key. Add new keys here and to translations.json in all 12 languages. */
export type TranslationKey = 
  | 'nav.home'
  | 'nav.about'
  | 'nav.contact'
  | 'hero.tagline'
  | 'loading.stories'
  | 'loading.story'
  | 'empty.title'
  | 'empty.message'
  | 'footer.copyright'
  | 'content.backToStories'
  | 'content.readMoreStories'
  | 'content.storyNotFound'
  | 'content.storyNotFoundMessage'
  | 'content.readStory'
  | 'content.listenArticle'
  | 'content.stopListening'
  | 'content.speechNotSupported'
  | 'content.storySong'
  | 'content.storySongDescription'
  | 'content.coloringFun'
  | 'content.coloringDescription'
  | 'content.coloringStudioDescription'
  | 'content.coloringStudioHint'
  | 'content.coloringUndo'
  | 'content.coloringRedo'
  | 'content.coloringReset'
  | 'content.coloringDownloadArtwork'
  | 'content.coloringDownloadPage'
  | 'content.coloringLoading'
  | 'content.clickToDownload'
  | 'content.audioNotSupported'
  | 'content.lyrics'
  | 'content.lyricsInLanguage'
  | 'content.puzzleTitle'
  | 'content.puzzleDescription'
  | 'content.puzzleHint'
  | 'content.puzzleSolved'
  | 'content.puzzleSolvedDescription'
  | 'content.puzzleShuffle'
  | 'content.puzzleDifficulty'
  | 'content.puzzleStatus'
  | 'content.puzzleMoves'
  | 'content.puzzleReady'
  | 'content.puzzleSelected'
  | 'metadata.title'
  | 'metadata.description'
  | 'auth.signIn'
  | 'auth.signInTitle'
  | 'auth.signInIntro'
  | 'auth.signUpTitle'
  | 'auth.unavailableTitle'
  | 'auth.unavailableBody'
  | 'auth.oauthFailedTitle'
  | 'auth.oauthFailedBody'
  | 'auth.syncFailedTitle'
  | 'auth.syncFailedBody'
  | 'auth.dismiss';

type TranslationTree = { [key: string]: string | TranslationTree };

function lookup(language: string, keys: string[]): string | undefined {
  let value: string | TranslationTree | undefined = (translations as Record<string, TranslationTree>)[language];
  for (const key of keys) {
    value = typeof value === 'object' ? value[key] : undefined;
  }
  return typeof value === 'string' ? value : undefined;
}

/** The UI string for `key` in `language`, falling back to English, then to the key itself. */
export function translate(language: string, key: TranslationKey): string {
  const keys = key.split('.');
  return lookup(language, keys) || lookup('en', keys) || key;
}
