import fs from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const QUESTION_FILE = path.resolve(__dirname, '../config/question_b1.json')
const OUTPUT_DIR = path.resolve(__dirname, '../config')

const B1_EXAM_STRUCTURE = {
	total: 30,
	critical: 1,
	categories: {
		REGULATIONS: 8,
		TRAFFIC_CULTURE: 1,
		DRIVING_TECHNIQUE: 1,
		VEHICLE_REPAIR: 1,
		TRAFFIC_SIGNS: 9,
		SITUATION_HANDLING: 9,
	},
}

function detectCategory(questionId) {
	if (questionId >= 1 && questionId <= 180) return 'REGULATIONS'
	if (questionId >= 181 && questionId <= 200) return 'TRAFFIC_CULTURE'
	if (questionId >= 201 && questionId <= 261) return 'DRIVING_TECHNIQUE'
	if (questionId >= 262 && questionId <= 300) return 'VEHICLE_REPAIR'
	if (questionId >= 301 && questionId <= 485) return 'TRAFFIC_SIGNS'
	if (questionId >= 486 && questionId <= 600) return 'SITUATION_HANDLING'

	throw new Error(`Question ${questionId} is outside known B1 category ranges`)
}

function shuffle(items) {
	const copied = [...items]
	for (let i = copied.length - 1; i > 0; i -= 1) {
		const j = Math.floor(Math.random() * (i + 1))
		;[copied[i], copied[j]] = [copied[j], copied[i]]
	}
	return copied
}

function pickRandomUnique(pool, count, label) {
	if (pool.length < count) {
		throw new Error(`Not enough questions in ${label}: need ${count}, got ${pool.length}`)
	}

	return shuffle(pool).slice(0, count)
}

function normalizeQuestion(rawQuestion) {
	const questionId = Number(rawQuestion.questionId)
	const category = detectCategory(questionId)

	return {
		...rawQuestion,
		questionId,
		category,
		isCriticalSafety: Boolean(rawQuestion.isCritical),
	}
}

async function loadQuestions() {
	const fileContent = await fs.readFile(QUESTION_FILE, 'utf-8')
	const data = JSON.parse(fileContent)

	if (!Array.isArray(data) || data.length === 0) {
		throw new Error('question_b1.json must be a non-empty array')
	}

	return data.map(normalizeQuestion)
}

function buildExam(questions) {
	const selected = []
	const selectedIds = new Set()

	const criticalPool = questions.filter((question) => question.isCriticalSafety)
	const criticalSelected = pickRandomUnique(criticalPool, B1_EXAM_STRUCTURE.critical, 'CRITICAL')

	criticalSelected.forEach((question) => {
		selected.push(question)
		selectedIds.add(question.questionId)
	})

	Object.entries(B1_EXAM_STRUCTURE.categories).forEach(([category, count]) => {
		const pool = questions.filter(
			(question) =>
				question.category === category &&
				!question.isCriticalSafety &&
				!selectedIds.has(question.questionId)
		)

		const picked = pickRandomUnique(pool, count, category)
		picked.forEach((question) => {
			selected.push(question)
			selectedIds.add(question.questionId)
		})
	})

	if (selected.length !== B1_EXAM_STRUCTURE.total) {
		throw new Error(
			`Generated exam has invalid size: expected ${B1_EXAM_STRUCTURE.total}, got ${selected.length}`
		)
	}

	return shuffle(selected).map((question, index) => ({
		...question,
		examPosition: index + 1,
	}))
}

function printSummary(exam) {
	const categoryCount = exam.reduce((acc, question) => {
		if (!question.isCriticalSafety) {
			acc[question.category] = (acc[question.category] || 0) + 1
		}
		return acc
	}, {})

	const categoryTotalCount = exam.reduce((acc, question) => {
		acc[question.category] = (acc[question.category] || 0) + 1
		return acc
	}, {})

	const criticalCount = exam.filter((question) => question.isCriticalSafety).length

	console.log('\n✅ B1 exam generated successfully')
	console.log(`- Total: ${exam.length}`)
	console.log(`- Critical: ${criticalCount}`)
	console.log('- Categories (excluding critical):')

	Object.entries(categoryCount)
		.sort((a, b) => a[0].localeCompare(b[0]))
		.forEach(([category, count]) => {
			console.log(`  - ${category}: ${count}`)
		})

	console.log('- Categories (including critical):')
	Object.entries(categoryTotalCount)
		.sort((a, b) => a[0].localeCompare(b[0]))
		.forEach(([category, count]) => {
			console.log(`  - ${category}: ${count}`)
		})
}

async function saveExam(exam) {
	const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
	const outputPath = path.join(OUTPUT_DIR, `exam_b1_30_sample_${timestamp}.json`)
	const latestPath = path.join(OUTPUT_DIR, 'exam_b1_30_sample_latest.json')

	const content = JSON.stringify(exam, null, 2)
	await fs.writeFile(outputPath, content, 'utf-8')
	await fs.writeFile(latestPath, content, 'utf-8')

	console.log(`- Output: ${outputPath}`)
	console.log(`- Latest: ${latestPath}`)
}

async function main() {
	const questions = await loadQuestions()
	const exam = buildExam(questions)

	printSummary(exam)
	await saveExam(exam)
}

main().catch((error) => {
	console.error('❌ Failed to generate B1 exam:', error.message)
	process.exit(1)
})
