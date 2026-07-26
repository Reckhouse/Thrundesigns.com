import { cta, mediaAsset, seo } from "./objects";
import { siteSettings } from "./siteSettings";
import { homePage } from "./homePage";
import { processStep, project, quoteSubmission, service } from "./documents";
import {
  quoteForm,
  quoteFormField,
  quoteFormOption,
  quoteFormProjectTypeOption,
} from "./quoteForm";
import {
  projectCta,
  projectCredits,
  projectGallery,
  projectMetrics,
  projectProcess,
  projectQuote,
  projectRichText,
  projectSplit,
  projectVideo,
} from "./blocks";

export const schemaTypes = [
  cta,
  seo,
  mediaAsset,
  projectRichText,
  projectGallery,
  projectSplit,
  projectMetrics,
  projectProcess,
  projectQuote,
  projectVideo,
  projectCta,
  projectCredits,
  quoteFormOption,
  quoteFormProjectTypeOption,
  quoteFormField,
  siteSettings,
  homePage,
  service,
  processStep,
  project,
  quoteForm,
  quoteSubmission,
];
