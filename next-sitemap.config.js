module.exports = {
    siteUrl: "https://aitoolpouch.com",
    generateRobotsTxt: true,
    exclude: ["/401", "/403", "/404"],
    robotsTxtOptions: {
        policies: [
            {
                userAgent: "*",
                disallow: "/admin/",
            },
        ],
    },
};
