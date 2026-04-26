import * as React from 'react';
import {
  Controller,
  FormProvider,
  useFormContext,
  type ControllerProps,
  type FieldPath,
  type FieldValues,
} from 'react-hook-form';
import { Slot } from 'radix-ui';
import { cn } from '@/lib/utils';

/* ── Form (= FormProvider) ────────────────────────────────────────── */
const Form = FormProvider;

/* ── Context ──────────────────────────────────────────────────────── */
type FormFieldContextValue<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> = { name: TName };

const FormFieldContext = React.createContext<FormFieldContextValue>(
  {} as FormFieldContextValue,
);

type FormItemContextValue = { id: string };
const FormItemContext = React.createContext<FormItemContextValue>(
  {} as FormItemContextValue,
);

/* ── useFormField ─────────────────────────────────────────────────── */
function useFormField() {
  const fieldContext = React.useContext(FormFieldContext);
  const itemContext  = React.useContext(FormItemContext);
  const { getFieldState, formState } = useFormContext();

  const fieldState = getFieldState(fieldContext.name, formState);
  if (!fieldContext.name)
    throw new Error('useFormField must be used inside <FormField>');

  const { id } = itemContext;
  return {
    id,
    name: fieldContext.name,
    formItemId: `${id}-form-item`,
    formMessageId: `${id}-form-item-message`,
    ...fieldState,
  };
}

/* ── FormField ────────────────────────────────────────────────────── */
function FormField<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({ ...props }: ControllerProps<TFieldValues, TName>) {
  return (
    <FormFieldContext.Provider value={{ name: props.name }}>
      <Controller {...props} />
    </FormFieldContext.Provider>
  );
}

/* ── FormItem ─────────────────────────────────────────────────────── */
const FormItem = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  const id = React.useId();
  return (
    <FormItemContext.Provider value={{ id }}>
      <div ref={ref} className={cn('space-y-1.5', className)} {...props} />
    </FormItemContext.Provider>
  );
});
FormItem.displayName = 'FormItem';

/* ── FormLabel ────────────────────────────────────────────────────── */
const FormLabel = React.forwardRef<
  HTMLLabelElement,
  React.LabelHTMLAttributes<HTMLLabelElement> & { required?: boolean }
>(({ className, required, children, ...props }, ref) => {
  const { error, formItemId } = useFormField();
  return (
    <label
      ref={ref}
      htmlFor={formItemId}
      className={cn(
        'flex items-center gap-1 text-[13px] font-medium text-[var(--foreground)]',
        error && 'text-[var(--destructive)]',
        className,
      )}
      {...props}
    >
      {children}
      {required && <span className="text-[var(--primary)]">*</span>}
    </label>
  );
});
FormLabel.displayName = 'FormLabel';

/* ── FormControl ──────────────────────────────────────────────────── */
const FormControl = React.forwardRef<
  React.ElementRef<typeof Slot.Root>,
  React.ComponentPropsWithoutRef<typeof Slot.Root>
>(({ ...props }, ref) => {
  const { error, formItemId, formMessageId } = useFormField();
  return (
    <Slot.Root
      ref={ref}
      id={formItemId}
      aria-invalid={!!error}
      aria-describedby={error ? formMessageId : undefined}
      {...props}
    />
  );
});
FormControl.displayName = 'FormControl';

/* ── FormMessage ──────────────────────────────────────────────────── */
const FormMessage = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, children, ...props }, ref) => {
  const { error, formMessageId } = useFormField();
  const body = error ? String(error.message) : children;
  if (!body) return null;
  return (
    <p
      ref={ref}
      id={formMessageId}
      className={cn('text-[12px] text-[var(--destructive)]', className)}
      {...props}
    >
      {body}
    </p>
  );
});
FormMessage.displayName = 'FormMessage';

export { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, useFormField };
