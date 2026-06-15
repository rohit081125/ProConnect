import * as React from "react";
import { cn } from "@/lib/utils";

const Card = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "rounded-lg border border-border bg-card text-card-foreground shadow-sm transition-colors",
      className
    )}
    {...props}
  />
));
Card.displayName = "Card";

const CardImage = React.forwardRef(
  (
    {
      className,
      src,
      alt = "Card image",
      fallbackSrc = "https://images.unsplash.com/photo-1551434678-e076c223a692?auto=format&fit=crop&w=1200&q=80",
      ...props
    },
    ref
  ) => {
    const [imgSrc, setImgSrc] = React.useState(src || fallbackSrc);

    React.useEffect(() => {
      setImgSrc(src || fallbackSrc);
    }, [src, fallbackSrc]);

    return (
      <div className="overflow-hidden rounded-t-lg bg-muted">
        <img
          ref={ref}
          src={imgSrc}
          alt={alt}
          loading="lazy"
          onError={() => setImgSrc(fallbackSrc)}
          className={cn("h-48 w-full object-cover transition duration-300", className)}
          {...props}
        />
      </div>
    );
  }
);
CardImage.displayName = "CardImage";

const CardHeader = React.forwardRef(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("flex flex-col gap-1.5 p-5", className)} {...props} />
));
CardHeader.displayName = "CardHeader";

const CardTitle = React.forwardRef(({ className, ...props }, ref) => (
  <h3 ref={ref} className={cn("font-semibold leading-none tracking-tight", className)} {...props} />
));
CardTitle.displayName = "CardTitle";

const CardDescription = React.forwardRef(({ className, ...props }, ref) => (
  <p ref={ref} className={cn("text-sm text-muted-foreground", className)} {...props} />
));
CardDescription.displayName = "CardDescription";

const CardContent = React.forwardRef(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-5 pt-0", className)} {...props} />
));
CardContent.displayName = "CardContent";

const CardFooter = React.forwardRef(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("flex items-center p-5 pt-0", className)} {...props} />
));
CardFooter.displayName = "CardFooter";

const ApplyButton = React.forwardRef(({ className, children = "Apply", ...props }, ref) => (
  <button
    ref={ref}
    className={cn(
      "inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm transition hover:bg-primary/90 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50",
      className
    )}
    {...props}
  >
    {children}
  </button>
));
ApplyButton.displayName = "ApplyButton";

export {
  Card,
  CardImage,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  ApplyButton,
};
