"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const MarkdownParser_1 = require("../../src/MarkdownParser");
const parser = new MarkdownParser_1.MarkdownParser();
const text = `
| 제목1 | 제목2 | 제목3 | 12341234 |
| :--- | :---: | ---: | - |
| 내용1 | 매우 긴      내용2 | 짧은 내용3 |  |
| 내용4 | 내용5 | 내용6 ||
| 1234 | 4567 | 7890 | 1011 |
`;
const ranges = parser.parse(text);
const tables = ranges.filter(r => r.type === 'tableCell');
for (const t of tables) {
    console.log(`[${text.substring(t.startPos, t.endPos)}] -> diff=${t.metadata?.diff || 0}, empty=${t.metadata?.empty}, startPos=${t.startPos}`);
}
//# sourceMappingURL=test_table.js.map