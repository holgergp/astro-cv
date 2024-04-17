import type { Site, SocialObjects } from "./types";

export const SITE: Site = {
  website: "https://cv.grosse-plankermann.com", // replace this with your deployed domain
  author: "Holger Grosse-Plankermann",
  desc: "My CV using Astro",
  title: "Holger's CV",
  ogImage: "astropaper-og.jpg",
  lightAndDarkMode: true,
  postPerPage: 3,
  scheduledPostMargin: 15 * 60 * 1000, // 15 minutes
};

export const LOCALE = {
  lang: "en", // html lang code. Set this empty and default will be "en"
  langTag: ["en-EN"], // BCP 47 Language Tags. Set this empty [] to use the environment default
} as const;

export const LOGO_IMAGE = {
  enable: false,
  svg: true,
  width: 216,
  height: 46,
};

export const SOCIALS: SocialObjects = [
  {
    name: "Github",
    href: "https://github.com/holgergp",
    linkTitle: `Github`,
    active: true,
  },
  {
    name: "LinkedIn",
    href: "https://linkedin.com/in/holgergp",
    linkTitle: "LinkedIn",
    active: true,
  },
  {
    name: "Mail",
    href: "mailto:holgergp@gmail.com",
    linkTitle: `Email`,
    active: true,
  },
  {
    name: "Twitter",
    href: "https://twitter.com/holgergp/",
    linkTitle: `Twitter`,
    active: true,
  },
  {
    name: "YouTube",
    href: "https://youtube.com/@papperlapappdev",
    linkTitle: `YouTube`,
    active: true,
  },
  {
    name: "Podcast",
    href: "https://autoweird.fm",
    linkTitle: `Podcast`,
    active: true,
  },
  {
    name: "Mastodon",
    href: "https://github.com/satnaing/astro-paper",
    linkTitle: `${SITE.title} on Mastodon`,
    active: true,
  },
];
