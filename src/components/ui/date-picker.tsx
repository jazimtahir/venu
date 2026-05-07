"use client";

import * as React from "react";
import { format, parse, isValid } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

const DATE_FORMAT = "yyyy-MM-dd";

function formatDisplayDate(value: string): string {
  if (!value) return "";
  const d = parse(value, DATE_FORMAT, new Date());
  return isValid(d) ? format(d, "PPP") : value;
}

export interface DatePickerProps {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  required?: boolean;
  /** Min date as YYYY-MM-DD */
  min?: string;
  /** Max date as YYYY-MM-DD */
  max?: string;
}

export function DatePicker({
  id,
  value,
  onChange,
  placeholder = "Pick a date",
  className,
  disabled,
  required,
  min,
  max,
}: DatePickerProps) {
  const [open, setOpen] = React.useState(false);
  const date = value ? parse(value, DATE_FORMAT, new Date()) : undefined;
  const validDate = date && isValid(date) ? date : undefined;

  const handleSelect = (d: Date | undefined) => {
    if (!d) {
      onChange("");
      return;
    }
    onChange(format(d, DATE_FORMAT));
    setOpen(false);
  };

  const disabledMatcher = React.useMemo(() => {
    if (!min && !max) return undefined;
    return (d: Date) => {
      if (min) {
        const minDate = parse(min, DATE_FORMAT, new Date());
        if (d < minDate) return true;
      }
      if (max) {
        const maxDate = parse(max, DATE_FORMAT, new Date());
        if (d > maxDate) return true;
      }
      return false;
    };
  }, [min, max]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          id={id}
          variant="outline"
          disabled={disabled}
          type="button"
          data-empty={!value}
          className={cn(
            "h-9 w-full justify-between text-left font-normal transition-all duration-200",
            "border border-border bg-card shadow-[var(--shadow-soft)]",
            "hover:bg-card focus-visible:ring-2 focus-visible:ring-ring focus-visible:border-brand",
            "data-[empty=true]:text-muted-foreground",
            "disabled:cursor-not-allowed disabled:opacity-50",
            className
          )}
        >
          <span>{value ? formatDisplayDate(value) : placeholder}</span>
          <CalendarIcon className="size-4 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0 border border-border shadow-[var(--shadow-card)]" align="start">
        <Calendar
          mode="single"
          selected={validDate}
          onSelect={handleSelect}
          defaultMonth={validDate}
          disabled={disabledMatcher}
          captionLayout="dropdown"
        />
      </PopoverContent>
    </Popover>
  );
}
