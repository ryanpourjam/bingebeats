const wildCardSubdomain = process.env.WILDCARD_SUBDOMAIN;

/** @type {import('next').NextConfig} */
module.exports = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "image.tmdb.org",
        pathname: "**",
      },
    ],
  },
  allowedDevOrigins: [wildCardSubdomain],
};
