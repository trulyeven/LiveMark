const segmenter = new Intl.Segmenter(undefined, { granularity: 'grapheme' });
console.log('1\uFE0F\u20E3', /\p{Emoji}/u.test('1\uFE0F\u20E3'), /\p{Emoji_Presentation}/u.test('1\uFE0F\u20E3'));
