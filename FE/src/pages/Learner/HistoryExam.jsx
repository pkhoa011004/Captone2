import React, { useMemo } from "react";
import { BookOpenCheck, Clock3, CircleCheck, CircleX, Trophy } from "lucide-react";
import { useTranslation } from "react-i18next";

const PRACTICE_HISTORY_STORAGE_KEY = "practiceExamHistory";
const PRACTICE_RESULTS_STORAGE_KEY = "practiceTopicResults";

const safeJsonParse = (value, fallback) => {
	try {
		const parsed = JSON.parse(value);
		return parsed ?? fallback;
	} catch {
		return fallback;
	}
};

const formatDateTime = (isoString, fallbackLabel, language) => {
	if (!isoString) return fallbackLabel;

	const date = new Date(isoString);
	if (Number.isNaN(date.getTime())) return fallbackLabel;

	return date.toLocaleString(language === "vi" ? "vi-VN" : "en-US", {
		hour12: false,
		day: "2-digit",
		month: "2-digit",
		year: "numeric",
		hour: "2-digit",
		minute: "2-digit",
	});
};

const normalizeHistoryItem = (item = {}, index = 0) => {
	const scoreRaw = Number(
		item?.scorePercent ?? item?.score_percent ?? item?.latestScore ?? 0,
	);
	const scorePercent = Number.isFinite(scoreRaw) ? Math.round(scoreRaw) : 0;

	const totalRaw = Number(
		item?.questionCount ?? item?.totalQuestions ?? item?.total_questions ?? 0,
	);
	const questionCount = Number.isFinite(totalRaw) ? Math.max(totalRaw, 0) : 0;

	const correctRaw = Number(
		item?.correctCount ?? item?.correct_count,
	);
	const inferredCorrect =
		questionCount > 0
			? Math.round((Math.max(0, Math.min(100, scorePercent)) / 100) * questionCount)
			: 0;
	const correctCount = Number.isFinite(correctRaw)
		? Math.max(0, Math.min(questionCount, correctRaw))
		: inferredCorrect;

	const wrongRaw = Number(item?.wrongCount ?? item?.incorrect_count ?? item?.wrong_count);
	const wrongCount = Number.isFinite(wrongRaw)
		? Math.max(0, Math.min(questionCount, wrongRaw))
		: Math.max(questionCount - correctCount, 0);

	const passed =
		typeof item?.passed === "boolean"
			? item.passed
			: typeof item?.is_passed === "boolean"
				? item.is_passed
				: scorePercent >= 80;

	return {
		id: item?.id || `history-${index}`,
		examName: item?.examName || "Practice Exam",
		licenseType: item?.licenseType || "A1",
		examsSource: item?.examsSource || "exam_250",
		questionCount,
		correctCount,
		wrongCount,
		scorePercent,
		passed,
		submittedAt: item?.submittedAt || item?.updatedAt || null,
		isFallback: Boolean(item?.isFallback),
		attemptCount: Number(item?.attemptCount || 0),
	};
};

const readHistoryFromStorage = () => {
	const rawHistory = localStorage.getItem(PRACTICE_HISTORY_STORAGE_KEY);
	const parsedHistory = safeJsonParse(rawHistory, []);

	if (Array.isArray(parsedHistory) && parsedHistory.length > 0) {
		return parsedHistory
			.filter((item) => item && typeof item === "object")
			.map((item, index) => normalizeHistoryItem(item, index))
			.sort(
				(a, b) =>
					new Date(b?.submittedAt || 0).getTime() -
					new Date(a?.submittedAt || 0).getTime(),
			);
	}

	// Fallback for old data shape: one summary per topic.
	const rawTopicResults = localStorage.getItem(PRACTICE_RESULTS_STORAGE_KEY);
	const parsedTopicResults = safeJsonParse(rawTopicResults, {});
	if (!parsedTopicResults || typeof parsedTopicResults !== "object") {
		return [];
	}

	return Object.values(parsedTopicResults)
		.filter((item) => item && typeof item === "object")
		.map((item, index) => normalizeHistoryItem({
			id: `fallback-${index}`,
			examName: item?.examName || "Practice Exam",
			licenseType: "A1",
			examsSource: "exam_250",
			questionCount: Number(item?.totalQuestions || 0),
			correctCount: null,
			wrongCount: null,
			scorePercent: Number(item?.latestScore || 0),
			passed: Number(item?.latestScore || 0) >= 80,
			submittedAt: item?.updatedAt || null,
			isFallback: true,
			attemptCount: Number(item?.attemptCount || 0),
		}, index))
		.sort(
			(a, b) =>
				new Date(b?.submittedAt || 0).getTime() -
				new Date(a?.submittedAt || 0).getTime(),
		);
};

const scoreBadgeClass = (score) => {
	const value = Number(score || 0);
	if (value >= 80) return "bg-emerald-50 text-emerald-700 border-emerald-100";
	if (value >= 60) return "bg-amber-50 text-amber-700 border-amber-100";
	return "bg-rose-50 text-rose-700 border-rose-100";
};

export default function HistoryExam() {
	const { t, i18n } = useTranslation();
	const historyItems = useMemo(() => readHistoryFromStorage(), []);

	const stats = useMemo(() => {
		const total = historyItems.length;
		const passed = historyItems.filter((item) => item?.passed).length;
		const avg = total
			? Math.round(
					historyItems.reduce(
						(sum, item) => sum + Number(item?.scorePercent || 0),
						0,
					) / total,
				)
			: 0;

		return { total, passed, avg };
	}, [historyItems]);

	return (
		<div className="w-full max-w-7xl mx-auto px-4 md:px-8 py-8 md:py-10 space-y-8">
			<section className="space-y-2">
				<h1 className="text-3xl md:text-4xl font-black text-[#141b2b] tracking-tight">
					{t("historyExamPage.title")}
				</h1>
				<p className="text-slate-500 font-medium">
					{t("historyExamPage.subtitle")}
				</p>
			</section>

			<section className="grid grid-cols-1 md:grid-cols-3 gap-4">
				<div className="rounded-2xl border border-blue-100 bg-white p-5 shadow-sm">
					<p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">
						{t("historyExamPage.totalDone")}
					</p>
					<p className="mt-2 text-3xl font-black text-blue-700">{stats.total}</p>
				</div>

				<div className="rounded-2xl border border-emerald-100 bg-white p-5 shadow-sm">
					<p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">
						{t("historyExamPage.passedCount")}
					</p>
					<p className="mt-2 text-3xl font-black text-emerald-700">{stats.passed}</p>
				</div>

				<div className="rounded-2xl border border-indigo-100 bg-white p-5 shadow-sm">
					<p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">
						{t("historyExamPage.averageScore")}
					</p>
					<p className="mt-2 text-3xl font-black text-indigo-700">{stats.avg}%</p>
				</div>
			</section>

			<section className="rounded-3xl border border-slate-100 bg-white shadow-sm overflow-hidden">
				<div className="px-5 md:px-7 py-5 border-b border-slate-100 bg-slate-50/80">
					<h2 className="text-lg font-black text-slate-800">{t("historyExamPage.listTitle")}</h2>
				</div>

				{historyItems.length === 0 ? (
					<div className="px-6 py-14 text-center space-y-3">
						<div className="mx-auto h-14 w-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
							<BookOpenCheck className="h-7 w-7" />
						</div>
						<p className="text-lg font-bold text-slate-700">{t("historyExamPage.emptyTitle")}</p>
						<p className="text-slate-500">
							{t("historyExamPage.emptySubtitle")}
						</p>
					</div>
				) : (
					<div className="divide-y divide-slate-100">
						{historyItems.map((item, index) => {
							const score = Number(item?.scorePercent || 0);
							const passed = Boolean(item?.passed);

							return (
								<div
									key={item?.id || `${item?.examName || "exam"}-${index}`}
									className="px-5 md:px-7 py-5 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4"
								>
									<div className="space-y-2">
										<div className="flex items-center gap-2">
											<h3 className="text-base md:text-lg font-black text-slate-800">
												{item?.examName || t("historyExamPage.defaultExamName")}
											</h3>
											{item?.isFallback ? (
												<span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-[11px] font-bold text-slate-500 uppercase tracking-[0.08em]">
													{t("historyExamPage.summaryTag")}
												</span>
											) : null}
										</div>

										<div className="flex flex-wrap items-center gap-3 text-sm text-slate-500">
											<span className="inline-flex items-center gap-1.5">
												<Clock3 className="h-4 w-4" />
												{formatDateTime(
													item?.submittedAt,
													t("historyExamPage.unknownTime"),
													i18n.language,
												)}
											</span>
											<span className="inline-flex items-center gap-1.5">
												<Trophy className="h-4 w-4" />
												{t("historyExamPage.licenseLabel", {
													licenseType: item?.licenseType || "A1",
												})}
											</span>
											{Number.isFinite(Number(item?.attemptCount)) &&
											Number(item?.attemptCount) > 0 ? (
												<span>
													{t("historyExamPage.attemptCount", {
														count: Number(item.attemptCount),
													})}
												</span>
											) : null}
										</div>
									</div>

									<div className="flex flex-wrap items-center gap-2">
										<span
											className={`inline-flex items-center rounded-full border px-3 py-1 text-sm font-bold ${scoreBadgeClass(score)}`}
										>
											{t("historyExamPage.scoreLabel", { score })}
										</span>

										{Number.isFinite(Number(item?.questionCount)) &&
										Number(item?.questionCount) > 0 ? (
											<span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-sm font-semibold text-slate-600">
												{t("historyExamPage.questionCount", {
													count: Number(item.questionCount),
												})}
											</span>
										) : null}

										{Number.isFinite(Number(item?.correctCount)) &&
										Number(item?.correctCount) >= 0 ? (
											<span className="inline-flex items-center rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1 text-sm font-semibold text-emerald-700">
												{t("historyExamPage.correctCount", {
													count: Number(item.correctCount),
												})}
											</span>
										) : null}

										{Number.isFinite(Number(item?.wrongCount)) &&
										Number(item?.wrongCount) >= 0 ? (
											<span className="inline-flex items-center rounded-full border border-rose-100 bg-rose-50 px-3 py-1 text-sm font-semibold text-rose-700">
												{t("historyExamPage.wrongCount", {
													count: Number(item.wrongCount),
												})}
											</span>
										) : null}

										<span
											className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-sm font-bold ${
												passed
													? "border-emerald-100 bg-emerald-50 text-emerald-700"
													: "border-rose-100 bg-rose-50 text-rose-700"
											}`}
										>
											{passed ? (
												<CircleCheck className="h-4 w-4" />
											) : (
												<CircleX className="h-4 w-4" />
											)}
											{passed
												? t("historyExamPage.passed")
												: t("historyExamPage.notPassed")}
										</span>
									</div>
								</div>
							);
						})}
					</div>
				)}
			</section>
		</div>
	);
}
