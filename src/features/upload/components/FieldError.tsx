import { Icon } from "@/components/ui/Icon";

export function FieldError({ id, message }: { id: string; message?: string }) {
  return (
    <p id={id} className="flex items-center gap-1 text-body-sm text-error empty:hidden">
      {message ? (
        <>
          <Icon name="error" size={16} />
          {message}
        </>
      ) : null}
    </p>
  );
}
