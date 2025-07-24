export default function LogoCard({ name, domain, className }) {

    const clientId = "1id03xd53EDa-VjPpgF";
    const logoLink = `https://cdn.brandfetch.io/${domain}/icon/fallback/lettermark?c=${clientId}`;

    return (
        <img
            src={logoLink}
            alt={`${name} logo`}
            title={name}
            className={`bg-headingWhite ${className}`}
        />
    );
}
