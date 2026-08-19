// dsh-cinematography — 电影运镜与镜头语言（DeepSeek Harness）。纯 Node 知识库。
import { defineTool } from "@deepseek-ai/dsh-tools";

const name = "电影运镜";
const inject = ["tools"];

const MOVEMENTS = [
  { id: "pan", name: "摇镜头（Pan）", en: "Pan", desc: "机位固定，水平左右转动。用于展示空间、跟随横向运动、揭示信息。", examples: ["横移扫视风景", "跟随人物走过", "从一个主体摇到另一个"] },
  { id: "tilt", name: "俯仰镜头（Tilt）", en: "Tilt", desc: "机位固定，垂直上下转动。用于展示高度、强调主体、营造仰视/俯视感。", examples: ["仰拍高楼", "俯拍全景", "从脚到头扫视人物"] },
  { id: "dolly", name: "推拉镜头（Dolly）", en: "Dolly/Trucking", desc: "机位前后移动（推近/拉远），改变与主体距离。推近聚焦情绪，拉远揭示环境。", examples: ["缓慢推近面部特写", "拉远揭示孤独环境", "跟随角色前进"] },
  { id: "zoom", name: "变焦（Zoom）", en: "Zoom", desc: "机位不动，焦距变化放大/缩小画面。与推拉不同，变焦压缩空间、无透视变化。", examples: ["快速变焦制造冲击", "缓慢变焦强调", "变焦压缩前后景"] },
  { id: "tracking", name: "跟镜头（Tracking）", en: "Tracking Shot", desc: "机位随主体一起移动，保持相对位置。营造跟随感、沉浸感。", examples: ["跟拍人物行走", "侧面跟拍奔跑", "环绕跟拍对话"] },
  { id: "crane", name: "升降镜头（Crane）", en: "Crane/Jib", desc: "机位垂直升降（或大幅空间移动）。用于大场面、揭示、从局部到全景。", examples: ["开场升起展现大场景", "从人群升到全景", "下降进入场景"] },
  { id: "handheld", name: "手持镜头（Handheld）", en: "Handheld", desc: "手持拍摄，画面晃动。营造真实、紧张、纪录片质感。", examples: ["追逐戏紧张感", "纪录片真实感", "主观视角"] },
  { id: "steadicam", name: "稳定器镜头（Steadicam）", en: "Steadicam/Gimbal", desc: "稳定器平滑跟拍，兼具移动的流畅与稳定。用于长镜头、复杂调度。", examples: ["一镜到底跟拍", "穿越空间长镜头", "环绕主体平滑移动"] },
  { id: "whip-pan", name: "甩镜头（Whip Pan）", en: "Whip Pan", desc: "快速甩动镜头造成模糊转场。用于快速转场、制造节奏与能量。", examples: ["快速切换场景", "制造紧张节奏", "风格化转场"] },
  { id: "pedestal", name: "升降机位（Pedestal）", en: "Pedestal", desc: "机位垂直上下移动（不改变俯仰角），用于跟随主体高度变化或揭示。", examples: ["跟随人物站起", "从桌面升到脸", "揭示高度差"] },
];

const SHOTS = [
  { id: "extreme-wide", name: "大远景", en: "Extreme Wide Shot", desc: "人物极小，环境为主。用于交代地点、营造孤独/渺小。" },
  { id: "wide", name: "远景", en: "Wide Shot", desc: "人物全身与环境，交代人物与环境关系。" },
  { id: "full", name: "全景", en: "Full Shot", desc: "人物全身入画，展示动作与姿态。" },
  { id: "medium", name: "中景", en: "Medium Shot", desc: "人物腰部以上，兼顾动作与表情，最常用。" },
  { id: "close-up", name: "特写", en: "Close-Up", desc: "面部/局部，强调情绪与细节。" },
  { id: "extreme-close", name: "大特写", en: "Extreme Close-Up", desc: "眼睛/嘴唇等极小局部，强化戏剧张力。" },
  { id: "over-shoulder", name: "过肩镜头", en: "Over-the-Shoulder", desc: "从一角色肩后拍另一角色，常用于对话。" },
  { id: "pov", name: "主观镜头", en: "POV Shot", desc: "以角色视角看世界，增强代入感。" },
];

async function apply(ctx, _config) {
  ctx.tools.register(defineTool({
    name: "list_camera_movements",
    description: "列出主流电影运镜手法（摇/俯仰/推拉/跟/升降/手持/稳定器/甩等，中文名 + 英文 + 用途）。用于分镜/视频创作时选运镜。",
    parameters: {},
    output: {
      schema: {
        type: "object", additionalProperties: false,
        properties: {
          count: { type: "integer", required: true },
          movements: {
            type: "array", required: true,
            items: { type: "object", additionalProperties: false, properties: { id: { type: "string", required: true }, name: { type: "string", required: true }, en: { type: "string", required: true }, desc: { type: "string", required: true } } },
          },
        },
      },
      render: (_a, v) => [{ type: "text", text: v.movements.map((m) => `- ${m.name}（${m.en}）：${m.desc}`).join("\n") }],
    },
    execute: async () => ({ count: MOVEMENTS.length, movements: MOVEMENTS.map(({ id, name, en, desc }) => ({ id, name, en, desc })) }),
  }));

  ctx.tools.register(defineTool({
    name: "get_camera_movement",
    description: "查询某运镜手法的详细说明与示例。`id` 传手法 id（如 dolly、tracking、handheld）或名称子串。",
    parameters: { id: { type: "string", required: true, description: "运镜 id 或名称子串。" } },
    output: {
      schema: {
        type: "object", additionalProperties: false,
        properties: {
          name: { type: "string", required: true }, en: { type: "string", required: true },
          desc: { type: "string", required: true }, examples: { type: "array", required: true, items: { type: "string" } },
        },
      },
      render: (_a, v) => [{ type: "text", text: `【${v.name}】${v.en}\n${v.desc}\n示例：\n${v.examples.map((e) => "  - " + e).join("\n")}` }],
    },
    execute: async (args) => {
      const q = String(args.id).toLowerCase();
      const m = MOVEMENTS.find((x) => x.id === q || x.name.includes(args.id) || x.en.toLowerCase().includes(q));
      if (!m) throw new Error(`未找到运镜：${args.id}`);
      return { name: m.name, en: m.en, desc: m.desc, examples: m.examples };
    },
  }));

  ctx.tools.register(defineTool({
    name: "list_shot_types",
    description: "列出常见景别（大远景/远景/全景/中景/特写/大特写/过肩/主观）及用途。",
    parameters: {},
    output: {
      schema: {
        type: "object", additionalProperties: false,
        properties: {
          shots: {
            type: "array", required: true,
            items: { type: "object", additionalProperties: false, properties: { id: { type: "string", required: true }, name: { type: "string", required: true }, en: { type: "string", required: true }, desc: { type: "string", required: true } } },
          },
        },
      },
      render: (_a, v) => [{ type: "text", text: v.shots.map((s) => `- ${s.name}（${s.en}）：${s.desc}`).join("\n") }],
    },
    execute: async () => ({ shots: SHOTS.map(({ id, name, en, desc }) => ({ id, name, en, desc })) }),
  }));
}

export { apply, inject, name };
