import { ProjectFile } from '@beak/common/types/beak-project';

import { readJsonAndValidate } from '../fs';
import { projectSchema } from './schemas';

export async function readProjectFile() {
	const { file } = await readJsonAndValidate<ProjectFile>('project.json', projectSchema);

	if (file.version !== '0.2.0')
		throw new Error('Unsupported project version');

	return file;
}
