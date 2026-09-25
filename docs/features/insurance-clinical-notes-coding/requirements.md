# Insurance Clinical Notes & Coding — 需求草案

日期：2026-09-24。状态：Sue 已确认 F03 整体方向（2026-09-24）；按阶段实现并验收。关联：[步骤追踪表](./tracker.md)。

Sue 已授权先将三份需求文档提交并 push 到当前 feature/sue-1，作为需求基线。后续优先通用临床记录、初诊/复诊/复评、治疗分段与实际时间、英文草稿人工审核；不等待所有 plan 资料。每个可独立检查的阶段记录进度和实际测试结果并 commit，由 Sue 分阶段验收；功能准备好时创建 PR，不自动 merge。语音在数据处理方案明确后实施。本文不表示保险支付承诺，也不把候选政策变成程序规则。

## 1. 找到的项目流程

已检查根 AGENTS.md、docs/app-building-virtual-assistant/AGENTS.md、project-plan.md、README.md、package.json、docs/git-instructions.txt、近期 changelog、项目技能及本机会话可见的技能目录。没有找到独立的 Use Feature Skill 或同名别名。

可沿用的流程是项目指南的 A3/A4（写需求并确认）、Stage B（分阶段实现、自检、Sue 验收）、Phase 4/5（临床流程和来源规则），以及 Git 指南第 3/4 节的 feature 分支与 PR 流程。这是现有流程的组合，不宣称找到了另一个同名技能。

目前分支 feature/sue-1，起始工作区干净，HEAD e0a06e0。近期提交与 2026-09-24 的 discoverable-assistant-skills、default-assistant-activation、daily-git-wrap-up、personal-project-navigation 日志主要涉及助手入口、导航和 Git 工作方式，不能作为临床规则已完成的证据。Sue 指定继续使用当前 feature/sue-1；需求基线先提交并 push，后续阶段保留独立 commit。

现有计划将 Phase 4 标为进行中、来源规则列入 Phase 5。本 feature 补充这两部分，并增加诊断代码和语音需求。计划中的 CPT 暂缓决定已被 Sue 本次“先核对四个代码”的要求细化，但尚未授权启用代码推荐。旧交接副本是历史资料，不是活动 App；其中“尚无新增患者表单”的描述已经落后于当前代码。

## 2. 现有资料、实现与缺口

| 范围 | 实际证据 | 已有内容 | 缺口／本轮核实边界 |
|---|---|---|---|
| 临床输入与保存 | src/app/actions.ts；patients/new/page.tsx；patients/[id]/new-visit/page.tsx | 初诊、复诊、主诉、客观发现、评估、计划、评分、部分 ROM 输入；草稿新增版本 | 缺少独立的治疗分段、实际接触时间、反应、功能目标和 progress review 流程；复诊表单没有 ROM 输入控件 |
| 英文草稿 | actions.ts 的 englishDraft | 英文标题拼接输入文字 | 不翻译中文、不进行语音转写；中文会原样进入草稿，不能称为已实现英文转换 |
| 历史与定稿 | prisma/schema.prisma、临床迁移、patients/[id]/page.tsx | Encounter 与 Visit 版本分离；定稿、打印；数据库保护触发器 | re_evaluation/addendum 有类型或关系，不等于有完整操作界面；无已核实缺项审核门槛；并发、旧版本定稿与字段一致性需后续专项验证 |
| 保险页面 | src/app/payers/page.tsx、payers/[payer]/page.tsx | payer 列表和待来源占位说明 | 无规则实体、来源附件、plan 匹配、生效期、审核记录或规则编辑 |
| CPT | Visit.cptCodes JSON；prisma/import-demo.mjs | 空数组默认值；导入脚本含标为 sourceOnly 的历史示例代码 | 无代码目录、选择表单、有效版本、时间核对和审核建议；脚本中的 97026、GP 等不代表 Sue 已确认使用 |
| ICD-10-CM | schema、表单、actions、workspace | 样例展示逻辑不等于诊断目录 | 无可搜索目录、版本日期、诊断确认或结构化选择存储 |
| 虚构样例 | prisma/seed.mjs | 可生成 4 个虚构患者、12 份简单初诊/复诊草稿，覆盖评分改善、不变、加重、缺失 | 是 seed 定义，不是本轮数据库数量验证；缺少临床治疗、诊断、时间和已核实政策样例 |
| 历史病例样例 | 交接目录的对话交接记录.md、开发交接与已知限制.md；import-demo.mjs | 记录曾有约 20 份样例及本地脱敏样例流程 | 项目文件盘点未发现这些 Word/PDF 或 storage/demo/sample.json；原文件不随包提供，未读取私人数据库或项目外患者文件 |
| 样例画面 | src/app/page.tsx、workspace.tsx | 有原文、复制与样例专属说明 | 当前 page.tsx 传入 sampleTables=[]；样例提示包含固定文本，不是动态临床校验器 |
| 测试 | tests/access*.test.mjs；prisma/verify.mjs | 认证测试与数据库保护检查脚本 | 缺少本 feature 的翻译保真、时间/CPT、plan 匹配、ICD 版本和端到端测试；本轮未运行 App 测试 |

项目内未发现可用的 payer 原始保单、授权文件、拒赔信或政策 PDF。旧文档的“连续相同病历可能拒付”等描述属于需求背景，不能作为通用拒付规则。真实病例不作为可提交的测试 fixture；需要时由 Sue 指定本地位置，先确认去身份处理方式。

## 3. 保险资料来源台账

本节官方网页核查日期均为 2026-09-24。只核读与需求有关的段落，未宣称通读所有研究参考文献。链接内容可能更新；实施前应记录版本、获取日期、页码/章节和文件指纹。没有把抓取日期冒充生效日期。

| 来源 ID | 文件／官方链接及定位 | 日期与范围 | 本轮状态 |
|---|---|---|---|
| S-A | [Aetna CPB 0135 — Acupuncture and Dry Needling](https://www.aetna.com/cpb/medical/data/100_199/0135.html)，Appendix / Documentation Requirements、Policy Limitations、CPT 表 | 页面原始生效 1996-07-19；最近审核 2026-03-25；不能据此断言每条新条文从 1996 年生效。适用于引用该 CPB 的 plan，福利条款仍需核对 | 已核读相关原文；具体 plan 适用性待 Sue 核实 |
| S-C | [Cigna CPG 024 — Acupuncture](https://static.cigna.com/assets/chcp/pdf/coveragePolicies/medical/cpg024_acupuncture.pdf)，第 1–3 页 | 生效 2026-04-15；Cigna／ASH 标准福利政策，具体合同可能不同 | 已核读相关原文；Sue 的 plan 与 ASH 委托范围待核实 |
| S-H | [ASH CPG 264 Revision 20 – S](https://www.ashlink.com/ASH/WCMGenerated/CPG_264_Revision_20_-_S-_Effective_010126_tcm17-149864.pdf)，封面与目录 | 生效 2026-01-01；修订 2025-10-16；Product: Specialty | 已确认文件身份；临床条款逐条提取未完成，不能与 CPG 024 混同 |
| S-U | [UHC Acupuncture Policy, Professional](https://www.uhcprovider.com/content/dam/provider/docs/public/policies/comm-reimbursement/COMM-Acupuncture-Policy.pdf)，第 2–3 页 | 2026R6006A；历史记载 2026-07-01 版本审核；原始实施 2017-12-01。本次未确认独立的新生效日期。Commercial and Individual Exchange 报销政策 | 已核读计时及编码相关原文；不是完整临床病历政策，不能推广至 Medicare Advantage、Medicaid 或 UMR |
| S-B | [BCBS Massachusetts Policy 178 — Complementary Medicine](https://www.bluecrossma.org/medical-policies/sites/g/files/csphws2091/files/acquiadam-assets/178%20Complementary%20Medicine%20prn.pdf) | 仅为 Massachusetts 候选来源；生效期未知；Sue 的 BCBS 公司、州及产品尚未知 | 搜索定位到文件，但正文获取失败；未核实任何条文，不采用搜索摘要生成规则 |
| S-I | [CDC ICD-10-CM Files](https://www.cdc.gov/nchs/icd/icd-10-cm/files.html)，FY26/FY27 release 区域 | FY26 2026-04-01 更新用于 2026-04-01 至 09-30 服务；FY27 用于 2026-10-01 至 2027-09-30 | 已核读发布与使用日期；尚未下载、导入或校验全量目录 |

## 4. 保险规则候选清单（全部未启用）

“来源原文已核读”与“适用 Sue 的具体 plan 已确认”是两个独立状态。下列分配到初诊／复诊／进展复核，是拟议的 App 展示组织方式，不声称政策规定必须使用这些表单名称。所有条目当前均为**待 Sue 核实**，不能触发必填、拒付判断或自动编码。

| ID | payer／阶段 | 候选要求或明确缺口 | 来源及生效信息 | 适用范围／核实状态 |
|---|---|---|---|---|
| A-01 | Aetna／initial | 书面计划记录诊断、起病或加重日期、评估、目标、预计达成时间、频次疗程、治疗方案及签署 | S-A Appendix；日期见 S-A | 引用 CPB 0135 的计划；原文已读，待 Sue 核实 |
| A-02 | Aetna／follow-up | 随病情变化更新计划，记录实际治疗结果与目标进展 | S-A Appendix；日期见 S-A | 同上；待 Sue 核实 |
| A-03 | Aetna／progress review | 定期复评并记录目标进展；政策正文另提及四周无临床获益时重评计划，不能转成所有患者固定四周拒付 | S-A Policy / Appendix；日期见 S-A | 同上；待 Sue 核实，提醒阈值不启用 |
| B-01 | BCBS／initial | 具体初评、计划及签署要求未知 | S-B 候选文件获取失败；生效期未知 | 公司／州／plan 未明；待 Sue 核实 |
| B-02 | BCBS／follow-up | 每次诊疗记录与授权要求未知 | S-B；生效期未知 | 不将某一州公司规则扩展到全部 BCBS；待 Sue 核实 |
| B-03 | BCBS／progress review | 复评频次、进展量表、延长授权要求未知 | S-B；生效期未知 | 同上；待 Sue 核实 |
| C-01 | Cigna／ASH／initial | 个体化计划关联临床发现，包含功能目标、频次疗程及预计结束时间 | S-C 第 2 页；2026-04-15 | 具针灸福利且适用该政策的 plan；原文已读，待 Sue 核实 |
| C-02 | Cigna／ASH／follow-up | 记录支持诊断与计划的发现、目标进展和实际功能变化 | S-C 第 2 页；2026-04-15 | 同上；待 Sue 核实，不要求编造量表分数 |
| C-03 | Cigna／ASH／progress review | 周期复评目标与功能结果，未改善或退步时评估调整；使用量表时需结合其适用性解释 | S-C 第 2 页；2026-04-15 | 同上；未确认统一复评间隔，待 Sue 核实 |
| H-01 | ASH／所有阶段 | 单独 ASH Specialty 指南与 Cigna 委托要求的对应关系尚未厘清 | S-H；2026-01-01 | 不能仅凭 Cigna 标签默认由 ASH 管理；待 Sue 核实 |
| U-01 | UHC／initial | 已读报销政策不能证明完整初诊病历要求 | S-U；版本审核 2026-07-01，条文生效待核实 | Commercial / Individual Exchange；临床来源需补充，待 Sue 核实 |
| U-02 | UHC／follow-up／实际治疗 | 编码计时看实际面对面接触，不能把无人接触的留针时长等同计费接触时间 | S-U 第 2–3 页；日期同上 | 同上；原文已读，待 Sue 核实 |
| U-03 | UHC／progress review | 复评周期、继续治疗标准及 plan 特有要求未确定 | S-U 非完整临床政策；生效待核实 | 需对应产品的临床政策，待 Sue 核实 |

这不是完整政策库；覆盖条件、次数上限、预授权、modifier、单位阈值和拒赔原因均需独立来源记录。单次拒赔只能作为该 claim 的观察，不能升级为所有 plan 的规则。

拟议规则记录字段：ID、payer、承保公司、plan/产品、州、network/委托管理方、visit 类型、原文定位、中文解释、来源文件/URL/版本、获取日期、生效与失效日期、适用条件、原文核读状态、Sue 的适用性确认及日期、冲突说明、启用状态。缺少适用范围或日期时仅显示资料提示。冲突来源并列展示，不自动择一。

## 5. 临床输入与英文病历

| 需求 ID | 拟议行为 | 验收标准 |
|---|---|---|
| CL-01 | 支持中文、英文、混合文字及语音转写后的输入；保留原始文本、校对版本与英文草稿 | 语音先转写供 Sue 改错；否定词、侧别、数字和单位逐项核对。翻译失败保留输入，不声称已生成英文 |
| CL-02 | 区分患者自述、Sue 观察、实际测量、历史资料及本次未复测 | 不将“患者说”改成“检查证实”；历史发现不会自动成为本次发现 |
| CL-03 | 保存主诉、客观发现、功能变化、实际治疗、实际时间、治疗反应和后续计划 | 缺项在审核面板列出；允许保存未完成草稿；未核实保险条目不强制阻断 |
| CL-04 | initial 建立基线与目标；follow-up 记录本次变化；progress review 对比指定基线与期间记录 | 改善、不变、加重、未知都能如实记录；不强迫每次写“改善”；不自动生成复评周期 |
| CL-05 | 分段记录治疗方式、部位/穴位、是否电刺激、实际接触分钟、留针时间、再次进针及其时间；区分总就诊时长 | 重叠时间不重复计入；不能把预约长度当实际治疗；缺失时间只提示补充，不推算 |
| CL-06 | 原文与英文并排审核；修改输入或编码后标记旧预览失效 | 保存/复制/打印的是已审核的相同版本；定稿后更正保留原件及原因，版本不增加实际诊疗次数 |

功能变化验收样例（虚构）：输入“以前弯不下腰，现在能碰到膝盖”。若 Sue 确认是观察结果，可写 “Previously unable to bend forward; now able to reach the knees.” 若为患者描述，要加 “The patient reports …”。不知道信息来源则提示 Sue 确认。不得新增 ROM 角度、疼痛下降幅度、正常检查或治疗因果；没有测量就不填写角度。

语音与翻译的本地/外部处理方式尚未选定。不得假设浏览器听写一定离线。实施前说明处理者、发送字段、音频是否留存、费用和所需数据安排，再由 Sue 确认；本 feature 需求批准本身不授权发送真实患者内容。无可用服务时保留手动文字流程并清楚标记语音未启用，不能用占位按钮冒充完成。

## 6. Billing codes

本轮依据 S-A 的 CPT 表核对以下中文释义，非逐字复制官方描述。目录启用前还需核对采用年度的正式 CPT 来源及使用授权、Sue 的实际工作方式和适用 payer 计时规则。

| 需求 ID／代码 | 初步定义 | 必须有的事实依据 | 当前状态 |
|---|---|---|---|
| CPT-01／97810 | 无电刺激针灸的首个 15 分钟个人一对一接触段 | 针灸、无电刺激、实际接触时间 | S-A 代码表已核读；待 Sue 审核启用 |
| CPT-02／97811 | 无电刺激的追加 15 分钟个人接触段，涉及再次进针，作为附加代码 | 追加接触及再次进针事实、对应主要服务 | 同上 |
| CPT-03／97813 | 有电刺激针灸的首个 15 分钟个人接触段 | 针灸、电刺激及实际接触时间 | 同上 |
| CPT-04／97814 | 有电刺激的追加 15 分钟个人接触段，涉及再次进针，作为附加代码 | 电刺激、追加接触、再次进针、对应主要服务 | 同上 |

这里的“首个”是服务计时段，不是“患者第一次来诊”；follow-up 也不能只因是复诊就选择附加代码。15 分钟描述不等于已决定进位、最小分钟数、单位上限或混合电刺激组合；这些应另有版本化来源，不能把一种付款方规则全局套用。

CPT-05：App 只基于确认的治疗事实给候选项，显示理由、缺项、来源和适用状态；Sue 主动选择代码及单位。时间或电刺激状态不明时不自动选码。修改治疗记录后重新审核选码。不得因某代码“更容易报销”而改写治疗内容。

CPT-06：其他常用代码仅由 Sue 提名并确认后加入。历史导入脚本中的代码、单位或 modifier 不能自动进入常用清单。保留未核实来源的历史记录，但不使其成为推荐规则。

## 7. Diagnosis codes

DX-01：采用 ICD-10-CM 官方发布文件建立可搜索目录，显示代码、官方英文描述、发布版本、生效/失效日期和来源；按就诊日期匹配版本。中文解释可辅助检索，但与官方描述区分。

DX-02：提供代码或关键词浏览；只有 Sue 确认诊断后，才基于该诊断给候选代码。缺少侧别或必要细分时请求补充；不从症状推定疾病，不为了覆盖而替换诊断。Sue 可以明确确认症状类诊断，但程序不能代作决定。

DX-03：检查目录中的完整可报告代码、必要附加字符及相关编码说明；未知或失效代码提示核对，不静默替换。选择结果保存代码、描述和版本快照；升级目录不改写旧病历。

DX-04：S-I 的 2026-04-01 与 2026-10-01 版本交界必须有测试；“最新发布”不等于适用于所有就诊日期。全量文件尚未导入，不能以手工列出几个代码冒充完整可搜索目录。

## 8. 拟议页面与数据变化

沿用现有墨绿色/米白设计。保险页增加来源/适用范围/审核状态，患者病历页增加 visit 类型、临床分段、缺项提示和双语审核，编码区域分别展示 CPT 与诊断候选。本需求经确认后按 tracker 的阶段顺序扩展界面。

数据需要支持：PolicySource、RuleRevision、PlanApplicability、临床原始/确认字段、TreatmentSegment、版本化 CPT/ICD 目录、人工选码和审核记录。具体 schema 待需求批准后设计，保留现有 Encounter/Visit 历史和保护触发器；使用迁移而非 db push 重建。共享密码不能证明具体操作者身份，审核记录应诚实反映此限制，不能伪造独立人员签名。

## 9. Sue 审核项与交付边界

四部分整体方向已经 Sue 确认；阶段画面和病历仍须逐阶段验收。开始对应步骤前还需：BCBS 公司/州/产品及其他 payer 的实际 plan；保险资料与样例的本地位置（如有）；常用代码；语音和翻译的数据处理方案。现在不必一次解决所有业务细节，未知项继续标为待 Sue 核实。

本 feature 不包含直接提交 claim、保证付款、自动选择诊断、部署或连接 Square。真实身份信息、完整病历、录音、私人附件、数据库和凭据不得进入 Git；演示、截图与测试只用虚构数据。需求基线 commit/push 和后续独立阶段 commit 已获授权；后续 push 按授权范围执行，PR 在功能准备好时创建，不自动 merge。
