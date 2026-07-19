import type { ReactNode, HTMLAttributes } from "react";
import { cx } from "@/lib/utils";

interface CardProps extends HTMLAttributes<HTMLElement> {
  title?: string;
  variant?: "default" | "elevated" | "bordered";
  children: ReactNode;
}

export function Card({
  title,
  variant = "default",
  className,
  children,
  ...props
}: CardProps) {
  return (
    <section
      className={cx("ui-card", variant !== "default" && `card-${variant}`, className)}
      {...props}
    >
      {title && <h3>{title}</h3>}
      {children}
    </section>
  );
}
