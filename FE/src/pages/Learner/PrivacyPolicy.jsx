import React from "react";
import { useTranslation } from "react-i18next";
import { Lock, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

const PrivacyPolicy = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-4"
          >
            <ArrowLeft size={20} />
            <span>{t("common.back")}</span>
          </button>
          <div className="flex items-center gap-3">
            <Lock className="text-blue-600" size={32} />
            <h1 className="text-3xl font-bold text-gray-900">
              {t("privacyPolicy.title")}
            </h1>
          </div>
          <p className="text-gray-600 mt-2">{t("privacyPolicy.subtitle")}</p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="bg-white rounded-lg shadow-sm p-8 space-y-8">
          {/* Section 1 */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              {t("privacyPolicy.section1Title")}
            </h2>
            <p className="text-gray-700 leading-relaxed">
              {t("privacyPolicy.section1Content")}
            </p>
          </section>

          {/* Section 2 */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              {t("privacyPolicy.section2Title")}
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              {t("privacyPolicy.section2Content")}
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700">
              <li>{t("privacyPolicy.section2Item1")}</li>
              <li>{t("privacyPolicy.section2Item2")}</li>
              <li>{t("privacyPolicy.section2Item3")}</li>
              <li>{t("privacyPolicy.section2Item4")}</li>
            </ul>
          </section>

          {/* Section 3 */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              {t("privacyPolicy.section3Title")}
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              {t("privacyPolicy.section3Content")}
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700">
              <li>{t("privacyPolicy.section3Item1")}</li>
              <li>{t("privacyPolicy.section3Item2")}</li>
              <li>{t("privacyPolicy.section3Item3")}</li>
            </ul>
          </section>

          {/* Section 4 */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              {t("privacyPolicy.section4Title")}
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              {t("privacyPolicy.section4Content")}
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700">
              <li>{t("privacyPolicy.section4Item1")}</li>
              <li>{t("privacyPolicy.section4Item2")}</li>
            </ul>
          </section>

          {/* Section 5 */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              {t("privacyPolicy.section5Title")}
            </h2>
            <p className="text-gray-700 leading-relaxed">
              {t("privacyPolicy.section5Content")}
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
