function swap<T>(elements: T[], index1: number, index2: number) {
  const temp = elements[index1];
  elements[index1] = elements[index2];
  elements[index2] = temp;
}

/**
 * Moves the items at the given indices one position to the left in the elements array.
 * Indices should be sorted in ascending order for correct behavior.
 */
export function moveOneLeft<T>(elements: T[], indices: number[]) {
  // Sort indices to handle left moves without conflict
  const sorted = [...indices].sort((a, b) => a - b);
  for (const idx of sorted) {
    if (idx > 0 && !sorted.includes(idx - 1)) {
      swap(elements, idx, idx - 1);
    }
  }
}

/**
 * Moves the items at the given indices on position to the left in the elements array.
 * Indices should be sorted in descending order for correct behavior.
 */
export function moveOneRight<T>(elements: T[], indices: number[]) {
  // Sort indices to handle right moves without conflict
  const sorted = [...indices].sort((a, b) => b - a);
  for (const idx of sorted) {
    if (idx < elements.length - 1 && !sorted.includes(idx + 1)) {
      swap(elements, idx, idx + 1);
    }
  }
}

/**
 * Move the items at the given indices on position to the left in the elements array.
 * Indices should be sorted in descending  order for correct behavior.
 */
export function moveAllLeft<T>(elements: T[], indices: number[]) {
  // Sort indices to handle right moves without conflict
  const sorted = [...indices].sort((a, b) => b - a);
  // fix index after move element at idx to head
  let i = 0;
  for (const idx of sorted) {
    const items = elements.splice(idx + i, 1);
    elements.unshift(...items);
    i += 1;
  }
}
export function moveAllRight<T>(elements: T[], indices: number[]) {
  // Sort indices to handle right moves without conflict
  const sorted = [...indices].sort((a, b) => a - b);
  // fix index after move element at idx to tail
  let i = 0;
  
  for (const idx of sorted) {
    const items = elements.splice(idx - i, 1);
    elements.push(...items);
    i += 1;
  }

}
