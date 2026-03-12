import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';

const text = `
| 제목1 | 제목2 | 제목3 | 12341234 |
| :--- | :---: | ---: | - |
| 내용1 | 매우 긴      내용2 | 짧은 내용3 |  |
| 내용4 | 내용5 | 내용6 ||
`;
const processor = unified().use(remarkParse).use(remarkGfm);
const ast = processor.parse(text);
const row1 = ast.children[0].children[2];
const row2 = ast.children[0].children[3];
const cell1 = row1.children[3];
const cell2 = row2.children[3];

console.log("Cell 1 text:", JSON.stringify(text.substring(cell1.position.start.offset, cell1.position.end.offset)));
console.log("Cell 2 text:", JSON.stringify(text.substring(cell2.position.start.offset, cell2.position.end.offset)));
