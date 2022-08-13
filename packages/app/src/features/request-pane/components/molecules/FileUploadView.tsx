import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import Button from '@beak/app/components/atoms/Button';
import { ipcFsService } from '@beak/app/lib/ipc';
import { requestBodyFileChanged } from '@beak/app/store/project/actions';
import { PreviewReferencedFileRes } from '@beak/common/ipc/fs';
import { ValidRequestNode } from '@getbeak/types/nodes';
import mime from 'mime-types';
import { RequestBodyFileForm } from 'packages/types/request';
import prettyBytes from 'pretty-bytes';
import styled from 'styled-components';

export interface FileUploadViewProps {
	node: ValidRequestNode;
}

const FileUploadView: React.FC<FileUploadViewProps> = props => {
	const { node } = props;
	const dispatch = useDispatch();
	const body = node.info.body as RequestBodyFileForm;
	const [preview, setPreview] = useState<PreviewReferencedFileRes>();

	useEffect(() => {
		openPreview(body.payload.fileReferenceId);
	}, [body.payload.fileReferenceId]);

	async function openPreview(fileReferenceId: string | undefined) {
		if (!fileReferenceId)
			return;

		const preview = await ipcFsService.previewReferencedFile(fileReferenceId);

		if (!preview) {
			setPreview(void 0);
			dispatch(requestBodyFileChanged({
				requestId: node.id,
				fileReferenceId: void 0,
				contentType: void 0,
			}));

			return;
		}

		// TODO(afr): Fix content type fallback
		setPreview(preview);
		dispatch(requestBodyFileChanged({
			requestId: node.id,
			fileReferenceId,
			contentType: mime.lookup(preview.fileExtension) || 'x',
		}));
	}

	async function openFile() {
		const response = await ipcFsService.openReferenceFile();

		if (!response)
			return;

		await openPreview(response.fileReferenceId);
	}

	return (
		<Container>
			<FileBlob onClick={openFile}>
				{!preview && 'No file selected...'}
				{preview && (
					<React.Fragment>
						<FileName>{preview.fileName}</FileName>
						<FileSize>{prettyBytes(preview.fileSize)}</FileSize>
					</React.Fragment>
				)}
			</FileBlob>
			<Button
				size={'sm'}
				onClick={openFile}
			>
				{'Pick file'}
			</Button>
		</Container>
	);
};

const Container = styled.div`
	padding: 20px 0;
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: 10px;
`;

const FileBlob = styled.div`
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	cursor: pointer;
	gap: 3px;
	width: 200px;
	height: 110px;
	border-radius: 8px;
	border: 1px solid ${p => p.theme.ui.surfaceBorderSeparator};
	background: ${p => p.theme.ui.secondarySurface};
	color: ${p => p.theme.ui.textMinor};
	font-size: 12px;
`;

const FileName = styled.div``;
const FileSize = styled.div``;

export default FileUploadView;
