import { unified } from 'unified';
import remarkParse from 'remark-parse';

const processor = unified().use(remarkParse);

const text = "1. ***asdf***, ___asdf___\n2. ---\n3. # H1\n4. >> blockquote nested";
const ast = processor.parse(text);
console.log(JSON.stringify(ast, null, 2));
