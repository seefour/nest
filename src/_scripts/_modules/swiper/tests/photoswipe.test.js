'use strict';

import Photoswipe from '../photoswipe';

describe('Photoswipe View', function() {

  beforeEach(() => {
    this.photoswipe = new Photoswipe();
  });

  it('Should run a few assertions', () => {
    expect(this.photoswipe).toBeDefined();
  });

});
