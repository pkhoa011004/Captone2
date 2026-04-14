import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  HelpCircle,
  ArrowLeft,
  Mail,
  MessageSquare,
  Phone,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const Support = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [expandedFaq, setExpandedFaq] = useState(null);

  const faqs = [
    {
      id: 1,
      questionKey: "support.faq1Question",
      answerKey: "support.faq1Answer",
    },
    {
      id: 2,
      questionKey: "support.faq2Question",
      answerKey: "support.faq2Answer",
    },
    {
      id: 3,
      questionKey: "support.faq3Question",
      answerKey: "support.faq3Answer",
    },
    {
      id: 4,
      questionKey: "support.faq4Question",
      answerKey: "support.faq4Answer",
    },
  ];

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
            <HelpCircle className="text-blue-600" size={32} />
            <h1 className="text-3xl font-bold text-gray-900">
              {t("support.title")}
            </h1>
          </div>
          <p className="text-gray-600 mt-2">{t("support.subtitle")}</p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Contact Methods */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="pt-6 text-center">
              <Mail className="mx-auto text-blue-600 mb-4" size={32} />
              <h3 className="text-lg font-semibold mb-2">
                {t("support.emailTitle")}
              </h3>
              <p className="text-gray-600 mb-4">{t("support.emailDesc")}</p>
              <a
                href="mailto:support@drivemasters.com"
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                support@drivemasters.com
              </a>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="pt-6 text-center">
              <Phone className="mx-auto text-blue-600 mb-4" size={32} />
              <h3 className="text-lg font-semibold mb-2">
                {t("support.phoneTitle")}
              </h3>
              <p className="text-gray-600 mb-4">{t("support.phoneDesc")}</p>
              <a
                href="tel:+84123456789"
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                +84 (123) 456-789
              </a>
            </CardContent>
          </Card>
        </div>

        {/* FAQ Section */}
        <div className="bg-white rounded-lg shadow-sm p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            {t("support.faqTitle")}
          </h2>
          <div className="space-y-4">
            {faqs.map((faq) => (
              <div
                key={faq.id}
                className="border border-gray-200 rounded-lg overflow-hidden"
              >
                <button
                  onClick={() =>
                    setExpandedFaq(expandedFaq === faq.id ? null : faq.id)
                  }
                  className="w-full px-6 py-4 bg-gray-50 hover:bg-gray-100 flex justify-between items-center transition-colors"
                >
                  <h3 className="font-semibold text-gray-900 text-left">
                    {t(faq.questionKey)}
                  </h3>
                  <span
                    className={`text-blue-600 transition-transform ${
                      expandedFaq === faq.id ? "rotate-180" : ""
                    }`}
                  >
                    ▼
                  </span>
                </button>
                {expandedFaq === faq.id && (
                  <div className="px-6 py-4 bg-white border-t border-gray-200">
                    <p className="text-gray-700 leading-relaxed">
                      {t(faq.answerKey)}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Last Updated */}
        <div className="mt-8 text-center text-gray-500 text-sm">
          {t("common.lastUpdated")}: {new Date().toLocaleDateString()}
        </div>
      </div>
    </div>
  );
};

export default Support;
