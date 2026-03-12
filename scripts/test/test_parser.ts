import { MarkdownParser } from '../../src/MarkdownParser';

const parser = new MarkdownParser();
const text = "1. ***asdf***, ___asdf___\n2. ---\n3. # H1\n4. >> blockquote nested";
const ranges = parser.parse(text);

console.log(JSON.stringify(ranges, null, 2));
