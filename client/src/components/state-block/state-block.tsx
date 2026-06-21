type StateBlockProps = {
  title: string;
  message: string;
};

export function StateBlock({ title, message }: StateBlockProps) {
  return (
    <div className="state-block" role="status">
      <h2>{title}</h2>
      <p>{message}</p>
    </div>
  );
}
