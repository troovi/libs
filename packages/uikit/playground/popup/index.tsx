import { RefObject } from "react";
import { Button } from "@/Button";
import { Popover } from "@/Popover";
import { forwardRef } from "react";
import { OptionsList } from "@/OptionItem/OptionsList";
import { OptionItem } from "@/OptionItem/OptionItem";

export const PopupExample = () => {
  const items = new Array(50).fill(0).map((_, i) => `Text string ${i}`);

  return (
    <Popover
      arrows
      placement="bottom"
      content={({ close }) => (
        <div className="flex flex-col">
          <OptionsList maxHeight={300}>
            {items.map((title, i) => (
              <OptionItem key={`popover-item-${i}`} title={title} />
            ))}
          </OptionsList>
        </div>
      )}
    >
      {forwardRef((props, ref) => {
        return (
          <Button {...props} ref={ref as RefObject<HTMLButtonElement>}>
            I{"'"}am: {props["aria-expanded"] ? "opened" : "closed"}
          </Button>
        );
      })}
    </Popover>
  );
};
