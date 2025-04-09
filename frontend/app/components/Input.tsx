export const Input = ({
  className,
  prefix,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & {
  prefix?: React.ReactNode;
}) => {
  return (
    <div className="relative">
      {prefix && (
        <div className="absolute left-1 top-1/2 -translate-y-1/2 pointer-events-none text-[11px] text-active-hover">
          {prefix}
        </div>
      )}
      <input
        className={`${className} w-full text-right outline-none bg-gray-900 rounded-md px-2 py-1 hover:bg-gray-800`}
        {...props}
        type={props.type === "number" ? "text" : props.type}
      />
    </div>
  );
};
