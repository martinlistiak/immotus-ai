import cn from "classnames";

export const Input = ({
  className,
  prefix,
  suffix,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & {
  prefix?: React.ReactNode;
  suffix?: React.ReactNode;
}) => {
  return (
    <div className="relative">
      {prefix && (
        <div className="absolute left-1 top-1/2 -translate-y-1/2 pointer-events-none text-[11px] text-active-hover">
          {prefix}
        </div>
      )}
      <input
        className={cn(
          className,
          "w-full text-right outline-none bg-gray-900 rounded-md px-2 py-1 hover:bg-gray-800",
          {
            "pl-6": prefix,
            "pr-8": suffix,
          }
        )}
        {...props}
        type={props.type === "number" ? "text" : props.type}
      />
      {suffix && (
        <div className="absolute right-1 top-1/2 -translate-y-1/2 pointer-events-none text-[11px] text-active-hover">
          {suffix}
        </div>
      )}
    </div>
  );
};
