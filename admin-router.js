const CLOUDFLARE_ORIGIN = "https://yahyaelsawi.website";

if (location.hostname === "yahyaelsawii.github.io") {
  const developerLog = /\/admin\/log(?:\.html)?\/?$/.test(location.pathname);
  location.replace(`${CLOUDFLARE_ORIGIN}${developerLog ? "/admin/log/" : "/admin/"}`);
}
