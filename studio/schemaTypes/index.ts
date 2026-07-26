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

export const schemaTypes = [
  cta,
  seo,
  mediaAsset,
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
