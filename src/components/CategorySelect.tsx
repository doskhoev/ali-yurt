"use client";

import * as React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CategoryIcon } from "@/components/CategoryIcon";

type Category = {
  id: string;
  title: string;
  icon_svg?: string | null;
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
              <div className="flex items-center gap-2">
                {category.icon_svg && (
                  <CategoryIcon 
                    svgCode={category.icon_svg} 
                    className="w-4 h-4 text-primary flex-shrink-0"
                  />
                )}
                <span>{category.title}</span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </>
  );
}

