import { formatDateByMask, type DateFormatMask } from "src/utils/dates";
export async function saveFile(
	directory: string,
	arrayBuffer: ArrayBuffer,
	fileFormat: string = '',
	prefix: string = '',
	dateMask: DateFormatMask = 'YYYY-MM-DD_HH-mm',
) {
	await createDirectoryIfNeed(directory);

	const fileName = `${prefix}${formatDateByMask(dateMask)}.${fileFormat}`;
	const file = await this.app.vault.createBinary(`${directory}/${fileName}`, arrayBuffer);

	return file;
}

export async function createDirectoryIfNeed(path: string) {
	const directory = this.app.vault.getAbstractFileByPath(path);
	if (!directory) {
		await this.app.vault.createFolder(path);
	}
}
