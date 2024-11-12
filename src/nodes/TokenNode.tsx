import {
  TextNode,
  EditorConfig,
  NodeKey,
  SerializedTextNode,
  LexicalEditor,
  DOMExportOutput,
  DOMConversionMap,
  DOMConversionOutput,
} from "lexical";

interface TokenTheme {
  backgroundColor: string;
  textColor: string;
  borderColor: string;
}

export class TokenNode extends TextNode {
  // Default theme colors
  static defaultTheme: TokenTheme = {
    backgroundColor: "#E4E6FB",
    textColor: "#503D94",
    borderColor: "#CED1F8",
  };

  static getType(): string {
    return "token";
  }

  static clone(node: TokenNode): TokenNode {
    return new TokenNode(node.__text, node.__key);
  }

  constructor(text: string, key?: NodeKey) {
    super(text, key);
  }

  static importDOM(): DOMConversionMap | null {
    return {
      span: (domNode: HTMLElement) => {
        if (
          domNode.classList.contains("lexical-token") ||
          domNode.hasAttribute("data-lexical-token")
        ) {
          return {
            conversion: convertTokenElement,
            priority: 1,
          };
        }
        return null;
      },
    };
  }

  createDOM(config: EditorConfig): HTMLElement {
    const dom = super.createDOM(config);
    const theme = TokenNode.defaultTheme;

    // Apply styles as a single CSS string for better performance
    dom.style.cssText = `
        color: ${theme.textColor};
        background-color: ${theme.backgroundColor};
        border: 1px solid ${theme.borderColor};
        border-radius: 6px;
        padding: 0 6px;
        display: inline-block;
        font-weight: 500;
        margin-right: 0.1px;
        cursor: pointer;
        transition: background-color 0.2s ease;
      `;

    // Add data attributes and classes
    dom.classList.add("lexical-token");
    dom.setAttribute("data-lexical-token", "true");
    dom.setAttribute("data-token-value", this.__text);

    // Add hover effect listener
    dom.addEventListener("mouseenter", () => {
      dom.style.backgroundColor = this.adjustColor(theme.backgroundColor, -10);
    });
    dom.addEventListener("mouseleave", () => {
      dom.style.backgroundColor = theme.backgroundColor;
    });

    return dom;
  }

  // Helper method to darken/lighten colors
  private adjustColor(color: string, percent: number): string {
    const num = parseInt(color.replace("#", ""), 16);
    const amt = Math.round(2.55 * percent);
    const R = (num >> 16) + amt;
    const G = ((num >> 8) & 0x00ff) + amt;
    const B = (num & 0x0000ff) + amt;
    return `#${(
      (1 << 24) |
      ((R < 255 ? (R < 1 ? 0 : R) : 255) << 16) |
      ((G < 255 ? (G < 1 ? 0 : G) : 255) << 8) |
      (B < 255 ? (B < 1 ? 0 : B) : 255)
    )
      .toString(16)
      .slice(1)}`;
  }

  updateDOM(): false {
    return false;
  }

  exportDOM(editor: LexicalEditor): DOMExportOutput {
    const { element } = super.exportDOM(editor);
    const theme = TokenNode.defaultTheme;

    const token = document.createElement("span");
    token.setAttribute("class", "lexical-token");
    token.setAttribute(
      "style",
      `
        color: ${theme.textColor};
        background-color: ${theme.backgroundColor};
        border: 1px solid ${theme.borderColor};
        border-radius: 6px;
        padding: 0 6px;
        display: inline-block;
        font-weight: 500;
        margin-right: 0.1px;
        cursor: pointer;
      `.trim()
    );

    if (element !== null) {
      token.textContent = element.textContent;
    }

    token.setAttribute("data-token-value", this.__text);
    token.setAttribute("data-lexical-token", "true");

    return { element: token };
  }

  static importJSON(serializedNode: SerializedTextNode): TokenNode {
    return new TokenNode(serializedNode.text);
  }

  exportJSON(): SerializedTextNode {
    return {
      ...super.exportJSON(),
      type: "token",
      version: 1,
    };
  }
}

function convertTokenElement(domNode: HTMLElement): DOMConversionOutput {
  const text = domNode.textContent || "";
  const tokenValue = domNode.getAttribute("data-token-value") || text;
  return { node: new TokenNode(tokenValue) };
}
