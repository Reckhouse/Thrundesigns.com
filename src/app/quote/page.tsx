import { SiteFooter } from "@/components/site/site-footer";
import { SiteHeader } from "@/components/site/site-header";
import { QuoteForm } from "@/components/quote/quote-form";

export default function QuotePage() {
  return (
    <>
      <SiteHeader />
      <main className="flex-1 pt-[80px] md:pt-[96px]">
        <section className="border-b border-line">
          <QuoteForm />
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
