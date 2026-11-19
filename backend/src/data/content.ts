/**
 * Ózgermeytuǵın katalog maǵlıwmatları (grantlar, mentorlar, vakansiyalar, keńesler).
 * Mentor hám kárxana atları — úlgi maǵlıwmat (olar store.ts arqalı bazaǵa jazıladı).
 */
import type { ChecklistStage, Grant, Level, Mentor, Student, SupportTopic, Vacancy, Video } from '../types.js';

const B: Level = 'Bakalavr';
const M: Level = 'Magistr';
const P: Level = 'PhD';

export const LEVELS: Level[] = [B, M, P];

export const GRANTS: Grant[] = [
  { id: 'el-yurt-umidi', name: 'El-yurt umidi', country: 'Ózbekstan', kind: 'Mámleketlik', levels: [B, M, P], covers: 'oqıw tólemi, jasaw, viza, medicinalıq saqlandırıw, jol', site: 'el-yurt.uz', url: 'https://el-yurt.uz' },
  { id: 'gks', name: 'Global Korea Scholarship', country: 'Koreya', kind: 'Shet el', levels: [B, M, P], covers: 'oqıw, aylıq stipendiya, aviabilet, koreys tili kursı', site: 'studyinkorea.go.kr', url: 'https://www.studyinkorea.go.kr' },
  { id: 'turkiye-burslari', name: 'Türkiye Bursları', country: 'Túrkiya', kind: 'Shet el', levels: [B, M, P], covers: 'oqıw, aylıq stipendiya, jataqxana, saqlandırıw, túrk tili kursı', site: 'turkiyeburslari.gov.tr', url: 'https://www.turkiyeburslari.gov.tr' },
  { id: 'daad', name: 'DAAD', country: 'Germaniya', kind: 'Shet el', levels: [M, P], covers: 'aylıq stipendiya, saqlandırıw, jol (programmaǵa qaray)', site: 'daad.de', url: 'https://www.daad.de' },
  { id: 'chevening', name: 'Chevening', country: 'Ullı Britaniya', kind: 'Shet el', levels: [M], covers: 'bir jıllıq magistratura: oqıw, jasaw, aviabilet', site: 'chevening.org', url: 'https://www.chevening.org' },
  { id: 'erasmus-mundus', name: 'Erasmus Mundus', country: 'Evropa', kind: 'Shet el', levels: [M], covers: 'bir neshe Evropa elinde oqıw, jasaw hám jol', site: 'erasmus-plus.ec.europa.eu', url: 'https://erasmus-plus.ec.europa.eu' },
  { id: 'stipendium-hungaricum', name: 'Stipendium Hungaricum', country: 'Vengriya', kind: 'Shet el', levels: [B, M, P], covers: 'oqıw, aylıq stipendiya, jataqxana, saqlandırıw', site: 'stipendiumhungaricum.hu', url: 'https://stipendiumhungaricum.hu' },
  { id: 'csc', name: 'Qıtay húkimeti stipendiyası (CSC)', country: 'Qıtay', kind: 'Shet el', levels: [B, M, P], covers: 'oqıw, jataqxana, aylıq stipendiya, saqlandırıw', site: 'campuschina.org', url: 'https://www.campuschina.org' },
  { id: 'russia-quota', name: 'Rossiya húkimeti kvotası', country: 'Rossiya', kind: 'Shet el', levels: [B, M, P], covers: 'biypul oqıw, jataqxana', site: 'education-in-russia.com', url: 'https://education-in-russia.com' },
];

/** Úlgi mentorlar — birinshi iske túsiriwde bazaǵa jazıladı */
export const SEED_MENTORS: Omit<Mentor, 'userId' | 'bio'>[] = [
  { id: 'azamat-tleuov', name: 'Azamat Tleuov', initials: 'AT', job: 'Injener', university: 'TU München', country: 'Germaniya', year: 2021, topics: ['DAAD', 'Hújjet tapsırıw', 'Injeneriya'], languages: ['qaraqalpaq', 'rus', 'nemis'] },
  { id: 'saltanat-jumabaeva', name: 'Saltanat Jumabaeva', initials: 'SJ', job: 'Mámleketlik xızmetker', university: 'Glasgow universiteti', country: 'Ullı Britaniya', year: 2021, topics: ['Chevening', 'Esse jazıw', 'Intervyu'], languages: ['qaraqalpaq', 'ózbek', 'inglis'] },
  { id: 'nursuliw-otepova', name: 'Nursulıw Ótepova', initials: 'NÓ', job: 'Programmist', university: 'Seul milliy universiteti', country: 'Koreya', year: 2020, topics: ['GKS', 'Koreys tili', 'IT'], languages: ['qaraqalpaq', 'rus', 'koreys'] },
  { id: 'bekzat-allambergenov', name: 'Bekzat Allambergenov', initials: 'BA', job: 'Shıpaker', university: 'Stambul universiteti', country: 'Túrkiya', year: 2019, topics: ['Türkiye Bursları', 'Medicina', 'Beyimlesiw'], languages: ['qaraqalpaq', 'túrk'] },
  { id: 'madina-aytmuratova', name: 'Madina Aytmuratova', initials: 'MA', job: 'Agronom', university: 'Debrecen universiteti', country: 'Vengriya', year: 2022, topics: ['Stipendium Hungaricum', 'Awıl xojalıǵı'], languages: ['qaraqalpaq', 'ózbek', 'inglis'] },
  { id: 'gulshat-embergenova', name: 'Gúlshat Embergenova', initials: 'GE', job: 'Ekonomist', university: 'Moskva mámleketlik universiteti', country: 'Rossiya', year: 2018, topics: ['Húkimet kvotası', 'Ekonomika', 'Beyimlesiw'], languages: ['qaraqalpaq', 'rus'] },
];

/** Úlgi vakansiyalar — birinshi iske túsiriwde bazaǵa jazıladı */
export const SEED_VACANCIES: Omit<Vacancy, 'ownerId' | 'status' | 'createdAt'>[] = [
  { id: 'energy-engineer', title: 'Energetika injeneri', initials: 'EN', company: 'Energetika kárxanası', field: 'Injeneriya', city: 'Nókis', type: 'Tolıq kún', requirement: 'shet el diplomı (magistr), energetika tarawı' },
  { id: 'backend-dev', title: 'Backend programmist', initials: 'IT', company: 'IT kompaniya', field: 'IT', city: 'Nókis / onlayn', type: 'Tolıq kún', requirement: 'IT boyınsha diplom, inglis tili B2' },
  { id: 'cardiologist', title: 'Kardiolog shıpaker', initials: 'MD', company: 'Medicina orayı', field: 'Medicina', city: 'Nókis', type: 'Tolıq kún', requirement: 'medicina diplomı, nostrifikaciya' },
  { id: 'agronomist', title: 'Agronom-texnolog', initials: 'AX', company: 'Awıl xojalıǵı kárxanası', field: 'Awıl xojalıǵı', city: 'Qaraqalpaqstan', type: 'Tolıq kún', requirement: 'agronomiya yamasa suw xojalıǵı boyınsha diplom' },
  { id: 'economist', title: 'Ekonomist-analitik', initials: 'BK', company: 'Finans shólkemi', field: 'Ekonomika', city: 'Nókis', type: 'Tolıq kún', requirement: 'ekonomika yamasa finans boyınsha magistr' },
  { id: 'english-teacher', title: 'Inglis tili oqıtıwshısı', initials: 'OT', company: 'Bilimlendiriw orayı', field: 'Bilimlendiriw', city: 'Nókis', type: 'Yarım kún', requirement: 'shet el diplomı, IELTS 7.0+' },
];

export const CHECKLISTS: ChecklistStage[] = [
  {
    id: 'before',
    title: 'Ketiwden aldın',
    items: [
      { id: 'before-passport', title: 'Pasport hám viza', description: 'Pasporttıń múddeti oqıw múddetinen keminde 6 ay uzaq bolsın.' },
      { id: 'before-translation', title: 'Hújjetlerdiń awdarması', description: 'Diplom, attestat hám tuwılıw haqqındaǵı gúwalıqtıń notarial awdarması; kerek bolsa apostil.' },
      { id: 'before-insurance', title: 'Medicinalıq saqlandırıw', description: 'Kóp eller viza ushın talap etedi. Grant qaplay ma — tekseriń.' },
      { id: 'before-consulate', title: 'Konsullıq esabına turıw', description: 'Barǵan elińizdegi Ózbekstan elshixanası yamasa konsullıǵınıń baylanısın saqlań.' },
      { id: 'before-money', title: 'Pul hám bank kartası', description: 'Birinshi 1–2 ayǵa jetetuǵın qarjı hám xalıqaralıq karta.' },
      { id: 'before-housing', title: 'Turaq jay', description: 'Jataqxana yamasa kvartira aldınnan kelisilgen bolsın.' },
    ],
  },
  {
    id: 'arrive',
    title: 'Barǵannan keyingi birinshi ay',
    items: [
      { id: 'arrive-registration', title: 'Jergilikli registraciya', description: 'Kóp elde belgili kún ishinde dizimnen ótiw májbúriy — universitetten sorań.' },
      { id: 'arrive-office', title: 'Universitettiń xalıqaralıq bólimi', description: 'Sol jerde keńes, beyimlesiw programmaları hám psixolog bar.' },
      { id: 'arrive-sim', title: 'Jergilikli SIM-karta hám transport', description: 'Studentlik jeńillikler kóbinese bar.' },
      { id: 'arrive-budget', title: 'Óz búdjetińizdi dúziń', description: 'Ayına qansha qarjı ketiwin jazıp barıń.' },
      { id: 'arrive-community', title: 'Jerles studentler menen tanısıń', description: 'Platformadaǵı sol eldegi studentler hám mentorlar.' },
    ],
  },
  {
    id: 'back',
    title: 'Elge qaytqanda',
    items: [
      { id: 'back-nostrification', title: 'Diplomdı tán alıw (nostrifikaciya)', description: 'Shet el diplomın Ózbekstanda tán aldırıw tártibin aldınnan biliń.' },
      { id: 'back-profile', title: 'Profildi jańalaw', description: '«Pitkerip qayttı» statusın belgileń — vakansiyalar sizge usınıladı.' },
      { id: 'back-mentor', title: 'Mentor bolıw', description: 'Óz tájiriybeńiz benen keyingi jaslarǵa járdem beriń.' },
    ],
  },
];

export const VIDEOS: Video[] = [
  { id: 'visa', title: 'Viza alıw: qádemme-qádem', author: 'Mentor · Ullı Britaniya' },
  { id: 'motivation-letter', title: 'Grant ushın motivaciya xatı qalay jazıladı', author: 'Mentor · Chevening' },
  { id: 'korea-first-month', title: 'Koreyada birinshi ay: ne kútiw kerek', author: 'Mentor · Koreya' },
  { id: 'turkey-budget', title: 'Túrkiyada jataqxana hám búdjet', author: 'Mentor · Túrkiya' },
  { id: 'loneliness', title: 'Shet elde jalǵızlıq hám stress penen qalay gúresiw', author: 'Psixolog' },
  { id: 'back-home-job', title: 'Elge qaytıp, jumıs tabıw', author: 'Mentor · Germaniya' },
];

export const SUPPORT_TOPICS: SupportTopic[] = [
  { title: 'Beyimlesiw qıyın', description: 'Jańa til, jańa adamlar, úydi saǵınıw.' },
  { title: 'Imtixan hám oqıw basımı', description: 'Grantımdı joǵaltaman ba degen qorqınısh.' },
  { title: 'Jalǵızlıq', description: 'Sóylesetuǵın hesh kim joq sıyaqlı.' },
  { title: 'Qısım yamasa qorlaw', description: 'Kimdir sizge zıyan keltirse yamasa qorqıtsa.' },
  { title: 'Uyqısızlıq, sharshaw', description: 'Hesh nárse islegińiz kelmeydi.' },
  { title: 'Shańaraq hám pul máseleleri', description: 'Úyge aytıwǵa uyalasız.' },
];

/** Birinshi iske túsiriwde bazaǵa jazılatuǵın úlgi studentler */
export const SEED_STUDENTS: Omit<Student, 'id' | 'userId' | 'createdAt'>[] = [
  { name: 'Gúlnara Saparova', status: 'now', country: 'Koreya', university: 'KAIST', field: 'IT', grant: 'Global Korea Scholarship', years: '2023–2027' },
  { name: 'Azamat Tleuov', status: 'back', country: 'Germaniya', university: 'TU München', field: 'Injeneriya', grant: 'DAAD', years: '2019–2021' },
  { name: 'Dilnoza Abdiraxmanova', status: 'now', country: 'Túrkiya', university: 'Ankara universiteti', field: 'Medicina', grant: 'Türkiye Bursları', years: '2022–2028' },
  { name: 'Erlan Kenesbaev', status: 'now', country: 'Rossiya', university: 'Qazan federal universiteti', field: 'Neft hám gaz', grant: 'Rossiya húkimeti kvotası', years: '2024–2028' },
  { name: 'Saltanat Jumabaeva', status: 'back', country: 'Ullı Britaniya', university: 'Glasgow universiteti', field: 'Mámleketlik basqarıw', grant: 'Chevening', years: '2020–2021' },
  { name: 'Asılbek Nurmanov', status: 'now', country: 'Qıtay', university: 'Tsinghua universiteti', field: 'Energetika', grant: 'Qıtay húkimeti stipendiyası (CSC)', years: '2023–2025' },
  { name: 'Madina Aytmuratova', status: 'back', country: 'Vengriya', university: 'Debrecen universiteti', field: 'Awıl xojalıǵı', grant: 'Stipendium Hungaricum', years: '2018–2022' },
  { name: 'Jasur Seytmuratov', status: 'now', country: 'Ullı Britaniya', university: 'UCL', field: 'Ekonomika', grant: 'El-yurt umidi', years: '2025–2026' },
];
