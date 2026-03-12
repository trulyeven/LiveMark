import { unified } from 'unified';
import remarkParse from 'remark-parse';
const processor = unified().use(remarkParse);
const text = "1. ***asdf***, ___asdf___\n2. ---\n3. # H1\n4. >> blockquote nested";
console.log(JSON.stringify(processor.parse(text), null, 2));
