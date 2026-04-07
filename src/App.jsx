import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
    Plus, Trash2, Info, CheckCircle2, AlertCircle,
    Globe, Receipt, ArrowRight, ShieldAlert, ShieldCheck,
    ChevronDown, Smartphone, Stethoscope, PiggyBank, Briefcase, Users, Zap,
    Search, X, Check, Pencil
} from 'lucide-react';
import { Analytics } from '@vercel/analytics/react';

// --- YEAR CONFIGURATION (Add new years here) ---
const TAX_YEARS = [2025, 2026];

// --- TAX LOGIC & DATA ---
// Default tax brackets (used when year-specific brackets don't exist)
const DEFAULT_TAX_BRACKETS = [
    { range: 5000, rate: 0.00 },
    { range: 15000, rate: 0.01 },
    { range: 15000, rate: 0.03 },
    { range: 15000, rate: 0.06 },
    { range: 20000, rate: 0.11 },
    { range: 30000, rate: 0.19 },
    { range: 300000, rate: 0.25 },
    { range: 200000, rate: 0.26 },
    { range: 1400000, rate: 0.28 },
    { range: Infinity, rate: 0.30 }
];

// Year-specific tax brackets (override DEFAULT_TAX_BRACKETS if needed)
// Add entries here only if brackets differ from default
const TAX_BRACKETS_BY_YEAR = {
    // Example: 2027: [...different brackets...]
};

const DICT = {
    zh: {
        title: "LHDN Tax Engine",
        subtitle: "马来西亚个人所得税结算引擎",
        incomeTitle: "1. 收入与预缴税 (Income & PCB)",
        monthlySalary: "每月基本薪资 (Monthly Base Salary)",
        bonus: "全年花红与津贴 (Annual Bonus & Allowances)",
        pcb: "已缴纳的预扣税 (PCB Paid)",
        pcbHelp: "参考 EA Form 上的 Potongan Cukai Bulanan",
        addEmployment: "添加 EA Form / 收入来源 (Add Source)",
        monthsLabel: "工作月数 (Months)",
        removeBtn: "移除 (Remove)",
        reliefTitle: "2. 税务减免申报 (Tax Reliefs)",
        autoDeduct: "系统已自动扣除 RM9,000 个人基础减免",
        selectRelief: "浏览所有减免项目...",
        amountPlaceholder: "0.00",
        addBtn: "添加 / 更新",
        noReliefs: "尚未申报任何手动减免",
        noReliefsSub: "KWSP 已根据您的薪水自动估算注入",
        limitExceeded: "法定上限:",
        effectiveDeduction: "有效扣除",
        taxSaved: "实际省下",
        settlement: "税务对账单",
        gross: "全年总收入 (Gross Income)",
        indRelief: "个人基础减免 (Individual Relief)",
        yourReliefs: "累计税务减免 (Total Reliefs)",
        chargeable: "计税收入 (Chargeable Income)",
        chargeableHelp: "决定您所属税阶 (Tax Bracket) 的基准金额",
        taxSteps: "税阶计算明细 (Bracket Breakdown)",
        rebateTriggered: "符合税务回扣条件 (Chargeable ≤ RM35k)，获 RM400 Rebate",
        taxAssessed: "全年应缴税额 (Tax Assessed)",
        pcbDeducted: "减去已预扣的 PCB",
        finalRefund: "LHDN 将退还给您 (Tax Refund)",
        finalPayable: "您需要补交税款 (Tax Balance to Pay)",
        allSettled: "对账平息 (Zero Balance)",
        autoKwspTip: "基于输入的收入自动估算的 11% KWSP",
        thresholdTitle: "报税门槛检测 (Threshold Check)",
        thresholdSafe: "扣除 KWSP 后年收入超 RM37,333，依法您必须提呈报税表 (e-Filing)。",
        thresholdBelowWithPcb: "年收入低于门槛，依法无需报税。但强烈建议报税以全额索回 PCB 退款！",
        thresholdBelowNoPcb: "年收入低于门槛，无需报税。主动申报有助于建立良好的银行信用记录。",
        quickAdd: "快速添加 (Quick Add):",
        disclaimer: "免责声明：本工具仅供估算参考，并非绝对准确的税务承诺应用。",
        monthlyMode: "月薪计算 (Monthly)",
        annualMode: "年薪计算 (Annual)",
        annualSalary: "全年总薪资 (Gross Annual)",
        annualSalaryHelp: "全年薪资 + 花红等",
        editRelief: "编辑减免",
        editBtn: "更新",
        cancelBtn: "取消"
    },
    en: {
        title: "LHDN Tax Engine",
        subtitle: "Malaysia Personal Income Tax Settlement Engine",
        incomeTitle: "1. Income & PCB",
        monthlySalary: "Monthly Base Salary",
        bonus: "Annual Bonus & Allowances",
        pcb: "PCB Paid (Monthly Deductions)",
        pcbHelp: "Refer to Potongan Cukai Bulanan on your EA Form",
        addEmployment: "Add EA Form / Income Source",
        monthsLabel: "Months",
        removeBtn: "Remove",
        reliefTitle: "2. Tax Reliefs Declaration",
        autoDeduct: "Auto-deducted RM9,000 Individual Relief",
        selectRelief: "Browse all tax reliefs...",
        amountPlaceholder: "0.00",
        addBtn: "Add / Update",
        noReliefs: "No manual reliefs declared yet",
        noReliefsSub: "KWSP has been auto-injected based on your income",
        limitExceeded: "Statutory Cap:",
        effectiveDeduction: "Effective",
        taxSaved: "Tax Saved",
        settlement: "Final Settlement",
        gross: "Total Gross Income",
        indRelief: "Individual Relief",
        yourReliefs: "Total Claimed Reliefs",
        chargeable: "Chargeable Income",
        chargeableHelp: "Baseline amount that determines your Tax Bracket",
        taxSteps: "Tax Bracket Breakdown",
        rebateTriggered: "Triggered RM400 Tax Rebate (Chargeable ≤ RM35k)",
        taxAssessed: "Total Tax Assessed",
        pcbDeducted: "Minus PCB Already Paid",
        finalRefund: "LHDN Will Refund You",
        finalPayable: "Tax Balance to Pay",
        allSettled: "Zero Balance",
        autoKwspTip: "Auto-estimated 11% KWSP based on inputted income",
        thresholdTitle: "Compliance Threshold Check",
        thresholdSafe: "Net income exceeds RM37,333. You are legally required to file taxes via e-Filing.",
        thresholdBelowWithPcb: "Net income below RM37,333. Legally not required, but HIGHLY RECOMMENDED to file to claim back your PCB refund!",
        thresholdBelowNoPcb: "Net income below RM37,333. Voluntary filing helps build a solid banking Credit Profile.",
        quickAdd: "Quick Add:",
        disclaimer: "Disclaimer: This calculator is for estimation purposes only and is not a fully accurate promised app to rely on.",
        monthlyMode: "Monthly",
        annualMode: "Annually",
        annualSalary: "Total Gross Salary",
        annualSalaryHelp: "Gross Salary + Bonus etc.",
        editRelief: "Edit Relief",
        editBtn: "Update",
        cancelBtn: "Cancel"
    },
    ms: {
        title: "LHDN Tax Engine",
        subtitle: "Enjin Penyelesaian Cukai Pendapatan Peribadi Malaysia",
        incomeTitle: "1. Pendapatan & PCB",
        monthlySalary: "Gaji Pokok Bulanan",
        bonus: "Bonus & Elaun Tahunan",
        pcb: "PCB Dibayar (Potongan Bulanan)",
        pcbHelp: "Rujuk Potongan Cukai Bulanan pada Borang EA anda",
        addEmployment: "Tambah Borang EA / Sumber Pendapatan",
        monthsLabel: "Bulan",
        removeBtn: "Buang",
        reliefTitle: "2. Pelepasan Cukai",
        autoDeduct: "Pelepasan Individu RM9,000 telah ditolak secara automatik",
        selectRelief: "Layari semua pelepasan cukai...",
        amountPlaceholder: "0.00",
        addBtn: "Tambah / Kemaskini",
        noReliefs: "Tiada pelepasan manual diisytihar",
        noReliefsSub: "KWSP telah disuntik secara automatik berdasarkan pendapatan anda",
        limitExceeded: "Had Berkanun:",
        effectiveDeduction: "Efektif",
        taxSaved: "Cukai Dijimat",
        settlement: "Penyelesaian Akhir",
        gross: "Jumlah Pendapatan Kasar",
        indRelief: "Pelepasan Individu",
        yourReliefs: "Jumlah Pelepasan Dituntut",
        chargeable: "Pendapatan Bercukai",
        chargeableHelp: "Jumlah asas yang menentukan Kurungan Cukai anda",
        taxSteps: "Pecahan Kurungan Cukai",
        rebateTriggered: "Rebat Cukai RM400 Dicetuskan (Bercukai ≤ RM35k)",
        taxAssessed: "Jumlah Cukai Ditaksir",
        pcbDeducted: "Tolak PCB Telah Dibayar",
        finalRefund: "LHDN Akan Bayar Balik Anda",
        finalPayable: "Baki Cukai Perlu Dibayar",
        allSettled: "Baki Sifar",
        autoKwspTip: "Anggaran automatik 11% KWSP berdasarkan pendapatan",
        thresholdTitle: "Semakan Ambang Pematuhan",
        thresholdSafe: "Pendapatan bersih melebihi RM37,333. Anda wajib memfailkan cukai melalui e-Filing.",
        thresholdBelowWithPcb: "Pendapatan bersih di bawah RM37,333. Tidak wajib, tetapi AMAT DISYORKAN untuk menuntut bayaran balik PCB!",
        thresholdBelowNoPcb: "Pendapatan bersih di bawah RM37,333. Pemfailan sukarela membantu membina Profil Kredit bank yang kukuh.",
        quickAdd: "Tambah Cepat:",
        disclaimer: "Penafian: Kalkulator ini hanya untuk tujuan anggaran dan bukan aplikasi yang menjanjikan ketepatan sepenuhnya.",
        monthlyMode: "Bulanan",
        annualMode: "Tahunan",
        annualSalary: "Jumlah Gaji Kasar",
        annualSalaryHelp: "Gaji Kasar + Bonus dll.",
        editRelief: "Edit Pelepasan",
        editBtn: "Kemaskini",
        cancelBtn: "Batal"
    }
};

const GROUPS = {
    FOUNDATION: { zh: '基础与保险 (Foundation & Insurance)', en: 'Foundation & Insurance', ms: 'Asas & Insurans' },
    LIFESTYLE: { zh: '生活与休闲 (Lifestyle & Leisure)', en: 'Lifestyle & Leisure', ms: 'Gaya Hidup & Riadah' },
    MEDICAL: { zh: '医疗与健康 (Health & Medical)', en: 'Health & Medical', ms: 'Kesihatan & Perubatan' },
    HOUSING: { zh: '住房与进修 (Housing & Upskilling)', en: 'Housing & Upskilling', ms: 'Perumahan & Pendidikan' },
    FAMILY: { zh: '家庭与子女 (Family & Children)', en: 'Family & Children', ms: 'Keluarga & Anak' },
    STRUCTURAL: { zh: '个人/配偶结构减免 (Structural)', en: 'Structural (Spouse/Disabled)', ms: 'Struktur (Pasangan/OKU)' }
};

const SHARED_RELIEFS = [
    { id: 'spouse', group: GROUPS.STRUCTURAL, label: { zh: '配偶减免 (Spouse Relief)', en: 'Spouse Relief', ms: 'Pelepasan Pasangan' }, max: 4000, desc: { zh: '配偶无收入或选择联合报税', en: 'Spouse has no income or joint assessment', ms: 'Pasangan tiada pendapatan atau taksiran bersama' } },
    { id: 'disabled_self', group: GROUPS.STRUCTURAL, label: { zh: '残疾人士基础 (Disabled Individual)', en: 'Disabled Individual', ms: 'Individu OKU' }, max: 6000, desc: { zh: '个人残疾额外减免', en: 'Additional relief for disabled self', ms: 'Pelepasan tambahan untuk OKU sendiri' } },
    { id: 'disabled_spouse', group: GROUPS.STRUCTURAL, label: { zh: '残疾配偶 (Disabled Spouse)', en: 'Disabled Spouse', ms: 'Pasangan OKU' }, max: 6000, desc: { zh: '配偶残疾额外减免', en: 'Additional relief for disabled spouse', ms: 'Pelepasan tambahan untuk pasangan OKU' } },
];

// Entries shared identically between YA 2025 & 2026
const BASE_RELIEFS = [
    { id: 'kwsp', group: GROUPS.FOUNDATION, label: { zh: 'KWSP (公积金)', en: 'KWSP (EPF)', ms: 'KWSP (EPF)' }, max: 4000, desc: { zh: '法定的11%或自愿缴纳部分', en: 'Statutory 11% or voluntary contribution', ms: 'Caruman berkanun 11% atau sukarela' } },
    { id: 'prs', group: GROUPS.FOUNDATION, label: { zh: 'PRS (私人退休计划)', en: 'PRS', ms: 'PRS' }, max: 3000, desc: { zh: '私人退休金计划缴纳', en: 'Private Retirement Scheme', ms: 'Skim Persaraan Swasta' } },
    { id: 'housing', group: GROUPS.HOUSING, label: { zh: '首购房贷利息 (Housing Loan)', en: '1st Home Loan Interest', ms: 'Faedah Pinjaman Rumah Pertama' }, max: 7000, desc: { zh: '50万以下扣RM7k，50-75万扣RM5k', en: 'RM7k (<RM500k), RM5k (<RM750k)', ms: 'RM7k (<RM500k), RM5k (<RM750k)' } },
];

const RELIEF_DATABASE = {
    2025: [
        ...SHARED_RELIEFS,
        ...BASE_RELIEFS,
        { id: 'life_ins', group: GROUPS.FOUNDATION, label: { zh: '人寿保险 (Life Insurance)', en: 'Life Insurance', ms: 'Insurans Hayat' }, max: 3000, desc: { zh: '传统人寿险 (包含配偶/子女)', en: 'Life Insurance (incl. spouse/child)', ms: 'Insurans hayat (termasuk pasangan/anak)' } },
        { id: 'edu_med_ins', group: GROUPS.FOUNDATION, label: { zh: '医疗与教育保险', en: 'Edu & Medical Ins', ms: 'Ins. Pendidikan & Perubatan' }, max: 3000, desc: { zh: '医药卡或教育保单', en: 'Medical card or education policy', ms: 'Kad perubatan atau polisi pendidikan' } },
        { id: 'socso', group: GROUPS.FOUNDATION, label: { zh: 'SOCSO / PERKESO', en: 'SOCSO / PERKESO', ms: 'PERKESO' }, max: 350, desc: { zh: '社保缴纳', en: 'SOCSO contribution', ms: 'Caruman PERKESO' } },
        { id: 'lifestyle', group: GROUPS.LIFESTYLE, label: { zh: '日常消费 (Lifestyle)', en: 'Lifestyle', ms: 'Gaya Hidup' }, max: 2500, desc: { zh: '手机/电脑/书籍/网络/技能进修', en: 'PC/Smartphone/Books/Internet/Upskilling', ms: 'PC/Telefon/Buku/Internet/Peningkatan Kemahiran' } },
        { id: 'sports', group: GROUPS.LIFESTYLE, label: { zh: '运动项目 (Sports)', en: 'Sports Equipment', ms: 'Peralatan Sukan' }, max: 1000, desc: { zh: '运动器材、场地费、健身房', en: 'Sports equipment, gym, facility fees', ms: 'Peralatan sukan, gim, yuran fasiliti' } },
        { id: 'eco', group: GROUPS.LIFESTYLE, label: { zh: '绿色环保 (Green Living)', en: 'Green Living (EV/Compost)', ms: 'Hijau (EV/Kompos)' }, max: 2500, desc: { zh: '家用 EV 充电设备或厨余处理机', en: 'Home EV charger or food waste composter', ms: 'Pengecas EV rumah atau mesin kompos' } },
        { id: 'med_self', group: GROUPS.MEDICAL, label: { zh: '自身/配偶/子女医疗', en: 'Medical (Self/Spouse/Child)', ms: 'Perubatan (Sendiri/Pasangan/Anak)' }, max: 10000, desc: { zh: '严重疾病、生育、体检/疫苗/洗牙(含上限)', en: 'Serious illness, fertility, checkup/vaccination', ms: 'Penyakit serius, kesuburan, pemeriksaan/vaksinasi' } },
        { id: 'med_parents', group: GROUPS.MEDICAL, label: { zh: '父母医疗 (Parents Medical)', en: 'Parents Medical', ms: 'Perubatan Ibu Bapa' }, max: 8000, desc: { zh: '父母的医疗/牙医/护理及体检', en: 'Medical treatment, dental, care for parents', ms: 'Rawatan perubatan, pergigian, penjagaan ibu bapa' } },
        { id: 'disabled_equip', group: GROUPS.MEDICAL, label: { zh: '残疾辅助设备', en: 'Disability Equipment', ms: 'Peralatan OKU' }, max: 6000, desc: { zh: '为自身/家属购买的辅助设备', en: 'Equipment for disabled self/dependents', ms: 'Peralatan untuk OKU sendiri/tanggungan' } },
        { id: 'edu_self', group: GROUPS.HOUSING, label: { zh: '个人进修 (Education)', en: 'Education Fees', ms: 'Yuran Pendidikan' }, max: 7000, desc: { zh: '硕博课程，或特定技能提升(限RM2k)', en: 'Masters/PhD, or skills enhancement', ms: 'Sarjana/PhD, atau peningkatan kemahiran' } },
        { id: 'sspn', group: GROUPS.FAMILY, label: { zh: 'SSPN (教育储蓄)', en: 'SSPN (Net Savings)', ms: 'SSPN (Simpanan Bersih)' }, max: 8000, desc: { zh: '当年净存入数额', en: 'Net deposit for the year', ms: 'Simpanan bersih untuk tahun tersebut' } },
        { id: 'taska', group: GROUPS.FAMILY, label: { zh: '托儿所/幼儿园 (Childcare)', en: 'Childcare/Kindergarten', ms: 'Taska/Tadika' }, max: 3000, desc: { zh: '6岁及以下注册机构费用', en: 'Registered childcare fees (<= 6 yrs)', ms: 'Yuran penjagaan berdaftar (<= 6 tahun)' } },
        { id: 'child_under18', group: GROUPS.FAMILY, label: { zh: '子女 (< 18岁)', en: 'Child (< 18)', ms: 'Anak (< 18)' }, max: 2000, desc: { zh: '未满18岁未婚子女', en: 'Unmarried child under 18', ms: 'Anak belum berkahwin bawah 18 tahun' } },
        { id: 'child_18plus', group: GROUPS.FAMILY, label: { zh: '子女进修 (> 18岁)', en: 'Child (18+ Tertiary)', ms: 'Anak (18+ Pengajian)' }, max: 8000, desc: { zh: '全职修读文凭/学位', en: 'Pursuing full-time Diploma/Degree', ms: 'Mengikuti Diploma/Ijazah sepenuh masa' } },
        { id: 'breastfeeding', group: GROUPS.FAMILY, label: { zh: '哺乳器材 (Breastfeeding)', en: 'Breastfeeding Equip', ms: 'Peralatan Penyusuan' }, max: 1000, desc: { zh: '限女性，2岁以下孩童 (每两年一次)', en: 'Female only, child < 2 yrs (Once per 2 yrs)', ms: 'Wanita sahaja, anak < 2 tahun (Sekali setiap 2 tahun)' } }
    ],
    2026: [
        ...SHARED_RELIEFS,
        ...BASE_RELIEFS,
        { id: 'life_ins', group: GROUPS.FOUNDATION, label: { zh: '人寿保险 (Life Insurance)', en: 'Life Insurance', ms: 'Insurans Hayat' }, max: 3000, desc: { zh: '含为子女购买的人寿险', en: 'Includes life insurance for children', ms: 'Termasuk insurans hayat untuk anak' } },
        { id: 'edu_med_ins', group: GROUPS.FOUNDATION, label: { zh: '医疗与教育保险', en: 'Edu & Medical Ins', ms: 'Ins. Pendidikan & Perubatan' }, max: 4000, desc: { zh: '医药卡或教育保单', en: 'Medical card or education policy', ms: 'Kad perubatan atau polisi pendidikan' } },
        { id: 'socso', group: GROUPS.FOUNDATION, label: { zh: 'SOCSO / EIS', en: 'SOCSO / EIS', ms: 'PERKESO / SIP' }, max: 350, desc: { zh: '社保缴纳', en: 'SOCSO & EIS contribution', ms: 'Caruman PERKESO & SIP' } },
        { id: 'lifestyle', group: GROUPS.LIFESTYLE, label: { zh: '日常消费 (Lifestyle)', en: 'Lifestyle', ms: 'Gaya Hidup' }, max: 2500, desc: { zh: '书籍/电子设备/网络/技能进修', en: 'Books/Devices/Internet/Upskilling', ms: 'Buku/Peranti/Internet/Peningkatan Kemahiran' } },
        { id: 'eco_cctv', group: GROUPS.LIFESTYLE, label: { zh: 'EV/厨余机/CCTV', en: 'EV/Compost/CCTV', ms: 'EV/Kompos/CCTV' }, max: 2500, desc: { zh: '家用安防与环保设施', en: 'CCTV, Food Waste, EV Charging', ms: 'CCTV, sisa makanan, pengecas EV' } },
        { id: 'sports', group: GROUPS.LIFESTYLE, label: { zh: '运动项目 (Sports)', en: 'Sports Equipment', ms: 'Peralatan Sukan' }, max: 1000, desc: { zh: '器材、场地费、健身房、运动课程', en: 'Equipment, gym, classes, competition fees', ms: 'Peralatan, gim, kelas, yuran pertandingan' } },
        { id: 'cuticuti', group: GROUPS.LIFESTYLE, label: { zh: '本地旅游 (Local Travel)', en: 'Local Travel', ms: 'Pelancongan Domestik' }, max: 1000, desc: { zh: '国内景点门票/文化表演', en: 'Attraction tickets, cultural/art events', ms: 'Tiket tarikan, acara budaya/seni' } },
        { id: 'med_self', group: GROUPS.MEDICAL, label: { zh: '重大/预防医疗', en: 'Critical & Preventive Med', ms: 'Perubatan Kritikal & Pencegahan' }, max: 10000, desc: { zh: '涵盖所有 KKM 批准的体检/疫苗/测试', en: 'Checkups, vaccines, Covid/mental testing', ms: 'Pemeriksaan, vaksinasi, ujian Covid/mental' } },
        { id: 'med_parents', group: GROUPS.MEDICAL, label: { zh: '父母医疗 (Parents Medical)', en: 'Parents Medical', ms: 'Perubatan Ibu Bapa' }, max: 8000, desc: { zh: '父母的医疗护理支出', en: 'Medical expenses for parents', ms: 'Perbelanjaan perubatan untuk ibu bapa' } },
        { id: 'disabled_equip', group: GROUPS.MEDICAL, label: { zh: '基本残疾辅助', en: 'Basic Disability Equip', ms: 'Peralatan Asas OKU' }, max: 6000, desc: { zh: '为自身/配偶/子女/父母购买', en: 'Equipment for self/spouse/child/parents', ms: 'Peralatan untuk sendiri/pasangan/anak/ibu bapa' } },
        { id: 'edu_self', group: GROUPS.HOUSING, label: { zh: '个人进修 (Education)', en: 'Education Fees', ms: 'Yuran Pendidikan' }, max: 7000, desc: { zh: '自我提升及高等教育学费', en: 'Tertiary education and self-improvement', ms: 'Pendidikan tinggi dan peningkatan diri' } },
        { id: 'sspn', group: GROUPS.FAMILY, label: { zh: 'SSPN (教育储蓄)', en: 'SSPN Scheme', ms: 'Skim SSPN' }, max: 8000, desc: { zh: 'SSPN-i 净存入数额', en: 'SSPN-i Net Savings', ms: 'Simpanan Bersih SSPN-i' } },
        { id: 'taska', group: GROUPS.FAMILY, label: { zh: '学前/托儿费 (Childcare)', en: 'Childcare/Preschool', ms: 'Taska/Prasekolah' }, max: 3000, desc: { zh: '12岁及以下孩童', en: 'Children below 12 years old', ms: 'Kanak-kanak bawah 12 tahun' } },
        { id: 'child_under18', group: GROUPS.FAMILY, label: { zh: '未婚子女 (< 18岁)', en: 'Unmarried Child (< 18)', ms: 'Anak Belum Berkahwin (< 18)' }, max: 2000, desc: { zh: '18岁以下或全职学生', en: 'Below 18 / full-time students', ms: 'Bawah 18 / pelajar sepenuh masa' } },
        { id: 'child_18plus', group: GROUPS.FAMILY, label: { zh: '子女进修 (> 18岁)', en: 'Child (Tertiary)', ms: 'Anak (Pengajian Tinggi)' }, max: 8000, desc: { zh: '大学预科、本科或以上', en: 'Foundation, Bachelor degree or higher', ms: 'Asasi, Ijazah Sarjana Muda atau lebih tinggi' } },
        { id: 'breastfeeding', group: GROUPS.FAMILY, label: { zh: '哺乳器材 (Breastfeeding)', en: 'Breastfeeding Equip', ms: 'Peralatan Penyusuan' }, max: 1000, desc: { zh: '限女性，2岁以下孩童', en: 'Female taxpayers, children < 2 years', ms: 'Pembayar cukai wanita, anak < 2 tahun' } }
    ]
};

// --- SHARED HELPERS ---
const calcGrossIncome = (emps, incomeMode) => emps.reduce((sum, emp) => {
    if (incomeMode === 'annual') {
        return sum + (parseFloat(emp.annualSalary) || 0);
    }
    const sal = parseFloat(emp.monthlySalary) || 0;
    const m = parseInt(emp.months) || 0;
    const b = parseFloat(emp.bonus) || 0;
    return sum + (sal * m) + b;
}, 0);

// Custom Hook for State Persistence
function useStickyState(defaultValue, key, validator = null) {
    const [value, setValue] = useState(() => {
        try {
            const stickyValue = window.localStorage.getItem(key);
            const parsed = stickyValue !== null ? JSON.parse(stickyValue) : defaultValue;
            // Apply validator if provided, return defaultValue if invalid
            if (validator && !validator(parsed)) {
                return defaultValue;
            }
            return parsed;
        } catch (err) {
            return defaultValue;
        }
    });

    useEffect(() => {
        window.localStorage.setItem(key, JSON.stringify(value));
    }, [key, value]);

    return [value, setValue];
}

// Validator for reliefs array - ensures amounts are reasonable numbers
const validateReliefs = (reliefs) => {
    if (!Array.isArray(reliefs)) return false;
    return reliefs.every(r =>
        r &&
        typeof r.categoryId === 'string' &&
        typeof r.amount === 'number' &&
        !isNaN(r.amount) &&
        r.amount >= 0 &&
        r.amount <= 1000000 // Max reasonable relief amount
    );
};

export default function App() {
    const [lang, setLang] = useStickyState('en', 'lhdn-lang');
    const t = DICT[lang];
    const [year, setYear] = useStickyState(2026, 'lhdn-year');
    
    // 'monthly' or 'annual'
    const [incomeMode, setIncomeMode] = useStickyState('annual', 'lhdn-income-mode');

    const [employments, setEmployments] = useStickyState([
        { id: 'emp-1', monthlySalary: '', months: 12, bonus: '', pcb: '', annualSalary: '' }
    ], 'lhdn-employments');

    const [userReliefs, setUserReliefs] = useStickyState([], 'lhdn-reliefs', validateReliefs);

    const [selectedReliefId, setSelectedReliefId] = useState('');
    const [reliefAmount, setReliefAmount] = useState('');
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    // Modal State
    const [isReliefsInfoOpen, setIsReliefsInfoOpen] = useState(false);
    const [modalSearchQuery, setModalSearchQuery] = useState('');

    // Edit State for inline relief editing
    const [editingReliefId, setEditingReliefId] = useState(null);
    const [editingAmount, setEditingAmount] = useState('');

    const dropdownRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const availableReliefs = RELIEF_DATABASE[year];

    const groupedReliefs = useMemo(() => {
        const groups = {};
        availableReliefs.forEach(rel => {
            const groupName = rel.group[lang];
            if (!groups[groupName]) groups[groupName] = [];
            groups[groupName].push(rel);
        });
        return groups;
    }, [availableReliefs, lang]);

    const selectedItemInfo = useMemo(() => {
        return availableReliefs.find(r => r.id === selectedReliefId);
    }, [selectedReliefId, availableReliefs]);

    // Auto EPF Injection Logic - only runs when there's actual income
    useEffect(() => {
        const gross = calcGrossIncome(employments, incomeMode);

        if (gross > 0) {
            const estimatedKwsp = Math.round(gross * 0.11);
            setUserReliefs(prev => {
                // Only update if user hasn't manually set KWSP
                const hasManualKwsp = prev.some(r => r.categoryId === 'kwsp' && !r.isAuto);
                if (hasManualKwsp) return prev; // Don't override manual entry

                const filtered = prev.filter(r => r.categoryId !== 'kwsp');
                return [...filtered, { id: 'auto_kwsp', categoryId: 'kwsp', amount: estimatedKwsp, isAuto: true }];
            });
        } else {
            // Only remove auto KWSP when no income, keep manual entries
            setUserReliefs(prev => prev.filter(r => r.categoryId !== 'kwsp' || !r.isAuto));
        }
    }, [employments, incomeMode, year, setUserReliefs]);

    const handleYearChange = (newYear) => {
        setYear(newYear);
        // Clear all manual reliefs when changing years (relief definitions may differ)
        setUserReliefs(prev => prev.filter(r => r.isAuto));
        setSelectedReliefId('');
        setReliefAmount('');
    };

    const handleAddRelief = () => {
        if (!selectedReliefId || !reliefAmount || isNaN(reliefAmount)) return;
        const amountVal = parseFloat(reliefAmount);
        if (amountVal < 0) return;

        setUserReliefs(prev => {
            // Remove any existing entry for this category (replace, don't stack)
            const filtered = prev.filter(r => r.categoryId !== selectedReliefId);

            const newRelief = {
                id: Date.now().toString(),
                categoryId: selectedReliefId,
                amount: amountVal,
                isAuto: false
            };

            return [...filtered, newRelief];
        });
        setSelectedReliefId('');
        setReliefAmount('');
    };

    const handleQuickAdd = (id) => {
        setSelectedReliefId(id);
        document.getElementById('relief-amount-input').focus();
    };

    // Edit relief handlers
    const startEditRelief = (relief) => {
        // Find the actual relief entry from userReliefs using the category ID
        const actualEntry = userReliefs.find(r => r.categoryId === relief.id && !r.isAuto);
        const actualAmount = actualEntry ? actualEntry.amount : 0;

        setEditingReliefId(relief.id);
        setEditingAmount(Math.round(actualAmount).toString());
    };

    const cancelEditRelief = () => {
        setEditingReliefId(null);
        setEditingAmount('');
    };

    const saveEditRelief = (categoryId) => {
        if (!editingAmount || isNaN(editingAmount)) return;
        const amountVal = parseFloat(editingAmount);
        if (amountVal < 0) return;

        setUserReliefs(prev => {
            // Remove all entries for this category and add the new amount
            const filtered = prev.filter(r => r.categoryId !== categoryId);
            return [...filtered, {
                id: Date.now().toString(),
                categoryId: categoryId,
                amount: amountVal,
                isAuto: false
            }];
        });
        setEditingReliefId(null);
        setEditingAmount('');
    };

    const updateEmployment = (id, field, value) => {
        // Prevent negative values for monetary fields
        if (['monthlySalary', 'bonus', 'pcb', 'annualSalary'].includes(field)) {
            const numValue = parseFloat(value);
            if (numValue < 0) return;
        }
        setEmployments(prev => prev.map(emp =>
            emp.id === id ? { ...emp, [field]: value } : emp
        ));
    };

    const addEmployment = () => {
        setEmployments(prev => [
            ...prev,
            { id: Date.now().toString(), monthlySalary: '', months: 1, bonus: '', pcb: '', annualSalary: '' }
        ]);
    };

    const removeEmployment = (id) => {
        setEmployments(prev => prev.filter(emp => emp.id !== id));
    };

    const calculations = useMemo(() => {
        const grossIncome = calcGrossIncome(employments, incomeMode);
        const pcb = employments.reduce((sum, emp) => sum + (parseFloat(emp.pcb) || 0), 0);
        const INDIVIDUAL_RELIEF = 9000;
        const taxBrackets = TAX_BRACKETS_BY_YEAR[year] || DEFAULT_TAX_BRACKETS;

        // Single-pass: Calculate relief breakdown, totals, and capping
        let totalClaimedReliefs = 0;
        const reliefBreakdown = availableReliefs.map(cat => {
            const items = userReliefs.filter(r => r.categoryId === cat.id);
            const userTotalForCat = items.reduce((sum, r) => sum + r.amount, 0);
            const cappedAmount = Math.min(userTotalForCat, cat.max);
            totalClaimedReliefs += cappedAmount;
            return {
                ...cat,
                userTotal: userTotalForCat,
                cappedAmount,
                taxImpact: 0, // Will be filled after marginal rate is known
                isAuto: items.some(i => i.isAuto)
            };
        }).filter(r => r.userTotal > 0);

        let chargeableIncome = Math.max(0, grossIncome - INDIVIDUAL_RELIEF - totalClaimedReliefs);

        // Calculate Tax and find Marginal Rate
        let taxAssessed = 0;
        let remainingIncome = chargeableIncome;
        let marginalRate = 0;
        const taxSteps = [];

        for (const bracket of taxBrackets) {
            if (remainingIncome <= 0) break;
            const taxableInThisBracket = Math.min(remainingIncome, bracket.range);
            const taxForThisBracket = taxableInThisBracket * bracket.rate;
            if (taxForThisBracket > 0) {
                marginalRate = bracket.rate;
                taxSteps.push({ rate: Math.round(bracket.rate * 100), amount: taxableInThisBracket, tax: taxForThisBracket });
            }
            taxAssessed += taxForThisBracket;
            remainingIncome -= taxableInThisBracket;
        }

        // Backfill tax impact now that marginal rate is known
        reliefBreakdown.forEach(r => { r.taxImpact = Math.round(r.cappedAmount * marginalRate); });

        let rebate = 0;
        if (chargeableIncome > 0 && chargeableIncome <= 35000) {
            rebate = Math.min(400, taxAssessed);
            taxAssessed -= rebate;
        }

        const finalBalance = taxAssessed - pcb;

        // Threshold Check
        const kwspRecord = userReliefs.find(r => r.categoryId === 'kwsp');
        const kwspDeductedForThreshold = kwspRecord ? Math.min(kwspRecord.amount, 4000) : 0;
        const isBelowThreshold = grossIncome > 0 && (grossIncome - kwspDeductedForThreshold) < 37333;

        return {
            grossIncome, pcb, chargeableIncome, totalClaimedReliefs,
            individualRelief: INDIVIDUAL_RELIEF, reliefBreakdown, taxSteps,
            rebate, taxAssessed, finalBalance, isBelowThreshold,
            marginalRate: Math.round(marginalRate * 100)
        };
    }, [employments, incomeMode, userReliefs, availableReliefs, year]);

    return (
        <div className="min-h-screen bg-slate-50 p-4 md:p-8 font-sans text-slate-900 selection:bg-blue-200">
            <div className="max-w-6xl mx-auto space-y-6">

                {/* Header - Apple-esque Minimalism */}
                <header className="flex flex-col md:flex-row md:items-center justify-between bg-white px-6 py-5 rounded-3xl shadow-sm ring-1 ring-slate-200">
                    <div className="flex items-center gap-3">
                        <div>
                            <h1 className="text-xl font-bold tracking-tight text-slate-900 leading-tight">
                                {t.title}
                            </h1>
                            <p className="text-sm text-slate-500 font-medium">{t.subtitle}</p>
                        </div>
                    </div>

                    <div className="mt-5 md:mt-0 flex items-center gap-3">
                        {/* Language Segmented Control */}
                        <div className="flex bg-slate-100 p-1 rounded-full ring-1 ring-slate-200">
                            {[{ code: 'en', label: 'EN' }, { code: 'zh', label: '中文' }, { code: 'ms', label: 'BM' }].map(l => (
                                <button
                                    key={l.code} onClick={() => setLang(l.code)}
                                    className={`px-3.5 py-1.5 rounded-full text-sm font-semibold transition-all duration-200 flex items-center gap-1 ${lang === l.code ? 'bg-white shadow-sm text-slate-900 ring-1 ring-slate-200/50' : 'text-slate-500 hover:text-slate-700'}`}
                                >
                                    {lang === l.code && <Globe size={13} />} {l.label}
                                </button>
                            ))}
                        </div>
                        {/* Year Segmented Control */}
                        <div className="flex bg-slate-100 p-1 rounded-full ring-1 ring-slate-200">
                            {TAX_YEARS.map(y => (
                                <button
                                    key={y} onClick={() => handleYearChange(y)}
                                    className={`px-5 py-1.5 rounded-full text-sm font-semibold transition-all duration-200 ${year === y ? 'bg-white shadow-sm text-slate-900 ring-1 ring-slate-200/50' : 'text-slate-500 hover:text-slate-700'
                                        }`}
                                >
                                    {y === TAX_YEARS[TAX_YEARS.length - 1] ? `YA ${y} ⚡` : `YA ${y}`}
                                </button>
                            ))}
                        </div>
                    </div>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                    {/* Left Column: Inputs & Logic */}
                    <div className="lg:col-span-7 space-y-8 min-w-0">

                        {/* Income Section */}
                        <section className="bg-white p-6 md:p-8 rounded-3xl shadow-sm ring-1 ring-slate-200">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                                <h2 className="text-lg font-bold flex items-center gap-2 text-slate-900">
                                    <Briefcase className="text-blue-500" size={20} /> {t.incomeTitle}
                                </h2>
                                
                                {/* Income Mode Toggle */}
                                <div className="flex bg-slate-100 p-1 rounded-full ring-1 ring-slate-200/80 shrink-0 min-w-[300px] h-11">
                                    <button
                                        onClick={() => setIncomeMode('annual')}
                                        className={`flex-1 h-full px-5 py-0 rounded-full text-xs font-bold whitespace-nowrap transition-all duration-200 flex items-center justify-center ${incomeMode === 'annual' ? 'bg-white shadow-sm text-slate-900 ring-1 ring-slate-200/50' : 'text-slate-500 hover:text-slate-700'}`}
                                    >
                                        {t.annualMode}
                                    </button>
                                    <button
                                        onClick={() => setIncomeMode('monthly')}
                                        className={`flex-1 h-full px-5 py-0 rounded-full text-xs font-bold whitespace-nowrap transition-all duration-200 flex items-center justify-center ${incomeMode === 'monthly' ? 'bg-white shadow-sm text-slate-900 ring-1 ring-slate-200/50' : 'text-slate-500 hover:text-slate-700'}`}
                                    >
                                        {t.monthlyMode}
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-6">
                                {employments.map((emp, index) => (
                                    <div key={emp.id} className="p-5 bg-slate-50/50 ring-1 ring-slate-200 rounded-2xl relative">
                                        <div className="flex justify-between items-center mb-4">
                                            <div className="text-sm font-bold text-slate-700 flex items-center gap-2">
                                                <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded-md text-xs">EA Form {index + 1}</span>
                                            </div>
                                            {employments.length > 1 && (
                                                <button
                                                    onClick={() => removeEmployment(emp.id)}
                                                    className="text-slate-400 hover:text-rose-500 text-xs font-semibold flex items-center gap-1 transition-colors"
                                                >
                                                    <Trash2 size={14} /> {t.removeBtn}
                                                </button>
                                            )}
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
                                            {incomeMode === 'annual' ? (
                                                <div className="md:col-span-12">
                                                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 flex items-center justify-between">
                                                        <span>{t.annualSalary}</span>
                                                        <span className="text-[10px] text-slate-400 font-normal normal-case">{t.annualSalaryHelp}</span>
                                                    </label>
                                                    <div className="relative group">
                                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-semibold group-focus-within:text-blue-500">RM</span>
                                                        <input
                                                            type="number" value={emp.annualSalary} onChange={(e) => updateEmployment(emp.id, 'annualSalary', e.target.value)} onKeyDown={(e) => { if (e.key === '-') e.preventDefault(); }} placeholder="0" min="0"
                                                            aria-label={t.annualSalary}
                                                            className="w-full pl-10 pr-3 py-2.5 bg-white border-0 ring-1 ring-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all font-mono text-base text-slate-900"
                                                        />
                                                    </div>
                                                </div>
                                            ) : (
                                                <>
                                                    <div className="md:col-span-5">
                                                        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">{t.monthlySalary}</label>
                                                        <div className="relative group">
                                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-semibold group-focus-within:text-blue-500">RM</span>
                                                            <input
                                                                type="number" value={emp.monthlySalary} onChange={(e) => updateEmployment(emp.id, 'monthlySalary', e.target.value)} onKeyDown={(e) => { if (e.key === '-') e.preventDefault(); }} placeholder="0" min="0"
                                                                aria-label={t.monthlySalary}
                                                                className="w-full pl-10 pr-3 py-2.5 bg-white border-0 ring-1 ring-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all font-mono text-base text-slate-900"
                                                            />
                                                        </div>
                                                    </div>

                                                    <div className="md:col-span-4">
                                                        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">{t.bonus}</label>
                                                        <div className="relative group">
                                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-semibold group-focus-within:text-blue-500">RM</span>
                                                            <input
                                                                type="number" value={emp.bonus} onChange={(e) => updateEmployment(emp.id, 'bonus', e.target.value)} onKeyDown={(e) => { if (e.key === '-') e.preventDefault(); }} placeholder="0" min="0"
                                                                aria-label={t.bonus}
                                                                className="w-full pl-10 pr-3 py-2.5 bg-white border-0 ring-1 ring-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all font-mono text-base text-slate-900"
                                                            />
                                                        </div>
                                                    </div>

                                                    <div className="md:col-span-3">
                                                        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">{t.monthsLabel}</label>
                                                        <div className="relative group">
                                                            <input
                                                                type="number" value={emp.months} onChange={(e) => updateEmployment(emp.id, 'months', e.target.value)} placeholder="12" min="1" max="12"
                                                                aria-label={t.monthsLabel}
                                                                className="w-full px-3 py-2.5 bg-white border-0 ring-1 ring-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all font-mono text-base text-slate-900 text-center"
                                                            />
                                                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 font-semibold text-[10px] pointer-events-none">mths</span>
                                                        </div>
                                                    </div>
                                                </>
                                            )}

                                            <div className="md:col-span-12 pt-1">
                                                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">{t.pcb}</label>
                                                <div className="relative group">
                                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-500 font-semibold">RM</span>
                                                    <input
                                                        type="number" value={emp.pcb} onChange={(e) => updateEmployment(emp.id, 'pcb', e.target.value)} onKeyDown={(e) => { if (e.key === '-') e.preventDefault(); }} placeholder="0" min="0"
                                                        aria-label={t.pcb}
                                                        className="w-full pl-10 pr-3 py-3 bg-blue-50/50 border-0 ring-1 ring-blue-200 text-blue-900 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all font-mono text-lg font-bold placeholder:text-blue-200"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}

                                <button
                                    onClick={addEmployment}
                                    className="w-full py-4 border-2 border-dashed border-slate-300 rounded-2xl text-slate-500 font-bold hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50/50 transition-all flex items-center justify-center gap-2"
                                >
                                    <Plus size={18} /> {t.addEmployment}
                                </button>

                                <p className="text-xs text-slate-500 flex items-center gap-1.5 font-medium justify-center mt-2">
                                    <Info size={14} className="text-blue-400" /> {t.pcbHelp}
                                </p>
                            </div>
                        </section>

                        {/* Tax Reliefs Section */}
                        <section className="bg-white p-6 md:p-8 rounded-3xl shadow-sm ring-1 ring-slate-200 relative">
                            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 mb-8">
                                <div>
                                    <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                                        <Receipt className="text-emerald-500" size={20} /> {t.reliefTitle}
                                        <Info 
                                            size={18} 
                                            className="text-slate-400 hover:text-blue-500 cursor-pointer transition-colors ml-1" 
                                            onClick={() => setIsReliefsInfoOpen(true)}
                                        />
                                    </h2>
                                    <p className="text-sm text-slate-500 mt-1">{t.autoDeduct}</p>
                                </div>
                                <div className="bg-emerald-50 text-emerald-700 text-xs px-3 py-1.5 rounded-full font-bold ring-1 ring-emerald-200/50 flex items-center gap-1.5 shrink-0">
                                    <CheckCircle2 size={14} /> RM 9,000 Applied
                                </div>
                            </div>

                            {/* Quick Add Shortcuts */}
                            <div className="mb-6">
                                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3 block">{t.quickAdd}</label>
                                <div className="flex flex-wrap gap-x-2 gap-y-3">
                                    <button onClick={() => handleQuickAdd('spouse')} className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 hover:bg-slate-100 ring-1 ring-slate-200 rounded-lg text-sm font-medium text-slate-700 transition-colors">
                                        <Users size={14} className="text-purple-500" /> Spouse
                                    </button>
                                    <button onClick={() => handleQuickAdd('lifestyle')} className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 hover:bg-slate-100 ring-1 ring-slate-200 rounded-lg text-sm font-medium text-slate-700 transition-colors">
                                        <Smartphone size={14} className="text-indigo-500" /> Lifestyle
                                    </button>
                                    <button onClick={() => handleQuickAdd('med_self')} className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 hover:bg-slate-100 ring-1 ring-slate-200 rounded-lg text-sm font-medium text-slate-700 transition-colors">
                                        <Stethoscope size={14} className="text-rose-500" /> Medical
                                    </button>
                                    <button onClick={() => handleQuickAdd('sspn')} className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 hover:bg-slate-100 ring-1 ring-slate-200 rounded-lg text-sm font-medium text-slate-700 transition-colors">
                                        <PiggyBank size={14} className="text-amber-500" /> SSPN
                                    </button>
                                </div>
                            </div>

                            {/* Input Form */}
                            <div className="flex flex-col md:flex-row gap-3 mb-8 p-1 items-stretch h-auto md:h-14">
                                <div className="relative flex-1 h-full min-h-[56px]" ref={dropdownRef}>
                                    <div
                                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                        className="w-full h-full flex items-center justify-between pl-4 pr-10 py-3 md:py-0 bg-slate-50 ring-1 ring-slate-200 rounded-xl focus-within:ring-2 focus-within:ring-blue-500 text-sm font-semibold text-slate-800 transition-all cursor-pointer"
                                    >
                                        <span className={selectedReliefId ? "text-slate-900 line-clamp-1" : "text-slate-400"}>
                                            {selectedItemInfo ? `${selectedItemInfo.label[lang]} (Max RM ${selectedItemInfo.max.toLocaleString()})` : t.selectRelief}
                                        </span>
                                        <ChevronDown size={16} className={`absolute right-4 text-slate-400 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
                                    </div>
                                    
                                    {isDropdownOpen && (
                                        <div className="absolute z-50 top-full left-0 right-0 mt-2 bg-white rounded-xl ring-1 ring-slate-200 shadow-xl overflow-hidden flex flex-col max-h-[400px]">
                                            <div className="p-3 border-b border-slate-100 flex items-center gap-2 sticky top-0 bg-white z-20">
                                                <Search size={16} className="text-slate-400 shrink-0" />
                                                <input
                                                    type="text"
                                                    autoFocus
                                                    placeholder={lang === 'zh' ? '搜索...' : lang === 'ms' ? 'Cari...' : 'Search...'}
                                                    value={searchQuery}
                                                    onChange={(e) => setSearchQuery(e.target.value)}
                                                    className="w-full text-sm font-medium outline-none placeholder:text-slate-400 bg-transparent text-slate-900"
                                                />
                                                {searchQuery && (
                                                    <button onClick={(e) => { e.stopPropagation(); setSearchQuery(''); }} className="text-slate-400 hover:text-slate-600 p-1 rounded-md hover:bg-slate-100 transition-colors">
                                                        <X size={14} />
                                                    </button>
                                                )}
                                            </div>
                                            <div className="overflow-y-auto flex-1 p-2 custom-scrollbar">
                                                {Object.entries(groupedReliefs).map(([groupName, reliefs]) => {
                                                    const filtered = reliefs.filter(rel => 
                                                        rel.label[lang].toLowerCase().includes(searchQuery.toLowerCase()) || 
                                                        rel.desc[lang].toLowerCase().includes(searchQuery.toLowerCase())
                                                    );
                                                    if (filtered.length === 0) return null;
                                                    return (
                                                        <div key={groupName} className="mb-2 last:mb-0">
                                                            <div className="px-3 py-1.5 text-xs font-bold text-slate-400 uppercase tracking-wider sticky top-0 bg-white/95 backdrop-blur z-10">
                                                                {groupName}
                                                            </div>
                                                            <div className="space-y-0.5 mt-1">
                                                                {filtered.map(rel => (
                                                                    <button
                                                                        key={rel.id}
                                                                        ref={(el) => {
                                                                            if (selectedReliefId === rel.id && el && isDropdownOpen) {
                                                                                setTimeout(() => {
                                                                                    el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                                                                                }, 50);
                                                                            }
                                                                        }}
                                                                        onClick={() => {
                                                                            setSelectedReliefId(rel.id);
                                                                            setIsDropdownOpen(false);
                                                                            setSearchQuery('');
                                                                        }}
                                                                        className={`w-full text-left px-3 py-2.5 rounded-lg flex items-center justify-between group transition-colors ${selectedReliefId === rel.id ? 'bg-blue-50 text-blue-700' : 'hover:bg-slate-50 text-slate-700'}`}
                                                                    >
                                                                        <div className="pr-4">
                                                                            <div className={`text-sm font-semibold transition-colors ${selectedReliefId === rel.id ? 'text-blue-700' : 'group-hover:text-slate-900'}`}>
                                                                                {rel.label[lang]} <span className="text-xs font-mono ml-1 text-slate-400 font-medium">(Max RM {rel.max.toLocaleString()})</span>
                                                                            </div>
                                                                            <div className={`text-xs mt-1 transition-colors leading-relaxed ${selectedReliefId === rel.id ? 'text-blue-600/80' : 'text-slate-500 group-hover:text-slate-600'}`}>
                                                                                {rel.desc[lang]}
                                                                            </div>
                                                                        </div>
                                                                        {selectedReliefId === rel.id && <Check size={16} className="text-blue-600 shrink-0" />}
                                                                    </button>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                                {Object.values(groupedReliefs).flat().filter(rel => rel.label[lang].toLowerCase().includes(searchQuery.toLowerCase()) || rel.desc[lang].toLowerCase().includes(searchQuery.toLowerCase())).length === 0 && (
                                                    <div className="p-8 text-center flex flex-col items-center justify-center">
                                                        <Search size={24} className="text-slate-300 mb-2" />
                                                        <span className="text-sm text-slate-500 font-medium mt-1">
                                                            {lang === 'zh' ? '未找到匹配的税务减免项目' : lang === 'ms' ? 'Tiada pelepasan cukai yang sepadan dijumpai' : 'No matching tax reliefs found'}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="relative w-full md:w-44 shrink-0 group h-full min-h-[56px]">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-semibold group-focus-within:text-blue-500 transition-colors">RM</span>
                                    <input
                                        id="relief-amount-input" type="number" value={reliefAmount} onChange={(e) => {
                                            const val = e.target.value;
                                            if (val === '' || parseFloat(val) >= 0) setReliefAmount(val);
                                        }}
                                        onKeyDown={(e) => { if (e.key === '-') e.preventDefault(); }}
                                        placeholder={t.amountPlaceholder} min="0"
                                        aria-label={t.selectRelief}
                                        className="w-full h-full pl-11 pr-4 py-3 md:py-0 bg-white ring-1 ring-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-mono text-base font-semibold transition-all"
                                    />
                                </div>

                                <button
                                    onClick={handleAddRelief} disabled={!selectedReliefId || !reliefAmount}
                                    className="bg-slate-900 h-full min-h-[56px] hover:bg-black disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed text-white px-6 rounded-xl font-bold flex items-center justify-center transition-all shrink-0 active:scale-95"
                                >
                                    <Plus size={18} className="mr-1.5" /> {t.addBtn}
                                </button>
                            </div>

                            {/* Added Reliefs List */}
                            <div className="space-y-3">
                                {calculations.reliefBreakdown.length === 0 ? (
                                    <div className="text-center py-12 text-slate-400 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
                                        <span className="block font-bold text-slate-500 mb-1">{t.noReliefs}</span>
                                        <span className="text-sm">{t.noReliefsSub}</span>
                                    </div>
                                ) : (
                                    calculations.reliefBreakdown.map(rel => (
                                        <div key={rel.id} className="group flex items-center justify-between p-4 bg-white ring-1 ring-slate-200 rounded-2xl hover:shadow-md hover:ring-slate-300 transition-all">
                                            <div className="pr-4 flex-1">
                                                <div className="font-bold text-slate-800 flex items-center gap-2 text-sm">
                                                    {rel.label[lang]}
                                                    {rel.isAuto && <span className="text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">Auto</span>}
                                                </div>
                                                <div className="text-xs text-slate-500 mt-1 font-medium line-clamp-1">
                                                    {rel.isAuto ? t.autoKwspTip : rel.desc[lang]}
                                                </div>

                                                {/* Marginal Tax Impact Display - The High Leverage Insight */}
                                                {rel.taxImpact > 0 && calculations.marginalRate > 0 && (
                                                    <div className="text-[11px] text-emerald-600 mt-2 flex items-center gap-1.5 font-bold bg-emerald-50 px-2.5 py-1 rounded-lg w-fit">
                                                        <Zap size={14} className="shrink-0 text-emerald-500" />
                                                        <span>{t.taxSaved} RM {rel.taxImpact.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                                                        <span className="text-emerald-400/80 font-normal">(@ {calculations.marginalRate}%)</span>
                                                    </div>
                                                )}

                                                {/* Capping UX */}
                                                {rel.userTotal > rel.max && (
                                                    <div className="text-[11px] text-amber-600 mt-2 flex items-center gap-1.5 font-bold bg-amber-50 px-2.5 py-1 rounded-lg w-fit">
                                                        <AlertCircle size={14} className="shrink-0" />
                                                        <span>{t.limitExceeded} RM {rel.max.toLocaleString()}</span>
                                                        <span className="ml-1 text-slate-400 line-through font-mono">RM {rel.userTotal.toLocaleString()}</span>
                                                    </div>
                                                )}
                                            </div>

                                            <div className="flex items-center gap-4 shrink-0">
                                                {/* Edit Mode or Display Mode */}
                                                {editingReliefId === rel.id ? (
                                                    <div className="flex items-center gap-2">
                                                        <div className="relative">
                                                            <span className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400 font-semibold text-xs">RM</span>
                                                            <input
                                                                type="number"
                                                                value={editingAmount}
                                                                onChange={(e) => {
                                                                    const val = e.target.value;
                                                                    if (val === '' || parseFloat(val) >= 0) setEditingAmount(val);
                                                                }}
                                                                onKeyDown={(e) => {
                                                                    if (e.key === '-') e.preventDefault();
                                                                    if (e.key === 'Enter') saveEditRelief(rel.id);
                                                                    if (e.key === 'Escape') cancelEditRelief();
                                                                }}
                                                                min="0"
                                                                className="w-28 pl-7 pr-2 py-1.5 bg-white ring-2 ring-blue-500 rounded-lg text-sm font-mono font-semibold outline-none"
                                                                autoFocus
                                                            />
                                                        </div>
                                                        <button
                                                            onClick={() => saveEditRelief(rel.id)}
                                                            className="bg-emerald-500 hover:bg-emerald-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-colors"
                                                        >
                                                            {t.editBtn}
                                                        </button>
                                                        <button
                                                            onClick={cancelEditRelief}
                                                            className="bg-slate-100 hover:bg-slate-200 text-slate-600 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors"
                                                        >
                                                            {t.cancelBtn}
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <>
                                                        <div className="text-right cursor-pointer" onClick={() => !rel.isAuto && startEditRelief(rel)}>
                                                            <div className="font-mono text-lg font-bold text-slate-900 tracking-tight group-hover:text-blue-600 transition-colors">RM {rel.cappedAmount.toLocaleString()}</div>
                                                            <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider flex items-center justify-end gap-1">
                                                                {!rel.isAuto && <Pencil size={10} className="opacity-0 group-hover:opacity-100 transition-opacity" />}
                                                                {t.effectiveDeduction}
                                                            </div>
                                                        </div>
                                                        <button
                                                            onClick={() => setUserReliefs(userReliefs.filter(r => r.categoryId !== rel.id))}
                                                            className="text-slate-300 hover:text-rose-500 hover:bg-rose-50 p-2 rounded-lg transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                                                            aria-label={t.removeBtn}
                                                        >
                                                            <Trash2 size={18} />
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </section>

                    </div>

                    {/* Right Column: The "Fintech Receipt" Settlement Panel */}
                    <div className="lg:col-span-5 relative min-w-0">
                        <div className="sticky top-8">
                            <div className="bg-slate-900 text-white p-6 md:p-8 rounded-3xl shadow-2xl ring-1 ring-slate-800 font-sans flex flex-col max-h-[calc(100vh-4rem)] overflow-y-auto custom-scrollbar">

                                <h2 className="text-lg font-bold mb-8 flex items-center gap-2 tracking-tight text-white/90 shrink-0">
                                    <ArrowRight className="text-blue-400" /> {t.settlement}
                                </h2>

                                {/* Dynamic Threshold Alert */}
                                {calculations.grossIncome > 0 && (
                                    <div className={`mb-8 p-4 rounded-2xl ring-1 shrink-0 ${calculations.isBelowThreshold ? 'bg-amber-500/10 ring-amber-500/30' : 'bg-emerald-500/10 ring-emerald-500/30'}`}>
                                        <div className="flex items-center gap-2 mb-2">
                                            {calculations.isBelowThreshold ? <ShieldAlert size={16} className="text-amber-400" /> : <ShieldCheck size={16} className="text-emerald-400" />}
                                            <span className={`text-[11px] font-bold uppercase tracking-widest ${calculations.isBelowThreshold ? 'text-amber-400' : 'text-emerald-400'}`}>
                                                {t.thresholdTitle}
                                            </span>
                                        </div>
                                        <p className={`text-xs font-medium leading-relaxed ${calculations.isBelowThreshold ? 'text-amber-200/90' : 'text-emerald-200/90'}`}>
                                            {!calculations.isBelowThreshold
                                                ? t.thresholdSafe
                                                : calculations.pcb > 0 ? t.thresholdBelowWithPcb : t.thresholdBelowNoPcb}
                                        </p>
                                    </div>
                                )}

                                {/* Step 1: Deductions Flow */}
                                <div className="space-y-4 text-sm font-medium mb-8 shrink-0">
                                    <div className="flex justify-between items-center text-slate-400">
                                        <span>{t.gross}</span>
                                        <span className="text-white font-mono font-semibold">RM {calculations.grossIncome.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-slate-400">
                                        <span>{t.indRelief}</span>
                                        <span className="text-slate-500 font-mono">- RM {calculations.individualRelief.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-slate-400">
                                        <span>{t.yourReliefs}</span>
                                        <span className="text-emerald-400 font-mono">- RM {calculations.totalClaimedReliefs.toLocaleString()}</span>
                                    </div>
                                </div>

                                {/* Step 2: The Baseline (Chargeable Income) */}
                                <div className="bg-slate-800/50 p-5 rounded-2xl ring-1 ring-slate-700/50 mb-8 shrink-0">
                                    <div className="text-[10px] text-slate-400 font-bold mb-1.5 uppercase tracking-widest">{t.chargeable}</div>
                                    <div className="text-3xl font-mono font-bold text-white tracking-tight">RM {calculations.chargeableIncome.toLocaleString()}</div>
                                    <div className="text-[11px] text-slate-500 mt-2 font-medium">{t.chargeableHelp}</div>
                                </div>

                                {/* Step 3: Tax Bracket Logic (Transparent System) */}
                                {calculations.taxSteps.length > 0 && (
                                    <div className="mb-8 shrink-0">
                                        <div className="text-[10px] text-slate-500 mb-3 uppercase tracking-widest font-bold px-1">{t.taxSteps}</div>
                                        <div className="space-y-2.5 px-1">
                                            {calculations.taxSteps.map((step, idx) => (
                                                <div key={idx} className="flex justify-between items-center text-xs font-mono">
                                                    <span className="text-slate-400 flex items-center">
                                                        RM {step.amount.toLocaleString()}
                                                        <span className="text-slate-600 mx-2 text-[10px]">✕</span>
                                                        <span className="text-blue-400 font-bold">{step.rate}%</span>
                                                    </span>
                                                    <span className="text-slate-300">RM {step.tax.toLocaleString()}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {calculations.rebate > 0 && (
                                    <div className="mb-8 p-3 bg-emerald-900/30 ring-1 ring-emerald-800/50 rounded-xl flex items-start gap-2.5 shrink-0">
                                        <Info size={16} className="text-emerald-400 shrink-0 mt-0.5" />
                                        <div className="text-xs text-emerald-300 font-medium leading-relaxed">
                                            {t.rebateTriggered}
                                        </div>
                                    </div>
                                )}

                                <div className="mt-auto pt-6">
                                    <div className="h-px bg-slate-800 mb-6"></div>

                                    <div className="space-y-3 mb-6">
                                        <div className="flex justify-between items-center text-sm">
                                            <span className="text-slate-400 font-semibold">{t.taxAssessed}</span>
                                            <span className="font-mono text-white">RM {calculations.taxAssessed.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                                        </div>
                                        <div className="flex justify-between items-center text-sm">
                                            <span className="text-slate-400 font-semibold">{t.pcbDeducted}</span>
                                            <span className="font-mono text-blue-400">- RM {calculations.pcb.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                                        </div>
                                    </div>

                                    {/* Final Result Panel */}
                                    <div
                                        aria-live="polite"
                                        aria-atomic="true"
                                        className={`p-6 rounded-2xl transition-all duration-500 relative overflow-hidden ${calculations.finalBalance < 0
                                        ? 'bg-gradient-to-br from-emerald-500/10 to-emerald-900/20 ring-1 ring-emerald-500/30 shadow-[0_0_40px_rgba(16,185,129,0.1)]'
                                        : calculations.finalBalance > 0
                                            ? 'bg-gradient-to-br from-rose-500/10 to-orange-900/20 ring-1 ring-rose-500/30 shadow-[0_0_40px_rgba(244,63,94,0.1)]'
                                            : 'bg-slate-800 ring-1 ring-slate-700'
                                        }`}>
                                        <div className="text-[11px] font-bold mb-2 flex items-center gap-1.5 uppercase tracking-widest relative z-10">
                                            {calculations.finalBalance < 0
                                                ? <span className="text-emerald-400">{t.finalRefund}</span>
                                                : calculations.finalBalance > 0
                                                    ? <span className="text-rose-400">{t.finalPayable}</span>
                                                    : <span className="text-slate-400">{t.allSettled}</span>
                                            }
                                        </div>
                                        <div className={`text-4xl font-mono font-bold tracking-tighter relative z-10 ${calculations.finalBalance < 0 ? 'text-emerald-400' : calculations.finalBalance > 0 ? 'text-rose-400' : 'text-white'
                                            }`}>
                                            RM {Math.abs(calculations.finalBalance).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                        </div>
                                    </div>
                                </div>

                            </div>
                        </div>
                    </div>

                </div>
            </div>

            {/* Reliefs Info Modal */}
            {isReliefsInfoOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md sm:p-6" onClick={() => { setIsReliefsInfoOpen(false); setModalSearchQuery(''); }}>
                    <div className="bg-white rounded-3xl w-full max-w-4xl max-h-[85vh] flex flex-col shadow-[0_0_40px_rgba(0,0,0,0.1)] overflow-hidden animate-in fade-in zoom-in-95 duration-200 ring-1 ring-slate-200/50" onClick={(e) => e.stopPropagation()}>
                        
                        {/* Modal Header */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between p-5 md:px-8 md:py-6 border-b border-slate-100 bg-white/95 sticky top-0 z-20 backdrop-blur gap-4">
                            <div className="flex items-center gap-3">
                                <div className="bg-blue-50 p-2.5 rounded-2xl ring-1 ring-blue-100 shrink-0">
                                    <Receipt className="text-blue-500" size={24} />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
                                        {lang === 'zh' ? '税务减免白皮书' : lang === 'ms' ? 'Panduan Pelepasan Cukai' : 'Tax Reliefs Guide'}
                                        <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest ring-1 ring-slate-200/50">YA {year}</span>
                                    </h3>
                                    <p className="text-sm text-slate-500 mt-0.5 font-medium">
                                        {lang === 'zh' ? '完整减免项目、条件及上限概览' : lang === 'ms' ? 'Gambaran keseluruhan pelepasan, syarat & had' : 'Overview of all available reliefs, conditions & limits'}
                                    </p>
                                </div>
                            </div>
                            
                            <div className="flex items-center gap-3 w-full sm:w-auto">
                                {/* Search Bar */}
                                <div className="relative group flex-1 sm:w-64">
                                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                                    <input 
                                        type="text" 
                                        value={modalSearchQuery}
                                        onChange={(e) => setModalSearchQuery(e.target.value)}
                                        placeholder={lang === 'zh' ? '搜索...' : lang === 'ms' ? 'Cari pelepasan...' : 'Search reliefs...'}
                                        className="w-full pl-9 pr-8 py-2.5 bg-slate-50 border-0 ring-1 ring-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all text-sm font-medium text-slate-900 placeholder:text-slate-400"
                                    />
                                    {modalSearchQuery && (
                                        <button 
                                            onClick={() => setModalSearchQuery('')}
                                            className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 rounded-md transition-colors"
                                        >
                                            <X size={14} />
                                        </button>
                                    )}
                                </div>

                                <button onClick={() => { setIsReliefsInfoOpen(false); setModalSearchQuery(''); }} className="shrink-0 text-slate-400 hover:text-rose-500 bg-slate-50 hover:bg-rose-50 p-2.5 rounded-xl transition-colors ring-1 ring-slate-200 hover:ring-rose-200">
                                    <X size={20} />
                                </button>
                            </div>
                        </div>

                        {/* Modal Body */}
                        <div className="overflow-y-auto flex-1 custom-scrollbar bg-slate-50/50 relative">
                            {Object.entries(groupedReliefs).map(([groupName, reliefs]) => {
                                const filteredReliefs = reliefs.filter(rel => 
                                    rel.label[lang].toLowerCase().includes(modalSearchQuery.toLowerCase()) || 
                                    rel.desc[lang].toLowerCase().includes(modalSearchQuery.toLowerCase())
                                );

                                if (filteredReliefs.length === 0) return null;

                                return (
                                    <div key={groupName} className="mb-8 last:mb-0 p-5 md:p-8 border-b border-slate-200/50 last:border-0 relative">
                                        
                                        {/* Category Header */}
                                        <div className="flex items-center gap-3 mb-6 sticky top-0 z-10 bg-slate-50/95 backdrop-blur-sm py-2 -mt-2">
                                            <div className="h-px bg-slate-200 flex-1"></div>
                                            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest px-2 bg-slate-100 rounded-lg py-1 ring-1 ring-slate-200/50">
                                                {groupName}
                                            </h4>
                                            <div className="h-px bg-slate-200 flex-1"></div>
                                        </div>

                                        {/* Category Items */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {filteredReliefs.map((rel, index) => (
                                                <div 
                                                    key={rel.id} 
                                                    className="bg-white p-5 rounded-2xl ring-1 ring-slate-200/70 hover:ring-blue-200 hover:shadow-lg hover:shadow-blue-500/5 transition-all group flex flex-col justify-between"
                                                    style={{ animationDelay: `${index * 50}ms` }}
                                                >
                                                    <div>
                                                        <div className="flex items-start justify-between gap-3 mb-2">
                                                            <div className="font-bold text-slate-800 text-sm group-hover:text-blue-700 transition-colors leading-tight">
                                                                {rel.label[lang]}
                                                            </div>
                                                            <div className="bg-slate-50 px-2.5 py-1 rounded-lg ring-1 ring-slate-200 shrink-0">
                                                                <div className="font-mono font-bold text-slate-700 text-sm tracking-tight text-right">
                                                                    RM {rel.max.toLocaleString()}
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="text-sm text-slate-500 font-medium leading-relaxed">
                                                            {rel.desc[lang]}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                );
                            })}
                            
                            {/* Empty State */}
                            {Object.values(groupedReliefs).flat().filter(rel => 
                                rel.label[lang].toLowerCase().includes(modalSearchQuery.toLowerCase()) || 
                                rel.desc[lang].toLowerCase().includes(modalSearchQuery.toLowerCase())
                            ).length === 0 && (
                                <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center text-slate-500 min-h-[300px]">
                                    <div className="bg-white p-4 rounded-full ring-1 ring-slate-200 mb-4 shadow-sm">
                                        <Search size={32} className="text-slate-300" />
                                    </div>
                                    <p className="font-bold text-slate-700 text-base mb-1">
                                        {lang === 'zh' ? '没有找到相关减免项目' : lang === 'ms' ? 'Tiada pelepasan dijumpai' : 'No matching reliefs found'}
                                    </p>
                                    <p className="text-sm text-slate-500">
                                        {lang === 'zh' ? '请尝试不同的搜索词' : lang === 'ms' ? 'Sila cuba kata kunci lain' : 'Try adjusting your search terms'}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Footer */}
            <footer className="mt-12 pb-8 flex flex-col items-center justify-center gap-4">
                <div className="text-sm text-slate-500 mx-4 max-w-3xl text-center px-6 py-3.5 leading-relaxed font-medium bg-slate-100/50 rounded-xl ring-1 ring-slate-200/50">
                    {t.disclaimer}
                </div>
                <a
                    href="https://www.petergorrr.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2.5 px-4 py-2 bg-white rounded-full shadow-sm ring-1 ring-slate-200/60 text-sm font-medium text-slate-500 hover:text-blue-600 hover:shadow-md hover:ring-blue-200 transition-all duration-300 group"
                >
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-50 text-blue-500 group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300">
                        <Zap size={12} fill="currentColor" />
                    </span>
                    Built by <span className="font-bold text-slate-700 group-hover:text-blue-600 transition-colors duration-300">Peter</span>
                </a>
            </footer>

            <style dangerouslySetInnerHTML={{
                __html: `
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #334155; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #475569; }
      `}} />
            <Analytics />
        </div>
    );
}
