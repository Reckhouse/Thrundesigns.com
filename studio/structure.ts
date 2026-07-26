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
      S.listItem()
        .title("Forms")
        .id("forms")
        .child(
          S.list()
            .title("Forms")
            .items([
              S.listItem()
                .title("Quote form")
                .id("quoteForm")
                .child(
                  S.document()
                    .schemaType("quoteForm")
                    .documentId("quoteForm"),
                ),
              S.listItem()
                .title("Quote submissions")
                .id("quoteSubmissions")
                .child(
                  S.documentTypeList("quoteSubmission")
                    .title("Quote submissions")
                    .defaultOrdering([
                      { field: "submittedAt", direction: "desc" },
                    ]),
                ),
            ]),
        ),
    ]);
