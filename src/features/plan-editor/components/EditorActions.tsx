"use client";

import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Icon } from "@/components/ui/Icon";
import { formatCount } from "@/lib/format";
import type { Project } from "@/schemas/project";
import { useEditorSave } from "../hooks/useEditorSave";
import { ShortcutsDialog } from "./ShortcutsDialog";

export function EditorActions({ project, pendingCount }: { project: Project; pendingCount: number }) {
  const save = useEditorSave(project);
  return (
    <div className="flex flex-col items-end gap-1">
      <div className="flex flex-wrap items-center justify-end gap-space-xs">
        <Button variant="ghost" onClick={save.requestDiscard}>
          Discard
        </Button>
        <ShortcutsDialog />
        <Button variant="milestone" className="font-semibold" onClick={save.requestBuild} disabled={save.saving}>
          <Icon name="auto_awesome" size={18} />
          Looks good, build in 3D
        </Button>
      </div>
      {save.error ? (
        <p role="alert" className="text-body-sm text-error">
          {save.error}
        </p>
      ) : null}
      <ConfirmDialog
        open={save.dialog === "build"}
        title={`Build in 3D with ${formatCount(pendingCount, "unconfirmed element", "unconfirmed elements")}?`}
        confirmLabel="Build in 3D"
        cancelLabel="Keep reviewing"
        confirmVariant="milestone"
        onConfirm={() => void save.build()}
        onCancel={save.closeDialog}
        testId="confirm-build"
      >
        The AI was unsure about them. They will be built as detected, and you can come back to the editor at any time.
      </ConfirmDialog>
      <ConfirmDialog
        open={save.dialog === "discard"}
        title="Discard your corrections?"
        confirmLabel="Discard corrections"
        cancelLabel="Keep editing"
        onConfirm={save.discard}
        onCancel={save.closeDialog}
        testId="confirm-discard"
      >
        Everything you changed since opening the editor will be lost. The project stays as it was saved.
      </ConfirmDialog>
    </div>
  );
}
