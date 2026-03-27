"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const MarkdownParser_1 = require("../../src/MarkdownParser");
const parser = new MarkdownParser_1.MarkdownParser();
const text = `
| 제목1 | 제목2 | 제목3 | 12341234 |
| :--- | :---: | ---: | - |
| 내용1 | 매우 긴      내용2 | 짧은 내용3 | \`ㅁㄴㅇㄹ\` |
| 내용4 | 내용5 | 내용6 | **Bold** asdf 123 |
| 1234 | 4567 | 7890 | 1011 |
`;
const ranges = parser.parse(text);
for (const r of ranges) {
    if (r.type === 'tableCell')
        continue;
    console.log(`[${text.substring(r.startPos, r.endPos)}] -> type=${r.type}, blockId=${r.blockId}, active=${r.activeRangeStart}-${r.activeRangeEnd}`);
}
//# sourceMappingURL=test_inline.js.map