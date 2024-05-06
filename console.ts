let time0 = new Date().getTime();
console.log('===============');
let count = 0;
for(let i = 0; i < 10000 * 100; i++) {
	// let positions = [];
	// for(let j = 0; j < 16; j++) {
	// 	positions.push(j);
	// }
	let positions = new ArrayBuffer(16);
	// let positions = [0, 0, 0, 0, 1, 1, 1, 1, 2, 2, 2, 2, 3, 3, 3, 3];
	for(let j = 0; j < 16; j++) {
		positions[j] = j;
		// positions.push(j);
	}
	count++;
}
let time1 = new Date().getTime();
console.log(time1 - time0);