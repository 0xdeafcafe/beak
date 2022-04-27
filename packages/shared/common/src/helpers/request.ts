import { RequestBody, RequestBodyType } from '../types/beak-project';

const bodyContentTypeMap: Record<RequestBodyType, string> = {
	json: 'application/json',
	text: 'text/plain',
	url_encoded_form: 'application/x-www-form-urlencoded',
};

export function requestBodyContentType(body: RequestBody) {
	return bodyContentTypeMap[body.type];
}
