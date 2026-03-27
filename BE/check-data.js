import fs from 'fs';

const data = JSON.parse(fs.readFileSync('d:\\Captone2\\BE\\src\\config\\exam_a1_250_questions.json'));
const cats = {};

data.forEach(q => {
  if (!cats[q.category]) cats[q.category] = 0;
  cats[q.category]++;
});

console.log('\n📊 KIỂM TRA 250 CÂU THI A1/A:\n');
console.log('Phân bố theo danh mục:');
Object.entries(cats).sort().forEach(([k,v]) => {
  console.log(`  - ${k}: ${v} câu`);
});

const critical = data.filter(q => q.isCritical).length;
const hasCategory = data.every(q => q.category);
const hasCorrectAnswer = data.every(q => q.correctAnswer);

console.log('\n✅ THỐNG KÊ:');
console.log(`  - Tổng câu: ${data.length}`);
console.log(`  - Câu critical: ${critical}`);
console.log(`  - Tất cả có category: ${hasCategory}`);
console.log(`  - Tất cả có correctAnswer: ${hasCorrectAnswer}`);

// Kiểm tra sample bài thi
const sampleFile = 'd:\\Captone2\\BE\\src\\config\\exam_25_sample_2026-03-24T13-54-49.json';
if (fs.existsSync(sampleFile)) {
  const sample = JSON.parse(fs.readFileSync(sampleFile));
  const sampleCats = {};
  sample.forEach(q => {
    if (!sampleCats[q.category]) sampleCats[q.category] = 0;
    sampleCats[q.category]++;
  });
  
  console.log('\n📋 MẪU BÀI THI 25 CÂU:');
  console.log('Phân bố:');
  Object.entries(sampleCats).sort().forEach(([k,v]) => {
    console.log(`  - ${k}: ${v} câu`);
  });
  console.log(`  - Critical: ${sample.filter(q => q.isCritical).length} câu`);
  console.log(`  - Tổng: ${sample.length} câu`);
}

console.log('\n');
