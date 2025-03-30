import * as React from "react";

// Simple utility function to combine class names
function cn(...classes: (string | undefined)[]) {
  return classes.filter(Boolean).join(' ');
}

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {}

const Card = React.forwardRef<HTMLDivElement, CardProps>((props, ref) => {
  const { className, ...rest } = props;
  return (
    <div
      ref={ref}
      className={cn("rounded-lg border bg-card text-card-foreground shadow-sm", className)}
      {...rest}
    />
  );
});

Card.displayName = "Card";

interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {}

const CardHeader = React.forwardRef<HTMLDivElement, CardHeaderProps>((props, ref) => {
  const { className, ...rest } = props;
  return (
    <div
      ref={ref}
      className={cn("flex flex-col space-y-1.5 p-6", className)}
      {...rest}
    />
  );
});

CardHeader.displayName = "CardHeader";

interface CardTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {}

const CardTitle = React.forwardRef<HTMLHeadingElement, CardTitleProps>((props, ref) => {
  const { className, ...rest } = props;
  return (
    <h3
      ref={ref}
      className={cn("text-2xl font-semibold leading-none tracking-tight", className)}
      {...rest}
    />
  );
});

CardTitle.displayName = "CardTitle";

interface CardDescriptionProps extends React.HTMLAttributes<HTMLParagraphElement> {}

const CardDescription = React.forwardRef<HTMLParagraphElement, CardDescriptionProps>((props, ref) => {
  const { className, ...rest } = props;
  return (
    <p
      ref={ref}
      className={cn("text-sm text-muted-foreground", className)}
      {...rest}
    />
  );
});

CardDescription.displayName = "CardDescription";

interface CardContentProps extends React.HTMLAttributes<HTMLDivElement> {}

const CardContent = React.forwardRef<HTMLDivElement, CardContentProps>((props, ref) => {
  const { className, ...rest } = props;
  return (
    <div ref={ref} className={cn("p-6 pt-0", className)} {...rest} />
  );
});

CardContent.displayName = "CardContent";

interface CardFooterProps extends React.HTMLAttributes<HTMLDivElement> {}

const CardFooter = React.forwardRef<HTMLDivElement, CardFooterProps>((props, ref) => {
  const { className, ...rest } = props;
  return (
    <div
      ref={ref}
      className={cn("flex items-center p-6 pt-0", className)}
      {...rest}
    />
  );
});

CardFooter.displayName = "CardFooter";

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent };