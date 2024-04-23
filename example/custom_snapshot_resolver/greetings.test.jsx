import renderer from "react-test-renderer";
const { it, expect } = await import("vitest");
import Greetings from "./greetings";

it("renders correctly", () => {
  const tree = renderer.create(<Greetings name="World" />).toJSON();
  expect(tree).toMatchSnapshot();
});
