export function getDataViewFromArray(arr, isBigIntArr) {
	let byteSize = isBigIntArr.reduce((a, b) => { return b ? 8 + a : 4 + a; }, 0);
	let buffer = new ArrayBuffer(byteSize);
	let dataView = new DataView(buffer);

	let arrIndex = 0;
	arr.forEach((val, index) => {
		const isBigInt = isBigIntArr[index];
		isBigInt ? 
			dataView.setFloat64(arrIndex, val, true) : dataView.setUint32(arrIndex, val, true);

		arrIndex += isBigInt ? 8 : 4;
	});

	return dataView;
}