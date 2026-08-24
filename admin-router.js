const CLOUDFLARE_ORIGIN = "https://yahya-elsawi-portfolio-bnj.pages.dev";

if (location.hostname === "yahyaelsawii.github.io") {
  const developerLog = /\/admin\/log(?:\.html)?\/?$/.test(location.pathname);
  location.replace(`${CLOUDFLARE_ORIGIN}${developerLog ? "/admin/log/" : "/admin/"}`);
}
