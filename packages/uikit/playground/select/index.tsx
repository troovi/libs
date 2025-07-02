import { useState } from "react";
import { Select } from "@/Select";
import { Settings } from "@blueprintjs/icons";

export const SelectExample = () => {
  const [value, onChange] = useState<null | number>(null);

  return (
    <div>
      <Select<number>
        value={value}
        onChange={onChange}
        icon={<Settings />}
        options={[
          { value: 1, title: "Vladimir Putin" },
          { value: 2, title: "Donald Trump" },
          { value: 3, title: "Sergey Lavrov" },
          ...new Array(10)
            .fill(0)
            .map((_, i) => ({ title: `Value ${i + 4}`, value: i + 4 })),
        ]}
      />
    </div>
  );
};
