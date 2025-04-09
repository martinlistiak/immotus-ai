export const Card = ({
  children,
  className,
  onClick,
  ...props
}: {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
} & React.HTMLAttributes<HTMLDivElement>) => {
  return (
    <div
      onClick={onClick}
      className={`bg-[#131418] rounded-xl p-4 border border-[#3e3f45] text-[#9e9e9e] font-light ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};
