import mongoose from 'mongoose';

export const doTransaction = async <T>(
  connection: mongoose.Connection,
  fn: () => T,
) => {
  const session = await connection.startSession();
  try {
    session.startTransaction();
    const result = await fn();
    await session.commitTransaction();
    return result;
  } catch (e) {
    await session.abortTransaction();
    throw e;
  }
};
