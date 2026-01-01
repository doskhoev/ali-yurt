"use client";

import * as React from "react";
import { Checkbox } from "@/components/ui/checkbox";

type FormCheckboxProps = {
  id: string;
  name: string;
  value?: string;
  defaultChecked?: boolean;
};

export function FormCheckbox({
  id,
  name,
  value = "1",
  defaultChecked = false,
  ...props
}: FormCheckboxProps) {
  const [checked, setChecked] = React.useState(defaultChecked);

  return (
    <>
      <Checkbox
        id={id}
        checked={checked}
        onCheckedChange={(isChecked) => setChecked(isChecked === true)}
        {...props}
      />
      <input
        type="hidden"
        name={name}
        value={checked ? value : ""}
      />
    </>
  );
}

