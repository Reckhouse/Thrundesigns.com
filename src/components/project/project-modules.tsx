import { CtaModule } from "@/components/project/modules/cta";
import { CreditsModule } from "@/components/project/modules/credits";
import { GalleryModule } from "@/components/project/modules/gallery";
import { MetricsModule } from "@/components/project/modules/metrics";
import { ProcessModule } from "@/components/project/modules/process";
import { QuoteModule } from "@/components/project/modules/quote";
import { RichTextModule } from "@/components/project/modules/rich-text";
import { SplitModule } from "@/components/project/modules/split";
import { ThreeExperienceModule } from "@/components/project/modules/three-experience";
import { VideoModule } from "@/components/project/modules/video";
import { ScrollScene } from "@/components/scroll/scroll-scene";
import type { ScrollStoryTransition } from "@/lib/scroll-story/tokens";
import type { ProjectModule } from "@/types/project-modules";

type ProjectModulesProps = {
  modules?: ProjectModule[] | null;
  /** Case study path used for lab "back" links, e.g. `/work/orbit-systems`. */
  caseStudyPath?: string;
  /** Published project document id for Presentation click-to-edit overlays. */
  documentId?: string | null;
};

type ModuleBeat = {
  key: string;
  transition: ScrollStoryTransition;
  soft?: boolean;
  modules: ProjectModule[];
};

function beatKind(
  type: ProjectModule["_type"],
): "editorial" | "media" | "split" | "closer" {
  switch (type) {
    case "projectGallery":
    case "projectVideo":
    case "projectThreeExperience":
      return "media";
    case "projectSplit":
    case "projectMetrics":
    case "projectQuote":
      return "split";
    case "projectCredits":
    case "projectCta":
      return "closer";
    case "projectRichText":
    case "projectProcess":
    default:
      return "editorial";
  }
}

function transitionForKind(
  kind: ReturnType<typeof beatKind>,
): ScrollStoryTransition {
  switch (kind) {
    case "media":
      return "wipe-left";
    case "split":
      return "wipe-up";
    case "closer":
      return "clip-morph";
    case "editorial":
    default:
      return "wipe-up";
  }
}

/** Group consecutive modules into scroll beats (not every tiny module alone). */
function groupModules(modules: ProjectModule[]): ModuleBeat[] {
  const beats: ModuleBeat[] = [];

  for (const item of modules) {
    if (!item?._key || !item._type) continue;
    const kind = beatKind(item._type);
    const prev = beats[beats.length - 1];
    const prevKind = prev ? beatKind(prev.modules[0]._type) : null;

    const canMerge =
      prev &&
      prevKind === kind &&
      // Keep media beats focused; don't merge gallery into gallery forever.
      !(kind === "media" && prev.modules.length >= 1) &&
      !(kind === "split" && prev.modules.length >= 2);

    if (canMerge) {
      prev.modules.push(item);
      prev.key = `${prev.key}_${item._key}`;
    } else {
      beats.push({
        key: item._key,
        transition: transitionForKind(kind),
        soft: kind === "editorial" && beats.length === 0,
        modules: [item],
      });
    }
  }

  return beats;
}

function renderModule(
  item: ProjectModule,
  caseStudyPath?: string,
  documentId?: string | null,
) {
  switch (item._type) {
    case "projectRichText":
      return <RichTextModule key={item._key} module={item} />;
    case "projectGallery":
      return (
        <GalleryModule
          key={item._key}
          module={item}
          documentId={documentId}
        />
      );
    case "projectSplit":
      return (
        <SplitModule
          key={item._key}
          module={item}
          documentId={documentId}
        />
      );
    case "projectMetrics":
      return <MetricsModule key={item._key} module={item} />;
    case "projectProcess":
      return <ProcessModule key={item._key} module={item} />;
    case "projectQuote":
      return <QuoteModule key={item._key} module={item} />;
    case "projectVideo":
      return <VideoModule key={item._key} module={item} />;
    case "projectThreeExperience":
      return (
        <ThreeExperienceModule
          key={item._key}
          module={item}
          caseStudyPath={caseStudyPath}
          documentId={documentId}
        />
      );
    case "projectCta":
      return <CtaModule key={item._key} module={item} />;
    case "projectCredits":
      return <CreditsModule key={item._key} module={item} />;
    default:
      return null;
  }
}

export function ProjectModules({
  modules,
  caseStudyPath,
  documentId,
}: ProjectModulesProps) {
  if (!modules?.length) return null;

  const beats = groupModules(modules);
  if (!beats.length) return null;

  return (
    <div>
      {beats.map((beat) => (
        <ScrollScene
          key={beat.key}
          transition={beat.transition}
          soft={beat.soft}
          fillViewport={false}
          className="border-b-0"
        >
          <div>
            {beat.modules.map((item) =>
              renderModule(item, caseStudyPath, documentId),
            )}
          </div>
        </ScrollScene>
      ))}
    </div>
  );
}
