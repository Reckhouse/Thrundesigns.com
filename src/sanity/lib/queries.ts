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
    cover,
    gallery,
    body,
    seo
  }
`);
