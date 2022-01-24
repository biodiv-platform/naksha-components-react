export const ACTION_TYPES = {
  ADD: "add",
  CLEAR: "clear",
  REPLACE: "replace",
};

export function featuresReducer(
  state,
  { action, data, isMultiple }: { action: string; data?; isMultiple? }
) {
  switch (action) {
    case ACTION_TYPES.ADD:
      return isMultiple ? [...(state || []), data] : [data];

    case ACTION_TYPES.CLEAR:
      return [];

    case ACTION_TYPES.REPLACE:
      return data;

    default:
      return state;
  }
}
