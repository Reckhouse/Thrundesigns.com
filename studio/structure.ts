import type { StructureResolver } from "sanity/structure";

export const structure: StructureResolver = (S) =>
  S.list()
    .title("Content")
    .items([
      S.listItem()
        .title("Site settings")
        .id("siteSettings")
        .child(S.document().schemaType("siteSettings").documentId("siteSettings")),
      S.listItem()
        .title("Home page")
        .id("homePage")
        .child(S.document().schemaType("homePage").documentId("homePage")),
      S.divider(),
      S.documentTypeListItem("service").title("Services"),
      S.documentTypeListItem("processStep").title("Process steps"),
      S.documentTypeListItem("project").title("Projects"),
      S.divider(),
      S.documentTypeListItem("quoteSubmission").title("Quote submissions"),
    ]);
