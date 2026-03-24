import * as React from "react";
import { cn } from "@/lib/utils";

/* ================= CARD ROOT ================= */
const Card = React.forwardRef(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        `
        group relative overflow-hidden rounded-2xl border

        bg-white
        text-gray-900
        border-gray-200
        shadow-md

        dark:bg-gradient-to-br
        dark:from-[#020617]
        dark:via-[#020617]
        dark:to-black
        dark:text-white
        dark:border-blue-500/30
        dark:shadow-[0_0_20px_rgba(37,99,235,0.35)]

        transition-all duration-500 ease-out
        hover:scale-[1.04]

        dark:hover:shadow-[0_0_45px_rgba(37,99,235,0.85)]
        dark:hover:border-blue-400

        before:absolute
        before:inset-0
        before:rounded-2xl
        before:pointer-events-none

        dark:before:bg-gradient-to-r
        dark:before:from-transparent
        dark:before:via-blue-500/15
        dark:before:to-transparent
        dark:before:opacity-100

        dark:hover:before:via-blue-400/30
        `,
        className
      )}
      {...props}
    />
  );
});
Card.displayName = "Card";

/* ================= CARD IMAGE ================= */
const CardImage = React.forwardRef(
  (
    {
      className,
      src,
      alt = "Card Image",
      fallbackSrc = "https://res.cloudinary.com/demo/image/upload/sample.jpg",
      ...props
    },
    ref
  ) => {
    const [imgSrc, setImgSrc] = React.useState(src || fallbackSrc);

    React.useEffect(() => {
      setImgSrc(src || fallbackSrc);
    }, [src, fallbackSrc]);

    return (
      <div className="overflow-hidden rounded-t-2xl">
        <img
          ref={ref}
          src={imgSrc}
          alt={alt}
          loading="lazy"
          onError={() => setImgSrc(fallbackSrc)}
          className={cn(
            `
            w-full h-52 object-cover
            transition-all duration-700 ease-out
            group-hover:scale-110
            group-hover:brightness-110
            `,
            className
          )}
          {...props}
        />
      </div>
    );
  }
);
CardImage.displayName = "CardImage";

/* ================= CARD HEADER ================= */
const CardHeader = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col gap-1 p-5 pb-2", className)}
    {...props}
  />
));
CardHeader.displayName = "CardHeader";

/* ================= CARD TITLE ================= */
const CardTitle = React.forwardRef(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      `
      text-lg font-semibold
      text-gray-900
      dark:text-white
      transition-all duration-300
      dark:drop-shadow-[0_0_8px_rgba(37,99,235,0.6)]
      dark:group-hover:text-blue-400
      `,
      className
    )}
    {...props}
  />
));
CardTitle.displayName = "CardTitle";

/* ================= CARD DESCRIPTION ================= */
const CardDescription = React.forwardRef(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn(
      `
      text-sm
      text-gray-600
      dark:text-gray-400
      leading-relaxed
      `,
      className
    )}
    {...props}
  />
));
CardDescription.displayName = "CardDescription";

/* ================= CARD CONTENT ================= */
const CardContent = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      `
      px-5 pb-4 text-sm
      text-gray-700
      dark:text-gray-300
      `,
      className
    )}
    {...props}
  />
));
CardContent.displayName = "CardContent";

/* ================= CARD FOOTER ================= */
const CardFooter = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center justify-between gap-3 p-5 pt-2", className)}
    {...props}
  />
));
CardFooter.displayName = "CardFooter";

/* ================= APPLY BUTTON ================= */
const ApplyButton = React.forwardRef(
  ({ className, children = "Apply Now", ...props }, ref) => (
    <button
      ref={ref}
      className={cn(
        `
        relative overflow-hidden
        rounded-xl
        px-5 py-2
        font-medium text-white
        bg-gradient-to-r from-blue-600 to-blue-500
        shadow-md
        dark:shadow-[0_0_15px_rgba(37,99,235,0.5)]
        transition-all duration-300
        hover:scale-105
        dark:hover:shadow-[0_0_30px_rgba(37,99,235,0.9)]
        active:scale-95

        before:absolute before:inset-0
        before:bg-gradient-to-r before:from-transparent before:via-white/30 before:to-transparent
        before:translate-x-[-100%]
        hover:before:translate-x-[100%]
        before:transition-transform before:duration-700
        `,
        className
      )}
      {...props}
    >
      {children}
    </button>
  )
);
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