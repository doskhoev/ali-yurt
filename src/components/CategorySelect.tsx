"use client";

import * as React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type Category = {
  id: string;
  title: string;
};

type CategorySelectProps = {
  name: string;
  categories: Category[];
  defaultValue?: string;
  required?: boolean;
  placeholder?: string;
};

export function CategorySelect({
  name,
  categories,
  defaultValue = "",
  required = false,
  placeholder = "Выберите категорию…",
}: CategorySelectProps) {
  const [value, setValue] = React.useState(defaultValue);

  return (
    <>
      <input type="hidden" name={name} value={value} required={required} />
      <Select value={value} onValueChange={setValue} required={required}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {categories.map((category) => (
            <SelectItem key={category.id} value={category.id}>
              {category.title}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </>
  );
}

