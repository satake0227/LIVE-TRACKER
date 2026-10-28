const assert=require('node:assert/strict');const {parse}=require('../public-import');
const fixture=`＜2027年公演日程＞
6月27日（日）千葉・テストホール
開場16:00 / 開演17:00
7月3日（土）兵庫・サンプル会館
開場15:00 / 開演16:30`;
const result=parse(fixture,'テストツアー','https://example.com/live');assert.equal(result.length,2);assert.equal(result[0].date,'2027-06-27T17:00');assert.equal(result[1].date,'2027-07-03T16:30');assert.equal(result[0].venue,'千葉・テストホール');assert(!('paymentDue' in result[0]));assert(!('result' in result[0]));
assert.equal(parse('7月3日（土）兵庫・サンプル会館','公演','').length,0);
assert.equal(parse('2027.02.30\n会場：テストホール','公演','').length,0);
const dateOnly=parse('2027.02.27\n会場：テストホール','公演','');assert.equal(dateOnly[0].dateOnly,'2027-02-27');assert.equal(dateOnly[0].date,'');
assert.equal(parse('2027年6月27日（日）より、ツアーの開催が決定しました。','公演','').length,0);
assert.throws(()=>parse(fixture,'',''));assert.throws(()=>parse(fixture,'公演','javascript:alert(1)'));
assert.equal(parse('2027.02.27\n会場：<img src=x onerror=alert(1)>','公演','')[0].venue,'<img src=x onerror=alert(1)>');
assert.throws(()=>parse('a'.repeat(50001),'公演',''));
const fs=require('node:fs');const source=fs.readFileSync(require.resolve('../public-import'),'utf8');assert(!/\bfetch\s*\(|XMLHttpRequest|sendBeacon/.test(source));
console.log('PASS: explicit years, dates, opening vs show times, missing times, no guesses, input limits, no network calls or private fields');
