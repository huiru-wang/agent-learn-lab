export interface SlotDef {
  name: string;
  label: string;
  type: 'string' | 'date' | 'number' | 'enum';
  required: boolean;
}

export interface IntentDef {
  name: string;
  label: string;
  description: string;
  slots: SlotDef[];
}

export const predefinedIntents: IntentDef[] = [
  {
    name: 'book_flight',
    label: '订机票',
    description: '预订航班机票，包括出发地、目的地、日期等信息',
    slots: [
      { name: 'origin', label: '出发地', type: 'string', required: true },
      { name: 'destination', label: '目的地', type: 'string', required: true },
      { name: 'date', label: '出发日期', type: 'date', required: true },
      { name: 'passengers', label: '乘客人数', type: 'number', required: false },
      { name: 'cabin_class', label: '舱位等级', type: 'enum', required: false },
    ],
  },
  {
    name: 'book_hotel',
    label: '订酒店',
    description: '预订酒店住宿，包括城市、入住/退房日期等信息',
    slots: [
      { name: 'city', label: '城市', type: 'string', required: true },
      { name: 'check_in', label: '入住日期', type: 'date', required: true },
      { name: 'check_out', label: '退房日期', type: 'date', required: false },
      { name: 'guests', label: '住客人数', type: 'number', required: false },
      { name: 'room_type', label: '房型', type: 'enum', required: false },
    ],
  },
  {
    name: 'query_weather',
    label: '查天气',
    description: '查询指定城市和日期的天气情况',
    slots: [
      { name: 'city', label: '城市', type: 'string', required: true },
      { name: 'date', label: '日期', type: 'date', required: false },
    ],
  },
  {
    name: 'cancel_order',
    label: '取消订单',
    description: '取消已有的订单，包括订单号、取消原因等',
    slots: [
      { name: 'order_id', label: '订单号', type: 'string', required: true },
      { name: 'reason', label: '取消原因', type: 'string', required: false },
    ],
  },
  {
    name: 'play_music',
    label: '播放音乐',
    description: '播放指定的歌曲、歌手或风格的音乐',
    slots: [
      { name: 'song', label: '歌曲名', type: 'string', required: false },
      { name: 'artist', label: '歌手', type: 'string', required: false },
      { name: 'genre', label: '音乐风格', type: 'enum', required: false },
    ],
  },
];

// 快捷示例
export const quickExamples: Array<{ text: string; hint: string }> = [
  { text: '帮我订一张明天从北京到上海的机票', hint: '订机票' },
  { text: '查一下北京今天的天气怎么样', hint: '查天气' },
  { text: '我要取消订单号 A12345 的订单', hint: '取消订单' },
  { text: '帮我预订后天杭州的酒店，两个人住', hint: '订酒店' },
  { text: '播放一首周杰伦的歌', hint: '播放音乐' },
];
