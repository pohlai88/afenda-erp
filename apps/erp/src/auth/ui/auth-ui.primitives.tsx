import { Alert, AlertDescription } from "@afenda/ui/alert";
import { Button } from "@afenda/ui/button";
import { Checkbox } from "@afenda/ui/checkbox";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldTitle,
} from "@afenda/ui/field";
import { Input } from "@afenda/ui/input";
import { Separator } from "@afenda/ui/separator";
import { uiStatusToneClasses } from "@afenda/ui/design-system";
import { cn } from "@afenda/ui/utils";
import Link from "next/link";
import {
  cloneElement,
  isValidElement,
  type ComponentProps,
  type ReactElement,
  type ReactNode,
} from "react";

export function AuthFormHeader({
  title,
  description,
  badge,
}: {
  title: string;
  description: string;
  badge?: string;
}) {
  return (
    <header className="flex flex-col gap-surface-md border-b border-line pb-surface-lg">
      {badge ? (
        <p className="type-label text-muted-foreground">{badge}</p>
      ) : null}
      <div className="flex flex-col gap-surface-sm">
        <h2 className="type-section-title font-semibold text-foreground">
          {title}
        </h2>
        <p className="type-muted leading-6">{description}</p>
      </div>
    </header>
  );
}

export function AuthFormBody({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <div
      className={cn("flex flex-col gap-surface-lg pt-surface-lg", className)}
    >
      {children}
    </div>
  );
}

export function AuthFieldGroup({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <FieldGroup className={cn("gap-surface-lg", className)}>
      {children}
    </FieldGroup>
  );
}

export function AuthField({
  id,
  label,
  hint,
  error,
  children,
}: {
  id: string;
  label: string;
  hint?: string;
  error?: string | null;
  children: ReactNode;
}) {
  const errorId = error ? `${id}-error` : undefined;
  const hintId = hint ? `${id}-hint` : undefined;
  const describedBy = [hintId, errorId].filter(Boolean).join(" ") || undefined;
  const control = isValidElement(children)
    ? cloneElement(children as ReactElement<Record<string, unknown>>, {
        "aria-describedby": describedBy,
        "aria-invalid": error ? true : undefined,
      })
    : children;

  return (
    <Field data-invalid={error ? true : undefined} className="gap-surface-sm">
      <FieldLabel className="type-control" htmlFor={id}>
        {label}
      </FieldLabel>
      {control}
      {hint ? (
        <FieldDescription className="type-caption" id={hintId}>
          {hint}
        </FieldDescription>
      ) : null}
      {error ? (
        <FieldError className="type-caption" id={errorId}>
          {error}
        </FieldError>
      ) : null}
    </Field>
  );
}

export function AuthCheckboxField({
  id,
  label,
  description,
  className,
  ...props
}: ComponentProps<typeof Checkbox> & {
  id: string;
  label: string;
  description?: string;
}) {
  return (
    <Field className={cn("gap-3", className)} orientation="horizontal">
      <Checkbox id={id} {...props} />
      <FieldContent>
        <FieldLabel htmlFor={id}>
          <FieldTitle>{label}</FieldTitle>
        </FieldLabel>
        {description ? (
          <FieldDescription>{description}</FieldDescription>
        ) : null}
      </FieldContent>
    </Field>
  );
}

export function AuthInput(props: ComponentProps<typeof Input>) {
  return (
    <Input
      className={cn(
        "h-11 border-line bg-background shadow-none transition-[box-shadow,border-color] focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-focus-ring",
        props.className,
      )}
      {...props}
    />
  );
}

export function AuthNotice({
  tone = "info",
  children,
}: {
  tone?: "info" | "success" | "error";
  children: ReactNode;
}) {
  if (tone === "error") {
    return (
      <Alert variant="destructive" aria-live="polite">
        <AlertDescription>{children}</AlertDescription>
      </Alert>
    );
  }

  if (tone === "success") {
    return (
      <Alert
        aria-live="polite"
        className={cn("border-transparent", uiStatusToneClasses.success)}
      >
        <AlertDescription>{children}</AlertDescription>
      </Alert>
    );
  }

  return (
    <Alert aria-live="polite" className={uiStatusToneClasses.info}>
      <AlertDescription>{children}</AlertDescription>
    </Alert>
  );
}

export function AuthDivider({ label = "or" }: { label?: string }) {
  return (
    <div className="relative py-1">
      <div className="absolute inset-0 flex items-center" aria-hidden="true">
        <Separator className="w-full" />
      </div>
      <div className="relative flex justify-center">
        <span className="bg-surface-raised px-3 type-label text-muted-foreground">
          {label}
        </span>
      </div>
    </div>
  );
}

export function AuthInlineLink({
  href,
  children,
}: {
  href: string;
  children: ReactNode;
}) {
  return (
    <Button asChild className="h-auto p-0" variant="link">
      <Link href={href}>{children}</Link>
    </Button>
  );
}

export function AuthPrimaryButton({
  className,
  ...props
}: ComponentProps<typeof Button>) {
  return (
    <Button
      className={cn("min-h-11 w-full shadow-elevation-1", className)}
      {...props}
    />
  );
}

export function AuthSecondaryButton({
  className,
  ...props
}: ComponentProps<typeof Button>) {
  return (
    <Button
      className={cn(
        "min-h-11 w-full border-line bg-background text-foreground",
        className,
      )}
      variant="outline"
      {...props}
    />
  );
}

export function GoogleMark() {
  return (
    <svg aria-hidden="true" className="h-4 w-4" viewBox="0 0 24 24">
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  );
}
