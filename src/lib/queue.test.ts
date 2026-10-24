import { describe, expect, it } from 'vitest';
import { createWriteQueue } from './queue';

const wait = (ms: number) => new Promise<void>((done) => setTimeout(done, ms));

describe('createWriteQueue', () => {
  it('runs jobs for one key in call order', async () => {
    const run = createWriteQueue();
    const log: string[] = [];
    const slow = async () => {
      await wait(20);
      log.push('first');
    };
    const fast = async () => {
      log.push('second');
    };
    await Promise.all([run('mango-loco', slow), run('mango-loco', fast)]);
    expect(log).toEqual(['first', 'second']);
  });

  it('does not let a failed job block the next one', async () => {
    const run = createWriteQueue();
    const failing = run('a', async () => {
      throw new Error('offline');
    });
    await expect(failing).rejects.toThrow('offline');
    let ran = false;
    await run('a', async () => {
      ran = true;
    });
    expect(ran).toBe(true);
  });

  it('runs different keys independently', async () => {
    const run = createWriteQueue();
    const log: string[] = [];
    const blocker = run('a', async () => {
      await wait(20);
      log.push('a');
    });
    await run('b', async () => {
      log.push('b');
    });
    await blocker;
    expect(log).toEqual(['b', 'a']);
  });
});
