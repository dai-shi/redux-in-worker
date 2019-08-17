import { exposeStore, wrapStore } from '../src/index';

describe('basic spec', () => {
  it('should have a function', () => {
    expect(exposeStore).toBeDefined();
    expect(wrapStore).toBeDefined();
  });
});
