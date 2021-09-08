import type { EditorProps } from '@monaco-editor/react';

export function createDefaultOptions(): EditorProps['options'] {
	return {
		automaticLayout: true,
		minimap: { enabled: false },
		fontFamily: '"Fira Code", Source Code Pro, Menlo, Monaco, "Courier New", monospace',
		fontSize: 10,
		scrollbar: {
			verticalScrollbarSize: 10,
			horizontalScrollbarSize: 10,
		},
	};
}
