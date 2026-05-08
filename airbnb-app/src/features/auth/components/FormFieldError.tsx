import React from 'react';

interface Props {
  error?: string;
  touched?: boolean;
}

const FormFieldError: React.FC<Props> = ({
  error,
  touched,
}) => {
  if (!error || !touched) return null;

  return (
    <p className="text-sm text-red-500 font-medium mt-1">
      {error}
    </p>
  );
};

export default FormFieldError;
