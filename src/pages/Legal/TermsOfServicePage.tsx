import LegalDocument from "../../components/Legal/LegalDocument";
import { useSeo } from "../../hooks/useSeo";
import { LEGAL_SITE, TERMS_OF_SERVICE } from "../../data/legalContent";

export default function TermsOfServicePage() {
  useSeo({
    title: `${TERMS_OF_SERVICE.title} | ${LEGAL_SITE.name}`,
    description: TERMS_OF_SERVICE.summary,
    canonical: `${window.location.origin}/dieu-khoan`,
  });

  return <LegalDocument doc={TERMS_OF_SERVICE} />;
}
