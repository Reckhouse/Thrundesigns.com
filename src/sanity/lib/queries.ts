import { defineQuery } from "next-sanity";

export const siteSettingsQuery = defineQuery(`
  *[_type == "siteSettings"][0]{
    title,
    tagline,
    nav[]{ label, href },
    footerColumns[]{
      heading,
      links[]{ label, href }
    },
    seo
  }
`);

export const homePageQuery = defineQuery(`
  *[_type == "homePage"][0]{
    hero{
      eyebrow,
      headline,
      support,
      primaryCta,
      secondaryCta,
      servicesMeta,
      image
    },
    servicesIntro,
    processIntro,
    workIntro,
    artifact{
      eyebrow,
      heading,
      intro,
      items[]{ label, detail },
      footnote,
      ctaLabel,
      ctaHref
    },
    engage{
      heading,
      steps[]{ title, copy },
      replyHeading,
      replyPoints
    },
    whyThrun,
    finalCta,
    seo
  }
`);

export const servicesQuery = defineQuery(`
  *[_type == "service"] | order(order asc){
    _id,
    title,
    slug,
    icon,
    summary,
    linkLabel
  }
`);

export const processStepsQuery = defineQuery(`
  *[_type == "processStep"] | order(order asc){
    _id,
    number,
    title,
    copy
  }
`);

export const featuredProjectsQuery = defineQuery(`
  *[_type == "project" && featured == true] | order(order asc)[0...6]{
    _id,
    title,
    slug,
    industry,
    services,
    summary,
    cover
  }
`);

export const projectsQuery = defineQuery(`
  *[_type == "project"] | order(order asc){
    _id,
    title,
    slug,
    industry,
    services,
    summary,
    cover
  }
`);

export const projectBySlugQuery = defineQuery(`
  *[_type == "project" && slug.current == $slug][0]{
    _id,
    title,
    slug,
    industry,
    services,
    summary,
    cover{
      alt,
      blobUrl,
      image
    },
    seo{
      title,
      description,
      ogImage
    },
    primaryExperience{
      ...,
      posterImage{
        alt,
        blobUrl,
        image
      },
      fallbackVideo{
        asset->{
          url,
          originalFilename,
          mimeType,
          size
        }
      }
    },
    featuredCreations[]{
      _key,
      creationId,
      displayTitle,
      shortDescription,
      curatorNote,
      order,
      thumbnail{
        alt,
        blobUrl,
        image
      }
    },
    modules[]{
      ...,
      _type == "projectGallery" => {
        ...,
        items[]{
          alt,
          blobUrl,
          image
        }
      },
      _type == "projectSplit" => {
        ...,
        media{
          alt,
          blobUrl,
          image
        }
      },
      _type == "projectVideo" => {
        ...,
        poster{
          alt,
          blobUrl,
          image
        }
      },
      _type == "projectThreeExperience" => {
        ...,
        posterImage{
          alt,
          blobUrl,
          image
        },
        fallbackVideo{
          asset->{
            url,
            originalFilename,
            mimeType,
            size
          }
        }
      }
    },
    // Legacy fields kept for one-time migration tooling
    gallery,
    body
  }
`);

export const quoteFormQuery = defineQuery(`
  *[_type == "quoteForm" && _id == "quoteForm"][0]{
    eyebrow,
    headline,
    support,
    stepLabels,
    successHeading,
    successBody,
    submitLabel,
    nameField{ label, placeholder, helperText },
    emailField{ label, placeholder, helperText },
    companyField{ label, placeholder, helperText },
    projectTypeField{ label, placeholder, helperText },
    budgetField{ label, placeholder, helperText },
    timelineField{ label, placeholder, helperText },
    messageField{ label, placeholder, helperText },
    attachmentsField{ label, placeholder, helperText },
    projectTypes[]{
      value,
      label,
      enabled,
      service->{
        _id,
        title,
        "slug": slug.current,
        summary,
        icon
      }
    },
    budgetRanges[]{ value, label, enabled },
    timelines[]{ value, label, enabled },
    seo
  }
`);
