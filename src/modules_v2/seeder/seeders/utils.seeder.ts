export const ignoreErrors = async (fn: () => unknown) => {
  try {
    await fn();
  } catch (e) {
    // ignore
  }
};
