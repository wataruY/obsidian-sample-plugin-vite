import React, { FC, useEffect, useRef, useState } from "react";

export const Foo: FC = (_props: { initialValue: number | null }) => {
  const [index, setIndex] = useState(_props.initialValue ?? 0);
  const buttonRef = useRef<HTMLButtonElement>(null)
  useEffect(() => {
    buttonRef.current?.focus();

    return () => console.log("executed!!")
  }, []);

  return (
    <button
      ref={buttonRef}
      onClick={() => {
        setIndex(index + 1);
      }}
    >
      <h1>Count: {index}</h1>
    </button>
  );
};
