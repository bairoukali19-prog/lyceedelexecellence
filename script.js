// ============================================================
// script.js - جميع دوال Lycée de l'Excellence
// ============================================================

// ============================================================
// 1. البيانات الأساسية والمتغيرات
// ============================================================
const STORAGE_KEY = 'lyceeData_concours_v3';
let data = {};
let currentStudent = null;
let currentAdmin = false;

// متغيرات Concours (Runtime)
let currentConcours = null;
let currentConcoursIndex = 0;
let concoursAnswers = {};
let concoursTimer = null;
let concoursTimeLeft = 0;

// ============================================================
// 2. الأسئلة الافتراضية (40 سؤالاً من Q21 إلى Q60)
// ============================================================
const defaultConcoursQuestions = [
  { id: 'q21', text: 'En observant la représentation de la surface de l\'eau à l\'instant considéré, quelle valeur correspond à la distance séparant deux crêtes successives de l\'onde ?', type: 'single', points: 2, options: ['λ = 0,5 cm', 'λ = 2,5 cm', 'λ = 1 cm', 'λ = 2 cm', 'λ = 1,5 cm'], correct: 3, feedback: 'La distance entre deux crêtes successives est la longueur d\'onde λ = 2 cm.' },
  { id: 'q22', text: 'Sachant que l\'onde se propage depuis la source S et en utilisant les informations du schéma, quelle est la célérité de propagation de cette onde à la surface de l\'eau ?', type: 'single', points: 2, options: ['v = 0,20 m.s⁻¹', 'v = 0,25 m.s⁻¹', 'v = 0,30 m.s⁻¹', 'v = 0,40 m.s⁻¹', 'v = 0,45 m.s⁻¹'], correct: 1, feedback: 'La célérité est v = λ/T = 0,25 m.s⁻¹.' },
  { id: 'q23', text: 'Le point M est situé à 0,40 m de la source S. Quelle expression traduit correctement l\'évolution temporelle de son élongation ?', type: 'single', points: 2, options: ['yM(t)=5×10⁻³ sin(20πt−π)', 'yM(t)=5×10⁻³ cos(20πt−π)', 'yM(t)=5×10⁻³ cos(40πt+π)', 'yM(t)=5×10⁻³ cos(40πt)', 'yM(t)=5×10⁻³ cos(30πt)'], correct: 2, feedback: 'L\'expression correcte est yM(t)=5×10⁻³ cos(40πt+π).' },
  { id: 'q24', text: 'Une radiation lumineuse possède une fréquence ν = 5×10¹⁴ Hz. Quelle longueur d\'onde aurait cette radiation dans le vide ?', type: 'single', points: 2, options: ['λ₀ = 760 nm', 'λ₀ = 850 nm', 'λ₀ = 600 nm', 'λ₀ = 570 nm', 'λ₀ = 320 nm'], correct: 2, feedback: 'λ₀ = c/ν = 3×10⁸ / 5×10¹⁴ = 6×10⁻⁷ m = 600 nm.' },
  { id: 'q25', text: 'À partir de la fréquence de la radiation et de sa longueur d\'onde dans le milieu, déterminer l\'indice de réfraction du milieu transparent étudié.', type: 'single', points: 2, options: ['n = 1,33', 'n = 1,50', 'n = 1,80', 'n = 2,00', 'n = 1,00'], correct: 1, feedback: 'n = c/v = 1,50.' },
  { id: 'q26', text: 'La célérité du pouls est donnée par la relation : v = 1 / √(ρ.D). Quelle est la dimension physique du coefficient D ?', type: 'single', points: 2, options: ['L.M⁻¹.T⁻²', 'L.M.T²', 'L.M⁻¹.T²', 'L.M⁻¹.T⁻¹', 'L.M⁻².T⁻²'], correct: 0, feedback: 'D a pour dimension L.M⁻¹.T⁻².' },
  { id: 'q27', text: 'En exploitant les données numériques fournies concernant le sang et l\'élasticité de l\'artère, quelle valeur obtient-on pour la célérité du pouls ?', type: 'single', points: 2, options: ['3,6 m.s⁻¹', '4,0 m.s⁻¹', '5,0 m.s⁻¹', '2,6 m.s⁻¹', '4,5 m.s⁻¹'], correct: 0, feedback: 'La célérité du pouls est v = 3,6 m.s⁻¹.' },
  { id: 'q28', text: 'Le point M est situé à 20 cm du cœur alors que le point N en est éloigné de 80 cm. Quel est le retard temporel observé entre l\'arrivée du pouls en M et son arrivée en N ?', type: 'single', points: 2, options: ['Δt = 0,17 s', 'Δt = 1,7 s', 'Δt = 170 s', 'Δt = 6 s', 'Δt = 0,22 s'], correct: 0, feedback: 'Δt = (0,80 - 0,20)/v = 0,17 s.' },
  { id: 'q29', text: 'Le graphe représente l\'évolution de l\'élongation d\'un point M d\'une corde. À quel instant la perturbation atteint-elle ce point ?', type: 'single', points: 2, options: ['t = 0,50 s', 't = 0,10 s', 't = 0,20 s', 't = 0,15 s', 't = 0,25 s'], correct: 3, feedback: 'La perturbation atteint le point M à t = 0,15 s.' },
  { id: 'q30', text: 'En utilisant le graphique précédent et les données de propagation, quelle est la longueur spatiale de la perturbation ?', type: 'single', points: 2, options: ['ℓ = 0,175 m', 'ℓ = 0,255 m', 'ℓ = 0,375 m', 'ℓ = 0,320 m', 'ℓ = 0,125 m'], correct: 0, feedback: 'La longueur spatiale de la perturbation est ℓ = 0,175 m.' },
  { id: 'q31', text: 'On remplace le premier laser par un second de longueur d\'onde différente. Quelle est alors la largeur de la tache centrale observée sur l\'écran ?', type: 'single', points: 2, options: ['L₂ = 1,5 cm', 'L₂ = 1,7 cm', 'L₂ = 2,3 cm', 'L₂ = 2,6 cm', 'L₂ = 3,2 cm'], correct: 1, feedback: 'La largeur de la tache centrale est L₂ = 1,7 cm.' },
  { id: 'q32', text: 'Parmi les valeurs proposées, laquelle correspond à l\'écart angulaire maximal observé dans cette expérience de diffraction ?', type: 'single', points: 2, options: ['θ = 9,2×10⁻² rad', 'θ = 8,3×10⁻² rad', 'θ = 5,7×10⁻³ rad', 'θ = 6,7×10⁻³ rad', 'θ = 2,4×10⁻² rad'], correct: 0, feedback: 'L\'écart angulaire maximal est θ = 9,2×10⁻² rad.' },
  { id: 'q33', text: 'Le noyau de fer ⁵⁹₂₆Fe subit une désintégration β⁻. Quel noyau apparaît après cette transformation radioactive ?', type: 'single', points: 2, options: ['⁵⁹₂₄Cr', '⁵⁹₂₅Mn', '⁵⁸₂₇Co', '⁵⁹₂₇Co', '⁶⁰₂₆Fe'], correct: 3, feedback: 'β⁻ : Z augmente de 1, A reste 59 → ⁵⁹₂₇Co.' },
  { id: 'q34', text: 'Les mesures de l\'activité montrent que : a(t)/a(t+10) = 1,17. Quelle est la constante radioactive λ du fer 59 ?', type: 'single', points: 2, options: ['1,57×10⁻⁴ jours⁻¹', '1,57×10⁻² jours⁻¹', '1,57×10⁻⁷ s⁻¹', '1,57×10⁻² s⁻¹', '1,57×10⁻⁶ jours⁻¹'], correct: 0, feedback: 'λ = ln(1,17)/10 = 1,57×10⁻⁴ jours⁻¹.' },
  { id: 'q35', text: 'Le bismuth ²¹²₈₃Bi se transforme en polonium puis en plomb par deux désintégrations successives. Quelle proposition identifie correctement la nature de la première désintégration ainsi que les valeurs de Z₁ et A₂ ?', type: 'single', points: 2, options: ['α ; Z₁ = 84 ; A₂ = 208', 'β⁻ ; Z₁ = 84 ; A₂ = 208', 'β⁺ ; Z₁ = 82 ; A₂ = 208', 'α ; Z₁ = 81 ; A₂ = 208', 'β⁻ ; Z₁ = 84 ; A₂ = 212'], correct: 0, feedback: 'La première désintégration est α, Z₁=84, A₂=208.' },
  { id: 'q36', text: 'Une roche radioactive contient initialement une certaine quantité d\'uranium 235. Parmi les propositions suivantes, laquelle représente correctement le nombre de noyaux présents à l\'instant t₀ ?', type: 'single', points: 2, options: ['N₀ = 2,35×10²⁴', 'N₀ = 1,28×10²⁵', 'N₀ = 6,02×10²⁵', 'N₀ = 7,25×10²⁶', 'N₀ = 8,50×10²⁶'], correct: 2, feedback: 'N₀ = 6,02×10²⁵ noyaux.' },
  { id: 'q37', text: 'À partir des données relatives à la demi-vie et à la quantité initiale d\'uranium 235, déterminer l\'activité radioactive initiale de l\'échantillon.', type: 'single', points: 2, options: ['a₀ = 7×10⁸ Bq', 'a₀ = 6×10⁸ Bq', 'a₀ = 4,07×10⁸ Bq', 'a₀ = 3×10⁷ Bq', 'a₀ = 1,5×10⁷ Bq'], correct: 2, feedback: 'a₀ = λ.N₀ = 4,07×10⁸ Bq.' },
  { id: 'q38', text: 'Après une durée égale à quatre demi-vies, comment peut-on exprimer l\'activité radioactive de l\'uranium 235 par rapport à son activité initiale ?', type: 'single', points: 2, options: ['0,5.a₀', '0,25.a₀', '0,125.a₀', '6,25×10⁻².a₀', '3,125×10⁻².a₀'], correct: 3, feedback: 'a = a₀/2⁴ = a₀/16 = 6,25×10⁻².a₀.' },
  { id: 'q39', text: 'Le radium ²²⁶₈₈Ra émet une particule α et donne naissance à un noyau de radon. Quelles sont les valeurs correctes des nombres x et y du noyau fils ?', type: 'single', points: 2, options: ['x = 88 ; y = 226', 'x = 87 ; y = 226', 'x = 87 ; y = 222', 'x = 86 ; y = 222', 'x = 89 ; y = 226'], correct: 3, feedback: 'α : Z diminue de 2 (88→86), A diminue de 4 (226→222).' },
  { id: 'q40', text: 'Quelle est la composition exacte du noyau de radon obtenu après cette désintégration ?', type: 'single', points: 2, options: ['86 protons et 222 neutrons', '86 protons et 136 neutrons', '87 protons et 135 neutrons', '89 protons et 137 neutrons', '88 protons et 138 neutrons'], correct: 1, feedback: 'Rn : Z=86, A=222 → neutrons = 222-86 = 136.' },
  { id: 'q41', text: 'Le suivi expérimental d\'une transformation chimique permet de tracer l\'évolution de l\'avancement x au cours du temps. Quelle valeur représente l\'avancement final de la réaction ?', type: 'single', points: 2, options: ['xf = 29,8 mmol', 'xf = 28,5 mmol', 'xf = 27,8 mmol', 'xf = 25,6 mmol', 'xf = 20,8 mmol'], correct: 0, feedback: 'L\'avancement final est xf = 29,8 mmol.' },
  { id: 'q42', text: 'En exploitant le graphe de l\'avancement, déterminer la durée nécessaire pour atteindre la moitié de l\'avancement final.', type: 'single', points: 2, options: ['t1/2 = 60 min', 't1/2 = 45 min', 't1/2 = 40 min', 't1/2 = 35 min', 't1/2 = 30 min'], correct: 3, feedback: 't1/2 = 35 min.' },
  { id: 'q43', text: 'Entre les instants t₀ = 0 min et t₁ = 90 min, quelle est la vitesse volumique moyenne de la réaction ?', type: 'single', points: 2, options: ['4×10⁻³ mol.L⁻¹.min⁻¹', '5,33×10⁻³ mol.L⁻¹.min⁻¹', '6,67×10⁻³ mol.L⁻¹.min⁻¹', '8×10⁻³ mol.L⁻¹.min⁻¹', '3,5×10⁻³ mol.L⁻¹.min⁻¹'], correct: 0, feedback: 'Vitesse moyenne = Δx/(V.Δt) = 4×10⁻³ mol.L⁻¹.min⁻¹.' },
  { id: 'q44', text: 'Dans la réaction d\'oxydoréduction étudiée entre les ions permanganate et l\'eau oxygénée, quels sont les couples oxydant/réducteur effectivement mis en jeu ?', type: 'single', points: 2, options: ['MnO₄⁻/Mn²⁺ et H₂O₂/O₂', 'MnO₄⁻/Mn²⁺ et O₂/H₂O₂', 'Mn²⁺/MnO₄⁻ et O₂/H₂O₂', 'MnO₄⁻/Mn²⁺ et H₂O/H₂O₂', 'MnO₄⁻/Mn²⁺ et H₂O/H⁺'], correct: 0, feedback: 'Les couples sont MnO₄⁻/Mn²⁺ et H₂O₂/O₂.' },
  { id: 'q45', text: 'À partir de l\'évolution de la concentration des ions Mn²⁺, déterminer le temps de demi-réaction.', type: 'single', points: 2, options: ['10 min', '14 min', '24 min', '44 min', '60 min'], correct: 1, feedback: 'Le temps de demi-réaction est t1/2 = 14 min.' },
  { id: 'q46', text: 'À l\'instant t = 24 min, quel volume de dioxygène a été produit lors de la transformation ?', type: 'single', points: 2, options: ['48×10⁻² L', '4,8×10⁻² L', '36×10⁻² L', '12×10⁻² L', '24×10⁻² L'], correct: 0, feedback: 'Le volume produit est 48×10⁻² L.' },
  { id: 'q47', text: 'L\'eau oxygénée étant le réactif limitant, quelle quantité de matière initiale lui correspond ?', type: 'single', points: 2, options: ['n₀ = 5,6×10⁻² mol', 'n₀ = 2,8×10⁻³ mol', 'n₀ = 1,4×10⁻² mol', 'n₀ = 1,4×10⁻³ mol', 'n₀ = 2,8×10⁻² mol'], correct: 0, feedback: 'n₀ = 5,6×10⁻² mol.' },
  { id: 'q48', text: 'La conductivité d\'une solution d\'acide éthanoïque a été mesurée. Quelle concentration en ions oxonium en découle ?', type: 'single', points: 2, options: ['[H₃O⁺] = 8×10⁻⁴ mol.L⁻¹', '[H₃O⁺] = 4×10⁻⁴ mol.L⁻¹', '[H₃O⁺] = 2×10⁻⁴ mol.L⁻¹', '[H₃O⁺] = 4×10⁻⁵ mol.L⁻¹', '[H₃O⁺] = 8×10⁻⁵ mol.L⁻¹'], correct: 0, feedback: '[H₃O⁺] = 8×10⁻⁴ mol.L⁻¹.' },
  { id: 'q49', text: 'Quelle valeur de pH est cohérente avec la concentration en ions oxonium obtenue précédemment ?', type: 'single', points: 2, options: ['pH = 3,1', 'pH = 3,4', 'pH = 3,6', 'pH = 3,8', 'pH = 4,2'], correct: 0, feedback: 'pH = -log(8×10⁻⁴) ≈ 3,1.' },
  { id: 'q50', text: 'On définit le taux d\'avancement final par τ = xf/xmax. Quelle valeur convient à la réaction étudiée ?', type: 'single', points: 2, options: ['τ = 4 %', 'τ = 2 %', 'τ = 1 %', 'τ = 0,4 %', 'τ = 0,2 %'], correct: 0, feedback: 'τ = 4 %.' },
  { id: 'q51', text: 'Un comprimé d\'ibuprofène est dissous puis dosé par une solution d\'hydroxyde de sodium. Quelle masse d\'ibuprofène contient ce comprimé ?', type: 'single', points: 2, options: ['0,4 mg', '4 mg', '4×10⁻² mg', '400 mg', '500 mg'], correct: 3, feedback: 'La masse d\'ibuprofène est 400 mg.' },
  { id: 'q52', text: 'Un vinaigre commercial est analysé par dosage acido-basique. Quel est son degré d\'acidité ?', type: 'single', points: 2, options: ['7°', '4,9°', '11,2°', '9°', '12°'], correct: 0, feedback: 'Le degré d\'acidité est 7°.' },
  { id: 'q53', text: 'Pour un volume versé VB = 8,2 mL avant l\'équivalence, quelle proposition associe correctement l\'avancement et le pH du mélange ?', type: 'single', points: 2, options: ['xf = 8,2×10⁻⁴ mol ; pH = 4', 'xf = 4,2×10⁻⁴ mol ; pH = 4,8', 'xf = 4,2×10⁻⁴ mol ; pH = 4', 'xf = 6,2×10⁻⁴ mol ; pH = 5', 'xf = 8,2×10⁻⁴ mol ; pH = 4,8'], correct: 1, feedback: 'xf = 4,2×10⁻⁴ mol et pH = 4,8.' },
  { id: 'q54', text: 'Une solution d\'acide benzoïque de concentration 0,10 mol.L⁻¹ possède un pH égal à 2,6. Quelle valeur correspond à l\'avancement final de sa réaction avec l\'eau ?', type: 'single', points: 2, options: ['xf = 2,5×10⁻³ mol', 'xf = 1,4×10⁻³ mol', 'xf = 2,5×10⁻² mol', 'xf = 4×10⁻² mol', 'xf = 6×10⁻² mol'], correct: 0, feedback: 'xf = 2,5×10⁻³ mol.' },
  { id: 'q55', text: 'Parmi les expressions suivantes, laquelle permet d\'établir la constante d\'acidité Ka du couple (C₆H₅COOH / C₆H₅COO⁻) à partir du pH et de la concentration initiale ?', type: 'single', points: 2, options: ['Ka = 10⁻ᵖᴴ / (C − 10⁻ᵖᴴ)', 'Ka = 10⁻²ᵖᴴ / [C(1−10⁻ᵖᴴ)]', 'Ka = 10⁻²ᵖᴴ / (C − 10⁻ᵖᴴ)', 'Ka = C·10⁻²ᵖᴴ / (1−10⁻ᵖᴴ)', 'Ka = 10⁻ᵖᴴ / (C − 10⁻²ᵖᴴ)'], correct: 2, feedback: 'Ka = [H₃O⁺]² / (C - [H₃O⁺]) = 10⁻²ᵖᴴ / (C - 10⁻ᵖᴴ).' },
  { id: 'q56', text: 'En utilisant les résultats précédents, quelle valeur peut être attribuée à la constante d\'acidité de l\'acide benzoïque ?', type: 'single', points: 2, options: ['Ka = 2×10⁻⁵', 'Ka = 6,3×10⁻⁵', 'Ka = 4×10⁻⁴', 'Ka = 6,3×10⁻¹⁰', 'Ka = 4×10⁻⁷'], correct: 1, feedback: 'Ka = 6,3×10⁻⁵.' },
  { id: 'q57', text: 'Une solution aqueuse d\'ammoniac possède un pH = 10,3. Quelle relation exprime correctement le taux d\'avancement final de la réaction NH₃/H₂O ?', type: 'single', points: 2, options: ['τ = 10⁻ᵖᴴ / (C.Ke)', 'τ = 10ᵖᴴ / (C.Ke)', 'τ = (10⁻ᵖᴴ.Ke)/C', 'τ = (10ᵖᴴ.Ke)/C', 'τ = (C.10ᵖᴴ)/Ke'], correct: 2, feedback: 'τ = (10⁻ᵖᴴ.Ke)/C.' },
  { id: 'q58', text: 'Sachant que log([NH₃]/[NH₄⁺]) = 1,1, quelle est la valeur du pKa du couple NH₄⁺/NH₃ ?', type: 'single', points: 2, options: ['pKa = 9,8', 'pKa = 5,4', 'pKa = 10,3', 'pKa = 4,1', 'pKa = 9,2'], correct: 4, feedback: 'pH = pKa + log([NH₃]/[NH₄⁺]) → 10,3 = pKa + 1,1 → pKa = 9,2.' },
  { id: 'q59', text: 'On mélange une solution d\'acide lactique avec une solution d\'hydroxyde de sodium. Quelle expression traduit l\'avancement final de la transformation réalisée ?', type: 'single', points: 2, options: ['xf = CBVB − (VA+VB)10^(pH−pKe)', 'xf = CAVA − (VA+VB)10^(pH−pKe)', 'xf = CBVB + (VA+VB)10^(pH−pKe)', 'xf = CAVA + (VA+VB)10^(pH−pKe)', 'xf = CAVA + (VA+VB)10^(pKe−pH)'], correct: 1, feedback: 'xf = CAVA − (VA+VB)10^(pH−pKe).' },
  { id: 'q60', text: 'À l\'état final du mélange précédent, quelle concentration correspond aux ions lactate C₃H₅O₃⁻ présents en solution ?', type: 'single', points: 2, options: ['5×10⁻² mol.L⁻¹', '2×10⁻² mol.L⁻¹', '1,5×10⁻² mol.L⁻¹', '5×10⁻³ mol.L⁻¹', '1,5×10⁻⁴ mol.L⁻¹'], correct: 0, feedback: '[C₃H₅O₃⁻] = 5×10⁻² mol.L⁻¹.' }
];

// ============================================================
// 3. المسابقة الافتراضية والبيانات الأولية
// ============================================================
const defaultConcours = {
  id: 'concours_physique_2026',
  title: 'Concours Physique 2026',
  description: '40 questions de physique de niveau avancé (Q21 à Q60)',
  duration: 30,
  date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
  category: 'medecin',
  questions: defaultConcoursQuestions
};

const defaultData = {
  students: [],
  grades: [],
  quizzes: [],
  dictionary: [],
  lessons: [],
  exercises: [],
  exams: [],
  messages: [],
  revisionRequests: [],
  latexCourses: [],
  sliderImages: ['https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=1200&h=450&fit=crop'],
  concours: [defaultConcours],
  announcements: { text: 'ستبدأ الدراسة الفعلية يوم 16/09/2025', image: null }
};

// ============================================================
// 4. تحميل وحفظ البيانات
// ============================================================
function loadData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      data = JSON.parse(JSON.stringify(defaultData));
      for (let key in parsed) {
        if (data.hasOwnProperty(key) && Array.isArray(data[key]) && Array.isArray(parsed[key])) {
          data[key] = parsed[key];
        } else if (data.hasOwnProperty(key)) {
          data[key] = parsed[key];
        }
      }
      if (!data.concours || data.concours.length === 0) {
        data.concours = [defaultConcours];
      }
    } else {
      data = JSON.parse(JSON.stringify(defaultData));
    }
  } catch (e) {
    console.warn('loadData error, using defaults', e);
    data = JSON.parse(JSON.stringify(defaultData));
  }
  if (!data.concours || data.concours.length === 0) {
    data.concours = [defaultConcours];
  }
  if (!data.sliderImages || data.sliderImages.length === 0) {
    data.sliderImages = ['https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=1200&h=450&fit=crop'];
  }
  saveData();
}

function saveData() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {}
}

// ============================================================
// 5. دوال مساعدة
// ============================================================
function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
}

function formatDate(d) {
  if (!d) return '';
  return new Date(d).toLocaleDateString('fr-FR');
}

function renderLatex() {
  if (window.MathJax && MathJax.typesetPromise) {
    MathJax.typesetPromise().catch(function() {});
  }
}

// ============================================================
// 6. عرض Concours للطالب (محسّن وجذاب)
// ============================================================
function renderStudentConcours() {
  const container = document.getElementById('concoursContainer');
  if (!container) return;

  if (!data.concours || data.concours.length === 0) {
    container.innerHTML = `
      <div style="text-align:center;padding:40px;background:#f8fafc;border-radius:16px;border:1px dashed #cbd5e1;">
        <i class="fas fa-trophy" style="font-size:48px;color:#cbd5e1;display:block;margin-bottom:15px;"></i>
        <p style="color:#475569;font-size:18px;">لا توجد مسابقات متاحة حالياً.</p>
        <p style="color:#94a3b8;font-size:14px;">سيتم إضافة مسابقات جديدة قريباً.</p>
      </div>
    `;
    return;
  }

  // أخذ أول Concours (Concours 1)
  const concours = data.concours[0];
  const studentId = currentStudent ? currentStudent.id : null;
  const results = studentId ? (JSON.parse(localStorage.getItem('concoursResults') || '{}')[studentId] || []) : [];
  const hasResult = results.some(r => r.concoursId === concours.id);
  const catLabel = concours.category === 'medecin' ? '🩺' : concours.category === 'ensa' ? '⚙️' : '📚';

  container.innerHTML = `
    <div class="concours-card-large">
      <div class="badge">${catLabel} · Concours 1</div>
      <h3>${concours.title}</h3>
      <p style="color:#475569;margin-bottom:12px;">${concours.description || ''}</p>
      <div class="meta">
        <span style="margin-left:15px;">⏱ ${concours.duration} دقيقة</span>
        <span>📝 ${concours.questions ? concours.questions.length : 0} أسئلة</span>
      </div>
      ${hasResult
        ? `<div style="background:#ecfdf5;border:1px solid #10b981;border-radius:12px;padding:12px;margin:15px 0;color:#065f46;font-weight:500;">
            ✅ لقد أكملت هذه المسابقة. <a href="javascript:void(0)" onclick="viewConcoursResult('${concours.id}')" style="color:#1e90ff;font-weight:700;">عرض النتيجة</a>
          </div>`
        : `<button class="start-btn" onclick="startConcours('${concours.id}')">
            <i class="fas fa-play"></i> بدء المسابقة الآن
          </button>`
      }
      <div style="margin-top:12px;">
        <button class="btn btn-outline btn-sm" onclick="previewConcours('${concours.id}')"><i class="fas fa-eye"></i> معاينة الأسئلة</button>
        <button class="btn btn-ghost btn-sm" onclick="renderStudentConcours()" style="margin-right:8px;"><i class="fas fa-sync"></i> تحديث</button>
      </div>
    </div>
  `;
}

// ============================================================
// 7. عرض المسابقات في لوحة الإدارة
// ============================================================
function renderConcoursAdminList() {
  const container = document.getElementById('concoursAdminList');
  if (!container) return;

  if (!data.concours || data.concours.length === 0) {
    container.innerHTML = '<p class="muted">لا توجد مسابقات.</p>';
    return;
  }

  let html = '';
  data.concours.forEach(c => {
    const catLabel = c.category === 'medecin' ? '🩺 Médecin' : c.category === 'ensa' ? '⚙️ Ensa' : '📚 Autre';
    html += `
      <div class="item" style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;padding:15px;margin-bottom:15px;">
        <h4 style="color:#0b3d91;">${c.title} <span style="font-size:12px;background:#1e90ff;color:white;padding:2px 10px;border-radius:20px;">${catLabel}</span></h4>
        <div style="color:#475569;font-size:14px;">📝 ${c.questions ? c.questions.length : 0} أسئلة | ⏱ ${c.duration} دقيقة | 📅 ${c.date ? new Date(c.date).toLocaleString('ar-EG') : 'غير محدد'}</div>
        <div style="color:#475569;font-size:14px;">${c.description || ''}</div>
        <div style="margin-top:10px;">
          <button class="btn btn-danger btn-sm" onclick="deleteConcours('${c.id}')"><i class="fa-solid fa-trash"></i> حذف</button>
          <button class="btn btn-primary btn-sm" onclick="editConcours('${c.id}')"><i class="fa-solid fa-edit"></i> تعديل</button>
          <button class="btn btn-accent btn-sm" onclick="previewConcours('${c.id}')"><i class="fa-solid fa-eye"></i> معاينة</button>
        </div>
        ${c.questions && c.questions.length > 0
          ? `<div style="margin-top:10px;border-top:1px solid #e2e8f0;padding-top:10px;"><strong>الأسئلة:</strong>${c.questions.map((q, qi) => `<div style="background:white;padding:8px 12px;border-radius:8px;margin-top:5px;"><strong>س${qi+1}:</strong> ${q.text} (${q.points} نقطة) ${q.image ? `<br><img src="${q.image}" style="max-height:50px;">` : ''}<br><span class="muted">الإجابة الصحيحة: ${q.options[q.correct-1] || 'غير محدد'}</span></div>`).join('')}</div>`
          : '<p class="muted">لا توجد أسئلة مضافة.</p>'
        }
      </div>
    `;
  });
  container.innerHTML = html;
}

// ============================================================
// 8. المؤقتات العامة
// ============================================================
function updateAllTimers() {
  var now = Date.now();

  var bacDate = new Date('2026-06-01T00:00:00').getTime();
  var diffBac = bacDate - now;
  if (diffBac > 0) {
    document.getElementById('countdownDays').textContent = Math.floor(diffBac / (1000 * 60 * 60 * 24));
    document.getElementById('countdownHours').textContent = Math.floor((diffBac % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    document.getElementById('countdownMinutes').textContent = Math.floor((diffBac % (1000 * 60 * 60)) / (1000 * 60));
    document.getElementById('countdownSeconds').textContent = Math.floor((diffBac % (1000 * 60)) / 1000);
  } else {
    document.getElementById('countdownDays').textContent = '0';
    document.getElementById('countdownHours').textContent = '0';
    document.getElementById('countdownMinutes').textContent = '0';
    document.getElementById('countdownSeconds').textContent = '0';
  }

  var medTarget = now + (24 * 24 * 60 * 60 * 1000);
  var diffMed = medTarget - now;
  if (diffMed > 0) {
    document.getElementById('medecinDays').textContent = Math.floor(diffMed / (1000 * 60 * 60 * 24));
    document.getElementById('medecinHours').textContent = Math.floor((diffMed % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    document.getElementById('medecinMinutes').textContent = Math.floor((diffMed % (1000 * 60 * 60)) / (1000 * 60));
    document.getElementById('medecinSeconds').textContent = Math.floor((diffMed % (1000 * 60)) / 1000);
  } else {
    document.getElementById('medecinDays').textContent = '0';
    document.getElementById('medecinHours').textContent = '0';
    document.getElementById('medecinMinutes').textContent = '0';
    document.getElementById('medecinSeconds').textContent = '0';
  }

  var ensaTarget = now + (25 * 24 * 60 * 60 * 1000);
  var diffEnsa = ensaTarget - now;
  if (diffEnsa > 0) {
    document.getElementById('ensaDays').textContent = Math.floor(diffEnsa / (1000 * 60 * 60 * 24));
    document.getElementById('ensaHours').textContent = Math.floor((diffEnsa % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    document.getElementById('ensaMinutes').textContent = Math.floor((diffEnsa % (1000 * 60 * 60)) / (1000 * 60));
    document.getElementById('ensaSeconds').textContent = Math.floor((diffEnsa % (1000 * 60)) / 1000);
  } else {
    document.getElementById('ensaDays').textContent = '0';
    document.getElementById('ensaHours').textContent = '0';
    document.getElementById('ensaMinutes').textContent = '0';
    document.getElementById('ensaSeconds').textContent = '0';
  }
}

// ============================================================
// 9. دوال Concours (بدء، عرض النتائج، معاينة، إلخ)
// ============================================================
function startConcours(concoursId) {
  if (!currentStudent) { alert('يجب تسجيل الدخول أولاً.'); return; }
  const concours = data.concours.find(c => c.id === concoursId);
  if (!concours) { alert('المسابقة غير موجودة.'); return; }
  if (!concours.questions || !concours.questions.length) { alert('هذه المسابقة لا تحتوي على أسئلة.'); return; }

  const results = JSON.parse(localStorage.getItem('concoursResults') || '{}');
  const studentResults = results[currentStudent.id] || [];
  if (studentResults.some(r => r.concoursId === concoursId)) {
    if (!confirm('لقد أجريت هذه المسابقة من قبل. إعادة المحاولة ستلغي النتيجة السابقة. متابعة؟')) return;
    results[currentStudent.id] = studentResults.filter(r => r.concoursId !== concoursId);
    localStorage.setItem('concoursResults', JSON.stringify(results));
  }

  currentConcours = concours;
  currentConcoursIndex = 0;
  concoursAnswers = {};
  concoursTimeLeft = concours.duration * 60;
  showConcoursInterface();
  renderConcoursQuestion();
  startConcoursTimer();
}

function showConcoursInterface() {
  document.querySelectorAll('.page-section, .student-tab-content').forEach(el => el.style.display = 'none');
  let interfaceEl = document.getElementById('concours-interface');
  if (!interfaceEl) {
    interfaceEl = document.createElement('div');
    interfaceEl.id = 'concours-interface';
    interfaceEl.className = 'concours-interface';
    document.body.appendChild(interfaceEl);
  }
  interfaceEl.style.display = 'block';
  interfaceEl.innerHTML = `
    <div class="header">
      <div><h2>🏆 ${currentConcours.title}</h2><div style="display:flex;gap:15px;font-size:14px;color:#475569;"><span>📝 السؤال <span id="concoursQNumber">1</span> من ${currentConcours.questions.length}</span><div style="width:200px;height:6px;background:#ecf0f1;border-radius:3px;overflow:hidden;"><div id="concoursProgress" style="height:100%;background:#1e90ff;width:${(1/currentConcours.questions.length)*100}%;"></div></div></div></div>
      <div style="display:flex;align-items:center;gap:15px;"><div id="concoursTimer" style="background:#10b981;color:white;padding:8px 16px;border-radius:20px;font-weight:bold;">⏱ ${Math.floor(concoursTimeLeft/60)}:${(concoursTimeLeft%60).toString().padStart(2,'0')}</div><button class="btn btn-ghost" onclick="exitConcours()">خروج</button></div>
    </div>
    <div style="max-width:800px;margin:20px auto;padding:0 20px;">
      <div id="concoursQuestionContainer" class="question-container"></div>
      <div style="display:flex;justify-content:space-between;align-items:center;margin:20px 0;">
        <button class="btn btn-primary" id="concoursPrevBtn" onclick="concoursPrevQuestion()">السابق</button>
        <div class="question-indicators" id="concoursIndicators"></div>
        <button class="btn btn-primary" id="concoursNextBtn" onclick="concoursNextQuestion()">التالي</button>
      </div>
      <div style="text-align:center;margin:20px 0;"><button class="btn btn-danger" style="padding:12px 30px;font-size:16px;" onclick="submitConcours()">إنهاء المسابقة</button></div>
    </div>
  `;
  createConcoursIndicators();
}

function renderConcoursQuestion() {
  const q = currentConcours.questions[currentConcoursIndex];
  const container = document.getElementById('concoursQuestionContainer');
  if (!container) return;
  container.innerHTML = `<h3 style="margin-bottom:15px;">السؤال ${currentConcoursIndex + 1}</h3><p style="font-size:18px;margin-bottom:20px;">${q.text}</p>`;
  if (q.image) container.innerHTML += `<img src="${q.image}" style="max-height:150px;border-radius:8px;margin-bottom:15px;">`;
  container.innerHTML += `<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;">`;
  q.options.forEach((opt, idx) => {
    const checked = concoursAnswers[q.id] === idx + 1 ? 'checked' : '';
    const borderColor = concoursAnswers[q.id] === idx + 1 ? '#10b981' : '#e1e5e9';
    const bgColor = concoursAnswers[q.id] === idx + 1 ? '#ecfdf5' : 'white';
    container.innerHTML += `<div class="option-item" onclick="selectConcoursOption(${idx})" data-opt="${idx}" style="display:flex;align-items:center;padding:12px 16px;border:2px solid ${borderColor};border-radius:8px;cursor:pointer;transition:0.3s;background:${bgColor};">
      <input type="radio" name="concours-answer" value="${idx + 1}" ${checked}>
      <span style="margin-right:8px;">${String.fromCharCode(65 + idx)}. ${opt}</span>
    </div>`;
  });
  container.innerHTML += `</div>`;
  document.getElementById('concoursQNumber').textContent = currentConcoursIndex + 1;
  document.getElementById('concoursProgress').style.width = ((currentConcoursIndex + 1) / currentConcours.questions.length * 100) + '%';
  document.getElementById('concoursPrevBtn').disabled = currentConcoursIndex === 0;
  document.getElementById('concoursNextBtn').disabled = currentConcoursIndex === currentConcours.questions.length - 1;
  updateConcoursIndicators();
}

function selectConcoursOption(idx) {
  const q = currentConcours.questions[currentConcoursIndex];
  concoursAnswers[q.id] = idx + 1;
  renderConcoursQuestion();
  updateConcoursIndicators();
}

function concoursNextQuestion() {
  if (currentConcoursIndex < currentConcours.questions.length - 1) {
    currentConcoursIndex++;
    renderConcoursQuestion();
  }
}

function concoursPrevQuestion() {
  if (currentConcoursIndex > 0) {
    currentConcoursIndex--;
    renderConcoursQuestion();
  }
}

function createConcoursIndicators() {
  const container = document.getElementById('concoursIndicators');
  if (!container) return;
  container.innerHTML = '';
  currentConcours.questions.forEach((_, idx) => {
    const btn = document.createElement('button');
    btn.textContent = idx + 1;
    btn.dataset.idx = idx;
    btn.onclick = function() { currentConcoursIndex = idx; renderConcoursQuestion(); };
    container.appendChild(btn);
  });
}

function updateConcoursIndicators() {
  const indicators = document.querySelectorAll('#concoursIndicators button');
  indicators.forEach((btn, idx) => {
    const q = currentConcours.questions[idx];
    const answered = concoursAnswers[q.id] !== undefined && concoursAnswers[q.id] !== null;
    btn.className = '';
    if (idx === currentConcoursIndex) btn.classList.add('active');
    else if (answered) btn.classList.add('answered');
  });
}

function startConcoursTimer() {
  if (concoursTimer) clearInterval(concoursTimer);
  concoursTimer = setInterval(function() {
    if (concoursTimeLeft <= 0) {
      clearInterval(concoursTimer);
      alert('⏰ انتهى الوقت! سيتم احتساب الإجابات الحالية.');
      submitConcours();
      return;
    }
    concoursTimeLeft--;
    const timerEl = document.getElementById('concoursTimer');
    if (timerEl) {
      const mins = Math.floor(concoursTimeLeft / 60);
      const secs = concoursTimeLeft % 60;
      timerEl.textContent = `⏱ ${mins}:${secs.toString().padStart(2, '0')}`;
      if (concoursTimeLeft < 120) timerEl.style.background = '#ef4444';
      else if (concoursTimeLeft < 300) timerEl.style.background = '#f59e0b';
    }
  }, 1000);
}

function submitConcours() {
  const total = currentConcours.questions.length;
  let answered = 0;
  currentConcours.questions.forEach(q => { if (concoursAnswers[q.id] !== undefined) answered++; });
  if (answered < total) { if (!confirm(`لديك ${total - answered} سؤال(اً) لم تتم الإجابة عليه. إنهاء؟`)) return; }
  if (!confirm('هل أنت متأكد من إنهاء المسابقة؟')) return;
  clearInterval(concoursTimer);
  calculateConcoursResult();
}

function calculateConcoursResult() {
  let earned = 0,
    total = 0;
  const details = [];
  currentConcours.questions.forEach(q => {
    total += q.points;
    const userAns = concoursAnswers[q.id];
    const correct = userAns === q.correct;
    if (correct) earned += q.points;
    details.push({ question: q.text, userAnswer: userAns ? q.options[userAns - 1] : 'لم يجب', correctAnswer: q.options[q
        .correct - 1], isCorrect: correct, points: q.points });
  });
  const score = Math.round((earned / total) * 20 * 100) / 100;
  const percent = Math.round((earned / total) * 100);
  if (currentStudent) {
    const results = JSON.parse(localStorage.getItem('concoursResults') || '{}');
    if (!results[currentStudent.id]) results[currentStudent.id] = [];
    results[currentStudent.id].push({ concoursId: currentConcours.id, score: score, percentage: percent, date: new Date()
        .toISOString(), details: details });
    localStorage.setItem('concoursResults', JSON.stringify(results));
  }
  showConcoursResult(score, percent, details);
}

function showConcoursResult(score, percent, details) {
  const container = document.getElementById('concoursQuestionContainer');
  if (!container) return;
  const color = score >= 10 ? '#10b981' : '#ef4444';
  let html = `<div class="concours-result" style="text-align:center;">
    <h2 style="color:#0b3d91;">🏆 نتيجة المسابقة</h2>
    <div class="score-circle" style="background:${color};width:130px;height:130px;border-radius:50%;display:flex;flex-direction:column;align-items:center;justify-content:center;margin:20px auto;font-weight:900;color:white;box-shadow:0 4px 20px rgba(0,0,0,0.15);">
      <span style="font-size:30px;">${score}/20</span><span style="font-size:16px;">${percent}%</span>
    </div>
    <p style="font-size:18px;margin:10px 0;">${score >= 10 ? '🎉 مبروك! نتيجة ممتازة' : '💪 نتيجة جيدة، واصل التقدم'}</p>
    <div style="text-align:right;max-height:300px;overflow-y:auto;margin-top:20px;"><h4>تفاصيل الإجابات:</h4>`;
  details.forEach((d, i) => {
    html += `<div style="padding:12px;margin-bottom:8px;border-radius:8px;background:${d.isCorrect ? '#ecfdf5' : '#fef2f2'};border-right:4px solid ${d.isCorrect ? '#10b981' : '#ef4444'};">
      <strong>س${i + 1}:</strong> ${d.question}<br>
      <span style="font-size:14px;">إجابتك: ${d.userAnswer} | الإجابة الصحيحة: ${d.correctAnswer}</span>
      <span style="float:left;font-weight:bold;color:${d.isCorrect ? '#10b981' : '#ef4444'};">${d.isCorrect ? '✅' : '❌'} ${d.isCorrect ? '+' : ''}${d.points}</span>
    </div>`;
  });
  html += `</div><button class="btn btn-primary" style="margin-top:20px;" onclick="exitConcours()">العودة</button></div>`;
  container.innerHTML = html;
  document.querySelector('.question-indicators').style.display = 'none';
  document.querySelector('.concours-interface .header .btn-ghost').textContent = 'العودة';
}

function exitConcours() {
  if (concoursTimer) clearInterval(concoursTimer);
  const interfaceEl = document.getElementById('concours-interface');
  if (interfaceEl) interfaceEl.style.display = 'none';
  if (currentStudent) {
    document.getElementById('student-dashboard').style.display = 'block';
    switchStudentTab('concours');
  }
}

function viewConcoursResult(concoursId) {
  if (!currentStudent) return;
  const results = JSON.parse(localStorage.getItem('concoursResults') || '{}');
  const studentResults = results[currentStudent.id] || [];
  const result = studentResults.find(r => r.concoursId === concoursId);
  if (!result) { alert('لا توجد نتيجة.'); return; }
  showConcoursResult(result.score, result.percentage, result.details || []);
}

function previewConcours(concoursId) {
  const concours = data.concours.find(c => c.id === concoursId);
  if (!concours) return;
  const div = document.createElement('div');
  div.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);z-index:99999;display:flex;align-items:center;justify-content:center;';
  let html = `<div style="background:white;border-radius:16px;padding:30px;max-width:600px;max-height:80vh;overflow-y:auto;margin:20px;">
    <h2 style="color:#0b3d91;">${concours.title}</h2><p>${concours.description || ''}</p>
    <p>⏱ ${concours.duration} دقيقة | 📝 ${concours.questions ? concours.questions.length : 0} أسئلة</p><hr style="margin:15px 0;">`;
  if (concours.questions) {
    concours.questions.forEach((q, i) => {
      html += `<div style="margin-bottom:15px;padding:10px;background:#f8fafc;border-radius:8px;">
        <strong>س${i + 1}:</strong> ${q.text}${q.image ? `<br><img src="${q.image}" style="max-height:80px;margin:5px 0;">` : ''}
        <div style="font-size:14px;color:#475569;">${q.options.map((opt, oi) => `${String.fromCharCode(65 + oi)}. ${opt} ${q.correct === oi + 1 ? ' ✅' : ''}`).join(' | ')}</div>
      </div>`;
    });
  } else { html += '<p class="muted">لا توجد أسئلة.</p>'; }
  html += `<button onclick="this.closest('div').remove()" class="btn btn-primary" style="margin-top:15px;">إغلاق</button></div>`;
  div.innerHTML = html;
  document.body.appendChild(div);
}

function deleteConcours(id) {
  if (!confirm('حذف المسابقة؟')) return;
  data.concours = data.concours.filter(c => c.id !== id);
  saveData();
  renderConcoursAdminList();
  if (currentStudent) renderStudentConcours();
}

function editConcours(id) {
  const c = data.concours.find(co => co.id === id);
  if (!c) return;
  document.getElementById('concoursTitle').value = c.title;
  document.getElementById('concoursDuration').value = c.duration;
  document.getElementById('concoursDate').value = c.date ? c.date.slice(0, 16) : '';
  document.getElementById('concoursDescription').value = c.description || '';
  document.getElementById('concoursCategory').value = c.category || 'autre';
  alert('تم تحميل البيانات للتعديل.');
}

// ============================================================
// 10. دوال الطالب (تسجيل الدخول، عرض لوحة التحكم)
// ============================================================
function loginStudent() {
  const username = prompt('Nom d\'utilisateur:');
  if (!username) return;
  const password = prompt('Mot de passe:');
  const student = data.students.find(s => s.username === username && s.password === password);
  if (student) {
    currentStudent = student;
    document.getElementById('student-dashboard').classList.add('active');
    document.getElementById('studentWelcome').textContent = 'Bienvenue, ' + student.fullname;
    renderStudentDashboard();
    renderStudentTabs();
    renderStudentConcours();
    renderStudentConcoursResults();
  } else {
    alert('Identifiants incorrects.');
  }
}

function logoutStudent() {
  currentStudent = null;
  document.getElementById('student-dashboard').classList.remove('active');
  renderAll();
}

function renderStudentDashboard() {
  if (!currentStudent) return;
  // باقي دوال عرض لوحة الطالب (مختصرة)
  renderStudentConcours();
  renderStudentConcoursResults();
}

function renderStudentConcoursResults() {
  const container = document.getElementById('studentConcoursResults');
  if (!container) return;
  if (!currentStudent) { container.innerHTML = '<p class="muted">سجل الدخول لعرض النتائج.</p>'; return; }
  const results = JSON.parse(localStorage.getItem('concoursResults') || '{}')[currentStudent.id] || [];
  if (!results.length) { container.innerHTML = '<p class="muted">لم تشارك في أي مسابقة بعد.</p>'; return; }
  let html = '';
  results.forEach(r => {
    const c = data.concours.find(co => co.id === r.concoursId);
    html += `<div class="item" style="background:white;padding:12px;border-radius:10px;border:1px solid #e2e8f0;margin-bottom:8px;"><h4>${c ? c.title : 'مسابقة'}</h4><div>⭐ النتيجة: <strong>${r.score}/20</strong> (${r.percentage}%)</div><div class="muted">📅 ${new Date(r.date).toLocaleString('ar-EG')}</div></div>`;
  });
  container.innerHTML = html;
}

function renderStudentTabs() {
  document.querySelectorAll('.student-tab').forEach(tab => {
    tab.addEventListener('click', function() {
      document.querySelectorAll('.student-tab').forEach(t => t.classList.remove('active'));
      this.classList.add('active');
      document.querySelectorAll('.student-tab-content').forEach(c => c.classList.remove('active'));
      const target = document.getElementById('student-' + this.dataset.tab + '-tab');
      if (target) target.classList.add('active');
      if (this.dataset.tab === 'concours') {
        renderStudentConcours();
        renderStudentConcoursResults();
      }
      if (this.dataset.tab === 'cours') renderLatex();
    });
  });
}

function switchStudentTab(tabName) {
  document.querySelectorAll('.student-tab').forEach(t => t.classList.remove('active'));
  const btn = document.querySelector('.student-tab[data-tab="' + tabName + '"]');
  if (btn) btn.classList.add('active');
  document.querySelectorAll('.student-tab-content').forEach(c => c.classList.remove('active'));
  const target = document.getElementById('student-' + tabName + '-tab');
  if (target) target.classList.add('active');
  if (tabName === 'concours') {
    renderStudentConcours();
    renderStudentConcoursResults();
  }
}

// ============================================================
// 11. دوال الإدارة (تسجيل الدخول، إلخ)
// ============================================================
function loginAdmin() {
  const user = prompt('Nom d\'utilisateur administrateur:');
  if (user !== 'Adminali') { alert('Nom incorrect.'); return; }
  const pass = prompt('Mot de passe:');
  if (pass === 'aliali2001') {
    currentAdmin = true;
    document.getElementById('admin-panel').classList.add('active');
    renderAll();
  } else { alert('Mot de passe incorrect.'); }
}

function logoutAdmin() {
  currentAdmin = false;
  document.getElementById('admin-panel').classList.remove('active');
}

// ============================================================
// 12. دوال العرض الأساسية
// ============================================================
function renderAll() {
  renderConcoursAdminList();
  if (currentStudent) {
    renderStudentConcours();
    renderStudentConcoursResults();
  }
  updateStats();
}

function updateStats() {
  document.getElementById('stats-students').textContent = data.students.length;
  document.getElementById('stats-quiz').textContent = data.quizzes.reduce((acc, q) => acc + (q.questions ? q.questions
    .length : 0), 0);
  document.getElementById('stats-dictionary').textContent = data.dictionary.length;
  document.getElementById('stats-grades').textContent = data.grades.length;
  document.getElementById('stats-messages').textContent = data.messages.length;
  document.getElementById('stats-latex').textContent = data.latexCourses.length;
  document.getElementById('stats-concours').textContent = data.concours.length;
}

// ============================================================
// 13. إعداد الأحداث
// ============================================================
function setupEvents() {
  document.getElementById('studentLoginBtn').addEventListener('click', loginStudent);
  document.getElementById('loginBtn').addEventListener('click', loginAdmin);
  document.getElementById('studentLogoutBtn').addEventListener('click', logoutStudent);
  document.getElementById('logoutBtn').addEventListener('click', logoutAdmin);

  document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', function(e) {
      e.preventDefault();
      const section = this.dataset.section;
      document.querySelectorAll('.page-section').forEach(s => s.style.display = 'none');
      if (section === 'home') { document.getElementById('home-section').scrollIntoView({ behavior: 'smooth' }); return; }
      const target = document.getElementById(section);
      if (target) { target.style.display = 'block';
        target.scrollIntoView({ behavior: 'smooth' }); }
      document.getElementById('student-dashboard').classList.remove('active');
    });
  });

  document.querySelectorAll('.feature-card').forEach(card => {
    card.addEventListener('click', function() {
      const section = this.dataset.section;
      document.querySelectorAll('.page-section').forEach(s => s.style.display = 'none');
      const target = document.getElementById(section);
      if (target) { target.style.display = 'block';
        target.scrollIntoView({ behavior: 'smooth' }); }
      document.getElementById('student-dashboard').classList.remove('active');
    });
  });

  document.querySelectorAll('.admin-tab-link').forEach(link => {
    link.addEventListener('click', function(e) {
      e.preventDefault();
      document.querySelectorAll('.admin-menu li').forEach(li => li.classList.remove('active'));
      this.parentElement.classList.add('active');
      const tab = this.dataset.tab;
      document.querySelectorAll('.admin-section').forEach(s => s.classList.remove('active'));
      document.getElementById(tab).classList.add('active');
      if (tab === 'tab-concours') { renderConcoursAdminList();
        populateConcoursSelect(); }
    });
  });

  // زر العودة للأعلى
  const backToTop = document.getElementById('backToTop');
  window.addEventListener('scroll', function() {
    if (window.scrollY > 300) backToTop.classList.add('visible');
    else backToTop.classList.remove('visible');
  });
  backToTop.addEventListener('click', function() { window.scrollTo({ top: 0, behavior: 'smooth' }); });

  // منع الروابط الفارغة
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', function(e) {
      const href = this.getAttribute('href');
      if (href === '#' || href === '#!') e.preventDefault();
    });
  });

  // حفظ الطالب
  document.getElementById('btnSaveStudent').addEventListener('click', function() {
    const id = document.getElementById('stId').value || generateId();
    const fullname = document.getElementById('stFullname').value.trim();
    const username = document.getElementById('stUsername').value.trim();
    const password = document.getElementById('stPassword').value.trim();
    const code = document.getElementById('stCode').value.trim();
    const classroom = document.getElementById('stClassroom').value.trim();
    if (!fullname || !username || !password || !code) { alert('Remplissez tous les champs.'); return; }
    if (data.students.some(s => s.username === username && s.id !== id)) { alert('Nom d\'utilisateur déjà utilisé.'); return; }
    if (data.students.some(s => s.code === code && s.id !== id)) { alert('Code parcours déjà utilisé.'); return; }
    const existing = data.students.find(s => s.id === id);
    if (existing) Object.assign(existing, { fullname, username, password, code, classroom });
    else data.students.push({ id, fullname, username, password, code, classroom });
    saveData();
    document.getElementById('stId').value = '';
    document.getElementById('stFullname').value = '';
    document.getElementById('stUsername').value = '';
    document.getElementById('stPassword').value = '';
    document.getElementById('stCode').value = '';
    document.getElementById('stClassroom').value = '';
    renderAll();
  });

  document.getElementById('btnResetStudent').addEventListener('click', function() {
    document.getElementById('stId').value = '';
    document.getElementById('stFullname').value = '';
    document.getElementById('stUsername').value = '';
    document.getElementById('stPassword').value = '';
    document.getElementById('stCode').value = '';
    document.getElementById('stClassroom').value = '';
  });

  // حفظ العلامة
  document.getElementById('btnSaveGrade').addEventListener('click', function() {
    const id = document.getElementById('grId').value || generateId();
    const studentId = document.getElementById('grStudent').value;
    const subject = document.getElementById('grSubject').value.trim();
    const title = document.getElementById('grTitle').value.trim();
    const date = document.getElementById('grDate').value;
    const score = parseFloat(document.getElementById('grScore').value);
    const remark = document.getElementById('grNote').value.trim();
    if (!studentId || !subject || !title || isNaN(score)) { alert('Remplissez tous les champs.'); return; }
    const existing = data.grades.find(g => g.id === id);
    if (existing) Object.assign(existing, { studentId, subject, title, date, score, remark });
    else data.grades.push({ id, studentId, subject, title, date, score, remark });
    saveData();
    document.getElementById('grId').value = '';
    document.getElementById('grSubject').value = '';
    document.getElementById('grTitle').value = '';
    document.getElementById('grDate').value = '';
    document.getElementById('grScore').value = '';
    document.getElementById('grNote').value = '';
    renderAll();
  });

  document.getElementById('btnResetGrade').addEventListener('click', function() {
    document.getElementById('grId').value = '';
    document.getElementById('grSubject').value = '';
    document.getElementById('grTitle').value = '';
    document.getElementById('grDate').value = '';
    document.getElementById('grScore').value = '';
    document.getElementById('grNote').value = '';
  });

  // Concours Admin
  document.getElementById('btnCreateConcours').addEventListener('click', function() {
    const title = document.getElementById('concoursTitle').value.trim();
    const duration = parseInt(document.getElementById('concoursDuration').value) || 30;
    const date = document.getElementById('concoursDate').value;
    const description = document.getElementById('concoursDescription').value.trim();
    const category = document.getElementById('concoursCategory').value;
    if (!title) { alert('أدخل عنوان المسابقة.'); return; }
    data.concours.push({ id: generateId(), title, description, duration, date, category, questions: [] });
    saveData();
    document.getElementById('concoursTitle').value = '';
    document.getElementById('concoursDescription').value = '';
    renderConcoursAdminList();
    populateConcoursSelect();
    if (currentStudent) renderStudentConcours();
    alert('تم إنشاء المسابقة بنجاح.');
  });

  document.getElementById('btnAddConcoursQuestion').addEventListener('click', function() {
    const concoursId = document.getElementById('adminSelectConcours').value;
    if (!concoursId) { alert('اختر مسابقة أولاً.'); return; }
    const concours = data.concours.find(c => c.id === concoursId);
    if (!concours) { alert('المسابقة غير موجودة.'); return; }
    const text = document.getElementById('concoursQuestionText').value.trim();
    if (!text) { alert('أدخل نص السؤال.'); return; }
    const options = [];
    for (let i = 1; i <= 6; i++) { const val = document.getElementById('concoursOpt' + i).value.trim(); if (val) options.push(
        val); }
    if (options.length < 2) { alert('أضف خيارين على الأقل.'); return; }
    const correct = parseInt(document.getElementById('concoursCorrect').value);
    if (isNaN(correct) || correct < 1 || correct > options.length) { alert('رقم الإجابة الصحيحة يجب أن يكون بين 1 و ' +
        options.length + '.'); return; }
    const points = parseFloat(document.getElementById('concoursPoints').value) || 2;
    let image = '';
    const fileInput = document.getElementById('concoursQuestionImage');
    if (fileInput && fileInput.files && fileInput.files[0]) {
      const reader = new FileReader();
      reader.onload = function(e) {
        image = e.target.result;
        concours.questions.push({ id: generateId(), text, image, options, correct, points });
        saveData();
        renderConcoursAdminList();
        document.getElementById('concoursQuestionText').value = '';
        document.getElementById('concoursOpt1').value = '';
        document.getElementById('concoursOpt2').value = '';
        document.getElementById('concoursOpt3').value = '';
        document.getElementById('concoursOpt4').value = '';
        document.getElementById('concoursOpt5').value = '';
        document.getElementById('concoursOpt6').value = '';
        document.getElementById('concoursCorrect').value = '1';
        document.getElementById('concoursQuestionImage').value = '';
        if (currentStudent) renderStudentConcours();
        alert('تم إضافة السؤال بنجاح.');
      };
      reader.readAsDataURL(fileInput.files[0]);
    } else {
      concours.questions.push({ id: generateId(), text, image, options, correct, points });
      saveData();
      renderConcoursAdminList();
      document.getElementById('concoursQuestionText').value = '';
      document.getElementById('concoursOpt1').value = '';
      document.getElementById('concoursOpt2').value = '';
      document.getElementById('concoursOpt3').value = '';
      document.getElementById('concoursOpt4').value = '';
      document.getElementById('concoursOpt5').value = '';
      document.getElementById('concoursOpt6').value = '';
      document.getElementById('concoursCorrect').value = '1';
      document.getElementById('concoursQuestionImage').value = '';
      if (currentStudent) renderStudentConcours();
      alert('تم إضافة السؤال بنجاح.');
    }
  });

  function populateConcoursSelect() {
    const sel = document.getElementById('adminSelectConcours');
    if (!sel) return;
    const current = sel.value;
    sel.innerHTML = data.concours.map(c =>
      `<option value="${c.id}">${c.title} (${c.category === 'medecin' ? '🩺' : c.category === 'ensa' ? '⚙️' : '📚'})</option>`
      ).join('');
    if (current) sel.value = current;
  }
}

// ============================================================
// 14. INIT (تشغيل كل شيء)
// ============================================================
function init() {
  console.log('🚀 بدء تشغيل Lycée de l\'Excellence...');
  loadData();
  renderAll();
  updateAllTimers();
  setInterval(updateAllTimers, 1000);
  setupEvents();
  console.log('✅ تم تشغيل الموقع بنجاح!');
  console.log('📝 عدد المسابقات المحملة:', data.concours.length);
  if (data.concours.length > 0) {
    console.log('📝 المسابقة الأولى:', data.concours[0].title);
    console.log('📝 عدد الأسئلة:', data.concours[0].questions.length);
  }
  if (currentStudent) {
    renderStudentConcours();
    renderStudentConcoursResults();
  }
}

// تشغيل عند تحميل الصفحة
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
