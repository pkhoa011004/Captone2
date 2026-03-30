import * as React from "react";

import { cn } from "@/lib/utils";

const RadioGroupContext = React.createContext({
  name: "",
  value: undefined,
  onValueChange: () => {},
});

function RadioGroup({ className, value, onValueChange, children, ...props }) {
  const reactId = React.useId();
  const name = React.useMemo(
    () => `radio-group-${reactId.replace(/[:]/g, "")}`,
    [reactId],
  );

  return (
    <RadioGroupContext.Provider value={{ name, value, onValueChange }}>
      <div
        role="radiogroup"
        data-slot="radio-group"
        className={cn("grid gap-2", className)}
        {...props}
      >
        {children}
      </div>
    </RadioGroupContext.Provider>
  );
}

function RadioGroupItem({ className, value, onChange, ...props }) {
  const ctx = React.useContext(RadioGroupContext);

  const handleChange = (event) => {
    onChange?.(event);
    if (event.target.checked) {
      ctx.onValueChange?.(value);
    }
  };

  return (
    <input
      type="radio"
      role="radio"
      data-slot="radio-group-item"
      name={ctx.name}
      value={value}
      checked={ctx.value === value}
      onChange={handleChange}
      className={cn("size-4", className)}
      {...props}
    />
  );
}

export { RadioGroup, RadioGroupItem };
