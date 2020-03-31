const name = 'KDrive';
const disableExternal = false;
const baseURL = '';
const signup = false;
const version = '2';
const logoURL = `/img/drive_logo.svg`;
const minAutoComplete = 2;
const noAuth = false;
const loginPage = false;
const folderContentType = "application/vnd.drive.folder";
const mediaTypes = ['image', 'video', 'audio', 'blob'];
const documentTypes = [
	'application/pdf',
	'text',
	"application/msword",
	'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
	'application/vnd.ms-excel',
	'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
	'application/vnd.ms-powerpoint',
	'application/vnd.openxmlformats-officedocument.presentationml.presentation',
	'application/rtf',
	'application/vnd.oasis.opendocument.text',
	'application/vnd.oasis.opendocument.presentation',
];
const config = {
	apmServerUrl: '',
	authUrl: '',
	environment: '',
	supportLink: '',
	approvalServiceUrl: '',
	externalShareName: 'שיתוף חיצוני',
	myExternalSharesName: 'השיתופים החיצוניים שלי',
	externalExclusiveUnit: 'יחידת ביג מאם',
	enableExternalShare: false,
	vipServiceUrl: 'localhost:8094',
};

const allowedFileTypes = ['png', 'xlsx', 'docx', 'jpg', 'pptx', 'txt', 'jpeg', 'mp4', 'mpg', 'mpeg', 'bmp', 'gif', 'wav', 'wave', 'pdf'];

export const debounceTime = 200;

export const Roles = {
	owner: "OWNER",
	write: "WRITE",
	read: "READ"
};

export function DownloadRole(role) {
	return Object.values(Roles).findIndex(r => r === role) >= 0;
}

export function PreviewRole(role) {
	return Object.values(Roles).findIndex(r => r === role) >= 0;
}

export function InfoRole(role) {
	return Object.values(Roles).findIndex(r => r === role) >= 0;
}

export function UploadRole(role) {
	return role == Roles.write || role == Roles.owner;
}

export function DeleteRole(role) {
	return role == Roles.write || role == Roles.owner || role == Roles.read ;
}

export function ShareRole(role) {
	return role == Roles.write || role == Roles.owner;
}

export function RenameRole(role) {
	return role == Roles.write || role == Roles.owner;
}

export function MoveRole(role) {
	return role == Roles.write || role == Roles.owner;
}

export function checkMimeType(type) {
	for (let k = 0; k < mediaTypes.length; k++) {
		if (type.startsWith(mediaTypes[k])) {
			return true;
		}
	}

	return false;
}

export function checkDocumentPreview(type) {
	for (let k = 0; k < documentTypes.length; k++) {
		if (type.startsWith(documentTypes[k])) {
			return true;
		}
	}

	return false;
}

export async function fetchConfig() {
	const res = await fetch(`${baseURL}/api/config`);
	const conf = await res.json();
	config.apmServerUrl = conf.apmServerUrl;
	config.authUrl = conf.authUrl;
	config.environment = conf.environment;
	config.supportLink = conf.supportLink;
	config.approvalServiceUrl = conf.approvalServiceUrl || config.supportLink;
	config.externalShareName = conf.externalShareName;
	config.myExternalSharesName = conf.myExternalSharesName;
	config.externalExclusiveUnit = conf.externalExclusiveUnit;
	config.enableExternalShare = conf.enableExternalShare === "true";
	config.vipServiceUrl = conf.vipServiceUrl;
}

export {
	allowedFileTypes,
	name,
	disableExternal,
	baseURL,
	minAutoComplete,
	logoURL,
	signup,
	version,
	noAuth,
	loginPage,
	folderContentType,
	config
}
