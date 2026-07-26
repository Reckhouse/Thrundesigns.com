import { CtaModule } from "@/components/project/modules/cta";
import { CreditsModule } from "@/components/project/modules/credits";
import { GalleryModule } from "@/components/project/modules/gallery";
import { MetricsModule } from "@/components/project/modules/metrics";
import { ProcessModule } from "@/components/project/modules/process";
import { QuoteModule } from "@/components/project/modules/quote";
import { RichTextModule } from "@/components/project/modules/rich-text";
import { SplitModule } from "@/components/project/modules/split";
import { VideoModule } from "@/components/project/modules/video";
import type { ProjectModule } from "@/types/project-modules";

type ProjectModulesProps = {
  modules?: ProjectModule[] | null;
};

export function ProjectModules({ modules }: ProjectModulesProps) {
  if (!modules?.length) return null;

  return (
    <div>
      {modules.map((module) => {
        if (!module?._key || !module._type) return null;
        switch (module._type) {
          case "projectRichText":
            return <RichTextModule key={module._key} module={module} />;
          case "projectGallery":
            return <GalleryModule key={module._key} module={module} />;
          case "projectSplit":
            return <SplitModule key={module._key} module={module} />;
          case "projectMetrics":
            return <MetricsModule key={module._key} module={module} />;
          case "projectProcess":
            return <ProcessModule key={module._key} module={module} />;
          case "projectQuote":
            return <QuoteModule key={module._key} module={module} />;
          case "projectVideo":
            return <VideoModule key={module._key} module={module} />;
          case "projectCta":
            return <CtaModule key={module._key} module={module} />;
          case "projectCredits":
            return <CreditsModule key={module._key} module={module} />;
          default:
            return null;
        }
      })}
    </div>
  );
}
