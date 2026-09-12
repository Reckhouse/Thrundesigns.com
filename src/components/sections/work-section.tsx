import Image from "next/image";
import Link from "next/link";
import { stegaClean } from "@sanity/client/stega";
import { TextLink } from "@/components/site/primitives";
import {
  WorkCategoryMarquee,
  type WorkMarqueeProject,
} from "@/components/sections/work-category-marquee";
type WorkSectionProps = {
  eyebrow?: string | null;
  heading?: string | null;
  intro?: string | null;
  projects: WorkMarqueeProject[];
};
export function WorkSection({ heading, intro, projects }: WorkSectionProps) {
  const featured: WorkMarqueeProject[] = [];
  for (const name of ["juniper", "hollowbeam", "living-engraving"]) {
    const project = projects.find((item) =>
      stegaClean(item.slug?.current || "").includes(name),
    );
    if (project && !featured.includes(project)) featured.push(project);
  }
  for (const project of projects) {
    if (featured.length >= 3) break;
    if (!featured.includes(project)) featured.push(project);
  }
  const remaining = projects.filter((project) => !featured.includes(project));
  return (
    <section id="work" className="editorial-work">
      <div className="editorial-container editorial-section">
        <div className="editorial-work-heading">
          <div>
            <h2 className="editorial-heading">
              {heading || "Speculative work with production intent."}
            </h2>
            <p className="editorial-intro">
              {intro ||
                "These are concept projects, not client case studies, until we replace them with real engagements."}
            </p>
          </div>
          <TextLink href="/work">View all work</TextLink>
        </div>
        {featured.length ? (
          <div className="editorial-gallery">
            {featured.map((project, index) => (
              <Link
                key={project._id}
                className="editorial-project"
                href={
                  project.slug?.current
                    ? `/work/${stegaClean(project.slug.current)}`
                    : "/work"
                }
              >
                <div className="editorial-project-image">
                  {(project.imageSrc || project.cover?.blobUrl) && (
                    <Image
                      src={stegaClean(
                        project.imageSrc || project.cover?.blobUrl || "",
                      )}
                      alt={stegaClean(
                        project.cover?.alt || project.title || "Concept study",
                      )}
                      fill
                      sizes={
                        index === 0
                          ? "(min-width: 900px) 55vw, 90vw"
                          : "(min-width: 900px) 35vw, 90vw"
                      }
                      className={
                        index === 0 ? "object-cover" : "object-contain"
                      }
                    />
                  )}
                </div>
                <div className="editorial-project-caption">
                  <h3>{project.title}</h3>
                  <span>{project.industry || "Concept study"}</span>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <p className="mt-8">No concept studies are published yet.</p>
        )}
      </div>
      {remaining.length > 0 && (
        <div className="editorial-more-work">
          <WorkCategoryMarquee projects={remaining} durationSeconds={40} />
        </div>
      )}
    </section>
  );
}
