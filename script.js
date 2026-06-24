// ================================================================
// COUNTDOWNS (تعمل الآن)
// ================================================================
function updateCountdowns() {
  const now = Date.now();
  
  // 1. بكالوريا (تاريخ 1 يونيو 2026)
  const bacDate = new Date('2026-06-01T00:00:00').getTime();
  let diffBac = bacDate - now;
  if (diffBac > 0) {
    document.getElementById('countdownDays').textContent = Math.floor(diffBac / (1000*60*60*24));
    document.getElementById('countdownHours').textContent = Math.floor((diffBac % (1000*60*60*24)) / (1000*60*60));
    document.getElementById('countdownMinutes').textContent = Math.floor((diffBac % (1000*60*60)) / (1000*60));
    document.getElementById('countdownSeconds').textContent = Math.floor((diffBac % (1000*60)) / 1000);
  } else {
    document.getElementById('countdownDays').textContent = '0';
    document.getElementById('countdownHours').textContent = '0';
    document.getElementById('countdownMinutes').textContent = '0';
    document.getElementById('countdownSeconds').textContent = '0';
  }

  // 2. Concours Médecin (24 يوم من الآن)
  const medTarget = now + (24 * 24 * 60 * 60 * 1000);
  let diffMed = medTarget - now;
  if (diffMed > 0) {
    document.getElementById('medecinDays').textContent = Math.floor(diffMed / (1000*60*60*24));
    document.getElementById('medecinHours').textContent = Math.floor((diffMed % (1000*60*60*24)) / (1000*60*60));
    document.getElementById('medecinMinutes').textContent = Math.floor((diffMed % (1000*60*60)) / (1000*60));
    document.getElementById('medecinSeconds').textContent = Math.floor((diffMed % (1000*60)) / 1000);
  } else {
    document.getElementById('medecinDays').textContent = '0';
    document.getElementById('medecinHours').textContent = '0';
    document.getElementById('medecinMinutes').textContent = '0';
    document.getElementById('medecinSeconds').textContent = '0';
  }

  // 3. Concours Ensa (25 يوم من الآن)
  const ensaTarget = now + (25 * 24 * 60 * 60 * 1000);
  let diffEnsa = ensaTarget - now;
  if (diffEnsa > 0) {
    document.getElementById('ensaDays').textContent = Math.floor(diffEnsa / (1000*60*60*24));
    document.getElementById('ensaHours').textContent = Math.floor((diffEnsa % (1000*60*60*24)) / (1000*60*60));
    document.getElementById('ensaMinutes').textContent = Math.floor((diffEnsa % (1000*60*60)) / (1000*60));
    document.getElementById('ensaSeconds').textContent = Math.floor((diffEnsa % (1000*60)) / 1000);
  } else {
    document.getElementById('ensaDays').textContent = '0';
    document.getElementById('ensaHours').textContent = '0';
    document.getElementById('ensaMinutes').textContent = '0';
    document.getElementById('ensaSeconds').textContent = '0';
  }
}

// ================================================================
// تشغيل المؤقتات بعد تحميل الصفحة
// ================================================================
document.addEventListener('DOMContentLoaded', function() {
  // تحديث فوري
  updateCountdowns();
  // ثم التحديث كل ثانية
  setInterval(updateCountdowns, 1000);
});
