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
    const html = `<p class="PlaygroundEditorTheme__paragraph"><br></p><p class="PlaygroundEditorTheme__paragraph" dir="ltr"><span style="white-space: pre-wrap;">This is a </span><b><strong class="PlaygroundEditorTheme__textBold" style="white-space: pre-wrap;">Lexical</strong></b><span style="white-space: pre-wrap;"> </span><u><span class="PlaygroundEditorTheme__textUnderline" style="white-space: pre-wrap;">Dem</span></u><span style="white-space: pre-wrap;">o</span></p><p class="PlaygroundEditorTheme__paragraph"><br></p><ul class="PlaygroundEditorTheme__ul PlaygroundEditorTheme__checklist" __lexicallisttype="check"><li role="checkbox" tabindex="-1" aria-checked="false" value="1" class="PlaygroundEditorTheme__listItem PlaygroundEditorTheme__listItemUnchecked"><span style="white-space: pre-wrap;">Item 1</span></li><li role="checkbox" tabindex="-1" aria-checked="false" value="2" class="PlaygroundEditorTheme__listItem PlaygroundEditorTheme__listItemUnchecked"><span class="lexical-token" data-token-value="token" data-lexical-token="true">token</span><span style="white-space: pre-wrap;">​</span></li></ul><p class="PlaygroundEditorTheme__paragraph"><br></p><p class="PlaygroundEditorTheme__paragraph" dir="ltr"><span style="white-space: pre-wrap;">We can have multiple fonts, </span><span style="color: rgb(126, 211, 33); white-space: pre-wrap;">colors</span><span style="white-space: pre-wrap;">, and </span><b><strong class="PlaygroundEditorTheme__textBold" style="white-space: pre-wrap;">weights</strong></b></p><p class="PlaygroundEditorTheme__paragraph"><br></p><p class="PlaygroundEditorTheme__paragraph"><br></p><table class="PlaygroundEditorTheme__table"><colgroup><col style="width: 127px;"><col style="width: 92px;"><col style="width: 92px;"><col style="width: 92px;"><col style="width: 92px;"></colgroup><tbody><tr><th class="PlaygroundEditorTheme__tableCell PlaygroundEditorTheme__tableCellHeader" style="width: 75px; background-color: rgb(242, 243, 245); border: 1px solid black; vertical-align: top; text-align: start;"><p class="PlaygroundEditorTheme__paragraph" dir="ltr"><span style="white-space: pre-wrap;">Name</span></p></th><th class="PlaygroundEditorTheme__tableCell PlaygroundEditorTheme__tableCellHeader" style="width: 75px; background-color: rgb(242, 243, 245); border: 1px solid black; vertical-align: top; text-align: start;"><p class="PlaygroundEditorTheme__paragraph" dir="ltr"><span style="white-space: pre-wrap;">Email</span></p></th><th class="PlaygroundEditorTheme__tableCell PlaygroundEditorTheme__tableCellHeader" style="width: 75px; background-color: rgb(242, 243, 245); border: 1px solid black; vertical-align: top; text-align: start;"><p class="PlaygroundEditorTheme__paragraph" dir="ltr"><span style="white-space: pre-wrap;">Phone</span></p></th><th class="PlaygroundEditorTheme__tableCell PlaygroundEditorTheme__tableCellHeader" style="width: 75px; background-color: rgb(242, 243, 245); border: 1px solid black; vertical-align: top; text-align: start;"><p class="PlaygroundEditorTheme__paragraph"><br></p></th><th class="PlaygroundEditorTheme__tableCell PlaygroundEditorTheme__tableCellHeader" style="width: 75px; background-color: rgb(242, 243, 245); border: 1px solid black; vertical-align: top; text-align: start;"><p class="PlaygroundEditorTheme__paragraph"><br></p></th></tr><tr><th class="PlaygroundEditorTheme__tableCell PlaygroundEditorTheme__tableCellHeader" style="width: 75px; background-color: rgb(242, 243, 245); border: 1px solid black; vertical-align: top; text-align: start;"><p class="PlaygroundEditorTheme__paragraph" dir="ltr"><span class="lexical-token" data-token-value="username" data-lexical-token="true">username</span><span style="white-space: pre-wrap;">​</span></p></th><td class="PlaygroundEditorTheme__tableCell" style="width: 75px; border: 1px solid black; vertical-align: top; text-align: start;"><p class="PlaygroundEditorTheme__paragraph" dir="ltr" style="text-align: start;"><span class="lexical-token" data-token-value="email" data-lexical-token="true">email</span><span style="white-space: pre-wrap;">​</span></p></td><td class="PlaygroundEditorTheme__tableCell" style="width: 75px; border: 1px solid black; vertical-align: top; text-align: start;"><p class="PlaygroundEditorTheme__paragraph" dir="ltr" style="text-align: start;"><span class="lexical-token" data-token-value="phone" data-lexical-token="true">phone</span><span style="white-space: pre-wrap;">​</span></p></td><td class="PlaygroundEditorTheme__tableCell" style="width: 75px; border: 1px solid black; vertical-align: top; text-align: start;"><p class="PlaygroundEditorTheme__paragraph" style="text-align: start;"><br></p></td><td class="PlaygroundEditorTheme__tableCell" style="width: 75px; border: 1px solid black; vertical-align: top; text-align: start;"><p class="PlaygroundEditorTheme__paragraph" style="text-align: start;"><br></p></td></tr><tr><th class="PlaygroundEditorTheme__tableCell PlaygroundEditorTheme__tableCellHeader" style="width: 75px; background-color: rgb(242, 243, 245); border: 1px solid black; vertical-align: top; text-align: start;"><p class="PlaygroundEditorTheme__paragraph"><br></p></th><td class="PlaygroundEditorTheme__tableCell" style="width: 75px; border: 1px solid black; vertical-align: top; text-align: start;"><p class="PlaygroundEditorTheme__paragraph" style="text-align: start;"><br></p></td><td class="PlaygroundEditorTheme__tableCell" style="width: 75px; border: 1px solid black; vertical-align: top; text-align: start;"><p class="PlaygroundEditorTheme__paragraph" style="text-align: start;"><br></p></td><td class="PlaygroundEditorTheme__tableCell" style="width: 75px; border: 1px solid black; vertical-align: top; text-align: start;"><p class="PlaygroundEditorTheme__paragraph" style="text-align: start;"><br></p></td><td class="PlaygroundEditorTheme__tableCell" style="width: 75px; border: 1px solid black; vertical-align: top; text-align: start;"><p class="PlaygroundEditorTheme__paragraph" style="text-align: start;"><br></p></td></tr><tr><th class="PlaygroundEditorTheme__tableCell PlaygroundEditorTheme__tableCellHeader" style="width: 75px; background-color: rgb(242, 243, 245); border: 1px solid black; vertical-align: top; text-align: start;"><p class="PlaygroundEditorTheme__paragraph"><br></p></th><td class="PlaygroundEditorTheme__tableCell" style="width: 75px; border: 1px solid black; vertical-align: top; text-align: start;"><p class="PlaygroundEditorTheme__paragraph" style="text-align: start;"><br></p></td><td class="PlaygroundEditorTheme__tableCell" style="width: 75px; border: 1px solid black; vertical-align: top; text-align: start;"><p class="PlaygroundEditorTheme__paragraph" style="text-align: start;"><br></p></td><td class="PlaygroundEditorTheme__tableCell" style="width: 75px; border: 1px solid black; vertical-align: top; text-align: start;"><p class="PlaygroundEditorTheme__paragraph" style="text-align: start;"><br></p></td><td class="PlaygroundEditorTheme__tableCell" style="width: 75px; border: 1px solid black; vertical-align: top; text-align: start;"><p class="PlaygroundEditorTheme__paragraph" style="text-align: start;"><br></p></td></tr><tr style="height: 33px;"><th class="PlaygroundEditorTheme__tableCell PlaygroundEditorTheme__tableCellHeader" style="width: 75px; background-color: rgb(242, 243, 245); border: 1px solid black; vertical-align: top; text-align: start;"><p class="PlaygroundEditorTheme__paragraph"><br></p></th><td class="PlaygroundEditorTheme__tableCell" style="width: 75px; border: 1px solid black; vertical-align: top; text-align: start;"><p class="PlaygroundEditorTheme__paragraph" style="text-align: start;"><br></p></td><td class="PlaygroundEditorTheme__tableCell" style="width: 75px; border: 1px solid black; vertical-align: top; text-align: start;"><p class="PlaygroundEditorTheme__paragraph" style="text-align: start;"><br></p></td><td class="PlaygroundEditorTheme__tableCell" style="width: 75px; border: 1px solid black; vertical-align: top; text-align: start;"><p class="PlaygroundEditorTheme__paragraph" style="text-align: start;"><br></p></td><td class="PlaygroundEditorTheme__tableCell" style="width: 75px; border: 1px solid black; vertical-align: top; text-align: start;"><p class="PlaygroundEditorTheme__paragraph" style="text-align: start;"><br></p></td></tr></tbody></table><p class="PlaygroundEditorTheme__paragraph"><br></p><p class="PlaygroundEditorTheme__paragraph"><img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAOEAAADhCAMAAAAJbSJIAAAA9lBMVEUBfOT///8AeuQAfeEAdNgBfOXy+/z9/PtHkN79//k2hd/4//kLedb///3//v////sAduQZfNP///QAcNwAd+AAfd8Ae+r6//////EAdN8ActgAcdsAd+QAdOUAb9UAc9QAceU/itzU6fDo8vUAcdOry+kAde1RlN1amtUAdtIAeuzG4O9Tm9zQ5/OUvua82uyawuB+s+e20Oh1p+EwjtNknuXo8/mw1emIteCsyexzrePg5/HW5+fk+/tnqNhXltYsg8xOj+OavOja7uqUudubzeYKd8y20+J3sNgshMbF4elmp+bX8PLs7e7F2PLs/vaOtOteluFuYQh4AAAVx0lEQVR4nN2dCXfiuLKAZQlBBMgyxktYHLbQECBAyHSgM52lt+l+Sd7k3f//Z54EWQhekDdCbs056ZlpUPxZUqlUqioBJRWhjDHCqEL4v3Xaw+747HzUO2ghAJBpovxfvc/ni3F3cnpBdYXpzGZMT+dBFAWk0yxVFKYU2vNFP1+tOc1PTgVAwAUhBDAAlgHrwHGccuMk31/M2jZhdjoPkjghY5SqlCrs9Mt566jiaBZESwHA5GwYPAv/PwhYUGDXK5Xj1mX3b/5OFNH7NNlHSpjQVhghp9N+JgPqcMmD4RqXS7D4SwyhpZWdk9H0q86YTUmij5Qw4eHV7LKoadAaWK8MWwn5D2whbBmN0vUsy5J9pIQIVVulTOl86R07A4gA5PrkFcIfcEW4/MlHLcLQqhtHN90LRglViZrIoyVEyBVndtZrmtCCATxSYlrVk5vuFdPVZEZrQoT23eWJY5qD2HwAQDgYQC1zfZfQdIxNSGxKH6e3Fa5XIB9qiYjQuvVaa3rFVXNs1RqbkB62L7XKJ5gQ3Ktgy6ksHviEfEdClVDKhqNynauWQH0SSSBfQTWnPxTmA42BGYewoLLht4yRPNyrINzoDePwxSPU776dFCFIERDwhRU2bobK7vuQcmmPmghClCYgwHxhhbDaP1WYSqKZrtEIVUY61xUj1e5bE2g1zi+IGs3YiUZI7XFGA4H2WJLCzfRB43sh0qOGJ2Sqzeik1dwN27PwxbaSHyrMVkObcqEJc/Zh5zqDSjvqvlfh1tx5FKs8LKFq690iXwCt7Y+UsHCd5pRmSmjGcITchCp8Lu+8+14py/0ss8NBhiO0yaRUfD9ArnOc4kQPt2qEIaSMLcr1d+QT6yPWznQlzNYxDCFrtyq7WiD8xazf/lBCdGMIQvo7Yy19Su+NCI15CCtOjpCqOUYWZQu9fxcKOwMdLYj0QJUjZLaeHTXfm+1FzMGnm0dZF4AMIaW23i5p7z8+X8Q0tVZHcsMhQ1gg+rCYgAcmSUFa5qtNZFwcMoSEzhvB8+89ZqflzKjMYcdWQlVRybTqq0MhgnWnUnWEmxTtuJ/LU8oo26ZxthLaOhtrpk8nQYCqpbPJw48fw58tDZu7nar4aMrI1tm4vQ+5HeP/4FrxV5bPBsrNHf13y9ixPY7LY3urE2cLoa2SPzVgeSNi5LQ6TLEFoPg9hfsqwjvtRuwsmKoGM24h1Nmi6d++9debVUk9vB/s2C5HHHHLViOQkPIhagDTt/lih+XWXiBTCy2024GKcXVhB+uaAEJqEzpuBjTvdF3jo13eFduz4NqYBW4ZgwgJ+dUs+a8AOF9wEZL7ne+urNoX3hkRCLmO0udl0/Ido6C+cJ0pUPZb2yHcUtCgOidR+pDah8NqYNO1odukoNkt1k8agsvDAHXqS8jIRTFQa6CjC/e5ECWtdzBg8T8PEQhJNo8Dt7sok3W/OcYO3oEQDlpZ382UP+HNlhnFCd3fYvRdCIHWt/0QfQkXzS3WyR4Ris3Uz3B9yAq/na2NehHm3oUQYwhqMzsXgtDuwK0qcb8Ii8Do2J4a1YuQ2aS1feHeK0KMsHFb8Dx/8yKkZFHZfvC5R4RLwc4fwjzUjQehSidl/PEIufk2lyJkObtQhBLbvL0jNK1MwWOb4SLM2frnhkyDe0cIgNGX6kO9W5ba4+0hIV8yZAg7ktv0kIR4IEZ+3UrXMC91XN5+FyG9lNzhhSPE0KiUj8qOkaabwzSda2VzoG4QqnRYlfQlyROK1apSOpuddk5nZ6ZmpjaOsYmcO7rhX3xLSFmhJesskybkv9dofFn5Axh57GowPSc5X/d15a2vf4OQjJuyw0i+D9Hg4Or5aFpVSafX8HccxBSI4Fh/a9psjNJORvrtShMi+JeuPMXBEBEulr0ZpOhVNX68ddps9OG1vJtFkhBBXMq+1W80m6IjABvnhwGE7Yp8U7KEg8ycvNVvqj5J0eloVtp+hGpBH4UIFpUlrP+lbGg3Su1+iutipkfX/eBrhES5a4ZQcrLzsDnd/BClyq/0TpSx5dytv9I1Qsq+hYlEkCV02i6vKmWdamrqFCBwcLimbNYJhydhDh0kCa2qV7hdNj3Apf90beKvEbJvoQIOZQlNL+dCLp8o06b0vAhz3F4LcOG7RZaw6OXmYykSciOxPHwNDHsh5NtCA4dZpiQJcdErtpfk09M0XJcM+vQlp+iFkLZr4VJe9pgQ4lr7ZcF4IWSXIU+N9pVwKfVz8uw9fSHsBB80uUV2tXgXQlC9cvXhVAupwPeb0Jg+a/AVoZ2z/8cn4MJX9phQePlL7Gk789SHZFgLayjuN2Hx053yhpCd10HIHc1eE2KcuWergLAVIc2ehLb195hQCKw+kjVCNtt6mOaS/SbEyJit0t6f+rDnF5vnL0kTLvO5MQKwbhgQoNimOeopa4SdZvgGUyA0TVPLX47H4/tSAkGA5Q57JexWBqEbSJoQQgyORqdEFA2h2eGNFtcL8GmuPBEyRe8Z4V1DiRKKM04LgpcsA/7nPIMwjOyxEkviDX0mpFeNCGMiaUIASg9rXjJKTlGM9HdOiI4uxJIIhPdiokV4V0kTwkZ7zWXFxyr5N+RuZ5OwOWG5FSE5Dz8Lk5+H9anL27GI46+CsHIp3JhC05BIqQYJE8KSvuntYNk4ORB84TkRDhTRh20nyqtKlhBpY3c8DFk4sdKQlm4+oWmm+0BYbrvDDNgkJqEY+KIP+5GUcqKECB8VyGYwJ7X/N7M9cilA6qMloUqNKIomacKS4o6jINl4J8YoIzQNU06rgyhGYLKE0JswvLm8LrjGFyBAaNd4f0Lg04fxCGGlK/qQhnWyPUmihDCVUWplzkQfKvloi84HIASopaiAFY6itfIRCAHX0IC2Q/ugVvIRCGG5TYAyD+/AWMpHIBRZmIAsIuaAfABCjLUF78N+xDyeD0FYv6eARlSlWBC69jsesfoShFgQ0jCEYse83aDjm8QWXw9l49g2vw2qWXeVSqK4QmW2EwoXBioqruI6ql3wjYFD3NAzt/sA8JENOrWIu0yup9xlVYntskKkCKFZtV05y5T6HohBq1qtaVVj61OWL0DkjEGozd19yDqu5mRGqTiYbrv3h+xfF4KIc7SwU1pM2hd/z66LBsBmUIhM5RRMIi4WfG9y765NQaau5iT3+M7YlQlH2fXmIOXvYmCi4szWhQpgevZnBppBVrU2Ad3IhDhz5dI0HqlrkoR1j891Sps+QHHmovUfSWGZw01sm53eGkHTzOmC75E2+KuHOifqenQ8Udi0EZUQGFP2ZkyohJ5lPAiX4erPOer8j+xt3W+UCo37HZwFvoJAQdrscD0Dl+rtjDuNQZbQbJ7q644Mpou0j81fidDtRsoB6/g+oJjfZ+A8ek0dBKpzWqAiH17U2FVYu4TcDhFpQtwQARQq75flusGGVfdaga3j09xbDW6zsZ9VJvrwHozqcU55MmNCCkRExiqE/XZNmzCEXIwuYfyNsUNGdT7gPZwr5mC0OfcJeyz6VE9dEfaMOISo8m2WZYxQvTAcHQOvLbk8IQa13oQw/o/++LtXw14GTWXiIlTJH5+YY+H47oGDWN4sMRnN/tl48blUtrw9fyH6kBsqlfyytWKl7rnKwZMrl+XDlKGPthR9eABa0c93ntuBdS3j30rIM2AMoQH8Wyt55Rg+OL6fxy2QQMUV0zSx/0gIe8ptmsi/NXzrFQfYCfD+50EC5cmCq3yGJQxsDbW8qrV0AvLqzSQIgyXRSAXU8qq4E0SIPhxh2D4Engo+UdkJob+mMT8cofco9SVEZgKF4peXcYj7Vbz/OhQhDmhoKS2vdO1O0f8LJsjH7EO+fg20ilGHwCdJJByhuMxDqw98KYtehF9rvn0IW+CveBXxMai2Lsdfpme3hk/x6zCEOFNtnfHWLm8r3h5AVL7yGKUTf4coPgC9OMoUoXJPGIp8Z0Hbl2VPC1eWEGEL1u5PldXmbzhyvFoznTnbLCVIlOsAy7sHRnFmotXokqf7GVRG7zy1ljQhsEoT/WlrpBIyr3i0ZhW/bRaFUkmn6JNcLwhH4Ny/ltdWgdUhs5/K8FBKSccr605+lJYuiF1YPT61KWkX3daNOTievPXS8t/7x/EZh8IjcM/3+NEBK5O3b5M9FN21GKQj9xrtjc9MvLKUoLleI47lVHqX8XtATlg/A+PofhrjcsM9xljXnYMqS1j98rY1Yuv/l/FImzZbaw1Son/1L0gpgtu+g+62Sjv+385k3/oTKO/FluuDkqfcsLThm7RzdrbkcTMIBvkHotiKKu7OUg5nBvb1l/I+rHwBEyfaggixdu62L8gvVxaqHCHUpu54GvJH89powMzPDiGMKUTv3G8Zgs0JaEcssY5R5be7BCy7OA7v1V82V34gm4SUDL0jhqB2PBrPZt3FX45RDCastcFF2FyZ50fC5QsPQttlIsrFJoIjj4q5pOO1Yiw/X9c0x/Hf2r9IswNYI9o8hLjmUc2M0AhnT8vmip7nh3FvQME1G+j5aOuhJU7X3M/EohEiy/OENBc3UgHmCaD9iDHj3mfAyj6dAfN27ylgi//eU25RvZIBMgtRZWBdPgIh1uYMsHYt2rc/AiEs3zFg264VTE4+AqF5bDOQE4eaUdr5AIQmyitc07BL3xPGQPkAhMg4VxSgs245bPro6uv7T2gZs2Wc99/RshqSjRHmK77Ljldjj1Ktvcq3OIl0+pRwjHDRi/AinjcXNewlIRm9fyQ7AEfuCvkqu4i4kj0J/Hy46sNxJFWTcB+W266S1ZRNIlojT1KfrjJKlK8ezoLtkiwh1MbuAvnsOl79c6O9yihR9YDC6/6ScB/CYmEjSo7RTjQN8fqrnzO7or2qpHPXahthX6qtX0YaXC8PaFyyZ8JZlDDhpAlRdfjmI4XDuVwRTr/nA+XZEyFTr44i1DJMnBBmTtmrR5ixoTuCLITgktVYPuAyh5TdRLhOO/l8fOu4e/jkcKOM/Iro5nx5PnCjPBGqRPlVff9cbryKGMoq4iAkO29VYp5sDswvz4RcLk7en1AINpzSzdnirPdP9HjCZ7H+uVgjZKPwLaRSNQJj04IGwFYCt7T32HO2uhj2s/D5/enUxUBitML4cUwIOzO2VlOBZeWrer60kVLlD7yU0EgbAkHjSl0jVEV9mpCy34Qgc03ttVGa04fVsK6Mva7egqzKs/2wIiQquQ1VcA/sOSGArbe1vviS+N9V6wtnpq5qZle+Z8U+steEoPJyqPJac+8spK7Za0LtUncR5h7KKJSy2eOqgqaVaTMXIWV9XA/za/eY0Mr3XlOyXqt7suFxqLz8PSYE1SFz9yGXXqjUC0lCaHoRFvKp3iJ4QF59k+uEk+M0KrSWPY6KlWzwjWcxxbnzrnZNaS8FQtB01YLmr/fvWPv3YMGwp3hXSlboMIx7UooQY2iM3XcIKtNPKRaDrg3X01HX+1BUqpFvR5LQMvHmRGR24SDSYZCUYGP0xvP6lvA0hINSktAcGFPy1hOqsm7ABbzxBGFYbSs+NdkFZIiqX9K3P8BMez3aiarsRya1HuQ73+u3vvO3hOxCXgPI3+ABS501QKJcITM1TYrBSSeIUCXfHVnXaYh7ZkBxqCs5klNzXMmQdil2MpmvYCQUW8AtLEQttGRdp/KEpoka5z8IY4RQerVoprdQAATym3rtLaHNlKFsnFuIUWoiYJZ749mkOx456d37AEQAzXDzBMt9s1xK9z0BqGmVipbedcHL8pnOucu8cN/ZlZU8awt/KxkKrA0QV4T7ChU7rsIMLkKbzTSpmMd9u3dNEDoz5rpp3euGx75UcPu+EXIZ9D1ur/YglCw5uX+EsOh1K7DXHZbsdxN9vDsssalN3KEAnoRUYX8kXIv7Rmh+Wihet8h73iVLye3259w3wkGLuJK+/Ai5/DDQtnCkPSIUtROskwfvC9a9CYkyLw+23By0V4QYHM0PPa5Z9SVUbfrn05YlQxC68y3egZCbS5bV/MlU+TudV93YDzYgRa0vqWpmaYsYoma976VkthA+tgKjbOC+9KE4bYS3Wa+FIphQJR1XDaN1QfCo487FKpBIEWRxRGiLTEehHuZMMCGXdjOgYWSVJx7Vm92ZXakLxrU7vw4MJqRsFpDXBoGzcBUCpGwePSU1quDjGfHyq0v0IaNT/+qtfPCX3LfikZtI0bgxBKKa64JFeUJCp775l6Jw2tQ1Sk+rO56GGDTHXiVr5AipTdjCbyfFCa3iw+t6Qbk5S+3WbmchtkB57K7eKE0o5pX9xz+LFjm3Vy/NU3Ffw38iVnuNKhhkzgKUjAQh44wL/7loWebXl5ehKI+9anq3NXsJBOUz3dtWkyUU+dJsUfM5ZMAIoeo4Ky4xZpQedouiu3dGKIzR5pipwbNwG6GAZPa4FqAgNfO+O/zanv8xU3UTuoW/3qPxtiEqRagw9sV3GUd8rkOtUqtV+J5512r0eEpcnrUIhIqYjWLp9w43w2I2iJ9xc5JDsXFjm1v+M3eaTURClZLhPwPOkEBAXSIiTiWtzKkEniQhsXP0Ia+ZMGYBwsQEYqt+22GuorWRCZeSHQ3AlvoFOxMEmn0PB0NMQmIv4qVZJSjW0U/by+kUj5CvOzOjvtsV3VOgaZ3MCdtiq0Ug5GL/uHXCRqEmL+bg4OFQtgNDEuZo4Y9/3bAdCSz/KVBVtgNDEnLrmsxRZQeVCP0EI1xa1olKqQ/52l9ghX413XPAAIHI6Wc3a30lS0gJoWRWctA7rP28/7TizCZEWotGIVxJ57qcwD2hoUScheHy+WOEp41CSJThbXoBIz4CK/k7kgs3QCMTqoQWvkMDAZ8i04kLwtA5GRcYdV9VkA6hEP3xMlNJL7Rpg9AwrjvUo+hCeoSUqTZp96rGThQOrH5uM9f9HukSLrMgFTY8qD3VIU5rY2UOAHB6IgrIq7pumoRLYerh3UFzgFMktMzqwZ3ie+qSNqG4QIMN+9U6BilsHUX2h5b5z5CIay+idmBMwpXQ9uXJAAZU8o0oFjS0yzaN033JEBKV6FfT0icjWqUiXzEqrWlWXJTw7oQqYWpOIXf31XoR1QH2qFYZSlARDwbIaVyLpBCbRtcwiRE+C3ucfSvXuTXnU/FWFhBgs3hyM3uM3XfPkhShyrhN3un2jpw4B4gYGGWj96UjfOgJPVhyfchNAL5G0qvJdaPp1BGCy6OA51VkM7n3zX8jE2LETXloVIuXMxEdQOMrmBdJjPBJ+O6GtqejxvLCMGhJEYqgAJBxGp+nXHUmh/YkSROK8pe8B0h7dtk6KjtafbVQQg9CuDIVYN0pH7XOu237kH/Vde1xbEme8FUK7dmi3zoua8tDjbqwCtDyxIqzGlADlWatWcvfL+Z33rE+yUiKhGqBKx+q2Bd//zv7fnY+6h208stQ6HzroDe6P/v+ZdK+ooTbZJ4Rd0nJ/wPMoMbCTMwDxQAAAABJRU5ErkJggg==" alt="" width="inherit" height="inherit"></p>`;

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
