import { Test1Animation } from "./animation-test-1";
import { Test2Animation, Test2CompletedAnimation } from "./animation-test-2";
import { ButtonsExample } from "./buttons";
import { SelectExample } from "./select";
import { PopupExample } from "./popup";
import { TextInput } from "./text-input";
import { NumberInputs } from "./number-inputs";

export const App = () => {
  return (
    <div className="examples-list">
      <div style={{ height: "200px", width: "100%", position: "relative" }}>
        <div className="row-group" style={{ position: "absolute" }}>
          <Test1Animation />
          <Test2Animation />
          <Test2CompletedAnimation />
        </div>
      </div>
      <ButtonsExample />
      <SelectExample />
      <PopupExample />
      <TextInput />
      <NumberInputs />
    </div>
  );
};
