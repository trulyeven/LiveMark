import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';

const text = `
| 제목1 | 제목2 | 제목3 | 12341234 |
| :--- | :---: | ---: | - |
| 내용1 | 매우 긴      내용2 | 짧은 내용3 | \`ㅁㄴㅇㄹ\` |
| 내용4 | 내용5 | 내용6 | **Bold** asdf 123 |
| 1234 | 4567 | 7890 | 1011 |
`;
const processor = unified().use(remarkParse).use(remarkGfm);
const ast = processor.parse(text);
console.log(JSON.stringify(ast.children[0].children[1], null, 2));
