/**
 * Formats a date string based on a given mask.
 *
 * @param mask - date mask like 'YYYY-MM-DD', 'YYYY-MM', 'YYYY', 'MM-DD', 'MM-DD-YYYY' and others
 * @param date - date to format
 * @returns formatted date string
 */
export function formatDateByMask(mask: DateFormatMask, date: Date = new Date()): string {
	const year = date.getFullYear();
	const month = (date.getMonth() + 1).toString().padStart(2, '0');
	const day = date.getDate().toString().padStart(2, '0');
	const hours = date.getHours().toString().padStart(2, '0');
	const minutes = date.getMinutes().toString().padStart(2, '0');
	const seconds = date.getSeconds().toString().padStart(2, '0');

	return mask.replace('YYYY', year.toString())
		.replace('MM', month)
		.replace('DD', day)
		.replace('HH', hours)
		.replace('mm', minutes)
		.replace('ss', seconds);
}

export type DateFormatMask =
	| 'YYYY-MM-DD'
	| 'YYYY-MM'
	| 'YYYY'
	| 'MM-DD'
	| 'MM-DD-YYYY'
	| 'HH-mm-ss'
	| 'HH:mm:ss'
	| 'HH:mm'
	| 'HH-mm'
	| 'YYYY-MM-DD_HH:mm:ss'
	| 'YYYY-MM-DD_HH:mm'
	| 'MM-DD-YYYY_HH:mm:ss'
	| 'MM-DD-YYYY_HH:mm'
	| 'YYYY-MM-DD_HH-mm-ss'
	| 'YYYY-MM-DD_HH-mm'
	| 'MM-DD-YYYY_HH-mm-ss'
	| 'MM-DD-YYYY_HH-mm';


export function getDate(date: Date = new Date()): string {
	const dateOptions = {
		weekday: "long",
		year: "numeric",
		month: "long",
		day: "numeric",
	} as const;

	return date.toLocaleDateString(undefined, dateOptions);
}
