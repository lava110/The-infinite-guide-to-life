import React, { useState, useMemo } from 'react';
import {
  GraduationCap,
  Sliders,
  ArrowUpRight,
  AlertTriangle,
  ShieldCheck,
  Scale,
  CheckCircle2,
  Layers,
} from 'lucide-react';

export type EduStageGroup =
  | 'HIGH_SCHOOL_GAOKAO'
  | 'MILITARY_OVERSEAS_EDU'
  | 'CAMPUS_FRESH_GRAD'
  | 'BASELINE';

export interface EduPath {
  path_id: string;
  title: string;
  short_name: string;
  stage_group: EduStageGroup;
  target_age: string;
  badge: string;
  is_baseline?: boolean;
  track_a: {
    duration_years: number;
    total_official_tuition_cny: number; // 在校总学费住宿费（负数代表国家倒贴补贴或代偿学费）
    living_cost_per_year: number;
    final_degree: string;
    bianzhi_guarantee: string;
    hard_threshold: string;
    portal_name: string;
    portal_url?: string;
  };
  track_b: {
    starting_monthly_net: number;
    lock_in_years: number; // 强制锁定期
    lock_in_desc: string;
    certificate_risk: string;
    biggest_regret: string;
    agency_scam_save: number; // 避免黑中介/择校智商税
  };
  verdict_fit: string[];
  verdict_avoid: string[];
}

export const EDU_STAGE_GROUP_LABELS: { id: EduStageGroup; label: string; desc: string }[] = [
  {
    id: 'HIGH_SCHOOL_GAOKAO',
    label: '① 中考/高考统招提前批分流 (15-20岁)',
    desc: '凭中考/高考成绩在省考试院提前批或专项批填报，0中介费锁死公办本科、事业编、军士或铁路局',
  },
  {
    id: 'MILITARY_OVERSEAS_EDU',
    label: '② 部队考军校、退役士兵专项考研与公立免学费留学 (17-25岁)',
    desc: '参军考军校授少尉衔、服役2年领20万退伍金降20-60分考985全日制硕士，或走意大利公立0学费+DSU助学金读本硕',
  },
  {
    id: 'CAMPUS_FRESH_GRAD',
    label: '③ 高校应届生专属政策跳板 (大四/研一校内选拔)',
    desc: '严卡应届生身份！解锁考研初试+10分、最高4.8万大学学费代偿、定向考公特招池与国家公派海外任教',
  },
];

export const EDU_PK_DATA: EduPath[] = [
  {
    path_id: 'PATH_003',
    title: '公办中本贯通（3年中职免学费 + 4年公办应用型本科）',
    short_name: '003 公办中本贯通 (7年全日制本科)',
    stage_group: 'HIGH_SCHOOL_GAOKAO',
    target_age: '15岁中考分流边缘',
    badge: '避开高考肉搏 · 省下25万民办学费',
    track_a: {
      duration_years: 7,
      total_official_tuition_cny: 24000, // 前3年免学费，后4年公办本科约6000/年
      living_cost_per_year: 12000,
      final_degree: '全日制普通本科毕业证(注贯通字样) + 学士学位证',
      bianzhi_guarantee: '无包分配，市场化高就业率工科/护理/轨交校招',
      hard_threshold: '试点省市本地户籍 · 中考普高线上下 · 通过第3年转段考',
      portal_name: '各省市教育考试院中考提前批',
      portal_url: 'https://www.chsi.com.cn',
    },
    track_b: {
      starting_monthly_net: 6500,
      lock_in_years: 7,
      lock_in_desc:
        '专业锁死7年：15岁选定专业后本科严禁转专业，但毕业后全国自由择业/考研/考公',
      certificate_risk:
        '第3年转段统考有 5%-10% 挂科退回中专风险；本科毕业证印有“中本贯通”字样',
      biggest_regret:
        '前3年在中职校区就读，若孩子自制力极差随波逐流，可能卡在转段考功亏一篑',
      agency_scam_save: 80000,
    },
    verdict_fit: [
      '拥有京沪苏浙鲁等试点地户籍，中考预估在普高线边缘（差10-20分或刚过线）',
      '孩子动手能力尚可、不排斥工科/护理/轨交，但应试刷题能力拼不过重点高中卷王',
      '家庭不想掏25-35万去读民办高中+民办三本，追求极高教育ROI',
    ],
    verdict_avoid: [
      '孩子在15岁时对所报具体专业（如护理、学前教育）有强烈生理厌恶',
      '有极深的“名校第一学历情结”，未来非顶尖央企总部或顶级投行不进的家庭',
    ],
  },
  {
    path_id: 'PATH_004',
    title: '国家公费定向医学生 / 基层农技生（高职/本科提前批）',
    short_name: '004 公费定向医农生 (0学费+直接入编)',
    stage_group: 'HIGH_SCHOOL_GAOKAO',
    target_age: '18岁高考二本线下/本科段',
    badge: '大学倒贴补助 · 毕业直入乡镇事业编',
    track_a: {
      duration_years: 3, // 以典型3年制公费专科定向生（或5年制本科）为例
      total_official_tuition_cny: -12000, // 免学费住宿费，且3年共发约1.2万生活补助
      living_cost_per_year: 10000,
      final_degree: '全日制公办统招专科（或5年制本科）毕业证',
      bianzhi_guarantee: '铁律刚兑：入学签三方协议，毕业直接落实本县乡镇事业编制',
      hard_threshold: '定向县本地户籍 · 高考提前批填报 · 签署6年基层服务协议',
      portal_name: '省教育考试院提前批 / 阳光高考',
      portal_url: 'https://gaokao.chsi.com.cn',
    },
    track_b: {
      starting_monthly_net: 4500,
      lock_in_years: 6,
      lock_in_desc:
        '人事关系锁死6年：毕业后必须在定向乡镇卫生院/农技站连续工作6年，违约记入诚信黑名单',
      certificate_risk:
        '医学生入编后若连续考不出《执业（助理）医师证》，将被依法解聘退编并追缴公费',
      biggest_regret:
        '21岁毕业后向往大城市繁华，受不了乡镇枯燥与公共卫生填表，强行违约赔付8-10万且毁掉征信',
      agency_scam_save: 25000,
    },
    verdict_fit: [
      '高考分数卡在二本线下、公办大专线上，家里经济拮据、急需“毕业即有铁饭碗”托底',
      '孩子性格沉稳恋家，愿意留在老家县城/乡镇过安稳日子，不向往北上广深漂泊',
      '看重“公办事业编制+五险一金”的终身确定性，胜过看重高昂账面月薪',
    ],
    verdict_avoid: [
      '孩子心气极高、渴望去一二线大城市闯荡或毕业后立刻脱产考全日制研究生',
      '晕血、极度排斥基层医疗护理或农业下乡工作',
    ],
  },
  {
    path_id: 'PATH_011',
    title: '定向培养军士（高考专科提前批 · 2.5年公办高校 + 入伍直接授下士军衔）',
    short_name: '011 定向培养军士 (2.5年高校+授下士衔)',
    stage_group: 'HIGH_SCHOOL_GAOKAO',
    target_age: '18-20岁高考专科提前批',
    badge: '退还最高2.4万学费 · 大三起月入7000+',
    track_a: {
      duration_years: 2.5,
      total_official_tuition_cny: 0, // 入伍后国家全额代偿返还前3年学费（最高8000/年）
      living_cost_per_year: 10000,
      final_degree: '全日制公办统招大专毕业证 + 解放军/武警下士军衔',
      bianzhi_guarantee: '铁律刚兑：大三下学期直接入伍转下士，满12年由政府安排工作(转事业编/国企)',
      hard_threshold: '未满20周岁应届高中生 · 高考专科提前批 · 通过征兵体检与政审',
      portal_name: '全国征兵网 / 各省高考专科提前批',
      portal_url: 'https://www.gfbzb.gov.cn',
    },
    track_b: {
      starting_monthly_net: 7500,
      lock_in_years: 5,
      lock_in_desc:
        '至少服役至下士期满（含高校共5-7年），若想拿政府转业安置工作需在部队干满12年',
      certificate_risk:
        '在第2.5年入伍前若体格复检或体能联考不合格，将被退回普通专科班失去军士资格',
      biggest_regret:
        '受不了部队全封闭军事化管理与禁止长时间玩手机，中途思想滑坡闹退兵面临严厉征信惩戒',
      agency_scam_save: 65000,
    },
    verdict_fit: [
      '高考320-450分（二本线下）、身体素质好，不想读昂贵民办本科毕业即失业的男生/女生',
      '希望21岁起就每月实发7000-8500元且部队包吃住、国家全额退还大学学费的工薪家庭',
    ],
    verdict_avoid: [
      '高度近视（裸眼低于4.5且做过违规晶体手术）、纹身超标或直系亲属政审不过关者',
      '散漫成性、抗拒部队纪律与体能训练的考生',
    ],
  },
  {
    path_id: 'PATH_012',
    title: '原铁道部直属高职专科：铁道机车运用与维护 / 供电（国铁18个铁路局校招直入）',
    short_name: '012 原铁道部直属高职 (国铁18局校招)',
    stage_group: 'HIGH_SCHOOL_GAOKAO',
    target_age: '18岁高考专科批 & 大三校招',
    badge: '3年学费仅1.8万 · 大三校招直签铁路局',
    track_a: {
      duration_years: 3,
      total_official_tuition_cny: 18000, // 公办高职3年学费+住宿费约1.8万
      living_cost_per_year: 11000,
      final_degree: '全日制公办普通高职（专科）毕业证',
      bianzhi_guarantee: '高比例校招直签：大三上学期国铁18个铁路局进校直招，签央企正式劳动合同(六险二金)',
      hard_threshold: '18-22岁 · 严禁色盲色弱 · 必须认准原铁道部老牌公办铁道高职6大核心专业',
      portal_name: '中国铁路人才招聘网 / 各省高考专科批',
      portal_url: 'https://rczp.china-railway.com.cn',
    },
    track_b: {
      starting_monthly_net: 7200,
      lock_in_years: 3,
      lock_in_desc:
        '与铁路局机务段/供电段签署3-5年首期央企正式合同，机车乘务员需经历副司机到正司机晋升考',
      certificate_risk:
        '在校期间绝对不能挂科补考！铁路局大三秋招网申直接筛掉有挂科记录的学生',
      biggest_regret:
        '机务段火车司机与供电段接触网工需承受高频率熬夜跑车与公寓待乘制度，生物钟颠倒',
      agency_scam_save: 90000,
    },
    verdict_fit: [
      '高考380-470分理科生、辨色力完全正常，想用不到2万学费换取“央企正式工+六险二金”的家庭',
      '认准石家庄铁路职院、武汉铁院、南京铁院、湖南铁院等原铁道部老牌公办专科的务实考生',
    ],
    verdict_avoid: [
      '有任何轻微色弱/色盲（铁路机务/信号体检一票否决，切勿误报！）',
      '轻信黑中介“交10万免试安排进高铁当乘务员/正式工”骗局的家长',
    ],
  },
  {
    path_id: 'PATH_013',
    title: '重点高校招收农村和脱贫地区学生专项计划（国家专项 / 地方专项 / 高校专项）',
    short_name: '013 农村三大专项 (降15-50分进985/211)',
    stage_group: 'HIGH_SCHOOL_GAOKAO',
    target_age: '16-22岁农村户籍高考考生',
    badge: '0元申报 · 降分15-50分录取公办985/211',
    track_a: {
      duration_years: 4,
      total_official_tuition_cny: 22000, // 公办985/211大学4年学费约2.2万
      living_cost_per_year: 12000,
      final_degree: '985 / 211 / 双一流公办重点大学全日制本科双证(与统招生100%一致)',
      bianzhi_guarantee: '获顶尖名校第一学历，保研、央国企校招与定向选调生考公畅通无阻',
      hard_threshold: '严格执行“户籍+学籍+实际就读”连续满3年三统一 · 高校专项须4月25日前网报',
      portal_name: '教育部阳光高考特殊类型招生平台',
      portal_url: 'https://gaokao.chsi.com.cn/gxzxbm',
    },
    track_b: {
      starting_monthly_net: 9500,
      lock_in_years: 4,
      lock_in_desc:
        '无毕业去向锁死，但部分高校对专项计划录取至农林/地矿/哲学等冷门专业的学生限制转专业',
      certificate_risk:
        '空挂农村学籍而在省城私立中学借读的“假农村生”在省考试院大数据联审中会被直接取消资格',
      biggest_regret:
        '只顾看名校光环盲目勾选完全不感兴趣的冷门基础学科，或错过4月25日阳光高考网高校专项网报截止日',
      agency_scam_save: 45000,
    },
    verdict_fit: [
      '父母及本人为实施区域农村户籍、且高中3年真正在本县中学实际就读的寒门学子',
      '高考成绩在一本线/特控线附近或略高，希望利用法定降分政策逆袭985/211公办名校的家庭',
    ],
    verdict_avoid: [
      '学籍在县中但人长期在省城中学借读的“人籍分离”考生（严查必退档）',
      '听信机构花3-5万买所谓“专项计划内部降分指标”的家长',
    ],
  },
  {
    path_id: 'PATH_015',
    title: '军队院校面向士兵招生（部队考军校 / 优秀大学生士兵提干）',
    short_name: '015 部队考军校/提干 (授少尉军官衔)',
    stage_group: 'MILITARY_OVERSEAS_EDU',
    target_age: '17-24岁高中/在校/毕业入伍士兵',
    badge: '0学费带薪读军校 · 毕业授少尉军官衔',
    track_a: {
      duration_years: 5, // 1年义务兵备考 + 4年军校本科（提干为1.5年士兵+半年任职培训）
      total_official_tuition_cny: -75000, // 5年全免学费食宿，且累计发放约7.5万义务兵与军校学员津贴！
      living_cost_per_year: 0, // 部队与军校食宿被装医疗100%国家全包
      final_degree: '解放军军事院校全日制本科双证 + 现役少尉军官军衔',
      bianzhi_guarantee: '铁律刚兑：军校毕业直接授少尉军官（排长/技术军官），享军官薪资、住房公积金与免费医疗',
      hard_threshold: '高中/在校生≤22岁(大专毕业≤24岁) · 入伍满1年 · 5月军事共同科目全优+6月全军统考',
      portal_name: '全国征兵网（国防部征兵办公室）',
      portal_url: 'https://www.gfbzb.gov.cn',
    },
    track_b: {
      starting_monthly_net: 10500,
      lock_in_years: 8,
      lock_in_desc:
        '现役军官须服从全军组织分配（含边海防与野战部队），未满最低服役年限严禁自主退役',
      certificate_risk:
        '白天连队体能训练极重，全靠熄灯后熬夜刷题；且5月军事共同科目任何一项挂科即取消文化统考资格',
      biggest_regret:
        '高考滑档后入伍以为部队考学很容易，结果缺乏自制力熬夜刷题失败，2年后退伍仍只有高中学历',
      agency_scam_save: 110000,
    },
    verdict_fit: [
      '17-22岁高考发挥失常但高中数理化功底扎实、体能充沛，渴望“不花家里一分钱实现军官阶层跨越”的青年',
      '24岁以内全日制大专/本科毕业参军，瞄准专升本军校或大学生士兵提干的硬核考生',
    ],
    verdict_avoid: [
      '截至报考当年1月1日已超龄（高中22岁/大专24岁）或体能考核（3000米/引体向上/射击）不及格者',
      '轻信骗子“花10万找部队关系保送考上军校/直接提干”的家长',
    ],
  },
  {
    path_id: 'PATH_067',
    title: '退役大学生士兵专项硕士研究生招生计划（先服役2年 → 降分考取全日制名校硕士）',
    short_name: '067 退役大学生士兵专项考研 (攒20万+降分读985硕)',
    stage_group: 'MILITARY_OVERSEAS_EDU',
    target_age: '18-24岁高校在校/应届入伍',
    badge: '攒15-22万退伍金 · 复试线降20-60分读985双证硕',
    track_a: {
      duration_years: 5, // 2年部队义务兵服役 + 3年全日制硕士研究生
      total_official_tuition_cny: -165000, // 2年退伍发放15-22万退役金+本科全额学费退还，扣除读研3年学费(约2.4万)仍净倒贴约16.5万！
      living_cost_per_year: 6000, // 前2年部队全包0开销，后3年读研每年有≥6000元国家助学金冲抵生活费
      final_degree: '985 / 211 名校全日制硕士研究生毕业证 + 硕士学位证（双证与统考生100%一致）',
      bianzhi_guarantee: '彻底洗掉双非/大专第一学历，享退役大学生士兵定向考公/选调生与央国企校招优待',
      hard_threshold: '18-24岁高校学生入伍服满2年义务兵役 · 持《入伍批准书》与《退出现役证》报研招网专项',
      portal_name: '中国研究生招生信息网（研招网专项计划专栏）',
      portal_url: 'https://yz.chsi.com.cn',
    },
    track_b: {
      starting_monthly_net: 13500,
      lock_in_years: 2,
      lock_in_desc:
        '仅前2年义务兵服役期为军事化强制锁定（严禁中途闹退兵拒服兵役！），退伍后读研及硕士毕业完全自由择业',
      certificate_risk:
        '2年脱离书本后高数与考研英语极易生疏；且顶尖985经管法热门专项近年也有名校退伍兵竞争，仍需扎实备考',
      biggest_regret:
        '入伍后受不了高强度体能闹退兵被按“拒服兵役”除名（终身禁考公考编！），或退伍后挥霍完20万退伍金弃考',
      agency_scam_save: 42800,
    },
    verdict_fit: [
      '普通二本/民办三本/大专在读或应届生，受困于第一学历歧视或一战考研失利，想用2年军旅换“20万退伍金+降20-60分进985全日制硕士”的青年',
      '大专生走“2年当兵 → 免试专升本读公办本科 → 退役士兵专项考985硕士”实现零成本学历三级跳的寒门学子',
    ],
    verdict_avoid: [
      '体能极差或心理抗压弱、入伍后可能闹退兵的青年（拒服兵役将终身禁考公考编并处巨额罚款）',
      '轻信培训机构收3-5万吹嘘“内部兵役运作+退役士兵专项保录名额”的考生家长',
    ],
  },
  {
    path_id: 'PATH_034',
    title: '意大利公立大学免学费 + DSU大区政府助学金留学（本科/硕士）',
    short_name: '034 意大利公立免学费+DSU助学金留学',
    stage_group: 'MILITARY_OVERSEAS_EDU',
    target_age: '18-26岁高考≥400分申本 / 本科申硕',
    badge: '公立0学费 + 每年领6000欧政府助学金',
    track_a: {
      duration_years: 2, // 以最典型的2年制全英文授课硕士（或3年制本科）为例
      total_official_tuition_cny: -55000, // 免注册学费，且2年申领DSU助学金净补贴约5.5万-8万人民币覆盖吃住
      living_cost_per_year: 45000, // DSU助学金+免费食堂基本冲抵在意的房租伙食
      final_degree: 'QS前150意大利公立名校（米理/博洛尼亚/都灵理工等）全日制硕士/本科学位（中留服认证）',
      bianzhi_guarantee: '留欧起薪1.2-1.8万/月，或回国走海归硕士选调生、人才引进落户与考公',
      hard_threshold: '申本须高考≥400分 / 申硕须本科双证(不卡双非) · 雅思6.0 · 每年修满规定学分(CFU)',
      portal_name: '意大利大学与研究部官方预注册门户 (Universitaly)',
      portal_url: 'https://www.universitaly.it',
    },
    track_b: {
      starting_monthly_net: 12000,
      lock_in_years: 2,
      lock_in_desc:
        '宽进严出学分硬约束：第一学年必须修满20-30个CFU学分，否则不仅停发次年助学金，还会被政府追缴首年已发补贴！',
      certificate_risk:
        '期末多为教授1对1口试(Esame Orale)，无平时分放水；递签若用临时大额存入的假银行流水会被直接拒签',
      biggest_regret:
        '被黑中介忽悠去走“马可波罗计划”白交6-8万私立语言预科费，其实走【国际生英语授课通道】0元语言费即可直录',
      agency_scam_save: 50000,
    },
    verdict_fit: [
      '普通二本考研失利或高考400-520分，家里掏不起英美澳港30-50万学费，想用3-4万启动垫付金读世界名校的学子',
      '学习自律性强，能确保每年按时修够学分稳拿6000-8000欧元大区政府DSU助学金的人',
    ],
    verdict_avoid: [
      '想靠混日子水文凭的人（修不够学分会被大区政府依法追讨退还已发放的几千欧元助学金！）',
      '父母银行卡近6个月无正常流水、试图在签证前几天突然存入5万块假流水的人',
    ],
  },
  {
    path_id: 'PATH_021',
    title: '大学生志愿服务西部计划（考研初试加10分 + 定向考公 + 学费代偿）',
    short_name: '021 大学生西部计划 (考研+10分/学费代偿)',
    stage_group: 'CAMPUS_FRESH_GRAD',
    target_age: '21-25岁大四/研一应届生(3-5月校内网报)',
    badge: '考研初试总分+10分 · 退还最高4.8万学费',
    track_a: {
      duration_years: 2, // 必须签满2年服务期才解锁考研加10分与定向考公
      total_official_tuition_cny: -32000, // 0元报名且国家代偿返还大学学费（本专科最高1.6万/年，2年共3.2万）
      living_cost_per_year: 0, // 服务单位提供免费住宿，每月发放2200-5500元生活津贴完全自给自足
      final_degree: '《大学生志愿服务西部计划服务鉴定书》+ 3年内考研初试总分+10分 + 公务员四项目定向招录资格',
      bianzhi_guarantee: '服务满2年享国考/省考1:1-1:3极低竞争比“四项目人员定向岗”，新疆兵团期满留任考编上岸率极高',
      hard_threshold: '100%锁死当年统招应届本专科毕业生或在读研究生 · 每年3-5月毕业离校前经校团委盖章选拔',
      portal_name: '大学生志愿服务西部计划信息系统（共青团中央）',
      portal_url: 'https://xibu.youth.cn',
    },
    track_b: {
      starting_monthly_net: 6500,
      lock_in_years: 2,
      lock_in_desc:
        '一年一签，但若只干满1年就退出回城，将彻底丧失“考研初试加10分”与“公务员定向特招”两项核心政策红利！',
      certificate_risk:
        '6月毕业离校拿到毕业证后才想起报名即彻底丧失资格（每年仅3-5月在校期间开放）',
      biggest_regret:
        '在乡镇政府办公室被日常迎检台账消磨了斗志，晚上刷手机放弃了复习，白白浪费了宝贵的考研+10分与定向考公特权',
      agency_scam_save: 12000,
    },
    verdict_fit: [
      '大四考研一战失利或考公落榜的普通二本/大专应届生，想0成本拿下“考研初试总分+10分”与“定向考公特招池”的人',
      '大学背有国家助学贷款（服务满2-3年国家直接代偿3.2万-4.8万学费）的寒门应届毕业生',
    ],
    verdict_avoid: [
      '已经毕业离校超过1年的社会往届生（系统100%锁死应届生校团委审核通道）',
      '只打算去西部体验1年就回城的人（未满2年无任何考研加分与定向考公资格）',
    ],
  },
  {
    path_id: 'PATH_006',
    title: '国家基层服务专项：特岗教师 / 高校毕业生“三支一扶”',
    short_name: '006 特岗教师 / 三支一扶 (学费代偿+期满入编)',
    stage_group: 'CAMPUS_FRESH_GRAD',
    target_age: '21-26岁应届及择业期高校毕业生',
    badge: '特岗3年直接转事业编 · 代偿最高3.6万学费',
    track_a: {
      duration_years: 3, // 特岗3年转编 / 三支一扶2年期满
      total_official_tuition_cny: -27000, // 发放3000元安家费 + 退还代偿大学学费2.4-3.6万
      living_cost_per_year: 0, // 服务期每月发2800-5000元财政津贴+五险一金+乡镇周转宿舍
      final_degree: '正式在编教师（特岗3年期满考核直接入编）或三支一扶期满入编/四项目定向考公资格',
      bianzhi_guarantee: '高兑现度：特岗教师3年服务期满直接办理县域正式教师事业编；三支一扶享专项入编或定向考公',
      hard_threshold: '18-30岁全日制大专/本科毕业生 · 严卡应届或2-3年择业期未就业身份',
      portal_name: '人社部三支一扶专栏 / 各省人事考试网',
      portal_url: 'http://www.mohrss.gov.cn',
    },
    track_b: {
      starting_monthly_net: 5800,
      lock_in_years: 3,
      lock_in_desc:
        '驻扎本省县乡学校或乡镇政府服务2-3年，特岗转编后通常需继续在本县服务满规定年限',
      certificate_risk:
        '部分空编已满的县区，三支一扶2年期满不能直接给编，仍需参加定向招考（特岗教师直接转编更稳）',
      biggest_regret:
        '听信公考机构忽悠花3.98万报所谓“三支一扶不过退费协议班”，其实考题远比省考简单，80元教材自刷即过',
      agency_scam_save: 30000,
    },
    verdict_fit: [
      '21-26岁刚毕业或择业期内，省考100:1落榜、希望绕开申论死卷降维拿事业编的二本/大专毕业生',
      '需要国家代偿退还大学助学贷款（最高3.6万）且立刻有五险一金与宿舍托底的毕业生',
    ],
    verdict_avoid: [
      '已毕业多年且缴纳过企业社保的大龄社会人（多数省份严卡应届与择业期资格）',
      '完全无法接受乡镇生活环境的城市享乐型人群',
    ],
  },
  {
    path_id: 'PATH_035',
    title: '教育部语合中心国际中文教育志愿者（国家公派海外任教）',
    short_name: '035 语合中心公派国际中文志愿者 (应届)',
    stage_group: 'CAMPUS_FRESH_GRAD',
    target_age: '21-26岁大四应届或在读研究生',
    badge: '国家公派包机票住宿 · 月发800-1000美元免税津贴',
    track_a: {
      duration_years: 1, // 常规任期1年（可申请留任至2-3年）
      total_official_tuition_cny: 600, // 仅需个人承担出入境体检与无犯罪公证约600元，培训签证机票国家全包
      living_cost_per_year: 0, // 海外任教包住宿且每月发800-1000美元免税津贴+1000美元安家费，年净攒5-6万
      final_degree: '教育部语合中心《国际中文教育志愿者荣誉证书》+ 国家公派海外任教履历',
      bianzhi_guarantee: '服务期算工龄，回国考特岗/中小学教师或留任海外国际学校/中资出海企业极具优势',
      hard_threshold: '严卡大四应届毕业前（10-11月或3-4月）或在读研期间经本校教务处盖章推荐 · 英语四级≥425/普话达标',
      portal_name: '教育部中外语言交流合作中心项目管理平台',
      portal_url: 'https://pmplatform.chinese.cn',
    },
    track_b: {
      starting_monthly_net: 6200,
      lock_in_years: 1,
      lock_in_desc:
        '公派海外任教1-3年，须严格遵守外事纪律与任教学校排课（每周18-24节课+文化活动）',
      certificate_risk:
        '一旦6月毕业拿到毕业证离开学校变成社会往届生，即彻底失去高校盖章推荐通道无法报名！',
      biggest_regret:
        '大四时不知道语合中心官方免费公派通道，毕业后被黑劳务中介收3.5万卖去东南亚私立学校当月薪4000元的廉价黑外教',
      agency_scam_save: 35000,
    },
    verdict_fit: [
      '大四在读或研一研二在读的文科/外语/教育/中文类学生（含二本与民办本科），想0中介费公派合法出海攒下5-6万免税第一桶金的人',
      '向往跨文化教学体验、希望国家全额报销往返国际机票与海外医疗保险的应届生',
    ],
    verdict_avoid: [
      '已经毕业离校的社会往届生（无高校教务处推荐通道，社会成人请改走 PATH_056 iTalki独立中文教师）',
      '误以为语合中心志愿者也享受全国统一考研初试加10分的人（考研+10分请选 PATH_021 西部计划或 PATH_006 三支一扶）',
    ],
  },
  {
    path_id: 'PATH_BASELINE',
    title: '【对照组】常规盲目硬挤路线（民办普高 → 民办三本 → 毕业海投/自费脱产二战）',
    short_name: '⚠️ 对照组：掏空家底读民办普高/民办三本',
    stage_group: 'BASELINE',
    target_age: '15-22岁盲目从众家庭',
    badge: '高昂沉没成本 · 毕业无编无技能',
    is_baseline: true,
    track_a: {
      duration_years: 7,
      total_official_tuition_cny: 260000, // 3年民办普高14万 + 4年民办本科12万
      living_cost_per_year: 18000,
      final_degree: '民办本科（原三本/独立学院）文凭',
      bianzhi_guarantee: '0保障，毕业直接卷入千万应届生失业潮与申论100:1独木桥',
      hard_threshold: '高额家庭现金流持续输血（7年含生活费总耗近39万）',
      portal_name: '常规高价民办批次',
    },
    track_b: {
      starting_monthly_net: 4500,
      lock_in_years: 0,
      lock_in_desc:
        '名义上完全自由，实则因缺乏硬技能与编制保护，陷入“脱不下长衫”的求职困境',
      certificate_risk:
        '民办文凭在考编与大厂简历关无优势，极易沦为二战、三战全职在家啃老备考族',
      biggest_regret:
        '掏空父母30多万养老钱换来一张缺乏竞争力的文凭，25岁时还要靠家里贴补房租生活费',
      agency_scam_save: 0,
    },
    verdict_fit: [
      '家庭资产丰厚（50万教育支出毫无压力），仅需一张本科文凭继承家业或纯消费型读书',
    ],
    verdict_avoid: [
      '普通工薪/农村/县城家庭，指望靠砸锅卖铁甚或借债读高价民办学校实现阶层跃迁',
    ],
  },
];

interface StudentPathPKMatrixProps {
  selectedStudentIds?: string[];
  onToggleStudentId?: (id: string) => void;
  onSetStudentIds?: (ids: string[]) => void;
  onJumpToCard?: (id: string) => void;
}

export const StudentPathPKMatrix: React.FC<StudentPathPKMatrixProps> = ({
  selectedStudentIds: externalSelectedIds,
  onToggleStudentId,
  onSetStudentIds,
  onJumpToCard,
}) => {
  // 家长可支配的教育准备金
  const [familyEduFund, setFamilyEduFund] = useState<number>(150000);
  // 是否在最后一列固定展示“民办高价对照组”
  const [showBaselineColumn, setShowBaselineColumn] = useState<boolean>(true);
  // 内部选中的学生路径 ID（当父组件未受控时使用）
  const [internalSelectedIds, setInternalSelectedIds] = useState<string[]>([
    'PATH_013',
    'PATH_004',
    'PATH_021',
  ]);

  const selectedIds = externalSelectedIds ?? internalSelectedIds;

  const handleToggleId = (id: string) => {
    if (onToggleStudentId) {
      onToggleStudentId(id);
      return;
    }
    setInternalSelectedIds((prev) => {
      if (prev.includes(id)) {
        return prev.length > 1 ? prev.filter((item) => item !== id) : prev;
      }
      if (prev.length >= 3) {
        return [...prev.slice(1), id];
      }
      return [...prev, id];
    });
  };

  const handleSetIds = (ids: string[]) => {
    if (onSetStudentIds) {
      onSetStudentIds(ids);
      return;
    }
    setInternalSelectedIds(ids);
  };

  const baselinePath = useMemo(
    () => EDU_PK_DATA.find((p) => p.is_baseline)!,
    []
  );

  const displayedPaths = useMemo(() => {
    const chosen = EDU_PK_DATA.filter(
      (p) => !p.is_baseline && selectedIds.includes(p.path_id)
    );
    if (showBaselineColumn) {
      return [...chosen.slice(0, 3), baselinePath];
    }
    return chosen;
  }, [selectedIds, showBaselineColumn, baselinePath]);

  // 计算每条路径的 8 年家庭教育总账与断供时间
  const calcPath8YrMetrics = (p: EduPath, fund: number) => {
    // 培养期家庭净支出 = 学费总额 + 培养年限 * 年生活费
    const totalStudyCost = Math.round(
      p.track_a.total_official_tuition_cny +
        p.track_a.duration_years * p.track_a.living_cost_per_year
    );
    const annualStudyBurn =
      p.track_a.duration_years > 0
        ? Math.max(0, totalStudyCost) / p.track_a.duration_years
        : 0;

    // 供完读书后家庭教育基金余额
    const fundBalanceAfterGrad = fund - totalStudyCost;
    const isFamilyInDebt = fundBalanceAfterGrad < 0;

    // 预计第几年教育基金断供？
    let depletionLabel = '全程不断供（教育准备金充裕）';
    if (totalStudyCost <= 0) {
      depletionLabel = `0 断供风险（国家免学费且倒贴/代偿 ¥${Math.abs(totalStudyCost).toLocaleString()}）`;
    } else if (isFamilyInDebt && annualStudyBurn > 0) {
      const surviveYears = Number((fund / annualStudyBurn).toFixed(1));
      depletionLabel = `🚨 预计入学第 ${surviveYears} 年断供（缺口 -¥${Math.abs(
        fundBalanceAfterGrad
      ).toLocaleString()}）`;
    }

    // 在第 8 年末，孩子已经工作了几年？（8 - 培养年限）
    const workedYearsAtYr8 = Math.max(0, Number((8 - p.track_a.duration_years).toFixed(1)));
    // 假设工作期间每年可净存下月薪的 55%
    const childAccumulatedIncome = Math.round(
      workedYearsAtYr8 * 12 * p.track_b.starting_monthly_net * 0.55
    );

    // 第 8 年末“家庭+孩子”综合净财务水位
    const familyNetPositionAtYr8 = fundBalanceAfterGrad + childAccumulatedIncome;

    return {
      path_id: p.path_id,
      totalStudyCost,
      fundBalanceAfterGrad,
      isFamilyInDebt,
      depletionLabel,
      workedYearsAtYr8,
      childAccumulatedIncome,
      familyNetPositionAtYr8,
    };
  };

  const baselineMetrics = useMemo(
    () => calcPath8YrMetrics(baselinePath, familyEduFund),
    [baselinePath, familyEduFund]
  );

  const timeline8Yr = useMemo(
    () => displayedPaths.map((p) => calcPath8YrMetrics(p, familyEduFund)),
    [displayedPaths, familyEduFund]
  );

  // 自动识别当前对比中最经济的升学路径（非对照组中供读净支出最低，若同为倒贴则比第8年末家庭净资产）
  const bestRoiPathId = useMemo(() => {
    const nonBaseline = timeline8Yr.filter((m) => m.path_id !== 'PATH_BASELINE');
    if (nonBaseline.length === 0) return null;
    const sorted = [...nonBaseline].sort((a, b) => {
      if (a.totalStudyCost !== b.totalStudyCost) {
        return a.totalStudyCost - b.totalStudyCost;
      }
      return b.familyNetPositionAtYr8 - a.familyNetPositionAtYr8;
    });
    return sorted[0].path_id;
  }, [timeline8Yr]);

  return (
    <div className="space-y-6">
      {/* 头部标题、路径分类选择器与家庭教育基金压力测试滑块 */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-5">
        <div className="border-b border-slate-800 pb-5 flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400 mb-1.5">
              <span className="text-blue-400 font-semibold">
                学生升学与应届分流 · 8年家庭总账 PK 沙盘（共收录 11 条专属升学/应届通道）
              </span>
              <span aria-hidden="true">·</span>
              <span>已与“成人转行PK”彻底解耦</span>
              <span aria-hidden="true">·</span>
              <span>对比“国家专项/提前批/应届跳板”与“盲目砸钱读民办”</span>
            </div>
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <GraduationCap className="w-6 h-6 text-blue-400 shrink-0" />
              <span>
                {displayedPaths.map((p) => p.short_name.split(' ')[0] + ' ' + (p.short_name.split(' ')[1] || '')).join('  VS  ')}
              </span>
            </h2>
          </div>

          {/* 经典升学/应届分流组合一键 PK */}
          <div className="flex flex-wrap items-center gap-1.5 text-xs">
            <span className="text-slate-400 mr-1">升学/应届典型组合一键对比：</span>
            {[
              {
                label: '高考低分逆袭：013 农村三大专项 VS 004 公费定向生 VS 011 定向培养军士',
                ids: ['PATH_013', 'PATH_004', 'PATH_011'],
              },
              {
                label: '考研逆袭名校硕士：067 退役士兵专项考研 VS 021 西部计划(考研+10分) VS 034 意大利0学费留学',
                ids: ['PATH_067', 'PATH_021', 'PATH_034'],
              },
              {
                label: '大四应届专属跳板：021 西部计划 VS 006 特岗/三支一扶 VS 035 语合公派',
                ids: ['PATH_021', 'PATH_006', 'PATH_035'],
              },
              {
                label: '中考/高考工科铁饭碗：003 中本贯通 VS 012 铁道高职 VS 015 部队考军校',
                ids: ['PATH_003', 'PATH_012', 'PATH_015'],
              },
            ].map((preset) => (
              <button
                key={preset.label}
                onClick={() => handleSetIds(preset.ids)}
                className="px-2.5 py-1.5 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 text-blue-300 font-medium transition whitespace-nowrap"
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>

        {/* 10 条学生升学与应届分流路径分阶段点选池 */}
        <div className="space-y-3 border-b border-slate-800 pb-5">
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2 text-slate-300 font-semibold">
              <Layers className="w-4 h-4 text-blue-400" />
              <span>
                点选 1 - 3 条【学生升学 / 应届专属路径】同屏 PK（当前已选 {selectedIds.length}/3）：
              </span>
            </div>
            <label className="flex items-center gap-2 cursor-pointer text-rose-300 bg-rose-950/30 border border-rose-500/30 px-3 py-1 rounded-lg">
              <input
                type="checkbox"
                checked={showBaselineColumn}
                onChange={(e) => setShowBaselineColumn(e.target.checked)}
                className="accent-rose-500"
              />
              <span>同屏挂载「⚠️ 民办普高/民办三本对照组」比算差价</span>
            </label>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {EDU_STAGE_GROUP_LABELS.map((grp) => {
              const groupPaths = EDU_PK_DATA.filter((p) => p.stage_group === grp.id);
              return (
                <div
                  key={grp.id}
                  className="bg-slate-950/80 border border-slate-800/90 rounded-xl p-3.5 space-y-2.5"
                >
                  <div>
                    <div className="text-xs font-bold text-blue-300">{grp.label}</div>
                    <div className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                      {grp.desc}
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {groupPaths.map((p) => {
                      const active = selectedIds.includes(p.path_id);
                      return (
                        <button
                          key={p.path_id}
                          onClick={() => handleToggleId(p.path_id)}
                          className={`px-2.5 py-1.5 rounded-lg text-xs font-medium border transition text-left ${
                            active
                              ? 'bg-blue-500/20 border-blue-400 text-blue-200 font-semibold'
                              : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                          }`}
                        >
                          {active ? '✓ ' : '+ '}
                          {p.short_name}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 家庭教育基金压力测试滑块 */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <h3 className="text-sm font-bold text-emerald-400 flex items-center gap-2">
              <Sliders className="w-4 h-4" />
              <span>家庭教育准备金底线测试（拖动滑块，实时测算哪条升学路会断供或倒贴）</span>
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              我们将时间快进到入学/入项后第 8 年末（孩子约 23-28 岁），同时计入在校学费、国家生活补贴/学费代偿与毕业后工作反哺储蓄，算清家庭真实净水位：
            </p>
            <div className="flex flex-wrap items-center gap-1.5 text-xs pt-1">
              <span className="text-slate-400 mr-1">家庭家底快速代入：</span>
              {[
                { label: '极度拮据/助学贷家庭 (¥2万)', val: 20000 },
                { label: '县城普通工薪 (¥6万)', val: 60000 },
                { label: '二三线工薪积蓄 (¥15万)', val: 150000 },
                { label: '宽裕中产家庭 (¥35万)', val: 350000 },
              ].map((preset) => (
                <button
                  key={preset.val}
                  onClick={() => setFamilyEduFund(preset.val)}
                  className={`px-2.5 py-1 rounded border transition whitespace-nowrap shrink-0 ${
                    familyEduFund === preset.val
                      ? 'bg-blue-500/20 border-blue-500/50 text-blue-300'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          <div className="w-full md:w-96 bg-slate-950 p-4 rounded-xl border border-slate-800">
            <label className="flex justify-between text-xs text-slate-300 mb-2">
              <span>父母可拿出的教育总准备金：</span>
              <span className="text-base font-mono font-bold text-emerald-400 tabular-nums">
                ¥{familyEduFund.toLocaleString()}
              </span>
            </label>
            <input
              type="range"
              min="0"
              max="400000"
              step="10000"
              value={familyEduFund}
              onChange={(e) => setFamilyEduFund(Number(e.target.value))}
              className="w-full accent-emerald-500 cursor-pointer"
            />
            <div className="flex justify-between text-[11px] text-slate-500 mt-1 font-mono tabular-nums">
              <span>¥0 (零家底/纯靠政策补贴)</span>
              <span>¥15万 (工薪积蓄)</span>
              <span>¥40万 (宽裕家庭)</span>
            </div>
          </div>
        </div>
      </div>

      {/* 新增：升学路径财务可行性与预计断供时间横向对比行 */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Scale className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-bold text-white">
              升学财务可行性横向对比行（基于家庭准备金{' '}
              <span className="font-mono text-emerald-400">
                ¥{familyEduFund.toLocaleString()}
              </span>{' '}
              自动测算【供读净花费】与【预计断供风险】）
            </h3>
          </div>
          <span className="text-xs text-emerald-300 font-medium">
            ★ 绿框高亮 = 当前选中方案里对家庭最经济（省钱/倒贴最多）的升学路径
          </span>
        </div>

        <div
          className={`grid grid-cols-1 gap-4 ${
            displayedPaths.length === 4
              ? 'lg:grid-cols-4'
              : displayedPaths.length === 3
              ? 'lg:grid-cols-3'
              : 'lg:grid-cols-2'
          }`}
        >
          {displayedPaths.map((p, idx) => {
            const sim = timeline8Yr[idx];
            const isBestRoi = p.path_id === bestRoiPathId;
            return (
              <div
                key={p.path_id}
                className={`rounded-xl p-4 border transition flex flex-col justify-between gap-2.5 ${
                  isBestRoi
                    ? 'bg-emerald-950/35 border-2 border-emerald-400 shadow-lg shadow-emerald-950/30'
                    : p.is_baseline
                    ? 'bg-rose-950/20 border-rose-500/40'
                    : 'bg-slate-950 border-slate-800'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-bold text-white truncate">
                    {p.short_name}
                  </span>
                  {isBestRoi && (
                    <span className="px-2 py-0.5 rounded bg-emerald-400 text-slate-950 text-[11px] font-bold shrink-0">
                      ★ 最经济升学路径
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs bg-slate-900/90 p-2.5 rounded-lg border border-slate-800/80 font-mono tabular-nums">
                  <div>
                    <div className="text-[11px] text-slate-400 font-sans">
                      供完毕业净花费
                    </div>
                    <div
                      className={`font-bold text-sm ${
                        sim.totalStudyCost <= 0
                          ? 'text-emerald-400'
                          : sim.isFamilyInDebt
                          ? 'text-rose-400'
                          : 'text-white'
                      }`}
                    >
                      {sim.totalStudyCost <= 0
                        ? `倒贴 +¥${Math.abs(sim.totalStudyCost).toLocaleString()}`
                        : `¥${sim.totalStudyCost.toLocaleString()}`}
                    </div>
                  </div>
                  <div>
                    <div className="text-[11px] text-slate-400 font-sans">
                      第8年末家庭净水位
                    </div>
                    <div
                      className={`font-bold text-sm ${
                        sim.familyNetPositionAtYr8 >= 0
                          ? 'text-amber-300'
                          : 'text-rose-400'
                      }`}
                    >
                      {sim.familyNetPositionAtYr8 >= 0
                        ? `+¥${sim.familyNetPositionAtYr8.toLocaleString()}`
                        : `-¥${Math.abs(sim.familyNetPositionAtYr8).toLocaleString()}`}
                    </div>
                  </div>
                </div>

                <div
                  className={`text-[11px] font-medium flex items-center gap-1.5 ${
                    sim.isFamilyInDebt ? 'text-rose-300' : 'text-emerald-300'
                  }`}
                >
                  {sim.isFamilyInDebt ? (
                    <AlertTriangle className="w-3.5 h-3.5 shrink-0 text-rose-400" />
                  ) : (
                    <CheckCircle2 className="w-3.5 h-3.5 shrink-0 text-emerald-400" />
                  )}
                  <span>{sim.depletionLabel}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 并排 PK 详细卡片矩阵 */}
      <section
        className={`grid grid-cols-1 gap-5 ${
          displayedPaths.length === 4
            ? 'lg:grid-cols-4'
            : displayedPaths.length === 3
            ? 'lg:grid-cols-3'
            : 'lg:grid-cols-2'
        }`}
      >
        {displayedPaths.map((path, idx) => {
          const sim = timeline8Yr[idx];
          const netAdvantageVsBaseline =
            sim.familyNetPositionAtYr8 - baselineMetrics.familyNetPositionAtYr8;
          const isBestRoi = path.path_id === bestRoiPathId;

          return (
            <div
              key={path.path_id}
              className={`rounded-2xl border flex flex-col justify-between overflow-hidden ${
                isBestRoi
                  ? 'bg-slate-900 border-2 border-emerald-400'
                  : path.is_baseline
                  ? 'bg-slate-900/60 border-rose-500/30'
                  : 'bg-slate-900 border-slate-800'
              }`}
            >
              <div>
                {/* 顶部标识 */}
                <div className="p-5 border-b border-slate-800/80">
                  <div className="flex items-center justify-between text-xs mb-2 gap-2">
                    <span className="font-mono text-slate-300">{path.target_age}</span>
                    <span
                      className={`font-medium text-right ${
                        path.is_baseline ? 'text-rose-400' : 'text-emerald-400'
                      }`}
                    >
                      {path.badge}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-white leading-snug">
                    {path.short_name}
                  </h3>
                </div>

                <div className="p-5 space-y-4">
                  {/* 核心财务沙盘：供完读书要花多少 vs 第8年末家庭净水位 */}
                  <div
                    className={`p-4 rounded-xl border ${
                      sim.isFamilyInDebt
                        ? 'bg-rose-950/30 border-rose-500/40'
                        : 'bg-emerald-950/20 border-emerald-500/30'
                    }`}
                  >
                    <div className="flex justify-between items-center mb-2 gap-1">
                      <span className="text-xs font-bold text-slate-300">
                        培养/服务期家庭净支出
                      </span>
                      <span
                        className={`text-xs font-bold px-2 py-0.5 rounded flex items-center gap-1 shrink-0 ${
                          sim.isFamilyInDebt
                            ? 'bg-rose-500 text-white'
                            : 'bg-emerald-500/20 text-emerald-300'
                        }`}
                      >
                        {sim.isFamilyInDebt ? (
                          <>
                            <AlertTriangle className="w-3 h-3" />
                            <span>掏空家底还欠债</span>
                          </>
                        ) : (
                          <>
                            <ShieldCheck className="w-3 h-3" />
                            <span>预算完全兜得住</span>
                          </>
                        )}
                      </span>
                    </div>

                    <div className="text-2xl font-mono font-bold text-white mb-1 tabular-nums">
                      {sim.totalStudyCost <= 0
                        ? `0元 (净倒贴 +¥${Math.abs(sim.totalStudyCost).toLocaleString()})`
                        : `¥${sim.totalStudyCost.toLocaleString()}`}
                    </div>
                    <div className="text-[11px] text-slate-400 mb-3">
                      官方学费/代偿明细：
                      <strong className="text-emerald-400 ml-1 font-mono tabular-nums">
                        {path.track_a.total_official_tuition_cny <= 0
                          ? `0元 (国家补贴/代偿 +¥${Math.abs(
                              path.track_a.total_official_tuition_cny
                            ).toLocaleString()})`
                          : `¥${path.track_a.total_official_tuition_cny.toLocaleString()} (${path.track_a.duration_years}年总计)`}
                      </strong>
                    </div>

                    <div className="pt-2.5 border-t border-slate-800/80 text-xs flex justify-between items-center">
                      <span className="text-slate-400">第 8 年末家庭+孩子净水位：</span>
                      <span
                        className={`font-mono font-bold text-sm tabular-nums ${
                          sim.familyNetPositionAtYr8 >= 100000
                            ? 'text-amber-400'
                            : sim.familyNetPositionAtYr8 >= 0
                            ? 'text-emerald-400'
                            : 'text-rose-400'
                        }`}
                      >
                        {sim.familyNetPositionAtYr8 >= 0
                          ? `+¥${sim.familyNetPositionAtYr8.toLocaleString()}`
                          : `-¥${Math.abs(sim.familyNetPositionAtYr8).toLocaleString()}`}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500 mt-1 font-mono tabular-nums">
                      (培养期 {path.track_a.duration_years} 年，第 8 年末已工作 {sim.workedYearsAtYr8}{' '}
                      年，反哺储蓄约 ¥{sim.childAccumulatedIncome.toLocaleString()})
                    </div>

                    {!path.is_baseline && (
                      <div className="mt-2.5 pt-2 border-t border-slate-800/60 text-[11px] text-emerald-300">
                        相比民办对照组，第 8 年末家庭总财富多留存{' '}
                        <strong className="font-mono tabular-nums">
                          +¥{netAdvantageVsBaseline.toLocaleString()}
                        </strong>
                      </div>
                    )}
                  </div>

                  {/* 轨 A 硬底牌对比 */}
                  <div className="space-y-2.5 text-xs bg-slate-950/60 p-4 rounded-xl border border-slate-800">
                    <div>
                      <span className="text-slate-500 block mb-0.5">
                        最终法定文凭 / 政策筹码 (轨A)：
                      </span>
                      <span className="text-slate-200 font-semibold">
                        {path.track_a.final_degree}
                      </span>
                    </div>
                    <div className="pt-2 border-t border-slate-800/60">
                      <span className="text-slate-500 block mb-0.5">
                        编制与就业兑现度 (轨A)：
                      </span>
                      <span
                        className={`font-medium ${
                          path.is_baseline ? 'text-rose-300' : 'text-emerald-300'
                        }`}
                      >
                        {path.track_a.bianzhi_guarantee}
                      </span>
                    </div>
                    <div className="pt-2 border-t border-slate-800/60">
                      <span className="text-slate-500 block mb-0.5">准入铁门槛：</span>
                      <span className="text-slate-300">{path.track_a.hard_threshold}</span>
                    </div>
                    <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between gap-2">
                      <span className="text-slate-500 shrink-0">官方门户：</span>
                      {path.track_a.portal_url ? (
                        <a
                          href={path.track_a.portal_url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-blue-400 hover:underline flex items-center gap-1 text-right"
                        >
                          <span className="truncate max-w-[180px]">
                            {path.track_a.portal_name}
                          </span>
                          <ArrowUpRight className="w-3 h-3 shrink-0" />
                        </a>
                      ) : (
                        <span className="text-slate-400">{path.track_a.portal_name}</span>
                      )}
                    </div>
                  </div>

                  {/* 轨 B 契约枷锁与暗雷对撞 */}
                  <div className="space-y-2.5 text-xs bg-amber-950/10 p-4 rounded-xl border border-amber-500/20">
                    <div>
                      <span className="text-amber-400/90 font-semibold block mb-0.5">
                        青春锁定期与契约代价 (轨B)：
                      </span>
                      <span className="text-slate-300 leading-relaxed">
                        {path.track_b.lock_in_desc}
                      </span>
                    </div>
                    <div className="pt-2 border-t border-slate-800/60">
                      <span className="text-rose-400 font-semibold block mb-0.5">
                        最大中途翻车风险：
                      </span>
                      <span className="text-slate-300 leading-relaxed">
                        {path.track_b.certificate_risk}
                      </span>
                    </div>
                    <div className="pt-2 border-t border-slate-800/60">
                      <span className="text-slate-400 font-semibold block mb-0.5">
                        一线家长/学长最真实后悔点：
                      </span>
                      <span className="text-slate-300 leading-relaxed">
                        {path.track_b.biggest_regret}
                      </span>
                    </div>
                    {path.track_b.agency_scam_save > 0 && (
                      <div className="pt-2 border-t border-slate-800/60 text-emerald-400">
                        走官方门户直报，立省“内部指标/高价志愿规划”智商税{' '}
                        <strong className="font-mono tabular-nums">
                          ¥{path.track_b.agency_scam_save.toLocaleString()}
                        </strong>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* 底部拍板指南 */}
              <div className="p-5 bg-slate-950 border-t border-slate-800 space-y-2.5 text-xs">
                <div className="font-bold text-emerald-400">适合拍板此路线的学生/家庭：</div>
                <ul className="space-y-1.5 text-slate-300">
                  {path.verdict_fit.map((v, i) => (
                    <li key={i} className="flex items-start gap-1.5 leading-relaxed">
                      <span className="text-emerald-400 font-bold shrink-0">•</span>
                      <span>{v}</span>
                    </li>
                  ))}
                </ul>
                <div className="font-bold text-rose-400 pt-2 border-t border-slate-800/80">
                  坚决不要选的情况：
                </div>
                <ul className="space-y-1.5 text-slate-400">
                  {path.verdict_avoid.map((v, i) => (
                    <li key={i} className="flex items-start gap-1.5 leading-relaxed">
                      <span className="text-rose-400 font-bold shrink-0">×</span>
                      <span>{v}</span>
                    </li>
                  ))}
                </ul>

                {!path.is_baseline && onJumpToCard && (
                  <div className="pt-3 border-t border-slate-800 flex justify-end">
                    <button
                      onClick={() => onJumpToCard(path.path_id)}
                      className="text-blue-400 hover:text-blue-300 font-semibold flex items-center gap-1"
                    >
                      <span>在沙盘总库查看 {path.path_id} 完整双轨证据链</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </section>
    </div>
  );
};
