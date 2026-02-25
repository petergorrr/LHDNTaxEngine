import React, { useState, useMemo, useEffect } from 'react';
import {
    Plus, Trash2, Info, CheckCircle2, AlertCircle,
    Globe, Receipt, ArrowRight, ShieldAlert, ShieldCheck,
    ChevronDown, Smartphone, Stethoscope, PiggyBank, Briefcase, Users, Zap
} from 'lucide-react';
import { Analytics } from '@vercel/analytics/react';

// --- TAX LOGIC & DATA (Verified YA 2025/2026) ---
const TAX_BRACKETS = [
    { range: 5000, rate: 0.00 },
    { range: 15000, rate: 0.01 },   // 5k - 20k
    { range: 15000, rate: 0.03 },   // 20k - 35k
    { range: 15000, rate: 0.06 },   // 35k - 50k
    { range: 20000, rate: 0.11 },   // 50k - 70k
    { range: 30000, rate: 0.19 },   // 70k - 100k
    { range: 300000, rate: 0.25 },  // 100k - 400k
    { range: 200000, rate: 0.26 },  // 400k - 600k
    { range: 1400000, rate: 0.28 }, // 600k - 2m
    { range: Infinity, rate: 0.30 } // > 2m
];

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
        tipsTitle: "System Insights (引擎洞察)",
        tip1: "PCB 只是官方预收的押金。年度报税的核心是通过合法申报 Tax Relief，把多缴的钱合法拿回来。",
        tip2: "法定截止日期为 4月30日 (Borang BE)，通过 ezHASiL 电子报税可享有额外 15 天宽限期。",
        quickAdd: "快速添加 (Quick Add):"
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
        tipsTitle: "System Insights",
        tip1: "PCB is merely a deposit. Tax submission is the process of declaring legal Tax Reliefs to claim back any overpaid PCB (Tax Refund).",
        tip2: "Statutory deadline is April 30. e-Filing via ezHASiL grants an automatic 15-day grace period.",
        quickAdd: "Quick Add:"
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
        tipsTitle: "Pandangan Sistem",
        tip1: "PCB hanyalah deposit. Pemfailan cukai adalah proses mengisytiharkan Pelepasan Cukai yang sah untuk menuntut balik PCB yang terlebih bayar.",
        tip2: "Tarikh akhir berkanun ialah 30 April. e-Filing melalui ezHASiL memberikan tempoh lanjutan automatik 15 hari.",
        quickAdd: "Tambah Cepat:"
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
    { id: 'child_under18', group: GROUPS.FAMILY, label: { zh: '子女 (< 18岁)', en: 'Child (< 18)', ms: 'Anak (< 18)' }, max: 2000, desc: { zh: '未满18岁未婚子女', en: 'Unmarried child under 18', ms: 'Anak belum berkahwin bawah 18 tahun' } },
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
const calcGrossIncome = (emps) => emps.reduce((sum, emp) => {
    const sal = parseFloat(emp.monthlySalary) || 0;
    const m = parseInt(emp.months) || 0;
    const b = parseFloat(emp.bonus) || 0;
    return sum + (sal * m) + b;
}, 0);

// Custom Hook for State Persistence
function useStickyState(defaultValue, key) {
    const [value, setValue] = useState(() => {
        try {
            const stickyValue = window.localStorage.getItem(key);
            return stickyValue !== null ? JSON.parse(stickyValue) : defaultValue;
        } catch (err) {
            return defaultValue;
        }
    });

    useEffect(() => {
        window.localStorage.setItem(key, JSON.stringify(value));
    }, [key, value]);

    return [value, setValue];
}

export default function App() {
    const [lang, setLang] = useStickyState('en', 'lhdn-lang');
    const t = DICT[lang];
    const [year, setYear] = useStickyState(2026, 'lhdn-year');

    const [employments, setEmployments] = useStickyState([
        { id: 'emp-1', monthlySalary: '', months: 12, bonus: '', pcb: '' }
    ], 'lhdn-employments');

    const [userReliefs, setUserReliefs] = useStickyState([], 'lhdn-reliefs');

    const [selectedReliefId, setSelectedReliefId] = useState('');
    const [reliefAmount, setReliefAmount] = useState('');

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

    // Auto EPF Injection Logic
    useEffect(() => {
        const gross = calcGrossIncome(employments);

        if (gross > 0) {
            const estimatedKwsp = gross * 0.11;
            setUserReliefs(prev => {
                const filtered = prev.filter(r => r.categoryId !== 'kwsp');
                return [...filtered, { id: 'auto_kwsp', categoryId: 'kwsp', amount: estimatedKwsp, isAuto: true }];
            });
        } else {
            setUserReliefs(prev => prev.filter(r => r.categoryId !== 'kwsp' || !r.isAuto));
        }
    }, [employments, setUserReliefs]);

    const handleYearChange = (newYear) => {
        setYear(newYear);
        setUserReliefs(prev => prev.filter(r => r.categoryId === 'kwsp' && r.isAuto));
        setSelectedReliefId('');
        setReliefAmount('');
    };

    const handleAddRelief = () => {
        if (!selectedReliefId || !reliefAmount || isNaN(reliefAmount)) return;
        const amountVal = parseFloat(reliefAmount);

        setUserReliefs(prev => {
            // UX Improvement: Merge duplicates instead of stacking them
            const exists = prev.find(r => r.categoryId === selectedReliefId && !r.isAuto);
            if (exists) {
                return prev.map(r =>
                    r.categoryId === selectedReliefId && !r.isAuto
                        ? { ...r, amount: r.amount + amountVal }
                        : r
                );
            }

            const newRelief = {
                id: Date.now().toString(),
                categoryId: selectedReliefId,
                amount: amountVal,
                isAuto: false
            };

            if (selectedReliefId === 'kwsp') {
                return [...prev.filter(r => r.categoryId !== 'kwsp'), newRelief]; // Override auto if manual
            }
            return [...prev, newRelief];
        });
        setSelectedReliefId('');
        setReliefAmount('');
    };

    const handleQuickAdd = (id) => {
        setSelectedReliefId(id);
        document.getElementById('relief-amount-input').focus();
    };

    const updateEmployment = (id, field, value) => {
        setEmployments(prev => prev.map(emp =>
            emp.id === id ? { ...emp, [field]: value } : emp
        ));
    };

    const addEmployment = () => {
        setEmployments(prev => [
            ...prev,
            { id: Date.now().toString(), monthlySalary: '', months: 1, bonus: '', pcb: '' }
        ]);
    };

    const removeEmployment = (id) => {
        setEmployments(prev => prev.filter(emp => emp.id !== id));
    };

    const calculations = useMemo(() => {
        const grossIncome = calcGrossIncome(employments);
        const pcb = employments.reduce((sum, emp) => sum + (parseFloat(emp.pcb) || 0), 0);
        const INDIVIDUAL_RELIEF = 9000;

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

        for (const bracket of TAX_BRACKETS) {
            if (remainingIncome <= 0) break;
            const taxableInThisBracket = Math.min(remainingIncome, bracket.range);
            const taxForThisBracket = taxableInThisBracket * bracket.rate;
            if (taxForThisBracket > 0) {
                marginalRate = bracket.rate;
                taxSteps.push({ rate: bracket.rate * 100, amount: taxableInThisBracket, tax: taxForThisBracket });
            }
            taxAssessed += taxForThisBracket;
            remainingIncome -= taxableInThisBracket;
        }

        // Backfill tax impact now that marginal rate is known
        reliefBreakdown.forEach(r => { r.taxImpact = r.cappedAmount * marginalRate; });

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
            marginalRate: marginalRate * 100
        };
    }, [employments, userReliefs, availableReliefs]);

    return (
        <div className="min-h-screen bg-slate-50 p-4 md:p-8 font-sans text-slate-900 selection:bg-blue-200">
            <div className="max-w-6xl mx-auto space-y-6">

                {/* Header - Apple-esque Minimalism */}
                <header className="flex flex-col md:flex-row md:items-center justify-between bg-white px-6 py-5 rounded-3xl shadow-sm ring-1 ring-slate-200">
                    <div className="flex items-center gap-3">
                        <img src="/favicon.jpg" alt="Tax Capybara" className="w-9 h-9 rounded-xl object-cover shadow-md shadow-blue-200 ring-1 ring-slate-200" />
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
                            {[2025, 2026].map(y => (
                                <button
                                    key={y} onClick={() => handleYearChange(y)}
                                    className={`px-5 py-1.5 rounded-full text-sm font-semibold transition-all duration-200 ${year === y ? 'bg-white shadow-sm text-slate-900 ring-1 ring-slate-200/50' : 'text-slate-500 hover:text-slate-700'
                                        }`}
                                >
                                    {y === 2026 ? `YA ${y} ⚡` : `YA ${y}`}
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
                            <h2 className="text-lg font-bold mb-6 flex items-center gap-2 text-slate-900">
                                <Briefcase className="text-blue-500" size={20} /> {t.incomeTitle}
                            </h2>

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
                                            <div className="md:col-span-5">
                                                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">{t.monthlySalary}</label>
                                                <div className="relative group">
                                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-semibold group-focus-within:text-blue-500">RM</span>
                                                    <input
                                                        type="number" value={emp.monthlySalary} onChange={(e) => updateEmployment(emp.id, 'monthlySalary', e.target.value)} placeholder="0"
                                                        className="w-full pl-10 pr-3 py-2.5 bg-white border-0 ring-1 ring-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all font-mono text-base text-slate-900"
                                                    />
                                                </div>
                                            </div>

                                            <div className="md:col-span-4">
                                                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">{t.bonus}</label>
                                                <div className="relative group">
                                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-semibold group-focus-within:text-blue-500">RM</span>
                                                    <input
                                                        type="number" value={emp.bonus} onChange={(e) => updateEmployment(emp.id, 'bonus', e.target.value)} placeholder="0"
                                                        className="w-full pl-10 pr-3 py-2.5 bg-white border-0 ring-1 ring-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all font-mono text-base text-slate-900"
                                                    />
                                                </div>
                                            </div>

                                            <div className="md:col-span-3">
                                                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">{t.monthsLabel}</label>
                                                <div className="relative group">
                                                    <input
                                                        type="number" value={emp.months} onChange={(e) => updateEmployment(emp.id, 'months', e.target.value)} placeholder="12" min="1" max="12"
                                                        className="w-full px-3 py-2.5 bg-white border-0 ring-1 ring-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all font-mono text-base text-slate-900 text-center"
                                                    />
                                                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 font-semibold text-[10px] pointer-events-none">mths</span>
                                                </div>
                                            </div>

                                            <div className="md:col-span-12 pt-1">
                                                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">{t.pcb}</label>
                                                <div className="relative group">
                                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-500 font-semibold">RM</span>
                                                    <input
                                                        type="number" value={emp.pcb} onChange={(e) => updateEmployment(emp.id, 'pcb', e.target.value)} placeholder="0"
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
                                <div className="relative flex-1 h-full min-h-[56px]">
                                    <select
                                        value={selectedReliefId} onChange={(e) => setSelectedReliefId(e.target.value)}
                                        className="w-full h-full appearance-none pl-4 pr-10 py-3 md:py-0 bg-slate-50 ring-1 ring-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm font-semibold text-slate-800 transition-all cursor-pointer"
                                    >
                                        <option value="" disabled>{t.selectRelief}</option>
                                        {Object.entries(groupedReliefs).map(([groupName, reliefs]) => (
                                            <optgroup key={groupName} label={groupName} className="font-bold text-slate-400 bg-white">
                                                {reliefs.map(rel => (
                                                    <option key={rel.id} value={rel.id} className="font-medium text-slate-900 py-2">
                                                        {rel.label[lang]} (Max RM {rel.max.toLocaleString()})
                                                    </option>
                                                ))}
                                            </optgroup>
                                        ))}
                                    </select>
                                    <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                                </div>

                                <div className="relative w-full md:w-44 shrink-0 group h-full min-h-[56px]">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-semibold group-focus-within:text-blue-500 transition-colors">RM</span>
                                    <input
                                        id="relief-amount-input" type="number" value={reliefAmount} onChange={(e) => setReliefAmount(e.target.value)}
                                        placeholder={t.amountPlaceholder}
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
                                                <div className="text-right">
                                                    <div className="font-mono text-lg font-bold text-slate-900 tracking-tight">RM {rel.cappedAmount.toLocaleString()}</div>
                                                    <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{t.effectiveDeduction}</div>
                                                </div>
                                                <button
                                                    onClick={() => setUserReliefs(userReliefs.filter(r => r.categoryId !== rel.id))}
                                                    className="text-slate-300 hover:text-rose-500 hover:bg-rose-50 p-2 rounded-lg transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
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
                                    <div className={`p-6 rounded-2xl transition-all duration-500 relative overflow-hidden ${calculations.finalBalance < 0
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

            {/* Footer */}
            <footer className="mt-12 pb-8 flex justify-center">
                <a
                    href="https://petergorrr.lovable.app/"
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
