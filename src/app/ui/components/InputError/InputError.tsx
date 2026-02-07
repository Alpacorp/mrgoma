
const InputError = ({message}: {message: string | undefined}) => {
  return (
    <p className="text-sm text-red-700 mt-2 mb-2">
      {message}
    </p>
  );
}

export default InputError