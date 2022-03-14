import { ValueParts } from '@beak/common/types/beak-project';

export function detectRelevantCopiedValueParts(valueParts: ValueParts) {
	const sel = window.getSelection()!;

	let startNode = sel.anchorNode!;
	let startOffset = sel.anchorOffset;
	let endNode = sel.focusNode!;
	let endOffset = sel.focusOffset;

	const position = startNode.compareDocumentPosition(endNode);

	// Reverse things if the selection is reversed
	if (!position && sel.anchorOffset > sel.focusOffset || position === Node.DOCUMENT_POSITION_PRECEDING) {
		const tempNode = startNode;
		const tempOffset = startOffset;

		startNode = endNode;
		endNode = tempNode;
		startOffset = endOffset;
		endOffset = tempOffset;
	}

	const root = findParentNode(startNode, 'ARTICLE');
	const rootChildren = root.childNodes;

	let startIndex = -1;
	let endIndex = -1;

	// Get the value part index's of the nodes
	for (const [i, n] of rootChildren.entries()) {
		if (n === startNode) {
			startIndex = i;
		} else if (n.nodeName === 'SPAN') {
			const textNode = findChildNode(n, '#text');

			if (startNode === textNode)
				startIndex = i;
		}

		if (n === endNode) {
			endIndex = i;
		} else if (n.nodeName === 'SPAN') {
			const textNode = findChildNode(n, '#text');

			if (endNode === textNode)
				endIndex = i;
		}
	}

	// If something is wrong, do nothing
	if (startIndex === -1 || endIndex === -1)
		return;

	const relevantParts = valueParts.slice(startIndex, endIndex + 1);
	const samePart = startIndex === endIndex;

	if (samePart) {
		relevantParts[0] = (relevantParts[0] as string).substring(startOffset, endOffset);
	} else {
		const endPart = relevantParts[relevantParts.length - 1];

		relevantParts[0] = (relevantParts[0] as string).substring(startOffset);
		relevantParts[relevantParts.length - 1] = (endPart as string).substring(0, endOffset);
	}

	return relevantParts;
}

function findParentNode(node: Node, nodeName: string) {
	let currentNode = node;

	// eslint-disable-next-line no-constant-condition
	while (true) {
		if (currentNode.nodeName === nodeName)
			return currentNode;

		currentNode = currentNode.parentNode!;
	}
}

function findChildNode(node: Node, nodeName: string) {
	let currentNode = node;

	// eslint-disable-next-line no-constant-condition
	while (true) {
		if (currentNode.nodeName === nodeName)
			return currentNode;

		currentNode = currentNode.childNodes[0]!;
	}
}
