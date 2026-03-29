import * as React from "react";

import { cn } from "@/lib/utils";

const TooltipContext = React.createContext({
  open: false,
  setOpen: () => {},
});

function TooltipProvider({ children }) {
  return <>{children}</>;
}

function Tooltip({ children }) {
  const [open, setOpen] = React.useState(false);

  return (
    <TooltipContext.Provider value={{ open, setOpen }}>
      <span className="relative inline-flex">{children}</span>
    </TooltipContext.Provider>
  );
}

function TooltipTrigger({ asChild = false, children, ...props }) {
  const { setOpen } = React.useContext(TooltipContext);

  const triggerProps = {
    onMouseEnter: (event) => {
      props.onMouseEnter?.(event);
      setOpen(true);
    },
    onMouseLeave: (event) => {
      props.onMouseLeave?.(event);
      setOpen(false);
    },
    onFocus: (event) => {
      props.onFocus?.(event);
      setOpen(true);
    },
    onBlur: (event) => {
      props.onBlur?.(event);
      setOpen(false);
    },
    ...props,
  };

  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children, {
      ...triggerProps,
      ...children.props,
      onMouseEnter: (event) => {
        children.props.onMouseEnter?.(event);
        triggerProps.onMouseEnter(event);
      },
      onMouseLeave: (event) => {
        children.props.onMouseLeave?.(event);
        triggerProps.onMouseLeave(event);
      },
      onFocus: (event) => {
        children.props.onFocus?.(event);
        triggerProps.onFocus(event);
      },
      onBlur: (event) => {
        children.props.onBlur?.(event);
        triggerProps.onBlur(event);
      },
    });
  }

  return <span {...triggerProps}>{children}</span>;
}

function TooltipContent({
  className,
  side = "top",
  align = "center",
  children,
  ...props
}) {
  const { open } = React.useContext(TooltipContext);

  if (!open) {
    return null;
  }

  const sideClasses = {
    top: "bottom-full left-1/2 -translate-x-1/2 mb-2",
    bottom: "top-full left-1/2 -translate-x-1/2 mt-2",
    left: "right-full top-1/2 -translate-y-1/2 mr-2",
    right: "left-full top-1/2 -translate-y-1/2 ml-2",
  };

  const alignClasses = {
    start:
      side === "top" || side === "bottom"
        ? "left-0 translate-x-0"
        : "top-0 translate-y-0",
    center: "",
    end:
      side === "top" || side === "bottom"
        ? "right-0 translate-x-0 left-auto"
        : "bottom-0 translate-y-0 top-auto",
  };

  return (
    <span
      role="tooltip"
      className={cn(
        "absolute z-50 overflow-hidden rounded-md border bg-popover px-3 py-1.5 text-xs text-popover-foreground shadow-md",
        sideClasses[side],
        alignClasses[align],
        className,
      )}
      {...props}
    >
      {children}
    </span>
  );
}

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider };
