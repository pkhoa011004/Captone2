import * as React from "react";

import { cn } from "@/lib/utils";

const TabsContext = React.createContext({
  value: "",
  setValue: () => {},
});

function Tabs({
  className,
  defaultValue,
  value,
  onValueChange,
  children,
  ...props
}) {
  const [internalValue, setInternalValue] = React.useState(defaultValue ?? "");
  const isControlled = value !== undefined;
  const currentValue = isControlled ? value : internalValue;

  const setValue = (nextValue) => {
    if (!isControlled) {
      setInternalValue(nextValue);
    }
    onValueChange?.(nextValue);
  };

  return (
    <TabsContext.Provider value={{ value: currentValue, setValue }}>
      <div
        data-slot="tabs"
        className={cn("flex flex-col gap-2", className)}
        {...props}
      >
        {children}
      </div>
    </TabsContext.Provider>
  );
}

function TabsList({ className, ...props }) {
  return (
    <div
      data-slot="tabs-list"
      role="tablist"
      className={cn(
        "inline-flex items-center justify-center rounded-md p-1",
        className,
      )}
      {...props}
    />
  );
}

function TabsTrigger({ className, value, onClick, children, ...props }) {
  const ctx = React.useContext(TabsContext);
  const isActive = ctx.value === value;

  return (
    <button
      data-slot="tabs-trigger"
      role="tab"
      type="button"
      data-state={isActive ? "active" : "inactive"}
      aria-selected={isActive}
      onClick={(event) => {
        onClick?.(event);
        ctx.setValue(value);
      }}
      className={cn(
        "inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium transition-all",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}

function TabsContent({ className, value, ...props }) {
  const ctx = React.useContext(TabsContext);
  const isActive = ctx.value === value;

  if (!isActive) {
    return null;
  }

  return (
    <div
      data-slot="tabs-content"
      role="tabpanel"
      data-state="active"
      className={cn("outline-none", className)}
      {...props}
    />
  );
}

export { Tabs, TabsList, TabsTrigger, TabsContent };
