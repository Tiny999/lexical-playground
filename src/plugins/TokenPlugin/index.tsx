import {
  TextNode,
  LexicalNode,
  $createTextNode,
  $getSelection,
  $isRangeSelection,
  $createPoint,
  COMMAND_PRIORITY_CRITICAL,
  KEY_BACKSPACE_COMMAND,
  KEY_DELETE_COMMAND,
} from "lexical";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { useEffect } from "react";
import { TokenNode } from "../../nodes/TokenNode";

function textNodeTransform(node: TextNode) {
  if (!node.isSimpleText()) {
    return;
  }

  const parent = node.getParent();
  if (parent instanceof TokenNode) {
    return;
  }

  const textContent = node.getTextContent();
  const tokenRegex = /\{\{([^}]+)\}\}/g;

  if (!tokenRegex.test(textContent)) {
    return;
  }

  tokenRegex.lastIndex = 0;

  let match;
  let lastIndex = 0;
  const nodes: LexicalNode[] = [];

  while ((match = tokenRegex.exec(textContent)) !== null) {
    const beforeText = textContent.slice(lastIndex, match.index);
    if (beforeText) {
      nodes.push($createTextNode(beforeText));
    }

    const tokenNode = new TokenNode(match[1]);
    nodes.push(tokenNode);
    nodes.push($createTextNode("\u200B")); // Zero-width space

    lastIndex = match.index + match[0].length;
  }

  const afterText = textContent.slice(lastIndex);
  if (afterText) {
    nodes.push($createTextNode(afterText));
  }

  if (nodes.length) {
    node.replace(nodes[0]);
    let previousNode = nodes[0];
    for (let i = 1; i < nodes.length; i++) {
      previousNode.insertAfter(nodes[i]);
      previousNode = nodes[i];
    }

    const selection = $getSelection();
    if ($isRangeSelection(selection)) {
      const lastNode = nodes[nodes.length - 1];
      const point = $createPoint(
        lastNode.getKey(),
        lastNode.getTextContent().length,
        "text"
      );
      selection.anchor.set(point.key, point.offset, point.type);
      selection.focus.set(point.key, point.offset, point.type);
    }
  }
}

export function TokenPlugin(): null {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    if (!editor.hasNodes([TokenNode])) {
      throw new Error("TokenPlugin: TokenNode not registered on editor");
    }

    // Register backspace handler
    const removeHandler = editor.registerCommand(
      KEY_BACKSPACE_COMMAND,
      (event) => {
        const selection = $getSelection();
        if (!$isRangeSelection(selection)) {
          return false;
        }

        const nodes = selection.getNodes();
        const firstNode = nodes[0];
        const anchor = selection.anchor;

        // Check if we're at the start of a text node that comes after a token
        if (
          firstNode instanceof TextNode &&
          anchor.offset === 0 &&
          firstNode.getPreviousSibling() instanceof TokenNode
        ) {
          firstNode.getPreviousSibling()?.remove();
          return true;
        }

        // Check if we're inside a token
        if (firstNode.getParent() instanceof TokenNode) {
          firstNode.getParent()?.remove();
          return true;
        }

        return false;
      },
      COMMAND_PRIORITY_CRITICAL
    );

    // Register delete handler (optional, for consistency)
    const deleteHandler = editor.registerCommand(
      KEY_DELETE_COMMAND,
      (event) => {
        const selection = $getSelection();
        if (!$isRangeSelection(selection)) {
          return false;
        }

        const nodes = selection.getNodes();
        const firstNode = nodes[0];
        const focus = selection.focus;

        // Check if we're at the end of a text node that comes before a token
        if (
          firstNode instanceof TextNode &&
          focus.offset === firstNode.getTextContentSize() &&
          firstNode.getNextSibling() instanceof TokenNode
        ) {
          firstNode.getNextSibling()?.remove();
          return true;
        }

        // Check if we're inside a token
        if (firstNode.getParent() instanceof TokenNode) {
          firstNode.getParent()?.remove();
          return true;
        }

        return false;
      },
      COMMAND_PRIORITY_CRITICAL
    );

    // Add click handler
    const updateClickListener = editor.registerRootListener(
      (
        rootElement: null | HTMLElement,
        prevRootElement: null | HTMLElement
      ) => {
        if (prevRootElement !== null) {
          prevRootElement.removeEventListener("click", handleClick);
        }
        if (rootElement !== null) {
          rootElement.addEventListener("click", handleClick);
        }
      }
    );

    const transformListener = editor.registerNodeTransform(
      TextNode,
      textNodeTransform
    );

    // Cleanup function
    return () => {
      removeHandler();
      deleteHandler();
      updateClickListener();
      transformListener();
    };
  }, [editor]);

  const handleClick = (event: MouseEvent) => {
    const target = event.target as HTMLElement;
    if (target.hasAttribute("data-lexical-token")) {
      editor.update(() => {
        const selection = $getSelection();
        if ($isRangeSelection(selection)) {
          console.log("Token clicked:", target.textContent);
          alert(`Token clicked: ${target.textContent}`);
        }
      });
    }
  };

  return null;
}
