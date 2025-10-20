"use client";

import { useTranslations } from "next-intl";

export default function Contact() {
  const t = useTranslations("Homepage.Contact");

  return (
    <div className="text-white text-center space-y-6 max-w-3xl mx-auto">
      <h2 className="text-6xl font-bold mb-8">{t("title")}</h2>
    </div>
  );
}
