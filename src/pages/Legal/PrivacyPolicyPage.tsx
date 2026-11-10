import LegalDocument from "../../components/Legal/LegalDocument";
import { useSeo } from "../../hooks/useSeo";
import { LEGAL_SITE, PRIVACY_POLICY } from "../../data/legalContent";

export default function PrivacyPolicyPage() {
  useSeo({
    title: `${PRIVACY_POLICY.title} | ${LEGAL_SITE.name}`,
    description: PRIVACY_POLICY.summary,
    canonical: `${window.location.origin}/chinh-sach-bao-mat`,
  });

  return <LegalDocument doc={PRIVACY_POLICY} />;
}
