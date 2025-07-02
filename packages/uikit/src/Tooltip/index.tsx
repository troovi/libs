import * as React from "react";

import * as Headless from "@headlessui/react";
import { HoverTrap } from "./HoverTrap";
import { AnchorTo } from "../Popover";

interface TooltipProps {
  children: (props: { "aria-expanded": boolean }) => React.ReactNode;
  content: ({ close }: { close: () => void }) => React.ReactNode;
  placement?: AnchorTo;
  onOpenChange?: (open: boolean) => void;
}

export const Tooltip = ({
  children,
  onOpenChange,
  content,
  placement,
}: TooltipProps) => {
  return (
    <Headless.Popover>
      {({ open, close }) => {
        onOpenChange?.(open);

        return (
          <>
            <HoverTrap
              isOpen={open}
              close={close}
              debounce={100}
              children={children as () => JSX.Element}
            />
            <Headless.PopoverPanel anchor={{ to: placement, gap: "11px" }}>
              <div className="popover-arrow" />
              {content({ close })}
            </Headless.PopoverPanel>
          </>
        );
      }}
    </Headless.Popover>
  );
};
