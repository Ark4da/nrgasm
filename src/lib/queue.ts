/**
 * Runs async jobs one after another per key, in the order they were added.
 * Two quick clicks on the same can then reach the database in the order
 * they were made, so the last click is what stays. Different keys do not wait
 * for each other, and a failed job does not block the next one for its key.
 */
export function createWriteQueue(): (key: string, job: () => Promise<void>) => Promise<void> {
  const tails = new Map<string, Promise<void>>();

  return (key, job) => {
    const previous = tails.get(key) ?? Promise.resolve();
    const run = previous.then(job);
    // The stored tail swallows errors; the caller still gets the rejection from `run`
    const tail = run.catch(() => {});
    tails.set(key, tail);
    void tail.then(() => {
      if (tails.get(key) === tail) {
        tails.delete(key);
      }
    });
    return run;
  };
}
