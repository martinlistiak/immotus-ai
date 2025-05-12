export const Spinner = ({ size = 16 }: { size?: number }) => {
  return (
    <div
      style={{
        width: `${size}px`,
        height: `${size}px`,
      }}
      className="animate-spin rounded-full border-t-2 border-b-2 border-gray-600 dark:border-white"
    ></div>
  );
};
