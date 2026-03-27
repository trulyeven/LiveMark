"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const MarkdownParser_1 = require("../../src/MarkdownParser");
const parser = new MarkdownParser_1.MarkdownParser();
const text = "1. ***asdf***, ___asdf___\n2. ---\n3. # H1\n4. >> blockquote nested";
const ranges = parser.parse(text);
console.log(JSON.stringify(ranges, null, 2));
//# sourceMappingURL=test_parser.js.map