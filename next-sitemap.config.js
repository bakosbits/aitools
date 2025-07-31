module.exports = {
  siteUrl: "https://aitoolpouch.com",
  generateRobotsTxt: true,
  exclude: ["/404"],
  robotsTxtOptions: {
    policies: [
      {
        userAgent: "*",
        disallow: "/admin/",
      },
    ],
  },
};
