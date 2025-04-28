import { App } from 'obsidian';
import { formatDateByMask, type DateFormatMask } from "src/utils/dates";

export async function saveFile(
	app: App,
	directory: string,
	arrayBuffer: ArrayBuffer,
	fileFormat: string = '',
	prefix: string = '',
	dateMask: DateFormatMask = 'YYYY-MM-DD_HH-mm',
) {
	await createDirectoryIfNeed(app, directory);

	const fileName = `${prefix}${formatDateByMask(dateMask)}.${fileFormat}`;
	const file = await app.vault.createBinary(`${directory}/${fileName}`, arrayBuffer);

	return file;
}

export async function createDirectoryIfNeed(app: App, path: string) {
	const directory = app.vault.getAbstractFileByPath(path);
	if (!directory) {
		await app.vault.createFolder(path);
	}
}
