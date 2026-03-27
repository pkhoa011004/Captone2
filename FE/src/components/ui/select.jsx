import * as React from "react";

import { cn } from "@/lib/utils";

const SelectContext = React.createContext(null);

function walkChildren(children, visit) {
  React.Children.forEach(children, (child) => {
    if (!React.isValidElement(child)) return;
    visit(child);
    if (child.props?.children) {
      walkChildren(child.props.children, visit);
    }
  });
}

function Select({ children, value, defaultValue = "", onValueChange }) {
  const [internalValue, setInternalValue] = React.useState(defaultValue);
  const isControlled = value !== undefined;
  const currentValue = isControlled ? value : internalValue;

  const options = [];
  let placeholder = "";

  walkChildren(children, (child) => {
    const displayName = child.type?.displayName;
    if (displayName === "SelectItem") {
      options.push({ value: child.props.value, label: child.props.children });
    }
    if (displayName === "SelectValue" && child.props.placeholder) {
      placeholder = child.props.placeholder;
    }
  });

  const handleChange = (nextValue) => {
    if (!isControlled) {
      setInternalValue(nextValue);
    }
    onValueChange?.(nextValue);
  };

  return (
    <SelectContext.Provider
      value={{ currentValue, handleChange, options, placeholder }}
    >
      <div data-slot="select">{children}</div>
    </SelectContext.Provider>
  );
}

function SelectTrigger({ className, ...props }) {
  const ctx = React.useContext(SelectContext);

  if (!ctx) return null;

  return (
    <select
      data-slot="select-trigger"
      className={cn(
        "flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm",
        className,
      )}
      value={ctx.currentValue}
      onChange={(e) => ctx.handleChange(e.target.value)}
      {...props}
    >
      {ctx.placeholder ? (
        <option value="" disabled>
          {ctx.placeholder}
        </option>
      ) : null}
      {ctx.options.map((opt) => (
        <option key={String(opt.value)} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  );
}

function SelectValue() {
  return null;
}

function SelectContent() {
  return null;
}

function SelectItem() {
  return null;
}

SelectTrigger.displayName = "SelectTrigger";
SelectValue.displayName = "SelectValue";
SelectContent.displayName = "SelectContent";
SelectItem.displayName = "SelectItem";

export { Select, SelectTrigger, SelectValue, SelectContent, SelectItem };
