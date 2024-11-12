/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { AutoFocusPlugin } from "@lexical/react/LexicalAutoFocusPlugin";
import { CharacterLimitPlugin } from "@lexical/react/LexicalCharacterLimitPlugin";
import { CheckListPlugin } from "@lexical/react/LexicalCheckListPlugin";
import { ClearEditorPlugin } from "@lexical/react/LexicalClearEditorPlugin";
import { ClickableLinkPlugin } from "@lexical/react/LexicalClickableLinkPlugin";
import { CollaborationPlugin } from "@lexical/react/LexicalCollaborationPlugin";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";
import { HashtagPlugin } from "@lexical/react/LexicalHashtagPlugin";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { HorizontalRulePlugin } from "@lexical/react/LexicalHorizontalRulePlugin";
import { ListPlugin } from "@lexical/react/LexicalListPlugin";
import { PlainTextPlugin } from "@lexical/react/LexicalPlainTextPlugin";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { TabIndentationPlugin } from "@lexical/react/LexicalTabIndentationPlugin";
import { TablePlugin } from "@lexical/react/LexicalTablePlugin";
import { useLexicalEditable } from "@lexical/react/useLexicalEditable";
import * as React from "react";
import { useEffect, useState } from "react";
import { CAN_USE_DOM } from "../shared/src/canUseDOM";
import { $generateHtmlFromNodes, $generateNodesFromDOM } from "@lexical/html";

import { createWebsocketProvider } from "./collaboration";
import { useSettings } from "./context/SettingsContext";
import { useSharedHistoryContext } from "./context/SharedHistoryContext";
import ActionsPlugin from "./plugins/ActionsPlugin";
import AutocompletePlugin from "./plugins/AutocompletePlugin";
import AutoEmbedPlugin from "./plugins/AutoEmbedPlugin";
import AutoLinkPlugin from "./plugins/AutoLinkPlugin";
import CodeActionMenuPlugin from "./plugins/CodeActionMenuPlugin";
import CodeHighlightPlugin from "./plugins/CodeHighlightPlugin";
import CollapsiblePlugin from "./plugins/CollapsiblePlugin";
import CommentPlugin from "./plugins/CommentPlugin";
import ComponentPickerPlugin from "./plugins/ComponentPickerPlugin";
import ContextMenuPlugin from "./plugins/ContextMenuPlugin";
import DragDropPaste from "./plugins/DragDropPastePlugin";
import DraggableBlockPlugin from "./plugins/DraggableBlockPlugin";
import EmojiPickerPlugin from "./plugins/EmojiPickerPlugin";
import EmojisPlugin from "./plugins/EmojisPlugin";
import EquationsPlugin from "./plugins/EquationsPlugin";
import ExcalidrawPlugin from "./plugins/ExcalidrawPlugin";
import FigmaPlugin from "./plugins/FigmaPlugin";
import FloatingLinkEditorPlugin from "./plugins/FloatingLinkEditorPlugin";
import FloatingTextFormatToolbarPlugin from "./plugins/FloatingTextFormatToolbarPlugin";
import ImagesPlugin from "./plugins/ImagesPlugin";
import InlineImagePlugin from "./plugins/InlineImagePlugin";
import KeywordsPlugin from "./plugins/KeywordsPlugin";
import { LayoutPlugin } from "./plugins/LayoutPlugin/LayoutPlugin";
import LinkPlugin from "./plugins/LinkPlugin";
import ListMaxIndentLevelPlugin from "./plugins/ListMaxIndentLevelPlugin";
import MarkdownShortcutPlugin from "./plugins/MarkdownShortcutPlugin";
import { MaxLengthPlugin } from "./plugins/MaxLengthPlugin";
import MentionsPlugin from "./plugins/MentionsPlugin";
import PageBreakPlugin from "./plugins/PageBreakPlugin";
import PollPlugin from "./plugins/PollPlugin";
import ShortcutsPlugin from "./plugins/ShortcutsPlugin";
import SpeechToTextPlugin from "./plugins/SpeechToTextPlugin";
import TabFocusPlugin from "./plugins/TabFocusPlugin";
import TableCellActionMenuPlugin from "./plugins/TableActionMenuPlugin";
import TableCellResizer from "./plugins/TableCellResizer";
import TableHoverActionsPlugin from "./plugins/TableHoverActionsPlugin";
import TableOfContentsPlugin from "./plugins/TableOfContentsPlugin";
import ToolbarPlugin from "./plugins/ToolbarPlugin";
import TreeViewPlugin from "./plugins/TreeViewPlugin";
import TwitterPlugin from "./plugins/TwitterPlugin";
import YouTubePlugin from "./plugins/YouTubePlugin";
import ContentEditable from "./ui/ContentEditable";
import { $getRoot, $insertNodes } from "lexical";
import { TokenPlugin } from "./plugins/TokenPlugin";

const skipCollaborationInit =
  // @ts-expect-error
  window.parent != null && window.parent.frames.right === window;

export default function Editor(): React.JSX.Element {
  const { historyState } = useSharedHistoryContext();
  const {
    settings: {
      isCollab,
      isAutocomplete,
      isMaxLength,
      isCharLimit,
      hasLinkAttributes,
      isCharLimitUtf8,
      isRichText,
      showTreeView,
      showTableOfContents,
      shouldUseLexicalContextMenu,
      shouldPreserveNewLinesInMarkdown,
      tableCellMerge,
      tableCellBackgroundColor,
    },
  } = useSettings();
  const isEditable = useLexicalEditable();
  const placeholder = isCollab
    ? "Enter some collaborative rich text..."
    : isRichText
    ? "Enter some rich text..."
    : "Enter some plain text...";
  const [floatingAnchorElem, setFloatingAnchorElem] =
    useState<HTMLDivElement | null>(null);
  const [isSmallWidthViewport, setIsSmallWidthViewport] =
    useState<boolean>(false);
  const [editor] = useLexicalComposerContext();
  const [activeEditor, setActiveEditor] = useState(editor);
  const [isLinkEditMode, setIsLinkEditMode] = useState<boolean>(false);

  const onRef = (_floatingAnchorElem: HTMLDivElement) => {
    if (_floatingAnchorElem !== null) {
      setFloatingAnchorElem(_floatingAnchorElem);
    }
  };

  useEffect(() => {
    const updateViewPortWidth = () => {
      const isNextSmallWidthViewport =
        CAN_USE_DOM && window.matchMedia("(max-width: 1025px)").matches;

      if (isNextSmallWidthViewport !== isSmallWidthViewport) {
        setIsSmallWidthViewport(isNextSmallWidthViewport);
      }
    };
    updateViewPortWidth();
    window.addEventListener("resize", updateViewPortWidth);

    return () => {
      window.removeEventListener("resize", updateViewPortWidth);
    };
  }, [isSmallWidthViewport]);

  const ShowHTML = () => {
    // console.log(editor);
    // const htmlString = $generateHtmlFromNodes(editor, null);
    // console.log(htmlString);
    editor.update(() => {
      const htmlString = $generateHtmlFromNodes(editor, null);
      console.log(htmlString);
    });
  };

  const InsertHTML = () => {
    const html = `<p class="PlaygroundEditorTheme__paragraph" dir="ltr"><span style="white-space: pre-wrap;">This is a </span><b><strong class="PlaygroundEditorTheme__textBold" style="font-family: Georgia; white-space: pre-wrap;">Lexical</strong></b><span style="white-space: pre-wrap;"> </span><u><span class="PlaygroundEditorTheme__textUnderline" style="font-family: Verdana; white-space: pre-wrap;">Dem</span></u><span style="font-family: Verdana; white-space: pre-wrap;">o</span></p><p class="PlaygroundEditorTheme__paragraph" dir="ltr"><br></p><ul class="PlaygroundEditorTheme__ul PlaygroundEditorTheme__checklist" __lexicallisttype="check"><li role="checkbox" tabindex="-1" aria-checked="false" value="1" class="PlaygroundEditorTheme__listItem PlaygroundEditorTheme__listItemUnchecked"><span style="font-family: &quot;Trebuchet MS&quot;; white-space: pre-wrap;">Item 1</span></li><li role="checkbox" tabindex="-1" aria-checked="false" value="2" class="PlaygroundEditorTheme__listItem PlaygroundEditorTheme__listItemUnchecked"><span class="lexical-token" style="color: #503D94;
        background-color: #E4E6FB;
        border: 1px solid #CED1F8;
        border-radius: 6px;
        padding: 0 6px;
        display: inline-block;
        font-weight: 500;
        margin-right: 0.1px;
        cursor: pointer;" data-token-value="token" data-lexical-token="true">token</span><span style="white-space: pre-wrap;">​</span></li></ul><p class="PlaygroundEditorTheme__paragraph" dir="ltr"><br></p><p class="PlaygroundEditorTheme__paragraph" dir="ltr"><span style="white-space: pre-wrap;">We can have multiple </span><span style="font-family: Georgia; white-space: pre-wrap;">fonts</span><span style="white-space: pre-wrap;">, </span><span style="color: rgb(126, 211, 33); white-space: pre-wrap;">colors</span><span style="white-space: pre-wrap;">, and </span><b><strong class="PlaygroundEditorTheme__textBold" style="white-space: pre-wrap;">weights</strong></b></p><p class="PlaygroundEditorTheme__paragraph"><br></p><p class="PlaygroundEditorTheme__paragraph" dir="ltr"><br></p><table class="PlaygroundEditorTheme__table"><colgroup><col style="width: 127px;"><col style="width: 92px;"><col style="width: 92px;"><col style="width: 92px;"><col style="width: 92px;"></colgroup><tbody><tr><th class="PlaygroundEditorTheme__tableCell PlaygroundEditorTheme__tableCellHeader" style="border: 1px solid black; width: 75px; vertical-align: top; text-align: start; background-color: rgb(242, 243, 245);"><p class="PlaygroundEditorTheme__paragraph" dir="ltr"><span style="white-space: pre-wrap;">Name</span></p></th><th class="PlaygroundEditorTheme__tableCell PlaygroundEditorTheme__tableCellHeader" style="border: 1px solid black; width: 75px; vertical-align: top; text-align: start; background-color: rgb(242, 243, 245);"><p class="PlaygroundEditorTheme__paragraph" dir="ltr"><span style="white-space: pre-wrap;">Email</span></p></th><th class="PlaygroundEditorTheme__tableCell PlaygroundEditorTheme__tableCellHeader" style="border: 1px solid black; width: 75px; vertical-align: top; text-align: start; background-color: rgb(242, 243, 245);"><p class="PlaygroundEditorTheme__paragraph" dir="ltr"><span style="white-space: pre-wrap;">Phone</span></p></th><th class="PlaygroundEditorTheme__tableCell PlaygroundEditorTheme__tableCellHeader" style="border: 1px solid black; width: 75px; vertical-align: top; text-align: start; background-color: rgb(242, 243, 245);"><p class="PlaygroundEditorTheme__paragraph" dir="ltr"><br></p></th><th class="PlaygroundEditorTheme__tableCell PlaygroundEditorTheme__tableCellHeader" style="border: 1px solid black; width: 75px; vertical-align: top; text-align: start; background-color: rgb(242, 243, 245);"><p class="PlaygroundEditorTheme__paragraph" dir="ltr"><br></p></th></tr><tr><th class="PlaygroundEditorTheme__tableCell PlaygroundEditorTheme__tableCellHeader" style="border: 1px solid black; width: 75px; vertical-align: top; text-align: start; background-color: rgb(242, 243, 245);"><p class="PlaygroundEditorTheme__paragraph" dir="ltr"><span class="lexical-token" style="color: #503D94;
        background-color: #E4E6FB;
        border: 1px solid #CED1F8;
        border-radius: 6px;
        padding: 0 6px;
        display: inline-block;
        font-weight: 500;
        margin-right: 0.1px;
        cursor: pointer;" data-token-value="username" data-lexical-token="true">username</span><span style="white-space: pre-wrap;">​</span></p></th><td class="PlaygroundEditorTheme__tableCell" style="border: 1px solid black; width: 75px; vertical-align: top; text-align: start;"><p class="PlaygroundEditorTheme__paragraph" dir="ltr"><span class="lexical-token" style="color: #503D94;
        background-color: #E4E6FB;
        border: 1px solid #CED1F8;
        border-radius: 6px;
        padding: 0 6px;
        display: inline-block;
        font-weight: 500;
        margin-right: 0.1px;
        cursor: pointer;" data-token-value="email" data-lexical-token="true">email</span><span style="white-space: pre-wrap;">​</span></p></td><td class="PlaygroundEditorTheme__tableCell" style="border: 1px solid black; width: 75px; vertical-align: top; text-align: start;"><p class="PlaygroundEditorTheme__paragraph" dir="ltr"><span class="lexical-token" style="color: #503D94;
        background-color: #E4E6FB;
        border: 1px solid #CED1F8;
        border-radius: 6px;
        padding: 0 6px;
        display: inline-block;
        font-weight: 500;
        margin-right: 0.1px;
        cursor: pointer;" data-token-value="phone" data-lexical-token="true">phone</span><span style="white-space: pre-wrap;">​</span></p></td><td class="PlaygroundEditorTheme__tableCell" style="border: 1px solid black; width: 75px; vertical-align: top; text-align: start;"><p class="PlaygroundEditorTheme__paragraph" dir="ltr"><br></p></td><td class="PlaygroundEditorTheme__tableCell" style="border: 1px solid black; width: 75px; vertical-align: top; text-align: start;"><p class="PlaygroundEditorTheme__paragraph" dir="ltr"><br></p></td></tr><tr><th class="PlaygroundEditorTheme__tableCell PlaygroundEditorTheme__tableCellHeader" style="border: 1px solid black; width: 75px; vertical-align: top; text-align: start; background-color: rgb(242, 243, 245);"><p class="PlaygroundEditorTheme__paragraph" dir="ltr"><br></p></th><td class="PlaygroundEditorTheme__tableCell" style="border: 1px solid black; width: 75px; vertical-align: top; text-align: start;"><p class="PlaygroundEditorTheme__paragraph" dir="ltr"><br></p></td><td class="PlaygroundEditorTheme__tableCell" style="border: 1px solid black; width: 75px; vertical-align: top; text-align: start;"><p class="PlaygroundEditorTheme__paragraph" dir="ltr"><br></p></td><td class="PlaygroundEditorTheme__tableCell" style="border: 1px solid black; width: 75px; vertical-align: top; text-align: start;"><p class="PlaygroundEditorTheme__paragraph" dir="ltr"><br></p></td><td class="PlaygroundEditorTheme__tableCell" style="border: 1px solid black; width: 75px; vertical-align: top; text-align: start;"><p class="PlaygroundEditorTheme__paragraph" dir="ltr"><br></p></td></tr><tr><th class="PlaygroundEditorTheme__tableCell PlaygroundEditorTheme__tableCellHeader" style="border: 1px solid black; width: 75px; vertical-align: top; text-align: start; background-color: rgb(242, 243, 245);"><p class="PlaygroundEditorTheme__paragraph" dir="ltr"><br></p></th><td class="PlaygroundEditorTheme__tableCell" style="border: 1px solid black; width: 75px; vertical-align: top; text-align: start;"><p class="PlaygroundEditorTheme__paragraph" dir="ltr"><br></p></td><td class="PlaygroundEditorTheme__tableCell" style="border: 1px solid black; width: 75px; vertical-align: top; text-align: start;"><p class="PlaygroundEditorTheme__paragraph" dir="ltr"><br></p></td><td class="PlaygroundEditorTheme__tableCell" style="border: 1px solid black; width: 75px; vertical-align: top; text-align: start;"><p class="PlaygroundEditorTheme__paragraph" dir="ltr"><br></p></td><td class="PlaygroundEditorTheme__tableCell" style="border: 1px solid black; width: 75px; vertical-align: top; text-align: start;"><p class="PlaygroundEditorTheme__paragraph" dir="ltr"><br></p></td></tr><tr style="height: 33px;"><th class="PlaygroundEditorTheme__tableCell PlaygroundEditorTheme__tableCellHeader" style="border: 1px solid black; width: 75px; vertical-align: top; text-align: start; background-color: rgb(242, 243, 245);"><p class="PlaygroundEditorTheme__paragraph" dir="ltr"><br></p></th><td class="PlaygroundEditorTheme__tableCell" style="border: 1px solid black; width: 75px; vertical-align: top; text-align: start;"><p class="PlaygroundEditorTheme__paragraph" dir="ltr"><br></p></td><td class="PlaygroundEditorTheme__tableCell" style="border: 1px solid black; width: 75px; vertical-align: top; text-align: start;"><p class="PlaygroundEditorTheme__paragraph" dir="ltr"><br></p></td><td class="PlaygroundEditorTheme__tableCell" style="border: 1px solid black; width: 75px; vertical-align: top; text-align: start;"><p class="PlaygroundEditorTheme__paragraph" dir="ltr"><br></p></td><td class="PlaygroundEditorTheme__tableCell" style="border: 1px solid black; width: 75px; vertical-align: top; text-align: start;"><p class="PlaygroundEditorTheme__paragraph" dir="ltr"><br></p></td></tr></tbody></table><p class="PlaygroundEditorTheme__paragraph" dir="ltr"><br></p><p class="PlaygroundEditorTheme__paragraph" dir="ltr"><br></p>`;

    editor.update(() => {
      // In the browser you can use the native DOMParser API to parse the HTML string.
      const parser = new DOMParser();
      const dom = parser.parseFromString(html, "text/html");

      // Once you have the DOM instance it's easy to generate LexicalNodes.
      const nodes = $generateNodesFromDOM(editor, dom);

      // Select the root
      $getRoot().select();

      // Insert them at a selection.
      $insertNodes(nodes);
    });
  };

  return (
    <>
      {isRichText && (
        <ToolbarPlugin
          editor={editor}
          activeEditor={activeEditor}
          setActiveEditor={setActiveEditor}
          setIsLinkEditMode={setIsLinkEditMode}
        />
      )}
      {isRichText && (
        <ShortcutsPlugin
          editor={activeEditor}
          setIsLinkEditMode={setIsLinkEditMode}
        />
      )}
      <div
        className={`editor-container ${showTreeView ? "tree-view" : ""} ${
          !isRichText ? "plain-text" : ""
        }`}
      >
        {isMaxLength && <MaxLengthPlugin maxLength={30} />}
        <DragDropPaste />
        <AutoFocusPlugin />
        <ClearEditorPlugin />
        <ComponentPickerPlugin />
        <EmojiPickerPlugin />
        <AutoEmbedPlugin />

        <MentionsPlugin />
        <EmojisPlugin />
        <HashtagPlugin />
        <KeywordsPlugin />
        <SpeechToTextPlugin />
        <AutoLinkPlugin />
        <CommentPlugin
          providerFactory={isCollab ? createWebsocketProvider : undefined}
        />
        {isRichText ? (
          <>
            {isCollab ? (
              <CollaborationPlugin
                id="main"
                providerFactory={createWebsocketProvider}
                shouldBootstrap={!skipCollaborationInit}
              />
            ) : (
              <HistoryPlugin externalHistoryState={historyState} />
            )}
            <RichTextPlugin
              contentEditable={
                <div className="editor-scroller">
                  <div className="editor" ref={onRef}>
                    <ContentEditable placeholder={placeholder} />
                  </div>
                </div>
              }
              ErrorBoundary={LexicalErrorBoundary}
            />
            <MarkdownShortcutPlugin />
            <CodeHighlightPlugin />
            <ListPlugin />
            <TokenPlugin />
            <CheckListPlugin />
            <ListMaxIndentLevelPlugin maxDepth={7} />
            <TablePlugin
              hasCellMerge={tableCellMerge}
              hasCellBackgroundColor={tableCellBackgroundColor}
            />
            <TableCellResizer />
            <ImagesPlugin />
            <InlineImagePlugin />
            <LinkPlugin hasLinkAttributes={hasLinkAttributes} />
            <PollPlugin />
            <TwitterPlugin />
            <YouTubePlugin />
            <FigmaPlugin />
            <ClickableLinkPlugin disabled={isEditable} />
            <HorizontalRulePlugin />
            <EquationsPlugin />
            <ExcalidrawPlugin />
            <TabFocusPlugin />
            <TabIndentationPlugin />
            <CollapsiblePlugin />
            <PageBreakPlugin />
            <LayoutPlugin />
            {floatingAnchorElem && !isSmallWidthViewport && (
              <>
                <DraggableBlockPlugin anchorElem={floatingAnchorElem} />
                <CodeActionMenuPlugin anchorElem={floatingAnchorElem} />
                <FloatingLinkEditorPlugin
                  anchorElem={floatingAnchorElem}
                  isLinkEditMode={isLinkEditMode}
                  setIsLinkEditMode={setIsLinkEditMode}
                />
                <TableCellActionMenuPlugin
                  anchorElem={floatingAnchorElem}
                  cellMerge={true}
                />
                <TableHoverActionsPlugin anchorElem={floatingAnchorElem} />
                <FloatingTextFormatToolbarPlugin
                  anchorElem={floatingAnchorElem}
                  setIsLinkEditMode={setIsLinkEditMode}
                />
              </>
            )}
          </>
        ) : (
          <>
            <PlainTextPlugin
              contentEditable={<ContentEditable placeholder={placeholder} />}
              ErrorBoundary={LexicalErrorBoundary}
            />
            <HistoryPlugin externalHistoryState={historyState} />
          </>
        )}
        {(isCharLimit || isCharLimitUtf8) && (
          <CharacterLimitPlugin
            charset={isCharLimit ? "UTF-16" : "UTF-8"}
            maxLength={5}
          />
        )}
        {isAutocomplete && <AutocompletePlugin />}
        <div>{showTableOfContents && <TableOfContentsPlugin />}</div>
        {shouldUseLexicalContextMenu && <ContextMenuPlugin />}
        <ActionsPlugin
          isRichText={isRichText}
          shouldPreserveNewLinesInMarkdown={shouldPreserveNewLinesInMarkdown}
        />
      </div>

      <button onClick={ShowHTML}>Show Html</button>
      <button onClick={InsertHTML}>Insert Html</button>
    </>
  );
}
