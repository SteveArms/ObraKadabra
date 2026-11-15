"use client";

import { useEffect } from "react";
import { removeElement } from "../edits";
import { useEditorStore } from "../store";
import { toolForKey } from "../tools";

type ShortcutActions = { cancel: () => void; finish: () => void; zoomIn: () => void; zoomOut: () => void; fit: () => void };

function isTyping(target: EventTarget | null): boolean {
  return target instanceof HTMLElement && (target.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName));
}

function undoRedo(event: KeyboardEvent): boolean {
  const { undo, redo } = useEditorStore.getState();
  const key = event.key.toLowerCase();
  if (key === "z") (event.shiftKey ? redo : undo)();
  else if (key === "y") redo();
  else return false;
  return true;
}

// Delete removes the selection; with nothing selected it picks the Delete tool, like the other tool keys
function deleteKey() {
  const { selected, commit, select, setTool } = useEditorStore.getState();
  if (!selected) return setTool("delete");
  commit((plan) => removeElement(plan, selected));
  select(undefined);
}

export function useEditorShortcuts(actions: ShortcutActions) {
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (isTyping(event.target) || document.querySelector("dialog[open]")) return;
      if (event.ctrlKey || event.metaKey) {
        if (undoRedo(event)) event.preventDefault();
        return;
      }
      // Enter only closes a shape being drawn, so it still activates the focused button otherwise
      const drawing = useEditorStore.getState().draft.length > 0;
      const keys: Record<string, (() => void) | undefined> = {
        Escape: actions.cancel,
        Enter: drawing ? actions.finish : undefined,
        Delete: deleteKey,
        Backspace: deleteKey,
        "+": actions.zoomIn,
        "=": actions.zoomIn,
        "-": actions.zoomOut,
        "0": actions.fit,
      };
      const tool = toolForKey(event.key);
      const run = keys[event.key] ?? (tool ? () => useEditorStore.getState().setTool(tool) : undefined);
      if (!run || event.altKey) return;
      event.preventDefault();
      run();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [actions]);
}
