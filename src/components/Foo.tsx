import React, { FC, useState } from "react"

export const Foo: FC = (_props: { initialValue: number | null }) => {
  const [index, setIndex] = useState(_props.initialValue ?? 0);
  return (
    <button onClick={() => { setIndex(index + 1) }}>
      <h1>Count: {index}</h1>
    </button>
  )
}
