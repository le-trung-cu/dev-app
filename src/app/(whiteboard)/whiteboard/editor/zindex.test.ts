import { expect, it } from "vitest";
import { moveOneLeft, moveOneRight, moveAllLeft, moveAllRight } from "./zindex";

function expectMove<T>(
  fn: (elements: T[], indicesToMove: number[]) => void,
  elems: T[],
  indices: number[],
  equal: T[]
) {
  fn(elems, indices);
  expect(elems).toEqual(equal);
}

it("should moveOneLeft", () => {
  expectMove(moveOneLeft, ["a", "b", "c", "d"], [], ["a", "b", "c", "d"]);
  expectMove(moveOneLeft, ["a", "b", "c", "d"], [0], ["a", "b", "c", "d"]);
  expectMove(
    moveOneLeft,
    ["a", "b", "c", "d"],
    [0, 1, 2, 3],
    ["a", "b", "c", "d"]
  );
  expectMove(moveOneLeft, ["a", "b", "c", "d"], [1], ["b", "a", "c", "d"]);
  expectMove(moveOneLeft, ["a", "b", "c", "d"], [1, 3], ["b", "a", "d", "c"]);
});

it("should moveOneRight", () => {
  expectMove(moveOneRight, ["a", "b", "c", "d"], [], ["a", "b", "c", "d"]);
  expectMove(moveOneRight, ["a", "b", "c", "d"], [3], ["a", "b", "c", "d"]);
  expectMove(
    moveOneRight,
    ["a", "b", "c", "d"],
    [0, 1, 2, 3],
    ["a", "b", "c", "d"]
  );
  expectMove(moveOneRight, ["a", "b", "c", "d"], [1], ["a", "c", "b", "d"]);
  expectMove(moveOneRight, ["a", "b", "c", "d"], [1, 3], ["a", "c", "b", "d"]);
});

it("should moveAllLeft", () => {
  expectMove(moveAllLeft, ["a", "b", "c", "d"], [], ["a", "b", "c", "d"]);
  expectMove(moveAllLeft, ["a", "b", "c", "d"], [0], ["a", "b", "c", "d"]);
  expectMove(
    moveAllLeft,
    ["a", "b", "c", "d"],
    [0, 1, 2, 3],
    ["a", "b", "c", "d"]
  );
  expectMove(moveAllLeft, ["a", "b", "c", "d"], [1], ["b", "a", "c", "d"]);
  expectMove(moveAllLeft, ["a", "b", "c", "d"], [2], ["c", "a", "b", "d"]);
  expectMove(moveAllLeft, ["a", "b", "c", "d"], [1, 3], ["b", "d", "a", "c"]);
});

it("should moveAllRight", () => {
  expectMove(moveAllRight, ["a", "b", "c", "d"], [], ["a", "b", "c", "d"]);
  expectMove(moveAllRight, ["a", "b", "c", "d"], [3], ["a", "b", "c", "d"]);
  expectMove(
    moveAllRight,
    ["a", "b", "c", "d"],
    [0, 1, 2, 3],
    ["a", "b", "c", "d"]
  );
  expectMove(moveAllRight, ["a", "b", "c", "d"], [1], ["a", "c", "d", "b"]);
  expectMove(moveAllRight, ["a", "b", "c", "d"], [2], ["a", "b", "d", "c"]);
  expectMove(moveAllRight, ["a", "b", "c", "d"], [1, 2], ["a", "d", "b", "c"]);
});
