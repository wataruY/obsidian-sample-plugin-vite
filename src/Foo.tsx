import React, { FC, useEffect, useRef, useState } from "react";
import { Button } from '@/components/ui/button'
import { ButtonGroup } from '@/components/ui/button-group'
import { PlusIcon } from "lucide-react";
import { Textarea } from '@/components/ui/textarea'


export const Foo: FC = (_props: { initialValue: number | null }) => {
  const [index, setIndex] = useState(_props.initialValue ?? 0);
  const buttonRef = useRef<HTMLButtonElement>(null)
  useEffect(() => {
    buttonRef.current?.focus();

    return () => console.log("executed!!")
  }, []);

  return (
    <div>
      <ButtonGroup>
        <Button variant="outline" size="sm">
          Small
        </Button>
        <Button variant="ghost" size="sm">
          Button2
        </Button>
        <Button variant="outline" size="sm">
          Group
        </Button>
        <Button variant="outline" size="icon-sm">
          <PlusIcon />
        </Button>
      </ButtonGroup>
      <Textarea placeholder="hogehoge" aria-multiline={true} />
    </div>);
};
