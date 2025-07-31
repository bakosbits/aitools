module.exports = {
  siteUrl: "https://aitoolpouch.com",
  generateRobotsTxt: true,
  exclude: ["/403", "/404"],
  robotsTxtOptions: {
    policies: [
      {
        userAgent: "*",
        disallow: "/admin/",
      },
    ],
  },
};
