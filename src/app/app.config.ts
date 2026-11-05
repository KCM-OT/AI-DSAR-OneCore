import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { provideChoreography } from '@onetrust/onecore/choreography';
import {
  aiSparkles,
  arrowRight,
  bell,
  chain,
  chartColumn,
  check,
  chevronDown,
  envelope,
  eraser,
  fileLines,
  filePdf,
  gauge,
  gear,
  gridRound,
  listCheck,
  magnifyingGlass,
  paperPlane,
  paperclip,
  questionCircle,
  sitemap,
  user,
  window,
  wrench,
  provideOcIcons,
} from '@onetrust/onecore/icon';

import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes, withComponentInputBinding()),
    // Motion settings for [ocStream], used to stream AI assistant replies.
    provideChoreography({ reducedMotion: 'auto' }),
    // OneCore icons are tree-shaken: register every icon a screen renders.
    // An unregistered name renders nothing (with a dev-mode console error).
    provideOcIcons([
      aiSparkles,
      arrowRight,
      bell,
      chain,
      chartColumn,
      check,
      chevronDown,
      envelope,
      eraser,
      fileLines,
      filePdf,
      gauge,
      gear,
      gridRound,
      listCheck,
      magnifyingGlass,
      paperPlane,
      paperclip,
      questionCircle,
      sitemap,
      user,
      window,
      wrench,
    ]),
  ],
};
