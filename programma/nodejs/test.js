console.log("JavaScript / Node.js-test");
console.log("-".repeat(30));
console.log(`Node-versie: ${process.version}`);
console.log(`Systeem: ${process.platform} ${process.arch}`);

// Simpele rekentest
let resultaat = 0;
for (let i = 1; i <= 10; i++) resultaat += i;

if (resultaat !== 55) {
    throw new Error("Rekentest mislukt");
}
console.log(`Rekentest (som 1 t/m 10 = ${resultaat}): OK`);

console.log("-".repeat(30));
console.log("Alle Node.js-tests geslaagd ✔");